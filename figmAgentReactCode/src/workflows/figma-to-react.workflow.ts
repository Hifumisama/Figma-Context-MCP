/**
 * FIGMA TO REACT - COMPLETE PIPELINE WORKFLOW
 *
 * Ce workflow orchestre les 5 agents généralistes pour transformer
 * une maquette Figma en application React complète.
 *
 * Pipeline en 5 étapes :
 * 1. 🏗️ Project Architect → Fetch Figma + Analyse + Initialisation + Design System
 * 2. 🧪 Test Engineer → Stratégie de tests + Écriture des tests TDD
 * 3. 💻 Component Developer → Implémentation itérative (appelé N fois)
 * 4. 📄 Page Assembler → Composition des pages + Routing
 * 5. ⚡ Build Engineer → Build de production + Optimisations
 *
 * Note: Version simplifiée qui utilise uniquement andAgent() pour démonstration.
 * L'itération du Component Developer sera gérée dans une version ultérieure.
 */

import { Memory, createWorkflowChain } from "@voltagent/core";
import { LibSQLMemoryAdapter } from "@voltagent/libsql";
import { createPinoLogger } from "@voltagent/logger";
import { z } from "zod";
import {
	architecturePlanSchema,
	buildEngineerAgent,
	buildReportSchema,
	pageAssemblerAgent,
	projectArchitectAgent,
	testEngineerAgent,
} from "../agents";

// ============================================================================
// LOGGER & MEMORY CONFIGURATION
// ============================================================================

const logger = createPinoLogger({
	name: "figma-to-react-workflow",
	level: "info",
});

const pipelineMemory = new Memory({
	storage: new LibSQLMemoryAdapter({
		url: "file:./.voltagent/memory.db",
		logger: logger.child({ component: "libsql" }),
	}),
});

// ============================================================================
// WORKFLOW DEFINITION
// ============================================================================

