# FigmAnalyse de maquette

Une interface web moderne pour l'analyse de maquettes Figma, développée en HTML, CSS et JavaScript vanilla selon les spécifications de la maquette Figma fournie.

## 🎨 Fonctionnalités

- **Page d'accueil** avec formulaire de saisie pour analyser une maquette Figma
- **Dashboard d'analyse** avec visualisation des résultats
- **Types de règles détectées** avec statistiques visuelles
- **Rapports détaillés** par composant et par règle
- **Interface accordéon** pour explorer les détails
- **Design responsive** adapté à tous les écrans
- **Simulation d'analyse** avec données générées automatiquement

## 🚀 Utilisation

### Démarrage rapide

1. Ouvrez le fichier `index.html` dans votre navigateur web
2. L'application démarre sur la page d'accueil

### Analyser une maquette

1. **Saisissez un lien Figma** dans le champ "Lien Figma *"
   - Format attendu : `https://www.figma.com/file/[ID]/[nom-du-fichier]`
   - Exemple : `https://www.figma.com/design/h2Pinxnm7igaBq6crYKHjb/Interface-web-FigmaMCP`

2. **Ajoutez une clé API** (optionnel)
   - Requis uniquement pour les maquettes privées
   - Laissez vide pour les maquettes publiques

3. **Cliquez sur "Analyser la maquette"**
   - L'analyse prend 2-3 secondes (simulation)
   - Vous êtes automatiquement redirigé vers le dashboard

### Navigation dans le dashboard

#### Vue d'ensemble
- **Statistiques générales** : Nombre total de règles détectées
- **Types de règles** : Cartes colorées montrant les différents types d'erreurs
- **Graphique circulaire** : Répartition visuelle des détections

#### Rapports détaillés
1. **Rapport par composant** : Liste des composants avec les règles détectées
2. **Rapport par règle** : Regroupement par type de règle avec accordéons
   - Cliquez sur une règle pour voir la liste des nœuds concernés
   - Les accordéons se plient/déplient au clic

## 🛠️ Structure technique

### Technologies utilisées
- **HTML5** : Structure sémantique
- **CSS3** : Styles modernes avec variables CSS et flexbox/grid
- **JavaScript ES6+** : Logique applicative avec classes et modules

### Architecture du code

#### HTML (`index.html`)
- Structure en deux pages principales (accueil et dashboard)
- Composants réutilisables (cartes, tableaux, accordéons)
- Formulaires avec validation côté client

#### CSS (`styles.css`)
- **Variables CSS** pour la cohérence des couleurs et espacements
- **Design système** avec composants modulaires
- **Responsive design** avec media queries
- **Accessibilité** améliorée (contraste, focus, ARIA)

#### JavaScript (`script.js`)
Classes principales :
- `FigmaAnalysisApp` : Gestionnaire principal de l'application
- `AppState` : Gestion de l'état global
- `UIManager` : Manipulation du DOM et mise à jour de l'interface
- `AnalysisDataManager` : Génération de données simulées
- `FigmaLinkValidator` : Validation des liens Figma

### Fonctionnalités JavaScript

#### Gestion d'état
- Navigation entre les pages
- Synchronisation des champs entre pages
- Sauvegarde en session storage

#### Simulation d'analyse
- Validation des liens Figma
- Génération de données réalistes
- Animation de chargement

#### Interface interactive
- Accordéons expansibles
- Notifications toast
- Boutons avec états (normal, chargement, désactivé)

## 🎯 Conformité à la maquette

### Couleurs respectées
- **Fond principal** : `#081028`
- **Fond secondaire** : `#0B1739`
- **Texte principal** : `#FFFFFF`
- **Texte secondaire** : `#AEB9E1`
- **Accent violet** : `#CB3CFF`
- **Accents colorés** : Bleu (`#21C3FC`), Bleu foncé (`#0E43FB`), Jaune (`#FDB52A`)

### Typographie
- **Titres** : Work Sans (600, 500, 400)
- **Corps de texte** : Roboto (600, 500, 400)
- **Tailles** : De 10px à 48px selon la hiérarchie

### Composants
- Cartes de types de règles avec icônes et compteurs
- Graphique circulaire stylisé
- Tableaux de données avec alternance de couleurs
- Accordéons avec animations

## 📱 Responsive Design

L'interface s'adapte à toutes les tailles d'écran :

- **Desktop** (>1400px) : Layout pleine largeur avec colonnes
- **Tablette** (768px-1400px) : Adaptation des grilles et espacements
- **Mobile** (480px-768px) : Empilement vertical, navigation simplifiée
- **Petit mobile** (<480px) : Interface optimisée pour petits écrans

## 🧪 Fonctions de débogage

Ouvrez la console du navigateur pour accéder aux outils de débogage :

```javascript
// Générer des données de test
window.debugApp.generateTestData();

// Effacer toutes les données
window.debugApp.clearData();

// Voir l'état actuel
window.debugApp.getCurrentState();
```

## 🚀 Améliorations possibles

- Intégration avec l'API Figma réelle
- Sauvegarde permanente des analyses
- Export des rapports en PDF
- Notifications push pour les analyses terminées
- Mode sombre/clair
- Internationalisation (i18n)

## 📄 Licence

Ce projet est développé selon les spécifications de la maquette Figma fournie.

---

**Note** : Cette application utilise des données simulées pour la démonstration. Pour une utilisation en production, il faudrait intégrer l'API Figma réelle et un backend pour le traitement des analyses.
