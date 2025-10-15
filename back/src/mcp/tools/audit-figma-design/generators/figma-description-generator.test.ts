/**
 * @file Tests for Figma Description Generator
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { FigmaDescriptionGenerator } from "./figma-description-generator.js";
import type { FigmaContext } from "../../get-figma-context/types.js";
import { LLMService } from "~/services/llm-service.js";

// Sample context basé sur les données réelles du projet
const sampleContext: FigmaContext = {
  name: "Portfolio BadVersion",
  lastModified: "2025-10-02T12:46:33Z",
  thumbnailUrl: "https://example.com/thumbnail.jpg",
  nodes: [
    {
      id: "0:1",
      name: "Page 1",
      type: "CANVAS",
      children: [
        {
          id: "0:3",
          name: "Home",
          type: "FRAME",
          children: [
            {
              id: "2:3",
              name: "John Doe",
              type: "TEXT",
              text: "John Doe"
            },
            {
              id: "2:31",
              name: "Hello, I'm John,",
              type: "TEXT",
              text: "Hello, I'm John,"
            },
            {
              id: "2:32",
              name: "Product Designer",
              type: "TEXT",
              text: "Product Designer"
            }
          ]
        }
      ]
    }
  ],
  components: {
    "2:21": {
      id: "2:21",
      key: "test-key",
      name: "behance-2 1",
      description: ""
    }
  },
  componentSets: {},
  globalVars: {
    designSystem: {
      colors: {
        "2:109": { name: "Light Yellow", hexValue: "#FBF8CC" },
        "2:106": { name: "Dark Blue", hexValue: "#03045E" },
        "2:108": { name: "Yellow", hexValue: "#F5EE84" }
      },
      text: {
        "126:18": {
          name: "Texte qui super styley",
          value: {
            fontFamily: "Poppins",
            fontWeight: 600,
            fontSize: 24,
            lineHeight: "1.5em"
          }
        }
      },
      strokes: {},
      layout: {}
    },
    localStyles: {
      text: {},
      strokes: {},
      layout: {},
      colors: {}
    },
    images: {
      "i1": {
        type: "IMAGE",
        imageRef: "test-ref",
        scaleMode: "FILL"
      }
    }
  }
};

describe("FigmaDescriptionGenerator", () => {
  let generator: FigmaDescriptionGenerator;
  let mockCallLLM: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Mock du service LLM avec Vitest
    mockCallLLM = vi.fn();
    const mockLLMService = {
      callLLM: mockCallLLM
    } as unknown as LLMService;

    generator = new FigmaDescriptionGenerator(mockLLMService);
  });

  describe("generateDescription", () => {
    it("should generate a description when LLM succeeds", async () => {
      const mockDescription = "**Portfolio BadVersion**\n\nCeci est un portfolio de designer avec des sections principales...";

      mockCallLLM.mockResolvedValue({
        success: true,
        data: { description: mockDescription }
      });

      const result = await generator.generateDescription(sampleContext);

      expect(result.success).toBe(true);
      expect(result.description).toBe(mockDescription);
      expect(mockCallLLM).toHaveBeenCalledTimes(1);
    });

    it("should return error when LLM fails", async () => {
      mockCallLLM.mockResolvedValue({
        success: false,
        error: "LLM API error"
      });

      const result = await generator.generateDescription(sampleContext);

      expect(result.success).toBe(false);
      expect(result.error).toContain("LLM API error");
    });

    it("should handle exceptions gracefully", async () => {
      mockCallLLM.mockRejectedValue(new Error("Network timeout"));

      const result = await generator.generateDescription(sampleContext);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Network timeout");
    });
  });

  describe("analyzeDesignStructure", () => {
    it("should correctly analyze design structure", async () => {
      // On force l'appel du LLM pour déclencher l'analyse interne
      mockCallLLM.mockResolvedValue({
        success: true,
        data: { description: "test" }
      });

      await generator.generateDescription(sampleContext);

      // Vérification que le prompt contient les infos d'analyse
      const callArgs = mockCallLLM.mock.calls[0][0] as string;

      expect(callArgs).toContain("Nombre total d'éléments");
      expect(callArgs).toContain("Types d'éléments principaux");
      expect(callArgs).toContain("Composants détectés : 1"); // 1 composant dans notre sample
      expect(callArgs).toContain("Couleurs : 3 couleurs définies"); // 3 couleurs
      expect(callArgs).toContain("Styles de texte : 1 styles"); // 1 style de texte
      expect(callArgs).toContain("Images : 1 images"); // 1 image
    });

    it("should extract main texts from nodes", async () => {
      mockCallLLM.mockResolvedValue({
        success: true,
        data: { description: "test" }
      });

      await generator.generateDescription(sampleContext);

      const callArgs = mockCallLLM.mock.calls[0][0] as string;

      // Vérifie que les textes significatifs sont extraits
      expect(callArgs).toContain("John Doe");
      expect(callArgs).toContain("Product Designer");
    });

    it("should handle empty context gracefully", async () => {
      const emptyContext: FigmaContext = {
        name: "Empty Design",
        lastModified: "2025-10-14T00:00:00Z",
        thumbnailUrl: "https://example.com/empty.jpg",
        nodes: [],
        components: {},
        componentSets: {},
        globalVars: {
          designSystem: {
            colors: {},
            text: {},
            strokes: {},
            layout: {}
          },
          localStyles: {
            colors: {},
            text: {},
            strokes: {},
            layout: {}
          },
          images: {}
        }
      };

      mockCallLLM.mockResolvedValue({
        success: true,
        data: { description: "Empty design" }
      });

      const result = await generator.generateDescription(emptyContext);

      expect(result.success).toBe(true);

      const callArgs = mockCallLLM.mock.calls[0][0] as string;
      expect(callArgs).toContain("Composants détectés : 0");
      expect(callArgs).toContain("Couleurs : 0 couleurs");
    });
  });

  describe("generateFallbackDescription", () => {
    it("should generate a fallback description without AI", () => {
      const fallback = FigmaDescriptionGenerator.generateFallbackDescription(sampleContext);

      expect(fallback).toContain("Portfolio BadVersion");
      expect(fallback).toContain("1 composants"); // 1 composant
      expect(fallback).toContain("3 couleurs"); // 3 couleurs
    });

    it("should handle context without components or colors", () => {
      const minimalContext: FigmaContext = {
        name: "Minimal Design",
        lastModified: "2025-10-14T00:00:00Z",
        thumbnailUrl: "https://example.com/minimal.jpg",
        nodes: [],
        components: {},
        componentSets: {},
        globalVars: {
          designSystem: {
            colors: {},
            text: {},
            strokes: {},
            layout: {}
          },
          localStyles: {
            colors: {},
            text: {},
            strokes: {},
            layout: {}
          },
          images: {}
        }
      };

      const fallback = FigmaDescriptionGenerator.generateFallbackDescription(minimalContext);

      expect(fallback).toContain("Minimal Design");
      expect(fallback).toContain("0 composants");
      expect(fallback).toContain("0 couleurs");
    });
  });
});
