<script>
  /**
   * Component for displaying AI-generated component suggestions
   * Shows cards with component name, description, interactivity status, and usable nodes
   */

  export let componentSuggestions = [];
  export let baseFigmaUrl = '';

  // If no suggestions, don't render anything
  if (!componentSuggestions || componentSuggestions.length === 0) {
    componentSuggestions = [];
  }

  // State for accordions - track which sections are open for each suggestion
  let accordionStates = {};

  // State for main accordion (collapsed by default)
  let isMainAccordionOpen = false;

  // Helper function to generate Figma URLs for nodes
  function getFigmaNodeUrl(nodeId, baseUrl = '') {
    if (!baseUrl || !nodeId) return '#';
    try {
      const url = new URL(baseUrl);
      url.searchParams.set('node-id', nodeId);
      return url.toString();
    } catch {
      return '#';
    }
  }

  // Initialize accordion states for each suggestion
  $: if (componentSuggestions.length > 0) {
    componentSuggestions.forEach((suggestion, index) => {
      if (!accordionStates[index]) {
        accordionStates[index] = {
          instances: false,
          structure: false
        };
      }
    });
  }

  function toggleAccordion(suggestionIndex, section) {
    accordionStates[suggestionIndex][section] = !accordionStates[suggestionIndex][section];
  }

  function toggleMainAccordion() {
    isMainAccordionOpen = !isMainAccordionOpen;
  }
</script>

