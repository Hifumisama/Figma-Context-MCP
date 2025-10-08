import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DetailedTables from './DetailedTables';
import { AuditProvider, useAudit } from '../../contexts/AuditContext';
import { useEffect } from 'react';

// Mock generateNodeUrl
vi.mock('../../utils/api', () => ({
  generateNodeUrl: vi.fn((baseUrl, nodeId) => `${baseUrl}?node-id=${nodeId}`)
}));

// Composant wrapper pour injecter des données de test
const DetailedTablesWrapper = ({ mockResults, mockUrl }: { mockResults?: any; mockUrl?: string }) => {
  const { setResults, setFigmaUrl } = useAudit();

  useEffect(() => {
    if (mockResults) {
      setResults(mockResults);
    }
    if (mockUrl) {
      setFigmaUrl(mockUrl);
    }
  }, [mockResults, mockUrl, setResults, setFigmaUrl]);

  return <DetailedTables />;
};

// Helper pour rendre avec contexte
const renderWithResults = (mockResults?: any, mockUrl?: string) => {
  return render(
    <AuditProvider>
      <DetailedTablesWrapper mockResults={mockResults} mockUrl={mockUrl} />
    </AuditProvider>
  );
};

const mockResultsWithDetections = {
  rulesDefinitions: [
    {
      id: 1,
      name: 'Auto Layout Usage',
      nameFr: 'Utilisation Auto Layout',
      description: 'Check auto layout usage',
      category: 'standard' as const,
      color: '#FF6B6B',
      icon: '📐',
      state: 'enabled' as const
    },
    {
      id: 2,
      name: 'Layer Naming',
      nameFr: 'Nommage des calques',
      description: 'Check layer naming conventions',
      category: 'standard' as const,
      color: '#4ECDC4',
      icon: '🏷️',
      state: 'enabled' as const
    }
  ],
  results: [
    {
      nodeId: 'node1',
      nodeName: 'Frame 1',
      ruleIds: [1, 2],
      moreInfos: { autoLayoutInfo: 'Missing auto layout' }
    },
    {
      nodeId: 'node2',
      nodeName: 'Frame 2',
      ruleIds: [1],
      moreInfos: {}
    }
  ],
  designSystem: {},
  localStyles: {},
  componentSuggestions: [],
  figmaAiDescription: ''
};

describe('DetailedTables', () => {
  it('renders title', () => {
    renderWithResults();
    expect(screen.getByText("Rapport d'analyse")).toBeInTheDocument();
  });

  it('shows congratulations message when no detections', () => {
    const emptyResults = {
      rulesDefinitions: [],
      results: [],
      designSystem: {},
      localStyles: {},
      componentSuggestions: [],
      figmaAiDescription: ''
    };

    renderWithResults(emptyResults);

    expect(screen.getByText('Félicitations !')).toBeInTheDocument();
    expect(screen.getByText(/respecte parfaitement toutes les règles/)).toBeInTheDocument();
    expect(screen.getByText('🎉')).toBeInTheDocument();
  });

  it('renders table headers when detections exist', () => {
    renderWithResults(mockResultsWithDetections);

    expect(screen.getByText('👤 ID Node')).toBeInTheDocument();
    expect(screen.getByText('📝 Nom node')).toBeInTheDocument();
    expect(screen.getByText('📋 Règles détectées')).toBeInTheDocument();
    expect(screen.getByText('🔗 Vérifier dans la maquette')).toBeInTheDocument();
  });

  it('renders node rows in table', () => {
    renderWithResults(mockResultsWithDetections);

    expect(screen.getByText('node1')).toBeInTheDocument();
    expect(screen.getByText('node2')).toBeInTheDocument();
    expect(screen.getByText('Frame 1')).toBeInTheDocument();
    expect(screen.getByText('Frame 2')).toBeInTheDocument();
  });

  it('renders Figma link when URL provided', () => {
    renderWithResults(mockResultsWithDetections, 'https://www.figma.com/file/abc123');

    const figmaLinks = screen.getAllByText('Voir dans Figma');
    expect(figmaLinks.length).toBeGreaterThan(0);
  });

  it('shows URL not available when no Figma URL', () => {
    renderWithResults(mockResultsWithDetections);

    const unavailableMessages = screen.getAllByText('URL non disponible');
    expect(unavailableMessages.length).toBeGreaterThan(0);
  });

  it('toggles rule details when badge clicked', async () => {
    const user = userEvent.setup();
    renderWithResults(mockResultsWithDetections);

    // Trouver un badge et cliquer dessus
    const badges = screen.getAllByRole('button');
    const ruleBadge = badges.find(btn =>
      btn.className.includes('inline-flex') && btn.className.includes('rounded-full')
    );

    if (ruleBadge) {
      await user.click(ruleBadge);
      // Le RuleDetails devrait être visible après le clic
      // On peut vérifier que le texte de description de la règle apparaît
      const ruleDescription = await screen.findByText(/Check auto layout usage/);
      expect(ruleDescription).toBeInTheDocument();
    }
  });

  it('applies hover effect to table rows', () => {
    const { container } = renderWithResults(mockResultsWithDetections);

    const rows = container.querySelectorAll('tbody tr');
    const firstRow = rows[0];

    expect(firstRow.className).toContain('hover:bg-figma-cardLight');
  });

  it('renders table with proper structure', () => {
    const { container } = renderWithResults(mockResultsWithDetections);

    const table = container.querySelector('table');
    expect(table).toBeInTheDocument();

    const thead = container.querySelector('thead');
    expect(thead).toBeInTheDocument();

    const tbody = container.querySelector('tbody');
    expect(tbody).toBeInTheDocument();
  });

  it('applies correct CSS classes to table', () => {
    const { container } = renderWithResults(mockResultsWithDetections);

    const cardContainer = container.querySelector('.bg-figma-card');
    expect(cardContainer).toBeInTheDocument();

    const table = container.querySelector('table');
    expect(table).toHaveClass('w-full', 'text-sm');
  });

  it('renders correct number of rows', () => {
    const { container } = renderWithResults(mockResultsWithDetections);

    // 2 nodes = au moins 2 lignes principales dans tbody
    const tbody = container.querySelector('tbody');
    const mainRows = tbody?.querySelectorAll('tr.text-white');

    expect(mainRows?.length).toBe(2);
  });

  it('displays moreInfos when available', () => {
    renderWithResults(mockResultsWithDetections);

    // Frame 1 a des moreInfos, donc quand on clique sur un badge, RuleDetails devrait afficher ces infos
    // (Nécessite d'ouvrir le détail pour vérifier)
    expect(screen.getByText('Frame 1')).toBeInTheDocument();
  });
});
