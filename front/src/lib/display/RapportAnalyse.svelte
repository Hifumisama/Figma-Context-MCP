<script>
  import { auditState } from '../../stores/audit.svelte.js';
  import Accordion from '../results/Accordion.svelte';

  // Onglets pour les différents types de rapports
  let activeTab = 'by-component';
  
  const tabs = [
    { id: 'by-component', label: 'Par composant', icon: '🧩' },
    { id: 'by-rule', label: 'Par règle', icon: '📋' }
  ];

  // Données réelles de l'API
  $: reportData = {
    byComponent: auditState.rulesByComponent,
    byRule: auditState.rulesByType
  };

  function getSeverityColor(severity) {
    switch (severity) {
      case 'error': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      case 'info': return 'text-blue-400';
      default: return 'text-figma-textMuted';
    }
  }

  function getSeverityIcon(severity) {
    switch (severity) {
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '•';
    }
  }
</script>

<section class="space-y-6">
  <!-- En-tête des rapports -->
  <div class="card-figma">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-xl font-semibold text-figma-text">
          📊 Rapports détaillés
        </h2>
        <p class="text-figma-textMuted text-sm mt-1">
          Analyse détaillée par composant et par règle
        </p>
      </div>
    </div>

    <!-- Onglets -->
    <div class="flex space-x-1 bg-gray-800 p-1 rounded-lg mb-6">
      {#each tabs as tab}
        <button
          on:click={() => activeTab = tab.id}
          class="flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-colors
                 {activeTab === tab.id 
                   ? 'bg-figma-button text-white' 
                   : 'text-figma-textMuted hover:text-figma-text'}"
        >
          <span>{tab.icon}</span>
          <span class="text-sm font-medium">{tab.label}</span>
        </button>
      {/each}
    </div>

    <!-- Contenu des onglets -->
    <div>
      {#if activeTab === 'by-component'}
        <!-- Rapport par composant -->
        <div class="space-y-4">
          {#each reportData.byComponent as component}
            <Accordion title="{component.name}" subtitle="{component.issues.length} problème{component.issues.length > 1 ? 's' : ''}">
              <div class="space-y-3">
                <div class="flex items-center space-x-4 text-sm text-figma-textMuted">
                  <span>ID: {component.id}</span>
                  <span>Type: {component.type}</span>
                </div>
                
                <div class="space-y-2">
                  {#each component.issues as issue}
                    <div class="flex items-center space-x-3 p-2 bg-gray-800 rounded">
                      <span class="text-lg">{getSeverityIcon(issue.severity)}</span>
                      <div class="flex-1">
                        <span class="text-figma-text text-sm">{issue.message}</span>
                        <div class="text-xs text-figma-textMuted mt-1">
                          Règle #{issue.ruleId}
                        </div>
                      </div>
                      <span class="text-xs px-2 py-1 rounded {getSeverityColor(issue.severity)} bg-opacity-10">
                        {issue.severity}
                      </span>
                    </div>
                  {/each}
                </div>
              </div>
            </Accordion>
          {/each}
        </div>
      
      {:else if activeTab === 'by-rule'}
        <!-- Rapport par règle -->
        <div class="space-y-4">
          {#each reportData.byRule as ruleGroup}
            <Accordion title="Règle #{ruleGroup.ruleId}: {ruleGroup.ruleName}" subtitle="{ruleGroup.issues} problèmes détectés">
              <div class="space-y-3">
                <div class="text-sm text-figma-textMuted">
                  Composants affectés: {ruleGroup.components.length}
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {#each ruleGroup.components as componentName}
                    <div class="p-3 bg-gray-800 rounded flex items-center space-x-3">
                      <span class="text-figma-button">🧩</span>
                      <span class="text-figma-text text-sm">{componentName}</span>
                    </div>
                  {/each}
                </div>
              </div>
            </Accordion>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</section>