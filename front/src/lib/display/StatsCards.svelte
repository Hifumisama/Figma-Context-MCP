<script>
  import { auditState, rulesList, allRulesWithStatus } from '../../stores/audit.svelte.js';

  // Afficher toutes les 9 règles avec leurs données réelles
  $: statsCards = getStatsCards();

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

<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
  {#each statsCards as card}
    <div class="rounded-lg border-l-4 p-4 {getColorClasses(card.color)}">
      <div class="space-y-3">
        <div class="flex items-center space-x-2">
          <span class="text-xl">{card.icon}</span>
          <span class="text-sm font-semibold opacity-90">{card.name}</span>
        </div>
        
        <p class="text-xs text-white/70 leading-relaxed">
          {card.description}
        </p>
        
        <div class="text-2xl font-bold text-white">
          Détections : {card.count}
        </div>
        
        {#if card.isCompliant}
          <div class="text-xs text-green-400 font-medium">
            ✓ Conforme
          </div>
        {/if}
      </div>
    </div>
  {/each}
</div>