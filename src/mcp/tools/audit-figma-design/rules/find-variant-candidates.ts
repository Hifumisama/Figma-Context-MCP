/**
 * @file Find Variant Candidates Rule
 * @description This rule identifies existing components that are structurally and dimensionally
 * similar, suggesting they should be combined into variants of a single component set.
 * @functionality It operates by first finding all defined `COMPONENT` nodes in the design.
 * It then creates a "profile" for each one, containing its structural signature and
 * dimensions. Components are then grouped first by identical structure, and then by
 * similar dimensions. Groups of similar components are flagged as strong candidates
 * for refactoring into a unified component with variants.
 * It will use a hybrid approach: programmatic filtering followed by LLM-based analysis.
 */
import type { AuditRule, AuditResult } from "../types.js";
import type { SimplifiedNode } from "../../../../extractors/types.js";

const RULE_ID = "find-variant-candidates";

interface ComponentProfile {
  id: string;
  name: string;
  node: SimplifiedNode;
  signature: string;
  width: number;
  height: number;
}

function generateSignature(node: SimplifiedNode): string {
  if (!node.children || node.children.length === 0) {
    return node.type;
  }
  const childSignatures = node.children.map(generateSignature).join(',');
  return `${node.type}(${childSignatures})`;
}

function areDimensionsSimilar(dim1: number, dim2: number, tolerance = 0.2): boolean {
    if (dim1 === 0 || dim2 === 0) return false;
    const ratio = dim1 / dim2;
    return ratio >= (1 - tolerance) && ratio <= (1 + tolerance);
}

export const findVariantCandidates: AuditRule = (context) => {
  const componentNodes: SimplifiedNode[] = [];

  // 1. Find all component nodes in the tree
  function findComponents(nodes: SimplifiedNode[]) {
      for (const node of nodes) {
          if (node.type === 'COMPONENT') {
              componentNodes.push(node);
          }
          if (node.children) {
              findComponents(node.children);
          }
      }
  }
  findComponents(context.nodes);
  
  // 2. Create a profile for each component node
  const profiles: ComponentProfile[] = componentNodes.map(node => ({
      id: node.id,
      name: node.name,
      node: node,
      signature: generateSignature(node),
      width: node.absoluteBoundingBox?.width ?? 0,
      height: node.absoluteBoundingBox?.height ?? 0,
  }));

  // 3. Group profiles by structural signature
  const profilesBySignature = new Map<string, ComponentProfile[]>();
  for (const profile of profiles) {
    if (!profilesBySignature.has(profile.signature)) {
      profilesBySignature.set(profile.signature, []);
    }
    profilesBySignature.get(profile.signature)!.push(profile);
  }

  // 4. Filter groups and find candidates for analysis
  const candidateGroups: ComponentProfile[][] = [];
  for (const group of profilesBySignature.values()) {
    if (group.length > 1) {
      const subGroups: ComponentProfile[][] = [];
      const processedIndices = new Set<number>();

      for(let i = 0; i < group.length; i++) {
          if (processedIndices.has(i)) continue;
          const refProfile = group[i];
          const similarGroup = [refProfile];
          processedIndices.add(i);

          for (let j = i + 1; j < group.length; j++) {
              if (processedIndices.has(j)) continue;
              const otherProfile = group[j];
              if (areDimensionsSimilar(otherProfile.width, refProfile.width) && areDimensionsSimilar(otherProfile.height, refProfile.height)) {
                  similarGroup.push(otherProfile);
                  processedIndices.add(j);
              }
          }
          if(similarGroup.length > 1) {
              subGroups.push(similarGroup);
          }
      }
      candidateGroups.push(...subGroups);
    }
  }

  const results: AuditResult[] = candidateGroups.map(group => {
    const componentNames = group.map(p => `"${p.name}"`).join(', ');
    const firstNode = group[0];
    return {
      ruleId: RULE_ID,
      message: `Found a group of ${group.length} structurally and dimensionally similar components that could be variants: ${componentNames}.`,
      nodeId: firstNode.id,
      nodeName: firstNode.name,
    };
  });

  return results;
};
