<script>
  import { auditState, rulesList, allRulesWithStatus } from '../../stores/audit.svelte.js';

  // État pour afficher/masquer les règles conformes
  let showCompliantRules = false;

  // Afficher toutes les 9 règles avec leurs données réelles
  $: statsCards = getStatsCards();
  $: filteredCards = showCompliantRules ? statsCards : statsCards.filter(card => !card.isCompliant);

  function getStatsCards() {
    // Récupérer toutes les règles avec leur statut
    const allRules = allRulesWithStatus();
    
    // Créer les cartes pour toutes les 9 règles
    return allRules.map(rule => ({
      name: rule.nameFr || rule.name,
      description: rule.descriptionFr || rule.description,
      count: rule.detectedCount,
      icon: rule.icon,
      color: getCardColor(rule.id),
      isCompliant: rule.isCompliant
    }));
  }

  function toggleCompliantRules() {
    showCompliantRules = !showCompliantRules;
  }

  function getCardColor(ruleId) {
    const colors = {
      1: 'blue',
      2: 'green', 
      3: 'purple',
      4: 'orange',
      5: 'red',
      6: 'yellow',
      7: 'indigo',
      8: 'pink',
      9: 'teal'
    };
    return colors[ruleId] || 'gray';
  }

  function getColorClasses(color) {
    const colorMap = {
      purple: 'bg-purple-500/10 border-purple-500 text-purple-400',
      blue: 'bg-blue-500/10 border-blue-500 text-blue-400',
      green: 'bg-green-500/10 border-green-500 text-green-400',
      orange: 'bg-orange-500/10 border-orange-500 text-orange-400',
      red: 'bg-red-500/10 border-red-500 text-red-400',
      yellow: 'bg-yellow-500/10 border-yellow-500 text-yellow-400',
      indigo: 'bg-indigo-500/10 border-indigo-500 text-indigo-400',
      pink: 'bg-pink-500/10 border-pink-500 text-pink-400',
      teal: 'bg-teal-500/10 border-teal-500 text-teal-400',
      gray: 'bg-gray-500/10 border-gray-500 text-gray-400'
    };
    return colorMap[color] || colorMap.gray;
  }
</script>

<div class="space-y-4">
  <!-- Bouton pour afficher/masquer les règles conformes -->
  <div class="flex justify-between items-center">
    <h2 class="text-xl font-semibold text-white">
      Règles d'audit
    </h2>
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

  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
    {#each filteredCards as card}
      <div class="rounded-lg border-l-4 p-4 {getColorClasses(card.color)} relative">
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
          
          <p class="text-xs text-white/70 leading-relaxed">
            {card.description}
          </p>
        </div>
      </div>
    {/each}
  </div>
</div>