/**
 * @file Tests for Pattern Detector
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { detectComponentPatterns } from "./pattern-detector.js";
import type { FigmaContext } from "../../get-figma-context/types.js";
import { LLMService } from "~/services/llm-service.js";

// Mock LLMService
vi.mock("~/services/llm-service.js", () => ({
  LLMService: {
    fromEnvironment: vi.fn()
  }
}));

// Mock Logger to avoid console noise
vi.mock("~/utils/logger.js", () => ({
  Logger: {
    log: vi.fn(),
    error: vi.fn()
  }
}));

// Sample context with candidate nodes for pattern detection
const createSampleContext = (): FigmaContext => ({
  name: "Test Design",
  lastModified: "2025-10-14T00:00:00Z",
  thumbnailUrl: "https://example.com/test.jpg",
  nodes: [
    {
      id: "1:1",
      name: "Page 1",
      type: "CANVAS",
      children: [
        {
          id: "2:1",
          name: "Card 1",
          type: "FRAME",
          children: [
            { id: "3:1", name: "Title", type: "TEXT", text: "Product A" },
            { id: "3:2", name: "Description", type: "TEXT", text: "Description A" }
          ]
        },
        {
          id: "2:2",
          name: "Card 2",
          type: "FRAME",
          children: [
            { id: "3:3", name: "Title", type: "TEXT", text: "Product B" },
            { id: "3:4", name: "Description", type: "TEXT", text: "Description B" }
          ]
        },
        {
          id: "2:3",
          name: "Button 1",
          type: "FRAME",
          children: [
            { id: "3:5", name: "Label", type: "TEXT", text: "Click me" }
          ]
        }
      ]
    }
  ],
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
});

describe("detectComponentPatterns", () => {
  let mockCallLLM: ReturnType<typeof vi.fn>;
  let originalEnv: string | undefined;

  beforeEach(() => {
    // Store original env value
    originalEnv = process.env.GOOGLE_CLOUD_PROJECT;

    // Mock LLM service
    mockCallLLM = vi.fn();
    vi.mocked(LLMService.fromEnvironment).mockReturnValue({
      callLLM: mockCallLLM
    } as any);
  });

  afterEach(() => {
    // Restore original env
    if (originalEnv !== undefined) {
      process.env.GOOGLE_CLOUD_PROJECT = originalEnv;
    } else {
      delete process.env.GOOGLE_CLOUD_PROJECT;
    }

    vi.clearAllMocks();
  });

  it("should detect patterns when LLM returns valid suggestions", async () => {
    process.env.GOOGLE_CLOUD_PROJECT = "test-project";

    mockCallLLM.mockResolvedValue({
      success: true,
      data: {
        suggestions: [
          {
            componentName: "productCard",
            description: "Carte produit avec titre et description",
            rootNodeId: "2:1",
            rootNodeName: "Card 1"
          },
          {
            componentName: "productCard",
            description: "Carte produit avec titre et description",
            rootNodeId: "2:2",
            rootNodeName: "Card 2"
          }
        ]
      }
    });

    const context = createSampleContext();
    const result = await detectComponentPatterns(context);

    expect(result).toHaveLength(1); // Grouped by componentName
    expect(result[0]).toMatchObject({
      componentName: "productCard",
      description: "Carte produit avec titre et description",
      rootNodeId: "2:1",
      rootNodeName: "Card 1"
    });
    expect(result[0].possibleInstances).toHaveLength(2);
    expect(result[0].usableNodes.length).toBeGreaterThan(0);
  });

  it("should skip detection when GOOGLE_CLOUD_PROJECT is not configured", async () => {
    delete process.env.GOOGLE_CLOUD_PROJECT;

    const context = createSampleContext();
    const result = await detectComponentPatterns(context);

    expect(result).toEqual([]);
    expect(mockCallLLM).not.toHaveBeenCalled();
  });

  it("should skip detection when there are not enough candidate nodes", async () => {
    process.env.GOOGLE_CLOUD_PROJECT = "test-project";

    // Context with only one container node (not enough for pattern detection)
    const emptyContext: FigmaContext = {
      name: "Empty Design",
      lastModified: "2025-10-14T00:00:00Z",
      thumbnailUrl: "https://example.com/empty.jpg",
      nodes: [
        {
          id: "1:1",
          name: "Page 1",
          type: "CANVAS",
          children: [
            // Just text nodes, no container nodes to analyze
            { id: "3:1", name: "Text", type: "TEXT", text: "Hello" }
          ]
        }
      ],
      components: {},
      componentSets: {},
      globalVars: {
        designSystem: { colors: {}, text: {}, strokes: {}, layout: {} },
        localStyles: { colors: {}, text: {}, strokes: {}, layout: {} },
        images: {}
      }
    };

    const result = await detectComponentPatterns(emptyContext);

    expect(result).toEqual([]);
    expect(mockCallLLM).not.toHaveBeenCalled();
  });

  it("should return empty array when LLM fails", async () => {
    process.env.GOOGLE_CLOUD_PROJECT = "test-project";

    mockCallLLM.mockResolvedValue({
      success: false,
      error: "LLM API error"
    });

    const context = createSampleContext();
    const result = await detectComponentPatterns(context);

    expect(result).toEqual([]);
  });

  it("should handle exceptions gracefully", async () => {
    process.env.GOOGLE_CLOUD_PROJECT = "test-project";

    mockCallLLM.mockRejectedValue(new Error("Network timeout"));

    const context = createSampleContext();
    const result = await detectComponentPatterns(context);

    expect(result).toEqual([]);
  });

  it("should group suggestions by componentName correctly", async () => {
    process.env.GOOGLE_CLOUD_PROJECT = "test-project";

    mockCallLLM.mockResolvedValue({
      success: true,
      data: {
        suggestions: [
          {
            componentName: "productCard",
            description: "Carte produit",
            rootNodeId: "2:1",
            rootNodeName: "Card 1"
          },
          {
            componentName: "productCard",
            description: "Carte produit",
            rootNodeId: "2:2",
            rootNodeName: "Card 2"
          },
          {
            componentName: "actionButton",
            description: "Bouton d'action",
            rootNodeId: "2:3",
            rootNodeName: "Button 1"
          }
        ]
      }
    });

    const context = createSampleContext();
    const result = await detectComponentPatterns(context);

    expect(result).toHaveLength(2); // 2 unique component names

    const productCard = result.find(r => r.componentName === "productCard");
    expect(productCard?.possibleInstances).toHaveLength(2);

    const actionButton = result.find(r => r.componentName === "actionButton");
    expect(actionButton?.possibleInstances).toHaveLength(1);
  });

  it("should exclude existing components from analysis", async () => {
    process.env.GOOGLE_CLOUD_PROJECT = "test-project";

    const contextWithComponents: FigmaContext = {
      ...createSampleContext(),
      nodes: [
        {
          id: "1:1",
          name: "Page 1",
          type: "CANVAS",
          children: [
            {
              id: "2:1",
              name: "Existing Component",
              type: "COMPONENT",
              children: [
                { id: "3:1", name: "Text", type: "TEXT", text: "Component" }
              ]
            },
            {
              id: "2:2",
              name: "Component Instance",
              type: "INSTANCE",
              componentId: "2:1"
            }
          ]
        }
      ]
    };

    mockCallLLM.mockResolvedValue({
      success: true,
      data: {
        suggestions: []
      }
    });

    const result = await detectComponentPatterns(contextWithComponents);

    expect(result).toEqual([]);
    expect(mockCallLLM).not.toHaveBeenCalled(); // Not enough candidate nodes after filtering
  });
});
