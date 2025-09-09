<script>
  export let message = 'Audit en cours...';
  export let subtext = 'Analyse de votre design Figma en cours, veuillez patienter.';
</script>

<section class="text-center py-16">
  <div class="card-figma max-w-md mx-auto">
    <!-- Spinner animé -->
    <div class="flex justify-center mb-6">
      <div class="animate-spin rounded-full h-16 w-16 border-4 border-figma-textMuted border-t-figma-button"></div>
    </div>
    
    <!-- Message principal -->
    <h2 class="text-xl font-semibold text-figma-text mb-3">
      {message}
    </h2>
    
    <!-- Sous-texte -->
    <p class="text-figma-textMuted leading-relaxed">
      {subtext}
    </p>
    
    <!-- Barre de progression indéterminée -->
    <div class="mt-6 w-full bg-gray-700 rounded-full h-2">
      <div class="bg-figma-button h-2 rounded-full animate-pulse" style="width: 60%"></div>
    </div>
  </div>
</section>

<style>
  /* Animation personnalisée pour la barre de progression */
  @keyframes pulse-progress {
    0%, 100% {
      opacity: 1;
      width: 30%;
    }
    50% {
      opacity: 0.8;
      width: 80%;
    }
  }
  
  .animate-pulse {
    animation: pulse-progress 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
</style>