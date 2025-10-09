import type { Meta, StoryObj } from '@storybook/react';
import { useEffect } from 'react';
import TotalDetectedRules from './TotalDetectedRules';
import { AuditProvider, useAudit } from '../../contexts/AuditContext';

const mockAuditResultsWithDetections = {
  rulesDefinitions: [
    {
      id: 1,
      name: 'Auto Layout',
      description: 'Les conteneurs avec plusieurs enfants devraient utiliser Auto Layout',
      resolutionAdvice: 'Activer Auto Layout',
      icon: '📐',
      color: '#3B82F6',
      category: 'standard',
      state: 'enabled',
    },
    {
      id: 2,
      name: 'Nommage des calques',
      description: 'Éviter les noms par défaut de Figma',
      resolutionAdvice: 'Renommer les calques',
      icon: '🏷️',
      color: '#10B981',
      category: 'standard',
      state: 'enabled',
    },
    {
      id: 3,
      name: 'Styles détachés',
      description: 'Utiliser les tokens du Design System',
      resolutionAdvice: 'Reconnecter aux styles',
      icon: '🎨',
      color: '#EF4444',
      category: 'standard',
      state: 'enabled',
    },
    {
      id: 4,
      name: 'Paramètres d\'export',
      description: 'Les assets doivent avoir une configuration d\'export',
      resolutionAdvice: 'Configurer les paramètres d\'export',
      icon: '📤',
      color: '#F59E0B',
      category: 'standard',
      state: 'enabled',
    },
  ],
  results: [
    ...Array(15).fill(null).map((_, i) => ({
      ruleIds: [2],
      nodeId: `1:${i + 1}`,
      nodeName: `Frame ${i + 1}`,
      moreInfos: {},
    })),
    ...Array(8).fill(null).map((_, i) => ({
      ruleIds: [1],
      nodeId: `1:${100 + i}`,
      nodeName: `Container ${i + 1}`,
      moreInfos: {},
    })),
    ...Array(12).fill(null).map((_, i) => ({
      ruleIds: [3],
      nodeId: `1:${200 + i}`,
      nodeName: `Element ${i + 1}`,
      moreInfos: { '3': 'Propriétés détachées: fills' },
    })),
    ...Array(7).fill(null).map((_, i) => ({
      ruleIds: [4],
      nodeId: `1:${300 + i}`,
      nodeName: `Icon ${i + 1}`,
      moreInfos: {},
    })),
  ],
};

const mockAuditResultsNoDetections = {
  rulesDefinitions: [
    {
      id: 2,
      name: 'Nommage des calques',
      description: 'Éviter les noms par défaut de Figma',
      resolutionAdvice: 'Renommer les calques',
      icon: '🏷️',
      color: '#10B981',
      category: 'standard',
      state: 'enabled',
    },
  ],
  results: [],
};

const TotalDetectedRulesContent = ({ auditResult }: { auditResult: any }) => {
  const { setResults } = useAudit();

  useEffect(() => {
    if (auditResult) {
      setResults(auditResult);
    }
  }, [auditResult, setResults]);

  return (
    <div className="max-w-2xl mx-auto">
      <TotalDetectedRules />
    </div>
  );
};

const TotalDetectedRulesWithContext = ({ auditResult }: { auditResult: any }) => {
  return (
    <div className="min-h-screen bg-figma-background p-8">
      <AuditProvider>
        <TotalDetectedRulesContent auditResult={auditResult} />
      </AuditProvider>
    </div>
  );
};

const meta = {
  title: 'Display/TotalDetectedRules',
  component: TotalDetectedRulesWithContext,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Affiche un graphique permettant de visualiser la proportion de chaque règle détectée dans l\'audit. Utilise un diagramme en camembert interactif pour représenter la distribution des violations.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof TotalDetectedRulesWithContext>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithDetections: Story = {
  args: {
    auditResult: mockAuditResultsWithDetections,
  },
};

export const NoDetections: Story = {
  args: {
    auditResult: mockAuditResultsNoDetections,
  },
};

