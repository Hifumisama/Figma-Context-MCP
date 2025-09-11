<script>
  import { auditState, allRulesWithStatus, toggleRuleFilter, clearAllFilters } from '../../stores/audit.svelte.js';

  // États réactifs avec runes Svelte 5
  let showCompliantRules = $state(false);
  
  // Données dérivées réactives
  let statsCards = $derived(getStatsCards());
  let filteredCards = $derived(showCompliantRules ? statsCards : statsCards.filter(card => !card.isCompliant));
  
  // Réactivité synchronisée avec le store global
  let selectedFilters = $derived(auditState.selectedRulesFilter);

  function getStatsCards() {
    // Récupérer toutes les règles avec leur statut
    const allRules = allRulesWithStatus();
    
    // Créer les cartes pour toutes les 9 règles
    return allRules.map(rule => ({
      name: rule.nameFr || rule.name,
      description: rule.descriptionFr || rule.description,
      count: rule.detectedCount,
      icon: rule.icon,
      color: rule.color,
      isCompliant: rule.isCompliant,
      ruleId: rule.id
    }));
  }

  function toggleCompliantRules() {
    showCompliantRules = !showCompliantRules;
  }

  function handleCardClick(ruleId) {
    toggleRuleFilter(ruleId);
  }

  function isCardActive(ruleId) {
    return selectedFilters.includes(ruleId);
  }

  // Génère les styles CSS inline pour les cartes avec couleurs dynamiques
  function getDynamicCardStyle(hexColor, isActive) {
    console.log('hexColor', hexColor);
    const defaultColor = '#6B7280'; // Gris par défaut
    const color = hexColor || defaultColor;
    
    if (isActive) {
      return `background-color: ${color}; border-color: ${color}; color: white;`;
    } else {
      return `background-color: ${color}20; border-color: ${color}; color: ${color};`;
    }
  }
</script>

<div class="space-y-4">
  <!-- Boutons de contrôle -->
  <div class="flex justify-between items-center">
    <h2 class="text-xl font-semibold text-white">
      Règles d'audit
    </h2>
    <div class="flex items-center space-x-3">
      <!-- Bouton pour reset les filtres -->
      <button 
        onclick={clearAllFilters}
        class="flex items-center space-x-2 px-3 py-1 rounded-lg bg-figma-card text-figma-textMuted hover:text-white transition-colors text-sm"
        class:opacity-50={selectedFilters.length === 0}
        disabled={selectedFilters.length === 0}
      >
        <span class="text-xs">🔄</span>
        <span>Retirer filtres</span>
        {#if selectedFilters.length > 0}
          <span class="text-xs opacity-75">
            ({selectedFilters.length})
          </span>
        {/if}
      </button>
      
      <!-- Bouton pour afficher/masquer les règles conformes -->
      <button 
        onclick={toggleCompliantRules}
        class="flex items-center space-x-2 px-3 py-1 rounded-lg bg-figma-card text-figma-textMuted hover:text-white transition-colors text-sm"
      >
        <span class="text-xs">
          {showCompliantRules ? '👁️' : '👁️‍🗨️'}
        </span>
        <span>
          {showCompliantRules ? 'Masquer conformes' : 'Voir conformes'}
        </span>
        <span class="text-xs opacity-75">
          ({statsCards.filter(card => card.isCompliant).length})
        </span>
      </button>
    </div>
  </div>

  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
    {#each filteredCards as card (card.ruleId)}
      <button 
        class="rounded-lg border-l-4 p-4 relative transition-all duration-200 hover:scale-105 cursor-pointer text-left"
        style="{getDynamicCardStyle(card.color, isCardActive(card.ruleId))}"
        onclick={() => handleCardClick(card.ruleId)}
      >
        <!-- Badge en haut à droite -->
        <div class="absolute top-3 right-3">
          {#if card.isCompliant}
            <span class="text-lg">✅</span>
          {:else}
            <div class="flex items-center space-x-1 bg-red-500/20 border border-red-500/50 text-red-400 px-2 py-1 rounded-full text-xs font-medium">
              <span>⚠️</span>
              <span>{card.count}</span>
            </div>
          {/if}
        </div>

        <div class="space-y-3 pr-8">
          <div class="flex items-center space-x-2">
            <span class="text-xl">{card.icon}</span>
            <span class="text-sm font-semibold opacity-90">{card.name}</span>
          </div>
          
          <p class="text-xs opacity-70 leading-relaxed">
            {card.description}
          </p>
        </div>
      </button>
    {/each}
  </div>
</div>
