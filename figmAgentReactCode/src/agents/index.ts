/**
 * FIGMA TO REACT PIPELINE - AGENTS
 *
 * 5 agents généralistes qui transforment une maquette Figma en application React.
 *
 * Pipeline simplifié :
 * 1. Script Fetch + Validation (pas d'agent, utilitaire direct)
 * 2. 🏗️ Project Architect (Agent généraliste)
 * 3. 🧪 Test Engineer (Agent généraliste)
 * 4. 💻 Component Developer (Agent itératif)
 * 5. 📄 Page Assembler (Agent spécialisé)
 * 6. ⚡ Build Engineer (Agent généraliste)
 */

// ============================================================================
// IMPORTS
// ============================================================================

import {
	architecturePlanSchema,
	projectArchitectAgent,
} from "./project-architect";
import type { ArchitecturePlan } from "./project-architect";

import { testEngineerAgent, testStrategySchema } from "./test-engineer";
import type { TestStrategy } from "./test-engineer";

import {
	componentDeveloperAgent,
	componentResultSchema,
	componentTaskSchema,
} from "./component-developer";
import type { ComponentResult, ComponentTask } from "./component-developer";

import {
	assemblyResultSchema,
	pageAssemblerAgent,
	pageDefinitionSchema,
} from "./page-assembler";
import type { AssemblyResult, PageDefinition } from "./page-assembler";

import { buildEngineerAgent, buildReportSchema } from "./build-engineer";
import type { BuildReport } from "./build-engineer";

// ============================================================================
// EXPORTS
// ============================================================================

export { projectArchitectAgent, architecturePlanSchema };
export type { ArchitecturePlan };

export { testEngineerAgent, testStrategySchema };
export type { TestStrategy };

export { componentDeveloperAgent, componentTaskSchema, componentResultSchema };
export type { ComponentTask, ComponentResult };

export { pageAssemblerAgent, pageDefinitionSchema, assemblyResultSchema };
export type { PageDefinition, AssemblyResult };

export { buildEngineerAgent, buildReportSchema };
export type { BuildReport };

// ============================================================================
// PIPELINE CONFIGURATION
// ============================================================================

/**
 * Configuration du pipeline complet
 *
 * Ordre d'exécution :
 * 1. Project Architect → Analyse + Initialisation + Design System
 * 2. Test Engineer → Stratégie de tests + Écriture des tests TDD
 * 3. Component Developer → Implémentation itérative (appelé N fois)
 * 4. Page Assembler → Composition des pages + Routing
 * 5. Build Engineer → Build de production + Optimisations
 */
export const PIPELINE_AGENTS = {
	projectArchitect: projectArchitectAgent,
	testEngineer: testEngineerAgent,
	componentDeveloper: componentDeveloperAgent,
	pageAssembler: pageAssemblerAgent,
	buildEngineer: buildEngineerAgent,
} as const;

/**
 * Métadonnées des agents pour le système d'orchestration
 */
export const AGENT_METADATA = {
	projectArchitect: {
		id: "project-architect",
		name: "Project Architect",
		stage: 2,
		model: "gemini-2.0-flash-exp",
		tools: ["Read", "Write", "Bash"],
		iterative: false,
		description: "Analyse Figma, crée le projet React, génère Tailwind config",
	},
	testEngineer: {
		id: "test-engineer",
		name: "Test Engineer",
		stage: 3,
		model: "gemini-2.0-flash-exp",
		tools: ["Read", "Write"],
		iterative: false,
		description:
			"Définit la stratégie de tests et écrit les fichiers .test.tsx",
	},
	componentDeveloper: {
		id: "component-developer",
		name: "Component Developer",
		stage: 4,
		model: "gemini-1.5-pro",
		tools: ["Read", "Write", "Bash"],
		iterative: true,
		description: "Implémente les composants en boucle TDD (appelé N fois)",
	},
	pageAssembler: {
		id: "page-assembler",
		name: "Page Assembler",
		stage: 5,
		model: "gemini-2.0-flash-exp",
		tools: ["Read", "Write"],
		iterative: false,
		description: "Compose les pages et configure React Router",
	},
	buildEngineer: {
		id: "build-engineer",
		name: "Build Engineer",
		stage: 6,
		model: "gemini-2.0-flash-exp",
		tools: ["Read", "Bash"],
		iterative: false,
		description:
			"Lance le build de production et génère le rapport d'optimisation",
	},
} as const;

/**
 * Helper pour obtenir un agent par son ID
 */
export function getAgent(agentId: keyof typeof PIPELINE_AGENTS) {
	return PIPELINE_AGENTS[agentId];
}

/**
 * Helper pour obtenir les métadonnées d'un agent
 */
export function getAgentMetadata(agentId: keyof typeof AGENT_METADATA) {
	return AGENT_METADATA[agentId];
}

/**
 * Helper pour vérifier si un agent est itératif
 */
export function isIterativeAgent(
	agentId: keyof typeof AGENT_METADATA,
): boolean {
	return AGENT_METADATA[agentId].iterative;
}
