# Portfolio John Doe - Product Designer

Ce portfolio a été implémenté à partir d'une maquette Figma en utilisant uniquement HTML, CSS et JavaScript vanilla.

## 🚀 Fonctionnalités

### Design
- **Fidèle à la maquette Figma** avec respect des couleurs, typographies et espacements
- **Design responsive** adapté aux mobiles, tablettes et desktop
- **Animations fluides** pour une expérience utilisateur moderne
- **Police Poppins** intégrée via Google Fonts

### Sections
1. **Header** - Navigation avec logo et réseaux sociaux
2. **Hero** - Présentation avec photo de profil circulaire
3. **About** - Timeline des expériences professionnelles
4. **Work** - Portfolio de projets avec études de cas
5. **Contact** - Informations de contact avec image

### Interactions
- **Navigation smooth scroll** entre les sections
- **Bouton Resume** avec animations de clic
- **Highlight automatique** du menu selon la section visible
- **Hover effects** sur tous les éléments interactifs
- **Animations d'apparition** au scroll des éléments

## 🎨 Palette de couleurs

- **Primary Dark Blue**: `#03045E` - Texte principal
- **Light Yellow**: `#FBF8CC` - Arrière-plan
- **Accent Yellow**: `#F5EE84` - Éléments de surbrillance
- **Dark Brown**: `#474306` - Bordures et accents

## 📁 Structure des fichiers

```
/
├── index.html          # Structure HTML principale
├── styles.css          # Styles CSS avec responsive design
├── script.js           # Interactions JavaScript
├── assets/             # Images et assets
│   ├── profile-image.png
│   ├── study-case-1.png
│   ├── study-case-2.png
│   ├── contact-image.png
│   ├── medium-icon.svg
│   ├── behance-icon.svg
│   └── twitter-icon.svg
└── README_PORTFOLIO.md # Documentation
```

## 🛠️ Technologies utilisées

- **HTML5** - Structure sémantique
- **CSS3** - Styles avec Flexbox et animations
- **JavaScript ES6+** - Interactions et animations
- **Google Fonts** - Police Poppins

## 🎯 Points forts de l'implémentation

### CSS
- **Variables CSS** pour la cohérence des couleurs
- **Flexbox** pour les layouts responsives
- **Transitions et animations** CSS natives
- **Mobile-first approach** avec media queries

### JavaScript
- **Performance optimisée** avec throttling des événements
- **Intersection Observer** pour les animations au scroll
- **Event delegation** pour une meilleure performance
- **Code modulaire** avec fonctions séparées

### Accessibilité
- **Navigation au clavier** supportée
- **Alt texts** sur toutes les images
- **Contraste** respecté selon les guidelines
- **Structure sémantique** HTML

## 🚀 Lancement

1. **Ouvrir le fichier `index.html`** dans un navigateur web moderne
2. **Ou servir via un serveur local** pour de meilleures performances :
   ```bash
   # Avec Python 3
   python -m http.server 8000
   
   # Avec Node.js (si npx est installé)
   npx serve .
   ```

## 📱 Compatibilité

- **Chrome** 60+
- **Firefox** 60+
- **Safari** 12+
- **Edge** 79+

## 🔧 Personnalisation

### Modifier les couleurs
Éditer les valeurs dans `styles.css` :
```css
/* Couleurs principales */
body { background-color: #FBF8CC; color: #03045E; }
.btn-resume { background-color: #F5EE84; border-color: #474306; }
```

### Ajouter du contenu
1. **Textes** : Modifier directement dans `index.html`
2. **Images** : Remplacer les fichiers dans le dossier `assets/`
3. **Liens sociaux** : Mettre à jour les liens dans la section header

### Personnaliser les animations
Modifier les durées dans `styles.css` :
```css
.fade-in { animation: fadeInUp 0.8s ease forwards; }
.btn-resume { transition: all 0.3s ease; }
```

## 📋 Fonctionnalités avancées

- **Scroll spy** - Mise en surbrillance automatique du menu
- **Lazy loading** des animations pour de meilleures performances
- **Responsive images** avec optimisation automatique
- **Touch gestures** supportés sur mobile

## 🎉 Résultat

Le portfolio est maintenant prêt à être utilisé ! Il reproduit fidèlement la maquette Figma tout en ajoutant des interactions modernes et une expérience utilisateur fluide.

---

*Portfolio créé avec ❤️ en HTML, CSS et JavaScript vanilla*
