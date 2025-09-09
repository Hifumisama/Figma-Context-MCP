<script>
  export let title = '';
  export let subtitle = '';
  
  let isOpen = false;
  
  function toggle() {
    isOpen = !isOpen;
  }
</script>

<div class="border border-gray-600 rounded-lg bg-figma-card overflow-hidden">
  <!-- Header du accordion -->
  <button
    on:click={toggle}
    class="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-700 transition-colors"
  >
    <div class="flex-1">
      <h4 class="text-figma-text font-medium text-sm">
        {title}
      </h4>
      {#if subtitle}
        <p class="text-figma-textMuted text-xs mt-1">
          {subtitle}
        </p>
      {/if}
    </div>
    
    <!-- Chevron d'ouverture/fermeture -->
    <div class="ml-3 flex-shrink-0">
      <svg
        class="w-4 h-4 text-figma-textMuted transition-transform duration-200 {isOpen ? 'rotate-180' : ''}"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  </button>

  <!-- Contenu expandable -->
  {#if isOpen}
    <div class="px-4 pb-4 pt-2 border-t border-gray-600">
      <slot />
    </div>
  {/if}
</div>