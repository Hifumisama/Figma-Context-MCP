<script>
  import { rulesList } from '../../stores/audit.svelte.js';

  let { ruleId, isActive = false, onClick } = $props();

  // Récupérer les informations de la règle
  let rule = $derived(rulesList.find(r => r.id === ruleId));

  // Couleurs des règles (même système que StatsCards)
  function getRuleColor(ruleId) {
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

  function getBadgeColor(color) {
    const colorMap = {
      purple: 'bg-purple-500/20 text-purple-400 border border-purple-500/50 hover:bg-purple-500/30',
      blue: 'bg-blue-500/20 text-blue-400 border border-blue-500/50 hover:bg-blue-500/30',
      green: 'bg-green-500/20 text-green-400 border border-green-500/50 hover:bg-green-500/30',
      orange: 'bg-orange-500/20 text-orange-400 border border-orange-500/50 hover:bg-orange-500/30',
      red: 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30',
      yellow: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 hover:bg-yellow-500/30',
      indigo: 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/50 hover:bg-indigo-500/30',
      pink: 'bg-pink-500/20 text-pink-400 border border-pink-500/50 hover:bg-pink-500/30',
      teal: 'bg-teal-500/20 text-teal-400 border border-teal-500/50 hover:bg-teal-500/30',
      gray: 'bg-gray-500/20 text-gray-400 border border-gray-500/50 hover:bg-gray-500/30'
    };
    return colorMap[color] || colorMap.gray;
  }

  function getSeverityIcon(ruleId) {
    const highImpact = [3, 1, 8]; // detached-styles, auto-layout-usage, interaction-states
    const mediumImpact = [2, 7, 4]; // layer-naming, component-candidates, export-settings
    
    if (highImpact.includes(ruleId)) return '⚠️';
    if (mediumImpact.includes(ruleId)) return 'ℹ️';
    return '💡';
  }

  let badgeClass = $derived(`
    inline-flex items-center px-2 py-1 rounded-full text-xs font-medium cursor-pointer transition-all duration-200
    ${getBadgeColor(getRuleColor(ruleId))}
    ${isActive ? 'ring-2 ring-figma-button ring-opacity-50' : ''}
  `.trim());
</script>

<button
  class={badgeClass}
  onclick={onClick}
  title={rule?.description || `Règle #${ruleId}`}
>
  <span class="mr-1">{rule?.icon || getSeverityIcon(ruleId)}</span>
  <span>{rule?.nameFr || rule?.name || `Règle #${ruleId}`}</span>
</button>