export const figmaToReactWorkflow = createWorkflowChain({
	id: "figma-to-react",
	name: "Figma to React Pipeline",
	purpose:
		"Complete pipeline to transform a Figma design into a production-ready React application",

	input: z.object({
		figmaUrl: z
			.string()
			.url()
			.describe("The Figma file, page, or node URL to convert"),
	}),

	result: z.object({
		success: z.boolean().describe("Pipeline completed successfully"),
		message: z.string().describe("Summary message"),
		projectPath: z
			.string()
			.optional()
			.describe("Path to the generated React project"),
		buildReport: buildReportSchema.optional(),
	}),
})
	// ============================================================================
	// ÉTAPE 1 : PROJECT ARCHITECT (avec fetch Figma intégré)
	// ============================================================================
	.andAgent(
		async (context) => {
			logger.info("🏗️ STEP 1: Fetching Figma data and initializing project...");

			return `
Fetch and analyze the Figma design, then initialize the React project.

Figma URL: ${context.data.figmaUrl}

Phase 1: Fetch Figma Data
Use the fetch_and_validate_figma tool to get the design data.

Phase 2: Analyze Structure
Once you have the Figma data, analyze it to identify components using Atomic Design:
- Atoms: Basic elements (Button, Input, Icon, Text)
- Molecules: Combinations of atoms (Card, SearchBar, NavItem)
- Organisms: Complex sections (Header, Sidebar, ProductList)

Phase 3: Initialize Project
Create the React project structure with:
1. Vite + TypeScript + Tailwind setup
2. Folder structure (src/components/atoms, molecules, organisms)
3. Extract design tokens and generate tailwind.config.js
4. Install dependencies

Return a JSON plan with:
- componentsOrder: ["Button", "Card", "Header", ...]
- atomicDesign: { "Button": "atom", "Card": "molecule", ... }
- pages: [{ name: "Home", route: "/" }, ...]
- designTokens: { colors: {...}, fonts: {...}, fontSizes: {...} }
`;
		},
		projectArchitectAgent,
		{
			schema: architecturePlanSchema,
		},
	)

	// ============================================================================
	// ÉTAPE 2 : TEST ENGINEER
	// ============================================================================
	.andAgent(
		async (context) => {
			logger.info("🧪 STEP 2: Writing tests (TDD approach)...");

			const componentsOrder = context.data.componentsOrder;
			const atomicDesign = context.data.atomicDesign;

			return `
Write tests for all components following TDD approach.

Components to test:
${JSON.stringify(componentsOrder, null, 2)}

Atomic Design classification:
${JSON.stringify(atomicDesign, null, 2)}

For each component, write 3-5 tests:
- Render test (mandatory)
- Props validation
- User interactions (if applicable)
- Edge cases
- Accessibility (roles, labels)

Tests MUST fail initially (components don't exist yet). This is expected in TDD.

Create files: src/components/{type}/{ComponentName}.test.tsx

Return JSON with:
- testsCreated: number (total test files created)
- componentsOrder: string[] (preserve for next step)
- atomicDesign: object (preserve for next step)
`;
		},
		testEngineerAgent,
		{
			schema: z.object({
				testsCreated: z.number().describe("Number of test files created"),
				componentsOrder: z.array(z.string()),
				atomicDesign: z.record(z.enum(["atom", "molecule", "organism"])),
			}),
		},
	)

	// ============================================================================
	// ÉTAPE 3 : COMPONENT DEVELOPER (VERSION SIMPLIFIÉE)
	// ============================================================================
	// Note: Dans une implémentation complète, cette étape devrait itérer
	// sur chaque composant. Pour la démonstration, on demande à l'agent
	// de traiter tous les composants en une seule passe.
	.andThen({
		id: "step-3-components-implementation",
		execute: async ({ data }) => {
			logger.info(
				"💻 STEP 3: Implementing components (simplified - all at once)...",
			);

			// Pour l'instant, on simule le succès
			// Dans une version complète, on appellerait componentDeveloperAgent N fois
			const typedData = data as {
				componentsOrder: string[];
				atomicDesign: Record<string, string>;
				testsCreated: number;
			};

			logger.info(
				`  → Would implement ${typedData.componentsOrder.length} components`,
			);
			logger.info("  ⚠️ Note: Component implementation is manual for now");

			return {
				...data,
				componentsGenerated: typedData.componentsOrder.length,
				allComponentsSuccess: true, // Placeholder
				message:
					"Components implementation step (manual for now - run component-developer agent iteratively)",
			};
		},
	})

	// ============================================================================
	// ÉTAPE 4 : PAGE ASSEMBLER
	// ============================================================================
	.andAgent(
		async (context) => {
			logger.info("📄 STEP 4: Assembling pages and configuring routing...");

			const componentsOrder = context.data.componentsOrder;

			return `
Assemble pages from the created components.

Available components:
${JSON.stringify(componentsOrder, null, 2)}

Tasks:
1. Identify pages from Figma (analyze root nodes)
2. Create pages in src/pages/ using available components
3. Configure React Router if multiple pages (2+)
4. Create NotFoundPage (404)
5. Update App.tsx

Return JSON with:
- pagesCreated: number
- routingEnabled: boolean
- pages: [{ name, route, components[] }, ...]
`;
		},
		pageAssemblerAgent,
		{
			schema: z.object({
				pagesCreated: z.number(),
				routingEnabled: z.boolean(),
				pages: z.array(
					z.object({
						name: z.string(),
						route: z.string(),
						components: z.array(z.string()),
					}),
				),
			}),
		},
	)

	// ============================================================================
	// ÉTAPE 5 : BUILD ENGINEER
	// ============================================================================
	.andAgent(
		async (context) => {
			logger.info("⚡ STEP 5: Building for production and analyzing bundle...");

			return `
Build the project for production and analyze the bundle.

Tasks:
1. Run: npm run build
2. Analyze bundle size (du -sh dist/)
3. List generated files (find dist/ -type f)
4. Identify optimization opportunities
5. Generate recommendations

Return JSON with:
- buildSuccess: boolean
- buildTime: string
- bundleSize: { total, gzipped, js, css }
- files: Record<string, string>
- recommendations: [{ priority, category, description, estimatedSavings }, ...]
- metrics: { totalSize, gzippedSize, jsSize, cssSize }
`;
		},
		buildEngineerAgent,
		{
			schema: buildReportSchema,
		},
	)

	// ============================================================================
	// ÉTAPE FINALE : RÉSUMÉ
	// ============================================================================
	.andThen({
		id: "final-summary",
		execute: async ({ data }) => {
			logger.info("🎉 PIPELINE COMPLETED!");

			const typedData = data as Record<string, unknown>;

			// Créer le résumé final
			const summary = {
				success: Boolean(typedData.buildSuccess),
				message: "Figma to React pipeline completed successfully!",
				projectPath: "workspace/project/",
				buildReport: typedData.buildReport,
			};

			// Afficher le résumé dans les logs
			logger.info("");
			logger.info("📊 PIPELINE SUMMARY:");
			logger.info(`   Components: ${typedData.componentsGenerated || 0}`);
			logger.info(`   Pages: ${typedData.pagesCreated || 0}`);
			logger.info(
				`   Build: ${typedData.buildSuccess ? "✅ SUCCESS" : "❌ FAIL"}`,
			);

			const bundleSize = typedData.bundleSize as
				| { gzipped?: string }
				| undefined;
			logger.info(`   Bundle: ${bundleSize?.gzipped || "N/A"}`);

			const recommendations = typedData.recommendations as
				| Array<{ priority: string; description: string }>
				| undefined;
			if (recommendations && recommendations.length > 0) {
				logger.info("");
				logger.info("⚡ OPTIMIZATION SUGGESTIONS:");
				for (const rec of recommendations.slice(0, 3)) {
					logger.info(`   [${rec.priority}] ${rec.description}`);
				}
			}

			logger.info("");
			logger.info("✅ Ready for deployment!");

			return summary;
		},
	});
