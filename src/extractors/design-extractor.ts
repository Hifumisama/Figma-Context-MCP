import type {
  GetFileResponse,
  GetFileNodesResponse,
  Node as FigmaDocumentNode,
  Component,
  ComponentSet,
  Paint,
} from "@figma/rest-api-spec";
import { simplifyComponents, simplifyComponentSets } from "~/transformers/component.js";
import type { ExtractorFn, TraversalOptions, GlobalVars, SimplifiedDesign, ColorStyleInfo } from "./types.js";
import { extractFromDesign } from "./node-walker.js";
import { Logger } from "~/utils/logger.js";

/**
 * Convert RGB values (0-1) to hex color
 */
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (val: number) => Math.round(val * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/**
 * Convert a color string (hex or rgba) to ColorStyleInfo format
 */
function colorStringToInfo(colorString: string, styleName?: string): ColorStyleInfo {
  // Extract hex value from rgba() format or use hex directly
  let hexValue = colorString;

  if (colorString.startsWith('rgba(')) {
    // Parse rgba(r, g, b, a) to hex
    const match = colorString.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/);
    if (match) {
      const r = parseInt(match[1]);
      const g = parseInt(match[2]);
      const b = parseInt(match[3]);
      hexValue = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();
    }
  }

  return {
    name: styleName || hexValue,
    hexValue
  };
}

/**
 * Extract a complete SimplifiedDesign from raw Figma API response using extractors.
 */
