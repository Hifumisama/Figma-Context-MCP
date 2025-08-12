# Plan d'implémentation : Outils d'évaluation de design Figma

Ce document sert de feuille de route pour la création d'outils d'évaluation de la qualité des maquettes Figma.

## 🎯 Objectif

L'objectif est de développer une suite d'outils modulaires capables d'analyser une maquette Figma (projet, page ou écran) et de produire un rapport exploitable des points de non-conformité par rapport à des règles de design et de bonnes pratiques.

Le but final est de faciliter et de fiabiliser le processus d'intégration des maquettes en fournissant aux designers et aux développeurs une liste concrète d'améliorations à apporter.

## 🏛️ Architecture proposée

L'évaluation sera divisée en deux outils spécialisés pour une meilleure modularité et maintenabilité :

1.  **`get_figma_context` (Le Collecteur)**
    *   **Responsabilité :** Interagir avec l'API Figma, déterminer le périmètre de l'analyse (projet, page, frame) à partir d'une URL, et extraire les données brutes pertinentes.
    *   **Entrée :** URL Figma, scope (optionnel).
    *   **Sortie :** Données Figma (JSON) ciblées sur le scope.

2.  **`audit_figma_design` (L'Auditeur)**
    *   **Responsabilité :** Appliquer une série de règles de validation sur les données fournies par le collecteur et générer un rapport de non-conformité.
    *   **Entrée :** Données Figma (JSON).
    *   **Sortie :** Rapport d'audit listant les éléments à corriger et les règles enfreintes.

## 📋 Règles de validation implémentées

Voici la liste des règles que l'outil `audit_figma_design` vérifiera de manière programmatique :

1.  **Styles Détachés :** Vérifier que toutes les couleurs et les styles de texte proviennent de styles partagés et ne sont pas des valeurs "en dur".
2.  **Nommage des Calques :** Identifier les calques avec des noms par défaut (ex: "Frame 123").
3.  **Utilisation de l'Auto Layout :** Détecter les groupes d'éléments qui devraient utiliser l'Auto Layout pour un design responsive.
4.  **Détection de Duplication :** Identifier les groupes d'éléments identiques répétés manuellement qui devraient être des composants.
5.  **Contraste des Couleurs :** S'assurer du respect des standards d'accessibilité (WCAG).
6.  **Paramètres d'Exportation :** Vérifier que les icônes et images ont des paramètres d'exportation définis.
7.  **Utilisation de "Group" vs. "Frame" :** Signaler les `Group` qui gagneraient à être convertis en `Frame` pour une meilleure structure.
8.  **Calques Cachés :** Lister les calques masqués qui pourraient "polluer" la maquette.
