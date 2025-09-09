// Utilitaires pour les appels API vers l'endpoint /api/audit-figma

/**
 * Appelle l'API d'audit Figma
 * @param {Object} params - Paramètres de l'audit
 * @param {string} params.figmaUrl - URL du fichier Figma
 * @param {string} params.figmaApiKey - Clé API Figma (optionnelle)
 * @param {string} params.outputFormat - Format de sortie ('json' ou 'markdown')
 * @returns {Promise<Object>} - Résultats de l'audit
 */
export async function auditFigmaDesign({ figmaUrl, figmaApiKey, outputFormat = 'json' }) {
  try {
    const response = await fetch('https://figma-mcp-server-1045310654832.europe-west9.run.app/api/audit-figma', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        figmaUrl,
        figmaApiKey: figmaApiKey || undefined, // Envoie undefined si vide
        outputFormat
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new ApiError(response.status, errorData.error, errorData.details, errorData.suggestion);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Erreur réseau ou autre
    throw new ApiError(500, 'Erreur de connexion', 'Impossible de contacter le serveur d\'audit', 'Vérifiez votre connexion réseau');
  }
}

/**
 * Classe d'erreur personnalisée pour les erreurs API
 */
export class ApiError extends Error {
  constructor(status, error, details, suggestion) {
    super(error);
    this.name = 'ApiError';
    this.status = status;
    this.error = error;
    this.details = details;
    this.suggestion = suggestion;
  }

  /**
   * Obtient un message d'erreur formaté pour l'utilisateur
   */
  getUserMessage() {
    switch (this.status) {
      case 400:
        return {
          title: 'URL invalide',
          message: 'L\'URL Figma fournie n\'est pas valide.',
          suggestion: 'Vérifiez que l\'URL commence par https://www.figma.com/file/ ou https://www.figma.com/design/'
        };
      
      case 401:
        return {
          title: 'Accès refusé',
          message: this.details || 'Ce fichier Figma n\'est pas public ou la clé API est incorrecte.',
          suggestion: this.suggestion || 'Obtenez une clé API sur https://www.figma.com/developers/api#access-tokens'
        };
      
      case 500:
        return {
          title: 'Erreur du serveur',
          message: 'Une erreur s\'est produite lors de l\'audit.',
          suggestion: 'Essayez de nouveau dans quelques instants'
        };
      
      default:
        return {
          title: 'Erreur inattendue',
          message: this.details || this.error,
          suggestion: 'Contactez le support si le problème persiste'
        };
    }
  }
}

/**
 * Valide une URL Figma
 * @param {string} url - URL à valider
 * @returns {boolean} - True si l'URL est valide
 */
export function isValidFigmaUrl(url) {
  if (!url) return false;
  
  const figmaUrlPattern = /^https:\/\/www\.figma\.com\/(file|design)\/[a-zA-Z0-9]+/;
  return figmaUrlPattern.test(url);
}

/**
 * Extrait l'ID du fichier depuis une URL Figma
 * @param {string} url - URL Figma
 * @returns {string|null} - ID du fichier ou null si invalide
 */
export function extractFigmaFileId(url) {
  const match = url.match(/\/(?:file|design)\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
}