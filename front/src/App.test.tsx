import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';
import { AuditProvider, useAudit } from './contexts/AuditContext';
import { useEffect } from 'react';

// Mock des composants lourds
vi.mock('./components/display/DesignSystemViewer', () => ({
  default: () => <div>DesignSystemViewer</div>
}));

vi.mock('./components/display/ComponentSuggestionsCards', () => ({
  default: () => <div>ComponentSuggestionsCards</div>
}));

// Wrapper pour injecter des états de test
const AppWrapper = ({ mockState }: { mockState?: any }) => {
  const { setResults, setLoading, setError } = useAudit();

  useEffect(() => {
    if (mockState?.results) {
      setResults(mockState.results);
    }
    if (mockState?.isLoading !== undefined) {
      setLoading(mockState.isLoading);
    }
    if (mockState?.error) {
      setError(mockState.error);
    }
  }, [mockState, setResults, setLoading, setError]);

  return <App />;
};

const renderApp = (mockState?: any) => {
  return render(
    <AuditProvider>
      <AppWrapper mockState={mockState} />
    </AuditProvider>
  );
};

const mockResults = {
  rulesDefinitions: [
    {
      id: 1,
      name: 'Auto Layout Usage',
      description: 'Check auto layout usage',
      category: 'standard' as const,
      color: '#FF6B6B',
      icon: '📐',
      state: 'enabled' as const
    }
  ],
  results: [
    {
      nodeId: 'node1',
      nodeName: 'Frame 1',
      ruleIds: [1],
      moreInfos: {}
    }
  ],
  designSystem: { colors: {}, text: {}, strokes: {}, layout: {} },
  localStyles: { colors: {}, text: {}, strokes: {}, layout: {} },
  componentSuggestions: [],
  figmaAiDescription: 'Test description'
};

describe('App', () => {
  it('renders title and input form', () => {
    renderApp();

    expect(screen.getByText(/FigmAnalyse de maquette/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Lien Figma/i)).toBeInTheDocument();
  });

  it('shows no report message in initial state', () => {
    renderApp();
    expect(screen.getByText(/Aucun rapport généré pour le moment/)).toBeInTheDocument();
  });

  it('displays loading spinner when loading', () => {
    renderApp({ isLoading: true });
    expect(screen.getByText(/Audit en cours/)).toBeInTheDocument();
  });

  it('displays error message when error occurs', () => {
    renderApp({ error: 'Test error message' });
    expect(screen.getAllByText(/Test error message/).length).toBeGreaterThan(0);
  });

  it('renders report view with all main components when results available', () => {
    renderApp({ results: mockResults });

    // Sections principales
    expect(screen.getAllByText(/Règles détectées/).length).toBeGreaterThan(0);
    expect(screen.getByText(/Description de la maquette/)).toBeInTheDocument();
    expect(screen.getByText('DesignSystemViewer')).toBeInTheDocument();
    expect(screen.getByText(/Règles d'audit/)).toBeInTheDocument();
    expect(screen.getByText(/Rapport d'analyse/)).toBeInTheDocument();
  });

  it('conditionally renders ComponentSuggestionsCards', () => {
    // Sans suggestions
    renderApp({ results: mockResults });
    expect(screen.queryByText('ComponentSuggestionsCards')).not.toBeInTheDocument();

    // Avec suggestions
    const resultsWithSuggestions = {
      ...mockResults,
      componentSuggestions: [
        {
          componentName: 'Button',
          description: 'Button component',
          rootNodeId: 'node1',
          rootNodeName: 'Button',
          possibleInstances: [],
          usableNodes: []
        }
      ]
    };

    const { rerender } = renderApp({ results: resultsWithSuggestions });
    rerender(
      <AuditProvider>
        <AppWrapper mockState={{ results: resultsWithSuggestions }} />
      </AuditProvider>
    );
    expect(screen.getByText('ComponentSuggestionsCards')).toBeInTheDocument();
  });
});
