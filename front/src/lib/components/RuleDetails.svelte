<script>
  import { getRuleById } from '../../stores/audit.svelte.js';

  let { ruleId, isOpen = false, moreInfos = {} } = $props();

  // Récupérer les informations de la règle depuis le store dynamique
  let rule = $derived(getRuleById(ruleId));

  // Génère les styles CSS inline pour les détails avec couleurs dynamiques
  function getDynamicDetailsStyle(hexColor) {
    const defaultColor = '#6B7280'; // Gris par défaut
    const color = hexColor || defaultColor;
    
    return `background-color: ${color}10; border-color: ${color}80; color: ${color};`;
  }
  
  // Style pour la bordure gauche du moreInfos
  function getMoreInfosBorderStyle(hexColor) {
    const defaultColor = '#6B7280';
    const color = hexColor || defaultColor;
    
    return `border-left-color: ${color};`;
  }
</script>

{#if isOpen && rule}
  <div 
    class="p-4 rounded-lg border animate-in slide-in-from-top-2 duration-200"
    style="{getDynamicDetailsStyle(rule?.color)}"
  >
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
      {#if moreInfos && moreInfos[ruleId.toString()] && moreInfos[ruleId.toString()].trim()}
        <div 
          class="bg-black/20 rounded-lg p-3 border-l-2"
          style="{getMoreInfosBorderStyle(rule?.color)}"
        >
          <div class="leading-relaxed">
            <span class="font-medium">🔍</span> <strong>Détails :</strong> {moreInfos[ruleId.toString()]}
          </div>
        </div>
      {/if}
    </div>
  </div>
{/if}