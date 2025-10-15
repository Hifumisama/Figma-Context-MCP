import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  layoutExtractor,
  textExtractor,
  visualsExtractor,
  exportSettingsExtractor,
  visibilityExtractor,
  componentExtractor,
  maskExtractor,
  cleanupExtractor,
  allExtractors,
  layoutAndText,
  contentOnly,
  visualsOnly,
  layoutOnly,
} from "./built-in.js";
import type { GlobalVars, TraversalContext, SimplifiedNode } from "./types.js";
import type { Node as FigmaNode, Paint } from "@figma/rest-api-spec";

// Local type for RGBA color
interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

// Test node types
interface TestNodeBase {
  type: string;
  id?: string;
  name?: string;
}

interface TestFrameNode extends TestNodeBase {
  type: "FRAME";
  layoutMode?: "HORIZONTAL" | "VERTICAL" | "NONE";
  absoluteBoundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  visible?: boolean;
  opacity?: number;
  cornerRadius?: number;
  rectangleCornerRadii?: [number, number, number, number];
  exportSettings?: Array<{ format: string; suffix?: string }>;
  maskType?: "ALPHA" | "VECTOR";
}

interface TestTextNode extends TestNodeBase {
  type: "TEXT";
  characters: string;
}

interface TestRectangleNode extends TestNodeBase {
  type: "RECTANGLE";
  fills?: Paint[];
  opacity?: number;
  cornerRadius?: number;
  rectangleCornerRadii?: [number, number, number, number];
  styles?: {
    fill?: string;
  };
}

interface TestInstanceNode extends TestNodeBase {
  type: "INSTANCE";
  componentId?: string;
  componentProperties?: Record<string, { value: string | boolean; type: string }>;
}

type TestNode = TestFrameNode | TestTextNode | TestRectangleNode | TestInstanceNode;

// Helper functions
function createGlobalVars(): GlobalVars {
  return {
    designSystem: { colors: {}, text: {}, strokes: {}, layout: {} },
    localStyles: { colors: {}, text: {}, strokes: {}, layout: {} },
    images: {},
  };
}

function createContext(globalVars?: GlobalVars, parent?: FigmaNode): TraversalContext {
  return {
    globalVars: globalVars || createGlobalVars(),
    currentDepth: 0,
    parent,
  };
}

function createSimplifiedNode(): SimplifiedNode {
  return {
    id: "test",
    name: "Test Node",
    type: "FRAME",
  };
}

function createTestPaint(color: RGBA): Paint {
  return {
    type: "SOLID",
    visible: true,
    opacity: 1,
    color,
  } as Paint;
}

function createTestImagePaint(imageRef: string): Paint {
  return {
    type: "IMAGE",
    visible: true,
    opacity: 1,
    imageRef,
    scaleMode: "FILL",
  } as Paint;
}

// Mock dependencies
vi.mock("~/transformers/layout.js", () => ({
  buildSimplifiedLayout: vi.fn((node: FigmaNode) => {
    const layout: Record<string, unknown> = { type: node.type };
    if ("layoutMode" in node && node.layoutMode) {
      layout.layoutMode = node.layoutMode;
    }
    return layout;
  }),
}));

vi.mock("~/transformers/style.js", () => ({
  buildSimplifiedStrokes: vi.fn(() => ({ colors: [], width: 0 })),
  parsePaint: vi.fn((fill: Paint) => {
    if (fill.type === "SOLID" && "color" in fill && fill.color) {
      const { r, g, b } = fill.color as RGBA;
      return `#${Math.floor(r * 255).toString(16).padStart(2, "0")}${Math.floor(g * 255).toString(16).padStart(2, "0")}${Math.floor(b * 255).toString(16).padStart(2, "0")}`;
    }
    if (fill.type === "IMAGE" && "imageRef" in fill) {
      return { type: "IMAGE", imageRef: fill.imageRef };
    }
    return fill;
  }),
}));

vi.mock("~/transformers/effects.js", () => ({
  buildSimplifiedEffects: vi.fn(() => []),
}));

vi.mock("~/transformers/text.js", () => ({
  extractNodeText: vi.fn((node: FigmaNode) => ("characters" in node ? node.characters : "")),
  extractTextStyle: vi.fn(() => ({ fontFamily: "Roboto", fontSize: 16 })),
  hasTextStyle: vi.fn((node: FigmaNode) => node.type === "TEXT"),
  isTextNode: vi.fn((node: FigmaNode) => node.type === "TEXT"),
}));

