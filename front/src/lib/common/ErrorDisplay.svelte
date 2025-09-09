<script>
  import { auditState, resetAudit } from '../../stores/audit.svelte.js';
  import { ApiError } from '../../utils/api.js';

  // Obtient les détails de l'erreur formatés
  $: errorDetails = auditState.error instanceof ApiError 
    ? auditState.error.getUserMessage()
    : {
        title: 'Erreur inattendue',
        message: auditState.error?.message || 'Une erreur inconnue s\'est produite',
        suggestion: 'Essayez de recharger la page'
      };

  // Détermine l'icône selon le type d'erreur
  $: errorIcon = getErrorIcon(auditState.error);

  function getErrorIcon(error) {
    if (error instanceof ApiError) {
      switch (error.status) {
        case 400: return '⚠️';
        case 401: return '🔒';
        case 500: return '💥';
        default: return '❌';
      }
    }
    return '❌';
  }

  function handleRetry() {
    resetAudit();
  }

  function handleReload() {
    window.location.reload();
  }
</script>

<section class="py-8">
  <div class="card-figma max-w-2xl mx-auto border-l-4 border-red-500">
    <!-- Icône et titre d'erreur -->
    <div class="flex items-start space-x-4 mb-4">
      <div class="text-4xl flex-shrink-0">
        {errorIcon}
      </div>
      <div class="flex-1">
        <h2 class="text-xl font-semibold text-red-400 mb-2">
          {errorDetails.title}
        </h2>
        <p class="text-figma-text leading-relaxed mb-4">
          {errorDetails.message}
        </p>
        {#if errorDetails.suggestion}
          <p class="text-figma-textMuted text-sm">
            💡 {errorDetails.suggestion}
          </p>
        {/if}
      </div>
    </div>

    <!-- Actions -->
    <div class="flex flex-wrap gap-3 pt-4 border-t border-gray-600">
      <button 
        on:click={handleRetry}
        class="btn-primary"
      >
        🔄 Réessayer
      </button>
      
      {#if auditState.error instanceof ApiError && auditState.error.status === 401}
        <a 
          href="https://www.figma.com/developers/api#access-tokens"
          target="_blank"
          rel="noopener noreferrer"
          class="btn-primary"
        >
          🔑 Obtenir une clé API
        </a>
      {/if}
      
      <button 
        on:click={handleReload}
        class="px-4 py-2 text-figma-textMuted hover:text-figma-text transition-colors"
      >
        🔄 Recharger la page
      </button>
    </div>

    <!-- Détails techniques (en mode développement) -->
    {#if import.meta.env.DEV && auditState.error}
      <details class="mt-4 p-3 bg-gray-800 rounded text-xs">
        <summary class="cursor-pointer text-figma-textMuted hover:text-figma-text">
          Détails techniques (développement)
        </summary>
        <pre class="mt-2 text-red-300 whitespace-pre-wrap">{JSON.stringify({
          error: auditState.error.message,
          status: auditState.error.status || 'unknown',
          stack: auditState.error.stack
        }, null, 2)}</pre>
      </details>
    {/if}
  </div>
</section>