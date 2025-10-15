import { describe, it, expect, vi, beforeEach } from "vitest";
import { FigmaService } from "./figma.js";
import type { GetFileResponse, GetFileNodesResponse } from "@figma/rest-api-spec";

// Mock dependencies
const { mockFetchWithRetry, mockDownloadAndProcessImage, mockLogger, mockWriteLogs } = vi.hoisted(
  () => ({
    mockFetchWithRetry: vi.fn(),
    mockDownloadAndProcessImage: vi.fn(),
    mockLogger: { log: vi.fn(), error: vi.fn(), warn: vi.fn(), info: vi.fn(), isHTTP: false },
    mockWriteLogs: vi.fn(),
  }),
);

vi.mock("~/utils/fetch-with-retry.js", () => ({ fetchWithRetry: mockFetchWithRetry }));
vi.mock("~/utils/image-processing.js", () => ({ downloadAndProcessImage: mockDownloadAndProcessImage }));
vi.mock("~/utils/logger.js", () => ({ Logger: mockLogger, writeLogs: mockWriteLogs }));

describe("FigmaService", () => {
  const createService = (useOAuth = false) => 
    new FigmaService({
      figmaApiKey: "test-api-key",
      figmaOAuthToken: useOAuth ? "test-oauth-token" : "",
      useOAuth,
    });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Authentication", () => {
    it("should use OAuth when enabled, otherwise Personal Access Token", async () => {
      mockFetchWithRetry.mockResolvedValue({ document: {} });

      const oauthService = createService(true);
      await oauthService.getRawFile("file");
      expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining("OAuth Bearer"));

      vi.clearAllMocks();
      
      const apiKeyService = createService(false);
      await apiKeyService.getRawFile("file");
      expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining("Personal Access Token"));
    });
  });

  describe("Image URL retrieval", () => {
    it("should get image fill URLs including nulls", async () => {
      const service = createService();
      mockFetchWithRetry.mockResolvedValue({
        meta: { images: { "ref1": "https://img1.png", "ref2": null, "ref3": "https://img3.png" } },
      });

      const result = await service.getImageFillUrls("file");

      expect(result).toEqual({ "ref1": "https://img1.png", "ref2": null, "ref3": "https://img3.png" });
    });

    it("should handle empty/missing images in getImageFillUrls", async () => {
      const service = createService();
      mockFetchWithRetry.mockResolvedValue({ meta: {} });

      expect(await service.getImageFillUrls("file")).toEqual({});
    });

    it("should get node render URLs with PNG format and scale", async () => {
      const service = createService();
      mockFetchWithRetry.mockResolvedValue({ images: { "1:1": "https://img.png", "1:2": null } });

      const result = await service.getNodeRenderUrls("file", ["1:1", "1:2"], "png", { pngScale: 3 });

      expect(result).toEqual({ "1:1": "https://img.png" });
      const callUrl = mockFetchWithRetry.mock.calls[0][0];
      expect(callUrl).toContain("format=png");
      expect(callUrl).toContain("scale=3");
      expect(callUrl).toContain("ids=1:1,1:2");
    });

    it("should get node render URLs with SVG format and custom options", async () => {
      const service = createService();
      mockFetchWithRetry.mockResolvedValue({ images: { "1:1": "https://svg.svg" } });

      await service.getNodeRenderUrls("file", ["1:1"], "svg", {
        svgOptions: { outlineText: false, includeId: true, simplifyStroke: false },
      });

      const callUrl = mockFetchWithRetry.mock.calls[0][0];
      expect(callUrl).toContain("format=svg");
      expect(callUrl).toContain("svg_outline_text=false");
      expect(callUrl).toContain("svg_include_id=true");
      expect(callUrl).toContain("svg_simplify_stroke=false");
    });

    it("should use default SVG options when not provided", async () => {
      const service = createService();
      mockFetchWithRetry.mockResolvedValue({ images: { "1:1": "https://svg.svg" } });

      await service.getNodeRenderUrls("file", ["1:1"], "svg");

      const callUrl = mockFetchWithRetry.mock.calls[0][0];
      expect(callUrl).toContain("svg_outline_text=true");
      expect(callUrl).toContain("svg_simplify_stroke=true");
    });

    it("should return empty object for empty nodeIds array", async () => {
      const service = createService();

      expect(await service.getNodeRenderUrls("file", [], "png")).toEqual({});
      expect(mockFetchWithRetry).not.toHaveBeenCalled();
    });
  });

  describe("Image downloading", () => {
    const mockImageResult = { filePath: "/img.png", finalDimensions: { width: 100, height: 100 }, wasCropped: false };

    it("should download and separate image fills and render nodes", async () => {
      const service = createService();
      mockFetchWithRetry
        .mockResolvedValueOnce({ meta: { images: { "ref1": "https://fill.png" } } })
        .mockResolvedValueOnce({ images: { "1:1": "https://render.png" } });
      mockDownloadAndProcessImage.mockResolvedValue(mockImageResult);

      const result = await service.downloadImages("file", "/path", [
        { imageRef: "ref1", fileName: "fill.png" },
        { nodeId: "1:1", fileName: "render.png" },
      ]);

      expect(mockFetchWithRetry).toHaveBeenCalledTimes(2);
      expect(mockDownloadAndProcessImage).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(2);
    });

    it("should separate PNG and SVG render nodes into different API calls", async () => {
      const service = createService();
      mockFetchWithRetry
        .mockResolvedValueOnce({ images: { "1:1": "https://icon.png" } })
        .mockResolvedValueOnce({ images: { "1:2": "https://icon.svg" } });
      mockDownloadAndProcessImage.mockResolvedValue(mockImageResult);

      await service.downloadImages("file", "/path", [
        { nodeId: "1:1", fileName: "icon.png" },
        { nodeId: "1:2", fileName: "icon.svg" },
      ]);

      expect(mockFetchWithRetry).toHaveBeenCalledTimes(2);
      expect(mockFetchWithRetry.mock.calls[0][0]).toContain("format=png");
      expect(mockFetchWithRetry.mock.calls[1][0]).toContain("format=svg");
    });

    it("should skip items with null URLs and pass processing options", async () => {
      const service = createService();
      mockFetchWithRetry.mockResolvedValue({ images: { "1:1": "https://img.png", "1:2": null } });
      mockDownloadAndProcessImage.mockResolvedValue(mockImageResult);

      const result = await service.downloadImages("file", "/path", [
        { nodeId: "1:1", fileName: "valid.png", needsCropping: true, requiresImageDimensions: true },
        { nodeId: "1:2", fileName: "invalid.png" },
      ]);

      expect(mockDownloadAndProcessImage).toHaveBeenCalledOnce();
      expect(mockDownloadAndProcessImage).toHaveBeenCalledWith(
        "valid.png", "/path", "https://img.png", true, undefined, true
      );
      expect(result).toHaveLength(1);
    });

    it("should return empty array for empty items", async () => {
      const service = createService();

      expect(await service.downloadImages("file", "/path", [])).toEqual([]);
      expect(mockFetchWithRetry).not.toHaveBeenCalled();
    });
  });

  describe("Raw file and node retrieval", () => {
    const mockFileResponse = {
      document: { id: "0:0", name: "Doc", type: "DOCUMENT" },
      name: "File",
      lastModified: "2024-01-01",
      thumbnailUrl: "",
      version: "1",
      role: "owner",
      editorType: "figma",
      linkAccess: "view",
    } as GetFileResponse;

    it("should get raw file with optional depth parameter", async () => {
      const service = createService();
      mockFetchWithRetry.mockResolvedValue(mockFileResponse);

      const withDepth = await service.getRawFile("file", 2);
      expect(mockFetchWithRetry).toHaveBeenCalledWith(
        "https://api.figma.com/v1/files/file?depth=2",
        expect.any(Object),
      );
      expect(mockWriteLogs).toHaveBeenCalledWith("figma-raw.json", mockFileResponse);
      expect(withDepth).toEqual(mockFileResponse);

      vi.clearAllMocks();
      mockFetchWithRetry.mockResolvedValue(mockFileResponse);

      await service.getRawFile("file");
      expect(mockFetchWithRetry).toHaveBeenCalledWith(
        "https://api.figma.com/v1/files/file",
        expect.any(Object),
      );
    });

    it("should get raw node with optional depth parameter", async () => {
      const service = createService();
      const mockNodeResponse = {
        ...mockFileResponse,
        nodes: {
          "1:1": {
            document: { id: "1:1", name: "Node", type: "FRAME" } as any,
            components: {},
            componentSets: {},
            schemaVersion: 0,
            styles: {},
          },
        },
      } as GetFileNodesResponse;
      mockFetchWithRetry.mockResolvedValue(mockNodeResponse);

      const result = await service.getRawNode("file", "1:1", 3);

      expect(mockFetchWithRetry).toHaveBeenCalledWith(
        "https://api.figma.com/v1/files/file/nodes?ids=1:1&depth=3",
        expect.any(Object),
      );
      expect(mockWriteLogs).toHaveBeenCalledWith("figma-raw.json", mockNodeResponse);
      expect(result).toEqual(mockNodeResponse);
    });
  });

  describe("Error handling", () => {
    it("should wrap errors with API context", async () => {
      const service = createService();
      mockFetchWithRetry.mockRejectedValue(new Error("Network timeout"));

      await expect(service.getRawFile("file")).rejects.toThrow(
        "Failed to make request to Figma API endpoint '/files/file': Network timeout",
      );
    });

    it("should handle non-Error exceptions", async () => {
      const service = createService();
      mockFetchWithRetry.mockRejectedValue("String error");

      await expect(service.getImageFillUrls("file")).rejects.toThrow(
        "Failed to make request to Figma API endpoint '/files/file/images': String error",
      );
    });
  });
});
