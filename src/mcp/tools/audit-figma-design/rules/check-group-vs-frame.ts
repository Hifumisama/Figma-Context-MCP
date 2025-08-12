/**
 * @file Group vs. Frame Rule
 * @description This rule suggests converting `GROUP` nodes with multiple children into `FRAME` nodes.
 * @functionality A `FRAME` is a more powerful container than a `GROUP` as it can have its
 * own layout properties (like Auto Layout), styles, and clipping. This rule identifies
 * `GROUP` nodes that are likely being used as containers and suggests converting them
 * to `FRAME`s to improve structural quality and enable better responsive behavior.
 */
import type { AuditRule, AuditResult } from "../types.js";
import type { SimplifiedNode } from "../../../../extractors/types.js";

const RULE_ID = "group-vs-frame";

function checkNode(node: SimplifiedNode): AuditResult[] {
  let results: AuditResult[] = [];

  if (node.type === 'GROUP' && node.children && node.children.length > 1) {
    results.push({
      ruleId: RULE_ID,
      message: `The layer "${node.name}" is a 'GROUP' with multiple children. Consider converting it to a 'FRAME' to enable Auto Layout and other container properties.`,
      nodeId: node.id,
      nodeName: node.name,
    });
  }

  if (node.children) {
    for (const child of node.children) {
      results = results.concat(checkNode(child));
    }
  }

  return results;
}

export const checkGroupVsFrame: AuditRule = (context) => {
  const allResults: AuditResult[] = [];
  for (const node of context.nodes) {
    allResults.push(...checkNode(node));
  }
  return allResults;
};
