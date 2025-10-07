import React, { FormEvent } from 'react';
import { useAudit } from '../../contexts/AuditContext';
import { auditFigmaDesign, isValidFigmaUrl } from '../../utils/api';
import PrimaryButton from './PrimaryButton';

const InputForm: React.FC = () => {
  const { state, setFigmaUrl, setFigmaApiKey, setLoading, setError, setResults } = useAudit();

  const urlValid = isValidFigmaUrl(state.figmaUrl);
  const canSubmit = urlValid && !state.isLoading;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);

    try {
      const results = await auditFigmaDesign({
        figmaUrl: state.figmaUrl,
        figmaApiKey: state.figmaApiKey,
        outputFormat: state.outputFormat
      });

      setResults(results);
    } catch (error) {
      setError(error as string);
    }
  };

  const handleKeydown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && canSubmit) {
      event.preventDefault();
      handleSubmit(event as any);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Champs en ligne comme dans la maquette */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Lien Figma (requis) */}
          <div className="space-y-2">
            <label htmlFor="figma-url" className="block text-sm font-medium text-white">
              Lien Figma *
            </label>
            <input
              id="figma-url"
              value={state.figmaUrl}
              onChange={(e) => setFigmaUrl(e.target.value)}
              onKeyDown={handleKeydown}
              type="url"
              required
              disabled={state.isLoading}
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder=""
            />
          </div>

          {/* Clé API (optionnelle selon specs) */}
          <div className="space-y-2">
            <label htmlFor="figma-api-key" className="block text-sm font-medium text-white">
              Clé API (Optionnelle sauf si maquette privée)
            </label>
            <input
              id="figma-api-key"
              value={state.figmaApiKey}
              onChange={(e) => setFigmaApiKey(e.target.value)}
              onKeyDown={handleKeydown}
              type="password"
              disabled={state.isLoading}
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder=""
            />
          </div>
        </div>

        {/* Bouton principal centré */}
        <div className="flex justify-center pt-6">
          <PrimaryButton
            canSubmit={canSubmit}
            isLoading={state.isLoading}
            text="Analyser la maquette"
            loadingText="Analyse en cours..."
          />
        </div>
      </form>
    </div>
  );
};

export default InputForm;
