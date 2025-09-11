/**
 * @file Audit Figma Design Tool
 * @description This tool serves as the main engine for auditing a Figma design.
 * It takes a JSON string of simplified Figma data (produced by `get_figma_context`) and
 * runs a series of validation rules against it. The rules are organized into purely
 * programmatic checks and more complex, AI-based analyses. The tool aggregates the
 * results from all rules and formats them into a comprehensive report, which can be
 * output as either Markdown for readability or JSON for machine processing.
 */
import { z } from "zod";
import type { FigmaContext } from "../get-figma-context/types.js";
import type { AuditReport, AuditResult } from "./types.js";
import { getAllRuleDefinitions } from "./rules-registry.js";
import { checkDetachedStyles } from "./rules/check-detached-styles.js";
import { checkLayerNaming } from "./rules/check-layer-naming.js";
import { checkAutoLayoutUsage } from "./rules/check-auto-layout-usage.js";
import { checkExportSettings } from "./rules/check-export-settings.js";
import { checkGroupVsFrame } from "./rules/check-group-vs-frame.js";
import { findComponentCandidates } from "./rules/find-component-candidates.js";
import { checkInteractionStates } from "./rules/check-interaction-states.js";
import { checkColorNames } from "./rules/check-color-names.js";
import { checkHiddenLayers } from "./rules/check-hidden-layers.js";
import { Logger } from "../../../utils/logger.js";

// --- Parameters ---
const parameters = {
    figmaDataJson: z.string().describe("A JSON string containing the simplified Figma data from the 'get_figma_context' tool. it is used to analyse a part of a Figma file and points out issues."),
    outputFormat: z.enum(["markdown", "json"]).optional().default("markdown").describe("The desired output format for the report."),
};
export const auditParamsSchema = z.object(parameters);
type AuditParams = z.infer<typeof auditParamsSchema>;

interface AuditOptions {
    enableAiRules?: boolean;
}

// --- Rule Engine ---
const programmaticRules = [
    checkDetachedStyles,
    checkLayerNaming,
    checkAutoLayoutUsage,
    checkExportSettings,
    checkGroupVsFrame,
    checkHiddenLayers,
];

const aiBasedRules = [
    findComponentCandidates,
    checkInteractionStates,
    checkColorNames,
];

function runAudit(context: FigmaContext, options: AuditOptions): AuditReport {
    let allResults = programmaticRules.flatMap(rule => rule(context));

    if (options.enableAiRules) {
        const aiResults = aiBasedRules.flatMap(rule => rule(context));
        allResults = [...allResults, ...aiResults];
    }

    return {
        rulesDefinitions: getAllRuleDefinitions(),
        results: allResults,
    };
}

// --- Report Formatting ---

// Cette fonction n'est plus nécessaire avec la nouvelle structure

function formatReportAsMarkdown(report: AuditReport): string {
    if (report.results.length === 0) {
        return "✅ **Rapport d'Audit Figma:** Aucun problème détecté. Excellent travail !";
    }

    let markdown = `# 📊 Rapport d'Audit Figma\n\n## 📋 Résumé\n\n`;
    markdown += `**${report.results.length}** problèmes détectés.\n\n`;

    markdown += `---\n\n## 🔍 Détails par composant\n\n`;

    // Pour chaque résultat, créer une section
    for (const result of report.results) {
        const ruleNames = result.ruleIds.map(ruleId => {
            const ruleDef = report.rulesDefinitions.find(r => r.id === ruleId);
            return ruleDef ? `${ruleDef.icon} ${ruleDef.name}` : `Règle ${ruleId}`;
        }).join(', ');
        
        markdown += `### 🚨 **${result.nodeName}** (ID: \`${result.nodeId}\`)\n`;
        markdown += `**Règles violées:** ${ruleNames}\n`;
        if (result.moreInfos) {
            markdown += `**Détails:** ${result.moreInfos}\n`;
        }
        markdown += `\n---\n\n`;
    }

    return markdown;
}

// Ces fonctions ne sont plus nécessaires avec la nouvelle structure


// --- Handler ---
async function auditFigmaDesignHandler(params: AuditParams, options: AuditOptions) {
    try {
        const figmaContext: FigmaContext = JSON.parse(params.figmaDataJson);
        const report = runAudit(figmaContext, options);
        
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
