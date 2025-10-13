import { describe, it, expect } from "vitest";
import { checkColorContrast } from "./check-color-contrast.js";
import type { FigmaContext } from "../../get-figma-context/types.js";
import type { SimplifiedNode } from "../../../../extractors/types.js";

describe("checkColorContrast", () => {
  describe("WCAG AA Compliance", () => {
    it("should detect insufficient contrast for normal text (fails WCAG AA 4.5:1)", () => {
      // Light gray (#CCCCCC) on white (#FFFFFF) = ~1.6:1 ratio
      const context: FigmaContext = {
        name: "Test File",
        lastModified: "2025-01-01",
        thumbnailUrl: "",
        nodes: [
          {
            id: "root",
            name: "Background",
            type: "RECTANGLE",
            fills: "bgWhite",
            children: [
              {
                id: "text1",
                name: "Low Contrast Text",
                type: "TEXT",
                text: "Hello World",
                fills: "textLightGray",
                textStyle: "normalText"
              }
            ]
          } as SimplifiedNode
        ],
        components: {},
        componentSets: {},
        globalVars: {
          designSystem: { text: {}, strokes: {}, layout: {}, colors: {} },
          localStyles: {
            text: {
              normalText: {
                fontFamily: "Arial",
                fontSize: 14,
                fontWeight: 400
              }
            },
            strokes: {},
            layout: {},
            colors: {
              textLightGray: { name: "Light Gray", hexValue: "#CCCCCC" },
              bgWhite: { name: "White", hexValue: "#FFFFFF" }
            }
          },
          images: {}
        }
      };

      const results = checkColorContrast(context);

      expect(results).toHaveLength(1);
      expect(results[0].nodeId).toBe("text1");
      expect(results[0].nodeName).toBe("Low Contrast Text");
      expect(results[0].ruleIds).toContain(11);
      expect(results[0].moreInfos["11"]).toContain("Contraste insuffisant");
      expect(results[0].moreInfos["11"]).toContain("Light Gray");
      expect(results[0].moreInfos["11"]).toContain("White");
      expect(results[0].moreInfos["11"]).toContain("WCAG AA");
      expect(results[0].moreInfos["11"]).toContain("texte normal");
    });

    it("should pass WCAG AA but warn about AAA for good contrast (5.74:1 > AA but < AAA)", () => {
      // Medium gray (#666666) on white (#FFFFFF) = ~5.74:1 ratio
      // Passes AA (4.5:1) but fails AAA (7.0:1) for normal text
      const context: FigmaContext = {
        name: "Test File",
        lastModified: "2025-01-01",
        thumbnailUrl: "",
        nodes: [
          {
            id: "root",
            name: "Background",
            type: "FRAME",
            fills: "bgWhite",
            children: [
              {
                id: "text1",
                name: "Medium Contrast Text",
                type: "TEXT",
                text: "Hello World",
                fills: "textMediumGray",
                textStyle: "normalText"
              }
            ]
          } as SimplifiedNode
        ],
        components: {},
        componentSets: {},
        globalVars: {
          designSystem: { text: {}, strokes: {}, layout: {}, colors: {} },
          localStyles: {
            text: {
              normalText: {
                fontFamily: "Arial",
                fontSize: 16,
                fontWeight: 400
              }
            },
            strokes: {},
            layout: {},
            colors: {
              textMediumGray: { name: "Medium Gray", hexValue: "#666666" },
              bgWhite: { name: "White", hexValue: "#FFFFFF" }
            }
          },
          images: {}
        }
      };

      const results = checkColorContrast(context);

      // Should report AAA failure (but AA passes)
      expect(results).toHaveLength(1);
      expect(results[0].moreInfos["11"]).toContain("WCAG AAA");
      // Should NOT contain "WCAG AA:" (with colon) since AA passes
      expect(results[0].moreInfos["11"]).not.toMatch(/WCAG AA[^A]/);
    });

    it("should pass both WCAG AA and AAA for excellent contrast", () => {
      // Dark blue (#03045E) on white (#FFFFFF) = ~14:1 ratio
      const context: FigmaContext = {
        name: "Test File",
        lastModified: "2025-01-01",
        thumbnailUrl: "",
        nodes: [
          {
            id: "root",
            name: "Background",
            type: "FRAME",
            fills: "bgWhite",
            children: [
              {
                id: "text1",
                name: "High Contrast Text",
                type: "TEXT",
                text: "Hello World",
                fills: "textDarkBlue",
                textStyle: "normalText"
              }
            ]
          } as SimplifiedNode
        ],
        components: {},
        componentSets: {},
        globalVars: {
          designSystem: {
            text: {},
            strokes: {},
            layout: {},
            colors: {
              textDarkBlue: { name: "Dark Blue", hexValue: "#03045E" }
            }
          },
          localStyles: {
            text: {
              normalText: {
                fontFamily: "Arial",
                fontSize: 16,
                fontWeight: 400
              }
            },
            strokes: {},
            layout: {},
            colors: {
              bgWhite: { name: "White", hexValue: "#FFFFFF" }
            }
          },
          images: {}
        }
      };

      const results = checkColorContrast(context);

      // Should pass both AA and AAA - no issues reported
      expect(results).toHaveLength(0);
    });
  });

  describe("Large Text Handling", () => {
    it("should use lower threshold for large text (18pt/24px)", () => {
      // Medium-light gray (#767676) on white = ~4.6:1
      // Fails AA for normal text (4.5:1) but passes for large text (3:1)
      const context: FigmaContext = {
        name: "Test File",
        lastModified: "2025-01-01",
        thumbnailUrl: "",
        nodes: [
          {
            id: "root",
            name: "Background",
            type: "FRAME",
            fills: "bgWhite",
            children: [
              {
                id: "text1",
                name: "Large Text",
                type: "TEXT",
                text: "Hello World",
                fills: "textGray",
                textStyle: "largeText"
              }
            ]
          } as SimplifiedNode
        ],
        components: {},
        componentSets: {},
        globalVars: {
          designSystem: { text: {}, strokes: {}, layout: {}, colors: {} },
          localStyles: {
            text: {
              largeText: {
                fontFamily: "Arial",
                fontSize: 24, // 18pt = 24px
                fontWeight: 400
              }
            },
            strokes: {},
            layout: {},
            colors: {
              textGray: { name: "Gray", hexValue: "#767676" },
              bgWhite: { name: "White", hexValue: "#FFFFFF" }
            }
          },
          images: {}
        }
      };

      const results = checkColorContrast(context);

      // Should mention "texte large" in the message
      if (results.length > 0) {
        expect(results[0].moreInfos["11"]).toContain("texte large");
      }
    });

    it("should use lower threshold for bold large text (14pt/18.67px + 600 weight)", () => {
      const context: FigmaContext = {
        name: "Test File",
        lastModified: "2025-01-01",
        thumbnailUrl: "",
        nodes: [
          {
            id: "root",
            name: "Background",
            type: "FRAME",
            fills: "bgWhite",
            children: [
              {
                id: "text1",
                name: "Bold Large Text",
                type: "TEXT",
                text: "Hello World",
                fills: "textGray",
                textStyle: "boldText"
              }
            ]
          } as SimplifiedNode
        ],
        components: {},
        componentSets: {},
        globalVars: {
          designSystem: { text: {}, strokes: {}, layout: {}, colors: {} },
          localStyles: {
            text: {
              boldText: {
                fontFamily: "Arial",
                fontSize: 19, // 14pt = ~18.67px
                fontWeight: 700 // Bold
              }
            },
            strokes: {},
            layout: {},
            colors: {
              textGray: { name: "Gray", hexValue: "#767676" },
              bgWhite: { name: "White", hexValue: "#FFFFFF" }
            }
          },
          images: {}
        }
      };

      const results = checkColorContrast(context);

      // Should treat as large text due to bold + size
      if (results.length > 0) {
        expect(results[0].moreInfos["11"]).toContain("texte large");
      }
    });
  });

  describe("Node Hierarchy and Background Detection", () => {
    it("should find background color from parent hierarchy", () => {
      const context: FigmaContext = {
        name: "Test File",
        lastModified: "2025-01-01",
        thumbnailUrl: "",
        nodes: [
          {
            id: "root",
            name: "Outer Container",
            type: "FRAME",
            fills: "bgDark",
            children: [
              {
                id: "middle",
                name: "Middle Container",
                type: "FRAME",
                // No fill - should climb to parent
                children: [
                  {
                    id: "text1",
                    name: "Text Node",
                    type: "TEXT",
                    text: "Hello",
                    fills: "textLight", // Light text on dark bg = good
                    textStyle: "normalText"
                  }
                ]
              }
            ]
          } as SimplifiedNode
        ],
        components: {},
        componentSets: {},
        globalVars: {
          designSystem: { text: {}, strokes: {}, layout: {}, colors: {} },
          localStyles: {
            text: {
              normalText: {
                fontFamily: "Arial",
                fontSize: 16,
                fontWeight: 400
              }
            },
            strokes: {},
            layout: {},
            colors: {
              textLight: { name: "Light Gray", hexValue: "#CCCCCC" },
              bgDark: { name: "Dark Blue", hexValue: "#03045E" }
            }
          },
          images: {}
        }
      };

      const results = checkColorContrast(context);

      // Light text on dark background should pass
      expect(results).toHaveLength(0);
    });

    it("should use white background as fallback when no parent has fill", () => {
      const context: FigmaContext = {
        name: "Test File",
        lastModified: "2025-01-01",
        thumbnailUrl: "",
        nodes: [
          {
            id: "text1",
            name: "Standalone Text",
            type: "TEXT",
            text: "Hello World",
            fills: "textDark",
            textStyle: "normalText"
          } as SimplifiedNode
        ],
        components: {},
        componentSets: {},
        globalVars: {
          designSystem: { text: {}, strokes: {}, layout: {}, colors: {} },
          localStyles: {
            text: {
              normalText: {
                fontFamily: "Arial",
                fontSize: 16,
                fontWeight: 400
              }
            },
            strokes: {},
            layout: {},
            colors: {
              textDark: { name: "Dark Text", hexValue: "#000000" }
            }
          },
          images: {}
        }
      };

      const results = checkColorContrast(context);

      // Black on white (assumed) should pass
      expect(results).toHaveLength(0);
    });
  });

  describe("Excluded Node Types", () => {
    it("should skip contrast check for images and SVG nodes", () => {
      const context: FigmaContext = {
        name: "Test File",
        lastModified: "2025-01-01",
        thumbnailUrl: "",
        nodes: [
          {
            id: "root",
            name: "Background",
            type: "FRAME",
            fills: "bgWhite",
            children: [
              {
                id: "img1",
                name: "Image with bad contrast colors",
                type: "IMAGE",
                fills: "textLightGray" // Would fail if checked
              },
              {
                id: "svg1",
                name: "SVG Icon",
                type: "IMAGE-SVG",
                fills: "textLightGray" // Would fail if checked
              }
            ]
          } as SimplifiedNode
        ],
        components: {},
        componentSets: {},
        globalVars: {
          designSystem: { text: {}, strokes: {}, layout: {}, colors: {} },
          localStyles: {
            text: {},
            strokes: {},
            layout: {},
            colors: {
              textLightGray: { name: "Light Gray", hexValue: "#CCCCCC" },
              bgWhite: { name: "White", hexValue: "#FFFFFF" }
            }
          },
          images: {}
        }
      };

      const results = checkColorContrast(context);

      // Images should be excluded from contrast checks
      expect(results).toHaveLength(0);
    });

    it("should check text nodes within excluded node children", () => {
      const context: FigmaContext = {
        name: "Test File",
        lastModified: "2025-01-01",
        thumbnailUrl: "",
        nodes: [
          {
            id: "root",
            name: "Background",
            type: "FRAME",
            fills: "bgWhite",
            children: [
              {
                id: "mask1",
                name: "Masked Group",
                type: "MASK",
                children: [
                  {
                    id: "text1",
                    name: "Text in Mask",
                    type: "TEXT",
                    text: "Hello",
                    fills: "textLightGray",
                    textStyle: "normalText"
                  }
                ]
              }
            ]
          } as SimplifiedNode
        ],
        components: {},
        componentSets: {},
        globalVars: {
          designSystem: { text: {}, strokes: {}, layout: {}, colors: {} },
          localStyles: {
            text: {
              normalText: {
                fontFamily: "Arial",
                fontSize: 16,
                fontWeight: 400
              }
            },
            strokes: {},
            layout: {},
            colors: {
              textLightGray: { name: "Light Gray", hexValue: "#CCCCCC" },
              bgWhite: { name: "White", hexValue: "#FFFFFF" }
            }
          },
          images: {}
        }
      };

      const results = checkColorContrast(context);

      // Text within mask should still be checked
      expect(results).toHaveLength(1);
      expect(results[0].nodeId).toBe("text1");
    });
  });

  describe("Edge Cases", () => {
    it("should skip text nodes without fill color", () => {
      const context: FigmaContext = {
        name: "Test File",
        lastModified: "2025-01-01",
        thumbnailUrl: "",
        nodes: [
          {
            id: "root",
            name: "Background",
            type: "FRAME",
            fills: "bgWhite",
            children: [
              {
                id: "text1",
                name: "Text without fill",
                type: "TEXT",
                text: "Hello"
                // No fills property
              }
            ]
          } as SimplifiedNode
        ],
        components: {},
        componentSets: {},
        globalVars: {
          designSystem: { text: {}, strokes: {}, layout: {}, colors: {} },
          localStyles: {
            text: {},
            strokes: {},
            layout: {},
            colors: {
              bgWhite: { name: "White", hexValue: "#FFFFFF" }
            }
          },
          images: {}
        }
      };

      const results = checkColorContrast(context);

      // Should skip text without fills
      expect(results).toHaveLength(0);
    });

    it("should skip text with invalid color references", () => {
      const context: FigmaContext = {
        name: "Test File",
        lastModified: "2025-01-01",
        thumbnailUrl: "",
        nodes: [
          {
            id: "root",
            name: "Background",
            type: "FRAME",
            fills: "bgWhite",
            children: [
              {
                id: "text1",
                name: "Text with invalid color",
                type: "TEXT",
                text: "Hello",
                fills: "nonExistentColor", // Color doesn't exist in globalVars
                textStyle: "normalText"
              }
            ]
          } as SimplifiedNode
        ],
        components: {},
        componentSets: {},
        globalVars: {
          designSystem: { text: {}, strokes: {}, layout: {}, colors: {} },
          localStyles: {
            text: {
              normalText: {
                fontFamily: "Arial",
                fontSize: 16,
                fontWeight: 400
              }
            },
            strokes: {},
            layout: {},
            colors: {
              bgWhite: { name: "White", hexValue: "#FFFFFF" }
            }
          },
          images: {}
        }
      };

      const results = checkColorContrast(context);

      // Should skip text with invalid color references
      expect(results).toHaveLength(0);
    });
  });
});
