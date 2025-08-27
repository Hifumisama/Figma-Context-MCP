# Portfolio John Doe - Template Vanilla

Ce template vanilla HTML/CSS/JS est une implémentation fidèle de la maquette Figma du portfolio de John Doe.

## Structure du projet

```
vanillaTemplate/
├── index.html          # Structure HTML principale
├── styles.css          # Styles CSS avec variables basées sur Figma
├── script.js           # JavaScript pour les interactions
├── README.md           # Documentation
└── images/             # Assets images extraites de Figma
    ├── behance-icon.svg
    ├── twitter-icon.svg
    ├── medium-icon.svg
    ├── profile-image.png
    ├── contact-image.png
    ├── project1.png
    └── project2.png
```

## Sections du portfolio

### 1. Header/Navigation
- Logo "John Doe"
- Navigation avec liens Home, About, Work
- Icônes des réseaux sociaux (Medium, Behance, Twitter)

### 2. Section Hero
- Titre principal "Product Designer"
- Sous-titre avec localisation
- Image de profil avec éléments décoratifs
- Bouton "Resume"
- Barres décoratives animées

### 3. Section About
- Titre "about."
- Description personnelle
- Timeline avec 3 périodes (2014-2018, 2018-2020, 2020-Present)

### 4. Section Work
- Titre "work."
- Grille de projets avec images
- Cartes de projets avec dates et descriptions

### 5. Section Contact
- Titre "contact."
- Image de contact
- Informations de contact (email, réseaux sociaux)

## Palette de couleurs (extraite de Figma)

- **Primaire**: #03045E (Bleu foncé)
- **Secondaire**: #474306 (Marron foncé)
- **Accent**: #F7F197 (Jaune clair)
- **Arrière-plan**: #FBF8CC (Crème)
- **Surface**: #F5EE84 (Jaune)
- **Blanc**: #FFFFFF

## Typographie

- **Police**: Poppins (Google Fonts)
- **Tailles**: 15px à 100px selon les éléments
- **Poids**: 400 (Regular), 500 (Medium), 600 (Semibold), 800 (Bold)

## Fonctionnalités JavaScript

### Navigation
- Smooth scrolling vers les sections
- Navigation active selon la section visible
- Animation hover sur les liens

### Animations
- Intersection Observer pour les animations au scroll
- Animation des barres décoratives
- Timeline avec animation d'apparition
- Parallax léger sur l'image hero
- Hover effects sur les cartes de projets

### Interactivité
- Animation click sur le bouton Resume
- Hover effects sur les icônes sociales
- Lazy loading des images

## Responsive Design

Le template est entièrement responsive avec des breakpoints à :
- **768px** : Tablette (navigation verticale, grille simplifiée)
- **480px** : Mobile (textes plus petits, espacements réduits)

## Comment utiliser

1. Ouvrir `index.html` dans un navigateur moderne
2. Toutes les dépendances sont incluses (Google Fonts, images locales)
3. Aucune compilation nécessaire

## Fidélité à la maquette Figma

Ce template respecte exactement :
- ✅ Les dimensions et espacements
- ✅ La palette de couleurs
- ✅ La typographie (Poppins avec les bonnes tailles et poids)
- ✅ La disposition des éléments
- ✅ Les images et icônes
- ✅ Les éléments décoratifs

## Prochaines étapes

Ce template servira de base pour :
1. Définir l'architecture des composants SvelteKit
2. Créer les tests unitaires
3. Implémenter les composants SvelteKit réutilisables
