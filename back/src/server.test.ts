import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { startHttpServer, stopHttpServer } from "./server.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// Mock dependencies
const {
  mockGetFigmaContextTool,
  mockAuditFigmaDesignTool,
  mockFigmaService,
  mockLogger,
  mockStreamableTransport,
  mockSSETransport,
} = vi.hoisted(() => ({
    mockGetFigmaContextTool: { handler: vi.fn() },
    mockAuditFigmaDesignTool: { handler: vi.fn() },
    mockFigmaService: vi.fn(),
    mockLogger: { log: vi.fn(), error: vi.fn(), warn: vi.fn(), info: vi.fn(), isHTTP: false },
  mockStreamableTransport: vi.fn(),
  mockSSETransport: vi.fn(),
  }));

vi.mock("./mcp/tools/get-figma-context/get-figma-context-tool.js", () => ({
  getFigmaContextTool: mockGetFigmaContextTool,
}));
vi.mock("./mcp/tools/audit-figma-design/audit-figma-design-tool.js", () => ({
  auditFigmaDesignTool: mockAuditFigmaDesignTool,
}));
vi.mock("./services/figma.js", () => ({ FigmaService: mockFigmaService }));
vi.mock("./utils/logger.js", () => ({ Logger: mockLogger }));
vi.mock("@modelcontextprotocol/sdk/server/streamableHttp.js", () => ({
  StreamableHTTPServerTransport: mockStreamableTransport,
}));
vi.mock("@modelcontextprotocol/sdk/server/sse.js", () => ({
  SSEServerTransport: mockSSETransport,
}));

