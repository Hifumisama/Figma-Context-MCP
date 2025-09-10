<script>
  import { rulesList } from '../../stores/audit.svelte.js';

  let { ruleId, isOpen = false } = $props();

  // Récupérer les informations de la règle
  let rule = $derived(rulesList.find(r => r.id === ruleId));

  // Mappage des conseils de résolution
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
  <div class="p-4 rounded-lg border {getColorClasses(getRuleColor(ruleId))} animate-in slide-in-from-top-2 duration-200">
    <!-- Titre avec icône -->
    <div class="flex items-center space-x-2 mb-3">
      <span class="text-xl">{rule.icon}</span>
      <h4 class="text-white font-semibold">{rule.nameFr || rule.name}</h4>
    </div>

    <!-- Description et conseil sur la même ligne sur grands écrans -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm text-white/80">
      <div class="leading-relaxed">
        <span class="font-medium">📋</span> {rule.descriptionFr || rule.description}
      </div>
      <div class="leading-relaxed">
        <span class="font-medium">💡</span> {ruleAdvice[ruleId] || "Consulter la documentation Figma"}
      </div>
    </div>
  </div>
{/if}