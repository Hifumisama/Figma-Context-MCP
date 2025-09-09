<script>
  import { auditState, setLoading, setError, setResults } from '../../stores/audit.svelte.js';
  import { auditFigmaDesign, isValidFigmaUrl } from '../../utils/api.js';
  import PrimaryButton from './PrimaryButton.svelte';

  // Validation en temps réel
  $: urlValid = isValidFigmaUrl(auditState.figmaUrl);
  $: canSubmit = urlValid && !auditState.isLoading;

  // Messages d'aide
  $: urlHelpMessage = getUrlHelpMessage(auditState.figmaUrl, urlValid);

  function getUrlHelpMessage(url, valid) {
    if (!url) return "Collez l'URL de votre fichier Figma ici";
    if (!valid) return "❌ URL invalide. Format attendu: https://www.figma.com/file/...";
    return "✅ URL valide";
  }

  async function handleSubmit() {
    if (!canSubmit) return;

    setLoading(true);

    try {
      const results = await auditFigmaDesign({
        figmaUrl: auditState.figmaUrl,
        figmaApiKey: auditState.figmaApiKey,
        outputFormat: auditState.outputFormat
      });

      setResults(results);
    } catch (error) {
      setError(error);
    }
  }

  function handleKeydown(event) {
    if (event.key === 'Enter' && canSubmit) {
      event.preventDefault();
      handleSubmit();
    }
  }

  function handleReset() {
    auditState.figmaUrl = '';
    auditState.figmaApiKey = '';
    auditState.outputFormat = 'json';
  }
</script>

<div class="max-w-4xl mx-auto">
  <form on:submit|preventDefault={handleSubmit} class="space-y-6">

    <!-- Champs en ligne comme dans la maquette -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Lien Figma (requis) -->
      <div class="space-y-2">
        <label for="figma-url" class="block text-sm font-medium text-white">
          Lien Figma *
        </label>
        <input
          id="figma-url"
          bind:value={auditState.figmaUrl}
          on:keydown={handleKeydown}
          type="url"
          required
          disabled={auditState.isLoading}
          class="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder=""
        />
      </div>

      <!-- Clé API (optionnelle selon specs) -->
      <div class="space-y-2">
        <label for="figma-api-key" class="block text-sm font-medium text-white">
          Clé API (Optionnelle sauf si maquette privée)
        </label>
        <input
          id="figma-api-key"
          bind:value={auditState.figmaApiKey}
          on:keydown={handleKeydown}
          type="password"
          disabled={auditState.isLoading}
          class="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder=""
        />
      </div>
    </div>

    <!-- Bouton principal centré -->
    <div class="flex justify-center pt-6">
      <PrimaryButton 
        {canSubmit} 
        isLoading={auditState.isLoading} 
        text="Analyser la maquette"
        loadingText="Analyse en cours..."
      />
    </div>
  </form>
</div>