# Stratégie de Prompt Engineering pour la Génération de Code à partir de Figma

Ce document résume la stratégie à adopter pour guider un agent LLM afin qu'il génère du code front-end de haute qualité, responsive et sémantique à partir d'une maquette Figma.

## 1. Le Problème Initial : Disparité de Qualité

Nous avons constaté qu'une même maquette Figma générait :
-   Un code **HTML/CSS "vanilla" de bonne qualité**, respectant les standards du web (responsive, flux naturel).
-   Un code **SvelteKit + Tailwind CSS de mauvaise qualité**, avec une mise en page rigide, des dimensions fixes et un positionnement absolu des éléments, copiant littéralement les coordonnées de Figma.

## 2. L'Analyse : Pourquoi cette Différence ?

La cause n'est pas le framework, mais la **complexité de la tâche qui biaise l'interprétation du LLM**.

-   **Contexte "Vanilla" :** La tâche est simple ("fais une page web"). Le LLM se base sur des milliards d'exemples de pages bien construites et suit le chemin le plus probable : HTML sémantique et CSS flexible.
-   **Contexte "Svelte + Tailwind" :** La tâche est abstraite ("construis une application avec des composants"). Le LLM se concentre sur la création de "blocs" parfaits et isolés, et opte pour la traduction la plus simple et littérale des données Figma (ex: `taille: 500px` -> `w-[500px]`), perdant la vision d'ensemble de la page fluide.

