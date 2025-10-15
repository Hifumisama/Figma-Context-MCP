import { describe, it, expect } from "vitest";
import { simplifyComponents, simplifyComponentSets } from "./component.js";
import type { Component, ComponentSet } from "@figma/rest-api-spec";

describe("component.ts - Component transformation utilities", () => {
  describe("simplifyComponents", () => {
    it("should transform components to simplified format", () => {
      const components: Record<string, Component> = {
        "comp-1": {
          key: "abc123",
          name: "Button/Primary",
          description: "Primary action button",
          componentSetId: "set-1",
        } as Component,
        "comp-2": {
          key: "def456",
          name: "Button/Secondary",
          description: "Secondary action button",
          componentSetId: "set-1",
        } as Component,
      };

      const result = simplifyComponents(components);

      expect(result).toEqual({
        "comp-1": {
          id: "comp-1",
          key: "abc123",
          name: "Button/Primary",
          description: "Primary action button",
          componentSetId: "set-1",
        },
        "comp-2": {
          id: "comp-2",
          key: "def456",
          name: "Button/Secondary",
          description: "Secondary action button",
          componentSetId: "set-1",
        },
      });
    });

    it("should handle components without description or componentSetId", () => {
      const components: Record<string, Component> = {
        "comp-1": {
          key: "xyz789",
          name: "Icon/Star",
        } as Component,
      };

      const result = simplifyComponents(components);

      expect(result).toEqual({
        "comp-1": {
          id: "comp-1",
          key: "xyz789",
          name: "Icon/Star",
          description: undefined,
          componentSetId: undefined,
        },
      });
    });

    it("should handle empty component records", () => {
      const result = simplifyComponents({});

      expect(result).toEqual({});
    });
  });

  describe("simplifyComponentSets", () => {
    it("should transform component sets to simplified format", () => {
      const componentSets: Record<string, ComponentSet> = {
        "set-1": {
          key: "set-abc",
          name: "Button",
          description: "Button component variants",
        } as ComponentSet,
        "set-2": {
          key: "set-def",
          name: "Input",
          description: "Input field variants",
        } as ComponentSet,
      };

      const result = simplifyComponentSets(componentSets);

      expect(result).toEqual({
        "set-1": {
          id: "set-1",
          key: "set-abc",
          name: "Button",
          description: "Button component variants",
        },
        "set-2": {
          id: "set-2",
          key: "set-def",
          name: "Input",
          description: "Input field variants",
        },
      });
    });

    it("should handle component sets without description", () => {
      const componentSets: Record<string, ComponentSet> = {
        "set-1": {
          key: "set-xyz",
          name: "Icon",
        } as ComponentSet,
      };

      const result = simplifyComponentSets(componentSets);

      expect(result).toEqual({
        "set-1": {
          id: "set-1",
          key: "set-xyz",
          name: "Icon",
          description: undefined,
        },
      });
    });

    it("should handle empty component set records", () => {
      const result = simplifyComponentSets({});

      expect(result).toEqual({});
    });
  });
});
