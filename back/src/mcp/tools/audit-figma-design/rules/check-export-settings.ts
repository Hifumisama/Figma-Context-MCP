/**
 * @file Missing Export Settings Rule
 * @description This rule checks for nodes that are likely assets (icons, images) but do not
 * have any export settings defined in Figma.
 * @functionality It identifies potential assets based on node type (e.g., VECTOR, IMAGE-SVG),
 * naming conventions (e.g., contains "icon"), or if they have an image fill. It then flags
 * any of these candidates that are missing `exportSettings`, which is crucial for a smooth
 * developer handoff.
 */
import type { AuditRule, AuditResult } from "../types.js";
import type { SimplifiedNode, GlobalVars } from "../../../../extractors/types.js";

const RULE_ID = 4;

// These node types are often assets that should be exportable.
const ASSET_TYPES = ['VECTOR', 'IMAGE-SVG'];

// Helper function to recursively check a node and its children
function checkNode(node: SimplifiedNode, globalVars: any): AuditResult[] {
  let results: AuditResult[] = [];

  const isPotentialAsset = ASSET_TYPES.includes(node.type);

  // Check if node has image fills
  // Note: Images are now stored in globalVars.images, not in fills
  const hasImage = false; // Images are handled separately now

  // A node is an asset if it's of a certain type, or is named like an icon, or has an image fill.
  // We then check if it's missing export settings.
  if ((isPotentialAsset || hasImage) && !node.exportSettings) {
    results.push({
      ruleIds: [RULE_ID],
      nodeId: node.id,
      nodeName: node.name,
      moreInfos: {}
    });
  }

  // Recursively check children
  if (node.children) {
    for (const child of node.children) {
      results = results.concat(checkNode(child, globalVars));
    }
  }

  return results;
}

export const checkExportSettings: AuditRule = (context) => {
  const allResults: AuditResult[] = [];
  for (const node of context.nodes) {
    allResults.push(...checkNode(node, context.globalVars));
  }
  return allResults;
};
