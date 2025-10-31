/**
 * Centralized MCP Configuration
 *
 * This file contains all MCP server configurations used by VoltAgent tools.
 * It provides a single source of truth for MCP endpoints and settings.
 *
 * Available MCP Servers:
 * - figma: Custom Figma MCP server for fetching design data
 * - filesystem: Official filesystem MCP server for file operations
 *
 * Documentation:
 * - Figma MCP: Custom implementation in parent project
 * - Filesystem MCP: https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem
 */

import { MCPConfiguration } from "@voltagent/core";

/**
 * MCP Server Endpoints
 */
export const MCP_ENDPOINTS = {
	figma: process.env.MCP_FIGMA_ENDPOINT || "http://localhost:3333/mcp",
	// Filesystem MCP uses stdio mode by default (via npx command)
	// No HTTP endpoint needed for filesystem
} as const;

/**
 * MCP Configuration for VoltAgent
 *
 * This configuration is used by all tools that need to interact with MCP servers.
 * It includes timeout settings and server definitions.
 *
 * Note: The filesystem MCP server runs via npx in stdio mode and is configured
 * to access the ./workspace directory for isolated project generation.
 */
export const mcpConfig = new MCPConfiguration({
	servers: {
		figma: {
			type: "http",
			url: MCP_ENDPOINTS.figma,
			timeout: 30000, // 30 seconds for Figma API calls
		},
		// Filesystem MCP server configuration
		// Runs via npx @modelcontextprotocol/server-filesystem
		// with access restricted to ./workspace directory
		filesystem: {
			type: "stdio",
			command: "npx",
			args: [
				"-y",
				"@modelcontextprotocol/server-filesystem",
				"./workspace", // Restrict access to workspace directory only
			],
		},
	},
});

/**
 * MCP Tool Names
 *
 * Standardized names for MCP tools across the codebase.
 * This ensures consistency when calling MCP tools from VoltAgent.
 */
export const MCP_TOOL_NAMES = {
	figma: {
		getContext: "figma_get_figma_context",
		getData: "figma_get_figma_data",
		auditDesign: "figma_audit_figma_design",
		downloadImages: "figma_download_figma_images",
	},
	filesystem: {
		readFile: "filesystem_read_file",
		writeFile: "filesystem_write_file",
		createDirectory: "filesystem_create_directory",
		listDirectory: "filesystem_list_directory",
		moveFile: "filesystem_move_file",
		searchFiles: "filesystem_search_files",
	},
} as const;

/**
 * Helper function to get MCP toolset for a specific server
 *
 * @param serverName - Name of the MCP server (e.g., 'figma', 'filesystem')
 * @returns Toolset for the specified server
 * @throws Error if server is not found
 */
export async function getMCPToolset(
	serverName: "figma" | "filesystem",
): Promise<any> {
	const toolsets = await mcpConfig.getToolsets();

	if (!toolsets[serverName]) {
		const endpoint =
			serverName === "figma"
				? MCP_ENDPOINTS.figma
				: "stdio mode (npx @modelcontextprotocol/server-filesystem)";
		throw new Error(
			`MCP server '${serverName}' not found. Ensure the server is running at ${endpoint}`,
		);
	}

	return toolsets[serverName];
}

/**
 * Helper function to get a specific MCP tool
 *
 * @param serverName - Name of the MCP server
 * @param toolName - Name of the tool to retrieve
 * @returns The requested MCP tool
 * @throws Error if server or tool is not found
 */
export async function getMCPTool(
	serverName: "figma" | "filesystem",
	toolName: string,
): Promise<any> {
	const toolset = await getMCPToolset(serverName);
	const tools = toolset.getTools();

	const tool = tools.find((t: any) => t.name === toolName);

	if (!tool) {
		throw new Error(
			`MCP tool '${toolName}' not found on server '${serverName}'. ` +
				`Available tools: ${tools.map((t: any) => t.name).join(", ")}`,
		);
	}

	return tool;
}