describe("HTTP Server with MCP", () => {
  const originalEnv = process.env;
  let mockMcpServer: McpServer;
  let basePort = 3400;

  const createMockServer = () =>
    ({ connect: vi.fn(), server: { notification: vi.fn() } }) as any;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    mockMcpServer = createMockServer();
  });

  afterEach(async () => {
    process.env = originalEnv;
    try {
      await stopHttpServer();
    } catch {
      // Server not running
    }
  });

  describe("Server lifecycle", () => {
    it("should start and stop server cleanly", async () => {
      const port = basePort++;
      await startHttpServer(port, mockMcpServer);

      // Verify server started
      expect(mockMcpServer.connect).toBeDefined();

      await stopHttpServer();
      // Stopping again should fail
      await expect(stopHttpServer()).rejects.toThrow("HTTP server is not running");
    });

    it("should handle SIGINT for graceful shutdown", async () => {
      await startHttpServer(basePort++, mockMcpServer);

      const sigintListeners = process.listeners("SIGINT");
      expect(sigintListeners.length).toBeGreaterThan(0);

      await stopHttpServer();
    });
  });

  describe("API Audit Figma endpoint", () => {
    describe("Success cases", () => {
      it("should successfully audit Figma design with JSON output", async () => {
        const port = basePort++;
        await startHttpServer(port, mockMcpServer);

        const mockFigmaData = { nodes: [{ id: "1", name: "Test" }] };
        const mockAuditResult = { rules: [{ id: "rule1", status: "passed" }] };

        mockGetFigmaContextTool.handler.mockResolvedValue({
          content: [{ text: JSON.stringify(mockFigmaData) }],
          isError: false,
        });
        mockAuditFigmaDesignTool.handler.mockResolvedValue({
          content: [{ text: JSON.stringify(mockAuditResult) }],
          isError: false,
        });

        const response = await fetch(`http://localhost:${port}/api/audit-figma`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            figmaUrl: "https://www.figma.com/file/abc123",
            figmaApiKey: "test-key",
            outputFormat: "json",
          }),
        });

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data).toEqual(mockAuditResult);

        await stopHttpServer();
      });

      it("should successfully audit Figma design with markdown output", async () => {
        const port = basePort++;
        await startHttpServer(port, mockMcpServer);

        const mockFigmaData = { nodes: [] };
        const mockAuditMarkdown = "# Audit Report\n- All good";

        mockGetFigmaContextTool.handler.mockResolvedValue({
          content: [{ text: JSON.stringify(mockFigmaData) }],
          isError: false,
        });
        mockAuditFigmaDesignTool.handler.mockResolvedValue({
          content: [{ text: mockAuditMarkdown }],
          isError: false,
        });

        const response = await fetch(`http://localhost:${port}/api/audit-figma`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            figmaUrl: "https://www.figma.com/file/xyz789",
            outputFormat: "markdown",
          }),
        });

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data).toEqual({
          success: true,
          audit: mockAuditMarkdown,
          format: "markdown",
        });

        await stopHttpServer();
      });

      it("should audit without API key for public files", async () => {
        const port = basePort++;
        await startHttpServer(port, mockMcpServer);

        mockGetFigmaContextTool.handler.mockResolvedValue({
          content: [{ text: '{"nodes":[]}' }],
          isError: false,
        });
        mockAuditFigmaDesignTool.handler.mockResolvedValue({
          content: [{ text: '{"rules":[]}' }],
          isError: false,
        });

        const response = await fetch(`http://localhost:${port}/api/audit-figma`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            figmaUrl: "https://www.figma.com/file/public123",
          }),
        });

        expect(response.status).toBe(200);
        expect(mockFigmaService).toHaveBeenCalledWith({
          figmaApiKey: "",
          figmaOAuthToken: "",
          useOAuth: false,
        });

        await stopHttpServer();
      });
    });

    describe("Validation errors", () => {
      it("should return 400 when figmaUrl is missing", async () => {
        const port = basePort++;
        await startHttpServer(port, mockMcpServer);

        const response = await fetch(`http://localhost:${port}/api/audit-figma`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ outputFormat: "json" }),
        });

        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.error).toBe("Le paramètre 'figmaUrl' est requis");

        await stopHttpServer();
      });
    });

    describe("Figma access errors", () => {
      it("should return 401 for unauthorized access with API key", async () => {
        const port = basePort++;
        await startHttpServer(port, mockMcpServer);

        mockGetFigmaContextTool.handler.mockResolvedValue({
          content: [{ text: "Error: 401 Unauthorized access" }],
          isError: true,
        });

        const response = await fetch(`http://localhost:${port}/api/audit-figma`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            figmaUrl: "https://www.figma.com/file/private123",
            figmaApiKey: "invalid-key",
          }),
        });

        expect(response.status).toBe(401);
        const data = await response.json();
        expect(data.error).toBe("Accès refusé au fichier Figma");
        expect(data.details).toContain("clé API");

        await stopHttpServer();
      });

      it("should return 401 for forbidden access without API key", async () => {
        const port = basePort++;
        await startHttpServer(port, mockMcpServer);

        mockGetFigmaContextTool.handler.mockResolvedValue({
          content: [{ text: "Error: 403 Forbidden" }],
          isError: true,
        });

        const response = await fetch(`http://localhost:${port}/api/audit-figma`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            figmaUrl: "https://www.figma.com/file/private456",
          }),
        });

        expect(response.status).toBe(401);
        const data = await response.json();
        expect(data.error).toBe("Accès refusé au fichier Figma");
        expect(data.details).toContain("pas public");
        expect(data.suggestion).toContain("clé API");

        await stopHttpServer();
      });
    });

    describe("Processing errors", () => {
      it("should return 500 when Figma context retrieval fails", async () => {
        const port = basePort++;
        await startHttpServer(port, mockMcpServer);

        mockGetFigmaContextTool.handler.mockResolvedValue({
          content: [{ text: "Network error" }],
          isError: true,
        });

        const response = await fetch(`http://localhost:${port}/api/audit-figma`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            figmaUrl: "https://www.figma.com/file/test123",
          }),
        });

        expect(response.status).toBe(500);
        const data = await response.json();
        expect(data.error).toBe("Erreur lors de la récupération du contexte Figma");

        await stopHttpServer();
      });

      it("should return 500 when audit fails", async () => {
        const port = basePort++;
        await startHttpServer(port, mockMcpServer);

        mockGetFigmaContextTool.handler.mockResolvedValue({
          content: [{ text: '{"nodes":[]}' }],
          isError: false,
        });
        mockAuditFigmaDesignTool.handler.mockResolvedValue({
          content: [{ text: "Audit processing error" }],
          isError: true,
        });

        const response = await fetch(`http://localhost:${port}/api/audit-figma`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            figmaUrl: "https://www.figma.com/file/test456",
          }),
        });

        expect(response.status).toBe(500);
        const data = await response.json();
        expect(data.error).toBe("Erreur lors de l'audit du design");

        await stopHttpServer();
      });

      it("should return 500 for unexpected errors", async () => {
        const port = basePort++;
        await startHttpServer(port, mockMcpServer);

        mockGetFigmaContextTool.handler.mockRejectedValue(new Error("Unexpected crash"));

        const response = await fetch(`http://localhost:${port}/api/audit-figma`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            figmaUrl: "https://www.figma.com/file/crash123",
          }),
        });

        expect(response.status).toBe(500);
        const data = await response.json();
        expect(data.error).toBe("Erreur inattendue lors de l'audit");
        expect(data.details).toContain("Unexpected crash");

        await stopHttpServer();
      });
    });

    describe("Environment configuration", () => {
      it("should enable AI rules when ENABLE_AI_RULES is true", async () => {
        process.env.ENABLE_AI_RULES = "true";
        const port = basePort++;
        await startHttpServer(port, mockMcpServer);

        mockGetFigmaContextTool.handler.mockResolvedValue({
          content: [{ text: '{"nodes":[]}' }],
          isError: false,
        });
        mockAuditFigmaDesignTool.handler.mockResolvedValue({
          content: [{ text: '{"rules":[]}' }],
          isError: false,
        });

        await fetch(`http://localhost:${port}/api/audit-figma`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            figmaUrl: "https://www.figma.com/file/test789",
          }),
        });

        expect(mockAuditFigmaDesignTool.handler).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({ enableAiRules: true }),
        );

        await stopHttpServer();
      });
    });
  });

  describe("JSON parsing middleware", () => {
    it("should handle JSON parsing errors gracefully", async () => {
      const port = basePort++;
      await startHttpServer(port, mockMcpServer);

      const response = await fetch(`http://localhost:${port}/api/audit-figma`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{ invalid json }",
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe("Format JSON invalide");

      await stopHttpServer();
    });
  });

  describe("CORS configuration", () => {
    it("should have CORS enabled for allowed origins", async () => {
      const port = basePort++;
      await startHttpServer(port, mockMcpServer);

      mockGetFigmaContextTool.handler.mockResolvedValue({
        content: [{ text: '{"nodes":[]}' }],
        isError: false,
      });
      mockAuditFigmaDesignTool.handler.mockResolvedValue({
        content: [{ text: '{"rules":[]}' }],
        isError: false,
      });

      const response = await fetch(`http://localhost:${port}/api/audit-figma`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:5173",
        },
        body: JSON.stringify({
          figmaUrl: "https://www.figma.com/file/test",
        }),
      });

      expect(response.headers.get("access-control-allow-origin")).toBeTruthy();

      await stopHttpServer();
    });
  });
});
