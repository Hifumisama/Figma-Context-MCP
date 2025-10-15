import { describe, it, expect, vi, beforeEach } from "vitest";
import { downloadFigmaImagesTool } from "./download-figma-images-tool.js";
import type { DownloadImagesParams } from "./download-figma-images-tool.js";
import { FigmaService } from "../../services/figma.js";

// Mock FigmaService
const mockDownloadImages = vi.fn();
vi.mock("../../services/figma.js", () => ({
  FigmaService: vi.fn().mockImplementation(() => ({
    downloadImages: mockDownloadImages,
  })),
}));

describe("download-figma-images-tool.ts - Figma image download tool", () => {
  let figmaService: FigmaService;

  beforeEach(() => {
    vi.clearAllMocks();
    figmaService = new FigmaService({
      figmaApiKey: "test-key",
      figmaOAuthToken: "",
      useOAuth: false,
    });
  });

  describe("Tool configuration", () => {
    it("should have correct tool metadata", () => {
      expect(downloadFigmaImagesTool.name).toBe("download_figma_images");
      expect(downloadFigmaImagesTool.description).toContain("Download SVG and PNG images");
      expect(downloadFigmaImagesTool.parameters).toBeDefined();
    });
  });

  describe("Image deduplication and filename handling", () => {
    it("should handle duplicate imageRefs without suffix", async () => {
      const params: DownloadImagesParams = {
        fileKey: "test-file",
        nodes: [
          { nodeId: "1:1", imageRef: "img-ref-1", fileName: "image1.png" },
          { nodeId: "1:2", imageRef: "img-ref-1", fileName: "image2.png" },
        ],
        localPath: "/test/path",
        pngScale: 2,
      };

      mockDownloadImages.mockResolvedValue([
        {
          filePath: "/test/path/image1.png",
          finalDimensions: { width: 100, height: 100 },
          wasCropped: false,
        },
      ]);

      const result = await downloadFigmaImagesTool.handler(params, figmaService);

      expect(mockDownloadImages).toHaveBeenCalledOnce();
      expect(result.content[0].text).toContain("also requested as: image2.png");
    });

    it("should apply filename suffix when provided", async () => {
      const params: DownloadImagesParams = {
        fileKey: "test-file",
        nodes: [
          {
            nodeId: "1:1",
            imageRef: "img-ref-1",
            fileName: "image.png",
            filenameSuffix: "abc123",
          },
        ],
        localPath: "/test/path",
      };

      mockDownloadImages.mockResolvedValue([
        {
          filePath: "/test/path/image-abc123.png",
          finalDimensions: { width: 100, height: 100 },
          wasCropped: false,
        },
      ]);

      await downloadFigmaImagesTool.handler(params, figmaService);

      const downloadCall = mockDownloadImages.mock.calls[0];
      expect(downloadCall[2][0].fileName).toBe("image-abc123.png");
    });

    it("should not apply suffix if already present in filename", async () => {
      const params: DownloadImagesParams = {
        fileKey: "test-file",
        nodes: [
          {
            nodeId: "1:1",
            imageRef: "img-ref-1",
            fileName: "image-abc123.png",
            filenameSuffix: "abc123",
          },
        ],
        localPath: "/test/path",
      };

      mockDownloadImages.mockResolvedValue([
        {
          filePath: "/test/path/image-abc123.png",
          finalDimensions: { width: 100, height: 100 },
          wasCropped: false,
        },
      ]);

      await downloadFigmaImagesTool.handler(params, figmaService);

      const downloadCall = mockDownloadImages.mock.calls[0];
      expect(downloadCall[2][0].fileName).toBe("image-abc123.png");
    });
  });

  describe("Image processing options", () => {
    it("should pass cropping information to FigmaService", async () => {
      const cropTransform = [
        [0.5, 0, 0.1],
        [0, 0.5, 0.1],
      ];
      const params: DownloadImagesParams = {
        fileKey: "test-file",
        nodes: [
          {
            nodeId: "1:1",
            fileName: "cropped.png",
            needsCropping: true,
            cropTransform,
          },
        ],
        localPath: "/test/path",
      };

      mockDownloadImages.mockResolvedValue([
        {
          filePath: "/test/path/cropped.png",
          finalDimensions: { width: 50, height: 50 },
          wasCropped: true,
        },
      ]);

      await downloadFigmaImagesTool.handler(params, figmaService);

      const downloadCall = mockDownloadImages.mock.calls[0];
      expect(downloadCall[2][0].needsCropping).toBe(true);
      expect(downloadCall[2][0].cropTransform).toEqual(cropTransform);
    });

    it("should handle requiresImageDimensions flag", async () => {
      const params: DownloadImagesParams = {
        fileKey: "test-file",
        nodes: [
          {
            nodeId: "1:1",
            fileName: "pattern.png",
            requiresImageDimensions: true,
          },
        ],
        localPath: "/test/path",
      };

      mockDownloadImages.mockResolvedValue([
        {
          filePath: "/test/path/pattern.png",
          finalDimensions: { width: 200, height: 150 },
          wasCropped: false,
          cssVariables: "--original-width: 200px; --original-height: 150px",
        },
      ]);

      const result = await downloadFigmaImagesTool.handler(params, figmaService);

      expect(result.content[0].text).toContain("--original-width");
      expect(result.content[0].text).toContain("200x150");
    });

    it("should use default pngScale of 2 when not provided", async () => {
      const params: DownloadImagesParams = {
        fileKey: "test-file",
        nodes: [{ nodeId: "1:1", fileName: "image.png" }],
        localPath: "/test/path",
      };

      mockDownloadImages.mockResolvedValue([
        {
          filePath: "/test/path/image.png",
          finalDimensions: { width: 100, height: 100 },
          wasCropped: false,
        },
      ]);

      await downloadFigmaImagesTool.handler(params, figmaService);

      const downloadCall = mockDownloadImages.mock.calls[0];
      expect(downloadCall[3]).toEqual({ pngScale: 2 });
    });
  });

  describe("Response formatting", () => {
    it("should format successful download response", async () => {
      const params: DownloadImagesParams = {
        fileKey: "test-file",
        nodes: [
          { nodeId: "1:1", fileName: "image1.png" },
          { nodeId: "1:2", fileName: "image2.svg" },
        ],
        localPath: "/test/path",
      };

      mockDownloadImages.mockResolvedValue([
        {
          filePath: "/test/path/image1.png",
          finalDimensions: { width: 100, height: 100 },
          wasCropped: false,
        },
        {
          filePath: "/test/path/image2.svg",
          finalDimensions: { width: 50, height: 50 },
          wasCropped: true,
        },
      ]);

      const result = await downloadFigmaImagesTool.handler(params, figmaService);

      expect(result.content[0].text).toContain("Downloaded 2 images");
      expect(result.content[0].text).toContain("image1.png: 100x100");
      expect(result.content[0].text).toContain("image2.svg: 50x50 (cropped)");
    });

    it("should handle download errors gracefully", async () => {
      const params: DownloadImagesParams = {
        fileKey: "test-file",
        nodes: [{ nodeId: "1:1", fileName: "image.png" }],
        localPath: "/test/path",
      };

      mockDownloadImages.mockRejectedValue(new Error("Network error"));

      const result = await downloadFigmaImagesTool.handler(params, figmaService);

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("Failed to download images");
      expect(result.content[0].text).toContain("Network error");
    });
  });

  describe("Edge cases", () => {
    it("should handle nodes without imageRef (rendered nodes)", async () => {
      const params: DownloadImagesParams = {
        fileKey: "test-file",
        nodes: [{ nodeId: "1:1", fileName: "vector.svg" }],
        localPath: "/test/path",
      };

      mockDownloadImages.mockResolvedValue([
        {
          filePath: "/test/path/vector.svg",
          finalDimensions: { width: 24, height: 24 },
          wasCropped: false,
        },
      ]);

      await downloadFigmaImagesTool.handler(params, figmaService);

      const downloadCall = mockDownloadImages.mock.calls[0];
      expect(downloadCall[2][0].nodeId).toBe("1:1");
      expect(downloadCall[2][0].imageRef).toBeUndefined();
    });

    it("should aggregate requiresImageDimensions across duplicate imageRefs", async () => {
      const params: DownloadImagesParams = {
        fileKey: "test-file",
        nodes: [
          { nodeId: "1:1", imageRef: "img-ref-1", fileName: "img1.png", requiresImageDimensions: false },
          { nodeId: "1:2", imageRef: "img-ref-1", fileName: "img2.png", requiresImageDimensions: true },
        ],
        localPath: "/test/path",
      };

      mockDownloadImages.mockResolvedValue([
        {
          filePath: "/test/path/img1.png",
          finalDimensions: { width: 100, height: 100 },
          wasCropped: false,
          cssVariables: "--original-width: 100px; --original-height: 100px",
        },
      ]);

      await downloadFigmaImagesTool.handler(params, figmaService);

      const downloadCall = mockDownloadImages.mock.calls[0];
      expect(downloadCall[2][0].requiresImageDimensions).toBe(true);
    });
  });
});
