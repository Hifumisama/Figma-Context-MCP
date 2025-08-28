# Portfolio John Doe - SvelteKit

Un portfolio moderne et responsive créé avec SvelteKit basé sur une maquette Figma. Ce projet présente le travail de John Doe, Product Designer basé aux Pays-Bas.

## 🚀 Fonctionnalités

- **Design Responsive** : Optimisé pour desktop, tablette et mobile
- **Architecture Modulaire** : Composants réutilisables et maintenables
- **Performance Optimisée** : Images optimisées et CSS minimal
- **Accessibilité** : Navigation au clavier et styles de focus
- **SEO Friendly** : Meta tags et structure sémantique

## 📁 Structure des Composants

```
src/lib/components/
├── Header.svelte          # Navigation principale
├── Hero.svelte           # Section d'accueil avec image de profil
├── About.svelte          # Section à propos avec timeline
├── Work.svelte           # Portfolio de projets
├── Contact.svelte        # Informations de contact
├── SocialIcons.svelte    # Icônes des réseaux sociaux
└── Button.svelte         # Composant bouton réutilisable
```

## 🎨 Palette de Couleurs

- **Primaire** : `#FBF8CC` (Crème clair)
- **Secondaire** : `#F7F197` (Jaune pâle)
- **Accent** : `#F5EE84` (Jaune doré)
- **Texte Principal** : `#03045E` (Bleu marine)
- **Texte Secondaire** : `#474306` (Brun foncé)

## 🛠️ Technologies Utilisées

- **SvelteKit** - Framework principal
- **TypeScript** - Typage statique
- **CSS3** - Styling avec variables CSS et Grid/Flexbox
- **Vite** - Build tool et dev server

## 📱 Sections du Portfolio

### 1. Header
- Navigation fixe avec liens d'ancrage
- Icônes des réseaux sociaux
- Design responsive avec menu mobile

### 2. Hero Section
- Présentation personnelle
- Image de profil avec éléments décoratifs
- Bouton d'appel à l'action
- Barres décoratives animées

### 3. About Section
- Description personnelle
- Timeline des expériences professionnelles
- Design avec points de navigation

### 4. Work Section
- Grille de projets responsive
- Images avec effet hover
- Descriptions détaillées des projets

### 5. Contact Section
- Image de contact
- Informations de contact cliquables
- Layout en deux colonnes

## 🚀 Démarrage Rapide

```bash
# Installation des dépendances
npm install

# Démarrage du serveur de développement
npm run dev

# Build pour la production
npm run build

# Prévisualisation du build
npm run preview
```

## 📐 Responsive Design

Le design s'adapte à trois breakpoints principaux :
- **Desktop** : > 1024px
- **Tablette** : 768px - 1024px
- **Mobile** : < 768px

## ♿ Accessibilité

- Navigation au clavier complète
- Styles de focus visibles
- Structure sémantique HTML
- Textes alternatifs pour les images
- Contraste de couleurs respecté

## 🔧 Personnalisation

Pour personnaliser le portfolio :

1. **Contenu** : Modifiez les textes directement dans les composants
2. **Images** : Remplacez les fichiers dans `src/lib/assets/`
3. **Couleurs** : Ajustez les variables CSS dans `app.css`
4. **Typographie** : Changez la police dans les imports Google Fonts

## 📄 Licence

Ce projet est créé à des fins éducatives et de démonstration.