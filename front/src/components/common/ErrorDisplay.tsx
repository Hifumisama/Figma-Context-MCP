import React from 'react';
import { useAudit } from '../../contexts/AuditContext';
import { ApiError } from '../../utils/api';

const ErrorDisplay: React.FC = () => {
  const { state, resetAudit } = useAudit();

  const isApiError = (error: any): error is ApiError => {
    return error && typeof error === 'object' && 'status' in error && 'getUserMessage' in error;
  };

  const getErrorDetails = () => {
    if (isApiError(state.error)) {
      return state.error.getUserMessage();
    }
    return {
      title: 'Erreur inattendue',
      message: typeof state.error === 'string' ? state.error : 'Une erreur inconnue s\'est produite',
      suggestion: 'Essayez de recharger la page'
    };
  };

  const getErrorIcon = () => {
    if (isApiError(state.error)) {
      switch (state.error.status) {
        case 400: return '⚠️';
        case 401: return '🔒';
        case 500: return '💥';
        default: return '❌';
      }
    }
    return '❌';
  };

  const handleRetry = () => {
    resetAudit();
  };

  const handleReload = () => {
    window.location.reload();
  };

  const errorDetails = getErrorDetails();
  const errorIcon = getErrorIcon();

  return (
    <section className="py-8">
      <div className="card-figma max-w-2xl mx-auto border-l-4 border-red-500">
        {/* Icône et titre d'erreur */}
        <div className="flex items-start space-x-4 mb-4">
          <div className="text-4xl flex-shrink-0">
            {errorIcon}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-red-400 mb-2">
              {errorDetails.title}
            </h2>
            <p className="text-figma-text leading-relaxed mb-4">
              {errorDetails.message}
            </p>
            {errorDetails.suggestion && (
              <p className="text-figma-textMuted text-sm">
                💡 {errorDetails.suggestion}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-600">
          <button
            onClick={handleRetry}
            className="btn-primary"
          >
            🔄 Réessayer
          </button>

          {isApiError(state.error) && state.error.status === 401 && (
            <a
              href="https://www.figma.com/developers/api#access-tokens"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              🔑 Obtenir une clé API
            </a>
          )}

          <button
            onClick={handleReload}
            className="px-4 py-2 text-figma-textMuted hover:text-figma-text transition-colors"
          >
            🔄 Recharger la page
          </button>
        </div>

        {/* Détails techniques (en mode développement) */}
        {import.meta.env.DEV && state.error && (
          <details className="mt-4 p-3 bg-gray-800 rounded text-xs">
            <summary className="cursor-pointer text-figma-textMuted hover:text-figma-text">
              Détails techniques (développement)
            </summary>
            <pre className="mt-2 text-red-300 whitespace-pre-wrap">
              {JSON.stringify({
                error: (state.error && typeof state.error === 'object' && 'message' in state.error) ? (state.error as Error).message : state.error,
                status: isApiError(state.error) ? state.error.status : 'unknown',
                stack: (state.error && typeof state.error === 'object' && 'stack' in state.error) ? (state.error as Error).stack : undefined
              }, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </section>
  );
};

export default ErrorDisplay;
