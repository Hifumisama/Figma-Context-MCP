import type {
  GetFileResponse,
  GetFileNodesResponse,
  Node as FigmaDocumentNode,
  Component,
  ComponentSet,
} from "@figma/rest-api-spec";
import { simplifyComponents, simplifyComponentSets } from "~/transformers/component.js";
import type { ExtractorFn, TraversalOptions, GlobalVars, SimplifiedDesign } from "./types.js";
import { extractFromDesign } from "./node-walker.js";

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
      fills: {},
      text: {},
      strokes: {},
      effects: {},
      layout: {},
      appearance: {}
    },
    localStyles: {
      fills: {},
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

  // Add style names to the design system styles
  if ("styles" in apiResponse && apiResponse.styles) {
    // Iterate through all categories in design system
    Object.values(finalGlobalVars.designSystem).forEach(categoryStyles => {
      for (const styleId in categoryStyles) {
        if (apiResponse.styles[styleId]) {
          // Create a wrapper with name and value for design system styles
          const styleValue = categoryStyles[styleId];
          categoryStyles[styleId] = {
            name: apiResponse.styles[styleId].name,
            value: styleValue
          } as any;
        }
      }
    });
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
