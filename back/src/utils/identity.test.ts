import { describe, it, expect } from "vitest";
import {
  hasValue,
  isFrame,
  isLayout,
  isInAutoLayoutFlow,
  isStrokeWeights,
  isRectangle,
  isRectangleCornerRadii,
  isCSSColorValue,
  isTruthy,
} from "./identity.js";

describe("identity.ts - Type guards and validators", () => {
  describe("isTruthy (from remeda)", () => {
    it("should correctly identify truthy and falsy values", () => {
      // Truthy values
      expect(isTruthy(1)).toBe(true);
      expect(isTruthy("hello")).toBe(true);
      expect(isTruthy([])).toBe(true);

      // Falsy values
      expect(isTruthy(0)).toBe(false);
      expect(isTruthy("")).toBe(false);
      expect(isTruthy(null)).toBe(false);
      expect(isTruthy(undefined)).toBe(false);
    });
  });

  describe("hasValue", () => {
    it("should validate object property existence and type", () => {
      const obj = { name: "test", count: 42, undef: undefined };
      const isNumber = (val: unknown): val is number => typeof val === "number";

      // Key exists with value
      expect(hasValue("name", obj)).toBe(true);

      // Key doesn't exist or is undefined
      expect(hasValue("missing", obj)).toBe(false);
      expect(hasValue("undef", obj)).toBe(false);

      // TypeGuard validation
      expect(hasValue("count", obj, isNumber)).toBe(true);
      expect(hasValue("name", obj, isNumber)).toBe(false);
    });

    it("should return false for non-objects", () => {
      expect(hasValue("key", null)).toBe(false);
      expect(hasValue("key", "string")).toBe(false);
    });
  });

  describe("Figma type guards", () => {
    it("isFrame should validate HasFramePropertiesTrait", () => {
      expect(isFrame({ clipsContent: true })).toBe(true);
      expect(isFrame({ clipsContent: false })).toBe(true);
      expect(isFrame({})).toBe(false);
      expect(isFrame({ clipsContent: "true" })).toBe(false);
      expect(isFrame(null)).toBe(false);
    });

    it("isLayout should validate HasLayoutTrait with absoluteBoundingBox", () => {
      const valid = { absoluteBoundingBox: { x: 0, y: 0, width: 100, height: 50 } };
      const incomplete = { absoluteBoundingBox: { x: 0, y: 0 } };

      expect(isLayout(valid)).toBe(true);
      expect(isLayout(incomplete)).toBe(false);
      expect(isLayout({})).toBe(false);
      expect(isLayout(null)).toBe(false);
    });

    it("isStrokeWeights should validate all four sides", () => {
      const valid = { top: 1, right: 2, bottom: 1, left: 2 };
      const incomplete = { top: 1, right: 2, bottom: 1 };

      expect(isStrokeWeights(valid)).toBe(true);
      expect(isStrokeWeights(incomplete)).toBe(false);
      expect(isStrokeWeights(null)).toBe(false);
    });

    it("isRectangle should validate rectangle property", () => {
      const obj = { bounds: { x: 0, y: 0, width: 100, height: 50 } };
      const incomplete = { bounds: { x: 0, y: 0 } };

      expect(isRectangle("bounds", obj)).toBe(true);
      expect(isRectangle("bounds", incomplete)).toBe(false);
      expect(isRectangle("bounds", {})).toBe(false);
      expect(isRectangle("bounds", null)).toBe(false);
    });
  });

  describe("isInAutoLayoutFlow", () => {
    it("should validate auto layout parent-child relationship", () => {
      const autoLayoutParent = { clipsContent: true, layoutMode: "HORIZONTAL" };
      const validChild = {
        absoluteBoundingBox: { x: 0, y: 0, width: 100, height: 50 },
        layoutPositioning: "AUTO",
      };
      const absoluteChild = { ...validChild, layoutPositioning: "ABSOLUTE" };

      expect(isInAutoLayoutFlow(validChild, autoLayoutParent)).toBe(true);
      expect(isInAutoLayoutFlow(validChild, { ...autoLayoutParent, layoutMode: "VERTICAL" })).toBe(true);
      expect(isInAutoLayoutFlow(absoluteChild, autoLayoutParent)).toBe(false);
      expect(isInAutoLayoutFlow(validChild, { clipsContent: true, layoutMode: "NONE" })).toBe(false);
      expect(isInAutoLayoutFlow(validChild, {})).toBe(false);
    });
  });

  describe("Array and string validators", () => {
    it("isRectangleCornerRadii should validate 4-number array", () => {
      expect(isRectangleCornerRadii([8, 8, 8, 8])).toBe(true);
      expect(isRectangleCornerRadii([4, 8, 4, 8])).toBe(true);

      // Wrong length
      expect(isRectangleCornerRadii([8, 8, 8])).toBe(false);
      expect(isRectangleCornerRadii([8, 8, 8, 8, 8])).toBe(false);

      // Non-number values
      expect(isRectangleCornerRadii(["8", "8", "8", "8"])).toBe(false);
      expect(isRectangleCornerRadii([8, null, 8, 8])).toBe(false);

      // Non-array
      expect(isRectangleCornerRadii(null)).toBe(false);
      expect(isRectangleCornerRadii({})).toBe(false);
    });

    it("isCSSColorValue should validate hex and rgba colors", () => {
      // Hex colors
      expect(isCSSColorValue("#FF0000")).toBe(true);
      expect(isCSSColorValue("#fff")).toBe(true);

      // RGBA colors
      expect(isCSSColorValue("rgba(255, 0, 0, 1)")).toBe(true);
      expect(isCSSColorValue("rgba(0, 255, 0, 0.5)")).toBe(true);

      // Invalid formats
      expect(isCSSColorValue("red")).toBe(false);
      expect(isCSSColorValue("rgb(255, 0, 0)")).toBe(false);
      expect(isCSSColorValue("hsl(0, 100%, 50%)")).toBe(false);

      // Non-strings
      expect(isCSSColorValue(null)).toBe(false);
      expect(isCSSColorValue(123)).toBe(false);
    });
  });
});
