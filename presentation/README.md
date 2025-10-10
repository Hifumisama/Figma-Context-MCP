# FigmaAudit - Présentation

Présentation reveal.js professionnelle du projet FigmaAudit.

## 🚀 Lancement rapide

### Option 1 : Ouvrir directement dans le navigateur

Ouvrez simplement le fichier `index.html` dans votre navigateur web préféré :

```bash
# Windows
start presentation/index.html

# macOS
open presentation/index.html

# Linux
xdg-open presentation/index.html
```

### Option 2 : Serveur HTTP local (recommandé)

Pour une meilleure expérience (notamment pour le rendu Mermaid), utilisez un serveur HTTP local :

#### Avec Python 3
```bash
cd presentation
python -m http.server 8000
```

Puis ouvrez : http://localhost:8000

#### Avec Node.js (http-server)
```bash
npx http-server presentation -p 8000
```

Puis ouvrez : http://localhost:8000

#### Avec PHP
```bash
cd presentation
php -S localhost:8000
```

Puis ouvrez : http://localhost:8000

## 📋 Contenu de la présentation

1. **Slide 1 - Introduction** : Présentation du projet FigmaAudit
2. **Slide 2 - Pourquoi ?** : Objectifs et bénéfices de l'application (avec animation de barre de progression)
3. **Slide 3 - Architecture** : Diagramme Mermaid de l'architecture du système
4. **Slide 4 - Backend** : Outils et règles d'audit (8 règles interactives avec tooltips)
5. **Slide 5 - Frontend** : Interface utilisateur et rapport d'audit

## 🎮 Navigation

- **Flèches ← →** : Navigation entre les slides
- **Espace** : Slide suivante
- **Échap** : Vue d'ensemble de toutes les slides
- **F** : Mode plein écran
- **S** : Mode présentateur (avec notes)
- **B / .** : Pause (écran noir)

## ✨ Fonctionnalités interactives

### Animation de cohérence (Slide 2)
- Une barre de progression animée se remplit automatiquement quand vous arrivez sur la slide
- Démontre visuellement l'impact de la cohérence sur la compréhension IA

### Règles interactives (Slide 4)
- **Hover** sur chaque règle pour afficher un tooltip avec :
  - Description complète
  - Conseils de résolution
- **Badges visuels** :
  - 🔵 **Standard** : Règles basées sur des patterns fixes
  - 🔴 **AI-Ready** : Règles prêtes pour l'IA (actuellement algorithmiques)
  - 🔴 **AI-Active** : Règles utilisant activement l'IA (Gemini 2.0 Flash)

### Diagramme d'architecture (Slide 3)
- Diagramme Mermaid généré dynamiquement
- Montre le flux de données de l'API Figma au Frontend

## 📸 Ajout de screenshots

Pour ajouter vos propres captures d'écran :

1. Placez vos images dans le dossier `presentation/assets/`
2. Remplacez les placeholders dans `index.html` :

```html
<!-- Remplacer -->
<div class="screenshot-placeholder">
    <p>📸 Screenshot : Formulaire</p>
</div>

<!-- Par -->
<img src="assets/votre-screenshot.png" alt="Formulaire" style="max-width: 100%; border-radius: 12px;">
```

## 🎨 Personnalisation

### Couleurs du thème

Les couleurs peuvent être modifiées dans `assets/styles.css` :

```css
:root {
    --gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    --color-primary: #6366f1;
    --color-secondary: #8b5cf6;
    --color-accent: #10b981;
    --color-ai: #ec4899;
    /* ... */
}
```

### Transitions

Modifiez les transitions dans la configuration reveal.js (`index.html`) :

```javascript
Reveal.initialize({
    // ...
    transition: 'slide' // Options: 'none', 'fade', 'slide', 'convex', 'concave', 'zoom'
});
```

## 📦 Technologies utilisées

- **[Reveal.js 5.0.4](https://revealjs.com/)** - Framework de présentation
- **[Mermaid 10](https://mermaid.js.org/)** - Génération de diagrammes
- **CSS3** - Animations et thème moderne
- **Vanilla JavaScript** - Interactivité (tooltips, animations)

## 🐛 Dépannage

### Le diagramme Mermaid ne s'affiche pas
- Assurez-vous d'utiliser un serveur HTTP local (pas directement le fichier)
- Vérifiez la connexion internet (CDN requis)

### Les animations ne fonctionnent pas
- Actualisez la page (F5)
- Vérifiez que JavaScript est activé dans votre navigateur

### Les tooltips ne s'affichent pas
- Attendez que la page soit complètement chargée
- Essayez de rafraîchir la page

## 📄 Licence

Ce projet fait partie de FigmaMCP. Voir le fichier LICENSE du projet principal.
