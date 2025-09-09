<script>
  import { rulesList, auditState } from '../../stores/audit.svelte.js';

  // Grouper les règles par catégorie
  $: rulesByCategory = rulesList.reduce((acc, rule) => {
    if (!acc[rule.category]) {
      acc[rule.category] = [];
    }
    acc[rule.category].push(rule);
    return acc;
  }, {});

  // Configuration des catégories
  const categoryConfig = {
    standard: {
      title: 'Règles Standard',
      subtitle: 'Vérifications automatiques des bonnes pratiques',
      icon: '🔧',
      color: 'border-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    'ai-ready': {
      title: 'Règles IA-Ready', 
      subtitle: 'Détection algorithmique, future amélioration IA',
      icon: '🤖',
      color: 'border-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    'ai-active': {
      title: 'Règles IA-Active',
      subtitle: 'Analyse basée sur l\'intelligence artificielle', 
      icon: '✨',
      color: 'border-pink-500',
      bgColor: 'bg-pink-500/10'
    }
  };

  // Obtenir le statut d'une règle depuis les résultats
  function getRuleStatus(ruleId) {
    const rule = auditState.rulesDetected.find(r => r.id === ruleId);
    return rule ? {
      detected: rule.detectedCount > 0,
      count: rule.detectedCount || 0
    } : { detected: false, count: 0 };
  }

  // Obtenir l'icône de statut
  function getStatusIcon(detected) {
    return detected ? '⚠️' : '✅';
  }

  // Obtenir la couleur de statut
  function getStatusColor(detected) {
    return detected ? 'text-yellow-400' : 'text-green-400';
  }
</script>

<section class="card-figma">
  <!-- En-tête -->
  <div class="flex items-center justify-between mb-6">
    <div>
      <h2 class="text-xl font-semibold text-figma-text">
        📋 Règles d'audit Figma
      </h2>
      <p class="text-figma-textMuted text-sm mt-1">
        Analyse selon {rulesList.length} règles de bonnes pratiques
      </p>
    </div>
    <div class="text-figma-button text-2xl font-bold">
      {auditState.rulesDetected.filter(r => r.detectedCount > 0).length}/{rulesList.length}
    </div>
  </div>

  <!-- Grille des règles par catégorie -->
  <div class="space-y-6">
    {#each Object.entries(rulesByCategory) as [category, rules]}
      {@const config = categoryConfig[category]}
      <div class="border {config.color} rounded-lg {config.bgColor}">
        <!-- Header de catégorie -->
        <div class="p-4 border-b border-gray-600">
          <div class="flex items-center space-x-3">
            <span class="text-2xl">{config.icon}</span>
            <div>
              <h3 class="font-semibold text-figma-text">{config.title}</h3>
              <p class="text-sm text-figma-textMuted">{config.subtitle}</p>
            </div>
          </div>
        </div>

        <!-- Règles de cette catégorie -->
        <div class="p-4">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {#each rules as rule}
              {@const status = getRuleStatus(rule.id)}
              <div class="bg-figma-card rounded-lg p-4 border border-gray-600 hover:border-gray-500 transition-colors">
                <!-- En-tête de la règle -->
                <div class="flex items-start justify-between mb-3">
                  <div class="flex items-center space-x-2">
                    <span class="text-lg">{rule.icon}</span>
                    <span class="text-xs px-2 py-1 rounded bg-gray-700 text-figma-textMuted">
                      #{rule.id}
                    </span>
                  </div>
                  <div class="flex items-center space-x-1">
                    <span class="text-lg {getStatusColor(status.detected)}">
                      {getStatusIcon(status.detected)}
                    </span>
                    {#if status.detected}
                      <span class="text-sm text-yellow-400 font-medium">
                        {status.count}
                      </span>
                    {/if}
                  </div>
                </div>

                <!-- Contenu de la règle -->
                <div>
                  <h4 class="font-medium text-figma-text text-sm mb-2">
                    {rule.name}
                  </h4>
                  <p class="text-xs text-figma-textMuted leading-relaxed">
                    {rule.description}
                  </p>
                </div>

                <!-- Statut -->
                <div class="mt-3 pt-3 border-t border-gray-700">
                  <span class="text-xs {getStatusColor(status.detected)}">
                    {#if status.detected}
                      {status.count} problème{status.count > 1 ? 's' : ''} détecté{status.count > 1 ? 's' : ''}
                    {:else}
                      Conforme aux bonnes pratiques
                    {/if}
                  </span>
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>
    {/each}
  </div>
</section>