export const SingleRule: Story = {
  args: {
    auditResult: {
      rulesDefinitions: [
        {
          id: 2,
          name: 'Nommage des calques',
          description: 'Éviter les noms par défaut de Figma',
          resolutionAdvice: 'Renommer les calques',
          icon: '🏷️',
          color: '#10B981',
          category: 'standard',
          state: 'enabled',
        },
      ],
      results: Array(20).fill(null).map((_, i) => ({
        ruleIds: [2],
        nodeId: `1:${i + 1}`,
        nodeName: `Frame ${i + 1}`,
        moreInfos: {},
      })),
    },
  },
};

export const ManyRules: Story = {
  args: {
    auditResult: {
      rulesDefinitions: [
        {
          id: 1,
          name: 'Auto Layout',
          icon: '📐',
          color: '#3B82F6',
          category: 'standard',
          state: 'enabled',
          description: 'Utiliser Auto Layout',
          resolutionAdvice: 'Activer Auto Layout',
        },
        {
          id: 2,
          name: 'Nommage des calques',
          icon: '🏷️',
          color: '#10B981',
          category: 'standard',
          state: 'enabled',
          description: 'Éviter les noms par défaut',
          resolutionAdvice: 'Renommer les calques',
        },
        {
          id: 3,
          name: 'Styles détachés',
          icon: '🎨',
          color: '#EF4444',
          category: 'standard',
          state: 'enabled',
          description: 'Utiliser les styles du design system',
          resolutionAdvice: 'Reconnecter aux styles',
        },
        {
          id: 4,
          name: 'Export',
          icon: '📤',
          color: '#F59E0B',
          category: 'standard',
          state: 'enabled',
          description: 'Configurer l\'export',
          resolutionAdvice: 'Ajouter paramètres d\'export',
        },
        {
          id: 5,
          name: 'Calques cachés',
          icon: '👁️',
          color: '#EC4899',
          category: 'standard',
          state: 'enabled',
          description: 'Supprimer calques cachés',
          resolutionAdvice: 'Nettoyer les layers',
        },
        {
          id: 6,
          name: 'Groupes vs Frames',
          icon: '📦',
          color: '#8B5CF6',
          category: 'standard',
          state: 'enabled',
          description: 'Utiliser frames',
          resolutionAdvice: 'Convertir en frames',
        },
        {
          id: 7,
          name: 'Composants suggérés',
          icon: '🎯',
          color: '#06B6D4',
          category: 'ai-based',
          state: 'enabled',
          description: 'Créer des composants',
          resolutionAdvice: 'Componentiser',
        },
        {
          id: 8,
          name: 'États d\'interaction',
          icon: '⚡',
          color: '#14B8A6',
          category: 'ai-based',
          state: 'enabled',
          description: 'Ajouter états',
          resolutionAdvice: 'Créer variants',
        },
      ],
      results: [
        ...Array(25).fill(null).map((_, i) => ({ ruleIds: [2], nodeId: `1:${i}`, nodeName: 'Frame', moreInfos: {} })),
        ...Array(15).fill(null).map((_, i) => ({ ruleIds: [1], nodeId: `2:${i}`, nodeName: 'Container', moreInfos: {} })),
        ...Array(20).fill(null).map((_, i) => ({ ruleIds: [3], nodeId: `3:${i}`, nodeName: 'Element', moreInfos: { '3': 'Propriétés détachées: fills' } })),
        ...Array(12).fill(null).map((_, i) => ({ ruleIds: [4], nodeId: `4:${i}`, nodeName: 'Icon', moreInfos: {} })),
        ...Array(8).fill(null).map((_, i) => ({ ruleIds: [5], nodeId: `5:${i}`, nodeName: 'Hidden', moreInfos: {} })),
        ...Array(10).fill(null).map((_, i) => ({ ruleIds: [6], nodeId: `6:${i}`, nodeName: 'Group', moreInfos: {} })),
        ...Array(7).fill(null).map((_, i) => ({ ruleIds: [7], nodeId: `7:${i}`, nodeName: 'Pattern', moreInfos: {} })),
        ...Array(3).fill(null).map((_, i) => ({ ruleIds: [8], nodeId: `8:${i}`, nodeName: 'Button', moreInfos: {} })),
      ],
    },
  },
};
