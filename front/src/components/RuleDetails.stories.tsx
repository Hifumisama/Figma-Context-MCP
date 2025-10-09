import type { Meta, StoryObj } from '@storybook/react';
import { useEffect } from 'react';
import RuleDetails from './RuleDetails';
import { AuditProvider, useAudit } from '../contexts/AuditContext';

const mockAuditResults = {
  rulesDefinitions: [
    {
      id: 1,
      name: 'Noms par défaut',
      description: 'Identifie les layers avec des noms génériques de Figma comme "Frame 123" ou "Rectangle 45"',
      resolutionAdvice: 'Renommez les layers avec des noms descriptifs qui expliquent leur fonction',
      icon: '🏷️',
      color: '#3B82F6',
      category: 'standard' as const,
      state: 'enabled' as const,
    },
    {
      id: 2,
      name: 'Auto Layout',
      description: 'Détecte les frames qui devraient utiliser Auto Layout pour une meilleure flexibilité',
      resolutionAdvice: 'Convertissez les frames en Auto Layout pour faciliter les modifications',
      icon: '📐',
      color: '#10B981',
      category: 'standard' as const,
      state: 'enabled' as const,
    },
    {
      id: 3,
      name: 'Styles détachés',
      description: 'Trouve les éléments n\'utilisant pas les styles du design system, rendant les mises à jour difficiles',
      resolutionAdvice: 'Appliquez les styles définis dans votre design system pour maintenir la cohérence',
      icon: '🎨',
      color: '#F59E0B',
      category: 'standard' as const,
      state: 'enabled' as const,
    },
  ],
  results: [
    {
      ruleIds: [1],
      nodeId: '1:123',
      nodeName: 'Frame 123',
      moreInfos: {},
    },
    {
      ruleIds: [2],
      nodeId: '1:456',
      nodeName: 'Container 1',
      moreInfos: {},
    },
    {
      ruleIds: [3],
      nodeId: '1:789',
      nodeName: 'Button 1',
      moreInfos: {},
    },
    {
      ruleIds: [3],
      nodeId: '1:790',
      nodeName: 'Text 2',
      moreInfos: {},
    },
  ],
  designSystem: {
    text: {},
    strokes: {},
    layout: {},
    colors: {},
  },
  localStyles: {
    text: {},
    strokes: {},
    layout: {},
    colors: {},
  },
  componentSuggestions: [],
  figmaAiDescription: '',
};

const RuleDetailsContent = (args: { ruleId: number; isOpen?: boolean; moreInfos?: Record<string, string> }) => {
  const { setResults } = useAudit();

  useEffect(() => {
    setResults(mockAuditResults);
  }, [setResults]);

  return (
    <div className="max-w-4xl mx-auto">
      <RuleDetails {...args} />
    </div>
  );
};

const RuleDetailsWithContext = (args: { ruleId: number; isOpen?: boolean; moreInfos?: Record<string, string> }) => {
  return (
    <div className="min-h-screen bg-figma-background p-8">
      <AuditProvider>
        <RuleDetailsContent {...args} />
      </AuditProvider>
    </div>
  );
};

const meta = {
  title: 'Common/RuleDetails',
  component: RuleDetailsWithContext,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Affiche les détails d\'une règle d\'audit avec son icône, sa description et les conseils de résolution. Peut être ouvert ou fermé, et accepte des informations supplémentaires via moreInfos.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof RuleDetailsWithContext>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = {
  args: {
    ruleId: 1,
    isOpen: false,
  },
};

export const OpenNaming: Story = {
  args: {
    ruleId: 1,
    isOpen: true,
  },
};

export const OpenAutoLayout: Story = {
  args: {
    ruleId: 2,
    isOpen: true,
  },
};

export const OpenDetachedStyles: Story = {
  args: {
    ruleId: 3,
    isOpen: true,
  },
};

export const WithMoreInfos: Story = {
  args: {
    ruleId: 1,
    isOpen: true,
    moreInfos: {
      '1': 'Ces noms génériques rendent la navigation dans le fichier difficile et peuvent causer des confusions lors de la collaboration avec les développeurs.',
    },
  },
};

export const WithLongMoreInfos: Story = {
  args: {
    ruleId: 3,
    isOpen: true,
    moreInfos: {
      '3': 'L\'utilisation de styles détachés signifie que chaque élément a ses propres valeurs de couleur, taille de police, etc. au lieu de référencer les styles centralisés. Cela rend les mises à jour globales impossibles et augmente le risque d\'incohérences visuelles. Pour corriger cela, créez des styles de couleur et de texte dans votre bibliothèque de design system, puis appliquez-les à tous vos éléments.',
    },
  },
};

const MultipleRulesContent = () => {
  const { setResults } = useAudit();

  useEffect(() => {
    setResults(mockAuditResults);
  }, [setResults]);

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <h2 className="text-white text-xl font-bold mb-4">Détails des règles</h2>
      <RuleDetails ruleId={1} isOpen={true} />
      <RuleDetails ruleId={2} isOpen={true} />
      <RuleDetails ruleId={3} isOpen={true} moreInfos={{
        '3': 'Informations supplémentaires sur les styles détachés.'
      }} />
    </div>
  );
};

export const MultipleRules: Story = {
  args: {
    ruleId: 1,
    isOpen: true,
  },
  render: () => (
    <div className="min-h-screen bg-figma-background p-8">
      <AuditProvider>
        <MultipleRulesContent />
      </AuditProvider>
    </div>
  ),
};

export const InvalidRule: Story = {
  args: {
    ruleId: 999,
    isOpen: true,
  },
};
