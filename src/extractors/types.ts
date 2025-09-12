import type { Node as FigmaDocumentNode, Rectangle } from "@figma/rest-api-spec";
import type { StyleKey } from "~/utils/common.js";
import type { SimplifiedTextStyle } from "~/transformers/text.js";
import type { SimplifiedLayout } from "~/transformers/layout.js";
import type { SimplifiedFill, SimplifiedStroke } from "~/transformers/style.js";
import type { SimplifiedEffects } from "~/transformers/effects.js";
import type {
  ComponentProperties,
  SimplifiedComponentDefinition,
  SimplifiedComponentSetDefinition,
} from "~/transformers/component.js";

export type StyleTypes =
  | SimplifiedTextStyle
  | SimplifiedFill[]
  | SimplifiedLayout
  | SimplifiedStroke
  | SimplifiedEffects
  | string;

export interface StyleDefinition {
    name: string;
    value: StyleTypes;
}

export type DesignSystemStyleTypes = StyleTypes | StyleDefinition;

export interface CategorizedStyles {
  fills: Record<string, StyleTypes>;
  text: Record<string, StyleTypes>;
  strokes: Record<string, StyleTypes>;
  effects: Record<string, StyleTypes>;
  layout: Record<string, StyleTypes>;
  appearance: Record<string, StyleTypes>;
}

export interface DesignSystemStyles {
  fills: Record<string, DesignSystemStyleTypes>;
  text: Record<string, DesignSystemStyleTypes>;
  strokes: Record<string, DesignSystemStyleTypes>;
  effects: Record<string, DesignSystemStyleTypes>;
  layout: Record<string, DesignSystemStyleTypes>;
  appearance: Record<string, DesignSystemStyleTypes>;
}

export type GlobalVars = {
  designSystem: DesignSystemStyles;
  localStyles: CategorizedStyles;
  images: Record<string, any>;
};

export interface TraversalContext {
  globalVars: GlobalVars;
  currentDepth: number;
  parent?: FigmaDocumentNode;
}

export interface TraversalOptions {
  maxDepth?: number;
  nodeFilter?: (node: FigmaDocumentNode) => boolean;
}

/**
 * An extractor function that can modify a SimplifiedNode during traversal.
 *
 * @param node - The current Figma node being processed
 * @param result - SimplifiedNode object being built—this can be mutated inside the extractor
 * @param context - Traversal context including globalVars and parent info. This can also be mutated inside the extractor.
 */
export type ExtractorFn = (
  node: FigmaDocumentNode,
  result: SimplifiedNode,
  context: TraversalContext,
) => void;

export interface SimplifiedDesign {
  name: string;
  lastModified: string;
  thumbnailUrl: string;
  nodes: SimplifiedNode[];
  components: Record<string, SimplifiedComponentDefinition>;
  componentSets: Record<string, SimplifiedComponentSetDefinition>;
  globalVars: GlobalVars;
}

export interface SimplifiedNode {
  id: string;
  name: string;
  type: string; // e.g. FRAME, TEXT, INSTANCE, RECTANGLE, etc.
  // text
  text?: string;
  textStyle?: string;
  // appearance
  fills?: string;
  strokes?: string;
  effects?: string;
  opacity?: string;
  borderRadius?: string;
  // component
  componentId?: string;
  componentProperties?: ComponentProperties[];
  // export
  exportSettings?: string; // JSON string of export settings
  // layout
  layout?: string; // Reference to layout in globalVars
  // visibility
  visible?: boolean;
  // masking
  maskType?: string; // "ALPHA" or "VECTOR"
  // children
  children?: SimplifiedNode[];
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}
