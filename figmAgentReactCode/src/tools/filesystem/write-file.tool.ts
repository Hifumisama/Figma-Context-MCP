import { createTool } from "@voltagent/core";
import { z } from "zod";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

/**
 * Tool pour écrire dans un fichier (création automatique du dossier parent)
 */
export const writeFileTool = createTool({
	name: "write_file",
	description:
		"Write content to a file, creating it if it doesn't exist. The parent directory will be created automatically if needed. Use this to create configuration files, source code files, or any other file.",
	parameters: z.object({
		filePath: z
			.string()
			.describe(
				"Absolute or relative path to the file (e.g., 'workspace/project/tailwind.config.js')",
			),
		content: z.string().describe("Content to write to the file"),
	}),
	execute: async ({ filePath, content }) => {
		try {
			// Créer le dossier parent si nécessaire
			const dir = path.dirname(filePath);
			await mkdir(dir, { recursive: true });

			await writeFile(filePath, content, "utf-8");

			return {
				success: true,
				filePath,
				bytes: content.length,
				message: `Successfully wrote ${content.length} bytes to ${filePath}`,
			};
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error";
			throw new Error(`Failed to write file ${filePath}: ${errorMessage}`);
		}
	},
});
