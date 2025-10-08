import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ErrorDisplay from './ErrorDisplay';
import { AuditProvider, useAudit } from '../../contexts/AuditContext';
import { ApiError } from '../../utils/api';
import { useEffect } from 'react';

// Mock window.location.reload
const reloadMock = vi.fn();
Object.defineProperty(window, 'location', {
  value: { reload: reloadMock },
  writable: true,
});

// Mock import.meta.env
vi.stubGlobal('import', {
  meta: {
    env: {
      DEV: false,
    },
  },
});

// Composant wrapper pour injecter une erreur dans le contexte
const ErrorDisplayWrapper = ({ error }: { error: any }) => {
  const { setError } = useAudit();

  useEffect(() => {
    setError(error);
  }, [error, setError]);

  return <ErrorDisplay />;
};

// Helper pour rendre ErrorDisplay avec un contexte d'erreur
const renderWithError = (error: any) => {
  return render(
    <AuditProvider>
      <ErrorDisplayWrapper error={error} />
    </AuditProvider>
  );
};

describe('ErrorDisplay', () => {
  beforeEach(() => {
    reloadMock.mockClear();
    import.meta.env.DEV = false;
  });

  it('does not render when there is no error', () => {
    const { container } = render(
      <AuditProvider>
        <ErrorDisplay />
      </AuditProvider>
    );

    expect(container.querySelector('section')).not.toBeInTheDocument();
  });

  it('renders with string error', () => {
    renderWithError('Une erreur texte simple');

    expect(screen.getByText('Erreur inattendue')).toBeInTheDocument();
    expect(screen.getByText('Une erreur texte simple')).toBeInTheDocument();
  });

  it('displays correct error message for ApiError', () => {
    const apiError = new ApiError(401, 'Unauthorized');
    renderWithError(apiError);

    expect(screen.getByText('Accès refusé')).toBeInTheDocument();
  });

  it('displays custom error details for ApiError', () => {
    const apiError = new ApiError(
      401,
      'Unauthorized',
      'Clé API invalide',
      'Vérifiez votre clé API'
    );
    renderWithError(apiError);

    expect(screen.getByText('Clé API invalide')).toBeInTheDocument();
    expect(screen.getByText(/Vérifiez votre clé API/)).toBeInTheDocument();
  });

  it('renders API key link only for 401 errors', () => {
    const { rerender } = renderWithError(new ApiError(401, 'Unauthorized'));

    expect(screen.getByText(/Obtenir une clé API/)).toBeInTheDocument();

    rerender(
      <AuditProvider>
        <ErrorDisplayWrapper error={new ApiError(500, 'Server Error')} />
      </AuditProvider>
    );
    expect(screen.queryByText(/Obtenir une clé API/)).not.toBeInTheDocument();
  });

  it('calls window.location.reload when reload button is clicked', async () => {
    const user = userEvent.setup();
    renderWithError(new ApiError(500, 'Server Error'));

    const reloadButton = screen.getByText(/Recharger la page/);
    await user.click(reloadButton);

    expect(reloadMock).toHaveBeenCalledTimes(1);
  });

  it('shows technical details in development mode', () => {
    import.meta.env.DEV = true;

    const apiError = new ApiError(500, 'Server Error');
    renderWithError(apiError);

    const detailsElement = screen.getByText(/Détails techniques/);
    expect(detailsElement).toBeInTheDocument();
  });

  it('hides technical details in production mode', () => {
    import.meta.env.DEV = false;

    const apiError = new ApiError(500, 'Server Error');
    renderWithError(apiError);

    expect(screen.queryByText(/Détails techniques/)).not.toBeInTheDocument();
  });
});
