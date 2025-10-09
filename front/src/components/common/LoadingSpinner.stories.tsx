import type { Meta, StoryObj } from '@storybook/react';
import LoadingSpinner from './LoadingSpinner';

const meta = {
  title: 'Common/LoadingSpinner',
  component: LoadingSpinner,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Indicateur de chargement animé avec spinner, messages personnalisables et barre de progression indéterminée.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    message: {
      control: 'text',
      description: 'Message principal affiché pendant le chargement',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: "'Audit en cours...'" },
      },
    },
    subtext: {
      control: 'text',
      description: 'Texte secondaire explicatif',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: "'Analyse de votre design Figma en cours, veuillez patienter.'" },
      },
    },
  },
} satisfies Meta<typeof LoadingSpinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const CustomMessage: Story = {
  args: {
    message: 'Chargement des données...',
    subtext: 'Merci de patienter pendant que nous récupérons vos informations.'
  },
};

export const ShortMessage: Story = {
  args: {
    message: 'Traitement...',
    subtext: 'Opération en cours.'
  },
};

export const LongMessage: Story = {
  args: {
    message: 'Analyse approfondie de votre projet',
    subtext: 'Nous analysons chaque composant de votre design Figma pour identifier les opportunités d\'amélioration et les problèmes potentiels. Cette opération peut prendre quelques instants.'
  },
};
