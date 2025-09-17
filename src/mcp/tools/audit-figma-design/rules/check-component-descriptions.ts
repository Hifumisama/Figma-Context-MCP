/**
 * @file Component Descriptions Rule
 * @description This rule checks if components and component sets have descriptions.
 * @functionality It verifies that standalone components and component sets have
 * meaningful descriptions. Components that belong to a component set (variants) are
 * excluded as they inherit the description from their parent component set.
 */
import { Logger } from "~/utils/logger.js";
import type { AuditRule, AuditResult } from "../types.js";

const RULE_ID = 10;

export const checkComponentDescriptions: AuditRule = (context) => {
  const results: AuditResult[] = [];

  // Check individual components (exclude ANY component that belongs to a component set)
  if (context.components) {
    for (const [componentId, component] of Object.entries(context.components)) {
      // Skip ALL components that belong to a component set (including "default" variants)
      // Only the component set itself should have a description
      if (component.componentSetId) {
        continue;
      }

      if (!component.description || component.description.trim() === "") {
        results.push({
          ruleIds: [RULE_ID],
          nodeId: componentId,
          nodeName: component.name,
          moreInfos: {
            type: "standaloneComponent",
            componentKey: component.key
          }
        });
      }
    }
  }

  // Check component sets
  if (context.componentSets) {
    for (const [componentSetId, componentSet] of Object.entries(context.componentSets)) {
      if (!componentSet.description || componentSet.description.trim() === "") {
        results.push({
          ruleIds: [RULE_ID],
          nodeId: componentSetId,
          nodeName: componentSet.name,
          moreInfos: {
            type: "componentSet",
            componentKey: componentSet.key
          }
        });
      }
    }
  }

  return results;
};