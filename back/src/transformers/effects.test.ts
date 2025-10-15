import { describe, it, expect } from "vitest";
import { buildSimplifiedEffects } from "./effects.js";
import type { Node as FigmaDocumentNode, DropShadowEffect, InnerShadowEffect, BlurEffect } from "@figma/rest-api-spec";

describe("effects.ts - Effects transformation utilities", () => {
  describe("buildSimplifiedEffects", () => {
    it("should return empty object for nodes without effects", () => {
      const node = { type: "FRAME" } as FigmaDocumentNode;

      expect(buildSimplifiedEffects(node)).toEqual({});
    });

    it("should convert drop shadow to box-shadow", () => {
      const node = {
        type: "FRAME",
        effects: [
          {
            type: "DROP_SHADOW",
            visible: true,
            offset: { x: 4, y: 4 },
            radius: 8,
            spread: 2,
            color: { r: 0, g: 0, b: 0, a: 0.25 },
          } as DropShadowEffect,
        ],
      } as FigmaDocumentNode;

      const result = buildSimplifiedEffects(node);

      expect(result.boxShadow).toBe("4px 4px 8px 2px rgba(0, 0, 0, 0.25)");
    });

    it("should convert inner shadow with inset prefix", () => {
      const node = {
        type: "RECTANGLE",
        effects: [
          {
            type: "INNER_SHADOW",
            visible: true,
            offset: { x: 0, y: 2 },
            radius: 4,
            spread: 0,
            color: { r: 0, g: 0, b: 0, a: 0.1 },
          } as InnerShadowEffect,
        ],
      } as FigmaDocumentNode;

      const result = buildSimplifiedEffects(node);

      expect(result.boxShadow).toBe("inset 0px 2px 4px 0px rgba(0, 0, 0, 0.1)");
    });

    it("should combine multiple shadows", () => {
      const node = {
        type: "FRAME",
        effects: [
          {
            type: "DROP_SHADOW",
            visible: true,
            offset: { x: 2, y: 2 },
            radius: 4,
            color: { r: 0, g: 0, b: 0, a: 0.2 },
          } as DropShadowEffect,
          {
            type: "INNER_SHADOW",
            visible: true,
            offset: { x: 0, y: 1 },
            radius: 2,
            color: { r: 1, g: 1, b: 1, a: 0.5 },
          } as InnerShadowEffect,
        ],
      } as FigmaDocumentNode;

      const result = buildSimplifiedEffects(node);

      expect(result.boxShadow).toBe("2px 2px 4px 0px rgba(0, 0, 0, 0.2), inset 0px 1px 2px 0px rgba(255, 255, 255, 0.5)");
    });

    it("should use textShadow for TEXT nodes", () => {
      const node = {
        type: "TEXT",
        effects: [
          {
            type: "DROP_SHADOW",
            visible: true,
            offset: { x: 1, y: 1 },
            radius: 2,
            color: { r: 0, g: 0, b: 0, a: 0.5 },
          } as DropShadowEffect,
        ],
      } as FigmaDocumentNode;

      const result = buildSimplifiedEffects(node);

      expect(result.textShadow).toBe("1px 1px 2px 0px rgba(0, 0, 0, 0.5)");
      expect(result.boxShadow).toBeUndefined();
    });

    it("should convert layer blur to filter", () => {
      const node = {
        type: "FRAME",
        effects: [
          {
            type: "LAYER_BLUR",
            visible: true,
            radius: 10,
          } as BlurEffect,
        ],
      } as FigmaDocumentNode;

      const result = buildSimplifiedEffects(node);

      expect(result.filter).toBe("blur(10px)");
    });

    it("should convert background blur to backdrop-filter", () => {
      const node = {
        type: "FRAME",
        effects: [
          {
            type: "BACKGROUND_BLUR",
            visible: true,
            radius: 20,
          } as BlurEffect,
        ],
      } as FigmaDocumentNode;

      const result = buildSimplifiedEffects(node);

      expect(result.backdropFilter).toBe("blur(20px)");
    });

    it("should filter out invisible effects", () => {
      const node = {
        type: "FRAME",
        effects: [
          {
            type: "DROP_SHADOW",
            visible: false,
            offset: { x: 4, y: 4 },
            radius: 8,
            color: { r: 0, g: 0, b: 0, a: 0.5 },
          } as DropShadowEffect,
        ],
      } as FigmaDocumentNode;

      const result = buildSimplifiedEffects(node);

      expect(result).toEqual({});
    });

    it("should handle shadow without spread property", () => {
      const node = {
        type: "FRAME",
        effects: [
          {
            type: "DROP_SHADOW",
            visible: true,
            offset: { x: 2, y: 2 },
            radius: 4,
            color: { r: 0, g: 0, b: 0, a: 0.3 },
          } as DropShadowEffect,
        ],
      } as FigmaDocumentNode;

      const result = buildSimplifiedEffects(node);

      expect(result.boxShadow).toBe("2px 2px 4px 0px rgba(0, 0, 0, 0.3)");
    });

    it("should handle complex multi-effect scenarios", () => {
      const node = {
        type: "FRAME",
        effects: [
          {
            type: "DROP_SHADOW",
            visible: true,
            offset: { x: 0, y: 4 },
            radius: 8,
            spread: 0,
            color: { r: 0, g: 0, b: 0, a: 0.15 },
          } as DropShadowEffect,
          {
            type: "LAYER_BLUR",
            visible: true,
            radius: 5,
          } as BlurEffect,
          {
            type: "BACKGROUND_BLUR",
            visible: true,
            radius: 15,
          } as BlurEffect,
        ],
      } as FigmaDocumentNode;

      const result = buildSimplifiedEffects(node);

      expect(result).toEqual({
        boxShadow: "0px 4px 8px 0px rgba(0, 0, 0, 0.15)",
        filter: "blur(5px)",
        backdropFilter: "blur(15px)",
      });
    });
  });
});
