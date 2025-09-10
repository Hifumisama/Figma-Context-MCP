<script>
  import { auditState, showReport } from './stores/audit.svelte.js';
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
        <!-- Règles détectées sur sa propre ligne -->
        <div class="flex justify-center">
          <TotalDetectedRules />
        </div>
        
        <!-- cartes statistiques en haut -->
        <StatsCards />
        
        <!-- Rapport d'analyse prend toute la largeur -->
        <div class="w-full">
          <DetailedTables />
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
</style>
