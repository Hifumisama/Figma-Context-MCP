import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock dependencies before imports
vi.mock("sharp", () => {
  const mockSharp = vi.fn(() => ({
    metadata: vi.fn(),
    extract: vi.fn(() => ({
      toFile: vi.fn(),
    })),
  }));
  return { default: mockSharp };
});

vi.mock("fs", () => ({
  default: {
    renameSync: vi.fn(),
  },
}));

vi.mock("./logger.js", () => ({
  Logger: {
    log: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("./common.js", () => ({
  downloadFigmaImage: vi.fn(),
}));

import sharp from "sharp";
import fs from "fs";
import {
  applyCropTransform,
  getImageDimensions,
  generateImageCSSVariables,
  downloadAndProcessImage,
} from "./image-processing.js";
import { downloadFigmaImage } from "./common.js";
import type { Transform } from "@figma/rest-api-spec";

describe("image-processing.ts - Image utilities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getImageDimensions", () => {
    it("should return image dimensions from metadata", async () => {
      const mockMetadata = { width: 1920, height: 1080 };
      vi.mocked(sharp).mockReturnValue({
        metadata: vi.fn().mockResolvedValue(mockMetadata),
      } as any);

      const dimensions = await getImageDimensions("/path/to/image.png");

      expect(dimensions).toEqual({ width: 1920, height: 1080 });
      expect(sharp).toHaveBeenCalledWith("/path/to/image.png");
    });

    it("should return default dimensions on error", async () => {
      vi.mocked(sharp).mockReturnValue({
        metadata: vi.fn().mockRejectedValue(new Error("File not found")),
      } as any);

      const dimensions = await getImageDimensions("/invalid/path.png");

      expect(dimensions).toEqual({ width: 1000, height: 1000 });
    });

    it("should return default dimensions when metadata is incomplete", async () => {
      vi.mocked(sharp).mockReturnValue({
        metadata: vi.fn().mockResolvedValue({ width: null, height: null }),
      } as any);

      const dimensions = await getImageDimensions("/path/to/image.png");

      expect(dimensions).toEqual({ width: 1000, height: 1000 });
    });
  });

  describe("applyCropTransform", () => {
    it("should apply valid crop transform and overwrite original file", async () => {
      const imagePath = "/path/to/image.png";
      const cropTransform: Transform = [
        [0.5, 0, 0.1], // scaleX=0.5, skewX=0, translateX=0.1
        [0, 0.5, 0.1], // skewY=0, scaleY=0.5, translateY=0.1
      ];

      const mockExtract = vi.fn(() => ({ toFile: vi.fn().mockResolvedValue(undefined) }));
      vi.mocked(sharp).mockReturnValue({
        metadata: vi.fn().mockResolvedValue({ width: 1000, height: 1000 }),
        extract: mockExtract,
      } as any);

      const result = await applyCropTransform(imagePath, cropTransform);

      expect(result).toBe(imagePath);
      expect(mockExtract).toHaveBeenCalledWith({
        left: 100, // translateX * width
        top: 100, // translateY * height
        width: 500, // scaleX * width
        height: 500, // scaleY * height
      });
      expect(fs.renameSync).toHaveBeenCalledWith(imagePath + ".tmp", imagePath);
    });

    it("should return original path when crop dimensions are invalid", async () => {
      const imagePath = "/path/to/image.png";
      const invalidTransform: Transform = [
        [0, 0, 0], // scaleX=0 (invalid)
        [0, 0, 0], // scaleY=0 (invalid)
      ];

      vi.mocked(sharp).mockReturnValue({
        metadata: vi.fn().mockResolvedValue({ width: 1000, height: 1000 }),
      } as any);

      const result = await applyCropTransform(imagePath, invalidTransform);

      expect(result).toBe(imagePath);
      expect(fs.renameSync).not.toHaveBeenCalled();
    });

    it("should return original path on error", async () => {
      const imagePath = "/path/to/image.png";
      const cropTransform: Transform = [
        [0.5, 0, 0],
        [0, 0.5, 0],
      ];

      vi.mocked(sharp).mockReturnValue({
        metadata: vi.fn().mockRejectedValue(new Error("Failed to read image")),
      } as any);

      const result = await applyCropTransform(imagePath, cropTransform);

      expect(result).toBe(imagePath);
    });
  });

  describe("generateImageCSSVariables", () => {
    it("should generate CSS custom properties for image dimensions", () => {
      const css = generateImageCSSVariables({ width: 1920, height: 1080 });

      expect(css).toBe("--original-width: 1920px; --original-height: 1080px;");
    });

    it("should handle various dimensions", () => {
      expect(generateImageCSSVariables({ width: 100, height: 50 })).toBe(
        "--original-width: 100px; --original-height: 50px;"
      );

      expect(generateImageCSSVariables({ width: 0, height: 0 })).toBe(
        "--original-width: 0px; --original-height: 0px;"
      );
    });
  });

  describe("downloadAndProcessImage", () => {
    it("should download and process image with crop transform", async () => {
      const fileName = "test.png";
      const localPath = "/downloads";
      const imageUrl = "https://example.com/image.png";
      const cropTransform: Transform = [
        [0.5, 0, 0],
        [0, 0.5, 0],
      ];

      vi.mocked(downloadFigmaImage).mockResolvedValue("/downloads/test.png");

      const mockExtract = vi.fn(() => ({ toFile: vi.fn().mockResolvedValue(undefined) }));
      vi.mocked(sharp).mockReturnValue({
        metadata: vi.fn().mockResolvedValue({ width: 1000, height: 1000 }),
        extract: mockExtract,
      } as any);

      const result = await downloadAndProcessImage(
        fileName,
        localPath,
        imageUrl,
        true,
        cropTransform,
        false
      );

      expect(result.filePath).toBe("/downloads/test.png");
      expect(result.wasCropped).toBe(true);
      expect(result.originalDimensions).toEqual({ width: 1000, height: 1000 });
      expect(result.finalDimensions).toEqual({ width: 1000, height: 1000 });
      expect(result.cropRegion).toEqual({ left: 0, top: 0, width: 500, height: 500 });
      expect(downloadFigmaImage).toHaveBeenCalledWith(fileName, localPath, imageUrl);
    });

    it("should download without cropping when needsCropping is false", async () => {
      const fileName = "test.png";
      const localPath = "/downloads";
      const imageUrl = "https://example.com/image.png";

      vi.mocked(downloadFigmaImage).mockResolvedValue("/downloads/test.png");
      vi.mocked(sharp).mockReturnValue({
        metadata: vi.fn().mockResolvedValue({ width: 800, height: 600 }),
      } as any);

      const result = await downloadAndProcessImage(fileName, localPath, imageUrl, false);

      expect(result.filePath).toBe("/downloads/test.png");
      expect(result.wasCropped).toBe(false);
      expect(result.cssVariables).toBeUndefined();
    });

    it("should generate CSS variables when requiresImageDimensions is true", async () => {
      const fileName = "test.png";
      const localPath = "/downloads";
      const imageUrl = "https://example.com/image.png";

      vi.mocked(downloadFigmaImage).mockResolvedValue("/downloads/test.png");
      vi.mocked(sharp).mockReturnValue({
        metadata: vi.fn().mockResolvedValue({ width: 1920, height: 1080 }),
      } as any);

      const result = await downloadAndProcessImage(
        fileName,
        localPath,
        imageUrl,
        false,
        undefined,
        true
      );

      expect(result.cssVariables).toBe("--original-width: 1920px; --original-height: 1080px;");
      expect(result.finalDimensions).toEqual({ width: 1920, height: 1080 });
    });
  });
});
