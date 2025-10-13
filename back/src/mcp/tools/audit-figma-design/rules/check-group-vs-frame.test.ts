import { describe, it, expect } from "vitest";
import { checkGroupVsFrame } from "./check-group-vs-frame.js";
import type { FigmaContext } from "../../get-figma-context/types.js";

describe("checkGroupVsFrame", () => {
  it("should detect inappropriate use of groups", () => {
    const context: FigmaContext = {
      name: "Test File",
      lastModified: "2025-01-01",
      thumbnailUrl: "",
      nodes: [
        {
          id: "1:1",
          name: "Bad Group",
          type: "GROUP",
          children: [
            { id: "1:2", name: "Child 1", type: "RECTANGLE" },
            { id: "1:3", name: "Child 2", type: "RECTANGLE" }
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

    const results = checkGroupVsFrame(context);

    expect(results).toHaveLength(1);
    expect(results[0].ruleIds).toContain(6);
    expect(results[0].nodeName).toBe("Bad Group");
  });

  it("should not flag frames", () => {
    const context: FigmaContext = {
      name: "Test File",
      lastModified: "2025-01-01",
      thumbnailUrl: "",
      nodes: [
        {
          id: "1:1",
          name: "Good Frame",
          type: "FRAME",
          children: [
            { id: "1:2", name: "Child", type: "RECTANGLE" }
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

    const results = checkGroupVsFrame(context);

    expect(results).toHaveLength(0);
  });
});
