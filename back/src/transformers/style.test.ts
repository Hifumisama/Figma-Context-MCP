import { describe, it, expect } from "vitest";
import {
  parsePaint,
  buildSimplifiedStrokes,
  convertColor,
  formatRGBAColor,
  hexToRgba,
} from "./style.js";
import type { Node as FigmaDocumentNode, Paint, RGBA } from "@figma/rest-api-spec";

describe("style.ts - Style transformation utilities", () => {
  describe("Color conversion utilities", () => {
    it("convertColor should convert RGBA to hex and opacity", () => {
      const color: RGBA = { r: 1, g: 0, b: 0, a: 0.5 };

      const result = convertColor(color, 1);

      expect(result).toEqual({
        hex: "#FF0000",
        opacity: 0.5,
      });
    });

    it("formatRGBAColor should format to CSS rgba string", () => {
      const color: RGBA = { r: 0.5, g: 0.75, b: 1, a: 0.8 };

      const result = formatRGBAColor(color, 1);

      expect(result).toBe("rgba(128, 191, 255, 0.8)");
    });

    it("hexToRgba should convert hex to rgba", () => {
      expect(hexToRgba("#FF0000", 1)).toBe("rgba(255, 0, 0, 1)");
      expect(hexToRgba("#00FF00", 0.5)).toBe("rgba(0, 255, 0, 0.5)");
      expect(hexToRgba("#FFF", 1)).toBe("rgba(255, 255, 255, 1)");
      expect(hexToRgba("FF0000", 1)).toBe("rgba(255, 0, 0, 1)"); // Without #
    });

    it("hexToRgba should clamp opacity to 0-1 range", () => {
      expect(hexToRgba("#000000", 1.5)).toBe("rgba(0, 0, 0, 1)");
      expect(hexToRgba("#000000", -0.5)).toBe("rgba(0, 0, 0, 0)");
    });
  });

  describe("parsePaint for solid colors", () => {
    it("should convert opaque solid color to hex", () => {
      const paint: Paint = {
        type: "SOLID",
        visible: true,
        color: { r: 0, g: 0.5, b: 1, a: 1 },
        opacity: 1,
      };

      const result = parsePaint(paint);

      expect(result).toBe("#0080FF");
    });

    it("should convert semi-transparent solid color to rgba", () => {
      const paint: Paint = {
        type: "SOLID",
        visible: true,
        color: { r: 1, g: 0, b: 0, a: 1 },
        opacity: 0.5,
      };

      const result = parsePaint(paint);

      expect(result).toBe("rgba(255, 0, 0, 0.5)");
    });
  });

  describe("parsePaint for images", () => {
    it("should handle FILL scale mode for background", () => {
      const paint: Paint = {
        type: "IMAGE",
        visible: true,
        imageRef: "img-123",
        scaleMode: "FILL",
      };

      const result = parsePaint(paint, true); // hasChildren = true

      expect(result).toMatchObject({
        type: "IMAGE",
        imageRef: "img-123",
        scaleMode: "FILL",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        isBackground: true,
        imageDownloadArguments: {
          needsCropping: false,
          requiresImageDimensions: false,
        },
      });
    });

    it("should handle FIT scale mode for img tag", () => {
      const paint: Paint = {
        type: "IMAGE",
        visible: true,
        imageRef: "img-456",
        scaleMode: "FIT",
      };

      const result = parsePaint(paint, false); // hasChildren = false

      expect(result).toMatchObject({
        type: "IMAGE",
        imageRef: "img-456",
        scaleMode: "FIT",
        objectFit: "contain",
        isBackground: false,
      });
    });

    it("should handle TILE scale mode with scaling factor", () => {
      const paint: Paint = {
        type: "IMAGE",
        visible: true,
        imageRef: "img-789",
        scaleMode: "TILE",
        scalingFactor: 0.5,
      };

      const result = parsePaint(paint, false);

      expect(result).toMatchObject({
        type: "IMAGE",
        scaleMode: "TILE",
        scalingFactor: 0.5,
        backgroundRepeat: "repeat",
        backgroundSize: "calc(var(--original-width) * 0.5) calc(var(--original-height) * 0.5)",
        isBackground: true, // TILE always uses background
        imageDownloadArguments: {
          needsCropping: false,
          requiresImageDimensions: true,
        },
      });
    });

    it("should handle imageTransform for cropping", () => {
      const paint: Paint = {
        type: "IMAGE",
        visible: true,
        imageRef: "img-crop",
        scaleMode: "FILL",
        imageTransform: [
          [0.5, 0, 0.1],
          [0, 0.5, 0.1],
        ],
      };

      const result = parsePaint(paint, false);

      expect(result).toMatchObject({
        imageDownloadArguments: {
          needsCropping: true,
          requiresImageDimensions: false,
          cropTransform: [
            [0.5, 0, 0.1],
            [0, 0.5, 0.1],
          ],
        },
      });
      expect(result.imageDownloadArguments?.filenameSuffix).toBeDefined();
    });

    it("should handle STRETCH scale mode", () => {
      const paint: Paint = {
        type: "IMAGE",
        visible: true,
        imageRef: "img-stretch",
        scaleMode: "STRETCH",
      };

      const result = parsePaint(paint, true);

      expect(result).toMatchObject({
        backgroundSize: "100% 100%",
        backgroundRepeat: "no-repeat",
      });
    });
  });

  describe("parsePaint for gradients", () => {
    it("should convert linear gradient", () => {
      const paint: Paint = {
        type: "GRADIENT_LINEAR",
        visible: true,
        gradientHandlePositions: [
          { x: 0, y: 0 },
          { x: 1, y: 1 },
        ],
        gradientStops: [
          { position: 0, color: { r: 1, g: 0, b: 0, a: 1 } },
          { position: 1, color: { r: 0, g: 0, b: 1, a: 1 } },
        ],
      };

      const result = parsePaint(paint);

      expect(result).toMatchObject({
        type: "GRADIENT_LINEAR",
        gradientHandlePositions: [
          { x: 0, y: 0 },
          { x: 1, y: 1 },
        ],
        gradientStops: [
          { position: 0, color: { hex: "#FF0000", opacity: 1 } },
          { position: 1, color: { hex: "#0000FF", opacity: 1 } },
        ],
      });
    });

    it("should handle all gradient types", () => {
      const types = ["GRADIENT_LINEAR", "GRADIENT_RADIAL", "GRADIENT_ANGULAR", "GRADIENT_DIAMOND"] as const;

      types.forEach((type) => {
        const paint: Paint = {
          type,
          visible: true,
          gradientHandlePositions: [],
          gradientStops: [{ position: 0, color: { r: 0, g: 0, b: 0, a: 1 } }],
        };

        const result = parsePaint(paint);

        expect(result).toMatchObject({ type });
      });
    });
  });

  describe("parsePaint for patterns", () => {
    it("should convert pattern paint", () => {
      const paint: Paint = {
        type: "PATTERN",
        visible: true,
        sourceNodeId: "node-123",
        scalingFactor: 0.75,
        horizontalAlignment: "CENTER",
        verticalAlignment: "END",
      };

      const result = parsePaint(paint);

      expect(result).toMatchObject({
        type: "PATTERN",
        patternSource: {
          type: "IMAGE-PNG",
          nodeId: "node-123",
        },
        backgroundRepeat: "repeat",
        backgroundSize: "75%",
        backgroundPosition: "center bottom",
      });
    });

    it("should handle all pattern alignments", () => {
      const alignments = [
        { h: "START" as const, v: "START" as const, expected: "left top" },
        { h: "CENTER" as const, v: "CENTER" as const, expected: "center center" },
        { h: "END" as const, v: "END" as const, expected: "right bottom" },
      ];

      alignments.forEach(({ h, v, expected }) => {
        const paint: Paint = {
          type: "PATTERN",
          visible: true,
          sourceNodeId: "node-pattern",
          scalingFactor: 1,
          horizontalAlignment: h,
          verticalAlignment: v,
        };

        const result = parsePaint(paint);

        expect(result).toMatchObject({
          backgroundPosition: expected,
        });
      });
    });
  });

  describe("buildSimplifiedStrokes", () => {
    it("should extract stroke colors and weights", () => {
      const node = {
        type: "RECTANGLE",
        strokes: [
          {
            type: "SOLID" as const,
            visible: true,
            color: { r: 0, g: 0, b: 0, a: 1 },
          },
        ],
        strokeWeight: 2,
      } as FigmaDocumentNode;

      const result = buildSimplifiedStrokes(node);

      expect(result).toEqual({
        colors: ["#000000"],
        strokeWeight: "2px",
        strokeDashes: undefined,
        strokeWeights: undefined,
      });
    });

    it("should handle stroke dashes", () => {
      const node = {
        type: "RECTANGLE",
        strokes: [{ type: "SOLID" as const, visible: true, color: { r: 0, g: 0, b: 0, a: 1 } }],
        strokeWeight: 1,
        strokeDashes: [5, 3],
      } as FigmaDocumentNode;

      const result = buildSimplifiedStrokes(node);

      expect(result.strokeDashes).toEqual([5, 3]);
    });

    it("should handle individual stroke weights", () => {
      const node = {
        type: "RECTANGLE",
        strokes: [{ type: "SOLID" as const, visible: true, color: { r: 0, g: 0, b: 0, a: 1 } }],
        individualStrokeWeights: {
          top: 1,
          right: 2,
          bottom: 3,
          left: 4,
        },
      } as FigmaDocumentNode;

      const result = buildSimplifiedStrokes(node);

      expect(result.strokeWeight).toBe("1px 2px 3px 4px");
    });

    it("should filter out invisible strokes", () => {
      const node = {
        type: "RECTANGLE",
        strokes: [
          { type: "SOLID" as const, visible: false, color: { r: 1, g: 0, b: 0, a: 1 } },
          { type: "SOLID" as const, visible: true, color: { r: 0, g: 1, b: 0, a: 1 } },
        ],
      } as FigmaDocumentNode;

      const result = buildSimplifiedStrokes(node);

      expect(result.colors).toHaveLength(1);
      expect(result.colors[0]).toBe("#00FF00");
    });

    it("should return empty colors for nodes without strokes", () => {
      const node = { type: "RECTANGLE" } as FigmaDocumentNode;

      const result = buildSimplifiedStrokes(node);

      expect(result.colors).toEqual([]);
    });
  });
});
