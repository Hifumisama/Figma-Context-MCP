<script>
  import { auditState } from '../../stores/audit.svelte.js';

  // États pour les sélections actives
  let selectedTextStyle = $state(null);
  let selectedColor = $state('#FFFFFF');
  let selectedColorName = $state('couleur');
  let selectedStroke = $state({ color: '#000000', weight: '1px' });
  let selectedStrokeName = $state('');

  // Fonction pour convertir la lineHeight en pixels
  function lineHeightToPixels(lineHeight, fontSize) {
    if (typeof lineHeight === 'string') {
      if (lineHeight.endsWith('em')) {
        return Math.round(parseFloat(lineHeight) * fontSize);
      }
      if (lineHeight.endsWith('px')) {
        return parseInt(lineHeight);
      }
    }
    // Fallback: lineHeight as multiplier
    return Math.round(lineHeight * fontSize);
  }

  // Fonction pour obtenir les styles CSS du texte sélectionné
  function getTextStyles() {
    if (!selectedTextStyle) {
      return {
        fontFamily: 'Roboto, sans-serif',
        fontSize: '16px',
        fontWeight: '400',
        lineHeight: '1.5',
        color: '#FFFFFF'
      };
    }

    const style = selectedTextStyle.value || selectedTextStyle;
    return {
      fontFamily: style.fontFamily || 'Roboto, sans-serif',
      fontSize: `${style.fontSize}px`,
      fontWeight: style.fontWeight?.toString() || '400',
      lineHeight: style.lineHeight || '1.5',
      color: '#FFFFFF'
    };
  }

  // Fonction pour obtenir les styles du rectangle de couleur/stroke
  function getPreviewBoxStyles() {
    return {
      backgroundColor: selectedColor,
      border: `${selectedStroke.weight} solid ${selectedStroke.color}`
    };
  }

  // Récupération des données du design system avec runes Svelte 5
  const designSystem = $derived(auditState.designSystem);

  // Les styles de texte sont maintenant dans designSystem.text avec structure {name, value}
  const textStyles = $derived(designSystem?.text || {});

  // Les couleurs sont dans designSystem.colors avec structure {name, hexValue}
  const colorFills = $derived(designSystem?.colors || {});

  // Transformation des strokes en format exploitable
  const strokeStyles = $derived((() => {
    if (!designSystem?.strokes) return {};
    const strokes = {};
    Object.entries(designSystem.strokes).forEach(([id, strokeInfo]) => {
      if (strokeInfo.value?.colors && strokeInfo.value?.strokeWeight) {
        strokes[id] = {
          name: strokeInfo.name || id,
          colors: strokeInfo.value.colors,
          strokeWeight: strokeInfo.value.strokeWeight
        };
      }
    });
    return strokes;
  })());

  // Initialisation des valeurs par défaut avec $effect
  $effect(() => {
    if (designSystem && !selectedTextStyle && Object.keys(textStyles).length > 0) {
      selectedTextStyle = Object.values(textStyles)[0];
    }
  });
</script>

