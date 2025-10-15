import { describe, it, expect, vi, beforeEach } from 'vitest';
import { auditFigmaDesignTool } from './audit-figma-design-tool.js';
import type { FigmaContext } from '../get-figma-context/types.js';
import type { AuditResult } from './types.js';

// Mock des dépendances
vi.mock('./rules/check-detached-styles.js', () => ({
    checkDetachedStyles: vi.fn(() => []),
}));

vi.mock('./rules/check-layer-naming.js', () => ({
    checkLayerNaming: vi.fn(() => []),
}));

vi.mock('./rules/check-auto-layout-usage.js', () => ({
    checkAutoLayoutUsage: vi.fn(() => []),
}));

vi.mock('./rules/check-export-settings.js', () => ({
    checkExportSettings: vi.fn(() => []),
}));

vi.mock('./rules/check-group-vs-frame.js', () => ({
    checkGroupVsFrame: vi.fn(() => []),
}));

vi.mock('./rules/check-color-names.js', () => ({
    checkColorNames: vi.fn(async () => []),
}));

vi.mock('./rules/check-component-descriptions.js', () => ({
    checkComponentDescriptions: vi.fn(() => []),
}));

vi.mock('./rules/check-color-contrast.js', () => ({
    checkColorContrast: vi.fn(() => []),
}));

vi.mock('./rules/check-typography.js', () => ({
    checkTypography: vi.fn(() => []),
}));

vi.mock('./detectors/pattern-detector.js', () => ({
    detectComponentPatterns: vi.fn(async () => []),
}));

vi.mock('./generators/figma-description-generator.js', () => ({
    FigmaDescriptionGenerator: {
        generateFallbackDescription: vi.fn(() => 'Fallback description'),
    },
}));

vi.mock('./rules-registry.js', () => ({
    getAllRuleDefinitions: vi.fn(() => [
        { id: 1, name: 'Rule 1', icon: '🔴', description: 'Test rule 1' },
        { id: 2, name: 'Rule 2', icon: '🟢', description: 'Test rule 2' },
    ]),
}));

vi.mock('../../../services/llm-service.js', () => ({
    LLMService: {
        fromEnvironment: vi.fn(),
    },
}));

vi.mock('../../../utils/logger.js', () => ({
    Logger: {
        log: vi.fn(),
        error: vi.fn(),
    },
}));

