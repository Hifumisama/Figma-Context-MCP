<script>
  import { getRuleById } from '../../stores/audit.svelte.js';

  let { ruleId, isActive = false, onClick } = $props();

  // Récupérer les informations de la règle depuis le store dynamique
  let rule = $derived(getRuleById(ruleId));

  // Génère les styles CSS inline pour les badges avec couleurs dynamiques
  function getDynamicBadgeStyle(hexColor, isActive = false) {
    const defaultColor = '#6B7280'; // Gris par défaut
    const color = hexColor || defaultColor;
    
    let style = `background-color: ${color}20; color: ${color}; border-color: ${color}80;`;
    
    return style;
  }
  
  // Classes Tailwind fixes + ring conditionnel pour l'état actif
  function getBadgeClasses(isActive) {
    return isActive ? 'ring-2 ring-figma-button ring-opacity-50' : '';
  }

  function getSeverityIcon(ruleId) {
    const highImpact = [3, 1, 8]; // detached-styles, auto-layout-usage, interaction-states
    const mediumImpact = [2, 7, 4]; // layer-naming, component-candidates, export-settings
    
    if (highImpact.includes(ruleId)) return '⚠️';
    if (mediumImpact.includes(ruleId)) return 'ℹ️';
    return '💡';
  }

  let badgeClass = $derived(`
    inline-flex items-center px-2 py-1 rounded-full text-xs font-medium cursor-pointer transition-all duration-200 border
    ${getBadgeClasses(isActive)}
  `.trim());
</script>

<button
  class={badgeClass}
  style="{getDynamicBadgeStyle(rule?.color, isActive)}"
  onclick={onClick}
  title={rule?.description || `Règle #${ruleId}`}
>
  <span class="mr-1">{rule?.icon || getSeverityIcon(ruleId)}</span>
  <span>{rule?.name || `Règle #${ruleId}`}</span>
</button>