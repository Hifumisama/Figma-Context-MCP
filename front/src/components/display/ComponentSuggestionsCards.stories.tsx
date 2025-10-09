import type { Meta, StoryObj } from '@storybook/react';
import ComponentSuggestionsCards from './ComponentSuggestionsCards';

// Mock data for component suggestions
const mockSuggestions = [
  {
    componentName: 'Button Card',
    description: 'Bouton avec icône et texte utilisé pour les actions principales. Possède des variantes de couleur et de taille.',
    possibleInstances: [
      { name: 'Primary Button', nodeId: '123:456' },
      { name: 'Secondary Button', nodeId: '123:457' },
      { name: 'Action Button', nodeId: '123:458' },
      { name: 'Submit Button', nodeId: '123:459' },
    ],
    usableNodes: [
      { name: 'Button Container', nodeId: '123:456' },
      { name: 'Icon', nodeId: '123:460' },
      { name: 'Label Text', nodeId: '123:461' },
    ],
  },
  {
    componentName: 'Profile Card',
    description: 'Carte de profil utilisateur avec avatar, nom et description. Utilisée dans les listes et grilles.',
    possibleInstances: [
      { name: 'User Profile 1', nodeId: '124:456' },
      { name: 'User Profile 2', nodeId: '124:457' },
      { name: 'User Profile 3', nodeId: '124:458' },
    ],
    usableNodes: [
      { name: 'Card Container', nodeId: '124:456' },
      { name: 'Avatar Image', nodeId: '124:460' },
      { name: 'User Name', nodeId: '124:461' },
      { name: 'User Bio', nodeId: '124:462' },
    ],
  },
  {
    componentName: 'Status Badge',
    description: 'Badge de statut avec couleur dynamique. Indique l\'état d\'un élément (actif, inactif, en attente).',
    possibleInstances: [
      { name: 'Active Badge', nodeId: '125:456' },
      { name: 'Inactive Badge', nodeId: '125:457' },
    ],
    usableNodes: [
      { name: 'Badge Container', nodeId: '125:456' },
      { name: 'Status Dot', nodeId: '125:460' },
      { name: 'Status Label', nodeId: '125:461' },
    ],
  },
];

const mockBaseFigmaUrl = 'https://www.figma.com/design/abc123/My-Design';

const meta = {
  title: 'Display/ComponentSuggestionsCards',
  component: ComponentSuggestionsCards,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Affiche les suggestions de composants détectées par IA avec leurs instances et structure.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    componentSuggestions: {
      control: 'object',
      description: 'Liste des suggestions de composants avec instances et structure',
      table: {
        type: { summary: 'ComponentSuggestion[]' },
      },
    },
    baseFigmaUrl: {
      control: 'text',
      description: 'URL de base du fichier Figma pour générer les liens vers les nodes',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '' },
      },
    },
  },
} satisfies Meta<typeof ComponentSuggestionsCards>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    componentSuggestions: mockSuggestions,
    baseFigmaUrl: mockBaseFigmaUrl,
  },
  render: (args) => (
    <div className="min-h-screen bg-figma-background p-8">
      <ComponentSuggestionsCards {...args} />
    </div>
  ),
};

export const SingleSuggestion: Story = {
  args: {
    componentSuggestions: [mockSuggestions[0]],
    baseFigmaUrl: mockBaseFigmaUrl,
  },
  render: (args) => (
    <div className="min-h-screen bg-figma-background p-8">
      <ComponentSuggestionsCards {...args} />
    </div>
  ),
};

export const WithoutFigmaUrl: Story = {
  args: {
    componentSuggestions: mockSuggestions,
    baseFigmaUrl: '',
  },
  render: (args) => (
    <div className="min-h-screen bg-figma-background p-8">
      <ComponentSuggestionsCards {...args} />
    </div>
  ),
};

