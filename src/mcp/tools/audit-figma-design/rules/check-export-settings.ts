/**
 * @file Missing Export Settings Rule
 * @description This rule checks for nodes that are likely assets (icons, images) but do not
 * have any export settings defined in Figma.
 * @functionality It identifies potential assets based on node type (e.g., VECTOR, COMPONENT),
 * naming conventions (e.g., contains "icon"), or if they have an image fill. It then flags
 * any of these candidates that are missing `exportSettings`, which is crucial for a smooth
 * developer handoff.
 */
import type { AuditRule, AuditResult } from "../types.js";
import type { SimplifiedNode } from "../../../../extractors/types.js";

const RULE_ID = "missing-export-settings";

// These node types are often assets that should be exportable.
const ASSET_TYPES = ['VECTOR', 'COMPONENT', 'INSTANCE', 'RECTANGLE', 'IMAGE-SVG'];
// Icons are often named with a convention.
const ICON_NAME_REGEX = /icon/i;

// Helper function to recursively check a node and its children
function checkNode(node: SimplifiedNode): AuditResult[] {
  let results: AuditResult[] = [];

  const isPotentialAsset = ASSET_TYPES.includes(node.type) || ICON_NAME_REGEX.test(node.name);
  const hasImageFill = node.fills && node.fills.includes('IMAGE');

  // A node is an asset if it's of a certain type, or is named like an icon, or has an image fill.
  // We then check if it's missing export settings.
  if ((isPotentialAsset || hasImageFill) && !node.exportSettings) {
    results.push({
      ruleId: RULE_ID,
      message: `The layer "${node.name}" is likely an asset but is missing export settings.`,
      nodeId: node.id,
      nodeName: node.name,
    });
  }

  // Recursively check children
  if (node.children) {
    for (const child of node.children) {
      results = results.concat(checkNode(child));
    }
  }

  return results;
}

export const checkExportSettings: AuditRule = (context) => {
  const allResults: AuditResult[] = [];
  for (const node of context.nodes) {
    allResults.push(...checkNode(node));
  }
  return allResults;
};
