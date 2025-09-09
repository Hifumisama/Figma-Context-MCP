<script>
  import { auditState, hasResults, showReport } from './stores/audit.svelte.js';
  import InputForm from './lib/forms/InputForm.svelte';
  import LoadingSpinner from './lib/common/LoadingSpinner.svelte';
  import ErrorDisplay from './lib/common/ErrorDisplay.svelte';
  import StatsCards from './lib/display/StatsCards.svelte';
  import TotalDetectedRules from './lib/display/TotalDetectedRules.svelte';
  import DetailedTables from './lib/display/DetailedTables.svelte';

  // Titre intégré (pas de composant séparé selon les specs)
  const title = 'FigmAnalyse de maquette';
  const subtitle = 'Analysez vos designs Figma selon les meilleures pratiques';

  // Message NoReportGenerated intégré (pas de composant séparé)
  const noReportMessage = 'Aucun rapport généré pour le moment';
  const noReportSubtext = 'Entrez une URL Figma ci-dessus pour commencer l\'audit de votre design';
</script>

<div class="min-h-screen bg-figma-background">
  <div class="w-full px-8 py-12">
    <!-- Titre intégré -->
    <header class="text-center mb-12">
      <h1 class="text-4xl font-bold text-white mb-4">
        {title}
      </h1>
    </header>

    <!-- Formulaire toujours visible selon les specs -->
    <section class="mb-8">
      <InputForm />
    </section>

    <!-- États conditionnels -->
    {#if auditState.error}
      <ErrorDisplay />
    {:else if auditState.isLoading}
      <LoadingSpinner />
    {:else if showReport()}
      <!-- Mode rapport -->
      <div class="space-y-8">
        <!-- 4 cartes statistiques en haut -->
        <StatsCards />
        
        <!-- Chart et rapports selon la nouvelle maquette -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="lg:col-span-1">
            <TotalDetectedRules />
          </div>
          <div class="lg:col-span-2">
            <!-- Tableaux détaillés selon la nouvelle maquette -->
            <DetailedTables />
          </div>
        </div>
      </div>
    {:else}
      <!-- État initial - NoReportGenerated intégré -->
      <section class="text-center py-16 w-full">
        <h2 class="text-2xl font-semibold text-white mb-6">
          {noReportMessage}
        </h2>
      </section>
    {/if}
  </div>
</div>

<style>
  /* Styles spécifiques au composant */
  .container {
    max-width: 1475px; /* Selon la maquette Figma */
  }
</style>