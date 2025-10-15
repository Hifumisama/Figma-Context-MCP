import { describe, it, expect, vi, beforeEach } from "vitest";
import { simplifyRawFigmaObject } from "./design-extractor.js";
import type { ExtractorFn, GlobalVars, SimplifiedNode } from "./types.js";
import type {
  GetFileResponse,
  GetFileNodesResponse,
  Node as FigmaNode,
  Component,
  ComponentSet,
  Paint,
  Style,
} from "@figma/rest-api-spec";

// Local type for RGBA color (not exported from @figma/rest-api-spec)
interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

// Type helpers for creating test data
type TestCanvas = {
  id: string;
  name: string;
  type: string;
  children: FigmaNode[];
  backgroundColor: RGBA;
  prototypeStartNodeID: string | null;
  flowStartingPoints: unknown[];
  prototypeDevice: { type: string; rotation: string };
  scrollBehavior: 'SCROLLS' | 'FIXED' | 'SCROLLS_HORIZONTALLY' | 'SCROLLS_VERTICALLY';
};

type TestDocument = {
  id: string;
  name: string;
  type: string;
  children: TestCanvas[];
  scrollBehavior: 'SCROLLS' | 'FIXED' | 'SCROLLS_HORIZONTALLY' | 'SCROLLS_VERTICALLY';
};

type TestRectangle = {
  id: string;
  name: string;
  type: string;
  fills?: readonly Paint[];
  styles?: {
    fill?: string;
  };
};

type TestGetFileResponse = Omit<GetFileResponse, 'document' | 'components' | 'componentSets' | 'styles'> & {
  document: TestDocument;
  components: Record<string, Component>;
  componentSets: Record<string, ComponentSet>;
  styles: Record<string, Style>;
};

// Mock dependencies
vi.mock("~/transformers/component.js", () => ({
  simplifyComponents: vi.fn((components: Record<string, Component>) => components),
  simplifyComponentSets: vi.fn((componentSets: Record<string, ComponentSet>) => componentSets),
}));

