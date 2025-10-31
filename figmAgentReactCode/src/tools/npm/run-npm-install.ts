/**
 * NPM Install Tool for VoltAgent
 *
 * This tool runs `npm install` in a specified project directory.
 * It's a black-box tool that returns OK/KO without verbose logs.
 *
 * Token Optimization: Zero AI tokens used (direct command execution)
 *
 * Features:
 * - Whitelisted command (npm install only)
 * - Timeout management (5 minutes max)
 * - Summary output (no verbose logs)
 * - Error handling with clear messages
 */

import { createTool } from "@voltagent/core";
import { z } from "zod";
import { exec } from "child_process";
import { promisify } from "util";
import * as path from "path";
import * as fs from "fs";

const execAsync = promisify(exec);

// ============================================================================
// Tool Definition
// ============================================================================

export const runNpmInstallTool = createTool({
	name: "run_npm_install",
	description:
		"Installs npm dependencies by running 'npm install' in the specified project directory. " +
		"Returns a summary (success/failure) without verbose logs. " +
		"Timeout: 5 minutes. Validates that package.json exists before running.",
	parameters: z.object({
		projectPath: z
			.string()
			.describe(
				"Absolute or relative path to the project directory (must contain package.json)",
			),
	}),
	execute: async ({ projectPath }) => {
		console.log("\n📦 [NPM INSTALL] Starting...");
		console.log("=".repeat(60));

		try {
			// ======================================================================
			// Step 1: Validate project path
			// ======================================================================

			const absolutePath = path.resolve(projectPath);
			console.log(`📂 Project path: ${absolutePath}`);

			if (!fs.existsSync(absolutePath)) {
				throw new Error(`Project directory does not exist: ${absolutePath}`);
			}

			// ======================================================================
			// Step 2: Check for package.json
			// ======================================================================

			const packageJsonPath = path.join(absolutePath, "package.json");
			if (!fs.existsSync(packageJsonPath)) {
				throw new Error(
					`package.json not found in: ${absolutePath}\n` +
						"Ensure the project is initialized before running npm install.",
				);
			}

			console.log("✅ package.json found");

			// ======================================================================
			// Step 3: Run npm install
			// ======================================================================

			console.log("⏳ Running npm install...");

			const startTime = Date.now();

			const { stdout, stderr } = await execAsync("npm install", {
				cwd: absolutePath,
				timeout: 300000, // 5 minutes timeout
				maxBuffer: 10 * 1024 * 1024, // 10MB buffer for large outputs
			});

			const duration = ((Date.now() - startTime) / 1000).toFixed(2);

			// ======================================================================
			// Step 4: Parse output for summary
			// ======================================================================

			// Extract package count from npm output
			// Example: "added 123 packages, and audited 456 packages in 12s"
			const addedMatch = stdout.match(/added (\d+) packages?/);
			const auditedMatch = stdout.match(/audited (\d+) packages?/);

			const packagesAdded = addedMatch ? parseInt(addedMatch[1], 10) : 0;
			const packagesAudited = auditedMatch ? parseInt(auditedMatch[1], 10) : 0;

			console.log("=".repeat(60));
			console.log(`✅ npm install completed in ${duration}s`);
			console.log(`   - Packages added: ${packagesAdded}`);
			console.log(`   - Packages audited: ${packagesAudited}`);

			// Check for warnings in stderr (npm often outputs warnings there)
			const hasWarnings = stderr.length > 0;
			if (hasWarnings) {
				console.log("⚠️  Warnings detected (non-critical)");
			}

			return {
				success: true,
				message: `✅ Dependencies installed successfully in ${duration}s`,
				summary: {
					duration: `${duration}s`,
					packagesAdded,
					packagesAudited,
					hasWarnings,
				},
			};
		} catch (error: any) {
			// ======================================================================
			// Error Handling
			// ======================================================================

			console.log("=".repeat(60));
			console.error("❌ npm install failed");

			let errorMessage = "Unknown error";

			if (error.code === "ETIMEDOUT" || error.killed) {
				errorMessage =
					"npm install timed out (> 5 minutes). Check network connection or package.json dependencies.";
			} else if (error.code === "ENOENT") {
				errorMessage =
					"npm command not found. Ensure Node.js and npm are installed.";
			} else if (error.stderr) {
				// Extract the most relevant error from stderr
				const stderrLines = error.stderr.split("\n").filter((line: string) => {
					return line.includes("ERR!") || line.includes("error");
				});
				errorMessage =
					stderrLines.slice(0, 3).join("\n") || error.stderr.slice(0, 500);
			} else {
				errorMessage = error.message;
			}

			console.error(`   ${errorMessage}`);

			return {
				success: false,
				message: `❌ npm install failed: ${errorMessage}`,
				error: errorMessage,
			};
		}
	},
});
