import type { Meta, StoryObj } from '@storybook/react';
import { useEffect } from 'react';
import StatsCards from './StatsCards';
import { AuditProvider, useAudit } from '../../contexts/AuditContext';

// Mock audit results with various scenarios - based on real API format
const mockAuditResultsWithIssues = {
  rulesDefinitions: [
    {
      id: 1,
      name: 'Auto Layout',
      description: 'Les conteneurs avec plusieurs enfants devraient utiliser Auto Layout',
      resolutionAdvice: 'Activer Auto Layout dans les propriétés du frame',
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
    {
      id: 5,
      name: 'Calques cachés',
      description: 'Détecte les layers invisibles',
      resolutionAdvice: 'Supprimer ou afficher les layers cachés',
      icon: '👁️',
      color: '#EC4899',
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

const mockAuditResultsAllCompliant = {
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
  ],
  results: [],
};

const StatsCardsContent = ({ auditResult }: { auditResult: any }) => {
  const { setResults } = useAudit();

  useEffect(() => {
    if (auditResult) {
      setResults(auditResult);
    }
  }, [auditResult, setResults]);

  return <StatsCards />;
};

const StatsCardsWithContext = ({ auditResult }: { auditResult: any }) => {
  return (
    <div className="min-h-screen bg-figma-background p-8">
      <AuditProvider>
        <StatsCardsContent auditResult={auditResult} />
      </AuditProvider>
    </div>
  );
};

const meta = {
  title: 'Display/StatsCards',
  component: StatsCardsWithContext,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Affiche les différentes règles d\'audit avec leur statut de conformité. Pour les règles non conformes, indique le nombre de nœuds violant la règle. Présente un aperçu visuel rapide de la santé du design.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof StatsCardsWithContext>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithIssues: Story = {
  args: {
    auditResult: mockAuditResultsWithIssues,
  },
};

export const AllCompliant: Story = {
  args: {
    auditResult: mockAuditResultsAllCompliant,
  },
};

export const SingleRuleWithIssues: Story = {
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
      results: Array(15).fill(null).map((_, i) => ({
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
      rulesDefinitions: Array(10).fill(null).map((_, i) => ({
        id: i + 1,
        name: `Règle ${i + 1}`,
        description: `Description de la règle ${i + 1}`,
        resolutionAdvice: `Conseil pour la règle ${i + 1}`,
        icon: ['🏷️', '📐', '🎨', '📦', '👁️', '🔄', '🎯', '🚀', '⚡', '🔧'][i] || '📋',
        color: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#EF4444', '#06B6D4', '#14B8A6', '#F97316', '#6366F1'][i] || '#6B7280',
        category: 'standard',
        state: 'enabled',
      })),
      results: Array.from({ length: 80 }).flatMap((_, i) => {
        const ruleId = (i % 10) + 1;
        return [{
          ruleIds: [ruleId],
          nodeId: `1:${i + 1}`,
          nodeName: `Element ${i + 1}`,
          moreInfos: {},
        }];
      }),
    },
  },
};
