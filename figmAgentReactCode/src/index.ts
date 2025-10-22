import "dotenv/config";
import { VoltAgent, VoltOpsClient } from "@voltagent/core";
import { createPinoLogger } from "@voltagent/logger";
import { honoServer } from "@voltagent/server-hono";
import {
	buildEngineerAgent,
	componentDeveloperAgent,
	pageAssemblerAgent,
	projectArchitectAgent,
	testEngineerAgent,
} from "./agents";
import { figmaToReactWorkflow } from "./workflows";

// Create a logger instance
const logger = createPinoLogger({
	name: "figmAgentReactCode",
	level: "info",
});

// Initialize VoltAgent with all 5 specialized agents
new VoltAgent({
	agents: {
		// Pipeline Agents (5 agents généralistes)
		projectArchitect: projectArchitectAgent,
		testEngineer: testEngineerAgent,
		componentDeveloper: componentDeveloperAgent,
		pageAssembler: pageAssemblerAgent,
		buildEngineer: buildEngineerAgent,
	},
	workflows: {
		// Complete Figma to React Pipeline
		figmaToReactWorkflow,
	},
	server: honoServer(),
	logger,
	voltOpsClient: new VoltOpsClient({
		publicKey: process.env.VOLTAGENT_PUBLIC_KEY || "",
		secretKey: process.env.VOLTAGENT_SECRET_KEY || "",
	}),
});

logger.info("🚀 VoltAgent initialized with 5 pipeline agents and full workflow");
logger.info("📋 Available agents:");
logger.info("   1. 🏗️  Project Architect (Fetch + Analyze + Initialize)");
logger.info("   2. 🧪 Test Engineer (TDD Test Writing)");
logger.info("   3. 💻 Component Developer (Iterative Implementation)");
logger.info("   4. 📄 Page Assembler (Routing + Pages)");
logger.info("   5. ⚡ Build Engineer (Production Build + Optimization)");
