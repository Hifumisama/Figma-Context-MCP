import { describe, it, expect } from "vitest";
import { checkComponentDescriptions } from "./check-component-descriptions.js";
import type { FigmaContext } from "../../get-figma-context/types.js";

describe("checkComponentDescriptions", () => {
  it("should detect components without descriptions", () => {
    const context: FigmaContext = {
      name: "Test File",
      lastModified: "2025-01-01",
      thumbnailUrl: "",
      nodes: [],
      components: {
        "2:21": {
          id: "2:21",
          key: "abc123",
          name: "Button Primary",
          description: ""
        }
      },
      componentSets: {},
      globalVars: {
        designSystem: { text: {}, strokes: {}, layout: {}, colors: {} },
        localStyles: { text: {}, strokes: {}, layout: {}, colors: {} },
        images: {}
      }
    };

    const results = checkComponentDescriptions(context);

    expect(results).toHaveLength(1);
    expect(results[0].ruleIds).toContain(10);
    expect(results[0].nodeName).toBe("Button Primary");
  });

  it("should not flag components with descriptions", () => {
    const context: FigmaContext = {
      name: "Test File",
      lastModified: "2025-01-01",
      thumbnailUrl: "",
      nodes: [],
      components: {
        "2:21": {
          id: "2:21",
          key: "abc123",
          name: "Button Primary",
          description: "Primary action button with hover state"
        }
      },
      componentSets: {},
      globalVars: {
        designSystem: { text: {}, strokes: {}, layout: {}, colors: {} },
        localStyles: { text: {}, strokes: {}, layout: {}, colors: {} },
        images: {}
      }
    };

    const results = checkComponentDescriptions(context);

    expect(results).toHaveLength(0);
  });

  it("should detect component sets without descriptions", () => {
    const context: FigmaContext = {
      name: "Test File",
      lastModified: "2025-01-01",
      thumbnailUrl: "",
      nodes: [],
      components: {},
      componentSets: {
        "11:41": {
          id: "11:41",
          key: "def456",
          name: "Button Set",
          description: ""
        }
      },
      globalVars: {
        designSystem: { text: {}, strokes: {}, layout: {}, colors: {} },
        localStyles: { text: {}, strokes: {}, layout: {}, colors: {} },
        images: {}
      }
    };

    const results = checkComponentDescriptions(context);

    expect(results).toHaveLength(1);
    expect(results[0].nodeName).toBe("Button Set");
  });
});
