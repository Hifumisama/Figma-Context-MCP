import type { Node as FigmaDocumentNode } from "@figma/rest-api-spec";
import type { ExtractorFn } from "./types.js";
import { buildSimplifiedLayout } from "~/transformers/layout.js";
import { buildSimplifiedStrokes, parsePaint } from "~/transformers/style.js";
import { buildSimplifiedEffects } from "~/transformers/effects.js";
import {
  extractNodeText,
  extractTextStyle,
  hasTextStyle,
  isTextNode,
} from "~/transformers/text.js";
import { hasValue, isRectangleCornerRadii } from "~/utils/identity.js";
import type { GlobalVars, StyleTypes } from "./types.js";

type StyleType = "fill" | "stroke" | "effect" | "text";
/**
 * Determines if a style is global or local and updates the context accordingly.
 *
 * @param node - The Figma node being processed.
 * @param styleType - The type of style to process (e.g., "fill", "text").
 * @param value - The computed style value.
 * @param result - The simplified node to update.
 * @param context - The traversal context.
 */
function processStyle(
  node: FigmaDocumentNode,
  styleType: StyleType,
  value: StyleTypes,
  result: any,
  context: { globalVars: GlobalVars },
) {
  const styleKey = node.styles?.[styleType];

  if (styleKey) {
    // It's a global style
    if (!context.globalVars.styles[styleKey]) {
      // Assuming the style name can be retrieved from a design document object
      // This part might need adjustment based on where style names are stored
      context.globalVars.styles[styleKey] = {
        name: `style_${styleType}`, // Placeholder name
        value: value,
      };
    }
    result[`${styleType}s`] = styleKey;
  } else {
    // It's a local style
    if (!result.localVariables) {
      result.localVariables = {};
    }
    result.localVariables[`${styleType}s`] = value;
  }
}

/**
 * Extracts layout-related properties from a node.
 */
export const layoutExtractor: ExtractorFn = (node, result, context) => {
  const layout = buildSimplifiedLayout(node, context.parent);
  if (Object.keys(layout).length > 1) {
    if (!result.localVariables) {
      result.localVariables = {};
    }
    result.localVariables["layout"] = layout;
  }

  if (hasValue("absoluteBoundingBox", node)) {
    result.absoluteBoundingBox = node.absoluteBoundingBox;
  }
};

/**
 * Extracts text content and text styling from a node.
 */
export const textExtractor: ExtractorFn = (node, result, context) => {
  // Extract text content
  if (isTextNode(node)) {
    result.text = extractNodeText(node);
  }

  // Extract text style
  if (hasTextStyle(node)) {
    const textStyle = extractTextStyle(node);
    processStyle(node, "text", textStyle as StyleTypes, result, context);
  }
};

/**
 * Extracts visual appearance properties (fills, strokes, effects, opacity, border radius).
 */
export const visualsExtractor: ExtractorFn = (node, result, context) => {
  // Check if node has children to determine CSS properties
  const hasChildren =
    hasValue("children", node) &&
    Array.isArray(node.children) &&
    node.children.length > 0;

  // fills
  if (
    hasValue("fills", node) &&
    Array.isArray(node.fills) &&
    node.fills.length
  ) {
    const fills = node.fills.map((fill) => parsePaint(fill, hasChildren));
    processStyle(node, "fill", fills, result, context);
  }

  // strokes
  const strokes = buildSimplifiedStrokes(node, hasChildren);
  if (strokes.colors.length) {
    processStyle(node, "stroke", strokes, result, context);
  }

  // effects
  const effects = buildSimplifiedEffects(node);
  if (Object.keys(effects).length) {
    processStyle(node, "effect", effects, result, context);
  }

  // opacity
  if (
    hasValue("opacity", node) &&
    typeof node.opacity === "number" &&
    node.opacity !== 1
  ) {
    result.opacity = node.opacity;
  }

  // border radius
  if (hasValue("cornerRadius", node) && typeof node.cornerRadius === "number") {
    result.borderRadius = `${node.cornerRadius}px`;
  }
  if (hasValue("rectangleCornerRadii", node, isRectangleCornerRadii)) {
    result.borderRadius = `${node.rectangleCornerRadii[0]}px ${node.rectangleCornerRadii[1]}px ${node.rectangleCornerRadii[2]}px ${node.rectangleCornerRadii[3]}px`;
  }
};

/**
 * Extracts export settings from a node.
 */
export const exportSettingsExtractor: ExtractorFn = (node, result) => {
  if (hasValue("exportSettings", node) && Array.isArray(node.exportSettings) && node.exportSettings.length > 0) {
    result.exportSettings = JSON.stringify(node.exportSettings);
  }
};

/**
 * Extracts visibility from a node.
 */
export const visibilityExtractor: ExtractorFn = (node, result) => {
    if (hasValue("visible", node) && node.visible === false) {
        result.visible = false;
    }
};

/**
 * Extracts component-related properties from INSTANCE nodes.
 */
export const componentExtractor: ExtractorFn = (node, result, context) => {
  if (node.type === "INSTANCE") {
    if (hasValue("componentId", node)) {
      result.componentId = node.componentId;
    }

    // Add specific properties for instances of components
    if (hasValue("componentProperties", node)) {
      result.componentProperties = Object.entries(node.componentProperties ?? {}).map(
        ([name, { value, type }]) => ({
          name,
          value: value.toString(),
          type,
        }),
      );
    }
  }
};

// -------------------- CONVENIENCE COMBINATIONS --------------------

/**
 * All extractors - replicates the current parseNode behavior.
 */
export const allExtractors = [layoutExtractor, textExtractor, visualsExtractor, componentExtractor, exportSettingsExtractor, visibilityExtractor];

/**
 * Layout and text only - useful for content analysis and layout planning.
 */
export const layoutAndText = [layoutExtractor, textExtractor];

/**
 * Text content only - useful for content audits and copy extraction.
 */
export const contentOnly = [textExtractor];

/**
 * Visuals only - useful for design system analysis and style extraction.
 */
export const visualsOnly = [visualsExtractor];

/**
 * Layout only - useful for structure analysis.
 */
export const layoutOnly = [layoutExtractor];
