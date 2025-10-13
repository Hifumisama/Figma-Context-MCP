import { describe, it, expect } from "vitest";
import { checkExportSettings } from "./check-export-settings.js";
import type { FigmaContext } from "../../get-figma-context/types.js";

describe("checkExportSettings", () => {
  it("should detect potential assets without export settings", () => {
    const context: FigmaContext = {
      name: "Test File",
      lastModified: "2025-01-01",
      thumbnailUrl: "",
      nodes: [
        {
          id: "1:1",
          name: "icon-home",
          type: "IMAGE-SVG"
          // No exportSettings property
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

    const results = checkExportSettings(context);

    expect(results).toHaveLength(1);
    expect(results[0].ruleIds).toContain(4);
    expect(results[0].nodeName).toBe("icon-home");
  });

  it("should not flag assets with export settings", () => {
    const context: FigmaContext = {
      name: "Test File",
      lastModified: "2025-01-01",
      thumbnailUrl: "",
      nodes: [
        {
          id: "1:1",
          name: "icon-home",
          type: "IMAGE-SVG",
          exportSettings: '[{"format":"SVG"}]'
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

    const results = checkExportSettings(context);

    expect(results).toHaveLength(0);
  });

  it("should detect vectors without export settings", () => {
    const context: FigmaContext = {
      name: "Test File",
      lastModified: "2025-01-01",
      thumbnailUrl: "",
      nodes: [
        {
          id: "1:1",
          name: "logo-vector",
          type: "VECTOR"
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

    const results = checkExportSettings(context);

    expect(results).toHaveLength(1);
    expect(results[0].nodeName).toBe("logo-vector");
  });
});