{#if designSystem}
<div class="card-figma">
  <div class="space-y-6">
    <!-- Titre -->
    <h3 class="text-white font-semibold text-lg text-center">
      Design System
    </h3>

    <!-- Contenu en 2 colonnes -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">

      <!-- Colonne Typographie -->
      <div class="space-y-4">
        <h4 class="text-figma-button font-medium text-base">
          Typographie
        </h4>

        {#if Object.keys(textStyles).length > 0}
          <!-- Nom de la police -->
          <div class="text-white text-sm">
            Police : <span class="font-medium">{getTextStyles().fontFamily}</span>
          </div>

          <!-- Texte d'exemple avec style appliqué -->
          <div
            class="text-white p-4 bg-figma-secondary rounded-md"
            style="font-family: {getTextStyles().fontFamily}; font-size: {getTextStyles().fontSize}; font-weight: {getTextStyles().fontWeight}; line-height: {getTextStyles().lineHeight};"
          >
            Lorem ipsum dolor sit amet
          </div>

          <!-- Badges cliquables pour les styles -->
          <div class="flex flex-wrap gap-2">
            {#each Object.entries(textStyles) as [styleId, style]}
              <button
                class="px-3 py-2 rounded-lg text-xs transition-colors {selectedTextStyle === style ? 'bg-figma-button text-white' : 'bg-figma-secondary text-figma-textMuted hover:bg-figma-button hover:text-white'}"
                onclick={() => selectedTextStyle = style}
              >
                <div class="flex flex-col items-center">
                  <span>Taille: {style.value.fontSize}px</span>
                  <span>Hauteur ligne: {lineHeightToPixels(style.value.lineHeight, style.value.fontSize)}px</span>
                </div>
              </button>
            {/each}
          </div>
        {:else}
          <div class="text-center text-figma-textMuted py-8">
            <div class="text-2xl mb-2">📝</div>
            <p class="text-sm">Aucun style de texte détecté</p>
          </div>
        {/if}
      </div>

      <!-- Colonne Couleurs -->
      <div class="space-y-4">
        <h4 class="text-figma-button font-medium text-base">
          Couleurs
        </h4>

        {#if Object.keys(colorFills).length > 0 || Object.keys(strokeStyles).length > 0}
          <!-- Rectangle de prévisualisation -->
          <div
            class="w-full h-24 rounded-md flex flex-col items-center justify-center font-medium border-2 relative"
            style="background-color: {selectedColor}; border-color: {selectedStroke.color}; border-width: {selectedStroke.weight};"
          >
            <span style="mix-blend-mode: difference; color: white;" class="text-sm">
              {selectedColorName}
            </span>
            {#if selectedStrokeName}
              <span style="mix-blend-mode: difference; color: white;" class="text-xs opacity-80">
                {selectedStrokeName}
              </span>
            {/if}
          </div>

          <!-- Couleurs et Contours en 2 colonnes -->
          {#if Object.keys(colorFills).length > 0 || Object.keys(strokeStyles).length > 0}
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

              <!-- Colonne Couleurs de fond (4 par ligne) -->
              {#if Object.keys(colorFills).length > 0}
                <div class="space-y-2">
                  <h5 class="text-white text-sm font-medium">Couleurs de fond</h5>
                  <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-2">
                    {#each Object.entries(colorFills) as [colorId, colorInfo]}
                      <button
                        class="flex flex-col items-center gap-1 group"
                        onclick={() => {
                          selectedColor = colorInfo.hexValue;
                          selectedColorName = colorInfo.name;
                        }}
                      >
                        <div
                          class="w-16 h-16 rounded border-2 border-white/20 flex items-center justify-center font-mono transition-transform group-hover:scale-105"
                          style="background-color: {colorInfo.hexValue}; font-size: 12px;"
                        >
                          <span style="mix-blend-mode: difference; color: white;">
                            {colorInfo.hexValue}
                          </span>
                        </div>
                        <span class="text-figma-textMuted text-center break-words hyphens-auto" style="font-size: 10px;" lang="fr">
                          {colorInfo.name}
                        </span>
                      </button>
                    {/each}
                  </div>
                </div>
              {:else}
                <div></div>
              {/if}

              <!-- Colonne Contours (3 par ligne) -->
              {#if Object.keys(strokeStyles).length > 0}
                <div class="space-y-2">
                  <h5 class="text-white text-sm font-medium">Contours</h5>
                  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {#each Object.entries(strokeStyles) as [strokeId, strokeInfo]}
                      <button
                        class="flex flex-col items-center gap-1 group"
                        onclick={() => {
                          selectedStroke = { color: strokeInfo.colors[0], weight: strokeInfo.strokeWeight };
                          selectedStrokeName = strokeInfo.name;
                        }}
                      >
                        <div
                          class="w-16 h-16 rounded border-2 bg-white flex items-center justify-center text-xs font-mono transition-transform group-hover:scale-105"
                          style="border-color: {strokeInfo.colors[0]}; border-width: {strokeInfo.strokeWeight};"
                        >
                          <span style="mix-blend-mode: difference; color: white; font-size: 12px;">
                            {strokeInfo.colors[0]}
                          </span>
                        </div>
                        <span class="text-figma-textMuted text-xs text-center break-words hyphens-auto" lang="fr">
                          {strokeInfo.name} : {strokeInfo.strokeWeight}
                        </span>
                      </button>
                    {/each}
                  </div>
                </div>
              {:else}
                <div></div>
              {/if}
            </div>
          {/if}
        {:else}
          <div class="text-center text-figma-textMuted py-8">
            <div class="text-2xl mb-2">🎨</div>
            <p class="text-sm">Aucune couleur détectée</p>
          </div>
        {/if}
      </div>
    </div>

    {#if Object.keys(textStyles).length === 0 && Object.keys(colorFills).length === 0 && Object.keys(strokeStyles).length === 0}
    <!-- État vide global -->
    <div class="text-center text-figma-textMuted py-8">
      <div class="text-3xl mb-2">🎨</div>
      <p class="text-sm">Aucun style de design system détecté</p>
    </div>
    {/if}
  </div>
</div>
{/if}