/**
 * @file Hidden Layers Rule
 * @description This rule identifies all layers that are set to be invisible (`visible: false`).
 * @functionality Hidden layers can often be obsolete or leftover elements from previous
 * design iterations. While sometimes used intentionally for variants, a large number of
 * hidden layers can clutter the file. This rule flags them for review, suggesting they
 * could potentially be removed to clean up the document.
 */
import type { AuditRule, AuditResult } from "../types.js";
import type { SimplifiedNode } from "../../../../extractors/types.js";

const RULE_ID = 5;

function checkNode(node: SimplifiedNode): AuditResult[] {
  let results: AuditResult[] = [];

  if (node.visible === false) {
    results.push({
      ruleIds: [RULE_ID],
      nodeId: node.id,
      nodeName: node.name,
      moreInfos: {}
    });
  }

  // We still check children of hidden nodes, as they might be toggled programmatically.
  if (node.children) {
    for (const child of node.children) {
      results = results.concat(checkNode(child));
    }
  }

  return results;
}

export const checkHiddenLayers: AuditRule = (context) => {
  const allResults: AuditResult[] = [];
  for (const node of context.nodes) {
    allResults.push(...checkNode(node));
  }
  return allResults;
};