describe('auditFigmaDesignTool', () => {
    const createMockContext = (): FigmaContext => ({
        name: 'Test Design',
        lastModified: '2025-01-01',
        thumbnailUrl: 'https://example.com/thumb.png',
        nodes: [{
            id: '1:1',
            name: 'Test Node',
            type: 'FRAME',
        }],
        components: {},
        componentSets: {},
        globalVars: {
            designSystem: {
                colors: {},
                text: {},
                strokes: {},
                layout: {},
            },
            localStyles: {
                colors: {},
                text: {},
                strokes: {},
                layout: {},
            },
            images: {},
        },
    });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('auditFigmaDesignHandler', () => {
        it('should successfully audit valid Figma context with markdown output', async () => {
            const context = createMockContext();
            const params = {
                figmaDataJson: JSON.stringify(context),
                outputFormat: 'markdown' as const,
            };

            const result = await auditFigmaDesignTool.handler(params, { enableAiRules: false });

            expect(result).toHaveProperty('content');
            expect(result.content).toBeInstanceOf(Array);
            expect(result.content[0]).toHaveProperty('type', 'text');
            expect(result.content[0]).toHaveProperty('text');
            expect(typeof result.content[0].text).toBe('string');
        });

        it('should successfully audit valid Figma context with json output', async () => {
            const context = createMockContext();
            const params = {
                figmaDataJson: JSON.stringify(context),
                outputFormat: 'json' as const,
            };

            const result = await auditFigmaDesignTool.handler(params, { enableAiRules: false });

            expect(result).toHaveProperty('content');
            const jsonText = result.content[0].text;
            expect(() => JSON.parse(jsonText)).not.toThrow();

            const parsedReport = JSON.parse(jsonText);
            expect(parsedReport).toHaveProperty('rulesDefinitions');
            expect(parsedReport).toHaveProperty('results');
            expect(parsedReport).toHaveProperty('componentSuggestions');
        });

        it('should return error when invalid JSON is provided', async () => {
            const params = {
                figmaDataJson: 'invalid-json{',
                outputFormat: 'markdown' as const,
            };

            const result = await auditFigmaDesignTool.handler(params, { enableAiRules: false });

            expect(result).toHaveProperty('isError', true);
            expect(result.content[0].text).toContain('Error during Figma audit');
        });

        it('should return success message when no issues are detected', async () => {
            const context = createMockContext();
            const params = {
                figmaDataJson: JSON.stringify(context),
                outputFormat: 'markdown' as const,
            };

            const result = await auditFigmaDesignTool.handler(params, { enableAiRules: false });

            const text = result.content[0].text;
            expect(text).toContain('Aucun problème détecté');
        });
    });

    describe('groupResultsByNodeId', () => {
        it('should consolidate multiple rules for same node', async () => {
            const { checkLayerNaming } = await import('./rules/check-layer-naming.js');
            const { checkDetachedStyles } = await import('./rules/check-detached-styles.js');

            // Simuler deux règles violées sur le même node
            vi.mocked(checkLayerNaming).mockReturnValue([
                {
                    ruleIds: [1],
                    nodeId: '1:1',
                    nodeName: 'Test Node',
                    moreInfos: { '1': 'Layer naming issue' },
                },
            ]);

            vi.mocked(checkDetachedStyles).mockReturnValue([
                {
                    ruleIds: [2],
                    nodeId: '1:1',
                    nodeName: 'Test Node',
                    moreInfos: { '2': 'Detached styles issue' },
                },
            ]);

            const context = createMockContext();
            const params = {
                figmaDataJson: JSON.stringify(context),
                outputFormat: 'json' as const,
            };

            const result = await auditFigmaDesignTool.handler(params, { enableAiRules: false });
            const report = JSON.parse(result.content[0].text);

            // Vérifier qu'il n'y a qu'un seul résultat consolidé
            expect(report.results).toHaveLength(1);
            expect(report.results[0].nodeId).toBe('1:1');
            expect(report.results[0].ruleIds).toHaveLength(2);
            expect(report.results[0].ruleIds).toContain(1);
            expect(report.results[0].ruleIds).toContain(2);
            expect(report.results[0].moreInfos).toHaveProperty('1');
            expect(report.results[0].moreInfos).toHaveProperty('2');
        });
    });

    describe('deduplicateComponentInstances', () => {
        it('should remove common errors between master component and instances', async () => {
            const { checkLayerNaming } = await import('./rules/check-layer-naming.js');

            // Simuler un composant maître et son instance avec la même erreur
            vi.mocked(checkLayerNaming).mockReturnValue([
                {
                    ruleIds: [1],
                    nodeId: '1:1',
                    nodeName: 'Master Component',
                    moreInfos: { '1': 'Common issue' },
                },
                {
                    ruleIds: [1],
                    nodeId: 'I1:1;2:2',
                    nodeName: 'Instance',
                    moreInfos: { '1': 'Common issue' },
                },
            ]);

            const context = createMockContext();
            const params = {
                figmaDataJson: JSON.stringify(context),
                outputFormat: 'json' as const,
            };

            const result = await auditFigmaDesignTool.handler(params, { enableAiRules: false });
            const report = JSON.parse(result.content[0].text);

            // L'instance ne devrait pas apparaître car elle partage les mêmes erreurs que le maître
            const instanceResult = report.results.find((r: AuditResult) => r.nodeId === 'I1:1;2:2');
            expect(instanceResult).toBeUndefined();

            // Le composant maître devrait être présent
            const masterResult = report.results.find((r: AuditResult) => r.nodeId === '1:1');
            expect(masterResult).toBeDefined();
        });

        it('should keep instance errors that are specific to the instance', async () => {
            const { checkLayerNaming } = await import('./rules/check-layer-naming.js');
            const { checkDetachedStyles } = await import('./rules/check-detached-styles.js');

            // Simuler un composant maître avec l'erreur 1, et son instance avec les erreurs 1 et 2
            vi.mocked(checkLayerNaming).mockReturnValue([
                {
                    ruleIds: [1],
                    nodeId: '1:1',
                    nodeName: 'Master Component',
                    moreInfos: { '1': 'Common issue' },
                },
                {
                    ruleIds: [1],
                    nodeId: 'I1:1;2:2',
                    nodeName: 'Instance',
                    moreInfos: { '1': 'Common issue' },
                },
            ]);

            vi.mocked(checkDetachedStyles).mockReturnValue([
                {
                    ruleIds: [2],
                    nodeId: 'I1:1;2:2',
                    nodeName: 'Instance',
                    moreInfos: { '2': 'Instance-specific issue' },
                },
            ]);

            const context = createMockContext();
            const params = {
                figmaDataJson: JSON.stringify(context),
                outputFormat: 'json' as const,
            };

            const result = await auditFigmaDesignTool.handler(params, { enableAiRules: false });
            const report = JSON.parse(result.content[0].text);

            // L'instance devrait apparaître avec seulement l'erreur 2
            const instanceResult = report.results.find((r: AuditResult) => r.nodeId === 'I1:1;2:2');
            expect(instanceResult).toBeDefined();
            expect(instanceResult?.ruleIds).toEqual([2]);
            expect(instanceResult?.moreInfos).toHaveProperty('2');
            expect(instanceResult?.moreInfos).not.toHaveProperty('1');
        });
    });

    describe('formatReportAsMarkdown', () => {
        it('should format report with multiple issues in markdown', async () => {
            const { checkLayerNaming } = await import('./rules/check-layer-naming.js');

            vi.mocked(checkLayerNaming).mockReturnValue([
                {
                    ruleIds: [1],
                    nodeId: '1:1',
                    nodeName: 'Test Node 1',
                    moreInfos: { '1': 'Issue description 1' },
                },
                {
                    ruleIds: [2],
                    nodeId: '1:2',
                    nodeName: 'Test Node 2',
                    moreInfos: { '2': 'Issue description 2' },
                },
            ]);

            const context = createMockContext();
            const params = {
                figmaDataJson: JSON.stringify(context),
                outputFormat: 'markdown' as const,
            };

            const result = await auditFigmaDesignTool.handler(params, { enableAiRules: false });
            const markdown = result.content[0].text;

            // Vérifier la structure du markdown
            expect(markdown).toContain('Rapport d\'Audit Figma');
            expect(markdown).toContain('Résumé');
            expect(markdown).toContain('problèmes détectés');
            expect(markdown).toContain('Test Node 1');
            expect(markdown).toContain('Test Node 2');
            expect(markdown).toContain('Issue description 1');
            expect(markdown).toContain('Issue description 2');
        });

        it('should include rule names with icons in markdown', async () => {
            const { checkLayerNaming } = await import('./rules/check-layer-naming.js');

            vi.mocked(checkLayerNaming).mockReturnValue([
                {
                    ruleIds: [1],
                    nodeId: '1:1',
                    nodeName: 'Test Node',
                    moreInfos: { '1': 'Issue' },
                },
            ]);

            const context = createMockContext();
            const params = {
                figmaDataJson: JSON.stringify(context),
                outputFormat: 'markdown' as const,
            };

            const result = await auditFigmaDesignTool.handler(params, { enableAiRules: false });
            const markdown = result.content[0].text;

            // Vérifier que les noms de règles et icônes sont présents
            expect(markdown).toMatch(/🔴.*Rule 1/);
        });
    });

    describe('tool metadata', () => {
        it('should have correct tool name', () => {
            expect(auditFigmaDesignTool.name).toBe('audit_figma_design');
        });

        it('should have required parameters', () => {
            expect(auditFigmaDesignTool.parameters).toHaveProperty('figmaDataJson');
            expect(auditFigmaDesignTool.parameters).toHaveProperty('outputFormat');
        });

        it('should have handler function', () => {
            expect(typeof auditFigmaDesignTool.handler).toBe('function');
        });
    });
});
