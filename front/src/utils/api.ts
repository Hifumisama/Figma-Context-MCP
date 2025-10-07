// Utilitaires pour les appels API vers l'endpoint /api/audit-figma

/**
 * Appelle l'API d'audit Figma
 */
export async function auditFigmaDesign({
  figmaUrl,
  figmaApiKey,
  outputFormat = 'json'
}: {
  figmaUrl: string;
  figmaApiKey?: string;
  outputFormat?: string;
}) {
  try {
    // Utilise la variable d'environnement ou fallback sur l'URL de production
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://figma-mcp-server-1045310654832.europe-west9.run.app';
    const response = await fetch(`${apiBaseUrl}/api/audit-figma`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        figmaUrl,
        figmaApiKey: figmaApiKey || undefined,
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
  status: number;
  error: string;
  details?: string;
  suggestion?: string;

  constructor(status: number, error: string, details?: string, suggestion?: string) {
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
 */
export function isValidFigmaUrl(url: string): boolean {
  if (!url) return false;

  const figmaUrlPattern = /^https:\/\/www\.figma\.com\/(file|design)\/[a-zA-Z0-9]+/;
  return figmaUrlPattern.test(url);
}

/**
 * Extrait l'ID du fichier depuis une URL Figma
 */
export function extractFigmaFileId(url: string): string | null {
  const match = url.match(/\/(?:file|design)\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
}

/**
 * Génère une URL Figma pour une node spécifique
 */
export function generateNodeUrl(baseUrl: string, nodeId: string): string | null {
  if (!isValidFigmaUrl(baseUrl) || !nodeId) return null;

  // Pour les instances avec structure hiérarchique (ex: "I12:34;56:78;90:12")
  // on prend le dernier segment après le dernier point-virgule
  const lastSegment = nodeId.includes(';') ? nodeId.split(';').pop() : nodeId;

  // Convertir le format "123:456" en "123-456" pour l'URL
  const urlNodeId = lastSegment!.replace(':', '-');

  // Enlever les paramètres existants et ajouter node-id
  const urlWithoutParams = baseUrl.split('?')[0];
  return `${urlWithoutParams}?node-id=${urlNodeId}`;
}
