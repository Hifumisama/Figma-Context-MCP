<script>
  import { auditState, rulesList, allRulesWithStatus, getFilteredReportData } from '../../stores/audit.svelte.js';
  import RuleBadge from '../components/RuleBadge.svelte';
  import RuleDetails from '../components/RuleDetails.svelte';

  // État local pour gérer les accordéons
  let activeDetails = $state({}); // { nodeId: ruleId } pour traquer quel accordéon est ouvert

  // Utiliser les données filtrées du store
  let groupedData = $derived(getFilteredReportData());


  function toggleDetails(nodeId, ruleId) {
    if (activeDetails[nodeId] === ruleId) {
      // Fermer si le même badge est cliqué
      activeDetails = { ...activeDetails, [nodeId]: null };
    } else {
      // Ouvrir le nouvel accordéon
      activeDetails = { ...activeDetails, [nodeId]: ruleId };
    }
  }

  function isDetailOpen(nodeId, ruleId) {
    return activeDetails[nodeId] === ruleId;
  }

</script>

<div class="space-y-8">
  <!-- Titre principal -->
  <h2 class="text-xl font-semibold text-white">
    Rapport d'analyse
  </h2>

  <!-- Tableau avec badges groupés par identifiant -->
  <div class="bg-figma-card rounded-lg overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-figma-cardLight border-b border-gray-600">
          <tr class="text-figma-textMuted">
            <th class="px-4 py-3 text-left">👤 ID Node</th>
            <th class="px-4 py-3 text-left">📝 Nom node</th>
            <th class="px-4 py-3 text-left">📋 Règles détectées</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-600">
          {#each groupedData as node}
            <!-- Ligne principale avec les badges -->
            <tr class="text-white hover:bg-figma-cardLight transition-colors">
              <!-- ID Node -->
              <td class="px-4 py-3 font-mono text-xs text-figma-button align-top">
                {node.id}
              </td>
              
              <!-- Nom Node -->
              <td class="px-4 py-3 font-medium align-top">
                {node.name}
              </td>
              
              <!-- Badges des règles -->
              <td class="px-4 py-3 align-top">
                <div class="flex flex-wrap gap-2">
                  {#each node.ruleIds as ruleId}
                    <RuleBadge 
                      {ruleId} 
                      isActive={isDetailOpen(node.id, ruleId)}
                      onClick={() => toggleDetails(node.id, ruleId)} 
                    />
                  {/each}
                </div>
              </td>
            </tr>
            
            <!-- Ligne de l'accordéon qui s'étend sur toute la largeur -->
            {#each node.ruleIds as ruleId}
              {#if isDetailOpen(node.id, ruleId)}
                <tr>
                  <td colspan="3" class="p-0">
                    <RuleDetails 
                      {ruleId} 
                      isOpen={true} 
                    />
                  </td>
                </tr>
              {/if}
            {/each}
          {/each}
        </tbody>
      </table>
    </div>
  </div>

</div>