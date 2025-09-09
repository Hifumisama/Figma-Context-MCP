<script>
  export let canSubmit = true;
  export let isLoading = false;
  export let text = '🔍 Lancer l\'audit';
  export let loadingText = '⏳ Audit en cours...';
</script>

<button
  type="submit"
  disabled={!canSubmit || isLoading}
  class="btn-primary w-full sm:w-auto min-w-48 relative overflow-hidden group"
  class:loading={isLoading}
>
  <!-- Contenu du bouton -->
  <span class="relative z-10 flex items-center justify-center space-x-2">
    {#if isLoading}
      <div class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
      <span>{loadingText}</span>
    {:else}
      <span>{text}</span>
    {/if}
  </span>

  <!-- Animation de fond au survol -->
  <div class="absolute inset-0 bg-purple-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
</button>

<style>
  .btn-primary.loading {
    @apply cursor-not-allowed;
  }

  .btn-primary:disabled {
    @apply opacity-50 cursor-not-allowed;
  }

  .btn-primary:disabled .absolute {
    @apply hidden;
  }
</style>