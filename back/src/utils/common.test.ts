import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  removeEmptyKeys,
  generateCSSShorthand,
  isVisible,
  pixelRound,
  generateVarId,
  downloadFigmaImage,
} from "./common.js";
import fs from "fs";
import path from "path";

describe("common.ts - Utility functions", () => {
  describe("downloadFigmaImage", () => {
    const testDir = path.join(process.cwd(), ".test-downloads");
    const mockImageUrl = "https://figma.com/image.png";

    beforeEach(() => {
      // Clean up test directory
      if (fs.existsSync(testDir)) {
        fs.rmSync(testDir, { recursive: true, force: true });
      }
    });

    afterEach(async () => {
      // Clean up after tests - wait a bit for file streams to close
      await new Promise(resolve => setTimeout(resolve, 100));
      try {
        if (fs.existsSync(testDir)) {
          fs.rmSync(testDir, { recursive: true, force: true });
        }
      } catch {
        // Ignore cleanup errors
      }
    });

    it("should download image and return file path", async () => {
      const mockResponse = {
        ok: true,
        body: {
          getReader: () => {
            let done = false;
            return {
              read: async () => {
                if (done) return { done: true, value: undefined };
                done = true;
                return { done: false, value: new Uint8Array(Buffer.from("fake image data")) };
              },
              cancel: vi.fn(),
            };
          },
        },
      };

      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const result = await downloadFigmaImage("test.png", testDir, mockImageUrl);

      expect(result).toBe(path.join(testDir, "test.png"));
      expect(fs.existsSync(result)).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(mockImageUrl, { method: "GET" });
    });

    it("should create directory if it doesn't exist", async () => {
      const mockResponse = {
        ok: true,
        body: {
          getReader: () => ({
            read: async () => ({ done: true, value: undefined }),
            cancel: vi.fn(),
          }),
        },
      };

      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      expect(fs.existsSync(testDir)).toBe(false);

      await downloadFigmaImage("test.png", testDir, mockImageUrl);

      expect(fs.existsSync(testDir)).toBe(true);
    });

    it("should throw error on failed response", async () => {
      const mockResponse = {
        ok: false,
        statusText: "Not Found",
      };

      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      await expect(downloadFigmaImage("test.png", testDir, mockImageUrl)).rejects.toThrow(
        "Failed to download image: Not Found"
      );
    });

    it("should throw error when response body is missing", async () => {
      const mockResponse = {
        ok: true,
        body: null,
      };

      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      await expect(downloadFigmaImage("test.png", testDir, mockImageUrl)).rejects.toThrow(
        "Failed to get response body"
      );
    });

    it("should handle fetch errors", async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

      await expect(downloadFigmaImage("test.png", testDir, mockImageUrl)).rejects.toThrow(
        "Error downloading image: Network error"
      );
    });

    it("should handle non-Error exceptions", async () => {
      global.fetch = vi.fn().mockRejectedValue("String error");

      await expect(downloadFigmaImage("test.png", testDir, mockImageUrl)).rejects.toThrow(
        "Error downloading image: String error"
      );
    });
  });

  describe("removeEmptyKeys", () => {
    it("should remove empty arrays", () => {
      const input = {
        name: "test",
        emptyArray: [],
        items: [1, 2, 3],
      };

      const result = removeEmptyKeys(input);

      expect(result).toEqual({
        name: "test",
        items: [1, 2, 3],
      });
    });

    it("should remove empty objects", () => {
      const input = {
        name: "test",
        emptyObj: {},
        data: { value: 42 },
      };

      const result = removeEmptyKeys(input);

      expect(result).toEqual({
        name: "test",
        data: { value: 42 },
      });
    });

    it("should handle nested objects", () => {
      const input = {
        level1: {
          level2: {
            value: "keep",
            empty: [],
          },
          emptyNested: {},
        },
      };

      const result = removeEmptyKeys(input);

      expect(result).toEqual({
        level1: {
          level2: {
            value: "keep",
          },
        },
      });
    });

    it("should handle arrays with nested objects", () => {
      const input = {
        items: [
          { name: "item1", tags: [] },
          { name: "item2", tags: ["tag1"] },
        ],
      };

      const result = removeEmptyKeys(input);

      expect(result).toEqual({
        items: [
          { name: "item1" },
          { name: "item2", tags: ["tag1"] },
        ],
      });
    });

    it("should return primitives unchanged", () => {
      expect(removeEmptyKeys(42)).toBe(42);
      expect(removeEmptyKeys("text")).toBe("text");
      expect(removeEmptyKeys(true)).toBe(true);
      expect(removeEmptyKeys(null)).toBe(null);
    });

    it("should handle completely empty objects", () => {
      const result = removeEmptyKeys({});
      expect(result).toEqual({});
    });
  });

  describe("generateCSSShorthand", () => {
    it("should generate single value when all sides equal", () => {
      const values = { top: 10, right: 10, bottom: 10, left: 10 };

      expect(generateCSSShorthand(values)).toBe("10px");
    });

    it("should generate two values when top=bottom and right=left", () => {
      const values = { top: 10, right: 20, bottom: 10, left: 20 };

      expect(generateCSSShorthand(values)).toBe("10px 20px");
    });

    it("should generate three values when only right=left", () => {
      const values = { top: 10, right: 20, bottom: 30, left: 20 };

      expect(generateCSSShorthand(values)).toBe("10px 20px 30px");
    });

    it("should generate four values when all different", () => {
      const values = { top: 10, right: 20, bottom: 30, left: 40 };

      expect(generateCSSShorthand(values)).toBe("10px 20px 30px 40px");
    });

    it("should return undefined for all zeros by default", () => {
      const values = { top: 0, right: 0, bottom: 0, left: 0 };

      expect(generateCSSShorthand(values)).toBeUndefined();
    });

    it("should respect ignoreZero option", () => {
      const values = { top: 0, right: 0, bottom: 0, left: 0 };

      expect(generateCSSShorthand(values, { ignoreZero: false })).toBe("0px");
      expect(generateCSSShorthand(values, { ignoreZero: true })).toBeUndefined();
    });

    it("should respect custom suffix", () => {
      const values = { top: 10, right: 10, bottom: 10, left: 10 };

      expect(generateCSSShorthand(values, { suffix: "rem" })).toBe("10rem");
      expect(generateCSSShorthand(values, { suffix: "" })).toBe("10");
      expect(generateCSSShorthand(values, { suffix: "%" })).toBe("10%");
    });

    it("should handle decimal values", () => {
      const values = { top: 10.5, right: 20.5, bottom: 10.5, left: 20.5 };

      expect(generateCSSShorthand(values)).toBe("10.5px 20.5px");
    });
  });

  describe("isVisible", () => {
    it("should return true when visible is true", () => {
      expect(isVisible({ visible: true })).toBe(true);
    });

    it("should return false when visible is false", () => {
      expect(isVisible({ visible: false })).toBe(false);
    });

    it("should return true when visible is undefined", () => {
      expect(isVisible({})).toBe(true);
    });

    it("should return true for objects without visible property", () => {
      expect(isVisible({ someOtherProp: "value" } as { visible?: boolean })).toBe(true);
    });
  });

  describe("pixelRound", () => {
    it("should round to two decimal places", () => {
      expect(pixelRound(10.123)).toBe(10.12);
      expect(pixelRound(10.126)).toBe(10.13);
      expect(pixelRound(10.125)).toBe(10.13);
    });

    it("should handle integers", () => {
      expect(pixelRound(10)).toBe(10);
      expect(pixelRound(0)).toBe(0);
      expect(pixelRound(100)).toBe(100);
    });

    it("should handle negative numbers", () => {
      expect(pixelRound(-10.123)).toBe(-10.12);
      expect(pixelRound(-10.126)).toBe(-10.13);
    });

    it("should handle very small decimals", () => {
      expect(pixelRound(0.001)).toBe(0);
      expect(pixelRound(0.005)).toBe(0.01);
      expect(pixelRound(0.004)).toBe(0);
    });

    it("should throw TypeError for NaN", () => {
      expect(() => pixelRound(NaN)).toThrow(TypeError);
      expect(() => pixelRound(NaN)).toThrow("Input must be a valid number");
    });

    it("should handle zero", () => {
      expect(pixelRound(0)).toBe(0);
      expect(pixelRound(-0)).toBe(0);
    });
  });

  describe("generateVarId", () => {
    it("should generate ID with default prefix", () => {
      const id = generateVarId();

      expect(id).toMatch(/^var_[A-Z0-9]{6}$/);
    });

    it("should generate ID with custom prefix", () => {
      const id = generateVarId("test");

      expect(id).toMatch(/^test_[A-Z0-9]{6}$/);
    });

    it("should generate different IDs on consecutive calls", () => {
      const id1 = generateVarId();
      const id2 = generateVarId();
      const id3 = generateVarId();

      // Very unlikely to generate the same ID twice
      expect(id1).not.toBe(id2);
      expect(id2).not.toBe(id3);
      expect(id1).not.toBe(id3);
    });

    it("should generate IDs with exactly 6 characters after prefix", () => {
      const id = generateVarId("prefix");
      const suffix = id.split("_")[1];

      expect(suffix).toHaveLength(6);
    });

    it("should only use uppercase letters and digits", () => {
      const ids = Array.from({ length: 20 }, () => generateVarId());

      ids.forEach(id => {
        const suffix = id.split("_")[1];
        expect(suffix).toMatch(/^[A-Z0-9]+$/);
      });
    });

    it("should handle empty string prefix", () => {
      const id = generateVarId("");

      expect(id).toMatch(/^_[A-Z0-9]{6}$/);
    });
  });
});
