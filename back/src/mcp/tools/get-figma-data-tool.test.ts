import { describe, it, expect, vi, beforeEach } from "vitest";
import { getFigmaDataTool, type GetFigmaDataParams } from "./get-figma-data-tool.js";
import type { GetFileResponse, GetFileNodesResponse } from "@figma/rest-api-spec";
import { FigmaService } from "~/services/figma.js";
import type { SimplifiedDesign } from "~/extractors/types.js";

// Mock dependencies
vi.mock("~/services/figma.js");
vi.mock("~/extractors/index.js", () => ({
  simplifyRawFigmaObject: vi.fn((): SimplifiedDesign => ({
    name: "Test Design",
    lastModified: "2025-01-15T12:00:00Z",
    thumbnailUrl: "https://example.com/thumb.png",
    nodes: [
      {
        id: "1:1",
        name: "Test Node",
        type: "FRAME",
      },
    ],
    components: {},
    componentSets: {},
    globalVars: {
      designSystem: { text: {}, strokes: {}, layout: {}, colors: {} },
      localStyles: { text: {}, strokes: {}, layout: {}, colors: {} },
      images: {},
    },
  })),
  allExtractors: [],
}));

vi.mock("~/utils/logger.js", () => ({
  Logger: {
    log: vi.fn(),
    error: vi.fn(),
  },
  writeLogs: vi.fn(),
}));

// Helper to create mock GetFileResponse
function createMockGetFileResponse(): GetFileResponse {
  return {
    name: "Test File",
    lastModified: "2025-01-15T12:00:00Z",
    thumbnailUrl: "https://example.com/thumb.png",
    version: "1",
    role: "owner",
    editorType: "figma",
    linkAccess: "view",
    document: {
      id: "0:0",
      name: "Document",
      type: "DOCUMENT",
      scrollBehavior: "SCROLLS",
      children: [],
    } as GetFileResponse["document"],
    components: {},
    componentSets: {},
    schemaVersion: 0,
    styles: {},
  };
}

// Helper to create mock GetFileNodesResponse
function createMockGetFileNodesResponse(): GetFileNodesResponse {
  return {
    name: "Test File",
    lastModified: "2025-01-15T12:00:00Z",
    thumbnailUrl: "https://example.com/thumb.png",
    version: "1",
    role: "owner",
    editorType: "figma",
    nodes: {
      "1:1": {
        document: {
          id: "1:1",
          name: "Test Node",
          type: "FRAME",
          children: [],
        } as GetFileNodesResponse["nodes"][string]["document"],
        components: {},
        componentSets: {},
        schemaVersion: 0,
        styles: {},
      },
    },
  };
}

