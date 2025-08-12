/**
 * @file Find Duplicates Rule
 * @description This rule identifies groups of elements that are structurally identical but have
 * not been converted into reusable components.
 * @functionality It works by generating a "structural signature" for each non-component container
 * node (e.g., `FRAME(TEXT,RECTANGLE)`). It then groups nodes with identical signatures.
 * If a group contains more than one node, it means they are duplicates and should be
 * converted into a single component to enforce consistency and maintainability.
 */
import type { AuditRule, AuditResult } from "../types.js";
import type { SimplifiedNode } from "../../../../extractors/types.js";

const RULE_ID = "find-duplicates";

// Generates a structural signature for a node.
function generateSignature(node: SimplifiedNode): string {
  if (!node.children || node.children.length === 0) {
    return node.type;
  }
  const childSignatures = node.children.map(generateSignature).join(',');
  return `${node.type}(${childSignatures})`;
}

export const findDuplicates: AuditRule = (context) => {
  const signatures = new Map<string, SimplifiedNode[]>();
  const results: AuditResult[] = [];
  
  // Helper to traverse all nodes and collect signatures
  function collectSignatures(node: SimplifiedNode) {
    // We only care about containers that are not already components
    const isCandidate = (node.type === 'FRAME' || node.type === 'GROUP') && !node.componentId;
    if (isCandidate && node.children && node.children.length > 0) {
      const signature = generateSignature(node);
      if (!signatures.has(signature)) {
        signatures.set(signature, []);
      }
      signatures.get(signature)!.push(node);
    }

    if (node.children) {
      for (const child of node.children) {
        collectSignatures(child);
      }
    }
  }

  // Start collection from the root nodes
  for (const node of context.nodes) {
    collectSignatures(node);
  }

  // Process signatures to find duplicates
  for (const [signature, nodes] of signatures.entries()) {
    if (nodes.length > 1) {
      const nodeNames = nodes.map(n => `"${n.name}" (ID: ${n.id})`).join(', ');
      // We report on the first node of the duplicated set.
      const firstNode = nodes[0];
      results.push({
        ruleId: RULE_ID,
        message: `Found ${nodes.length} layers with identical structure. These should be converted to a single component. Layers: ${nodeNames}`,
        nodeId: firstNode.id,
        nodeName: firstNode.name,
      });
    }
  }

  return results;
};
