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
import type { GlobalVars, StyleTypes, CategorizedStyles } from "./types.js";
import { generateVarId } from "~/utils/common.js";

type StyleType = "stroke" | "effect" | "text" | "layout" | "appearance";

/**
 * Removes empty/default properties from a node to optimize JSON size
 */
function cleanupNode(node: any): void {
  // Remove properties with default values (but keep visible as requested)
  if (node.opacity === 1) delete node.opacity;
  
  // Remove empty arrays
  if (Array.isArray(node.children) && node.children.length === 0) delete node.children;
  
  // Remove empty strings
  if (node.exportSettings === "") delete node.exportSettings;
  
  // Remove null/undefined values
  Object.keys(node).forEach(key => {
    if (node[key] === null || node[key] === undefined) {
      delete node[key];
    }
  });
}

/**
 * Finds an existing local variable or creates a new one.
 * @param localStyles - The categorized local styles.
 * @param value - The style value to find or create.
 * @param category - The style category (fills, text, strokes, effects, layout).
 * @returns The ID of the existing or new local variable.
 */
function findOrCreateLocalVar(
  localStyles: Record<string, StyleTypes>,
  value: StyleTypes,
  category: string,
): string {
  const jsonValue = JSON.stringify(value);
  const existingVarId = Object.keys(localStyles).find(
    (key) => JSON.stringify(localStyles[key]) === jsonValue,
  );

  if (existingVarId) {
    return existingVarId;
  }

  // Generate simple ID based on category
  const existingIds = Object.keys(localStyles).filter(id => id.startsWith(category.charAt(0)));
  const nextNumber = existingIds.length + 1;
  const newVarId = `${category.charAt(0)}${nextNumber}`;
  localStyles[newVarId] = value;
  return newVarId;
}

/**
 * Maps style types to their corresponding categories in the new structure
 */
const STYLE_CATEGORY_MAP: Record<StyleType, keyof CategorizedStyles> = {
  'stroke': 'strokes', 
  'effect': 'effects',
  'text': 'text',
  'layout': 'layout',
  'appearance': 'appearance'
};

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
  propertyName?: string, // Optional custom property name
) {
  const category = STYLE_CATEGORY_MAP[styleType];
  const styleKey = hasValue("styles", node) ? (node.styles as Record<string, string>)[styleType] : undefined;

  if (styleKey) {
    // It's a design system style - store just the value for now
    // Names will be added later in design-extractor.ts
    if (!context.globalVars.designSystem[category][styleKey]) {
      context.globalVars.designSystem[category][styleKey] = value;
    }
    const propName = propertyName || (styleType === 'text' ? 'textStyle' : `${styleType}s`);
    result[propName] = styleKey;
  } else {
    // It's a local style, find or create it
    const localVarId = findOrCreateLocalVar(
      context.globalVars.localStyles[category],
      value,
      category,
    );
    const propName = propertyName || (styleType === 'text' ? 'textStyle' : `${styleType}s`);
    result[propName] = localVarId;
  }
}

/**
 * Extracts layout-related properties from a node, including position and dimensions.
 */
export const layoutExtractor: ExtractorFn = (node, result, context) => {
  const layout = buildSimplifiedLayout(node, context.parent);
  
  // Add position and dimensions to layout if available
  if (hasValue("absoluteBoundingBox", node) && node.absoluteBoundingBox) {
    const bbox = node.absoluteBoundingBox;
    (layout as any).position = { x: bbox.x, y: bbox.y };
    (layout as any).dimensions = { width: bbox.width, height: bbox.height };
  }

  // Only process if we have meaningful layout data
  if (Object.keys(layout).length > 1) {
    processStyle(node, "layout", layout, result, context, "layout");
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

  // NOTE: fills (colors and images) are now processed in design-extractor.ts
  // This keeps the separation clean between visual properties and design system assets

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

  // opacity - deduplicate if not default value
  if (
    hasValue("opacity", node) &&
    typeof node.opacity === "number" &&
    node.opacity !== 1
  ) {
    processStyle(node, "appearance", node.opacity.toString(), result, context, "opacity");
  }

  // border radius - deduplicate
  if (hasValue("cornerRadius", node) && typeof node.cornerRadius === "number") {
    const borderRadiusValue = `${node.cornerRadius}px`;
    processStyle(node, "appearance", borderRadiusValue, result, context, "borderRadius");
  }
  if (hasValue("rectangleCornerRadii", node, isRectangleCornerRadii)) {
    const borderRadiusValue = `${node.rectangleCornerRadii[0]}px ${node.rectangleCornerRadii[1]}px ${node.rectangleCornerRadii[2]}px ${node.rectangleCornerRadii[3]}px`;
    processStyle(node, "appearance", borderRadiusValue, result, context, "borderRadius");
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

/**
 * Extracts mask-related properties from nodes.
 */
export const maskExtractor: ExtractorFn = (node, result, context) => {
  // Check if the node is a mask (has maskType property)
  
  if (hasValue("maskType", node)) {
    result.maskType = node.maskType as string;
    // Change the type to "MASK" to clearly identify it
    result.type = "MASK";
  }
};

/**
 * Extracts image references and stores them in globalVars.images.
 */
export const imagesExtractor: ExtractorFn = (node, result, context) => {
  // Check if node has fills with images
  if (
    hasValue("fills", node) &&
    Array.isArray(node.fills) &&
    node.fills.length
  ) {
    const hasChildren =
      hasValue("children", node) &&
      Array.isArray(node.children) &&
      node.children.length > 0;

    node.fills.forEach((fill, index) => {
      if (fill.type === "IMAGE" && fill.imageRef) {
        const imageData = parsePaint(fill, hasChildren);
        if (imageData && typeof imageData === 'object' && 'imageRef' in imageData) {
          // Store the image data with a unique key based on nodeId and fill index
          const imageKey = `${node.id}-${index}`;
          context.globalVars.images[imageKey] = {
            nodeId: node.id,
            nodeName: result.name,
            nodeType: node.type,
            fillIndex: index,
            imageRef: (imageData as any).imageRef,
            scaleMode: (imageData as any).scaleMode,
            ...(imageData as any).imageDownloadArguments
          };
        }
      }
    });
  }
};

/**
 * Cleans up empty/default properties to optimize JSON size.
 * Should be the last extractor to run.
 */
export const cleanupExtractor: ExtractorFn = (node, result, context) => {
  cleanupNode(result);
};

// -------------------- CONVENIENCE COMBINATIONS --------------------

/**
 * All extractors - replicates the current parseNode behavior with optimization.
 */
export const allExtractors = [layoutExtractor, textExtractor, visualsExtractor, componentExtractor, exportSettingsExtractor, visibilityExtractor, maskExtractor, imagesExtractor, cleanupExtractor];

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
