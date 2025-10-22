import { createTool } from "@voltagent/core";
import { z } from "zod";
import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

/**
 * Tool pour exécuter des commandes bash/shell
 */
export const runBashCommandTool = createTool({
	name: "run_bash_command",
	description:
		"Execute a shell command and return the output. Use this to run npm commands, install packages, etc. IMPORTANT: Do NOT use '&&' to chain commands - use the 'cwd' parameter instead. Examples: 'npm create vite@latest project -- --template react-ts' with cwd='workspace', 'npm install tailwindcss' with cwd='workspace/project'",
	parameters: z.object({
		command: z
			.string()
			.describe(
				"The shell command to execute (e.g., 'npm install tailwindcss postcss autoprefixer'). Do NOT include 'cd' or '&&' - use the cwd parameter instead.",
			),
		cwd: z
			.string()
			.optional()
			.describe(
				"Working directory for the command (defaults to current directory). Use this instead of 'cd' commands.",
			),
	}),
	execute: async ({ command, cwd }) => {
		try {
			// Sur Windows, on utilise cmd.exe au lieu de PowerShell pour une meilleure compatibilité
			// avec les commandes npm et les outils Node.js
			const shellConfig =
				process.platform === "win32"
					? { shell: "cmd.exe" }
					: { shell: "/bin/bash" };

			const { stdout, stderr } = await execAsync(command, {
				cwd: cwd || process.cwd(),
				maxBuffer: 1024 * 1024 * 10, // 10MB buffer
				...shellConfig,
			});

			return {
				success: true,
				stdout: stdout.trim(),
				stderr: stderr.trim(),
				command,
				cwd: cwd || process.cwd(),
				message: `Command executed successfully: ${command}`,
			};
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error";
			// En cas d'erreur, on retourne quand même stdout/stderr si disponibles
			const stderr = (error as any).stderr || "";
			const stdout = (error as any).stdout || "";

			throw new Error(
				`Command failed: ${command}\nError: ${errorMessage}\nStdout: ${stdout}\nStderr: ${stderr}`,
			);
		}
	},
});
