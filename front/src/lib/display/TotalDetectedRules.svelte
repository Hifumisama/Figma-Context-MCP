<script>
  import { onMount, onDestroy } from 'svelte';
  import { Chart, ArcElement, Tooltip, Legend, DoughnutController } from 'chart.js';
  import { chartData, totalRulesDetected, rulesCategoriesStats } from '../../stores/audit.svelte.js';

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
        cutout: '60%', // Pour un doughnut plus moderne
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
</script>

<!-- Chart selon la nouvelle maquette -->
<div class="card-figma">
  <div class="space-y-4">
    <!-- Titre principal -->
    <h3 class="text-white font-semibold text-lg">
      Total de règles détectées
    </h3>
    
    <!-- Nombre total centré -->
    <div class="text-center">
      <div class="text-4xl font-bold text-figma-button mb-2">
        {totalRulesDetected()}
      </div>
      <div class="text-sm text-figma-textMuted">Détections</div>
    </div>

    <!-- Chart et légende -->
    {#if chartData() && totalRulesDetected() > 0}
      <div class="flex items-center justify-center space-x-6">
        <!-- Graphique Chart.js -->
        <div class="w-32 h-32 flex-shrink-0">
          <canvas bind:this={canvasElement}></canvas>
        </div>
        
        <!-- Légende personnalisée -->
        <div class="space-y-2">
          {#each Object.entries(rulesCategoriesStats()) as [category, stats]}
            <div class="flex items-center space-x-3 text-sm">
              <div class="w-3 h-3 rounded-full {getCategoryColor(category)}"></div>
              <span class="text-white">
                {getCategoryLabel(category)}
              </span>
              <span class="text-figma-textMuted">
                {stats.count}/{stats.total}
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

<script module>
  function getCategoryColor(category) {
    switch (category) {
      case 'standard':
        return 'bg-blue-500';
      case 'ai-ready':
        return 'bg-purple-500';
      case 'ai-active':
        return 'bg-pink-500';
      default:
        return 'bg-gray-500';
    }
  }

  function getCategoryLabel(category) {
    switch (category) {
      case 'standard':
        return 'Standard';
      case 'ai-ready':
        return 'AI Ready';
      case 'ai-active':
        return 'AI Active';
      default:
        return category;
    }
  }
</script>