vi.mock("~/utils/identity.js", () => ({
  hasValue: vi.fn((prop: string, obj: unknown, validator?: (val: unknown) => boolean) => {
    if (typeof obj !== "object" || obj === null) return false;
    if (!(prop in obj)) return false;
    const val = (obj as Record<string, unknown>)[prop];
    if (val === null || val === undefined) return false;
    if (validator) return validator(val);
    return true;
  }),
  isRectangleCornerRadii: vi.fn((val: unknown) => Array.isArray(val) && val.length === 4),
}));

vi.mock("~/utils/common.js", () => ({
  generateVarId: vi.fn(() => "test-id"),
}));

describe("layoutExtractor", () => {
  let context: TraversalContext;
  let result: SimplifiedNode;

  beforeEach(() => {
    context = createContext();
    result = createSimplifiedNode();
  });

  it("should extract basic layout properties", () => {
    const node: TestFrameNode = {
      type: "FRAME",
      layoutMode: "HORIZONTAL",
      absoluteBoundingBox: { x: 10, y: 20, width: 100, height: 50 },
    };

    layoutExtractor(node as FigmaNode, result, context);

    expect(result.layout).toBeDefined();
  });

  it("should not add layout if no meaningful data", () => {
    const node: TestFrameNode = { type: "FRAME" };

    layoutExtractor(node as FigmaNode, result, context);

    expect(result.layout).toBeUndefined();
  });
});

describe("textExtractor", () => {
  let context: TraversalContext;
  let result: SimplifiedNode;

  beforeEach(() => {
    context = createContext();
    result = createSimplifiedNode();
  });

  it("should extract text content from TEXT node", () => {
    const node: TestTextNode = {
      type: "TEXT",
      characters: "Hello World",
    };

    textExtractor(node as FigmaNode, result, context);

    expect(result.text).toBe("Hello World");
  });

  it("should extract text style from TEXT node", () => {
    const node: TestTextNode = {
      type: "TEXT",
      characters: "Test",
    };

    textExtractor(node as FigmaNode, result, context);

    expect(result.textStyle).toBeDefined();
  });

  it("should not extract text from non-TEXT node", () => {
    const node: TestFrameNode = { type: "FRAME" };

    textExtractor(node as FigmaNode, result, context);

    expect(result.text).toBeUndefined();
  });
});

describe("visualsExtractor", () => {
  let context: TraversalContext;
  let result: SimplifiedNode;

  beforeEach(() => {
    context = createContext();
    result = createSimplifiedNode();
  });

  it("should extract fills with colors", () => {
    const node: TestRectangleNode = {
      type: "RECTANGLE",
      fills: [createTestPaint({ r: 1, g: 0, b: 0, a: 1 })],
    };

    visualsExtractor(node as FigmaNode, result, context);

    expect(result.fills).toBeDefined();
  });

  it("should extract opacity when not 1", () => {
    const node: TestRectangleNode = {
      type: "RECTANGLE",
      opacity: 0.5,
    };

    visualsExtractor(node as FigmaNode, result, context);

    expect(result.opacity).toBe(0.5);
  });

  it("should not extract opacity when 1", () => {
    const node: TestRectangleNode = {
      type: "RECTANGLE",
      opacity: 1,
    };

    visualsExtractor(node as FigmaNode, result, context);

    expect(result.opacity).toBeUndefined();
  });

  it("should extract corner radius", () => {
    const node: TestRectangleNode = {
      type: "RECTANGLE",
      cornerRadius: 8,
    };

    visualsExtractor(node as FigmaNode, result, context);

    expect(result.borderRadius).toBe("8px");
  });

  it("should extract individual corner radii", () => {
    const node: TestRectangleNode = {
      type: "RECTANGLE",
      rectangleCornerRadii: [8, 4, 2, 1],
    };

    visualsExtractor(node as FigmaNode, result, context);

    expect(result.borderRadius).toBe("8px 4px 2px 1px");
  });

  it("should handle image fills", () => {
    const node: TestRectangleNode = {
      type: "RECTANGLE",
      fills: [createTestImagePaint("test-image-ref")],
    };

    visualsExtractor(node as FigmaNode, result, context);

    expect(context.globalVars.images).toHaveProperty("i1");
  });
});

describe("exportSettingsExtractor", () => {
  let context: TraversalContext;
  let result: SimplifiedNode;

  beforeEach(() => {
    context = createContext();
    result = createSimplifiedNode();
  });

  it("should extract export settings when present", () => {
    const node: TestFrameNode = {
      type: "FRAME",
      exportSettings: [{ format: "PNG", suffix: "@2x" }],
    };

    exportSettingsExtractor(node as FigmaNode, result, context);

    expect(result.exportSettings).toBeDefined();
    expect(result.exportSettings).toContain("PNG");
  });

  it("should not extract empty export settings", () => {
    const node: TestFrameNode = {
      type: "FRAME",
      exportSettings: [],
    };

    exportSettingsExtractor(node as FigmaNode, result, context);

    expect(result.exportSettings).toBeUndefined();
  });
});

