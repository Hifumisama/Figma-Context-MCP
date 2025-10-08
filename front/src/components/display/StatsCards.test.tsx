import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StatsCards from './StatsCards';
import { AuditProvider, useAudit } from '../../contexts/AuditContext';
import { useEffect } from 'react';

// Composant wrapper pour injecter des données de test
const StatsCardsWrapper = ({ mockResults }: { mockResults?: any }) => {
  const { setResults } = useAudit();

  useEffect(() => {
    if (mockResults) {
      setResults(mockResults);
    }
  }, [mockResults, setResults]);

  return <StatsCards />;
};

// Helper pour rendre avec contexte
const renderWithResults = (mockResults?: any) => {
  return render(
    <AuditProvider>
      <StatsCardsWrapper mockResults={mockResults} />
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
    { nodeId: 'node1', nodeName: 'Frame 1', ruleIds: [1], moreInfos: {} },
    { nodeId: 'node2', nodeName: 'Frame 2', ruleIds: [1, 2], moreInfos: {} }
  ],
  designSystem: {},
  localStyles: {},
  componentSuggestions: [],
  figmaAiDescription: ''
};

describe('StatsCards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders main elements', () => {
    renderWithResults();

    expect(screen.getByText("Règles d'audit")).toBeInTheDocument();
    expect(screen.getByText('Retirer filtres')).toBeInTheDocument();
    expect(screen.getByText(/Voir conformes|Masquer conformes/)).toBeInTheDocument();
  });

  it('renders rule cards with content', () => {
    renderWithResults(mockResultsWithDetections);

    expect(screen.getByText('Auto Layout Usage')).toBeInTheDocument();
    expect(screen.getByText('Layer Naming')).toBeInTheDocument();
    expect(screen.getByText('📐')).toBeInTheDocument();
    expect(screen.getByText('🏷️')).toBeInTheDocument();
  });

  it('toggles rule filter when card clicked', async () => {
    const user = userEvent.setup();
    renderWithResults(mockResultsWithDetections);

    const clearButton = screen.getByText('Retirer filtres').closest('button');
    expect(clearButton).toBeDisabled();

    const autoLayoutCard = screen.getByText('Auto Layout Usage').closest('button');
    if (autoLayoutCard) {
      await user.click(autoLayoutCard);
      expect(clearButton).not.toBeDisabled();
    }
  });

  it('clears all filters when clear button clicked', async () => {
    const user = userEvent.setup();
    renderWithResults(mockResultsWithDetections);

    const autoLayoutCard = screen.getByText('Auto Layout Usage').closest('button');
    if (autoLayoutCard) {
      await user.click(autoLayoutCard);
    }

    const clearButton = screen.getByText('Retirer filtres').closest('button');
    if (clearButton) {
      await user.click(clearButton);
      expect(clearButton).toBeDisabled();
    }
  });

  it('toggles compliant rules visibility', async () => {
    const user = userEvent.setup();
    renderWithResults(mockResultsWithDetections);

    const toggleButton = screen.getByText(/Voir conformes/).closest('button');
    if (toggleButton) {
      await user.click(toggleButton);
      expect(screen.getByText(/Masquer conformes/)).toBeInTheDocument();
    }
  });

  it('displays compliant badge when no detections', () => {
    const mockCompliantResults = {
      ...mockResultsWithDetections,
      results: []
    };

    renderWithResults(mockCompliantResults);

    expect(screen.getByText(/Masquer conformes/)).toBeInTheDocument();
    expect(screen.getAllByText('✅').length).toBeGreaterThan(0);
  });
});
