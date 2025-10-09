import type { Meta, StoryObj } from '@storybook/react';
import RuleBadge from './RuleBadge';
import { AuditProvider } from '../contexts/AuditContext';

// Mock rule data
const mockAuditResults = {
  summary: {
    totalIssues: 42,
    rulesTriggered: 3,
  },
  rules: [
    {
      ruleId: 1,
      name: 'Noms par défaut',
      description: 'Identifie les layers avec des noms génériques de Figma',
      icon: '🏷️',
      color: '#3B82F6',
      severity: 'warning' as const,
      category: 'naming' as const,
      detections: [{ node: 'Frame 123', path: 'Page 1 > Frame 123' }],
    },
    {
      ruleId: 2,
      name: 'Auto Layout',
      description: 'Détecte les frames qui devraient utiliser Auto Layout',
      icon: '📐',
      color: '#10B981',
      severity: 'info' as const,
      category: 'layout' as const,
      detections: [],
    },
    {
      ruleId: 3,
      name: 'Styles détachés',
      description: 'Trouve les éléments n\'utilisant pas les styles du design system',
      icon: '🎨',
      color: '#F59E0B',
      severity: 'error' as const,
      category: 'design-system' as const,
      detections: [
        { node: 'Button 1', path: 'Page 1 > Button 1' },
        { node: 'Text 2', path: 'Page 1 > Text 2' },
      ],
    },
  ],
};

// Wrapper to provide context
const RuleBadgeWithContext = (args: { ruleId: number; isActive?: boolean }) => {
  return (
    <AuditProvider initialState={{
      isLoading: false,
      error: null,
      auditResult: mockAuditResults,
      figmaUrl: '',
      figmaApiKey: '',
    }}>
      <div className="bg-figma-background p-8">
        <RuleBadge {...args} onClick={() => console.log(`Clicked rule ${args.ruleId}`)} />
      </div>
    </AuditProvider>
  );
};

const meta = {
  title: 'Common/RuleBadge',
  component: RuleBadgeWithContext,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Badge cliquable représentant une règle d\'audit avec icône, nom, compteur de détections et couleur de catégorie. Supporte les états actif/inactif.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    ruleId: {
      control: 'number',
      description: 'ID de la règle à afficher (1=Naming, 2=AutoLayout, 3=DetachedStyles)',
      table: {
        type: { summary: 'number' },
      },
    },
    isActive: {
      control: 'boolean',
      description: 'État actif/sélectionné du badge',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
  },
} satisfies Meta<typeof RuleBadgeWithContext>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultNaming: Story = {
  args: {
    ruleId: 1,
  },
};

export const ActiveNaming: Story = {
  args: {
    ruleId: 1,
    isActive: true,
  },
};

export const AutoLayout: Story = {
  args: {
    ruleId: 2,
  },
};

export const ActiveAutoLayout: Story = {
  args: {
    ruleId: 2,
    isActive: true,
  },
};

export const DetachedStyles: Story = {
  args: {
    ruleId: 3,
  },
};

export const ActiveDetachedStyles: Story = {
  args: {
    ruleId: 3,
    isActive: true,
  },
};

export const AllBadges: Story = {
  render: () => (
    <AuditProvider initialState={{
      isLoading: false,
      error: null,
      auditResult: mockAuditResults,
      figmaUrl: '',
      figmaApiKey: '',
    }}>
      <div className="bg-figma-background p-8 space-y-4">
        <div className="flex flex-wrap gap-2">
          <RuleBadge ruleId={1} onClick={() => console.log('Clicked rule 1')} />
          <RuleBadge ruleId={2} onClick={() => console.log('Clicked rule 2')} />
          <RuleBadge ruleId={3} onClick={() => console.log('Clicked rule 3')} />
        </div>
        <div className="flex flex-wrap gap-2">
          <RuleBadge ruleId={1} isActive onClick={() => console.log('Clicked rule 1')} />
          <RuleBadge ruleId={2} isActive onClick={() => console.log('Clicked rule 2')} />
          <RuleBadge ruleId={3} isActive onClick={() => console.log('Clicked rule 3')} />
        </div>
      </div>
    </AuditProvider>
  ),
};
