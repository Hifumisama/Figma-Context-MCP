<script>
  import { onMount, onDestroy } from 'svelte';
  import { Chart, ArcElement, Tooltip, Legend, DoughnutController } from 'chart.js';
  import { chartData, totalRulesDetected, rulesCategoriesStats, allRulesWithStatus } from '../../stores/audit.svelte.js';

  // Enregistrer les composants Chart.js nécessaires
  Chart.register(ArcElement, Tooltip, Legend, DoughnutController);

  let canvasElement = $state();
  let chartInstance;

  onMount(() => {
    if (chartData()) {
      createChart();
    }
  });

  onDestroy(() => {
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }
  });

  // Réactivité Svelte 5 - recréer le graphique quand les données changent
  $effect(() => {
    if (chartData() && canvasElement) {
      updateChart();
    }
  });

  function createChart() {
    const ctx = canvasElement.getContext('2d');

    chartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: chartData(),
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false // On affiche notre propre légende personnalisée
          },
          tooltip: {
            backgroundColor: '#081028',
            titleColor: '#FFFFFF',
            bodyColor: '#AEB9E1',
            borderColor: '#CB3CFF',
            borderWidth: 1,
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.parsed;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
                return `${label}: ${value} problèmes (${percentage}%)`;
              }
            }
          }
        },
        cutout: '70%', // Pour laisser plus d'espace au centre pour le texte
        animation: {
          animateRotate: true,
          animateScale: true,
          duration: 1000,
          easing: 'easeInOutQuart'
        },
        elements: {
          arc: {
            borderWidth: 2,
            borderColor: '#FFFFFF'
          }
        }
      }
    });
  }

  function updateChart() {
    if (chartInstance && chartData()) {
      chartInstance.data = chartData();
      chartInstance.update('active');
    } else if (!chartInstance && chartData() && canvasElement) {
      createChart();
    }
  }

  function getRuleColor(index) {
    const colors = [
      'bg-purple-500',  // CB3CFF
      'bg-purple-600',  // 8A38F5
      'bg-indigo-500',  // 6366F1
      'bg-blue-500',    // 3B82F6
      'bg-emerald-500', // 10B981
      'bg-amber-500',   // F59E0B
      'bg-red-500',     // EF4444
      'bg-pink-500',    // EC4899
      'bg-violet-500'   // 8B5CF6
    ];
    return colors[index % colors.length];
  }
</script>

<!-- Chart selon la nouvelle maquette -->
<div class="card-figma">
  <div class="space-y-4">
    <!-- Titre principal -->
    <h3 class="text-white font-semibold text-lg text-center">
      Règles détectées
    </h3>

    <!-- Chart et légende -->
    {#if chartData() && totalRulesDetected() > 0}
      <div class="flex items-center justify-center space-x-8">
        <!-- Graphique Chart.js agrandi avec texte centré -->
        <div class="relative w-44 h-44 flex-shrink-0">
          <canvas bind:this={canvasElement}></canvas>
          <!-- Texte au centre du doughnut -->
          <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div class="text-2xl font-bold text-figma-button">
              {totalRulesDetected()}
            </div>
            <div class="text-xs text-figma-textMuted">
              détections
            </div>
          </div>
        </div>
        
        <!-- Légende personnalisée pour chaque règle avec détections -->
        <div class="space-y-2 max-w-xs">
          {#each allRulesWithStatus().filter(rule => rule.detectedCount > 0) as rule, index}
            <div class="flex items-center space-x-3 text-sm">
              <div class="w-3 h-3 rounded-full {getRuleColor(index)}"></div>
              <span class="text-white text-xs">
                {rule.nameFr || rule.name}
              </span>
              <span class="text-figma-textMuted text-xs">
                {rule.detectedCount}
              </span>
            </div>
          {/each}
        </div>
      </div>
    {:else}
      <!-- État vide -->
      <div class="text-center text-figma-textMuted">
        <div class="text-3xl mb-2">📊</div>
        <p class="text-sm">Aucune règle détectée</p>
      </div>
    {/if}
  </div>
</div>

