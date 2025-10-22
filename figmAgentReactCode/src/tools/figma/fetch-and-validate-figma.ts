/**
 * Figma Validation Tool for VoltAgent
 *
 * This tool fetches Figma design data from the MCP server, validates the JSON structure,
 * and stores the result in VoltAgent memory for use by subsequent agents.
 *
 * Token Optimization: Uses direct MCP calls instead of AI agents (zero tokens used!)
 *
 * Features:
 * - Direct MCP tool invocation
 * - Zod schema validation
 * - Custom validation checks (single root, components, design tokens)
 * - VoltAgent memory storage
 * - File system backup
 */

import { MCPConfiguration, createTool } from "@voltagent/core";
import { z } from "zod";

// ============================================================================
// Zod Schemas - Based on Figma MCP data structure
// ============================================================================

const NodeSchema: z.ZodType<any> = z.lazy(() =>
	z.object({
		id: z.string(),
		name: z.string(),
		type: z.string(),
		layout: z.string().optional(),
		children: z.array(NodeSchema).optional(),
		text: z.string().optional(),
		textStyle: z.string().optional(),
		fills: z.string().optional(),
		componentId: z.string().optional(),
		componentProperties: z.array(z.any()).optional(),
	}),
);

const TextStyleSchema = z.object({
	name: z.string(),
	value: z.object({
		fontFamily: z.string(),
		fontWeight: z.number(),
		fontSize: z.number(),
		lineHeight: z.string().optional(),
		letterSpacing: z.string().optional(),
	}),
});

const ColorStyleSchema = z.object({
	name: z.string(),
	hexValue: z.string(),
});

const LayoutStyleSchema = z.object({
	name: z.string(),
	value: z.object({
		width: z.number().optional(),
		height: z.number().optional(),
		paddingTop: z.number().optional(),
		paddingRight: z.number().optional(),
		paddingBottom: z.number().optional(),
		paddingLeft: z.number().optional(),
		itemSpacing: z.number().optional(),
	}),
});

const DesignSystemSchema = z.object({
	text: z.record(TextStyleSchema),
	colors: z.record(ColorStyleSchema),
	strokes: z.record(z.any()).optional(),
	layout: z.record(LayoutStyleSchema),
});

const ComponentMetadataSchema = z.object({
	key: z.string(),
	name: z.string(),
	description: z.string(),
});

const FigmaContextSchema = z.object({
	name: z.string(),
	lastModified: z.string(),
	thumbnailUrl: z.string(),
	nodes: z.array(NodeSchema),
	components: z.record(ComponentMetadataSchema).optional(),
	componentSets: z.record(z.any()).optional(),
	globalVars: z.object({
		designSystem: DesignSystemSchema,
		localStyles: z.record(z.any()).optional(),
		images: z.record(z.any()).optional(),
	}),
});

// ============================================================================
// MCP Configuration
// ============================================================================

const mcpConfig = new MCPConfiguration({
	servers: {
		figma: {
			type: "http",
			url: process.env.MCP_ENDPOINT || "http://localhost:3333/mcp",
			timeout: 30000, // 30 seconds
		},
	},
});

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Count total nodes recursively
 */
function countNodes(nodes: any[]): number {
	let count = nodes.length;
	for (const node of nodes) {
		if (node.children && Array.isArray(node.children)) {
			count += countNodes(node.children);
		}
	}
	return count;
}

/**
 * Validate that there is only one root node (not multi-page)
 */
function validateSingleRoot(data: any): { valid: boolean; message?: string } {
	if (!data.nodes || !Array.isArray(data.nodes)) {
		return { valid: false, message: "Missing 'nodes' array in Figma data" };
	}

	if (data.nodes.length === 0) {
		return { valid: false, message: "No nodes found in Figma data" };
	}

	if (data.nodes.length > 1) {
		return {
			valid: false,
			message: `Multi-page designs are not supported. Found ${data.nodes.length} root nodes. Please select a single frame or page.`,
		};
	}

	return { valid: true };
}

/**
 * Check for components
 */
