<script>
  import { getRuleById } from '../../stores/audit.svelte.js';

  let { ruleId, isOpen = false, moreInfos = "" } = $props();

  // Récupérer les informations de la règle depuis le store dynamique
  let rule = $derived(getRuleById(ruleId));

  // S'inspirer de la logique de StatsCards.svelte pour les couleurs
  function getCardColor(rule) {
    if (!rule?.color) return 'gray';
    
    // Mapping des couleurs hex vers les noms Tailwind
    const colorMap = {
      '#3B82F6': 'blue',    // règle 1
      '#10B981': 'green',   // règle 2  
      '#EF4444': 'red',     // règle 3
      '#F59E0B': 'orange',  // règle 4
      '#8B5CF6': 'purple',  // règle 5
      '#EC4899': 'pink',    // règle 6
      '#6366F1': 'indigo',  // règle 7
      '#14B8A6': 'teal',    // règle 8
      '#F97316': 'orange'   // règle 9
    };
    
    return colorMap[rule.color] || 'gray';
  }
  
  function getColorClasses(color) {
    const colorMap = {
      purple: 'bg-purple-500/10 border-purple-500/50 text-purple-400',
      blue: 'bg-blue-500/10 border-blue-500/50 text-blue-400',
      green: 'bg-green-500/10 border-green-500/50 text-green-400',
      orange: 'bg-orange-500/10 border-orange-500/50 text-orange-400',
      red: 'bg-red-500/10 border-red-500/50 text-red-400',
      yellow: 'bg-yellow-500/10 border-yellow-500/50 text-yellow-400',
      indigo: 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400',
      pink: 'bg-pink-500/10 border-pink-500/50 text-pink-400',
      teal: 'bg-teal-500/10 border-teal-500/50 text-teal-400',
      gray: 'bg-gray-500/10 border-gray-500/50 text-gray-400'
    };
    return colorMap[color] || colorMap.gray;
  }
</script>

{#if isOpen && rule}
  <div class="p-4 rounded-lg border animate-in slide-in-from-top-2 duration-200 {getColorClasses(getCardColor(rule))}">
    <!-- Titre avec icône -->
    <div class="flex items-center space-x-2 mb-3">
      <span class="text-xl">{rule.icon}</span>
      <h4 class="text-white font-semibold">{rule.name}</h4>
    </div>

    <!-- Description et conseil sur la même ligne sur grands écrans -->
    <div class="space-y-3 text-sm text-white/80">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div class="leading-relaxed">
          <span class="font-medium">📋</span> {rule.description}
        </div>
        <div class="leading-relaxed">
          <span class="font-medium">💡</span> {rule.resolutionAdvice || "Consulter la documentation Figma"}
        </div>
      </div>
      
      <!-- Affichage des moreInfos si présentes -->
      {#if moreInfos && moreInfos.trim()}
        <div class="bg-black/20 rounded-lg p-3 border-l-2" style="border-left-color: {rule?.color || '#6B7280'}">
          <div class="leading-relaxed">
            <span class="font-medium">🔍</span> <strong>Détails :</strong> {moreInfos}
          </div>
        </div>
      {/if}
    </div>
  </div>
{/if}