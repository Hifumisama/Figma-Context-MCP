import { describe, it, expect, vi } from "vitest";
import type { Node as FigmaDocumentNode } from "@figma/rest-api-spec";
import { extractFromDesign } from "./node-walker.js";
import type { ExtractorFn, TraversalOptions, GlobalVars, SimplifiedNode, TraversalContext } from "./types.js";

// Test node type with all necessary properties
interface TestNode {
  id: string;
  name: string;
  type: string;
  visible?: boolean;
  children?: TestNode[];
}

// Helper to create a mock node with proper typing
function createMockNode(overrides: Partial<TestNode> = {}): FigmaDocumentNode {
  const baseNode: TestNode = {
    id: "1:1",
    name: "Test Node",
    type: "FRAME",
    visible: true,
    ...overrides,
  };
  return baseNode as FigmaDocumentNode;
}

// Helper to create a typed extractor function
function createMockExtractor(
  fn?: (node: FigmaDocumentNode, result: SimplifiedNode, context: TraversalContext) => void
): ExtractorFn {
  return fn || vi.fn();
}

// Helper to create default GlobalVars
function createGlobalVars(overrides?: Partial<GlobalVars>): GlobalVars {
  return {
    designSystem: { text: {}, strokes: {}, layout: {}, colors: {} },
    localStyles: { text: {}, strokes: {}, layout: {}, colors: {} },
    images: {},
    ...overrides,
  };
}

// Mock des utils
vi.mock("~/utils/common.js", () => ({
  isVisible: vi.fn((node: FigmaDocumentNode) => {
    if ("visible" in node) {
      return node.visible !== false;
    }
    return true;
  }),
}));

vi.mock("~/utils/identity.js", () => ({
  hasValue: vi.fn((key: string, obj: unknown) => {
    if (typeof obj !== "object" || obj === null) return false;
    return key in obj && (obj as Record<string, unknown>)[key] !== undefined;
  }),
}));

