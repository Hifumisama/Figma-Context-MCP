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
import type { AuditReport, AuditResult, AsyncAuditRule } from "./types.js";
import { getAllRuleDefinitions } from "./rules-registry.js";
import { checkDetachedStyles } from "./rules/check-detached-styles.js";
import { checkLayerNaming } from "./rules/check-layer-naming.js";
import { checkAutoLayoutUsage } from "./rules/check-auto-layout-usage.js";
import { checkExportSettings } from "./rules/check-export-settings.js";
import { checkGroupVsFrame } from "./rules/check-group-vs-frame.js";
import { checkInteractionStates } from "./rules/check-interaction-states.js";
import { checkColorNames } from "./rules/check-color-names.js";
import { checkComponentDescriptions } from "./rules/check-component-descriptions.js";
import { detectComponentPatterns } from "./detectors/pattern-detector.js";
import { FigmaDescriptionGenerator } from "./generators/figma-description-generator.js";
import { LLMService } from "../../../services/llm-service.js";
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
    checkComponentDescriptions,
];

const aiBasedRules: AsyncAuditRule[] = [
    checkColorNames,
    checkInteractionStates,
];

async function runAudit(context: FigmaContext, options: AuditOptions): Promise<AuditReport> {
    let allResults = programmaticRules.flatMap(rule => rule(context));

    // Detect component patterns using AI (independent of enableAiRules flag)
    const componentSuggestions = await detectComponentPatterns(context);

    // Generate Figma description
    let figmaAiDescription: string;
    if (options.enableAiRules) {
        try {
            const llmService = LLMService.fromEnvironment();
            const descriptionGenerator = new FigmaDescriptionGenerator(llmService);
            const descriptionResult = await descriptionGenerator.generateDescription(context);

            if (descriptionResult.success && descriptionResult.description) {
                figmaAiDescription = descriptionResult.description;
            } else {
                Logger.log(`Échec de la génération de description IA: ${descriptionResult.error}`);
                figmaAiDescription = "⚠️ La description automatique n'a pas pu être générée correctement.\n\n" +
                    FigmaDescriptionGenerator.generateFallbackDescription(context);
            }
        } catch (error) {
            Logger.log(`Erreur lors de la génération de description: ${error}`);
            figmaAiDescription = "⚠️ La description automatique n'a pas pu être générée correctement.\n\n" +
                FigmaDescriptionGenerator.generateFallbackDescription(context);
        }

        // Attendre que toutes les règles AI se terminent
        const aiResultsPromises = aiBasedRules.map(rule => rule(context));
        const aiResultsArrays = await Promise.all(aiResultsPromises);
        const aiResults = aiResultsArrays.flat();
        allResults = [...allResults, ...aiResults];
    } else {
        figmaAiDescription = FigmaDescriptionGenerator.generateFallbackDescription(context);
    }

    // Grouper les résultats par nodeId pour consolider les règles
    const groupedResults = groupResultsByNodeId(allResults);

    // Déduplication des erreurs communes entre composants et instances
    const deduplicatedResults = deduplicateComponentInstances(groupedResults);

    return {
        rulesDefinitions: getAllRuleDefinitions(),
        results: deduplicatedResults,
        designSystem: context.globalVars?.designSystem,
        componentSuggestions,
        figmaAiDescription,
    };
}

/**
 * Groupe les résultats d'audit par nodeId pour consolider les règles multiples
 * sur le même node en un seul AuditResult avec un tableau ruleIds
 */
function groupResultsByNodeId(results: AuditResult[]): AuditResult[] {
    const grouped = new Map<string, AuditResult>();

    for (const result of results) {
        const existing = grouped.get(result.nodeId);

        if (existing) {
            // Node déjà présent : ajouter les nouvelles règles
            existing.ruleIds.push(...result.ruleIds);

            // Fusionner les objets moreInfos
            existing.moreInfos = { ...existing.moreInfos, ...result.moreInfos };
        } else {
            // Nouveau node : créer une nouvelle entrée
            grouped.set(result.nodeId, {
                ruleIds: [...result.ruleIds], // Copier le tableau
                nodeId: result.nodeId,
                nodeName: result.nodeName,
                moreInfos: { ...result.moreInfos } // Copier l'objet
            });
        }
    }

    return Array.from(grouped.values());
}

/**
 * Élimine les duplications entre composants maîtres et leurs instances.
 * Pour chaque instance, supprime les règles communes avec son composant maître,
 * gardant seulement les erreurs spécifiques à l'instance.
 */
function deduplicateComponentInstances(results: AuditResult[]): AuditResult[] {
    // Séparer les composants maîtres des instances
    const masterComponents = new Map<string, AuditResult>();
    const instances = new Map<string, AuditResult & { masterComponentId: string }>();
    const otherNodes: AuditResult[] = [];

    for (const result of results) {
        if (result.nodeId.startsWith('I')) {
            // Instance : extraire l'ID du composant maître (premier segment après "I")
            const masterComponentId = result.nodeId.substring(1).split(';')[0];
            instances.set(result.nodeId, { ...result, masterComponentId });
        } else {
            // Potentiel composant maître ou autre node
            masterComponents.set(result.nodeId, result);
            otherNodes.push(result);
        }
    }

    // Déduplication des instances
    const deduplicatedResults: AuditResult[] = [];

    // Garder tous les composants maîtres et autres nodes
    deduplicatedResults.push(...otherNodes);

    // Traiter chaque instance
    for (const [instanceId, instance] of instances.entries()) {
        const masterComponent = masterComponents.get(instance.masterComponentId);

        if (masterComponent) {
            // Filtrer les règles communes entre l'instance et son composant maître
            const uniqueRuleIds = instance.ruleIds.filter(
                ruleId => !masterComponent.ruleIds.includes(ruleId)
            );

            // Garder l'instance seulement si elle a des erreurs spécifiques
            if (uniqueRuleIds.length > 0) {
                // Filtrer aussi les moreInfos pour ne garder que celles des règles spécifiques
                const filteredMoreInfos: { [key: string]: string } = {};
                for (const ruleId of uniqueRuleIds) {
                    if (instance.moreInfos[ruleId]) {
                        filteredMoreInfos[ruleId] = instance.moreInfos[ruleId];
                    }
                }

                deduplicatedResults.push({
                    ...instance,
                    ruleIds: uniqueRuleIds,
                    moreInfos: filteredMoreInfos
                });
            }
            // Si pas d'erreurs spécifiques, l'instance est complètement filtrée
        } else {
            // Pas de composant maître trouvé, garder l'instance telle quelle
            deduplicatedResults.push(instance);
        }
    }

    return deduplicatedResults;
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
        
        // Afficher les détails par règle si présents
        const moreInfosEntries = Object.entries(result.moreInfos);
        if (moreInfosEntries.length > 0) {
            markdown += `**Détails par règle:**\n`;
            for (const [ruleId, info] of moreInfosEntries) {
                if (info && info.trim()) {
                    const ruleDef = report.rulesDefinitions.find(r => r.id === parseInt(ruleId));
                    const ruleName = ruleDef ? `${ruleDef.icon} ${ruleDef.name}` : `Règle ${ruleId}`;
                    markdown += `- **${ruleName}:** ${info}\n`;
                }
            }
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
        const report = await runAudit(figmaContext, options);
        
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
