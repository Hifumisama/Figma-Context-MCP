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
