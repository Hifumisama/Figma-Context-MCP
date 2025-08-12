import { z } from "zod";
import type { FigmaContext } from "../get-figma-context/types.js";
import type { AuditReport, AuditResult } from "./types.js";
import { checkDetachedStyles } from "./rules/check-detached-styles.js";
import { checkLayerNaming } from "./rules/check-layer-naming.js";
import { checkAutoLayoutUsage } from "./rules/check-auto-layout-usage.js";
import { findDuplicates } from "./rules/find-duplicates.js";
import { checkExportSettings } from "./rules/check-export-settings.js";
import { checkGroupVsFrame } from "./rules/check-group-vs-frame.js";
import { findVariantCandidates } from "./rules/find-variant-candidates.js";
import { checkInteractionStates } from "./rules/check-interaction-states.js";
import { checkColorNames } from "./rules/check-color-names.js";
import { Logger } from "../../../utils/logger.js";

// --- Parameters ---
const parameters = {
    figmaDataJson: z.string().describe("A JSON string containing the simplified Figma data from the 'get_figma_context' tool."),
    outputFormat: z.enum(["markdown", "json"]).optional().default("markdown").describe("The desired output format for the report."),
};
const auditParamsSchema = z.object(parameters);
type AuditParams = z.infer<typeof auditParamsSchema>;


// --- Rule Engine ---
const allRules = [
    checkDetachedStyles,
    checkLayerNaming,
    checkAutoLayoutUsage,
    findDuplicates,
    checkExportSettings,
    checkGroupVsFrame,
    findVariantCandidates,
    checkInteractionStates,
    checkColorNames,
];

function runAudit(context: FigmaContext): AuditReport {
    const allResults = allRules.flatMap(rule => rule(context));
    const issuesByRule = allResults.reduce((acc, result) => {
        acc[result.ruleId] = (acc[result.ruleId] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return {
        results: allResults,
        summary: {
            totalIssues: allResults.length,
            issuesByRule,
        },
    };
}

// --- Report Formatting ---
function formatReportAsMarkdown(report: AuditReport): string {
    if (report.summary.totalIssues === 0) {
        return "✅ **Figma Audit Report:** No issues found. Excellent work!";
    }

    let markdown = `# Figma Audit Report\n\nFound ${report.summary.totalIssues} potential issues.\n\n`;

    const resultsByRule = report.results.reduce((acc, result) => {
        if (!acc[result.ruleId]) {
            acc[result.ruleId] = [];
        }
        acc[result.ruleId].push(result);
        return acc;
    }, {} as Record<string, AuditResult[]>);

    for (const ruleId in resultsByRule) {
        markdown += `## Rule: ${ruleId} (${resultsByRule[ruleId].length} issues)\n\n`;
        for (const result of resultsByRule[ruleId]) {
            markdown += `- **Node:** "${result.nodeName}" (ID: \`${result.nodeId}\`)\n  - **Issue:** ${result.message}\n`;
        }
        markdown += `\n`;
    }

    return markdown;
}


// --- Handler ---
async function auditFigmaDesignHandler(params: AuditParams) {
    try {
        const figmaContext: FigmaContext = JSON.parse(params.figmaDataJson);
        const report = runAudit(figmaContext);
        
        let outputText: string;
        if (params.outputFormat === 'json') {
            outputText = JSON.stringify(report, null, 2);
        } else {
            outputText = formatReportAsMarkdown(report);
        }

        return {
            content: [{ type: "text" as const, text: outputText }],
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : JSON.stringify(error);
        Logger.error(`Error in audit_figma_design:`, message);
        return {
            isError: true,
            content: [{ type: "text" as const, text: `Error during Figma audit: ${message}` }],
        };
    }
}

// --- Tool Definition ---
export const auditFigmaDesignTool = {
    name: "audit_figma_design",
    description: "Audits simplified Figma data against a set of design best practices and generates a report.",
    parameters,
    handler: auditFigmaDesignHandler,
} as const;
