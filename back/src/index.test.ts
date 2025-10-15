import { describe, it, expect, vi } from "vitest";

// Mock cli.ts to prevent side effects during import
vi.mock("./cli.js", () => ({
  startServer: vi.fn(),
}));

import * as mainExports from "./index.js";

describe("index.ts - Main exports", () => {
  describe("Server functions", () => {
    it("should export createServer function", () => {
      expect(mainExports.createServer).toBeDefined();
      expect(typeof mainExports.createServer).toBe("function");
    });

    it("should export getServerConfig function", () => {
      expect(mainExports.getServerConfig).toBeDefined();
      expect(typeof mainExports.getServerConfig).toBe("function");
    });

    it("should export startServer function", () => {
      expect(mainExports.startServer).toBeDefined();
      expect(typeof mainExports.startServer).toBe("function");
    });
  });

  describe("Services", () => {
    it("should export LLMService class", () => {
      expect(mainExports.LLMService).toBeDefined();
      expect(typeof mainExports.LLMService).toBe("function"); // Classes are functions in JS
    });
  });

  describe("Extractor functions", () => {
    it("should export extractFromDesign function", () => {
      expect(mainExports.extractFromDesign).toBeDefined();
      expect(typeof mainExports.extractFromDesign).toBe("function");
    });

    it("should export simplifyRawFigmaObject function", () => {
      expect(mainExports.simplifyRawFigmaObject).toBeDefined();
      expect(typeof mainExports.simplifyRawFigmaObject).toBe("function");
    });
  });

  describe("Individual extractors", () => {
    it("should export layoutExtractor", () => {
      expect(mainExports.layoutExtractor).toBeDefined();
      expect(typeof mainExports.layoutExtractor).toBe("function");
    });

    it("should export textExtractor", () => {
      expect(mainExports.textExtractor).toBeDefined();
      expect(typeof mainExports.textExtractor).toBe("function");
    });

    it("should export visualsExtractor", () => {
      expect(mainExports.visualsExtractor).toBeDefined();
      expect(typeof mainExports.visualsExtractor).toBe("function");
    });

    it("should export componentExtractor", () => {
      expect(mainExports.componentExtractor).toBeDefined();
      expect(typeof mainExports.componentExtractor).toBe("function");
    });
  });

  describe("Extractor combinations", () => {
    it("should export allExtractors array", () => {
      expect(mainExports.allExtractors).toBeDefined();
      expect(Array.isArray(mainExports.allExtractors)).toBe(true);
      expect(mainExports.allExtractors.length).toBeGreaterThan(0);
    });

    it("should export layoutAndText array", () => {
      expect(mainExports.layoutAndText).toBeDefined();
      expect(Array.isArray(mainExports.layoutAndText)).toBe(true);
      expect(mainExports.layoutAndText.length).toBe(2);
    });

    it("should export contentOnly array", () => {
      expect(mainExports.contentOnly).toBeDefined();
      expect(Array.isArray(mainExports.contentOnly)).toBe(true);
      expect(mainExports.contentOnly.length).toBe(1);
    });

    it("should export visualsOnly array", () => {
      expect(mainExports.visualsOnly).toBeDefined();
      expect(Array.isArray(mainExports.visualsOnly)).toBe(true);
      expect(mainExports.visualsOnly.length).toBe(1);
    });

    it("should export layoutOnly array", () => {
      expect(mainExports.layoutOnly).toBeDefined();
      expect(Array.isArray(mainExports.layoutOnly)).toBe(true);
      expect(mainExports.layoutOnly.length).toBe(1);
    });
  });

  describe("Type exports validation", () => {
    it("should have all expected named exports", () => {
      const expectedExports = [
        // Server functions
        "createServer",
        "getServerConfig",
        "startServer",
        // Services
        "LLMService",
        // Extractor functions
        "extractFromDesign",
        "simplifyRawFigmaObject",
        // Individual extractors
        "layoutExtractor",
        "textExtractor",
        "visualsExtractor",
        "componentExtractor",
        // Extractor combinations
        "allExtractors",
        "layoutAndText",
        "contentOnly",
        "visualsOnly",
        "layoutOnly",
      ];

      expectedExports.forEach((exportName) => {
        expect(mainExports).toHaveProperty(exportName);
      });
    });

    it("should export correct number of items", () => {
      // Count all named exports (excluding type-only exports)
      const namedExports = Object.keys(mainExports);
      expect(namedExports.length).toBeGreaterThanOrEqual(15);
    });
  });

  describe("Extractor combinations consistency", () => {
    it("should have allExtractors containing all individual extractors", () => {
      const { allExtractors, layoutExtractor, textExtractor, visualsExtractor, componentExtractor } = mainExports;

      // Check that individual extractors are included in allExtractors
      expect(allExtractors).toContain(layoutExtractor);
      expect(allExtractors).toContain(textExtractor);
      expect(allExtractors).toContain(visualsExtractor);
      expect(allExtractors).toContain(componentExtractor);
    });

    it("should have layoutAndText containing correct extractors", () => {
      const { layoutAndText, layoutExtractor, textExtractor } = mainExports;

      expect(layoutAndText).toContain(layoutExtractor);
      expect(layoutAndText).toContain(textExtractor);
    });

    it("should have contentOnly containing only textExtractor", () => {
      const { contentOnly, textExtractor } = mainExports;

      expect(contentOnly).toContain(textExtractor);
    });

    it("should have visualsOnly containing only visualsExtractor", () => {
      const { visualsOnly, visualsExtractor } = mainExports;

      expect(visualsOnly).toContain(visualsExtractor);
    });

    it("should have layoutOnly containing only layoutExtractor", () => {
      const { layoutOnly, layoutExtractor } = mainExports;

      expect(layoutOnly).toContain(layoutExtractor);
    });
  });

  describe("Function signatures", () => {
    it("should have extractFromDesign with correct arity", () => {
      // extractFromDesign expects at least 2 parameters (nodes, extractors)
      expect(mainExports.extractFromDesign.length).toBeGreaterThanOrEqual(2);
    });

    it("should have simplifyRawFigmaObject with correct arity", () => {
      // simplifyRawFigmaObject expects at least 2 parameters (apiResponse, extractors)
      expect(mainExports.simplifyRawFigmaObject.length).toBeGreaterThanOrEqual(2);
    });

    it("should have all extractors with same signature", () => {
      const { layoutExtractor, textExtractor, visualsExtractor, componentExtractor } = mainExports;

      // All extractors should accept 3 parameters (node, result, context)
      expect(layoutExtractor.length).toBe(3);
      expect(textExtractor.length).toBe(3);
      expect(visualsExtractor.length).toBe(3);
      expect(componentExtractor.length).toBe(3);
    });
  });

  describe("Service instantiation", () => {
    it("should be able to instantiate LLMService", () => {
      const config = {
        provider: "google" as const,
        projectId: "test-project",
        location: "us-central1",
        model: "gemini-2.0-flash-exp",
      };

      expect(() => new mainExports.LLMService(config)).not.toThrow();
    });
  });
});