describe("getFigmaDataTool", () => {
  let mockFigmaService: FigmaService;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFigmaService = new FigmaService({
      figmaApiKey: "test-token",
      figmaOAuthToken: "",
      useOAuth: false,
    });
  });

  describe("Tool configuration", () => {
    it("should export correct tool name", () => {
      expect(getFigmaDataTool.name).toBe("get_figma_data");
    });

    it("should have description", () => {
      expect(getFigmaDataTool.description).toBeDefined();
      expect(typeof getFigmaDataTool.description).toBe("string");
    });

    it("should have parameters schema", () => {
      expect(getFigmaDataTool.parameters).toBeDefined();
      expect(getFigmaDataTool.parameters.fileKey).toBeDefined();
    });

    it("should have handler function", () => {
      expect(getFigmaDataTool.handler).toBeDefined();
      expect(typeof getFigmaDataTool.handler).toBe("function");
    });
  });

  describe("Handler - Happy path", () => {
    it("should fetch complete file data", async () => {
      const mockResponse = createMockGetFileResponse();
      vi.spyOn(mockFigmaService, "getRawFile").mockResolvedValue(mockResponse);

      const params: GetFigmaDataParams = {
        fileKey: "test-file-key",
      };

      const result = await getFigmaDataTool.handler(params, mockFigmaService, "json");

      expect(mockFigmaService.getRawFile).toHaveBeenCalledWith("test-file-key", undefined);
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");
      expect(result.content[0].text).toContain("Test Design");
    });

    it("should fetch specific node data", async () => {
      const mockResponse = createMockGetFileNodesResponse();
      vi.spyOn(mockFigmaService, "getRawNode").mockResolvedValue(mockResponse);

      const params: GetFigmaDataParams = {
        fileKey: "test-file-key",
        nodeId: "1:1",
      };

      const result = await getFigmaDataTool.handler(params, mockFigmaService, "json");

      expect(mockFigmaService.getRawNode).toHaveBeenCalledWith("test-file-key", "1:1", undefined);
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");
    });

    it("should respect depth parameter", async () => {
      const mockResponse = createMockGetFileResponse();
      vi.spyOn(mockFigmaService, "getRawFile").mockResolvedValue(mockResponse);

      const params: GetFigmaDataParams = {
        fileKey: "test-file-key",
        depth: 2,
      };

      await getFigmaDataTool.handler(params, mockFigmaService, "json");

      expect(mockFigmaService.getRawFile).toHaveBeenCalledWith("test-file-key", 2);
    });
  });

  describe("Handler - Output formats", () => {
    it("should return JSON format when specified", async () => {
      const mockResponse = createMockGetFileResponse();
      vi.spyOn(mockFigmaService, "getRawFile").mockResolvedValue(mockResponse);

      const params: GetFigmaDataParams = {
        fileKey: "test-file-key",
      };

      const result = await getFigmaDataTool.handler(params, mockFigmaService, "json");

      expect(result.content[0].text).toMatch(/^\{/); // Starts with {
      expect(() => JSON.parse(result.content[0].text)).not.toThrow();
    });

    it("should return YAML format when specified", async () => {
      const mockResponse = createMockGetFileResponse();
      vi.spyOn(mockFigmaService, "getRawFile").mockResolvedValue(mockResponse);

      const params: GetFigmaDataParams = {
        fileKey: "test-file-key",
      };

      const result = await getFigmaDataTool.handler(params, mockFigmaService, "yaml");

      expect(result.content[0].text).toMatch(/metadata:/); // YAML format
      expect(result.content[0].text).not.toMatch(/^\{/); // Not JSON
    });

    it("should include metadata, nodes, and globalVars in result", async () => {
      const mockResponse = createMockGetFileResponse();
      vi.spyOn(mockFigmaService, "getRawFile").mockResolvedValue(mockResponse);

      const params: GetFigmaDataParams = {
        fileKey: "test-file-key",
      };

      const result = await getFigmaDataTool.handler(params, mockFigmaService, "json");
      const parsed = JSON.parse(result.content[0].text);

      expect(parsed).toHaveProperty("metadata");
      expect(parsed).toHaveProperty("nodes");
      expect(parsed).toHaveProperty("globalVars");
    });
  });

  describe("Handler - Error handling", () => {
    it("should handle FigmaService errors gracefully", async () => {
      const errorMessage = "File not found";
      vi.spyOn(mockFigmaService, "getRawFile").mockRejectedValue(new Error(errorMessage));

      const params: GetFigmaDataParams = {
        fileKey: "invalid-file-key",
      };

      const result = await getFigmaDataTool.handler(params, mockFigmaService, "json");

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("Error fetching file");
      expect(result.content[0].text).toContain(errorMessage);
    });

    it("should handle non-Error exceptions", async () => {
      vi.spyOn(mockFigmaService, "getRawFile").mockRejectedValue("String error");

      const params: GetFigmaDataParams = {
        fileKey: "test-file-key",
      };

      const result = await getFigmaDataTool.handler(params, mockFigmaService, "json");

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("Error fetching file");
    });

    it("should handle getRawNode errors", async () => {
      const errorMessage = "Node not found";
      vi.spyOn(mockFigmaService, "getRawNode").mockRejectedValue(new Error(errorMessage));

      const params: GetFigmaDataParams = {
        fileKey: "test-file-key",
        nodeId: "invalid-node",
      };

      const result = await getFigmaDataTool.handler(params, mockFigmaService, "json");

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain(errorMessage);
    });
  });

  describe("Handler - Edge cases", () => {
    it("should handle depth of 0", async () => {
      const mockResponse = createMockGetFileResponse();
      vi.spyOn(mockFigmaService, "getRawFile").mockResolvedValue(mockResponse);

      const params: GetFigmaDataParams = {
        fileKey: "test-file-key",
        depth: 0,
      };

      const result = await getFigmaDataTool.handler(params, mockFigmaService, "json");

      expect(mockFigmaService.getRawFile).toHaveBeenCalledWith("test-file-key", 0);
      expect(result.content).toHaveLength(1);
    });

    it("should handle nodeId with depth", async () => {
      const mockResponse = createMockGetFileNodesResponse();
      vi.spyOn(mockFigmaService, "getRawNode").mockResolvedValue(mockResponse);

      const params: GetFigmaDataParams = {
        fileKey: "test-file-key",
        nodeId: "1:1",
        depth: 3,
      };

      const result = await getFigmaDataTool.handler(params, mockFigmaService, "json");

      expect(mockFigmaService.getRawNode).toHaveBeenCalledWith("test-file-key", "1:1", 3);
      expect(result.content).toHaveLength(1);
    });
  });

  describe("Parameters validation", () => {
    it("should have fileKey as required parameter", () => {
      expect(getFigmaDataTool.parameters.fileKey).toBeDefined();
    });

    it("should have nodeId as optional parameter", () => {
      expect(getFigmaDataTool.parameters.nodeId).toBeDefined();
    });

    it("should have depth as optional parameter", () => {
      expect(getFigmaDataTool.parameters.depth).toBeDefined();
    });
  });
});
