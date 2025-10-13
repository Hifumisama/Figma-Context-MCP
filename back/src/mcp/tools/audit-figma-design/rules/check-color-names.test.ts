import { describe, it, expect, vi, beforeEach } from "vitest";
import { checkColorNames } from "./check-color-names.js";
import type { FigmaContext } from "../../get-figma-context/types.js";
import { LLMService } from "../../../../services/llm-service.js";

// Mock the LLMService
vi.mock("../../../../services/llm-service.js", () => ({
  LLMService: {
    fromEnvironment: vi.fn()
  }
}));

describe("checkColorNames", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should detect literal color names and suggest semantic alternatives", async () => {
    const mockCallLLM = vi.fn().mockResolvedValue({
      success: true,
      data: [
        {
          literal_name: "Blue",
          semantic_suggestion: "primary"
        },
        {
          literal_name: "Red",
          semantic_suggestion: "error"
        }
      ]
    });

    vi.mocked(LLMService.fromEnvironment).mockReturnValue({
      callLLM: mockCallLLM
    } as any);

    // Enable AI rules for this test
    process.env.ENABLE_AI_RULES = "true";

    const context: FigmaContext = {
      name: "Test File",
      lastModified: "2025-01-01",
      thumbnailUrl: "",
      nodes: [],
      components: {},
      componentSets: {},
      globalVars: {
        designSystem: {
          text: {},
          strokes: {},
          layout: {},
          colors: {
            "2:108": { name: "Blue", hexValue: "#0000FF" },
            "2:109": { name: "Red", hexValue: "#FF0000" }
          }
        },
        localStyles: { text: {}, strokes: {}, layout: {}, colors: {} },
        images: {}
      }
    };

    const results = await checkColorNames(context);

    expect(results).toHaveLength(2);
    expect(results[0].ruleIds).toContain(9);
    expect(results[0].nodeName).toContain("Blue");
    expect(results[0].moreInfos?.["9"]).toContain("primary");
    expect(results[1].nodeName).toContain("Red");
    expect(results[1].moreInfos?.["9"]).toContain("error");
  });

  it("should not flag semantic color names", async () => {
    const mockCallLLM = vi.fn().mockResolvedValue({
      success: true,
      data: [] // Empty array means no literal names found
    });

    vi.mocked(LLMService.fromEnvironment).mockReturnValue({
      callLLM: mockCallLLM
    } as any);

    process.env.ENABLE_AI_RULES = "true";

    const context: FigmaContext = {
      name: "Test File",
      lastModified: "2025-01-01",
      thumbnailUrl: "",
      nodes: [],
      components: {},
      componentSets: {},
      globalVars: {
        designSystem: {
          text: {},
          strokes: {},
          layout: {},
          colors: {
            "2:108": { name: "primary-500", hexValue: "#0000FF" },
            "2:109": { name: "error", hexValue: "#FF0000" }
          }
        },
        localStyles: { text: {}, strokes: {}, layout: {}, colors: {} },
        images: {}
      }
    };

    const results = await checkColorNames(context);

    expect(results).toHaveLength(0);
  });

  it("should return empty array when no color styles are found", async () => {
    const context: FigmaContext = {
      name: "Test File",
      lastModified: "2025-01-01",
      thumbnailUrl: "",
      nodes: [],
      components: {},
      componentSets: {},
      globalVars: {
        designSystem: {
          text: {},
          strokes: {},
          layout: {},
          colors: {}
        },
        localStyles: { text: {}, strokes: {}, layout: {}, colors: {} },
        images: {}
      }
    };

    const results = await checkColorNames(context);

    expect(results).toHaveLength(0);
  });

  it("should return empty array when AI rules are disabled", async () => {
    process.env.ENABLE_AI_RULES = "false";
    process.env.NODE_ENV = "production";

    const context: FigmaContext = {
      name: "Test File",
      lastModified: "2025-01-01",
      thumbnailUrl: "",
      nodes: [],
      components: {},
      componentSets: {},
      globalVars: {
        designSystem: {
          text: {},
          strokes: {},
          layout: {},
          colors: {
            "2:108": { name: "Blue", hexValue: "#0000FF" }
          }
        },
        localStyles: { text: {}, strokes: {}, layout: {}, colors: {} },
        images: {}
      }
    };

    const results = await checkColorNames(context);

    expect(results).toHaveLength(0);
    expect(LLMService.fromEnvironment).not.toHaveBeenCalled();
  });

  it("should handle LLM errors gracefully", async () => {
    const mockCallLLM = vi.fn().mockResolvedValue({
      success: false,
      error: "LLM service unavailable"
    });

    vi.mocked(LLMService.fromEnvironment).mockReturnValue({
      callLLM: mockCallLLM
    } as any);

    process.env.ENABLE_AI_RULES = "true";

    const context: FigmaContext = {
      name: "Test File",
      lastModified: "2025-01-01",
      thumbnailUrl: "",
      nodes: [],
      components: {},
      componentSets: {},
      globalVars: {
        designSystem: {
          text: {},
          strokes: {},
          layout: {},
          colors: {
            "2:108": { name: "Blue", hexValue: "#0000FF" }
          }
        },
        localStyles: { text: {}, strokes: {}, layout: {}, colors: {} },
        images: {}
      }
    };

    const results = await checkColorNames(context);

    expect(results).toHaveLength(1);
    expect(results[0].nodeName).toBe("Color Styles");
    expect(results[0].moreInfos?.["9"]).toContain("Erreur");
  });

  it("should handle exceptions during analysis", async () => {
    vi.mocked(LLMService.fromEnvironment).mockImplementation(() => {
      throw new Error("Configuration error");
    });

    process.env.ENABLE_AI_RULES = "true";

    const context: FigmaContext = {
      name: "Test File",
      lastModified: "2025-01-01",
      thumbnailUrl: "",
      nodes: [],
      components: {},
      componentSets: {},
      globalVars: {
        designSystem: {
          text: {},
          strokes: {},
          layout: {},
          colors: {
            "2:108": { name: "Blue", hexValue: "#0000FF" }
          }
        },
        localStyles: { text: {}, strokes: {}, layout: {}, colors: {} },
        images: {}
      }
    };

    const results = await checkColorNames(context);

    expect(results).toHaveLength(1);
    expect(results[0].nodeName).toBe("Color Styles");
    expect(results[0].moreInfos?.["9"]).toContain("Configuration error");
  });

  it("should filter out colors with name 'none'", async () => {
    const mockCallLLM = vi.fn().mockResolvedValue({
      success: true,
      data: [
        {
          literal_name: "Blue",
          semantic_suggestion: "primary"
        }
      ]
    });

    vi.mocked(LLMService.fromEnvironment).mockReturnValue({
      callLLM: mockCallLLM
    } as any);

    process.env.ENABLE_AI_RULES = "true";

    const context: FigmaContext = {
      name: "Test File",
      lastModified: "2025-01-01",
      thumbnailUrl: "",
      nodes: [],
      components: {},
      componentSets: {},
      globalVars: {
        designSystem: {
          text: {},
          strokes: {},
          layout: {},
          colors: {
            "2:108": { name: "Blue", hexValue: "#0000FF" },
            "2:109": { name: "none", hexValue: "#000000" }
          }
        },
        localStyles: { text: {}, strokes: {}, layout: {}, colors: {} },
        images: {}
      }
    };

    const results = await checkColorNames(context);

    // Verify that the LLM was called only with "Blue", not "none"
    expect(mockCallLLM).toHaveBeenCalled();
    const prompt = mockCallLLM.mock.calls[0][0] as string;
    expect(prompt).toContain("Blue");
    expect(prompt).not.toContain("- none");
  });

  it("should enable AI rules in development environment even without ENABLE_AI_RULES", async () => {
    const mockCallLLM = vi.fn().mockResolvedValue({
      success: true,
      data: [
        {
          literal_name: "Green",
          semantic_suggestion: "success"
        }
      ]
    });

    vi.mocked(LLMService.fromEnvironment).mockReturnValue({
      callLLM: mockCallLLM
    } as any);

    process.env.ENABLE_AI_RULES = "false";
    process.env.NODE_ENV = "development";

    const context: FigmaContext = {
      name: "Test File",
      lastModified: "2025-01-01",
      thumbnailUrl: "",
      nodes: [],
      components: {},
      componentSets: {},
      globalVars: {
        designSystem: {
          text: {},
          strokes: {},
          layout: {},
          colors: {
            "2:110": { name: "Green", hexValue: "#00FF00" }
          }
        },
        localStyles: { text: {}, strokes: {}, layout: {}, colors: {} },
        images: {}
      }
    };

    const results = await checkColorNames(context);

    expect(results).toHaveLength(1);
    expect(results[0].nodeName).toContain("Green");
    expect(results[0].moreInfos?.["9"]).toContain("success");
    expect(LLMService.fromEnvironment).toHaveBeenCalled();
  });

  it("should handle mix of literal and semantic color names", async () => {
    const mockCallLLM = vi.fn().mockResolvedValue({
      success: true,
      data: [
        {
          literal_name: "Blue",
          semantic_suggestion: "primary"
        },
        {
          literal_name: "Red-500",
          semantic_suggestion: "error-medium"
        }
      ]
    });

    vi.mocked(LLMService.fromEnvironment).mockReturnValue({
      callLLM: mockCallLLM
    } as any);

    process.env.ENABLE_AI_RULES = "true";

    const context: FigmaContext = {
      name: "Test File",
      lastModified: "2025-01-01",
      thumbnailUrl: "",
      nodes: [],
      components: {},
      componentSets: {},
      globalVars: {
        designSystem: {
          text: {},
          strokes: {},
          layout: {},
          colors: {
            "2:108": { name: "Blue", hexValue: "#0000FF" },
            "2:109": { name: "primary-background", hexValue: "#F0F0F0" },
            "2:110": { name: "Red-500", hexValue: "#FF0000" },
            "2:111": { name: "success-color", hexValue: "#00FF00" }
          }
        },
        localStyles: { text: {}, strokes: {}, layout: {}, colors: {} },
        images: {}
      }
    };

    const results = await checkColorNames(context);

    // Should only return results for the 2 literal names
    expect(results).toHaveLength(2);
    expect(results[0].nodeName).toContain("Blue");
    expect(results[1].nodeName).toContain("Red-500");
  });

  it("should fallback to DOCUMENT nodeId when color ID is not found", async () => {
    const mockCallLLM = vi.fn().mockResolvedValue({
      success: true,
      data: [
        {
          literal_name: "NonExistentColor",
          semantic_suggestion: "unknown"
        }
      ]
    });

    vi.mocked(LLMService.fromEnvironment).mockReturnValue({
      callLLM: mockCallLLM
    } as any);

    process.env.ENABLE_AI_RULES = "true";

    const context: FigmaContext = {
      name: "Test File",
      lastModified: "2025-01-01",
      thumbnailUrl: "",
      nodes: [],
      components: {},
      componentSets: {},
      globalVars: {
        designSystem: {
          text: {},
          strokes: {},
          layout: {},
          colors: {
            "2:108": { name: "Blue", hexValue: "#0000FF" }
          }
        },
        localStyles: { text: {}, strokes: {}, layout: {}, colors: {} },
        images: {}
      }
    };

    const results = await checkColorNames(context);

    // The LLM returned a color name that doesn't exist in our map
    // So it should fallback to "DOCUMENT" for nodeId
    expect(results).toHaveLength(1);
    expect(results[0].nodeId).toBe("DOCUMENT");
    expect(results[0].nodeName).toContain("NonExistentColor");
  });
});