vi.mock("./node-walker.js", () => ({
  extractFromDesign: vi.fn((rawNodes: FigmaNode[], _extractors: ExtractorFn[], _options, globalVars: GlobalVars) => ({
    nodes: rawNodes.map((node): SimplifiedNode => ({
      id: node.id,
      name: node.name,
      type: node.type
    })),
    globalVars: {
      ...globalVars,
      designSystem: {
        text: {},
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
  })),
}));

vi.mock("~/utils/logger.js", () => ({
  Logger: {
    log: vi.fn(),
  },
}));

// Helper functions to create test data
function createTestCanvas(overrides?: Partial<TestCanvas>): TestCanvas {
  return {
    id: "1:1",
    name: "Page 1",
    type: "CANVAS",
    children: [],
    backgroundColor: { r: 1, g: 1, b: 1, a: 1 },
    prototypeStartNodeID: null,
    flowStartingPoints: [],
    prototypeDevice: { type: "NONE", rotation: "NONE" },
    scrollBehavior: "SCROLLS",
    ...overrides,
  };
}

function createTestDocument(children: TestCanvas[]): TestDocument {
  return {
    id: "0:0",
    name: "Document",
    type: "DOCUMENT",
    scrollBehavior: "SCROLLS",
    children,
  };
}

function createTestGetFileResponse(overrides?: Partial<TestGetFileResponse>): GetFileResponse {
  const defaultResponse: TestGetFileResponse = {
    name: "Test Design",
    lastModified: "2025-01-15T12:00:00Z",
    thumbnailUrl: "https://example.com/thumb.png",
    version: "1",
    role: "owner",
    editorType: "figma",
    linkAccess: "view",
    document: createTestDocument([createTestCanvas()]),
    components: {},
    componentSets: {},
    schemaVersion: 0,
    styles: {},
  };

  return { ...defaultResponse, ...overrides } as GetFileResponse;
}

function createTestPaint(color: RGBA): Paint {
  return {
    type: "SOLID",
    visible: true,
    opacity: 1,
    color,
  } as Paint;
}

function createTestRectangle(id: string, name: string, fills?: readonly Paint[], fillStyleId?: string): TestRectangle {
  const rect: TestRectangle = {
    id,
    name,
    type: "RECTANGLE",
  };

  if (fills) {
    rect.fills = fills;
  }

  if (fillStyleId) {
    rect.styles = { fill: fillStyleId };
  }

  return rect;
}

describe("design-extractor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("simplifyRawFigmaObject", () => {
    it("should process GetFileResponse with basic metadata", () => {
      const mockResponse = createTestGetFileResponse();
      const extractors: ExtractorFn[] = [];
      const result = simplifyRawFigmaObject(mockResponse, extractors);

      expect(result.name).toBe("Test Design");
      expect(result.lastModified).toBe("2025-01-15T12:00:00Z");
      expect(result.thumbnailUrl).toBe("https://example.com/thumb.png");
      expect(result.nodes).toHaveLength(1);
    });

    it("should process GetFileNodesResponse with multiple nodes", () => {
      const mockResponse: GetFileNodesResponse = {
        name: "Test Design",
        lastModified: "2025-01-15T12:00:00Z",
        thumbnailUrl: "https://example.com/thumb.png",
        version: "1",
        role: "owner",
        editorType: "figma",
        nodes: {
          "1:1": {
            document: {
              id: "1:1",
              name: "Frame 1",
              type: "FRAME",
              children: [],
            } as FigmaNode,
            components: {},
            componentSets: {},
            schemaVersion: 0,
            styles: {},
          },
          "2:2": {
            document: {
              id: "2:2",
              name: "Frame 2",
              type: "FRAME",
              children: [],
            } as FigmaNode,
            components: {},
            componentSets: {},
            schemaVersion: 0,
            styles: {},
          },
        },
      };

      const extractors: ExtractorFn[] = [];
      const result = simplifyRawFigmaObject(mockResponse, extractors);

      expect(result.nodes).toHaveLength(2);
      expect(result.nodes[0].id).toBe("1:1");
      expect(result.nodes[1].id).toBe("2:2");
    });

    it("should extract color styles from design system", () => {
      const redColor: RGBA = { r: 1, g: 0, b: 0, a: 1 };
      const rectangle = createTestRectangle(
        "2:2",
        "Rectangle",
        [createTestPaint(redColor)],
        "S:color-primary"
      );

      const canvas = createTestCanvas({
        children: [rectangle as FigmaNode],
      });

      const mockResponse = createTestGetFileResponse({
        document: createTestDocument([canvas]),
        styles: {
          "S:color-primary": {
            key: "color-primary",
            name: "Primary/500",
            styleType: "FILL",
            description: "Primary color",
            remote: false,
          } as Style,
        },
      });

      const extractors: ExtractorFn[] = [];
      const result = simplifyRawFigmaObject(mockResponse, extractors);

      expect(result.globalVars.designSystem.colors["S:color-primary"]).toBeDefined();
      expect(result.globalVars.designSystem.colors["S:color-primary"].name).toBe("Primary/500");
      expect(result.globalVars.designSystem.colors["S:color-primary"].hexValue).toBe("#FF0000");
    });

    it("should extract local colors without design system styles", () => {
      const blueColor: RGBA = { r: 0, g: 0.5, b: 1, a: 1 };
      const rectangle = createTestRectangle(
        "2:2",
        "Rectangle",
        [createTestPaint(blueColor)]
      );

      const canvas = createTestCanvas({
        children: [rectangle as FigmaNode],
      });

      const mockResponse = createTestGetFileResponse({
        document: createTestDocument([canvas]),
        styles: {},
      });

      const extractors: ExtractorFn[] = [];
      const result = simplifyRawFigmaObject(mockResponse, extractors);

      const localColors = Object.values(result.globalVars.localStyles.colors);
      expect(localColors.length).toBeGreaterThan(0);

      const blueColorEntry = localColors.find(c => c.hexValue === "#0080FF");
      expect(blueColorEntry).toBeDefined();
      expect(blueColorEntry?.hexValue).toBe("#0080FF");
    });

    it("should handle missing thumbnailUrl gracefully", () => {
      const mockResponse = createTestGetFileResponse({ thumbnailUrl: undefined });
      const extractors: ExtractorFn[] = [];
      const result = simplifyRawFigmaObject(mockResponse, extractors);

      expect(result.thumbnailUrl).toBe("");
    });

    it("should handle nodes without styles object", () => {
      const mockResponse = createTestGetFileResponse({ styles: undefined });
      const extractors: ExtractorFn[] = [];

      // Should not throw
      expect(() => simplifyRawFigmaObject(mockResponse, extractors)).not.toThrow();
    });
  });
});
