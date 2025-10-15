import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  RULES_REGISTRY,
  getRuleDefinition,
  getAllRuleDefinitions,
  getRuleDefinitionsByCategory,
  getEnabledRuleDefinitions,
  updateRuleState
} from "./rules-registry.js";
import type { RuleDefinition } from "./types.js";

describe("rules-registry", () => {
  // Store original states to restore after tests that modify the registry
  let originalStates: Map<number, { state: RuleDefinition['state']; errorMessage?: string }>;
  const TOTAL_RULES = RULES_REGISTRY.length;
  const STANDARD_RULES_COUNT = RULES_REGISTRY.filter(r => r.category === "standard").length;
  const AI_BASED_RULES_COUNT = RULES_REGISTRY.filter(r => r.category === "ai-based").length;

  beforeEach(() => {
    originalStates = new Map();
    RULES_REGISTRY.forEach(rule => {
      originalStates.set(rule.id, {
        state: rule.state,
        errorMessage: rule.errorMessage
      });
    });
  });

  afterEach(() => {
    originalStates.forEach((original, ruleId) => {
      const rule = RULES_REGISTRY.find(r => r.id === ruleId);
      if (rule) {
        rule.state = original.state;
        if (original.errorMessage) {
          rule.errorMessage = original.errorMessage;
        } else {
          delete rule.errorMessage;
        }
      }
    });
  });
  
  describe("getRuleDefinition", () => {
    it("should return rule for valid ID and undefined for invalid ID", () => {
      expect(getRuleDefinition(1)?.name).toBe("Utilisation d'Auto Layout");
      expect(getRuleDefinition(999)).toBeUndefined();
    });
  });

  describe("getAllRuleDefinitions", () => {
    it("should return all rules from registry", () => {
      const rules = getAllRuleDefinitions();
      expect(rules).toHaveLength(TOTAL_RULES);
      expect(rules).toBe(RULES_REGISTRY);
    });
  });

  describe("getRuleDefinitionsByCategory", () => {
    it("should filter rules by category correctly", () => {
      const standardRules = getRuleDefinitionsByCategory("standard");
      const aiBasedRules = getRuleDefinitionsByCategory("ai-based");

      expect(standardRules).toHaveLength(STANDARD_RULES_COUNT);
      expect(aiBasedRules).toHaveLength(AI_BASED_RULES_COUNT);

      // Vérifie que toutes les règles retournées ont la bonne catégorie
      expect(standardRules.every(r => r.category === "standard")).toBe(true);
      expect(aiBasedRules.every(r => r.category === "ai-based")).toBe(true);
    });
  });

  describe("getEnabledRuleDefinitions", () => {
    it("should return only enabled rules", () => {
      const initialEnabledCount = getEnabledRuleDefinitions().length;
      expect(initialEnabledCount).toBe(TOTAL_RULES);

      updateRuleState(1, "disabled");
      updateRuleState(2, "error", "Test error");

      const enabledRules = getEnabledRuleDefinitions();
      expect(enabledRules).toHaveLength(initialEnabledCount - 2);
      expect(enabledRules.find(r => r.id === 1)).toBeUndefined();
      expect(enabledRules.find(r => r.id === 2)).toBeUndefined();
    });
  });

  describe("updateRuleState", () => {
    it("should update state with errorMessage for valid IDs", () => {
      expect(updateRuleState(1, "disabled")).toBe(true);
      expect(getRuleDefinition(1)?.state).toBe("disabled");

      expect(updateRuleState(2, "error", "Test error")).toBe(true);
      expect(getRuleDefinition(2)?.state).toBe("error");
      expect(getRuleDefinition(2)?.errorMessage).toBe("Test error");
    });

    it("should return false for invalid IDs", () => {
      expect(updateRuleState(999, "disabled")).toBe(false);
    });
  });

  describe("Integration", () => {
    it("should maintain state changes across different functions", () => {
      const initialEnabledCount = getEnabledRuleDefinitions().length;

      updateRuleState(1, "disabled");
      updateRuleState(9, "error", "Test");

      expect(getEnabledRuleDefinitions()).toHaveLength(initialEnabledCount - 2);

      const standardRules = getRuleDefinitionsByCategory("standard");
      expect(standardRules.find(r => r.id === 1)?.state).toBe("disabled");

      const aiBasedRules = getRuleDefinitionsByCategory("ai-based");
      const rule9 = aiBasedRules.find(r => r.id === 9);
      expect(rule9?.state).toBe("error");
      expect(rule9?.errorMessage).toBe("Test");
    });
  });
});

