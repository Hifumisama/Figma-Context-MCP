import { describe, it, expect } from "vitest";
import { checkDetachedStyles } from "./check-detached-styles.js";
import type { FigmaContext } from "../../get-figma-context/types.js";

describe("checkDetachedStyles", () => {
  it("should detect nodes with inline fills instead of design system styles", () => {
    const context: FigmaContext = {
      name: "Test File",
      lastModified: "2025-01-01",
      thumbnailUrl: "",
      nodes: [
        {
          id: "1:1",
          name: "Element with inline fill",
          type: "RECTANGLE",
          fills: "c1" // Local color, not design system
        }
      ],
      components: {},
      componentSets: {},
      globalVars: {
        designSystem: { text: {}, strokes: {}, layout: {}, colors: { "2:106": { name: "Primary", hexValue: "#03045E" } } },
        localStyles: { text: {}, strokes: {}, layout: {}, colors: { c1: { name: "#FF0000", hexValue: "#FF0000" } } },
        images: {}
      }
    };

    const results = checkDetachedStyles(context);

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].ruleIds).toContain(3);
  });

  it("should not flag nodes using design system styles", () => {
    const context: FigmaContext = {
      name: "Test File",
      lastModified: "2025-01-01",
      thumbnailUrl: "",
      nodes: [
        {
          id: "1:1",
          name: "Element with design system fill",
          type: "RECTANGLE",
          fills: "2:106"
        }
      ],
      components: {},
      componentSets: {},
      globalVars: {
        designSystem: { text: {}, strokes: {}, layout: {}, colors: { "2:106": { name: "Primary", hexValue: "#03045E" } } },
        localStyles: { text: {}, strokes: {}, layout: {}, colors: {} },
        images: {}
      }
    };

    const results = checkDetachedStyles(context);

    expect(results).toHaveLength(0);
  });

  it("should detect mixed design system and local styles", () => {
    const context: FigmaContext = {
      name: "Test File",
      lastModified: "2025-01-01",
      thumbnailUrl: "",
      nodes: [
        {
          id: "1:1",
          name: "Good element",
          type: "RECTANGLE",
          fills: "2:106"
        },
        {
          id: "1:2",
          name: "Bad element",
          type: "RECTANGLE",
          fills: "c1"
        }
      ],
      components: {},
      componentSets: {},
      globalVars: {
        designSystem: { text: {}, strokes: {}, layout: {}, colors: { "2:106": { name: "Primary", hexValue: "#03045E" } } },
        localStyles: { text: {}, strokes: {}, layout: {}, colors: { c1: { name: "#FF0000", hexValue: "#FF0000" } } },
        images: {}
      }
    };

    const results = checkDetachedStyles(context);

    expect(results).toHaveLength(1);
    expect(results[0].nodeName).toBe("Bad element");
  });

  it("should detect nodes with detached strokes", () => {
    const context: FigmaContext = {
      name: "Test File",
      lastModified: "2025-01-01",
      thumbnailUrl: "",
      nodes: [
        {
          id: "1:1",
          name: "Element with detached stroke",
          type: "RECTANGLE",
          strokes: "s1" // Local stroke, not design system
        }
      ],
      components: {},
      componentSets: {},
      globalVars: {
        designSystem: { text: {}, strokes: { "2:200": { name: "BorderPrimary" } as any }, layout: {}, colors: {} },
        localStyles: { text: {}, strokes: { s1: { name: "CustomStroke" } as any }, layout: {}, colors: {} },
        images: {}
      }
    };

    const results = checkDetachedStyles(context);

    expect(results).toHaveLength(1);
    expect(results[0].ruleIds).toContain(3);
    expect(results[0].nodeName).toBe("Element with detached stroke");
    expect(results[0].moreInfos["3"]).toContain("strokes");
  });

  it("should not flag nodes using design system strokes", () => {
    const context: FigmaContext = {
      name: "Test File",
      lastModified: "2025-01-01",
      thumbnailUrl: "",
      nodes: [
        {
          id: "1:1",
          name: "Element with design system stroke",
          type: "RECTANGLE",
          strokes: "2:200"
        }
      ],
      components: {},
      componentSets: {},
      globalVars: {
        designSystem: { text: {}, strokes: { "2:200": { name: "BorderPrimary" } as any }, layout: {}, colors: {} },
        localStyles: { text: {}, strokes: {}, layout: {}, colors: {} },
        images: {}
      }
    };

    const results = checkDetachedStyles(context);

    expect(results).toHaveLength(0);
  });

  it("should detect nodes with detached textStyle", () => {
    const context: FigmaContext = {
      name: "Test File",
      lastModified: "2025-01-01",
      thumbnailUrl: "",
      nodes: [
        {
          id: "1:1",
          name: "Text with detached style",
          type: "TEXT",
          textStyle: "t1" // Local text style, not design system
        }
      ],
      components: {},
      componentSets: {},
      globalVars: {
        designSystem: { text: { "2:300": { name: "Heading1" } as any }, strokes: {}, layout: {}, colors: {} },
        localStyles: { text: { t1: { name: "CustomText" } as any }, strokes: {}, layout: {}, colors: {} },
        images: {}
      }
    };

    const results = checkDetachedStyles(context);

    expect(results).toHaveLength(1);
    expect(results[0].ruleIds).toContain(3);
    expect(results[0].nodeName).toBe("Text with detached style");
    expect(results[0].moreInfos["3"]).toContain("textStyle");
  });

  it("should not flag nodes using design system textStyle", () => {
    const context: FigmaContext = {
      name: "Test File",
      lastModified: "2025-01-01",
      thumbnailUrl: "",
      nodes: [
        {
          id: "1:1",
          name: "Text with design system style",
          type: "TEXT",
          textStyle: "2:300"
        }
      ],
      components: {},
      componentSets: {},
      globalVars: {
        designSystem: { text: { "2:300": { name: "Heading1" } as any }, strokes: {}, layout: {}, colors: {} },
        localStyles: { text: {}, strokes: {}, layout: {}, colors: {} },
        images: {}
      }
    };

    const results = checkDetachedStyles(context);

    expect(results).toHaveLength(0);
  });

  it("should detect multiple detached properties on the same node", () => {
    const context: FigmaContext = {
      name: "Test File",
      lastModified: "2025-01-01",
      thumbnailUrl: "",
      nodes: [
        {
          id: "1:1",
          name: "Element with all detached",
          type: "TEXT",
          fills: "c1",
          strokes: "s1",
          textStyle: "t1"
        }
      ],
      components: {},
      componentSets: {},
      globalVars: {
        designSystem: { text: {}, strokes: {}, layout: {}, colors: {} },
        localStyles: {
          text: { t1: { name: "CustomText" } as any },
          strokes: { s1: { name: "CustomStroke" } as any },
          layout: {},
          colors: { c1: { name: "#FF0000", hexValue: "#FF0000" } }
        },
        images: {}
      }
    };

    const results = checkDetachedStyles(context);

    expect(results).toHaveLength(1);
    expect(results[0].nodeName).toBe("Element with all detached");
    expect(results[0].moreInfos["3"]).toContain("fills");
    expect(results[0].moreInfos["3"]).toContain("strokes");
    expect(results[0].moreInfos["3"]).toContain("textStyle");
  });

  it("should verify message format for multiple detached properties", () => {
    const context: FigmaContext = {
      name: "Test File",
      lastModified: "2025-01-01",
      thumbnailUrl: "",
      nodes: [
        {
          id: "1:1",
          name: "Element",
          type: "RECTANGLE",
          fills: "c1",
          strokes: "s1"
        }
      ],
      components: {},
      componentSets: {},
      globalVars: {
        designSystem: { text: {}, strokes: {}, layout: {}, colors: {} },
        localStyles: {
          text: {},
          strokes: { s1: { name: "CustomStroke" } as any },
          layout: {},
          colors: { c1: { name: "#FF0000", hexValue: "#FF0000" } }
        },
        images: {}
      }
    };

    const results = checkDetachedStyles(context);

    expect(results).toHaveLength(1);
    expect(results[0].moreInfos["3"]).toBe("Propriétés détachées: fills, strokes");
  });

  it("should detect detached styles in nested nodes", () => {
    const context: FigmaContext = {
      name: "Test File",
      lastModified: "2025-01-01",
      thumbnailUrl: "",
      nodes: [
        {
          id: "1:0",
          name: "Parent Frame",
          type: "FRAME",
          children: [
            {
              id: "1:1",
              name: "Child Frame",
              type: "FRAME",
              children: [
                {
                  id: "1:2",
                  name: "Nested Element",
                  type: "RECTANGLE",
                  fills: "c1"
                }
              ]
            }
          ]
        }
      ],
      components: {},
      componentSets: {},
      globalVars: {
        designSystem: { text: {}, strokes: {}, layout: {}, colors: {} },
        localStyles: { text: {}, strokes: {}, layout: {}, colors: { c1: { name: "#FF0000", hexValue: "#FF0000" } } },
        images: {}
      }
    };

    const results = checkDetachedStyles(context);

    expect(results).toHaveLength(1);
    expect(results[0].nodeName).toBe("Nested Element");
  });

  it("should detect detached styles in multiple children", () => {
    const context: FigmaContext = {
      name: "Test File",
      lastModified: "2025-01-01",
      thumbnailUrl: "",
      nodes: [
        {
          id: "1:0",
          name: "Parent Frame",
          type: "FRAME",
          children: [
            {
              id: "1:1",
              name: "Child 1",
              type: "RECTANGLE",
              fills: "c1"
            },
            {
              id: "1:2",
              name: "Child 2",
              type: "RECTANGLE",
              strokes: "s1"
            },
            {
              id: "1:3",
              name: "Child 3",
              type: "TEXT",
              textStyle: "t1"
            }
          ]
        }
      ],
      components: {},
      componentSets: {},
      globalVars: {
        designSystem: { text: {}, strokes: {}, layout: {}, colors: {} },
        localStyles: {
          text: { t1: { name: "CustomText" } as any },
          strokes: { s1: { name: "CustomStroke" } as any },
          layout: {},
          colors: { c1: { name: "#FF0000", hexValue: "#FF0000" } }
        },
        images: {}
      }
    };

    const results = checkDetachedStyles(context);

    expect(results).toHaveLength(3);
    expect(results[0].nodeName).toBe("Child 1");
    expect(results[1].nodeName).toBe("Child 2");
    expect(results[2].nodeName).toBe("Child 3");
  });

  it("should not flag nodes without styles", () => {
    const context: FigmaContext = {
      name: "Test File",
      lastModified: "2025-01-01",
      thumbnailUrl: "",
      nodes: [
        {
          id: "1:1",
          name: "Element without styles",
          type: "RECTANGLE"
          // No fills, strokes, or textStyle
        }
      ],
      components: {},
      componentSets: {},
      globalVars: {
        designSystem: { text: {}, strokes: {}, layout: {}, colors: {} },
        localStyles: { text: {}, strokes: {}, layout: {}, colors: { c1: { name: "#FF0000", hexValue: "#FF0000" } } },
        images: {}
      }
    };

    const results = checkDetachedStyles(context);

    expect(results).toHaveLength(0);
  });

  it("should return empty array when no nodes exist", () => {
    const context: FigmaContext = {
      name: "Test File",
      lastModified: "2025-01-01",
      thumbnailUrl: "",
      nodes: [],
      components: {},
      componentSets: {},
      globalVars: {
        designSystem: { text: {}, strokes: {}, layout: {}, colors: {} },
        localStyles: { text: {}, strokes: {}, layout: {}, colors: { c1: { name: "#FF0000", hexValue: "#FF0000" } } },
        images: {}
      }
    };

    const results = checkDetachedStyles(context);

    expect(results).toHaveLength(0);
  });

  it("should return empty array when all nodes use design system styles", () => {
    const context: FigmaContext = {
      name: "Test File",
      lastModified: "2025-01-01",
      thumbnailUrl: "",
      nodes: [
        {
          id: "1:1",
          name: "Good element 1",
          type: "RECTANGLE",
          fills: "2:106"
        },
        {
          id: "1:2",
          name: "Good element 2",
          type: "RECTANGLE",
          strokes: "2:200"
        },
        {
          id: "1:3",
          name: "Good element 3",
          type: "TEXT",
          textStyle: "2:300"
        }
      ],
      components: {},
      componentSets: {},
      globalVars: {
        designSystem: {
          text: { "2:300": { name: "Heading1" } as any },
          strokes: { "2:200": { name: "BorderPrimary" } as any },
          layout: {},
          colors: { "2:106": { name: "Primary", hexValue: "#03045E" } }
        },
        localStyles: { text: {}, strokes: {}, layout: {}, colors: {} },
        images: {}
      }
    };

    const results = checkDetachedStyles(context);

    expect(results).toHaveLength(0);
  });
});
