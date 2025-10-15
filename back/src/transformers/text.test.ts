import { describe, it, expect } from "vitest";
import { isTextNode, hasTextStyle, extractNodeText, extractTextStyle } from "./text.js";
import type { Node as FigmaDocumentNode } from "@figma/rest-api-spec";

describe("text.ts - Text transformation utilities", () => {
  describe("Type guards", () => {
    it("isTextNode should identify TEXT nodes", () => {
      const textNode = { type: "TEXT", characters: "Hello" } as FigmaDocumentNode;
      const frameNode = { type: "FRAME" } as FigmaDocumentNode;

      expect(isTextNode(textNode)).toBe(true);
      expect(isTextNode(frameNode)).toBe(false);
    });

    it("hasTextStyle should validate style property existence", () => {
      const withStyle = { type: "TEXT", style: { fontFamily: "Arial" } } as FigmaDocumentNode;
      const withEmptyStyle = { type: "TEXT", style: {} } as FigmaDocumentNode;
      const withoutStyle = { type: "TEXT" } as FigmaDocumentNode;

      expect(hasTextStyle(withStyle)).toBe(true);
      expect(hasTextStyle(withEmptyStyle)).toBe(false);
      expect(hasTextStyle(withoutStyle)).toBe(false);
    });
  });

  describe("extractNodeText", () => {
    it("should extract characters from text nodes", () => {
      const node = { type: "TEXT", characters: "Hello World" } as FigmaDocumentNode;

      expect(extractNodeText(node)).toBe("Hello World");
    });

    it("should return undefined for nodes without characters", () => {
      const nodeWithoutText = { type: "FRAME" } as FigmaDocumentNode;
      const nodeWithEmptyText = { type: "TEXT", characters: "" } as FigmaDocumentNode;

      expect(extractNodeText(nodeWithoutText)).toBeUndefined();
      expect(extractNodeText(nodeWithEmptyText)).toBeUndefined();
    });
  });

  describe("extractTextStyle", () => {
    it("should extract complete text style", () => {
      const node = {
        type: "TEXT",
        style: {
          fontFamily: "Roboto",
          fontWeight: 700,
          fontSize: 16,
          lineHeightPx: 24,
          letterSpacing: 0.5,
          textCase: "UPPER",
          textAlignHorizontal: "CENTER",
          textAlignVertical: "TOP",
        },
      } as FigmaDocumentNode;

      const style = extractTextStyle(node);

      expect(style).toEqual({
        fontFamily: "Roboto",
        fontWeight: 700,
        fontSize: 16,
        lineHeight: "1.5em", // 24 / 16
        letterSpacing: "3.125%", // (0.5 / 16) * 100
        textCase: "UPPER",
        textAlignHorizontal: "CENTER",
        textAlignVertical: "TOP",
      });
    });

    it("should handle line height calculation", () => {
      const node = {
        type: "TEXT",
        style: {
          fontSize: 20,
          lineHeightPx: 30,
        },
      } as FigmaDocumentNode;

      const style = extractTextStyle(node);

      expect(style?.lineHeight).toBe("1.5em");
    });

    it("should handle letter spacing edge cases", () => {
      const nodeWithZeroSpacing = {
        type: "TEXT",
        style: { fontSize: 16, letterSpacing: 0 },
      } as FigmaDocumentNode;

      const nodeWithNormalSpacing = {
        type: "TEXT",
        style: { fontSize: 16, letterSpacing: 1 },
      } as FigmaDocumentNode;

      expect(extractTextStyle(nodeWithZeroSpacing)?.letterSpacing).toBeUndefined();
      expect(extractTextStyle(nodeWithNormalSpacing)?.letterSpacing).toBe("6.25%");
    });

    it("should return undefined for nodes without style", () => {
      const node = { type: "TEXT" } as FigmaDocumentNode;

      expect(extractTextStyle(node)).toBeUndefined();
    });

    it("should handle partial text styles", () => {
      const node = {
        type: "TEXT",
        style: {
          fontFamily: "Arial",
          fontSize: 14,
        },
      } as FigmaDocumentNode;

      const style = extractTextStyle(node);

      expect(style).toEqual({
        fontFamily: "Arial",
        fontSize: 14,
        lineHeight: undefined,
        letterSpacing: undefined,
        textCase: undefined,
        textAlignHorizontal: undefined,
        textAlignVertical: undefined,
        fontWeight: undefined,
      });
    });
  });
});
