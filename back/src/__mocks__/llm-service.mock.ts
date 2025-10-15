/**
 * Mock for LLMService
 * Used in tests to avoid real Vertex AI API calls
 */
import { vi } from "vitest";
import type { LLMResponse } from "../services/llm-service.js";

export const createMockLLMService = () => {
  return {
    callLLM: vi.fn<(prompt: string, temperature?: number | null) => Promise<LLMResponse>>(),
  };
};

export type MockLLMService = ReturnType<typeof createMockLLMService>;

/**
 * Mock response for color naming analysis
 */
export const mockColorNamingResponse: LLMResponse = {
  success: true,
  data: {
    literalColors: [
      {
        styleId: "2:108",
        currentName: "Yellow",
        suggestions: ["primary", "accent", "warning"]
      }
    ]
  }
};

/**
 * Mock response for interaction states analysis
 */
export const mockInteractionStatesResponse: LLMResponse = {
  success: true,
  data: {
    componentsWithMissingStates: [
      {
        componentId: "11:40",
        componentName: "Button",
        missingStates: ["hover", "disabled"]
      }
    ]
  }
};

/**
 * Mock response for Figma description generation
 */
export const mockFigmaDescriptionResponse: LLMResponse = {
  success: true,
  data: {
    description: "This is a portfolio design with a clean layout featuring a hero section, about section, and work showcase."
  }
};
