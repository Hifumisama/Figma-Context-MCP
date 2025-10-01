<script>
  import { marked } from 'marked';

  export let description = '';
  export let title = 'Description de la maquette';

  // Configure marked for security and consistency
  marked.setOptions({
    breaks: true,
    gfm: true
  });

  $: htmlDescription = description ? marked.parse(description) : '';
</script>

<div class="card-figma">
  <div class="space-y-4">
    <!-- Titre -->
    <h3 class="text-white font-semibold text-lg text-center">
      {title}
    </h3>

    <!-- Contenu de la description -->
    {#if description}
      <div class="text-figma-textMuted text-sm leading-relaxed space-y-3">
        <!-- Rendu HTML du markdown -->
        {@html htmlDescription}
      </div>
    {:else}
      <!-- État vide -->
      <div class="text-center text-figma-textMuted">
        <div class="text-3xl mb-2">📝</div>
        <p class="text-sm">Aucune description disponible</p>
      </div>
    {/if}
  </div>
</div>

<style>
  /* Styles pour le contenu markdown rendu */
  :global(.card-figma h1),
  :global(.card-figma h2),
  :global(.card-figma h3),
  :global(.card-figma h4) {
    @apply text-white font-semibold mb-2;
  }

  :global(.card-figma h1) {
    @apply text-lg;
  }

  :global(.card-figma h2) {
    @apply text-base;
  }

  :global(.card-figma h3),
  :global(.card-figma h4) {
    @apply text-sm;
  }

  :global(.card-figma p) {
    @apply mb-3 last:mb-0;
  }

  :global(.card-figma strong) {
    @apply text-white font-semibold;
  }

  :global(.card-figma em) {
    @apply text-figma-components italic;
  }

  :global(.card-figma ul),
  :global(.card-figma ol) {
    @apply ml-4 mb-3 space-y-1;
  }

  :global(.card-figma li) {
    @apply text-figma-textMuted text-sm;
  }

  :global(.card-figma code) {
    @apply bg-figma-background px-1 py-0.5 rounded text-figma-components text-xs;
  }

  :global(.card-figma blockquote) {
    @apply border-l-4 border-figma-button pl-4 italic text-figma-textMuted;
  }
</style>