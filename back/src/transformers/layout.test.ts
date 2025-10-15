import { describe, it, expect } from "vitest";
import { buildSimplifiedLayout } from "./layout.js";
import type { Node as FigmaDocumentNode } from "@figma/rest-api-spec";

describe("layout.ts - Layout transformation utilities", () => {
  describe("buildSimplifiedLayout for non-frame nodes", () => {
    it("should return mode 'none' for non-frame nodes", () => {
      const node = { type: "RECTANGLE" } as FigmaDocumentNode;

      const result = buildSimplifiedLayout(node);

      expect(result.mode).toBe("none");
    });
  });

  describe("buildSimplifiedLayout for auto layout frames", () => {
    it("should transform horizontal auto layout", () => {
      const node = {
        type: "FRAME",
        clipsContent: true,
        layoutMode: "HORIZONTAL",
        primaryAxisAlignItems: "CENTER",
        counterAxisAlignItems: "MIN",
        itemSpacing: 12,
        paddingTop: 16,
        paddingRight: 20,
        paddingBottom: 16,
        paddingLeft: 20,
        children: [],
      } as FigmaDocumentNode;

      const result = buildSimplifiedLayout(node);

      expect(result).toEqual({
        mode: "row",
        justifyContent: "center",
        alignItems: undefined, // MIN is default
        alignSelf: undefined,
        wrap: undefined,
        gap: "12px",
        padding: "16px 20px",
      });
    });

    it("should transform vertical auto layout", () => {
      const node = {
        type: "FRAME",
        clipsContent: true,
        layoutMode: "VERTICAL",
        primaryAxisAlignItems: "SPACE_BETWEEN",
        counterAxisAlignItems: "MAX",
        itemSpacing: 8,
        children: [],
      } as FigmaDocumentNode;

      const result = buildSimplifiedLayout(node);

      expect(result).toMatchObject({
        mode: "column",
        justifyContent: "space-between",
        alignItems: "flex-end",
      });
    });

    it("should handle wrap property", () => {
      const node = {
        type: "FRAME",
        clipsContent: true,
        layoutMode: "HORIZONTAL",
        layoutWrap: "WRAP",
        children: [],
      } as FigmaDocumentNode;

      const result = buildSimplifiedLayout(node);

      expect(result.wrap).toBe(true);
    });

    it("should handle overflow scroll", () => {
      const node = {
        type: "FRAME",
        clipsContent: true,
        layoutMode: "NONE",
        overflowDirection: ["HORIZONTAL", "VERTICAL"],
        children: [],
      } as FigmaDocumentNode;

      const result = buildSimplifiedLayout(node);

      expect(result.overflowScroll).toEqual(["x", "y"]);
    });
  });

  describe("buildSimplifiedLayout with sizing and positioning", () => {
    it("should include sizing information", () => {
      const node = {
        type: "FRAME",
        clipsContent: true,
        layoutMode: "NONE",
        absoluteBoundingBox: { x: 0, y: 0, width: 200, height: 100 },
        layoutSizingHorizontal: "FILL",
        layoutSizingVertical: "HUG",
        children: [],
      } as FigmaDocumentNode;

      const result = buildSimplifiedLayout(node);

      expect(result.sizing).toEqual({
        horizontal: "fill",
        vertical: "hug",
      });
    });

    it("should include dimensions for fixed sizing", () => {
      const node = {
        type: "RECTANGLE",
        absoluteBoundingBox: { x: 0, y: 0, width: 320, height: 240 },
        layoutSizingHorizontal: "FIXED",
        layoutSizingVertical: "FIXED",
      } as FigmaDocumentNode;

      const result = buildSimplifiedLayout(node);

      expect(result.dimensions).toEqual({
        width: 320,
        height: 240,
      });
    });

    it("should handle absolute positioning", () => {
      const parent = {
        type: "FRAME",
        clipsContent: true,
        layoutMode: "NONE",
        absoluteBoundingBox: { x: 100, y: 100, width: 500, height: 500 },
      } as FigmaDocumentNode;

      const node = {
        type: "RECTANGLE",
        absoluteBoundingBox: { x: 120, y: 150, width: 100, height: 100 },
        layoutPositioning: "ABSOLUTE",
      } as FigmaDocumentNode;

      const result = buildSimplifiedLayout(node, parent);

      expect(result.position).toBe("absolute");
      expect(result.locationRelativeToParent).toEqual({ x: 20, y: 50 });
    });

    it("should round pixel values", () => {
      const node = {
        type: "RECTANGLE",
        absoluteBoundingBox: { x: 0, y: 0, width: 123.456, height: 78.912 },
        layoutSizingHorizontal: "FIXED",
        layoutSizingVertical: "FIXED",
      } as FigmaDocumentNode;

      const result = buildSimplifiedLayout(node);

      expect(result.dimensions).toEqual({
        width: 123.46,
        height: 78.91,
      });
    });
  });

  describe("buildSimplifiedLayout for auto layout children", () => {
    it("should handle children in auto layout row with layoutGrow", () => {
      const parent = {
        type: "FRAME",
        clipsContent: true,
        layoutMode: "HORIZONTAL",
        children: [],
      } as FigmaDocumentNode;

      const child = {
        type: "RECTANGLE",
        absoluteBoundingBox: { x: 0, y: 0, width: 100, height: 50 },
        layoutGrow: 1,
        layoutSizingHorizontal: "FILL",
        layoutSizingVertical: "FIXED",
        layoutPositioning: "AUTO",
      } as FigmaDocumentNode;

      const result = buildSimplifiedLayout(child, parent);

      // In a row layout with layoutGrow, width should not be included
      expect(result.dimensions?.width).toBeUndefined();
      expect(result.dimensions?.height).toBe(50);
    });

    it("should handle stretch alignment", () => {
      const parent = {
        type: "FRAME",
        clipsContent: true,
        layoutMode: "VERTICAL",
        children: [],
      } as FigmaDocumentNode;

      const child = {
        type: "RECTANGLE",
        absoluteBoundingBox: { x: 0, y: 0, width: 100, height: 50 },
        layoutAlign: "STRETCH",
        layoutSizingHorizontal: "FIXED",
        layoutSizingVertical: "FIXED",
        layoutPositioning: "AUTO",
      } as FigmaDocumentNode;

      const result = buildSimplifiedLayout(child, parent);

      // The implementation still includes width when layoutSizingHorizontal is FIXED
      expect(result.dimensions?.width).toBe(100);
      expect(result.dimensions?.height).toBe(50);
    });

    it("should include dimensions when not in auto layout flow", () => {
      const parent = {
        type: "FRAME",
        clipsContent: true,
        layoutMode: "NONE",
        absoluteBoundingBox: { x: 0, y: 0, width: 500, height: 500 },
      } as FigmaDocumentNode;

      const child = {
        type: "RECTANGLE",
        absoluteBoundingBox: { x: 0, y: 0, width: 200, height: 100 },
        preserveRatio: true,
        layoutSizingHorizontal: "FIXED",
        layoutSizingVertical: "FIXED",
      } as FigmaDocumentNode;

      const result = buildSimplifiedLayout(child, parent);

      // When not in auto layout, both dimensions should be included
      expect(result.dimensions?.width).toBe(200);
      expect(result.dimensions?.height).toBe(100);
    });
  });
});
