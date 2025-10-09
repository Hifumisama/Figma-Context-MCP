import type { Meta, StoryObj } from '@storybook/react';
import { useEffect } from 'react';
import DetailedTables from './DetailedTables';
import { AuditProvider, useAudit } from '../../contexts/AuditContext';

// Mock audit results with various scenarios - based on real API format
const mockAuditResultsWithIssues = {
  rulesDefinitions: [
    {
      id: 1,
      name: 'Nommage des calques',
      description: 'Éviter les noms par défaut de Figma comme "Frame 123". Utiliser une convention claire (ex: btn-primary)',
      resolutionAdvice: 'Renommer les calques avec une convention claire et descriptive',
      icon: '🏷️',
      color: '#10B981',
      category: 'standard',
      state: 'enabled',
    },
    {
      id: 2,
      name: 'Utilisation d\'Auto Layout',
      description: 'Les conteneurs avec plusieurs enfants devraient utiliser Auto Layout',
      resolutionAdvice: 'Activer Auto Layout dans les propriétés du frame',
      icon: '📐',
      color: '#3B82F6',
      category: 'standard',
      state: 'enabled',
    },
    {
      id: 3,
      name: 'Styles détachés',
      description: 'Utiliser les tokens du Design System plutôt que les styles inline',
      resolutionAdvice: 'Reconnecter aux styles du Design System',
      icon: '🎨',
      color: '#EF4444',
      category: 'standard',
      state: 'enabled',
    },
    {
      id: 4,
      name: 'Paramètres d\'export',
      description: 'Les assets doivent avoir une configuration d\'export appropriée',
      resolutionAdvice: 'Configurer les paramètres d\'export (format, résolution, suffixe)',
      icon: '📤',
      color: '#F59E0B',
      category: 'standard',
      state: 'enabled',
    },
  ],
  results: [
    {
      ruleIds: [2],
      nodeId: '1:123',
      nodeName: 'Frame 123',
      moreInfos: {},
    },
    {
      ruleIds: [2],
      nodeId: '1:145',
      nodeName: 'Rectangle 45',
      moreInfos: {},
    },
    {
      ruleIds: [2],
      nodeId: '2:167',
      nodeName: 'Group 67',
      moreInfos: {},
    },
    {
      ruleIds: [1],
      nodeId: '1:200',
      nodeName: 'Header Container',
      moreInfos: {},
    },
    {
      ruleIds: [1],
      nodeId: '1:201',
      nodeName: 'Footer Container',
      moreInfos: {},
    },
    {
      ruleIds: [3],
      nodeId: '1:300',
      nodeName: 'Button 1',
      moreInfos: { '3': 'Propriétés détachées: fills' },
    },
    {
      ruleIds: [3],
      nodeId: '1:301',
      nodeName: 'Text 2',
      moreInfos: { '3': 'Propriétés détachées: textStyle' },
    },
    {
      ruleIds: [3],
      nodeId: '2:302',
      nodeName: 'Card Background',
      moreInfos: { '3': 'Propriétés détachées: fills, strokes' },
    },
    {
      ruleIds: [4],
      nodeId: '1:400',
      nodeName: 'Icon Home',
      moreInfos: {},
    },
    {
      ruleIds: [4],
      nodeId: '1:401',
      nodeName: 'Icon Settings',
      moreInfos: {},
    },
  ],
};

const mockAuditResultsManyIssues = {
  rulesDefinitions: [
    {
      id: 1,
      name: 'Nommage des calques',
      description: 'Éviter les noms par défaut de Figma',
      resolutionAdvice: 'Renommer les calques',
      icon: '🏷️',
      color: '#10B981',
      category: 'standard',
      state: 'enabled',
    },
    {
      id: 2,
      name: 'Auto Layout',
      description: 'Utiliser Auto Layout',
      resolutionAdvice: 'Activer Auto Layout',
      icon: '📐',
      color: '#3B82F6',
      category: 'standard',
      state: 'enabled',
    },
    {
      id: 3,
      name: 'Styles détachés',
      description: 'Utiliser les styles du design system',
      resolutionAdvice: 'Reconnecter aux styles',
      icon: '🎨',
      color: '#EF4444',
      category: 'standard',
      state: 'enabled',
    },
  ],
  results: [
    ...Array.from({ length: 30 }, (_, i) => ({
      ruleIds: [2],
      nodeId: `${Math.floor(i / 10) + 1}:${i + 100}`,
      nodeName: `Frame ${i + 100}`,
      moreInfos: {},
    })),
    ...Array.from({ length: 15 }, (_, i) => ({
      ruleIds: [1],
      nodeId: `${Math.floor(i / 5) + 1}:${200 + i}`,
      nodeName: `Container ${i + 1}`,
      moreInfos: {},
    })),
    ...Array.from({ length: 5 }, (_, i) => ({
      ruleIds: [3],
      nodeId: `1:${300 + i}`,
      nodeName: `Element ${i + 1}`,
      moreInfos: { '3': 'Propriétés détachées: fills' },
    })),
  ],
};

