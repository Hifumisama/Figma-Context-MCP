import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  isValidFigmaUrl,
  extractFigmaFileId,
  generateNodeUrl,
  ApiError,
  auditFigmaDesign
} from './api';

describe('isValidFigmaUrl', () => {
  it('accepts valid Figma URLs', () => {
    expect(isValidFigmaUrl('https://www.figma.com/file/abc123/MyDesign')).toBe(true);
    expect(isValidFigmaUrl('https://www.figma.com/design/abc123/MyDesign')).toBe(true);
    expect(isValidFigmaUrl('https://www.figma.com/file/abc123/MyDesign?node-id=1-2')).toBe(true);
  });

  it('rejects invalid URLs', () => {
    expect(isValidFigmaUrl('')).toBe(false);
    expect(isValidFigmaUrl('http://www.figma.com/file/abc123')).toBe(false);
    expect(isValidFigmaUrl('https://www.example.com/file/abc123')).toBe(false);
    expect(isValidFigmaUrl('https://www.figma.com/profile/abc123')).toBe(false);
  });
});

describe('extractFigmaFileId', () => {
  it('extracts file ID from valid URLs', () => {
    expect(extractFigmaFileId('https://www.figma.com/file/abc123/MyDesign')).toBe('abc123');
    expect(extractFigmaFileId('https://www.figma.com/design/xyz789/MyDesign')).toBe('xyz789');
    expect(extractFigmaFileId('https://www.figma.com/file/aB1cD2eF3/Test?node-id=1-2')).toBe('aB1cD2eF3');
  });

  it('returns null for invalid URLs', () => {
    expect(extractFigmaFileId('')).toBeNull();
    expect(extractFigmaFileId('https://www.example.com/invalid')).toBeNull();
  });
});

describe('generateNodeUrl', () => {
  const baseUrl = 'https://www.figma.com/file/abc123/MyDesign';

  it('generates URL with node ID conversion', () => {
    expect(generateNodeUrl(baseUrl, '123:456'))
      .toBe('https://www.figma.com/file/abc123/MyDesign?node-id=123-456');
  });

  it('handles instance hierarchy (semicolon-separated IDs)', () => {
    expect(generateNodeUrl(baseUrl, 'I12:34;56:78;90:12'))
      .toBe('https://www.figma.com/file/abc123/MyDesign?node-id=90-12');
  });

  it('removes existing query parameters', () => {
    expect(generateNodeUrl(baseUrl + '?old-param=value', '123:456'))
      .toBe('https://www.figma.com/file/abc123/MyDesign?node-id=123-456');
  });

  it('returns null for invalid inputs', () => {
    expect(generateNodeUrl('https://www.example.com/invalid', '123:456')).toBeNull();
    expect(generateNodeUrl(baseUrl, '')).toBeNull();
  });
});

describe('ApiError', () => {
  it('stores error information correctly', () => {
    const error = new ApiError(401, 'Unauthorized', 'Invalid API key', 'Get a new key');

    expect(error.name).toBe('ApiError');
    expect(error.status).toBe(401);
    expect(error.error).toBe('Unauthorized');
    expect(error.message).toBe('Unauthorized');
    expect(error.details).toBe('Invalid API key');
    expect(error.suggestion).toBe('Get a new key');
  });

  describe('getUserMessage', () => {
    it('formats 400 errors (invalid URL)', () => {
      const message = new ApiError(400, 'Bad Request').getUserMessage();
      expect(message.title).toBe('URL invalide');
      expect(message.suggestion).toContain('https://www.figma.com');
    });

    it('formats 401 errors (access denied)', () => {
      const message = new ApiError(401, 'Unauthorized').getUserMessage();
      expect(message.title).toBe('Accès refusé');
      expect(message.message).toContain('pas public');
    });

    it('formats 401 errors with custom details', () => {
      const message = new ApiError(401, 'Unauthorized', 'Custom error', 'Custom fix').getUserMessage();
      expect(message.message).toBe('Custom error');
      expect(message.suggestion).toBe('Custom fix');
    });

    it('formats 500 errors (server error)', () => {
      const message = new ApiError(500, 'Internal Server Error').getUserMessage();
      expect(message.title).toBe('Erreur du serveur');
      expect(message.suggestion).toContain('nouveau');
    });

    it('formats unknown status codes', () => {
      const message = new ApiError(418, "I'm a teapot").getUserMessage();
      expect(message.title).toBe('Erreur inattendue');
    });
  });
});

describe('auditFigmaDesign', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calls API with correct parameters', async () => {
    const mockResponse = { success: true, data: {} };
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const result = await auditFigmaDesign({
      figmaUrl: 'https://www.figma.com/file/abc123/Test',
      figmaApiKey: 'test-key',
      outputFormat: 'json'
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/audit-figma'),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          figmaUrl: 'https://www.figma.com/file/abc123/Test',
          figmaApiKey: 'test-key',
          outputFormat: 'json'
        })
      })
    );

    expect(result).toEqual(mockResponse);
  });

  it('omits figmaApiKey when not provided', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({})
    });

    await auditFigmaDesign({
      figmaUrl: 'https://www.figma.com/file/abc123/Test'
    });

    const body = JSON.parse((global.fetch as any).mock.calls[0][1].body);
    expect(body.figmaApiKey).toBeUndefined();
  });

  it('throws ApiError on failed API response', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({
        error: 'Unauthorized',
        details: 'Invalid key',
        suggestion: 'Get new key'
      })
    });

    await expect(
      auditFigmaDesign({ figmaUrl: 'https://www.figma.com/file/abc123/Test' })
    ).rejects.toThrow(ApiError);
  });

  it('throws ApiError on network failure', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    const promise = auditFigmaDesign({
      figmaUrl: 'https://www.figma.com/file/abc123/Test'
    });

    await expect(promise).rejects.toThrow(ApiError);
    await expect(promise).rejects.toMatchObject({
      status: 500,
      error: 'Erreur de connexion'
    });
  });
});
