import type { Meta, StoryObj } from '@storybook/react';
import PrimaryButton from './PrimaryButton';

const meta = {
  title: 'Forms/PrimaryButton',
  component: PrimaryButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Bouton principal avec états de chargement et désactivation. Supporte les animations de hover et les spinners de loading.',
      },
    },
    actions: {
      handles: ['click'],
    },
  },
  tags: ['autodocs'],
  argTypes: {
    text: {
      control: 'text',
      description: 'Texte affiché sur le bouton',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: "'🔍 Lancer l\\'audit'" },
      },
    },
    loadingText: {
      control: 'text',
      description: 'Texte affiché pendant le chargement',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: "'⏳ Audit en cours...'" },
      },
    },
    isLoading: {
      control: 'boolean',
      description: 'Affiche le spinner de chargement et désactive le bouton',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    canSubmit: {
      control: 'boolean',
      description: 'Active ou désactive le bouton',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    type: {
      control: 'select',
      options: ['submit', 'button', 'reset'],
      description: 'Type HTML du bouton',
      table: {
        type: { summary: "'submit' | 'button' | 'reset'" },
        defaultValue: { summary: "'submit'" },
      },
    },
    onClick: {
      action: 'clicked',
      description: 'Fonction appelée lors du clic',
      table: {
        type: { summary: '() => void' },
      },
    },
  },
} satisfies Meta<typeof PrimaryButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const Disabled: Story = {
  args: {
    canSubmit: false,
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
  },
};

export const CustomText: Story = {
  args: {
    text: '✨ Démarrer l\'analyse',
  },
};

export const CustomLoadingText: Story = {
  args: {
    isLoading: true,
    loadingText: '⚙️ Traitement en cours...',
  },
};

export const ButtonType: Story = {
  args: {
    type: 'button',
    text: '🔘 Bouton simple',
  },
};

export const LongText: Story = {
  args: {
    text: '🚀 Lancer l\'analyse complète du design system',
  },
};

export const LongLoadingText: Story = {
  args: {
    isLoading: true,
    loadingText: '⏳ Analyse approfondie en cours, veuillez patienter...',
  },
};
