import "dotenv/config";
import { VoltAgent, VoltOpsClient, Agent, Memory } from "@voltagent/core";
import { LibSQLMemoryAdapter } from "@voltagent/libsql";
import { createPinoLogger } from "@voltagent/logger";
import { google } from "@ai-sdk/google";
import { honoServer } from "@voltagent/server-hono";
import { figmaValidationWorkflow } from "./workflows";
import { fetchAndValidateFigmaTool } from "./tools";

// Create a logger instance
const logger = createPinoLogger({
  name: "figmAgentReactCode",
  level: "info",
});

// Configure persistent memory (LibSQL / SQLite)
const memory = new Memory({
  storage: new LibSQLMemoryAdapter({
    url: "file:./.voltagent/memory.db",
    logger: logger.child({ component: "libsql" }),
  }),
});

const agent = new Agent({
  name: "figmAgentReactCode",
  instructions:
    "A helpful assistant that can validate Figma designs. " +
    "Use fetch_and_validate_figma tool to validate Figma design files.",
  model: google("gemini-2.0-flash-exp"),
  tools: [fetchAndValidateFigmaTool],
  memory,
});

// Initialize VoltAgent
new VoltAgent({
  agents: {
    agent,
  },
  workflows: {
    figmaValidationWorkflow,
  },
  server: honoServer(),
  logger,
  voltOpsClient: new VoltOpsClient({
    publicKey: process.env.VOLTAGENT_PUBLIC_KEY || "",
    secretKey: process.env.VOLTAGENT_SECRET_KEY || "",
  }),
});

logger.info("VoltAgent initialized with Figma validation workflow");