describe("visibilityExtractor", () => {
  let context: TraversalContext;
  let result: SimplifiedNode;

  beforeEach(() => {
    context = createContext();
    result = createSimplifiedNode();
  });

  it("should extract visibility when false", () => {
    const node: TestFrameNode = {
      type: "FRAME",
      visible: false,
    };

    visibilityExtractor(node as FigmaNode, result, context);

    expect(result.visible).toBe(false);
  });

  it("should not extract visibility when true", () => {
    const node: TestFrameNode = {
      type: "FRAME",
      visible: true,
    };

    visibilityExtractor(node as FigmaNode, result, context);

    expect(result.visible).toBeUndefined();
  });
});

describe("componentExtractor", () => {
  let context: TraversalContext;
  let result: SimplifiedNode;

  beforeEach(() => {
    context = createContext();
    result = createSimplifiedNode();
  });

  it("should extract component ID from INSTANCE", () => {
    const node: TestInstanceNode = {
      type: "INSTANCE",
      componentId: "123:456",
    };

    componentExtractor(node as FigmaNode, result, context);

    expect(result.componentId).toBe("123:456");
  });

  it("should extract component properties", () => {
    const node: TestInstanceNode = {
      type: "INSTANCE",
      componentId: "123:456",
      componentProperties: {
        label: { value: "Button", type: "TEXT" },
      },
    };

    componentExtractor(node as FigmaNode, result, context);

    expect(result.componentProperties).toBeDefined();
    expect(result.componentProperties).toHaveLength(1);
    expect(result.componentProperties?.[0].name).toBe("label");
  });

  it("should not extract from non-INSTANCE nodes", () => {
    const node: TestFrameNode = { type: "FRAME" };

    componentExtractor(node as FigmaNode, result, context);

    expect(result.componentId).toBeUndefined();
  });
});

describe("maskExtractor", () => {
  let context: TraversalContext;
  let result: SimplifiedNode;

  beforeEach(() => {
    context = createContext();
    result = createSimplifiedNode();
  });

  it("should extract mask type", () => {
    const node: TestFrameNode = {
      type: "FRAME",
      maskType: "ALPHA",
    };

    maskExtractor(node as FigmaNode, result, context);

    expect(result.maskType).toBe("ALPHA");
    expect(result.type).toBe("MASK");
  });

  it("should not modify node without mask type", () => {
    const node: TestFrameNode = { type: "FRAME" };
    result.type = "FRAME";

    maskExtractor(node as FigmaNode, result, context);

    expect(result.type).toBe("FRAME");
  });
});

describe("cleanupExtractor", () => {
  let context: TraversalContext;
  let result: SimplifiedNode;

  beforeEach(() => {
    context = createContext();
    result = createSimplifiedNode();
  });

  it("should remove empty children array", () => {
    result.children = [];

    cleanupExtractor({} as FigmaNode, result, context);

    expect(result.children).toBeUndefined();
  });

  it("should remove empty exportSettings", () => {
    result.exportSettings = "";

    cleanupExtractor({} as FigmaNode, result, context);

    expect(result.exportSettings).toBeUndefined();
  });

  it("should remove null and undefined values", () => {
    const resultWithNulls = {
      ...result,
      prop1: null as unknown as string,
      prop2: undefined as unknown as string,
      prop3: "valid",
    };

    cleanupExtractor({} as FigmaNode, resultWithNulls, context);

    expect(resultWithNulls.prop1).toBeUndefined();
    expect(resultWithNulls.prop2).toBeUndefined();
    expect(resultWithNulls.prop3).toBe("valid");
  });
});

describe("extractor combinations", () => {
  it("should export allExtractors with 8 extractors", () => {
    expect(allExtractors).toHaveLength(8);
  });

  it("should export layoutAndText with 2 extractors", () => {
    expect(layoutAndText).toHaveLength(2);
  });

  it("should export contentOnly with 1 extractor", () => {
    expect(contentOnly).toHaveLength(1);
  });

  it("should export visualsOnly with 1 extractor", () => {
    expect(visualsOnly).toHaveLength(1);
  });

  it("should export layoutOnly with 1 extractor", () => {
    expect(layoutOnly).toHaveLength(1);
  });
});