export function simplifyRawFigmaObject(
  apiResponse: GetFileResponse | GetFileNodesResponse,
  nodeExtractors: ExtractorFn[],
  options: TraversalOptions = {},
): SimplifiedDesign {
  // Extract components, componentSets, and raw nodes from API response
  const { metadata, rawNodes, components, componentSets } = parseAPIResponse(apiResponse);

  // Process nodes using the flexible extractor system
  const globalVars: GlobalVars = {
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
  };
  const { nodes: extractedNodes, globalVars: finalGlobalVars } = extractFromDesign(
    rawNodes,
    nodeExtractors,
    options,
    globalVars,
  );

  // Add style names to the design system styles and extract colors
  // Find styles in the API response - they could be at the root level or in nodes
  let stylesObject: any = null;
  
  if ("styles" in apiResponse && apiResponse.styles) {
    stylesObject = apiResponse.styles;
  } else if ("nodes" in apiResponse && apiResponse.nodes) {
    // For GetFileNodesResponse, styles are in the individual node responses
    for (const nodeResponse of Object.values(apiResponse.nodes as any)) {
      if (nodeResponse && typeof nodeResponse === 'object' && 'styles' in nodeResponse) {
        stylesObject = (nodeResponse as any).styles;
        break; // Use the first one we find
      }
    }
  }
  
  if (stylesObject) {
    Logger.log('📊 Extracting colors from Figma API response');

    // Extract color styles from the document
    const extractColorsFromNode = (node: any) => {
      // Check if this node has fills
      if (node.fills && Array.isArray(node.fills) && node.fills.length > 0) {
        node.fills.forEach((paint: Paint) => {
          // Handle SOLID colors with design system styles
          if (paint && paint.type === 'SOLID' && paint.color && node.styles && node.styles.fill) {
            const fillStyleId = node.styles.fill;
            const style = stylesObject[fillStyleId];

            if (style && style.styleType === 'FILL') {
              const hexValue = rgbToHex(paint.color.r, paint.color.g, paint.color.b);

              // Store in designSystem.colors with styleId as key
              if (!finalGlobalVars.designSystem.colors[fillStyleId]) {
                finalGlobalVars.designSystem.colors[fillStyleId] = {
                  name: style.name || 'none',
                  hexValue
                };
              }
            }
          }
          // Handle SOLID colors without design system styles (local colors)
          else if (paint && paint.type === 'SOLID' && paint.color && (!node.styles || !node.styles.fill)) {
            const hexValue = rgbToHex(paint.color.r, paint.color.g, paint.color.b);

            // Store in localStyles.colors if not already present (all colors are objects now)
            const existingEntry = Object.entries(finalGlobalVars.localStyles.colors).find(
              ([_, c]) => typeof c === 'object' && c !== null && 'hexValue' in c && c.hexValue === hexValue
            );

            if (!existingEntry) {
              const colorId = `c${Object.keys(finalGlobalVars.localStyles.colors).length + 1}`;
              finalGlobalVars.localStyles.colors[colorId] = {
                name: hexValue, // Use hex as name for local colors
                hexValue
              };
            }
          }
        });
      }

      // Recursively check children
      if (node.children && Array.isArray(node.children)) {
        node.children.forEach(extractColorsFromNode);
      }
    };

    // Start extraction from all nodes
    rawNodes.forEach(extractColorsFromNode);

    const designColorCount = Object.keys(finalGlobalVars.designSystem.colors).length;
    const localColorCount = Object.keys(finalGlobalVars.localStyles.colors).length;
    Logger.log(`🎨 Extracted ${designColorCount} design system colors, ${localColorCount} local colors`);

    // Convert all colors to { name, hexValue } format
    // Design system colors
    Object.entries(finalGlobalVars.designSystem.colors).forEach(([styleId, colorValue]) => {
      const styleName = stylesObject[styleId]?.name || styleId;
      if (typeof colorValue === 'string') {
        finalGlobalVars.designSystem.colors[styleId] = colorStringToInfo(colorValue, styleName);
      } else if (Array.isArray(colorValue)) {
        // Multiple colors - convert each one
        finalGlobalVars.designSystem.colors[styleId] = {
          name: styleName,
          hexValue: (colorValue as string[]).map(c => colorStringToInfo(c).hexValue).join(', ')
        };
      }
    });

    // Local colors are already in { name, hexValue } format - no conversion needed

    const totalImageCount = Object.keys(finalGlobalVars.images).length;
    Logger.log(`🖼️ Total ${totalImageCount} images in globalVars.images`);

    // Iterate through all other categories in design system (text, strokes, layout)
    Object.entries(finalGlobalVars.designSystem).forEach(([categoryName, categoryStyles]) => {
      // Skip colors as they have their own processing
      if (categoryName === 'colors') return;

      for (const styleId in categoryStyles) {
        if (stylesObject[styleId]) {
          // Create a wrapper with name and value for design system styles
          const styleValue = categoryStyles[styleId];
          categoryStyles[styleId] = {
            name: stylesObject[styleId].name,
            value: styleValue
          } as any;
        }
      }
    });
  } else {
    Logger.log('⚠️ No styles object found in API response - skipping color extraction');
  }

  // Return complete design
  return {
    ...metadata,
    nodes: extractedNodes,
    components: simplifyComponents(components),
    componentSets: simplifyComponentSets(componentSets),
    globalVars: finalGlobalVars,
  };
}

/**
 * Parse the raw Figma API response to extract metadata, nodes, and components.
 */
function parseAPIResponse(data: GetFileResponse | GetFileNodesResponse) {
  const aggregatedComponents: Record<string, Component> = {};
  const aggregatedComponentSets: Record<string, ComponentSet> = {};
  let nodesToParse: Array<FigmaDocumentNode>;

  if ("nodes" in data) {
    // GetFileNodesResponse
    const nodeResponses = Object.values(data.nodes);
    nodeResponses.forEach((nodeResponse) => {
      if (nodeResponse.components) {
        Object.assign(aggregatedComponents, nodeResponse.components);
      }
      if (nodeResponse.componentSets) {
        Object.assign(aggregatedComponentSets, nodeResponse.componentSets);
      }
    });
    nodesToParse = nodeResponses.map((n) => n.document);
  } else {
    // GetFileResponse
    Object.assign(aggregatedComponents, data.components);
    Object.assign(aggregatedComponentSets, data.componentSets);
    nodesToParse = data.document.children;
  }

  const { name, lastModified, thumbnailUrl } = data;

  return {
    metadata: {
      name,
      lastModified,
      thumbnailUrl: thumbnailUrl || "",
    },
    rawNodes: nodesToParse,
    components: aggregatedComponents,
    componentSets: aggregatedComponentSets,
  };
}
