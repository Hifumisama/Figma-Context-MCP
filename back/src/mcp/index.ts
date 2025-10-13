import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaService, type FigmaAuthOptions } from "../services/figma.js";
import { Logger } from "../utils/logger.js";
import {
  downloadFigmaImagesTool,
  getFigmaDataTool,
  getFigmaContextTool,
  auditFigmaDesignTool,
  type DownloadImagesParams,
  type GetFigmaDataParams,
} from "./tools/index.js";
import { GetFigmaContextParamsSchema } from "./tools/get-figma-context/types.js";
import { auditParamsSchema } from "./tools/audit-figma-design/audit-figma-design-tool.js";
import { z } from "zod";

const serverInfo = {
  name: "Figma MCP Server",
  version: process.env.NPM_PACKAGE_VERSION ?? "unknown",
};

type CreateServerOptions = {
  isHTTP?: boolean;
  outputFormat?: "yaml" | "json";
  skipImageDownloads?: boolean;
  enableAiRules?: boolean;
};

function createServer(
  authOptions: FigmaAuthOptions,
  { isHTTP = false, outputFormat = "yaml", skipImageDownloads = false, enableAiRules = false }: CreateServerOptions = {},
) {
  const server = new McpServer(serverInfo);
  const figmaService = new FigmaService(authOptions);
  registerTools(server, figmaService, { outputFormat, skipImageDownloads, enableAiRules });

  Logger.isHTTP = isHTTP;

  return server;
}

function registerTools(
  server: McpServer,
  figmaService: FigmaService,
  options: {
    outputFormat: "yaml" | "json";
    skipImageDownloads: boolean;
    enableAiRules: boolean;
  },
): void {
  // Register get_figma_data tool
  server.tool(
    getFigmaDataTool.name,
    getFigmaDataTool.description,
    getFigmaDataTool.parameters,
    (params: GetFigmaDataParams) =>
      getFigmaDataTool.handler(params, figmaService, options.outputFormat),
  );

  // Register get_figma_context tool
  server.tool(
    getFigmaContextTool.name,
    getFigmaContextTool.description,
    getFigmaContextTool.parameters,
    (params: z.infer<typeof GetFigmaContextParamsSchema>) =>
        getFigmaContextTool.handler(params, figmaService),
  );

  // Register audit_figma_design tool
  server.tool(
    auditFigmaDesignTool.name,
    auditFigmaDesignTool.description,
    auditFigmaDesignTool.parameters,
    // We don't need the figmaService for this one as it's pure data processing
    (params: z.infer<typeof auditParamsSchema>) =>
        auditFigmaDesignTool.handler(params, { enableAiRules: options.enableAiRules }),
  );

  // Register download_figma_images tool if CLI flag or env var is not set
  if (!options.skipImageDownloads) {
    server.tool(
      downloadFigmaImagesTool.name,
      downloadFigmaImagesTool.description,
      downloadFigmaImagesTool.parameters,
      (params: DownloadImagesParams) => downloadFigmaImagesTool.handler(params, figmaService),
    );
  }
}

export { createServer };
