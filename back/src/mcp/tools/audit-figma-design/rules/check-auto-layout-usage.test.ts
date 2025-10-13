import { describe, it, expect } from "vitest";
import { checkAutoLayoutUsage } from "./check-auto-layout-usage.js";
import type { FigmaContext } from "../../get-figma-context/types.js";

describe("checkAutoLayoutUsage", () => {
  it("should detect containers with multiple children without auto layout", () => {
    const context: FigmaContext = {
      name: "Test File",
      lastModified: "2025-01-01",
      thumbnailUrl: "",
      nodes: [
        {
          id: "1:1",
          name: "Container Without Auto Layout",
          type: "FRAME",
          children: [
            { id: "1:2", name: "Child 1", type: "TEXT", text: "Hello" },
            { id: "1:3", name: "Child 2", type: "TEXT", text: "World" }
          ]
        }
      ],
      components: {},
      componentSets: {},
      globalVars: {
        designSystem: { text: {}, strokes: {}, layout: {}, colors: {} },
        localStyles: { text: {}, strokes: {}, layout: {}, colors: {} },
        images: {}
      }
    };

    const results = checkAutoLayoutUsage(context);

    expect(results).toHaveLength(1);
    expect(results[0].ruleIds).toContain(1);
    expect(results[0].nodeName).toBe("Container Without Auto Layout");
  });

  it("should not flag containers with auto layout", () => {
    const context: FigmaContext = {
      name: "Test File",
      lastModified: "2025-01-01",
      thumbnailUrl: "",
      nodes: [
        {
          id: "1:1",
          name: "Container With Auto Layout",
          type: "FRAME",
          layout: "l1",
          children: [
            { id: "1:2", name: "Child 1", type: "TEXT", text: "Hello" },
            { id: "1:3", name: "Child 2", type: "TEXT", text: "World" }
          ]
        }
      ],
      components: {},
      componentSets: {},
      globalVars: {
        designSystem: { text: {}, strokes: {}, layout: {}, colors: {} },
        localStyles: {
          text: {},
          strokes: {},
          layout: {
            l1: {
              mode: "column" // Auto layout mode
            }
          },
          colors: {}
        },
        images: {}
      }
    };

    const results = checkAutoLayoutUsage(context);

    expect(results).toHaveLength(0);
  });

  it("should not flag containers with only one child", () => {
    const context: FigmaContext = {
      name: "Test File",
      lastModified: "2025-01-01",
      thumbnailUrl: "",
      nodes: [
        {
          id: "1:1",
          name: "Single Child Container",
          type: "FRAME",
          children: [
            { id: "1:2", name: "Only Child", type: "TEXT", text: "Alone" }
          ]
        }
      ],
      components: {},
      componentSets: {},
      globalVars: {
        designSystem: { text: {}, strokes: {}, layout: {}, colors: {} },
        localStyles: { text: {}, strokes: {}, layout: {}, colors: {} },
        images: {}
      }
    };

    const results = checkAutoLayoutUsage(context);

    expect(results).toHaveLength(0);
  });
});
