import { describe, it, expect } from "vitest";
import { checkTypography } from "./check-typography.js";
import type { FigmaContext } from "../../get-figma-context/types.js";

describe("checkTypography", () => {
  it("should detect text with font size below 16px", () => {
    const context: FigmaContext = {
      name: "Test File",
      lastModified: "2025-01-01",
      thumbnailUrl: "",
      nodes: [
        {
          id: "1:1",
          name: "Small Text",
          type: "TEXT",
          text: "Too small",
          textStyle: "t1"
        }
      ],
      components: {},
      componentSets: {},
      globalVars: {
        designSystem: { text: {}, strokes: {}, layout: {}, colors: {} },
        localStyles: {
          text: {
            t1: {
              fontFamily: "Arial",
              fontSize: 12, // Too small!
              fontWeight: 400,
              lineHeight: "1.5em"
            }
          },
          strokes: {},
          layout: {},
          colors: {}
        },
        images: {}
      }
    };

    const results = checkTypography(context);

    expect(results).toHaveLength(1);
    expect(results[0].ruleIds).toContain(12);
    expect(results[0].nodeName).toBe("Small Text");
  });

  it("should not flag text with appropriate size", () => {
    const context: FigmaContext = {
      name: "Test File",
      lastModified: "2025-01-01",
      thumbnailUrl: "",
      nodes: [
        {
          id: "1:1",
          name: "Good Text",
          type: "TEXT",
          text: "Good size",
          textStyle: "t1"
        }
      ],
      components: {},
      componentSets: {},
      globalVars: {
        designSystem: { text: {}, strokes: {}, layout: {}, colors: {} },
        localStyles: {
          text: {
            t1: {
              fontFamily: "Arial",
              fontSize: 16,
              fontWeight: 400,
              lineHeight: "1.5em"
            }
          },
          strokes: {},
          layout: {},
          colors: {}
        },
        images: {}
      }
    };

    const results = checkTypography(context);

    expect(results).toHaveLength(0);
  });

  it("should detect insufficient line height (PERCENT)", () => {
    const context: FigmaContext = {
      name: "Test File",
      lastModified: "2025-01-01",
      thumbnailUrl: "",
      nodes: [
        {
          id: "1:1",
          name: "Tight Line Height Text",
          type: "TEXT",
          text: "Tight spacing",
          textStyle: "t1"
        }
      ],
      components: {},
      componentSets: {},
      globalVars: {
        designSystem: { text: {}, strokes: {}, layout: {}, colors: {} },
        localStyles: {
          text: {
            t1: {
              fontFamily: "Arial",
              fontSize: 16,
              fontWeight: 400,
              lineHeight: {
                unit: "PERCENT",
                value: 120 // 120% = 1.2x, too tight! (minimum is 150%)
              }
            } as any
          },
          strokes: {},
          layout: {},
          colors: {}
        },
        images: {}
      }
    };

    const results = checkTypography(context);

    expect(results).toHaveLength(1);
    expect(results[0].nodeName).toBe("Tight Line Height Text");
    expect(results[0].moreInfos["12"]).toContain("120%");
    expect(results[0].moreInfos["12"]).toContain("150%");
  });

  it("should accept valid line height (PERCENT)", () => {
    const context: FigmaContext = {
      name: "Test File",
      lastModified: "2025-01-01",
      thumbnailUrl: "",
      nodes: [
        {
          id: "1:1",
          name: "Good Line Height Text",
          type: "TEXT",
          text: "Good spacing",
          textStyle: "t1"
        }
      ],
      components: {},
      componentSets: {},
      globalVars: {
        designSystem: { text: {}, strokes: {}, layout: {}, colors: {} },
        localStyles: {
          text: {
            t1: {
              fontFamily: "Arial",
              fontSize: 16,
              fontWeight: 400,
              lineHeight: {
                unit: "PERCENT",
                value: 150 // 150% = 1.5x, valid!
              }
            } as any
          },
          strokes: {},
          layout: {},
          colors: {}
        },
        images: {}
      }
    };

    const results = checkTypography(context);

    expect(results).toHaveLength(0);
  });

  it("should detect insufficient line height (PIXELS)", () => {
    const context: FigmaContext = {
      name: "Test File",
      lastModified: "2025-01-01",
      thumbnailUrl: "",
      nodes: [
        {
          id: "1:1",
          name: "Tight Line Height Pixels",
          type: "TEXT",
          text: "Too tight",
          textStyle: "t1"
        }
      ],
      components: {},
      componentSets: {},
      globalVars: {
        designSystem: { text: {}, strokes: {}, layout: {}, colors: {} },
        localStyles: {
          text: {
            t1: {
              fontFamily: "Arial",
              fontSize: 16,
              fontWeight: 400,
              lineHeight: {
                unit: "PIXELS",
                value: 18 // 18px / 16px = 1.125x < 1.5x
              }
            } as any
          },
          strokes: {},
          layout: {},
          colors: {}
        },
        images: {}
      }
    };

    const results = checkTypography(context);

    expect(results).toHaveLength(1);
    expect(results[0].nodeName).toBe("Tight Line Height Pixels");
    expect(results[0].moreInfos["12"]).toContain("18px");
    expect(results[0].moreInfos["12"]).toContain("1.13");
  });

  it("should accept valid line height (PIXELS)", () => {
    const context: FigmaContext = {
      name: "Test File",
      lastModified: "2025-01-01",
      thumbnailUrl: "",
      nodes: [
        {
          id: "1:1",
          name: "Good Line Height Pixels",
          type: "TEXT",
          text: "Good spacing",
          textStyle: "t1"
        }
      ],
      components: {},
      componentSets: {},
      globalVars: {
        designSystem: { text: {}, strokes: {}, layout: {}, colors: {} },
        localStyles: {
          text: {
            t1: {
              fontFamily: "Arial",
              fontSize: 16,
              fontWeight: 400,
              lineHeight: {
                unit: "PIXELS",
                value: 24 // 24px / 16px = 1.5x, valid!
              }
            } as any
          },
          strokes: {},
          layout: {},
          colors: {}
        },
        images: {}
      }
    };

    const results = checkTypography(context);

    expect(results).toHaveLength(0);
  });

  it("should accept AUTO line height", () => {
    const context: FigmaContext = {
      name: "Test File",
      lastModified: "2025-01-01",
      thumbnailUrl: "",
      nodes: [
        {
          id: "1:1",
          name: "Auto Line Height Text",
          type: "TEXT",
          text: "Auto spacing",
          textStyle: "t1"
        }
      ],
      components: {},
      componentSets: {},
      globalVars: {
        designSystem: { text: {}, strokes: {}, layout: {}, colors: {} },
        localStyles: {
          text: {
            t1: {
              fontFamily: "Arial",
              fontSize: 16,
              fontWeight: 400,
              lineHeight: {
                unit: "AUTO"
              }
            } as any
          },
          strokes: {},
          layout: {},
          colors: {}
        },
        images: {}
      }
    };

    const results = checkTypography(context);

    expect(results).toHaveLength(0);
  });

  it("should accept undefined line height", () => {
    const context: FigmaContext = {
      name: "Test File",
      lastModified: "2025-01-01",
      thumbnailUrl: "",
      nodes: [
        {
          id: "1:1",
          name: "No Line Height Text",
          type: "TEXT",
          text: "No line height defined",
          textStyle: "t1"
        }
      ],
      components: {},
      componentSets: {},
      globalVars: {
        designSystem: { text: {}, strokes: {}, layout: {}, colors: {} },
        localStyles: {
          text: {
            t1: {
              fontFamily: "Arial",
              fontSize: 16,
              fontWeight: 400
              // lineHeight is undefined
            }
          },
          strokes: {},
          layout: {},
          colors: {}
        },
        images: {}
      }
    };

    const results = checkTypography(context);

    expect(results).toHaveLength(0);
  });

  it("should detect combined violations (fontSize + lineHeight)", () => {
    const context: FigmaContext = {
      name: "Test File",
      lastModified: "2025-01-01",
      thumbnailUrl: "",
      nodes: [
        {
          id: "1:1",
          name: "Double Violation Text",
          type: "TEXT",
          text: "Bad on both counts",
          textStyle: "t1"
        }
      ],
      components: {},
      componentSets: {},
      globalVars: {
        designSystem: { text: {}, strokes: {}, layout: {}, colors: {} },
        localStyles: {
          text: {
            t1: {
              fontFamily: "Arial",
              fontSize: 12, // Too small!
              fontWeight: 400,
              lineHeight: {
                unit: "PERCENT",
                value: 120 // Too tight!
              }
            } as any
          },
          strokes: {},
          layout: {},
          colors: {}
        },
        images: {}
      }
    };

    const results = checkTypography(context);

    expect(results).toHaveLength(1);
    expect(results[0].nodeName).toBe("Double Violation Text");
    expect(results[0].moreInfos["12"]).toContain("12px");
    expect(results[0].moreInfos["12"]).toContain("120%");
    expect(results[0].moreInfos["12"]).toContain(" et ");
  });

  it("should detect styles from designSystem.text", () => {
    const context: FigmaContext = {
      name: "Test File",
      lastModified: "2025-01-01",
      thumbnailUrl: "",
      nodes: [
        {
          id: "1:1",
          name: "Design System Text",
          type: "TEXT",
          text: "Using design system style",
          textStyle: "ds1"
        }
      ],
      components: {},
      componentSets: {},
      globalVars: {
        designSystem: {
          text: {
            ds1: {
              fontFamily: "Arial",
              fontSize: 10, // Too small!
              fontWeight: 400,
              lineHeight: "1.5em"
            }
          },
          strokes: {},
          layout: {},
          colors: {}
        },
        localStyles: {
          text: {},
          strokes: {},
          layout: {},
          colors: {}
        },
        images: {}
      }
    };

    const results = checkTypography(context);

    expect(results).toHaveLength(1);
    expect(results[0].nodeName).toBe("Design System Text");
  });

  it("should handle styles with { value: ... } format", () => {
    const context: FigmaContext = {
      name: "Test File",
      lastModified: "2025-01-01",
      thumbnailUrl: "",
      nodes: [
        {
          id: "1:1",
          name: "Wrapped Style Text",
          type: "TEXT",
          text: "Wrapped format",
          textStyle: "t1"
        }
      ],
      components: {},
      componentSets: {},
      globalVars: {
        designSystem: { text: {}, strokes: {}, layout: {}, colors: {} },
        localStyles: {
          text: {
            t1: {
              value: {
                fontFamily: "Arial",
                fontSize: 12, // Too small!
                fontWeight: 400,
                lineHeight: "1.5em"
              }
            } as any
          },
          strokes: {},
          layout: {},
          colors: {}
        },
        images: {}
      }
    };

    const results = checkTypography(context);

    expect(results).toHaveLength(1);
    expect(results[0].nodeName).toBe("Wrapped Style Text");
  });

  it("should detect multiple nodes with the same invalid style", () => {
    const context: FigmaContext = {
      name: "Test File",
      lastModified: "2025-01-01",
      thumbnailUrl: "",
      nodes: [
        {
          id: "1:1",
          name: "Text 1",
          type: "TEXT",
          text: "First",
          textStyle: "t1"
        },
        {
          id: "1:2",
          name: "Text 2",
          type: "TEXT",
          text: "Second",
          textStyle: "t1"
        },
        {
          id: "1:3",
          name: "Text 3",
          type: "TEXT",
          text: "Third",
          textStyle: "t1"
        }
      ],
      components: {},
      componentSets: {},
      globalVars: {
        designSystem: { text: {}, strokes: {}, layout: {}, colors: {} },
        localStyles: {
          text: {
            t1: {
              fontFamily: "Arial",
              fontSize: 12, // Too small!
              fontWeight: 400,
              lineHeight: "1.5em"
            }
          },
          strokes: {},
          layout: {},
          colors: {}
        },
        images: {}
      }
    };

    const results = checkTypography(context);

    expect(results).toHaveLength(3);
    expect(results[0].nodeName).toBe("Text 3");
    expect(results[1].nodeName).toBe("Text 2");
    expect(results[2].nodeName).toBe("Text 1");
  });

  it("should detect nested TEXT nodes", () => {
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
                  name: "Nested Text",
                  type: "TEXT",
                  text: "Deep nested",
                  textStyle: "t1"
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
        localStyles: {
          text: {
            t1: {
              fontFamily: "Arial",
              fontSize: 12, // Too small!
              fontWeight: 400,
              lineHeight: "1.5em"
            }
          },
          strokes: {},
          layout: {},
          colors: {}
        },
        images: {}
      }
    };

    const results = checkTypography(context);

    expect(results).toHaveLength(1);
    expect(results[0].nodeName).toBe("Nested Text");
  });

  it("should ignore TEXT nodes without textStyle", () => {
    const context: FigmaContext = {
      name: "Test File",
      lastModified: "2025-01-01",
      thumbnailUrl: "",
      nodes: [
        {
          id: "1:1",
          name: "Text Without Style",
          type: "TEXT",
          text: "No style"
          // textStyle is undefined
        }
      ],
      components: {},
      componentSets: {},
      globalVars: {
        designSystem: { text: {}, strokes: {}, layout: {}, colors: {} },
        localStyles: {
          text: {
            t1: {
              fontFamily: "Arial",
              fontSize: 12, // Too small but won't be detected
              fontWeight: 400,
              lineHeight: "1.5em"
            }
          },
          strokes: {},
          layout: {},
          colors: {}
        },
        images: {}
      }
    };

    const results = checkTypography(context);

    expect(results).toHaveLength(0);
  });

  it("should return empty array when no TEXT nodes exist", () => {
    const context: FigmaContext = {
      name: "Test File",
      lastModified: "2025-01-01",
      thumbnailUrl: "",
      nodes: [
        {
          id: "1:1",
          name: "Rectangle",
          type: "RECTANGLE"
        },
        {
          id: "1:2",
          name: "Frame",
          type: "FRAME",
          children: []
        }
      ],
      components: {},
      componentSets: {},
      globalVars: {
        designSystem: { text: {}, strokes: {}, layout: {}, colors: {} },
        localStyles: {
          text: {
            t1: {
              fontFamily: "Arial",
              fontSize: 12, // Too small but no TEXT nodes to apply it to
              fontWeight: 400,
              lineHeight: "1.5em"
            }
          },
          strokes: {},
          layout: {},
          colors: {}
        },
        images: {}
      }
    };

    const results = checkTypography(context);

    expect(results).toHaveLength(0);
  });

  it("should return empty array when all styles are valid", () => {
    const context: FigmaContext = {
      name: "Test File",
      lastModified: "2025-01-01",
      thumbnailUrl: "",
      nodes: [
        {
          id: "1:1",
          name: "Good Text",
          type: "TEXT",
          text: "All good",
          textStyle: "t1"
        }
      ],
      components: {},
      componentSets: {},
      globalVars: {
        designSystem: { text: {}, strokes: {}, layout: {}, colors: {} },
        localStyles: {
          text: {
            t1: {
              fontFamily: "Arial",
              fontSize: 16, // Valid!
              fontWeight: 400,
              lineHeight: {
                unit: "PERCENT",
                value: 150 // Valid!
              }
            } as any
          },
          strokes: {},
          layout: {},
          colors: {}
        },
        images: {}
      }
    };

    const results = checkTypography(context);

    expect(results).toHaveLength(0);
  });
});
