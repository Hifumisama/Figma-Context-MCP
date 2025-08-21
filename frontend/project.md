# Projet : Interface Web pour l'Évaluation de Designs Figma

## 1. Contexte du Projet

L'objectif de ce projet est de créer une interface web simple pour exposer l'outil `@evaluateDesign` existant. Actuellement, cet outil est utilisable uniquement via un environnement de développement (IDE) en tant que *tool* pour un agent IA. L'interface web permettra à des utilisateurs non-techniques de l'utiliser facilement depuis un navigateur, en fournissant simplement une URL de fichier Figma et une clé d'API Figma.

## 2. Fonctionnalités Attendues

- **Interface Utilisateur :** Une page web unique proposant :
    - Un champ de saisie pour la **clé d'API Figma** de l'utilisateur.
    - Un champ de saisie pour le **lien du fichier/nœud Figma** à analyser.
    - Un bouton "Analyser" pour lancer le processus.
    - Une zone d'affichage pour restituer le rapport d'analyse généré par l'IA.

- **Logique Backend :**
    - Un nouveau point de terminaison (endpoint) sur le serveur Express existant (ex: `/api/evaluate`).
    - Ce endpoint recevra la clé API Figma et l'URL Figma depuis l'interface.
    - Il orchestrera les appels :
        1. Utiliser le `figmaService` pour récupérer les données de la maquette.
        2. Invoquer la fonction `evaluateDesign` pour générer le prompt d'analyse.
        3. Envoyer ce prompt à l'API de **Google Gemini**.
        4. Récupérer la réponse (en Markdown) de Gemini.
    - Renvoyer le rapport à l'interface utilisateur.

- **Parcours Utilisateur :**
    1. L'utilisateur arrive sur la page web.
    2. Il saisit sa clé API Figma et le lien du design.
    3. Il clique sur "Analyser".
    4. Un état de chargement est affiché.
    5. Le serveur traite la demande et interroge Gemini.
    6. Le rapport d'analyse s'affiche dans la zone dédiée, formaté à partir du Markdown reçu.

## 3. Stack Technique

- **Backend :** Node.js / Express.js (basé sur le `src/server.ts` existant).
- **Frontend :** React (à initialiser dans le dossier `/frontend`).
- **Modèle d'IA (LLM) :** Google Gemini.
- **Styling :** CSS simple ou une librairie légère comme TailwindCSS pour une mise en place rapide.

## 4. Plan d'Action

### Étape 1 : Initialisation et Configuration
- [ ] Créer ce fichier `project.md`.
- [ ] Initialiser une application React dans le dossier `/frontend` avec Vite.js pour la simplicité.
- [ ] Installer les dépendances nécessaires pour l'appel à l'API Gemini (`@google/generative-ai`) côté serveur.

### Étape 2 : Développement du Backend
- [ ] Créer une nouvelle route `POST /api/evaluate` dans `src/server.ts`.
- [ ] Gérer la récupération des paramètres (clé API Figma, URL Figma) depuis le corps de la requête.
- [ ] Mettre en place la logique pour appeler l'API de Google Gemini. La clé d'API Gemini sera gérée via une variable d'environnement (`GEMINI_API_KEY`).
- [ ] Intégrer l'appel à la fonction `evaluateDesign` pour générer le prompt à envoyer à Gemini.
- [ ] Gérer les erreurs (ex: clé API invalide, URL Figma incorrecte, erreur de l'API Gemini).
- [ ] Configurer le serveur pour servir les fichiers statiques de l'application React en production.

### Étape 3 : Développement du Frontend
- [ ] Créer la structure de base de l'application React (`App.tsx`).
- [ ] Développer les composants de l'interface : formulaire de saisie et zone d'affichage du rapport.
- [ ] Implémenter la logique d'appel au backend (`/api/evaluate`) lors du clic sur le bouton "Analyser".
- [ ] Utiliser `react-markdown` pour afficher joliment la réponse du serveur.
- [ ] Gérer les états de l'interface :
    - `idle` (attente de saisie)
    - `loading` (analyse en cours)
    - `success` (rapport affiché)
    - `error` (message d'erreur)
- [ ] Utiliser le `sessionStorage` pour conserver la clé API Figma le temps de la session utilisateur.

### Étape 4 : Déploiement (pour information)
- [ ] Documenter les variables d'environnement nécessaires (`GEMINI_API_KEY`).
- [ ] Décrire la procédure de build pour le frontend et le backend.
- [ ] Fournir des indications pour le déploiement sur une plateforme comme Google Cloud Platform (GCP).

