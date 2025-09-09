<script>
  import { auditState, rulesList, allRulesWithStatus } from '../../stores/audit.svelte.js';

  // Mappage des règles par ID pour obtenir les conseils
  const ruleAdvice = {
    1: "Utiliser Auto Layout pour une meilleure flexibilité",
    2: "Renommer avec une convention claire (ex: btn-primary)",
    3: "Reconnecter aux styles du Design System",
    4: "Configurer les paramètres d'export",
    5: "Supprimer ou rendre visible le calque",
    6: "Convertir le groupe en Frame",
    7: "Créer un composant réutilisable pour ce pattern",
    8: "Ajouter les états hover/focus/disabled",
    9: "Utiliser des noms sémantiques (primary, secondary)"
  };

  // Préparer les données pour les 2 tableaux
  $: tableData = prepareTableData();
  $: allRules = allRulesWithStatus();

  function prepareTableData() {
    const allItems = [];
    
    // Parcourir tous les composants avec problèmes
    auditState.rulesByComponent.forEach(component => {
      component.issues.forEach(issue => {
        const rule = rulesList.find(r => r.id === issue.ruleId);
        allItems.push({
          idNode: component.id,
          nomNode: component.name,
          regleDetectee: rule ? (rule.nameFr || rule.name) : `Règle #${issue.ruleId}`,
          conseilResolution: ruleAdvice[issue.ruleId] || "Consulter la documentation Figma",
          description: rule ? rule.descriptionFr || rule.description : ""
        });
      });
    });

    // Diviser en 2 tableaux (pour correspondre à la maquette)
    const midpoint = Math.ceil(allItems.length / 2);
    return {
      table1: allItems.slice(0, midpoint),
      table2: allItems.slice(midpoint)
    };
  }

  function getCategoryBadgeColor(category) {
    switch (category) {
      case 'standard':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'ai-ready':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
      case 'ai-active':
        return 'bg-pink-500/20 text-pink-400 border-pink-500/50';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  }

  function getStatusBadgeColor(isCompliant) {
    return isCompliant 
      ? 'bg-green-500/20 text-green-400 border-green-500/50'
      : 'bg-red-500/20 text-red-400 border-red-500/50';
  }
</script>

<div class="space-y-8">
  <!-- Titre principal -->
  <h2 class="text-xl font-semibold text-white">
    Rapport d'analyse par composant
  </h2>

  <!-- Premier tableau -->
  <div class="bg-figma-card rounded-lg overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-figma-cardLight border-b border-gray-600">
          <tr class="text-figma-textMuted">
            <th class="px-4 py-3 text-left">👤 ID Node</th>
            <th class="px-4 py-3 text-left">📝 Nom node</th>
            <th class="px-4 py-3 text-left">📋 Règle détectée</th>
            <th class="px-4 py-3 text-left">📝 Description</th>
            <th class="px-4 py-3 text-left">💡 Conseil de résolution</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-600">
          {#each tableData.table1 as item, index}
            <tr class="text-white hover:bg-figma-cardLight transition-colors">
              <td class="px-4 py-3 font-mono text-xs text-figma-button">
                {item.idNode}
              </td>
              <td class="px-4 py-3 font-medium">
                {item.nomNode}
              </td>
              <td class="px-4 py-3 text-figma-textMuted">
                {item.regleDetectee}
              </td>
              <td class="px-4 py-3 text-xs text-figma-textMuted leading-relaxed max-w-xs">
                {item.description}
              </td>
              <td class="px-4 py-3 text-sm text-figma-textMuted leading-relaxed">
                {item.conseilResolution}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>

  <!-- Second tableau -->
  {#if tableData.table2.length > 0}
    <div class="space-y-4">
      <h3 class="text-lg font-medium text-white">
        Rapport d'analyse par règle détectée
      </h3>
      
      <div class="bg-figma-card rounded-lg overflow-hidden">
        <div class="p-4 border-b border-gray-600">
          <h4 class="text-figma-textMuted text-sm">Liste des nodes</h4>
        </div>
        
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-figma-cardLight border-b border-gray-600">
              <tr class="text-figma-textMuted">
                <th class="px-4 py-3 text-left">👤 ID Node</th>
                <th class="px-4 py-3 text-left">📝 Nom node</th>
                <th class="px-4 py-3 text-left">💡 Conseil de résolution</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-600">
              {#each tableData.table2 as item, index}
                <tr class="text-white hover:bg-figma-cardLight transition-colors">
                  <td class="px-4 py-3 font-mono text-xs text-figma-button">
                    {item.idNode}
                  </td>
                  <td class="px-4 py-3 font-medium">
                    {item.nomNode}
                  </td>
                  <td class="px-4 py-3 text-sm text-figma-textMuted leading-relaxed">
                    {item.conseilResolution}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  {/if}

  <!-- Nouveau tableau pour toutes les règles -->
  <div class="space-y-4">
    <h3 class="text-lg font-medium text-white">
      Toutes les règles testées
    </h3>
    <p class="text-sm text-figma-textMuted">
      Vue d'ensemble de toutes les règles d'audit avec leur statut de conformité
    </p>
    
    <div class="bg-figma-card rounded-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-figma-cardLight border-b border-gray-600">
            <tr class="text-figma-textMuted">
              <th class="px-4 py-3 text-left">📋 Règle</th>
              <th class="px-4 py-3 text-left">📝 Description</th>
              <th class="px-4 py-3 text-left">🏷️ Catégorie</th>
              <th class="px-4 py-3 text-left">📊 Statut</th>
              <th class="px-4 py-3 text-left">💡 Conseil</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-600">
            {#each allRules as rule}
              <tr class="text-white hover:bg-figma-cardLight transition-colors">
                <td class="px-4 py-3">
                  <div class="flex items-center space-x-2">
                    <span class="text-lg">{rule.icon}</span>
                    <span class="font-medium">{rule.nameFr || rule.name}</span>
                  </div>
                </td>
                <td class="px-4 py-3 text-figma-textMuted text-xs leading-relaxed max-w-xs">
                  {rule.descriptionFr || rule.description}
                </td>
                <td class="px-4 py-3">
                  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border {getCategoryBadgeColor(rule.category)}">
                    {rule.category === 'standard' ? 'Standard' : 
                     rule.category === 'ai-ready' ? 'AI Ready' : 
                     rule.category === 'ai-active' ? 'AI Active' : rule.category}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border {getStatusBadgeColor(rule.isCompliant)}">
                    {rule.status}
                  </span>
                </td>
                <td class="px-4 py-3 text-figma-textMuted text-xs leading-relaxed">
                  {rule.isCompliant ? "Règle respectée ✓" : ruleAdvice[rule.id] || "Consulter la documentation Figma"}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>