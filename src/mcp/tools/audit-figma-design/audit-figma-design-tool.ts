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
import { checkDetachedStyles } from "./rules/check-detached-styles.js";
import { checkLayerNaming } from "./rules/check-layer-naming.js";
import { checkAutoLayoutUsage } from "./rules/check-auto-layout-usage.js";
import { findDuplicates } from "./rules/find-duplicates.js";
import { checkExportSettings } from "./rules/check-export-settings.js";
import { checkGroupVsFrame } from "./rules/check-group-vs-frame.js";
import { findVariantCandidates } from "./rules/find-variant-candidates.js";
import { checkInteractionStates } from "./rules/check-interaction-states.js";
import { checkColorNames } from "./rules/check-color-names.js";
import { checkHiddenLayers } from "./rules/check-hidden-layers.js";
import { Logger } from "../../../utils/logger.js";

// --- Parameters ---
const parameters = {
    figmaDataJson: z.string().describe("A JSON string containing the simplified Figma data from the 'get_figma_context' tool."),
    outputFormat: z.enum(["markdown", "json"]).optional().default("markdown").describe("The desired output format for the report."),
};
export const auditParamsSchema = z.object(parameters);
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
    checkHiddenLayers,
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
        return "✅ **Rapport d'Audit Figma:** Aucun problème détecté. Excellent travail !";
    }

    let markdown = `# 📊 Rapport d'Audit Figma\n\n## 📋 Résumé\n\n`;
    markdown += `**${report.summary.totalIssues}** problèmes détectés répartis sur **${Object.keys(report.summary.issuesByRule).length}** types de règles.\n\n`;

    // Regrouper les résultats par composant/nœud
    const resultsByNode = report.results.reduce((acc, result) => {
        const nodeKey = `${result.nodeName} (${result.nodeId})`;
        if (!acc[nodeKey]) {
            acc[nodeKey] = {
                nodeName: result.nodeName,
                nodeId: result.nodeId,
                issues: []
            };
        }
        acc[nodeKey].issues.push({
            ruleId: result.ruleId,
            message: result.message
        });
        return acc;
    }, {} as Record<string, {nodeName: string, nodeId: string, issues: {ruleId: string, message: string}[]}>);

    markdown += `---\n\n## 🧩 Composants à corriger\n\n`;

    // Pour chaque composant, créer un tableau des règles à corriger
    for (const nodeKey in resultsByNode) {
        const node = resultsByNode[nodeKey];
        markdown += `### 🔧 **${node.nodeName}**\n`;
        markdown += `*ID Figma:* \`${node.nodeId}\`\n\n`;
        
        markdown += `| 🚨 Règle | 📝 Description du problème | 🔧 Action à effectuer |\n`;
        markdown += `|----------|---------------------------|------------------------|\n`;
        
        for (const issue of node.issues) {
            const actionSuggestion = getActionSuggestion(issue.ruleId);
            markdown += `| **${issue.ruleId}** | ${issue.message} | ${actionSuggestion} |\n`;
        }
        
        markdown += `\n---\n\n`;
    }

    // Ajouter un résumé par type de règle
    markdown += `## 📊 Répartition par type de règle\n\n`;
    markdown += `| 🔍 Type de règle | 🔢 Nombre d'occurrences | 📈 Impact |\n`;
    markdown += `|------------------|-------------------------|----------|\n`;
    
    for (const ruleId in report.summary.issuesByRule) {
        const count = report.summary.issuesByRule[ruleId];
        const impact = getImpactLevel(ruleId);
        markdown += `| **${ruleId}** | ${count} | ${impact} |\n`;
    }

    return markdown;
}

// Fonction helper pour suggérer des actions correctives
function getActionSuggestion(ruleId: string): string {
    const suggestions: Record<string, string> = {
        'detached-styles': 'Reconnecter aux styles du Design System',
        'layer-naming': 'Renommer avec une convention claire (ex: btn-primary)',
        'auto-layout-usage': 'Activer Auto Layout dans les propriétés',
        'duplicates': 'Créer un composant réutilisable',
        'export-settings': 'Configurer les paramètres d\'export',
        'group-vs-frame': 'Convertir le groupe en Frame',
        'variant-candidates': 'Créer des variants du composant',
        'interaction-states': 'Ajouter les états hover/focus/disabled',
        'color-names': 'Utiliser des noms sémantiques (primary, secondary)',
        'hidden-layers': 'Supprimer ou rendre visible le calque'
    };
    
    return suggestions[ruleId] || 'Consulter la documentation Figma';
}

// Fonction helper pour évaluer l'impact
function getImpactLevel(ruleId: string): string {
    const highImpact = ['detached-styles', 'auto-layout-usage', 'interaction-states'];
    const mediumImpact = ['layer-naming', 'duplicates', 'variant-candidates'];
    
    if (highImpact.includes(ruleId)) return '🔴 Élevé';
    if (mediumImpact.includes(ruleId)) return '🟡 Moyen';
    return '🟢 Faible';
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