describe("extractFromDesign", () => {
  describe("Happy path", () => {
    it("should extract data from single node", () => {
      const node = createMockNode({ id: "1:1", name: "Frame" });
      const extractor = createMockExtractor((node, result) => {
        (result as SimplifiedNode & { custom: string }).custom = "data";
      });

      const { nodes, globalVars } = extractFromDesign([node], [extractor]);

      expect(nodes).toHaveLength(1);
      expect(nodes[0]).toMatchObject({
        id: "1:1",
        name: "Frame",
        type: "FRAME",
        custom: "data",
      });
      expect(globalVars).toBeDefined();
    });

    it("should process multiple nodes", () => {
      const nodes = [
        createMockNode({ id: "1:1", name: "Node1" }),
        createMockNode({ id: "1:2", name: "Node2" }),
      ];
      const extractor = createMockExtractor();

      const { nodes: result } = extractFromDesign(nodes, [extractor]);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("1:1");
      expect(result[1].id).toBe("1:2");
    });

    it("should apply multiple extractors to same node", () => {
      const node = createMockNode({ id: "1:1" });
      const extractor1 = createMockExtractor((_, result) => {
        (result as SimplifiedNode & { ext1: boolean }).ext1 = true;
      });
      const extractor2 = createMockExtractor((_, result) => {
        (result as SimplifiedNode & { ext2: boolean }).ext2 = true;
      });

      const { nodes } = extractFromDesign([node], [extractor1, extractor2]);

      expect(nodes[0]).toMatchObject({
        id: "1:1",
        ext1: true,
        ext2: true,
      });
    });

    it("should convert VECTOR type to IMAGE-SVG", () => {
      const vectorNode = createMockNode({ id: "1:1", type: "VECTOR" });

      const { nodes } = extractFromDesign([vectorNode], []);

      expect(nodes[0].type).toBe("IMAGE-SVG");
    });

    it("should process children recursively", () => {
      const child1 = createMockNode({ id: "1:2", name: "Child1" });
      const child2 = createMockNode({ id: "1:3", name: "Child2" });
      const parent = createMockNode({
        id: "1:1",
        name: "Parent",
        children: [child1, child2] as TestNode[],
      });

      const { nodes } = extractFromDesign([parent], []);

      expect(nodes[0].children).toBeDefined();
      expect(nodes[0].children).toHaveLength(2);
      expect(nodes[0].children?.[0].id).toBe("1:2");
      expect(nodes[0].children?.[1].id).toBe("1:3");
    });
  });

  describe("Node filtering", () => {
    it("should skip invisible nodes", () => {
      const nodes = [
        createMockNode({ id: "1:1", visible: true }),
        createMockNode({ id: "1:2", visible: false }),
      ];

      const { nodes: result } = extractFromDesign(nodes, []);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("1:1");
    });

    it("should apply custom nodeFilter", () => {
      const nodes = [
        createMockNode({ id: "1:1", name: "Include" }),
        createMockNode({ id: "1:2", name: "Exclude" }),
      ];
      const options: TraversalOptions = {
        nodeFilter: (node) => node.name !== "Exclude",
      };

      const { nodes: result } = extractFromDesign(nodes, [], options);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Include");
    });

    it("should filter invisible children", () => {
      const child1 = createMockNode({ id: "1:2", visible: true });
      const child2 = createMockNode({ id: "1:3", visible: false });
      const parent = createMockNode({
        id: "1:1",
        children: [child1, child2] as TestNode[],
      });

      const { nodes } = extractFromDesign([parent], []);

      expect(nodes[0].children).toHaveLength(1);
      expect(nodes[0].children?.[0].id).toBe("1:2");
    });
  });

  describe("Depth limiting", () => {
    it("should respect maxDepth option", () => {
      const level2 = createMockNode({ id: "1:3", name: "Level2" });
      const level1 = createMockNode({
        id: "1:2",
        name: "Level1",
        children: [level2] as TestNode[],
      });
      const level0 = createMockNode({
        id: "1:1",
        name: "Level0",
        children: [level1] as TestNode[],
      });

      const { nodes } = extractFromDesign([level0], [], { maxDepth: 1 });

      expect(nodes[0].children).toBeDefined();
      expect(nodes[0].children?.[0].children).toBeUndefined();
    });

    it("should process all levels when maxDepth is not set", () => {
      const level2 = createMockNode({ id: "1:3" });
      const level1 = createMockNode({
        id: "1:2",
        children: [level2] as TestNode[],
      });
      const level0 = createMockNode({
        id: "1:1",
        children: [level1] as TestNode[],
      });

      const { nodes } = extractFromDesign([level0], []);

      expect(nodes[0].children?.[0].children).toBeDefined();
      expect(nodes[0].children?.[0].children?.[0].id).toBe("1:3");
    });
  });

  describe("GlobalVars handling", () => {
    it("should use provided globalVars", () => {
      const node = createMockNode();
      const customGlobalVars = createGlobalVars({
        designSystem: {
          text: { custom: "style" },
          strokes: {},
          layout: {},
          colors: {},
        },
      });

      const { globalVars } = extractFromDesign([node], [], {}, customGlobalVars);

      expect(globalVars.designSystem.text).toHaveProperty("custom", "style");
    });

    it("should maintain globalVars reference across processing", () => {
      const node = createMockNode();
      const extractor = createMockExtractor((_, __, context) => {
        context.globalVars.images = { ...context.globalVars.images, test: "image" };
      });

      const { globalVars } = extractFromDesign([node], [extractor]);

      expect(globalVars.images).toHaveProperty("test", "image");
    });
  });

  describe("Edge cases", () => {
    it("should handle empty nodes array", () => {
      const { nodes } = extractFromDesign([], []);

      expect(nodes).toHaveLength(0);
    });

    it("should handle empty extractors array", () => {
      const node = createMockNode({ id: "1:1", name: "Test" });

      const { nodes } = extractFromDesign([node], []);

      expect(nodes).toHaveLength(1);
      expect(nodes[0]).toMatchObject({
        id: "1:1",
        name: "Test",
        type: "FRAME",
      });
    });

    it("should handle node with empty children array", () => {
      const parent = createMockNode({
        id: "1:1",
        children: [] as TestNode[],
      });

      const { nodes } = extractFromDesign([parent], []);

      expect(nodes[0].children).toBeUndefined();
    });

    it("should filter out all children when none match", () => {
      const child1 = createMockNode({ id: "1:2", visible: false });
      const child2 = createMockNode({ id: "1:3", visible: false });
      const parent = createMockNode({
        id: "1:1",
        children: [child1, child2] as TestNode[],
      });

      const { nodes } = extractFromDesign([parent], []);

      expect(nodes[0].children).toBeUndefined();
    });

    it("should handle maxDepth of 0", () => {
      const child = createMockNode({ id: "1:2" });
      const parent = createMockNode({
        id: "1:1",
        children: [child] as TestNode[],
      });

      const { nodes } = extractFromDesign([parent], [], { maxDepth: 0 });

      expect(nodes[0].children).toBeUndefined();
    });
  });
});
