import { describe, it, expect, vi, beforeEach } from "vitest";
import { getFigmaContextTool } from "./get-figma-context-tool.js";
import type { GetFigmaContextParams } from "./types.js";
import type { GetFileResponse, GetFileNodesResponse } from "@figma/rest-api-spec";

// Mock dependencies
const { mockFigmaService, mockLogger, mockSimplify } = vi.hoisted(() => ({
  mockFigmaService: {
    getRawFile: vi.fn(),
    getRawNode: vi.fn(),
  },
  mockLogger: {
    log: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    isHTTP: false,
  },
  mockSimplify: vi.fn(),
}));

vi.mock("~/utils/logger.js", () => ({ Logger: mockLogger }));
vi.mock("~/extractors/index.js", () => ({
  simplifyRawFigmaObject: mockSimplify,
  allExtractors: [],
}));

describe("get-figma-context-tool", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock for simplifyRawFigmaObject
    mockSimplify.mockReturnValue({ simplified: true, nodes: [] });
  });

  const createMockFileResponse = (name = "Test File"): GetFileResponse => ({
    document: { id: "0:0", name: "Document", type: "DOCUMENT" } as any,
    name,
    lastModified: "2024-01-01",
    thumbnailUrl: "",
    version: "1",
    role: "owner",
    editorType: "figma",
    linkAccess: "view",
  });

  const createMockNodeResponse = (nodeId = "1:1"): GetFileNodesResponse => ({
    ...createMockFileResponse(),
    nodes: {
      [nodeId]: {
        document: { id: nodeId, name: "Frame", type: "FRAME" } as any,
        components: {},
        componentSets: {},
        schemaVersion: 0,
        styles: {},
      },
    },
  });

  describe("Tool definition", () => {
    it("should have correct tool metadata", () => {
      expect(getFigmaContextTool.name).toBe("get_figma_context");
      expect(getFigmaContextTool.description).toContain("Figma data");
      expect(getFigmaContextTool.parameters).toBeDefined();
      expect(getFigmaContextTool.handler).toBeTypeOf("function");
    });
  });

  describe("URL parsing", () => {
    it("should parse file URL correctly", async () => {
      const params: GetFigmaContextParams = {
        url: "https://www.figma.com/file/abc123/Test-File",
      };
      mockFigmaService.getRawFile.mockResolvedValue(createMockFileResponse());

      const result = await getFigmaContextTool.handler(params, mockFigmaService as any);

      expect(mockFigmaService.getRawFile).toHaveBeenCalledWith("abc123");
      expect(result.content[0].type).toBe("text");
      expect(result.isError).toBeUndefined();
    });

    it("should parse design URL correctly", async () => {
      const params: GetFigmaContextParams = {
        url: "https://www.figma.com/design/xyz789/My-Design",
      };
      mockFigmaService.getRawFile.mockResolvedValue(createMockFileResponse());

      await getFigmaContextTool.handler(params, mockFigmaService as any);

      expect(mockFigmaService.getRawFile).toHaveBeenCalledWith("xyz789");
    });

    it("should extract node-id from URL query params", async () => {
      const params: GetFigmaContextParams = {
        url: "https://www.figma.com/file/abc123/Test?node-id=1:2",
      };
      mockFigmaService.getRawNode.mockResolvedValue(createMockNodeResponse("1:2"));

      await getFigmaContextTool.handler(params, mockFigmaService as any);

      expect(mockFigmaService.getRawNode).toHaveBeenCalledWith("abc123", "1:2");
    });

    it("should handle invalid URL", async () => {
      const params: GetFigmaContextParams = {
        url: "not-a-valid-url",
      };

      const result = await getFigmaContextTool.handler(params, mockFigmaService as any);

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("Invalid Figma URL");
    });

    it("should handle URL without file key", async () => {
      const params: GetFigmaContextParams = {
        url: "https://www.figma.com/files/recent",
      };

      const result = await getFigmaContextTool.handler(params, mockFigmaService as any);

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("Invalid Figma URL");
    });
  });

  describe("Scope handling", () => {
    const baseUrl = "https://www.figma.com/file/abc123/Test";

    it("should fetch file when scope is 'file'", async () => {
      const params: GetFigmaContextParams = {
        url: `${baseUrl}?node-id=1:2`,
        scope: "file",
      };
      mockFigmaService.getRawFile.mockResolvedValue(createMockFileResponse());

      await getFigmaContextTool.handler(params, mockFigmaService as any);

      expect(mockFigmaService.getRawFile).toHaveBeenCalledWith("abc123");
      expect(mockFigmaService.getRawNode).not.toHaveBeenCalled();
    });

    it("should fetch node when scope is 'node' and nodeId provided", async () => {
      const params: GetFigmaContextParams = {
        url: baseUrl,
        scope: "node",
        nodeId: "1:5",
      };
      mockFigmaService.getRawNode.mockResolvedValue(createMockNodeResponse("1:5"));

      await getFigmaContextTool.handler(params, mockFigmaService as any);

      expect(mockFigmaService.getRawNode).toHaveBeenCalledWith("abc123", "1:5");
      expect(mockFigmaService.getRawFile).not.toHaveBeenCalled();
    });

    it("should use URL node-id when scope is 'auto' and no nodeId param", async () => {
      const params: GetFigmaContextParams = {
        url: `${baseUrl}?node-id=1:3`,
        scope: "auto",
      };
      mockFigmaService.getRawNode.mockResolvedValue(createMockNodeResponse("1:3"));

      await getFigmaContextTool.handler(params, mockFigmaService as any);

      expect(mockFigmaService.getRawNode).toHaveBeenCalledWith("abc123", "1:3");
    });

    it("should fetch file when scope is 'auto' and no node-id available", async () => {
      const params: GetFigmaContextParams = {
        url: baseUrl,
        scope: "auto",
      };
      mockFigmaService.getRawFile.mockResolvedValue(createMockFileResponse());

      await getFigmaContextTool.handler(params, mockFigmaService as any);

      expect(mockFigmaService.getRawFile).toHaveBeenCalledWith("abc123");
    });

    it("should prioritize nodeId param over URL node-id", async () => {
      const params: GetFigmaContextParams = {
        url: `${baseUrl}?node-id=1:2`,
        nodeId: "1:10",
      };
      mockFigmaService.getRawNode.mockResolvedValue(createMockNodeResponse("1:10"));

      await getFigmaContextTool.handler(params, mockFigmaService as any);

      expect(mockFigmaService.getRawNode).toHaveBeenCalledWith("abc123", "1:10");
    });
  });

  describe("Response handling", () => {
    it("should return simplified JSON response", async () => {
      const params: GetFigmaContextParams = {
        url: "https://www.figma.com/file/abc123/Test",
      };
      mockFigmaService.getRawFile.mockResolvedValue(createMockFileResponse("My Design"));

      const result = await getFigmaContextTool.handler(params, mockFigmaService as any);

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed).toBeDefined();
      expect(typeof parsed).toBe("object");
    });

    it("should format JSON with indentation", async () => {
      const params: GetFigmaContextParams = {
        url: "https://www.figma.com/file/abc123/Test",
      };
      mockFigmaService.getRawFile.mockResolvedValue(createMockFileResponse());

      const result = await getFigmaContextTool.handler(params, mockFigmaService as any);

      const text = result.content[0].text;
      expect(text).toContain("\n");
      expect(text).toContain("  ");
    });
  });

  describe("Error handling", () => {
    it("should handle API errors gracefully", async () => {
      const params: GetFigmaContextParams = {
        url: "https://www.figma.com/file/abc123/Test",
      };
      mockFigmaService.getRawFile.mockRejectedValue(new Error("API Error: 401 Unauthorized"));

      const result = await getFigmaContextTool.handler(params, mockFigmaService as any);

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("Error fetching Figma context");
      expect(result.content[0].text).toContain("401 Unauthorized");
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it("should handle non-Error exceptions", async () => {
      const params: GetFigmaContextParams = {
        url: "https://www.figma.com/file/abc123/Test",
      };
      mockFigmaService.getRawFile.mockRejectedValue("String error");

      const result = await getFigmaContextTool.handler(params, mockFigmaService as any);

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("Error fetching Figma context");
    });

    it("should log errors with URL context", async () => {
      const params: GetFigmaContextParams = {
        url: "https://www.figma.com/file/abc123/Test",
      };
      mockFigmaService.getRawFile.mockRejectedValue(new Error("Network error"));

      await getFigmaContextTool.handler(params, mockFigmaService as any);

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining("get_figma_context"),
        expect.stringContaining("Network error")
      );
    });
  });
});

