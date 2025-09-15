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
      effects: {},
      layout: {},
      appearance: {},
      colors: {},
      images: {}
    },
    localStyles: {
      text: {},
      strokes: {},
      effects: {},
      layout: {},
      appearance: {}
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
    
    // Extract color and image styles from the document
    const extractAssetsFromNode = (node: any) => {
      // Check if this node has fills
      if (node.fills && Array.isArray(node.fills) && node.fills.length > 0) {
        const paint = node.fills[0];
        
        // Handle SOLID colors with styles
        if (paint && paint.type === 'SOLID' && paint.color && node.styles && node.styles.fill) {
          const fillStyleId = node.styles.fill;
          const style = stylesObject[fillStyleId];
          
          if (style && style.styleType === 'FILL') {
            const hexValue = rgbToHex(paint.color.r, paint.color.g, paint.color.b);
            
            // Store in colors with styleId as key
            if (!finalGlobalVars.designSystem.colors[fillStyleId]) {
              finalGlobalVars.designSystem.colors[fillStyleId] = {
                name: style.name || 'none',
                hexValue
              };
            }
          }
        }
        
        // Handle IMAGE fills
        else if (paint && paint.type === 'IMAGE' && paint.imageRef) {
          // Generate a unique key for the image (could be imageRef or a generated ID)
          const imageKey = paint.imageRef;
          
          if (!finalGlobalVars.designSystem.images[imageKey]) {
            finalGlobalVars.designSystem.images[imageKey] = {
              name: node.name ? `Image from ${node.name}` : undefined,
              imageRef: paint.imageRef,
              scaleMode: paint.scaleMode,
              objectFit: paint.objectFit,
              isBackground: paint.isBackground || false,
              imageDownloadArguments: {
                needsCropping: false,
                requiresImageDimensions: false
              }
            };
          }
        }
      }
      
      // Recursively check children
      if (node.children && Array.isArray(node.children)) {
        node.children.forEach(extractAssetsFromNode);
      }
    };
    
    // Start extraction from all nodes
    rawNodes.forEach(extractAssetsFromNode);
    
    const colorCount = Object.keys(finalGlobalVars.designSystem.colors).length;
    const imageCount = Object.keys(finalGlobalVars.designSystem.images).length;
    Logger.log(`🎨 Extracted ${colorCount} color styles and ${imageCount} image assets`);
    
    // Iterate through all categories in design system (except colors and images which are already processed)
    Object.entries(finalGlobalVars.designSystem).forEach(([categoryName, categoryStyles]) => {
      // Skip colors and images as they have their own structure
      if (categoryName === 'colors' || categoryName === 'images') return;
      
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
