/**
 * NPM Build Tool for VoltAgent
 *
 * This tool runs the build script using `npm run build` in a specified project directory.
 * It returns OK/KO without verbose logs.
 *
 * Token Optimization: Zero AI tokens used (direct command execution)
 *
 * Features:
 * - Whitelisted command (npm run build only)
 * - Timeout management (5 minutes max)
 * - Summary output (success/failure with main error if any)
 * - Build size reporting
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
 * Get build directory size
 */
function getBuildSize(projectPath: string): string | null {
	const commonBuildDirs = ["dist", "build", ".next", "out"];

	for (const dir of commonBuildDirs) {
		const buildPath = path.join(projectPath, dir);
		if (fs.existsSync(buildPath)) {
			try {
				const totalSize = getDirectorySize(buildPath);
				return formatBytes(totalSize);
			} catch {
				return null;
			}
		}
	}

	return null;
}

/**
 * Recursively calculate directory size
 */
function getDirectorySize(dirPath: string): number {
	let totalSize = 0;

	const files = fs.readdirSync(dirPath);
	for (const file of files) {
		const filePath = path.join(dirPath, file);
		const stats = fs.statSync(filePath);

		if (stats.isDirectory()) {
			totalSize += getDirectorySize(filePath);
		} else {
			totalSize += stats.size;
		}
	}

	return totalSize;
}

/**
 * Format bytes to human-readable size
 */
function formatBytes(bytes: number): string {
	if (bytes === 0) return "0 B";

	const k = 1024;
	const sizes = ["B", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Extract main error from build output
 */
function extractMainError(output: string): string {
	// Look for common error patterns
	const errorPatterns = [
		/Error: (.+?)(?:\n|$)/,
		/ERROR in (.+?)(?:\n|$)/,
		/✘ \[ERROR\] (.+?)(?:\n|$)/,
		/Failed to compile\.?\n(.+?)(?:\n|$)/,
	];

	for (const pattern of errorPatterns) {
		const match = output.match(pattern);
		if (match) {
			return match[1].trim();
		}
	}

	// Fallback: return first few lines with "error" or "ERROR"
	const errorLines = output
		.split("\n")
		.filter(
			(line) =>
				line.toLowerCase().includes("error") &&
				!line.includes("0 errors") &&
				!line.includes("no errors"),
		)
		.slice(0, 3)
		.join("\n");

	return errorLines || "Build failed (see logs for details)";
}

// ============================================================================
// Tool Definition
// ============================================================================

export const buildProjectTool = createTool({
	name: "build_project",
	description:
		"Builds the project using 'npm run build' in the specified project directory. " +
		"Returns OK/KO with build size and main error if any. " +
		"Timeout: 5 minutes. Detects common build outputs (dist, build, .next, out).",
	parameters: z.object({
		projectPath: z
			.string()
			.describe("Absolute or relative path to the project directory"),
	}),
	execute: async ({ projectPath }) => {
		console.log("\n🏗️  [NPM BUILD] Starting...");
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
			// Step 2: Check for package.json and build script
			// ======================================================================

			const packageJsonPath = path.join(absolutePath, "package.json");
			if (!fs.existsSync(packageJsonPath)) {
				throw new Error(`package.json not found in: ${absolutePath}`);
			}

			const packageJson = JSON.parse(
				fs.readFileSync(packageJsonPath, "utf-8"),
			);
			if (!packageJson.scripts?.build) {
				return {
					success: false,
					message:
						"⚠️  No 'build' script found in package.json. Build skipped.",
				};
			}

			console.log("✅ Build script found in package.json");

			// ======================================================================
			// Step 3: Run build
			// ======================================================================

			console.log("⏳ Running npm run build...");

			const startTime = Date.now();

			const { stdout, stderr } = await execAsync("npm run build", {
				cwd: absolutePath,
				timeout: 300000, // 5 minutes timeout
				maxBuffer: 10 * 1024 * 1024, // 10MB buffer
			});

			const duration = ((Date.now() - startTime) / 1000).toFixed(2);

			// ======================================================================
			// Step 4: Get build size
			// ======================================================================

			const buildSize = getBuildSize(absolutePath);

			console.log("=".repeat(60));
			console.log(`✅ Build completed successfully in ${duration}s`);
			if (buildSize) {
				console.log(`   - Build size: ${buildSize}`);
			}

			// Check for warnings
			const hasWarnings =
				stderr.length > 0 ||
				stdout.toLowerCase().includes("warning") ||
				stdout.toLowerCase().includes("warn");

			if (hasWarnings) {
				console.log("⚠️  Warnings detected (non-critical)");
			}

			return {
				success: true,
				message: `✅ Build successful in ${duration}s`,
				summary: {
					duration: `${duration}s`,
					buildSize,
					hasWarnings,
				},
			};
		} catch (error: any) {
			// ======================================================================
			// Error Handling
			// ======================================================================

			console.log("=".repeat(60));
			console.error("❌ Build failed");

			let errorMessage = "Unknown error";
			let mainError = "";

			if (error.code === "ETIMEDOUT" || error.killed) {
				errorMessage =
					"Build timed out (> 5 minutes). Check for infinite loops or performance issues.";
			} else if (error.code === "ENOENT") {
				errorMessage =
					"npm command not found. Ensure Node.js and npm are installed.";
			} else if (error.stderr || error.stdout) {
				// Extract main error from output
				const output = error.stderr || error.stdout || "";
				mainError = extractMainError(output);
				errorMessage = `Build failed: ${mainError}`;
			} else {
				errorMessage = error.message;
			}

			console.error(`   ${errorMessage}`);

			return {
				success: false,
				message: `❌ ${errorMessage}`,
				error: errorMessage,
				mainError,
			};
		}
	},
});
