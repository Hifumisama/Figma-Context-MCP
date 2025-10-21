/**
 * Figma Validation Workflow
 *
 * This workflow wraps the Figma validation process using an agent.
 * It's Step 1 of the Figma to React pipeline.
 *
 * Purpose:
 * - Validate Figma designs
 * - Store validated JSON in agent memory
 * - Save to file system for backup
 *
 * Next Steps (Future Workflows):
 * - Architect Agent (Step 2)
 * - Initializer Agent (Step 3)
 * - Design System Agent (Step 4)
 * - TDD Loop (Steps 5-9)
 * - Assembly & Optimization (Steps 10-11)
 */

import { createWorkflowChain, Agent, Memory } from "@voltagent/core";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { fetchAndValidateFigmaTool } from "../tools";
import { LibSQLMemoryAdapter } from "@voltagent/libsql";
import { createPinoLogger } from "@voltagent/logger";

// Create a dedicated memory instance for the validation agent
const logger = createPinoLogger({
  name: "figma-validation-workflow",
  level: "info",
});

const validationMemory = new Memory({
  storage: new LibSQLMemoryAdapter({
    url: "file:./.voltagent/memory.db",
    logger: logger.child({ component: "libsql" }),
  }),
});

// Create a simple agent that uses the validation tool
const validationAgent = new Agent({
  name: "Figma Validator",
  instructions:
    "You are a Figma design validator. Use the fetch_and_validate_figma tool to validate Figma designs. " +
    "The tool will:\n" +
    "1. Fetch data from the MCP Figma server\n" +
    "2. Validate the JSON structure\n" +
    "3. Return the result with the complete data included\n\n" +
    "The returned data will be stored in your conversational memory automatically. " +
    "Just call the tool with the provided URL and return the complete result to the user.",
  model: google("gemini-2.0-flash-exp"),
  tools: [fetchAndValidateFigmaTool],
  memory: validationMemory,
  maxSteps: 2,
});

export const figmaValidationWorkflow = createWorkflowChain({
  id: "figma-validation",
  name: "Figma Design Validation",
  purpose:
    "Fetches and validates a Figma design file using direct MCP calls (zero AI tokens for validation logic)",
  input: z.object({
    figmaUrl: z
      .string()
      .url()
      .describe("The Figma file, page, or node URL to validate"),
  }),
  result: z.object({
    success: z.boolean(),
    message: z.string(),
    data: z.any().optional(),
  }),
}).andAgent(
  async (context) =>
    `Please validate this Figma design: ${context.data.figmaUrl}. Use the fetch_and_validate_figma tool.`,
  validationAgent,
  {
    schema: z.object({
      success: z.boolean(),
      message: z.string(),
      data: z.any().optional(),
    }),
  }
);
