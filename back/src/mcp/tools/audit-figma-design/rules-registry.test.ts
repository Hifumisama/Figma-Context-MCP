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
    it("should return correct rule for valid IDs", () => {
      expect(getRuleDefinition(1)?.name).toBe("Utilisation d'Auto Layout");
      expect(getRuleDefinition(9)?.name).toBe("Nommage des couleurs");
    });

    it("should return undefined for invalid IDs", () => {
      expect(getRuleDefinition(999)).toBeUndefined();
      expect(getRuleDefinition(5)).toBeUndefined();
      expect(getRuleDefinition(0)).toBeUndefined();
    });
  });

  describe("getAllRuleDefinitions", () => {
    it("should return all 8 rules", () => {
      const rules = getAllRuleDefinitions();
      expect(rules).toHaveLength(8);
      expect(rules).toBe(RULES_REGISTRY);
    });
  });

  describe("getRuleDefinitionsByCategory", () => {
    it("should filter rules by category", () => {
      const standardRules = getRuleDefinitionsByCategory("standard");
      const aiBasedRules = getRuleDefinitionsByCategory("ai-based");

      expect(standardRules).toHaveLength(7);
      expect(aiBasedRules).toHaveLength(1);
      expect(aiBasedRules[0].name).toBe("Nommage des couleurs");
    });

    it("should return new arrays each time", () => {
      const rules1 = getRuleDefinitionsByCategory("standard");
      const rules2 = getRuleDefinitionsByCategory("standard");
      expect(rules1).not.toBe(rules2);
    });
  });

  describe("getEnabledRuleDefinitions", () => {
    it("should return only enabled rules", () => {
      expect(getEnabledRuleDefinitions()).toHaveLength(8);

      updateRuleState(1, "disabled");
      updateRuleState(2, "error", "Test error");

      const enabledRules = getEnabledRuleDefinitions();
      expect(enabledRules).toHaveLength(6);
      expect(enabledRules.find(r => r.id === 1)).toBeUndefined();
      expect(enabledRules.find(r => r.id === 2)).toBeUndefined();
    });
  });

  describe("updateRuleState", () => {
    it("should update state and return true for valid IDs", () => {
      expect(updateRuleState(1, "disabled")).toBe(true);
      expect(getRuleDefinition(1)?.state).toBe("disabled");

      expect(updateRuleState(2, "error", "Test error")).toBe(true);
      expect(getRuleDefinition(2)?.state).toBe("error");
      expect(getRuleDefinition(2)?.errorMessage).toBe("Test error");
    });

    it("should remove errorMessage when not provided", () => {
      updateRuleState(3, "error", "Initial error");
      expect(getRuleDefinition(3)?.errorMessage).toBe("Initial error");

      updateRuleState(3, "enabled");
      expect(getRuleDefinition(3)?.errorMessage).toBeUndefined();
    });

    it("should return false for invalid IDs", () => {
      expect(updateRuleState(999, "disabled")).toBe(false);
      expect(updateRuleState(5, "disabled")).toBe(false);
    });

    it("should handle multiple state updates independently", () => {
      updateRuleState(10, "disabled");
      updateRuleState(11, "error", "Error message");

      expect(getRuleDefinition(10)?.state).toBe("disabled");
      expect(getRuleDefinition(11)?.state).toBe("error");
      expect(getRuleDefinition(11)?.errorMessage).toBe("Error message");
    });
  });

  describe("Integration", () => {
    it("should maintain state changes across different functions", () => {
      updateRuleState(1, "disabled");
      updateRuleState(9, "error", "Test");

      expect(getEnabledRuleDefinitions()).toHaveLength(6);

      const standardRules = getRuleDefinitionsByCategory("standard");
      expect(standardRules.find(r => r.id === 1)?.state).toBe("disabled");

      const aiBasedRules = getRuleDefinitionsByCategory("ai-based");
      expect(aiBasedRules[0].state).toBe("error");
    });
  });
});

