/**
 * NPM Lint Tool for VoltAgent
 *
 * This tool runs ESLint using `npm run lint` in a specified project directory.
 * It returns a summary (error count, top errors) without verbose logs.
 *
 * Token Optimization: Zero AI tokens used (direct command execution)
 *
 * Features:
 * - Whitelisted command (npm run lint only)
 * - Timeout management (2 minutes max)
 * - Summary output (error count, top 5 errors)
 * - Optional: auto-fix with --fix flag
 */

import { createTool } from "@voltagent/core";
import { z } from "zod";
import { exec } from "child_process";
import { promisify } from "util";
import * as path from "path";
import * as fs from "fs";

const execAsync = promisify(exec);

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Parse ESLint output for error count
 */
function extractErrorCount(output: string): {
	errors: number;
	warnings: number;
} {
	// ESLint format: "✖ 42 problems (10 errors, 32 warnings)"
	const match = output.match(/(\d+)\s+problems?\s+\((\d+)\s+errors?,\s+(\d+)\s+warnings?\)/);

	if (match) {
		return {
			errors: parseInt(match[2], 10),
			warnings: parseInt(match[3], 10),
		};
	}

	// Fallback: look for individual counts
	const errorMatch = output.match(/(\d+)\s+errors?/);
	const warningMatch = output.match(/(\d+)\s+warnings?/);

	return {
		errors: errorMatch ? parseInt(errorMatch[1], 10) : 0,
		warnings: warningMatch ? parseInt(warningMatch[1], 10) : 0,
	};
}

/**
 * Extract top errors from ESLint output
 */
function extractTopErrors(output: string, limit = 5): string[] {
	const errors: string[] = [];

	// ESLint format:
	// /path/to/file.ts
	//   10:5  error  'variable' is never used  @typescript-eslint/no-unused-vars
	const errorPattern = /^\s+(\d+:\d+)\s+error\s+(.+?)\s{2,}/gm;

	let match;
	while ((match = errorPattern.exec(output)) !== null && errors.length < limit) {
		const location = match[1];
		const message = match[2].trim();
		errors.push(`${location} - ${message}`);
	}

	return errors;
}

/**
 * Extract file names with errors
 */
function extractFilesWithErrors(output: string, limit = 5): string[] {
	const files: string[] = [];

	// ESLint outputs file paths followed by errors
	// Example: "/path/to/file.ts" or "src/components/Button.tsx"
	const filePattern = /^([^\s].+?\.(?:ts|tsx|js|jsx))$/gm;

	let match;
	while ((match = filePattern.exec(output)) !== null && files.length < limit) {
		const fileName = path.basename(match[1]);
		if (!files.includes(fileName)) {
			files.push(fileName);
		}
	}

	return files;
}

// ============================================================================
// Tool Definition
// ============================================================================

export const lintCodeTool = createTool({
	name: "lint_code",
	description:
		"Runs ESLint using 'npm run lint' in the specified project directory. " +
		"Returns a summary (error count, top 5 errors) without verbose logs. " +
		"Timeout: 2 minutes. Optionally runs with --fix to auto-fix issues.",
	parameters: z.object({
		projectPath: z
			.string()
			.describe("Absolute or relative path to the project directory"),
		autoFix: z
			.boolean()
			.optional()
			.describe(
				"If true, runs 'npm run lint -- --fix' to automatically fix issues",
			),
	}),
	execute: async ({ projectPath, autoFix = false }) => {
		console.log("\n🔍 [NPM LINT] Starting...");
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
			// Step 2: Check for package.json and lint script
			// ======================================================================

			const packageJsonPath = path.join(absolutePath, "package.json");
			if (!fs.existsSync(packageJsonPath)) {
				throw new Error(`package.json not found in: ${absolutePath}`);
			}

			const packageJson = JSON.parse(
				fs.readFileSync(packageJsonPath, "utf-8"),
			);
			if (!packageJson.scripts?.lint) {
				return {
					success: false,
					message:
						"⚠️  No 'lint' script found in package.json. Linting skipped.",
				};
			}

			console.log("✅ Lint script found in package.json");

			// ======================================================================
			// Step 3: Build lint command
			// ======================================================================

			let command = "npm run lint";
			if (autoFix) {
				command += " -- --fix";
				console.log("🔧 Auto-fix enabled");
			}

			// ======================================================================
			// Step 4: Run lint
			// ======================================================================

			console.log("⏳ Running linter...");

			const startTime = Date.now();

			let stdout = "";
			let stderr = "";
			let exitCode = 0;

			try {
				const result = await execAsync(command, {
					cwd: absolutePath,
					timeout: 120000, // 2 minutes timeout
					maxBuffer: 10 * 1024 * 1024, // 10MB buffer
				});
				stdout = result.stdout;
				stderr = result.stderr;
			} catch (error: any) {
				// ESLint returns non-zero exit code when errors are found
				// This is expected, so we capture the output
				if (error.code !== "ETIMEDOUT" && error.code !== "ENOENT") {
					stdout = error.stdout || "";
					stderr = error.stderr || "";
					exitCode = error.code || 1;
				} else {
					throw error; // Re-throw timeout or command not found errors
				}
			}

			const duration = ((Date.now() - startTime) / 1000).toFixed(2);

			// ======================================================================
			// Step 5: Parse lint results
			// ======================================================================

			const output = stdout + stderr;
			const counts = extractErrorCount(output);
			const topErrors =
				counts.errors > 0 ? extractTopErrors(output) : [];
			const filesWithErrors =
				counts.errors > 0 ? extractFilesWithErrors(output) : [];

			console.log("=".repeat(60));
			console.log(
				`${counts.errors === 0 ? "✅" : "❌"} Linting completed in ${duration}s`,
			);
			console.log(`   - Errors: ${counts.errors}`);
			console.log(`   - Warnings: ${counts.warnings}`);

			if (counts.errors > 0) {
				console.log("   - Files with errors:");
				filesWithErrors.forEach((file) => console.log(`     • ${file}`));
				console.log("   - Top errors:");
				topErrors.forEach((error) => console.log(`     • ${error}`));
			}

			if (autoFix && counts.errors === 0 && counts.warnings > 0) {
				console.log("   ℹ️  Some warnings may have been auto-fixed");
			}

			return {
				success: counts.errors === 0,
				message:
					counts.errors === 0
						? `✅ No lint errors (${counts.warnings} warnings)`
						: `❌ ${counts.errors} lint errors found`,
				summary: {
					errorsCount: counts.errors,
					warningsCount: counts.warnings,
					duration: `${duration}s`,
					topErrors,
					filesWithErrors,
					autoFixEnabled: autoFix,
				},
			};
		} catch (error: any) {
			// ======================================================================
			// Error Handling
			// ======================================================================

			console.log("=".repeat(60));
			console.error("❌ Linting failed");

			let errorMessage = "Unknown error";

			if (error.code === "ETIMEDOUT" || error.killed) {
				errorMessage =
					"Linting timed out (> 2 minutes). Check for performance issues or large files.";
			} else if (error.code === "ENOENT") {
				errorMessage =
					"npm command not found. Ensure Node.js and npm are installed.";
			} else {
				errorMessage = error.message;
			}

			console.error(`   ${errorMessage}`);

			return {
				success: false,
				message: `❌ Linting failed: ${errorMessage}`,
				error: errorMessage,
			};
		}
	},
});
