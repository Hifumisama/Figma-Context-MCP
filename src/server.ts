import { randomUUID } from "node:crypto";
import express, { type Request, type Response } from "express";
import cors from "cors";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { Server } from "http";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Logger } from "./utils/logger.js";
import { FigmaService } from "./services/figma.js";
import { getFigmaContextTool } from "./mcp/tools/get-figma-context/get-figma-context-tool.js";
import { auditFigmaDesignTool } from "./mcp/tools/audit-figma-design/audit-figma-design-tool.js";

let httpServer: Server | null = null;
const transports = {
  streamable: {} as Record<string, StreamableHTTPServerTransport>,
  sse: {} as Record<string, SSEServerTransport>,
};

export async function startHttpServer(port: number, mcpServer: McpServer): Promise<void> {
  const app = express();
  
  // Configuration CORS pour autoriser le frontend
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const corsOptions = {
    origin: [
      frontendUrl, // URL frontend depuis l'environnement
      'http://localhost:5173', // Développement local Vite (fallback)
      'http://localhost:3000', // Alternative de développement
      'https://storage.googleapis.com', // Cloud Storage principal
      'https://figma-mcp-frontend.storage.googleapis.com', // Bucket-specific domain
    ],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false // Pas besoin de cookies pour l'API
  };
  
  app.use(cors(corsOptions));
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // API endpoint pour auditer un design Figma
  app.post("/api/audit-figma", async (req: Request, res: Response) => {
    try {
      const { figmaUrl, figmaApiKey, outputFormat = "json" } = req.body;

      // Validation des paramètres
      if (!figmaUrl) {
        return res.status(400).json({
          error: "Le paramètre 'figmaUrl' est requis"
        });
      }

      Logger.log(`Début de l'audit Figma pour l'URL: ${figmaUrl}`);
      Logger.log(`Clé API fournie: ${figmaApiKey ? 'Oui' : 'Non (tentative d\'accès public)'}`);

      // Initialiser le service Figma avec la clé API fournie (ou vide pour les fichiers publics)
      const figmaService = new FigmaService({
        figmaApiKey: figmaApiKey || "",
        figmaOAuthToken: "",
        useOAuth: false
      });

      // Étape 1: Récupérer le contexte Figma
      Logger.log("Étape 1: Récupération du contexte Figma...");
      const contextResult = await getFigmaContextTool.handler(
        { url: figmaUrl, scope: "auto" },
        figmaService
      );

      if (contextResult.isError) {
        const errorMessage = contextResult.content[0].text;
        Logger.error("Erreur lors de la récupération du contexte Figma:", errorMessage);
        
        // Vérifier si c'est un problème d'accès (401/403)
        if (errorMessage.includes('401') || errorMessage.includes('403') || errorMessage.includes('Forbidden') || errorMessage.includes('Unauthorized')) {
          return res.status(401).json({
            error: "Accès refusé au fichier Figma",
            details: figmaApiKey 
              ? "La clé API fournie n'a pas accès à ce fichier, ou le fichier n'existe pas."
              : "Ce fichier n'est pas public. Veuillez fournir une clé API Figma valide avec le paramètre 'figmaApiKey'.",
            suggestion: figmaApiKey 
              ? "Vérifiez que votre clé API est valide et que le fichier existe."
              : "Obtenez une clé API sur https://www.figma.com/developers/api#access-tokens"
          });
        }
        
        return res.status(500).json({
          error: "Erreur lors de la récupération du contexte Figma",
          details: errorMessage
        });
      }

      const figmaDataJson = contextResult.content[0].text;
      Logger.log("Contexte Figma récupéré avec succès");

      // Étape 2: Auditer le design
      Logger.log("Étape 2: Audit du design en cours...");
      const auditResult = await auditFigmaDesignTool.handler(
        { figmaDataJson, outputFormat },
        { enableAiRules: false } // Désactiver les règles AI pour l'instant
      );

      if (auditResult.isError) {
        Logger.error("Erreur lors de l'audit du design:", auditResult.content[0].text);
        return res.status(500).json({
          error: "Erreur lors de l'audit du design",
          details: auditResult.content[0].text
        });
      }

      Logger.log("Audit terminé avec succès");

      // Retourner le résultat
      const auditContent = auditResult.content[0].text;
      
      if (outputFormat === "json") {
        return res.json(JSON.parse(auditContent));
      } else {
        return res.json({
          success: true,
          audit: auditContent,
          format: "markdown"
        });
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error("Erreur inattendue lors de l'audit Figma:", errorMessage);
      
      return res.status(500).json({
        error: "Erreur inattendue lors de l'audit",
        details: errorMessage
      });
    }
  });

  // === MIDDLEWARES GÉNÉRAUX POUR LES ROUTES MCP ===
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Middleware global de gestion d'erreur pour les erreurs de parsing JSON
  app.use((error: any, req: Request, res: Response, next: any) => {
    if (error instanceof SyntaxError && 'body' in error) {
      Logger.error('Erreur de parsing JSON détectée:', error.message);
      Logger.error('URL:', req.url);
      Logger.error('Method:', req.method);
      Logger.error('Headers:', JSON.stringify(req.headers, null, 2));
      
      return res.status(400).json({
        error: 'Format JSON invalide',
        details: 'Vérifiez que votre requête contient un JSON valide',
        message: error.message,
        url: req.url,
        method: req.method
      });
    }
    next(error);
  });

  // Modern Streamable HTTP endpoint
  app.post("/mcp", async (req, res) => {
    Logger.log("Received StreamableHTTP request");
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    let transport: StreamableHTTPServerTransport;

    if (sessionId && transports.streamable[sessionId]) {
      // Reuse existing transport
      Logger.log("Reusing existing StreamableHTTP transport for sessionId", sessionId);
      transport = transports.streamable[sessionId];
    } else if (!sessionId && isInitializeRequest(req.body)) {
      Logger.log("New initialization request for StreamableHTTP sessionId", sessionId);
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (sessionId) => {
          // Store the transport by session ID
          transports.streamable[sessionId] = transport;
        },
      });
      transport.onclose = () => {
        if (transport.sessionId) {
          delete transports.streamable[transport.sessionId];
        }
      };
      // TODO? There semes to be an issue—at least in Cursor—where after a connection is made to an HTTP Streamable endpoint, SSE connections to the same Express server fail with "Received a response for an unknown message ID"
      await mcpServer.connect(transport);
    } else {
      // Invalid request
      Logger.log("Invalid request:", req.body);
      res.status(400).json({
        jsonrpc: "2.0",
        error: {
          code: -32000,
          message: "Bad Request: No valid session ID provided",
        },
        id: null,
      });
      return;
    }

    let progressInterval: NodeJS.Timeout | null = null;
    const progressToken = req.body.params?._meta?.progressToken;
    let progress = 0;
    if (progressToken) {
      Logger.log(
        `Setting up progress notifications for token ${progressToken} on session ${sessionId}`,
      );
      progressInterval = setInterval(async () => {
        Logger.log("Sending progress notification", progress);
        await mcpServer.server.notification({
          method: "notifications/progress",
          params: {
            progress,
            progressToken,
          },
        });
        progress++;
      }, 1000);
    }

    Logger.log("Handling StreamableHTTP request");
    await transport.handleRequest(req, res, req.body);

    if (progressInterval) {
      clearInterval(progressInterval);
    }
    Logger.log("StreamableHTTP request handled");
  });

  // Handle GET requests for SSE streams (using built-in support from StreamableHTTP)
  const handleSessionRequest = async (req: Request, res: Response) => {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    if (!sessionId || !transports.streamable[sessionId]) {
      res.status(400).send("Invalid or missing session ID");
      return;
    }

    console.log(`Received session termination request for session ${sessionId}`);

    try {
      const transport = transports.streamable[sessionId];
      await transport.handleRequest(req, res);
    } catch (error) {
      console.error("Error handling session termination:", error);
      if (!res.headersSent) {
        res.status(500).send("Error processing session termination");
      }
    }
  };

  // Handle GET requests for server-to-client notifications via SSE
  app.get("/mcp", handleSessionRequest);

  // Handle DELETE requests for session termination
  app.delete("/mcp", handleSessionRequest);

  app.get("/sse", async (req, res) => {
    Logger.log("Establishing new SSE connection");
    const transport = new SSEServerTransport("/messages", res);
    Logger.log(`New SSE connection established for sessionId ${transport.sessionId}`);
    Logger.log("/sse request headers:", req.headers);
    Logger.log("/sse request body:", req.body);

    transports.sse[transport.sessionId] = transport;
    res.on("close", () => {
      delete transports.sse[transport.sessionId];
    });

    await mcpServer.connect(transport);
  });

  app.post("/messages", async (req, res) => {
    const sessionId = req.query.sessionId as string;
    const transport = transports.sse[sessionId];
    if (transport) {
      Logger.log(`Received SSE message for sessionId ${sessionId}`);
      Logger.log("/messages request headers:", req.headers);
      Logger.log("/messages request body:", req.body);
      await transport.handlePostMessage(req, res);
    } else {
      res.status(400).send(`No transport found for sessionId ${sessionId}`);
      return;
    }
  });

  httpServer = app.listen(port, () => {
    Logger.log(`HTTP server listening on port ${port}`);
    Logger.log(`SSE endpoint available at http://localhost:${port}/sse`);
    Logger.log(`Message endpoint available at http://localhost:${port}/messages`);
    Logger.log(`StreamableHTTP endpoint available at http://localhost:${port}/mcp`);
    Logger.log(`Figma Audit API endpoint available at http://localhost:${port}/api/audit-figma`);
    Logger.log(`Debug Test API endpoint available at http://localhost:${port}/api/test`);
  });

  process.on("SIGINT", async () => {
    Logger.log("Shutting down server...");

    // Close all active transports to properly clean up resources
    await closeTransports(transports.sse);
    await closeTransports(transports.streamable);

    Logger.log("Server shutdown complete");
    process.exit(0);
  });
}

async function closeTransports(
  transports: Record<string, SSEServerTransport | StreamableHTTPServerTransport>,
) {
  for (const sessionId in transports) {
    try {
      await transports[sessionId]?.close();
      delete transports[sessionId];
    } catch (error) {
      console.error(`Error closing transport for session ${sessionId}:`, error);
    }
  }
}

export async function stopHttpServer(): Promise<void> {
  if (!httpServer) {
    throw new Error("HTTP server is not running");
  }

  return new Promise((resolve, reject) => {
    httpServer!.close((err: Error | undefined) => {
      if (err) {
        reject(err);
        return;
      }
      httpServer = null;
      const closing = Object.values(transports.sse).map((transport) => {
        return transport.close();
      });
      Promise.all(closing).then(() => {
        resolve();
      });
    });
  });
}
