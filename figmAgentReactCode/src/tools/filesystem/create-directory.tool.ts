import { createTool } from "@voltagent/core";
import { z } from "zod";
import { mkdir } from "node:fs/promises";

/**
 * Tool pour créer un dossier (et tous les dossiers parents si nécessaire)
 */
export const createDirectoryTool = createTool({
	name: "create_directory",
	description:
		"Create a directory and all parent directories if they don't exist. Use this to create the project folder structure. Example: 'workspace/project/src/components/atoms'",
	parameters: z.object({
		dirPath: z
			.string()
			.describe(
				"Path to the directory to create (e.g., 'workspace/project/src/components/atoms')",
			),
	}),
	execute: async ({ dirPath }) => {
		try {
			await mkdir(dirPath, { recursive: true });

			return {
				success: true,
				dirPath,
				message: `Successfully created directory: ${dirPath}`,
			};
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error";
			throw new Error(
				`Failed to create directory ${dirPath}: ${errorMessage}`,
			);
		}
	},
});
