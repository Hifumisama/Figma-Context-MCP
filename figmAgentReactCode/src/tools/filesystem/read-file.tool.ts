import { createTool } from "@voltagent/core";
import { z } from "zod";
import { readFile } from "node:fs/promises";

/**
 * Tool pour lire un fichier du système de fichiers
 */
export const readFileTool = createTool({
	name: "read_file",
	description:
		"Read the contents of a file from the filesystem. Use this to read existing files like package.json, configuration files, or any other file you need to inspect.",
	parameters: z.object({
		filePath: z
			.string()
			.describe(
				"Absolute or relative path to the file to read (e.g., 'workspace/project/package.json')",
			),
	}),
	execute: async ({ filePath }) => {
		try {
			const content = await readFile(filePath, "utf-8");
			return {
				success: true,
				content,
				filePath,
				message: `Successfully read file: ${filePath}`,
			};
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error";
			throw new Error(`Failed to read file ${filePath}: ${errorMessage}`);
		}
	},
});