export const ManySuggestions: Story = {
  args: {
    componentSuggestions: [
      ...mockSuggestions,
      {
        componentName: 'Navigation Item',
        description: 'Élément de navigation avec icône et label. Supporte les états actif et hover.',
        possibleInstances: [
          { name: 'Nav Home', nodeId: '126:456' },
          { name: 'Nav Dashboard', nodeId: '126:457' },
          { name: 'Nav Settings', nodeId: '126:458' },
          { name: 'Nav Profile', nodeId: '126:459' },
          { name: 'Nav Logout', nodeId: '126:460' },
        ],
        usableNodes: [
          { name: 'Nav Container', nodeId: '126:456' },
          { name: 'Nav Icon', nodeId: '126:461' },
          { name: 'Nav Label', nodeId: '126:462' },
        ],
      },
      {
        componentName: 'Input Field',
        description: 'Champ de saisie avec label et placeholder. Gère les états erreur et focus.',
        possibleInstances: [
          { name: 'Email Input', nodeId: '127:456' },
          { name: 'Password Input', nodeId: '127:457' },
          { name: 'Name Input', nodeId: '127:458' },
        ],
        usableNodes: [
          { name: 'Input Container', nodeId: '127:456' },
          { name: 'Input Label', nodeId: '127:460' },
          { name: 'Input Field', nodeId: '127:461' },
          { name: 'Error Message', nodeId: '127:462' },
        ],
      },
      {
        componentName: 'Alert Banner',
        description: 'Bannière d\'alerte avec message et action. Variantes pour succès, erreur et information.',
        possibleInstances: [
          { name: 'Success Alert', nodeId: '128:456' },
          { name: 'Error Alert', nodeId: '128:457' },
          { name: 'Info Alert', nodeId: '128:458' },
        ],
        usableNodes: [
          { name: 'Alert Container', nodeId: '128:456' },
          { name: 'Alert Icon', nodeId: '128:460' },
          { name: 'Alert Message', nodeId: '128:461' },
          { name: 'Dismiss Button', nodeId: '128:462' },
        ],
      },
    ],
    baseFigmaUrl: mockBaseFigmaUrl,
  },
  render: (args) => (
    <div className="min-h-screen bg-figma-background p-8">
      <ComponentSuggestionsCards {...args} />
    </div>
  ),
};

export const ManyInstances: Story = {
  args: {
    componentSuggestions: [
      {
        componentName: 'Icon Button',
        description: 'Bouton avec icône seule, utilisé massivement dans l\'interface.',
        possibleInstances: Array.from({ length: 15 }, (_, i) => ({
          name: `Icon Button ${i + 1}`,
          nodeId: `200:${456 + i}`,
        })),
        usableNodes: [
          { name: 'Button Container', nodeId: '200:456' },
          { name: 'Icon', nodeId: '200:500' },
        ],
      },
    ],
    baseFigmaUrl: mockBaseFigmaUrl,
  },
  render: (args) => (
    <div className="min-h-screen bg-figma-background p-8">
      <ComponentSuggestionsCards {...args} />
    </div>
  ),
};

export const ComplexStructure: Story = {
  args: {
    componentSuggestions: [
      {
        componentName: 'Product Card',
        description: 'Carte de produit e-commerce avec image, titre, prix, rating et bouton d\'ajout au panier.',
        possibleInstances: [
          { name: 'Product 1', nodeId: '130:456' },
          { name: 'Product 2', nodeId: '130:457' },
          { name: 'Product 3', nodeId: '130:458' },
        ],
        usableNodes: [
          { name: 'Card Container', nodeId: '130:456' },
          { name: 'Product Image', nodeId: '130:460' },
          { name: 'Product Title', nodeId: '130:461' },
          { name: 'Product Price', nodeId: '130:462' },
          { name: 'Rating Stars', nodeId: '130:463' },
          { name: 'Rating Count', nodeId: '130:464' },
          { name: 'Add to Cart Button', nodeId: '130:465' },
          { name: 'Wishlist Icon', nodeId: '130:466' },
          { name: 'Product Badge', nodeId: '130:467' },
        ],
      },
    ],
    baseFigmaUrl: mockBaseFigmaUrl,
  },
  render: (args) => (
    <div className="min-h-screen bg-figma-background p-8">
      <ComponentSuggestionsCards {...args} />
    </div>
  ),
};

export const Empty: Story = {
  args: {
    componentSuggestions: [],
    baseFigmaUrl: mockBaseFigmaUrl,
  },
  render: (args) => (
    <div className="min-h-screen bg-figma-background p-8">
      <ComponentSuggestionsCards {...args} />
    </div>
  ),
};
