import { describe, it, expect } from "vitest";
import { checkLayerNaming } from "./check-layer-naming.js";
import type { FigmaContext } from "../../get-figma-context/types.js";

describe("checkLayerNaming", () => {
  it("should detect default Figma layer names", () => {
    const context: FigmaContext = {
      name: "Test File",
      lastModified: "2025-01-01",
      thumbnailUrl: "",
      nodes: [
        {
          id: "1:1",
          name: "Frame 123",
          type: "FRAME",
          children: []
        },
        {
          id: "1:2",
          name: "Rectangle 45",
          type: "RECTANGLE"
        },
        {
          id: "1:3",
          name: "Group 67",
          type: "GROUP",
          children: []
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

    const results = checkLayerNaming(context);

    expect(results).toHaveLength(3);
    expect(results[0].ruleIds).toContain(2);
    expect(results[0].nodeName).toBe("Frame 123");
    expect(results[1].nodeName).toBe("Rectangle 45");
    expect(results[2].nodeName).toBe("Group 67");
  });

  it("should not flag properly named layers", () => {
    const context: FigmaContext = {
      name: "Test File",
      lastModified: "2025-01-01",
      thumbnailUrl: "",
      nodes: [
        {
          id: "1:1",
          name: "header-container",
          type: "FRAME",
          children: []
        },
        {
          id: "1:2",
          name: "background-shape",
          type: "RECTANGLE"
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

    const results = checkLayerNaming(context);

    expect(results).toHaveLength(0);
  });

  it("should handle empty nodes array", () => {
    const context: FigmaContext = {
      name: "Test File",
      lastModified: "2025-01-01",
      thumbnailUrl: "",
      nodes: [],
      components: {},
      componentSets: {},
      globalVars: {
        designSystem: { text: {}, strokes: {}, layout: {}, colors: {} },
        localStyles: { text: {}, strokes: {}, layout: {}, colors: {} },
        images: {}
      }
    };

    const results = checkLayerNaming(context);

    expect(results).toHaveLength(0);
  });

  it("should detect nested default names", () => {
    const context: FigmaContext = {
      name: "Test File",
      lastModified: "2025-01-01",
      thumbnailUrl: "",
      nodes: [
        {
          id: "1:1",
          name: "container",
          type: "FRAME",
          children: [
            {
              id: "1:2",
              name: "Ellipse 99",
              type: "ELLIPSE"
            }
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

    const results = checkLayerNaming(context);

    expect(results).toHaveLength(1);
    expect(results[0].nodeName).toBe("Ellipse 99");
  });
});