function validateComponents(data: any): {
	hasComponents: boolean;
	count: number;
	message?: string;
} {
	const components = data.components || {};
	const count = Object.keys(components).length;

	return {
		hasComponents: count > 0,
		count,
		message:
			count === 0
				? "No components found. Consider creating reusable components in your Figma design."
				: undefined,
	};
}

/**
 * Check for design tokens
 */
function validateDesignTokens(data: any): {
	hasTokens: boolean;
	textStyles: number;
	colors: number;
	layouts: number;
	warnings: string[];
} {
	const warnings: string[] = [];
	const designSystem = data.globalVars?.designSystem || {};

	const textStyles = Object.keys(designSystem.text || {}).length;
	const colors = Object.keys(designSystem.colors || {}).length;
	const layouts = Object.keys(designSystem.layout || {}).length;

	if (textStyles === 0) {
		warnings.push(
			"No text styles found. Consider creating text styles for consistency.",
		);
	}

	if (colors === 0) {
		warnings.push(
			"No color styles found. Consider creating color styles for theming.",
		);
	}

	if (layouts === 0) {
		warnings.push(
			"No layout styles found. Consider using Auto Layout with consistent spacing.",
		);
	}

	return {
		hasTokens: textStyles > 0 || colors > 0 || layouts > 0,
		textStyles,
		colors,
		layouts,
		warnings,
	};
}

// ============================================================================
// VoltAgent Tool Definition
// ============================================================================

