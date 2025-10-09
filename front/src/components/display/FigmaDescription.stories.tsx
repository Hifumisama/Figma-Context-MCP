import type { Meta, StoryObj } from '@storybook/react';
import FigmaDescription from './FigmaDescription';

const meta = {
  title: 'Display/FigmaDescription',
  component: FigmaDescription,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Affiche en markdown un texte résumant la page ou le composant analysé. Supporte le formatage markdown complet incluant titres, listes, liens et blocs de code.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-figma-background p-8">
        <div className="max-w-2xl mx-auto">
          <Story />
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof FigmaDescription>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    description: 'Ceci est une description simple de la maquette Figma.',
  },
};

export const Empty: Story = {
  args: {
    description: '',
  },
};

export const WithMarkdown: Story = {
  args: {
    description: `# Design System v2.0

## Vue d'ensemble
Cette maquette contient le nouveau design system de notre application.

### Composants principaux
- **Boutons**: Primary, Secondary, Tertiary
- **Inputs**: Text, Email, Password
- **Cards**: Product, User, Stats

### Couleurs
Le système utilise une palette de couleurs cohérente basée sur:
- Primary: #CB3CFF
- Background: #081028
- Text: #FFFFFF

### Notes importantes
> Cette version est encore en développement

**Important**: Tous les composants doivent utiliser Auto Layout.`,
  },
};

export const WithLists: Story = {
  args: {
    description: `Éléments à vérifier:

1. Tous les textes utilisent les styles définis
2. Les espacements respectent la grille 8px
3. Les couleurs proviennent du design system
4. Les composants ont des noms descriptifs

Points d'attention:
- Vérifier la cohérence des boutons
- Valider les états hover/focus
- Tester la responsivité`,
  },
};

export const WithLinks: Story = {
  args: {
    description: `## Ressources

Documentation complète disponible sur [notre site](https://example.com/docs).

Figma Community: [Lien vers le fichier public](https://www.figma.com/community)

### Guide de style
Consultez le [guide de style typographique](https://example.com/typography) pour plus d'informations.`,
  },
};

export const WithCode: Story = {
  args: {
    description: `## Implémentation technique

Les composants doivent être implémentés avec les classes suivantes:

\`\`\`css
.btn-primary {
  background: #CB3CFF;
  color: white;
  padding: 12px 24px;
}
\`\`\`

Variables CSS à utiliser:
- \`--color-primary\`: #CB3CFF
- \`--color-background\`: #081028`,
  },
};

export const CustomTitle: Story = {
  args: {
    title: 'À propos de ce design',
    description: 'Maquette créée pour le projet client XYZ. Elle contient tous les écrans principaux de l\'application mobile.',
  },
};

export const LongDescription: Story = {
  args: {
    description: `# Projet Mobile App - Phase 1

## Introduction
Cette maquette représente la première phase du développement de notre application mobile. Elle a été conçue en collaboration avec l'équipe UX et validée par les stakeholders.

## Objectifs
1. Créer une expérience utilisateur intuitive
2. Respecter les guidelines de Material Design
3. Assurer l'accessibilité (WCAG 2.1 niveau AA)
4. Optimiser pour les performances

## Structure de navigation
L'application est organisée en 4 sections principales:
- **Accueil**: Dashboard avec les statistiques clés
- **Profil**: Informations utilisateur et paramètres
- **Notifications**: Centre de notifications
- **Recherche**: Moteur de recherche avancé

## Design System
Nous avons créé un design system complet incluant:
- Palette de couleurs (primary, secondary, accent)
- Typographie (Roboto pour le corps, Poppins pour les titres)
- Iconographie (Material Icons)
- Composants réutilisables (buttons, cards, inputs)
- Grille et espacements (basés sur 8px)

## Prochaines étapes
1. Validation finale avec le client
2. Handoff aux développeurs
3. Création des prototypes interactifs
4. Tests utilisateurs

---

**Note**: Cette version est sujette à modifications selon les retours.`,
  },
};
