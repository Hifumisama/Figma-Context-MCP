import { createTool } from "@voltagent/core";
import { z } from "zod";
import { glob } from "glob";

/**
 * Tool pour rechercher des fichiers par pattern glob
 */
export const searchFilesTool = createTool({
	name: "search_files",
	description:
		"Search for files using glob patterns. Use this to find files matching a pattern. Examples: '**/*.tsx' (all TypeScript React files), 'src/**/*.ts' (all TypeScript files in src), 'package.json' (find package.json files)",
	parameters: z.object({
		pattern: z
			.string()
			.describe(
				"Glob pattern to search for files (e.g., '**/*.tsx', 'src/**/*.ts')",
			),
		cwd: z
			.string()
			.optional()
			.describe("Working directory for the search (defaults to current directory)"),
	}),
	execute: async ({ pattern, cwd }) => {
		try {
			const files = await glob(pattern, {
				cwd: cwd || process.cwd(),
				ignore: ["node_modules/**", "dist/**", "build/**", ".git/**"],
			});

			return {
				success: true,
				files,
				count: files.length,
				pattern,
				message: `Found ${files.length} file(s) matching pattern: ${pattern}`,
			};
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error";
			throw new Error(
				`Failed to search files with pattern ${pattern}: ${errorMessage}`,
			);
		}
	},
});