{#if componentSuggestions.length > 0}
  <section class="mb-8">
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-white mb-2">
        🧩 Suggestions de composants
      </h2>
      <p class="text-white/70">
        Patterns détectés par IA qui pourraient être transformés en composants réutilisables
      </p>
    </div>

    <!-- Encart cliquable avec résumé -->
    <button
      class="w-full bg-figma-card border border-gray-600 rounded-lg p-4 hover:border-gray-500 transition-all duration-200 mb-4"
      onclick={toggleMainAccordion}
    >
      <div class="flex items-center justify-between">
        <div class="text-left">
          <p class="text-white/60 text-sm">
            {componentSuggestions.length} suggestion{componentSuggestions.length > 1 ? 's' : ''} de composant{componentSuggestions.length > 1 ? 's' : ''} détectée{componentSuggestions.length > 1 ? 's' : ''}
            • {componentSuggestions.reduce((sum, s) => sum + s.possibleInstances.length, 0)} instances au total
          </p>
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          class="transition-transform duration-200 text-white/60 {isMainAccordionOpen ? 'rotate-180' : ''}"
        >
          <path d="M7 10L12 15L17 10H7Z" fill="currentColor"/>
        </svg>
      </div>
    </button>

    <!-- Contenu de l'accordéon avec animation -->
    <div class="overflow-hidden transition-all duration-300 ease-in-out {isMainAccordionOpen ? 'max-h-[9999px] opacity-100' : 'max-h-0 opacity-0'}">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each componentSuggestions as suggestion, suggestionIndex}
        <div class="bg-figma-card border border-gray-600 rounded-lg p-6 hover:border-gray-500 transition-colors">
          <!-- Header with component name -->
          <div class="mb-4">
            <h3 class="text-lg font-semibold text-white">
              {suggestion.componentName}
            </h3>
          </div>

          <!-- Description -->
          <p class="text-white/80 text-sm mb-6 leading-relaxed">
            {suggestion.description}
          </p>

          <!-- Possible Instances -->
          <div class="mb-6">
            <button
              class="w-full flex items-center justify-between text-sm font-medium text-white mb-3 hover:text-white/80 transition-colors"
              onclick={() => toggleAccordion(suggestionIndex, 'instances')}
            >
              <span>Instances détectées ({suggestion.possibleInstances.length})</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                class="transition-transform duration-200 {accordionStates[suggestionIndex]?.instances ? 'rotate-180' : ''}"
              >
                <path d="M7 10L12 15L17 10H7Z" fill="currentColor"/>
              </svg>
            </button>

            {#if accordionStates[suggestionIndex]?.instances}
              <div class="space-y-2">
                {#each suggestion.possibleInstances as instance, index}
                  <div class="flex items-center justify-between p-2 bg-figma-background rounded border border-gray-700">
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center">
                        <span class="text-blue-400 mr-2">{index + 1}.</span>
                        <div class="flex-1 min-w-0">
                          <p class="text-sm text-white truncate font-medium">
                            {instance.name}
                          </p>
                          <p class="text-xs text-white/60 font-mono">
                            {instance.nodeId}
                          </p>
                        </div>
                      </div>
                    </div>

                    <!-- Link to this specific instance -->
                    {#if baseFigmaUrl}
                      <a
                        href={getFigmaNodeUrl(instance.nodeId, baseFigmaUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        class="ml-3 text-blue-400 hover:text-blue-300 transition-colors text-xs"
                        title="Voir cette instance dans Figma"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M15 7H20V12H15V7Z" fill="currentColor"/>
                          <path d="M10 7H15V12H10V17H5V12H10V7Z" fill="currentColor"/>
                          <path d="M10 17V22H15V17H10Z" fill="currentColor"/>
                        </svg>
                      </a>
                    {/if}
                  </div>
                {/each}
              </div>
            {/if}
          </div>

          <!-- Usable Nodes (Structure example) -->
          <div>
            <button
              class="w-full flex items-center justify-between text-sm font-medium text-white mb-3 hover:text-white/80 transition-colors"
              onclick={() => toggleAccordion(suggestionIndex, 'structure')}
            >
              <span>Structure du composant ({suggestion.usableNodes.length} éléments)</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                class="transition-transform duration-200 {accordionStates[suggestionIndex]?.structure ? 'rotate-180' : ''}"
              >
                <path d="M7 10L12 15L17 10H7Z" fill="currentColor"/>
              </svg>
            </button>

            {#if accordionStates[suggestionIndex]?.structure}
              <div class="space-y-1">
                {#each suggestion.usableNodes as node, index}
                  <div class="flex items-center p-2 bg-figma-background rounded border border-gray-700">
                    <div class="flex-1 min-w-0">
                      <!-- Visual hierarchy indication -->
                      <div class="flex items-center">
                        {#if index === 0}
                          <span class="text-green-400 mr-2">📦</span>
                        {:else}
                          <span class="text-gray-400 mr-2 ml-4">└─</span>
                        {/if}
                        <div class="flex-1 min-w-0">
                          <p class="text-sm text-white truncate font-medium">
                            {node.name}
                          </p>
                          <p class="text-xs text-white/60 font-mono">
                            {node.nodeId}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                {/each}
              </div>
            {/if}
          </div>

          <!-- Action buttons -->
          <div class="mt-6 pt-4 border-t border-gray-700">
            {#if baseFigmaUrl && suggestion.usableNodes.length > 0}
              <a
                href={getFigmaNodeUrl(suggestion.usableNodes[0].nodeId, baseFigmaUrl)}
                target="_blank"
                rel="noopener noreferrer"
                class="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium bg-figma-button hover:bg-figma-button/80 text-white rounded-lg transition-colors"
                title="Voir la première instance dans Figma"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 7H20V12H15V7Z" fill="currentColor"/>
                  <path d="M10 7H15V12H10V17H5V12H10V7Z" fill="currentColor"/>
                  <path d="M10 17V22H15V17H10Z" fill="currentColor"/>
                </svg>
                Voir l'exemple dans Figma
              </a>
            {:else}
              <button
                disabled
                class="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium bg-gray-600 text-gray-400 rounded-lg cursor-not-allowed"
              >
                URL Figma non disponible
              </button>
            {/if}
          </div>
        </div>
      {/each}
      </div>
    </div>
  </section>
{/if}

<style>
  /* Additional custom styles if needed - TailwindCSS should handle most styling */
</style>