const mockAuditResultsSingleIssue = {
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
  results: [
    {
      ruleIds: [2],
      nodeId: '1:123',
      nodeName: 'Frame 123',
      moreInfos: {},
    },
  ],
};

const mockAuditResultsNoIssues = {
  rulesDefinitions: [],
  results: [],
};

const DetailedTablesContent = ({ auditResult, figmaUrl }: any) => {
  const { setResults, setFigmaUrl } = useAudit();

  useEffect(() => {
    if (auditResult) {
      setResults(auditResult);
    }
    if (figmaUrl) {
      setFigmaUrl(figmaUrl);
    }
  }, [auditResult, figmaUrl, setResults, setFigmaUrl]);

  return <DetailedTables />;
};

const DetailedTablesWithContext = ({ auditResult, figmaUrl }: any) => {
  return (
    <div className="min-h-screen bg-figma-background p-8">
      <AuditProvider>
        <DetailedTablesContent auditResult={auditResult} figmaUrl={figmaUrl} />
      </AuditProvider>
    </div>
  );
};

const meta = {
  title: 'Display/DetailedTables',
  component: DetailedTablesWithContext,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Tableau détaillé listant tous les nœuds avec problèmes détectés. Chaque ligne affiche les badges de règles cliquables et un lien vers le nœud dans Figma.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    auditResult: {
      control: 'object',
      description: 'Résultat de l\'audit avec rules et detections',
      table: {
        type: { summary: 'AuditResult' },
      },
    },
    figmaUrl: {
      control: 'text',
      description: 'URL du fichier Figma pour générer les liens',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '' },
      },
    },
  },
} satisfies Meta<typeof DetailedTablesWithContext>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithIssues: Story = {
  args: {
    auditResult: mockAuditResultsWithIssues,
    figmaUrl: 'https://www.figma.com/design/abc123/My-Design',
  },
};

export const ManyIssues: Story = {
  args: {
    auditResult: mockAuditResultsManyIssues,
    figmaUrl: 'https://www.figma.com/design/abc123/My-Design',
  },
};

export const SingleIssue: Story = {
  args: {
    auditResult: mockAuditResultsSingleIssue,
    figmaUrl: 'https://www.figma.com/design/abc123/My-Design',
  },
};

export const NoIssues: Story = {
  args: {
    auditResult: mockAuditResultsNoIssues,
    figmaUrl: 'https://www.figma.com/design/abc123/My-Design',
  },
};

export const WithoutFigmaUrl: Story = {
  args: {
    auditResult: mockAuditResultsWithIssues,
    figmaUrl: '',
  },
};

export const MultipleRulesPerNode: Story = {
  args: {
    auditResult: {
      rulesDefinitions: [
        {
          id: 1,
          name: 'Auto Layout',
          description: 'Utiliser Auto Layout',
          resolutionAdvice: 'Activer Auto Layout',
          icon: '📐',
          color: '#3B82F6',
          category: 'standard',
          state: 'enabled',
        },
        {
          id: 2,
          name: 'Nommage des calques',
          description: 'Éviter les noms par défaut',
          resolutionAdvice: 'Renommer les calques',
          icon: '🏷️',
          color: '#10B981',
          category: 'standard',
          state: 'enabled',
        },
        {
          id: 3,
          name: 'Styles détachés',
          description: 'Utiliser les styles du design system',
          resolutionAdvice: 'Reconnecter aux styles',
          icon: '🎨',
          color: '#EF4444',
          category: 'standard',
          state: 'enabled',
        },
      ],
      results: [
        {
          ruleIds: [1, 2, 3],
          nodeId: '1:123',
          nodeName: 'Frame 123',
          moreInfos: { '3': 'Propriétés détachées: fills' },
        },
        {
          ruleIds: [2, 3],
          nodeId: '1:145',
          nodeName: 'Rectangle 45',
          moreInfos: { '3': 'Propriétés détachées: textStyle' },
        },
      ],
    },
    figmaUrl: 'https://www.figma.com/design/abc123/My-Design',
  },
};