En résumé, l'abstraction du framework pousse le LLM à passer d'une **interprétation sémantique** (comprendre l'intention) à une **traduction littérale** (copier les valeurs).

## 3. La Solution : Le "Méga-Prompt" Guidé

Pour contrer ce biais, il faut fournir un prompt qui ne se contente pas de donner un objectif, mais qui impose des **règles d'implémentation claires**. L'utilisateur non technique ne fournit qu'une requête simple (`"Crée un site à partir de ce lien Figma"`); notre système l'enrichit pour créer ce "méga-prompt".

### Composants Clés d'un Prompt Efficace :

#### a. Définir le Rôle et l'Objectif
Il faut donner un rôle précis au LLM pour le mettre dans le bon état d'esprit.
> **Exemple :** "Tu es un développeur front-end senior, expert en SvelteKit et Tailwind CSS. Ta mission est de convertir une maquette Figma en une application web **responsive** et **sémantique**."

#### b. Fournir des Règles de Traduction Explicites
C'est le point le plus important. Il faut créer un "dictionnaire" de traduction de Figma vers le web.
-   **Auto Layout -> Flexbox :** "Chaque `Frame` Figma avec Auto Layout doit être traduit en `display: flex` (`flex`, `flex-row`, `flex-col`, `justify-...`, `items-...`)."
-   **Contraintes de Taille -> Largeurs Fluides :** "`Fill Container` devient `w-full`. `Hug Contents` devient `w-fit`. `Fixed` ne doit être utilisé que pour des icônes/avatars, sinon préférer `max-w-[...]`."

#### c. Interdire les Mauvaises Pratiques
Il faut explicitement lister ce que le LLM ne doit PAS faire.
-   **RÈGLE CAPITALE :** "N'utilise **JAMAIS** de dimensions fixes (ex: `h-[2903px]`) pour le conteneur principal de la page ou les sections. La hauteur doit être déterminée par le contenu."
-   **Interdiction du Positionnement Absolu :** "Ne reproduis pas les coordonnées X/Y de Figma. Laisse les éléments suivre le flux naturel du document."

#### d. Fournir le Contexte du Projet
Le LLM doit savoir qu'il existe déjà un système de design et l'utiliser.
> **Exemple :** "Toutes les couleurs, polices et espacements sont définis dans `tailwind.config.js`. Tu dois **impérativement** utiliser les classes correspondantes (`bg-light-yellow`, `text-hero-title`) et non des valeurs arbitraires."

## 4. Stratégie d'Implémentation : Le "Chef d'Orchestre"

Pour mettre cela en pratique de manière fiable, l'approche recommandée n'est pas de demander au LLM de générer un autre prompt, mais de construire une logique applicative qui orchestre le processus.

### Le Flux de l'Orchestrateur :

1.  **Réception (Votre Code) :** L'utilisateur donne sa requête simple : `"Fais un site avec [lien Figma]"`.
2.  **Préparation (Votre Code) :**
    -   Votre application parse la requête pour extraire le lien.
    -   Elle appelle elle-même les outils nécessaires (ex: `get_figma_data_tool`) pour récupérer les données structurées de la maquette.
    -   Elle charge le template du "méga-prompt" (qui contient toutes les règles ci-dessus).
3.  **Assemblage (Votre Code) :**
    -   Elle injecte les données Figma récupérées dans le template de prompt.
4.  **Exécution (Appel au LLM) :**
    -   Votre application fait un **unique appel** au LLM avec ce prompt final, complet et ultra-précis.
5.  **Résultat :** Le LLM, n'ayant plus de décisions d'architecture à prendre, se concentre sur sa tâche créative (générer le code) et renvoie un résultat de bien meilleure qualité.

Cette approche **déterministe** garantit que les étapes logiques sont toujours exécutées correctement, réservant la puissance du LLM pour la tâche où il excelle : la génération de code créative sous contraintes fortes.

## 5. Enrichissement du Contexte avec la Documentation Externe (ex: `context7`)

Pour que le LLM produise un code non seulement correct mais aussi moderne et idiomatique, il doit avoir accès à une documentation à jour. Lui fournir l'intégralité de la documentation d'un framework est contre-productif et sature la fenêtre de contexte.

La solution est la **Récupération Ciblée (Targeted Retrieval)** : l'orchestrateur doit anticiper les besoins du LLM et lui fournir uniquement des extraits de documentation pertinents et concis.

### Le Flux de l'Orchestrateur (Version Enrichie) :

L'étape de "Préparation" est maintenant plus intelligente :

1.  **Réception (Votre Code) :** L'utilisateur donne sa requête simple.
2.  **Analyse et Récupération (Votre Code) :**
    -   Parse le lien Figma et appelle `get_figma_data_tool` pour obtenir le JSON.
    -   **NOUVEAU :** Analyse le JSON Figma pour identifier des "défis techniques" (ex: la présence de variants de composants suggère un besoin de "gestion d'état", une grille complexe suggère un besoin de "documentation sur CSS Grid").
3.  **Recherche Documentaire (Votre Code) :**
    -   Pour chaque défi identifié, l'orchestrateur fait un appel **chirurgical** à l'outil de documentation (ex: `context7.search("Svelte 5 state management with runes")`).
4.  **Filtrage et Synthèse (Votre Code) :**
    -   L'orchestrateur ne conserve que les **extraits les plus pertinents** (en privilégiant les exemples de code) et s'assure de ne pas dépasser un "budget de tokens" alloué à la documentation.
5.  **Assemblage (Votre Code) :**
    -   Injecte les données Figma **ET** les extraits de documentation dans le template du "méga-prompt".
6.  **Exécution (Appel au LLM) :** Le LLM reçoit un contexte complet et ultra-pertinent pour exécuter sa tâche.

### Gestion de la Fenêtre de Contexte : Le Rôle d'Éditeur

Pour éviter de surcharger le prompt, l'orchestrateur doit agir comme un éditeur :
-   **Privilégier les "Snippets" de Code :** Un bon exemple de code est plus efficace et plus court qu'un long paragraphe de théorie.
-   **Définir un Budget de Tokens :** La documentation ne devrait pas représenter plus de 15-20% du prompt total.
-   **Utiliser des Liens comme Indices :** Pour les concepts de base, un simple lien vers la doc (`https://tailwindcss.com/docs/flexbox`) peut suffire à orienter le LLM sans consommer de tokens.

## 6. Architecture d'Implémentation : Le Modèle de "l'Atelier de Préparation"

Pour intégrer cette stratégie de manière optimale dans un environnement comme Cursor, l'approche la plus robuste n'est pas de faire générer le code final par le tool lui-même via un appel LLM masqué. Il s'agit plutôt d'utiliser le tool pour **préparer un "atelier" de travail complet** que l'agent principal (Cursor) utilisera ensuite pour sa phase de génération.

Cette architecture en deux temps exploite les forces de chaque composant : la logique de l'outil pour la préparation, et l'intelligence de l'agent pour la génération.

### Le Flux Détaillé de "l'Atelier de Préparation"

**Étape 1 : Requête Simple de l'Utilisateur**
> **Utilisateur :** "Crée un site Svelte à partir de ce Figma [lien]."

**Étape 2 : L'Agent Principal (Cursor) Choisit le Tool de Préparation**
> **Agent Cursor :** "Cette tâche nécessite la préparation d'un atelier. Je lance l'outil `prepare_figma_to_svelte_workshop`."

**Étape 3 : Le "Super-Tool" Exécute sa Logique et Prépare l'Atelier**
Le `handler` de l'outil ne génère pas de code, il orchestre la préparation :
1.  **Création de l'Atelier :** Il crée un dossier de travail temporaire (ex: `./.tmp/generation_context_12345/`).
2.  **Collecte des Matériaux :** Il appelle en interne les autres tools (`get_figma_data`, `context7`) pour récupérer le JSON de Figma et les snippets de documentation pertinents.
3.  **Organisation de l'Atelier :** Il matérialise tout le contexte dans des fichiers structurés à l'intérieur du dossier temporaire :
    -   `_01_objectif_global.md` (La mission, le but du projet)
    -   `_02_regles_implementation.md` (Notre liste de règles : responsive, pas de hauteur fixe, etc.)
    -   `_03_donnees_figma.json` (Les données brutes de la maquette)
    -   `_04_documentation_pertinente.md` (Les extraits de code ciblés pour Svelte, Tailwind, etc.)
4.  **Retour de la Nouvelle Instruction :** La sortie du tool n'est pas un message de succès, mais un **nouveau prompt**, clair et directif, pour l'agent Cursor.
    > **Sortie du Tool :**
    > ```markdown
    > Atelier de génération de code Svelte prêt.
    >
    > **Ton Rôle :** Tu es un développeur front-end expert, spécialisé dans la stack technique du projet.
    > **Stack Technique :** SvelteKit, Tailwind CSS, TypeScript.
    >
    > **Ta Mission :** Générer le code source complet et fonctionnel du projet en te basant **exclusivement** sur le contexte fourni.
    >
    > **Instructions Détaillées :**
    > 1.  **Phase d'Analyse :** Lis et assimile le contenu de **TOUS** les fichiers de contexte préparés pour toi dans l'atelier : `./.tmp/generation_context_12345/`.
    > 2.  **Phase de Génération :** Une fois l'analyse terminée, utilise tes outils (`edit_file`) pour créer l'arborescence de fichiers Svelte dans `svelteKitFrontendOptimised/`.
    >
    > Commence immédiatement la phase d'analyse en listant puis en lisant les fichiers de l'atelier.
    > ```

**Étape 4 : L'Agent Principal (Cursor) Exécute la Phase de Génération**
L'agent Cursor reçoit le prompt de l'étape 3.4 comme sa nouvelle instruction. Il va alors :
1.  Lister les fichiers du dossier temporaire.
2.  Lire chaque fichier pour s'imprégner du contexte.
3.  Utiliser sa capacité de génération de code pour créer les fichiers Svelte en se basant sur les informations lues.

### Avantages Stratégiques de ce Modèle

-   **Intégration Parfaite à Cursor :** Cette approche est conçue pour tirer le meilleur parti des capacités natives de l'agent Cursor (agrégation de contexte multi-fichiers, manipulation de l'espace de travail).
-   **Traçabilité Exceptionnelle :** Le dossier "atelier" temporaire est un artefact de débogage parfait. Si la génération échoue ou est de mauvaise qualité, il est possible d'inspecter le contexte exact qui a été fourni à l'agent, ce qui est idéal pour l'analyse et l'amélioration continue.
-   **Découplage des Responsabilités :** Le `tool` est responsable de la **logique et de la préparation de données** (tâches déterministes), tandis que l'**agent** est responsable de la **compréhension du langage et de la génération de code** (tâches créatives). Cette séparation rend le système plus robuste et plus facile à maintenir.
-   **Contrôle Accru :** Vous avez un contrôle total sur la qualité et la structure des informations fournies à l'agent final, ce qui maximise les chances d'obtenir un résultat de haute qualité.
