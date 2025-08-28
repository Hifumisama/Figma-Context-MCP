# Portfolio John Doe - Product Designer

Ce projet est une implémentation fidèle du design Figma "Portfolio Corrected" en utilisant uniquement HTML, CSS et JavaScript vanilla.

## 🎨 Design Source

Le design original provient de Figma : [Portfolio Corrected](https://www.figma.com/design/yaZFysgcTn6HB5JWaEcq2O/Portfolio-Corrected)

## 🚀 Fonctionnalités

- **Design Responsive** : Adapté pour desktop, tablette et mobile
- **Navigation Fluide** : Scroll smooth et navigation active selon la section
- **Animations** : Animations au scroll et effets de hover
- **Performance Optimisée** : Code vanilla pour des performances maximales
- **Palette de Couleurs Fidèle** : Extraction directe des couleurs depuis Figma
- **Typographie Poppins** : Police Google Fonts intégrée

## 📁 Structure du Projet

```
vanillaOptimisedFrontend/
├── index.html          # Structure HTML principale
├── styles.css          # Styles CSS avec variables
├── script.js           # Interactions JavaScript
├── images/             # Images extraites de Figma
│   ├── profile-image.png
│   ├── project1-image.png
│   ├── project2-image.png
│   ├── contact-image.png
│   ├── medium-icon.svg
│   ├── behance-icon.svg
│   └── twitter-icon.svg
└── README.md           # Documentation
```

## 🎨 Palette de Couleurs

Les couleurs suivent exactement le design Figma :

- **Dark Blue** : `#03045E` (Texte principal)
- **Light Yellow** : `#FBF8CC` (Arrière-plan)
- **Yellow** : `#F5EE84` (Boutons)
- **Too Light Yellow** : `#F7F197` (Titres de sections)
- **Dark Brown** : `#474306` (Bordures et accents)

## 📱 Responsive Design

Le site s'adapte automatiquement aux différentes tailles d'écran :

- **Desktop** : 1200px et plus
- **Tablet** : 768px - 1199px
- **Mobile** : 480px - 767px
- **Small Mobile** : moins de 480px

## ⚡ Optimisations

- **CSS Variables** : Gestion centralisée des couleurs et espacements
- **Images Optimisées** : Formats appropriés (PNG pour photos, SVG pour icônes)
- **JavaScript Modulaire** : Code organisé en fonctions réutilisables
- **Lazy Loading** : Animations d'apparition des images
- **Smooth Scrolling** : Navigation fluide entre les sections

## 🛠️ Utilisation

1. **Cloner le projet** :
   ```bash
   git clone [repository-url]
   cd vanillaOptimisedFrontend
   ```

2. **Ouvrir dans un navigateur** :
   - Ouvrir `index.html` directement dans un navigateur
   - Ou utiliser un serveur local pour le développement

3. **Serveur de développement (optionnel)** :
   ```bash
   # Avec Python
   python -m http.server 8000
   
   # Avec Node.js (live-server)
   npx live-server
   ```

## 📧 Sections du Portfolio

1. **Header** : Navigation fixe avec liens vers les sections
2. **Hero** : Présentation avec photo de profil et CTA
3. **About** : Description et timeline d'expérience
4. **Work** : Présentation des projets avec images
5. **Contact** : Informations de contact avec image

## 🔧 Personnalisation

### Modifier les Couleurs
Éditer les variables CSS dans `styles.css` :
```css
:root {
    --dark-blue: #03045E;
    --light-yellow: #FBF8CC;
    /* ... autres couleurs */
}
```

### Changer le Contenu
Modifier directement le HTML dans `index.html` pour adapter le contenu.

### Ajouter des Animations
Étendre le JavaScript dans `script.js` pour ajouter de nouvelles interactions.

## 🌟 Fonctionnalités JavaScript

- **Navigation Active** : Mise à jour automatique selon la section visible
- **Smooth Scroll** : Navigation fluide entre les sections
- **Animations au Scroll** : Apparition progressive des éléments
- **Effet Parallax** : Mouvement subtil de l'image de profil
- **Hover Effects** : Animations sur les cartes de projets
- **Image Loading** : Animation de chargement des images

## 📞 Support

Pour toute question ou suggestion d'amélioration, n'hésitez pas à ouvrir une issue dans le repository.

---

**Développé avec ❤️ en HTML, CSS et JavaScript vanilla**
