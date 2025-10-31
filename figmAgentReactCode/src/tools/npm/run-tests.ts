/**
 * NPM Test Tool for VoltAgent
 *
 * This tool runs tests using `npm test` in a specified project directory.
 * It returns a summary of test results (pass/fail counts) without verbose logs.
 *
 * Token Optimization: Zero AI tokens used (direct command execution)
 *
 * Features:
 * - Whitelisted command (npm test only)
 * - Timeout management (2 minutes max)
 * - Summary output (tests passed/failed)
 * - Optional: test a specific file
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
 * Extract test summary from npm test output
 * Supports common test runners: Jest, Vitest, Mocha
 */
function extractTestSummary(output: string): {
	passed: number;
	failed: number;
	total: number;
} {
	// Jest/Vitest pattern: "Tests: 5 passed, 5 total"
	const jestMatch = output.match(/Tests:\s+(\d+)\s+passed.*?(\d+)\s+total/i);
	if (jestMatch) {
		const passed = parseInt(jestMatch[1], 10);
		const total = parseInt(jestMatch[2], 10);
		return { passed, failed: total - passed, total };
	}

	// Mocha pattern: "5 passing" or "5 passing, 2 failing"
	const mochaPassMatch = output.match(/(\d+)\s+passing/i);
	const mochaFailMatch = output.match(/(\d+)\s+failing/i);
	if (mochaPassMatch) {
		const passed = parseInt(mochaPassMatch[1], 10);
		const failed = mochaFailMatch ? parseInt(mochaFailMatch[1], 10) : 0;
		return { passed, failed, total: passed + failed };
	}

	// Fallback: try to find any numbers
	const passMatch = output.match(/(\d+)\s+(passed|pass)/i);
	const failMatch = output.match(/(\d+)\s+(failed|fail)/i);
	const passed = passMatch ? parseInt(passMatch[1], 10) : 0;
	const failed = failMatch ? parseInt(failMatch[1], 10) : 0;

	return { passed, failed, total: passed + failed };
}

/**
 * Extract failed test names from output
 */
function extractFailedTests(output: string): string[] {
	const failedTests: string[] = [];

	// Jest/Vitest pattern: "● Test suite name › Test name"
	const jestMatches = output.matchAll(/[●✕]\s+(.*?)\s+›\s+(.*?)$/gm);
	for (const match of jestMatches) {
		failedTests.push(`${match[1]} › ${match[2]}`);
	}

	// Mocha pattern: "1) Test name"
	const mochaMatches = output.matchAll(/^\s+\d+\)\s+(.*?)$/gm);
	for (const match of mochaMatches) {
		failedTests.push(match[1]);
	}

	// Limit to top 5 failed tests
	return failedTests.slice(0, 5);
}

// ============================================================================
// Tool Definition
// ============================================================================

export const runTestsTool = createTool({
	name: "run_tests",
	description:
		"Runs tests using 'npm test' in the specified project directory. " +
		"Returns a summary (passed/failed counts) without verbose logs. " +
		"Timeout: 2 minutes. Optionally test a specific file. " +
		"Supports Jest, Vitest, and Mocha test runners.",
	parameters: z.object({
		projectPath: z
			.string()
			.describe("Absolute or relative path to the project directory"),
		testFile: z
			.string()
			.optional()
			.describe(
				"Optional: specific test file to run (e.g., 'Button.test.tsx')",
			),
	}),
	execute: async ({ projectPath, testFile }) => {
		console.log("\n🧪 [NPM TEST] Starting...");
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
			// Step 2: Check for package.json and test script
			// ======================================================================

			const packageJsonPath = path.join(absolutePath, "package.json");
			if (!fs.existsSync(packageJsonPath)) {
				throw new Error(`package.json not found in: ${absolutePath}`);
			}

			const packageJson = JSON.parse(
				fs.readFileSync(packageJsonPath, "utf-8"),
			);
			if (!packageJson.scripts?.test) {
				return {
					success: false,
					message:
						"⚠️  No 'test' script found in package.json. Tests skipped.",
					summary: {
						passed: 0,
						failed: 0,
						total: 0,
						skipped: true,
					},
				};
			}

			console.log("✅ Test script found in package.json");

			// ======================================================================
			// Step 3: Build test command
			// ======================================================================

			let command = "npm test";
			if (testFile) {
				command += ` -- ${testFile}`;
				console.log(`🎯 Testing specific file: ${testFile}`);
			} else {
				console.log("🎯 Running all tests");
			}

			// ======================================================================
			// Step 4: Run tests
			// ======================================================================

			console.log("⏳ Running tests...");

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
				// npm test returns non-zero exit code when tests fail
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
			// Step 5: Parse test results
			// ======================================================================

			const summary = extractTestSummary(stdout + stderr);
			const failedTests =
				summary.failed > 0 ? extractFailedTests(stdout + stderr) : [];

			console.log("=".repeat(60));
			console.log(`${summary.failed === 0 ? "✅" : "❌"} Tests completed in ${duration}s`);
			console.log(`   - Passed: ${summary.passed}/${summary.total}`);
			if (summary.failed > 0) {
				console.log(`   - Failed: ${summary.failed}`);
				console.log("   - Failed tests:");
				failedTests.forEach((test) => console.log(`     • ${test}`));
			}

			return {
				success: summary.failed === 0,
				message:
					summary.failed === 0
						? `✅ ${summary.passed}/${summary.total} tests passed`
						: `❌ ${summary.failed}/${summary.total} tests failed`,
				summary: {
					passed: summary.passed,
					failed: summary.failed,
					total: summary.total,
					duration: `${duration}s`,
					failedTests,
				},
			};
		} catch (error: any) {
			// ======================================================================
			// Error Handling
			// ======================================================================

			console.log("=".repeat(60));
			console.error("❌ Test execution failed");

			let errorMessage = "Unknown error";

			if (error.code === "ETIMEDOUT" || error.killed) {
				errorMessage =
					"Tests timed out (> 2 minutes). Consider optimizing slow tests or increasing timeout.";
			} else if (error.code === "ENOENT") {
				errorMessage =
					"npm command not found. Ensure Node.js and npm are installed.";
			} else {
				errorMessage = error.message;
			}

			console.error(`   ${errorMessage}`);

			return {
				success: false,
				message: `❌ Test execution failed: ${errorMessage}`,
				error: errorMessage,
			};
		}
	},
});