export const fetchAndValidateFigmaTool = createTool({
	name: "fetch_and_validate_figma",
	description:
		"Fetches Figma design data from MCP server, validates JSON structure, and stores in memory. " +
		"This is Step 1 of the pipeline. Uses direct MCP calls (zero AI tokens!). " +
		"Validates: single root node, components presence, design tokens. " +
		"Stores the complete validated JSON in VoltAgent memory for subsequent agents.",
	parameters: z.object({
		figmaUrl: z.string().url().describe("The Figma file, page, or node URL"),
	}),
	execute: async ({ figmaUrl }, context) => {
		const errors: string[] = [];
		const warnings: string[] = [];

		console.log("\n🔍 [STEP 1] Figma Validation Tool");
		console.log("=".repeat(60));

		try {
			// ======================================================================
			// Step 1: Get MCP tools from the Figma server
			// ======================================================================

			console.log("🔌 Connecting to MCP server...");
			const toolsets = await mcpConfig.getToolsets();

			if (!toolsets.figma) {
				const errorMsg =
					"Figma MCP server not found. Ensure the server is running at " +
					(process.env.MCP_ENDPOINT || "http://localhost:3333");
				errors.push(errorMsg);
				throw new Error(errorMsg);
			}

			const figmaTools = toolsets.figma.getTools();
			console.log(`✅ Connected. Found ${figmaTools.length} MCP tools.`);

			// ======================================================================
			// Step 2: Find the get_figma_context tool
			// ======================================================================

			const getFigmaContextTool = figmaTools.find(
				(tool) => tool.name === "figma_get_figma_context",
			);

			if (!getFigmaContextTool) {
				const errorMsg =
					"MCP tool 'figma_get_figma_context' not found. Available tools: " +
					figmaTools.map((t) => t.name).join(", ");
				errors.push(errorMsg);
				throw new Error(errorMsg);
			}

			// ======================================================================
			// Step 3: Call the MCP tool directly (no agent!)
			// ======================================================================

			console.log("🔧 Calling MCP tool: get_figma_context");
			console.log(`📍 Figma URL: ${figmaUrl}`);

			const response = (await getFigmaContextTool.execute?.({
				url: figmaUrl,
				scope: "auto", // Auto-detect scope (file, page, or node)
			})) as any;

			console.log("✅ MCP tool executed successfully");

			// ======================================================================
			// Step 4: Parse the JSON response
			// ======================================================================

			let figmaData: any;

			try {
				// The MCP tool returns content in an array of content blocks
				if (
					response &&
					Array.isArray(response.content) &&
					response.content.length > 0
				) {
					const textContent = response.content[0].text;
					figmaData = JSON.parse(textContent);
				} else {
					throw new Error("Unexpected MCP response format");
				}
			} catch (parseError) {
				const errorMsg = `Failed to parse MCP response as JSON: ${
					parseError instanceof Error ? parseError.message : "Unknown error"
				}`;
				errors.push(errorMsg);
				throw new Error(errorMsg);
			}

			// ======================================================================
			// Step 5: Validate with Zod schema
			// ======================================================================

			console.log("🔍 Validating JSON structure with Zod...");

			try {
				FigmaContextSchema.parse(figmaData);
				console.log("✅ JSON schema validation passed");
			} catch (zodError) {
				if (zodError instanceof z.ZodError) {
					errors.push("JSON schema validation failed:");
					zodError.errors.forEach((err) => {
						errors.push(`  - ${err.path.join(".")}: ${err.message}`);
					});
					throw new Error("Zod schema validation failed");
				} else {
					throw zodError;
				}
			}

			// ======================================================================
			// Step 6: Custom validation checks
			// ======================================================================

			console.log("🔍 Running custom validation checks...");

			// Check 1: Single root node (reject multi-page)
			const rootCheck = validateSingleRoot(figmaData);
			if (!rootCheck.valid) {
				errors.push(rootCheck.message!);
				throw new Error(rootCheck.message);
			}

			// Check 2: Components presence (warning only)
			const componentsCheck = validateComponents(figmaData);
			if (componentsCheck.message) {
				warnings.push(componentsCheck.message);
			}

			// Check 3: Design tokens (warnings only)
			const tokensCheck = validateDesignTokens(figmaData);
			warnings.push(...tokensCheck.warnings);

			// ======================================================================
			// Step 7: Calculate stats
			// ======================================================================

			const stats = {
				rootNodes: figmaData.nodes.length,
				totalNodes: countNodes(figmaData.nodes),
				componentsCount: componentsCheck.count,
				hasDesignTokens: tokensCheck.hasTokens,
				textStylesCount: tokensCheck.textStyles,
				colorsCount: tokensCheck.colors,
				layoutStylesCount: tokensCheck.layouts,
			};

			console.log("📊 Validation stats:");
			console.log(`  - Root nodes: ${stats.rootNodes}`);
			console.log(`  - Total nodes: ${stats.totalNodes}`);
			console.log(`  - Components: ${stats.componentsCount}`);
			console.log(`  - Text styles: ${stats.textStylesCount}`);
			console.log(`  - Colors: ${stats.colorsCount}`);
			console.log(`  - Layout styles: ${stats.layoutStylesCount}`);

			// ======================================================================
			// Step 8: Prepare validation result
			// ======================================================================

			const validationResult = {
				figmaUrl,
				validatedAt: new Date().toISOString(),
				success: true,
				errors: [],
				warnings,
				stats,
				data: figmaData, // Include complete JSON in response!
			};

			console.log("🧠 Preparing data for agent memory...");
			console.log(
				"   - The agent will automatically store this tool result in its conversational memory",
			);
			console.log(`   - Design: ${figmaData.name}`);
			console.log(`   - Nodes: ${stats.totalNodes}`);
			console.log(
				`   - Size: ${JSON.stringify(validationResult).length} chars`,
			);

			// ======================================================================
			// Step 10: Return success result
			// ======================================================================

			console.log("=".repeat(60));
			console.log("✅ Validation completed successfully!\n");

			return {
				success: true,
				message: `Figma design "${figmaData.name}" validated successfully`,
				stats,
				warnings,
				data: validationResult, // Return the complete data for the agent to store
			};
		} catch (error) {
			// ======================================================================
			// Error handling
			// ======================================================================

			const errorMessage =
				error instanceof Error ? error.message : "Unknown error";

			console.log("=".repeat(60));
			console.error("❌ Validation failed:", errorMessage);
			console.error("Errors:", errors);
			console.log("\n");

			return {
				success: false,
				message: `Validation failed: ${errorMessage}`,
				errors,
				warnings,
			};
		}
	},
});
