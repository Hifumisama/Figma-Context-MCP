import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import TotalDetectedRules from './TotalDetectedRules';
import { AuditProvider, useAudit } from '../../contexts/AuditContext';
import { useEffect } from 'react';

// Mock Chart.js
vi.mock('chart.js', () => {
  const mockChartInstance = vi.fn().mockImplementation(() => ({
    destroy: vi.fn()
  }));

  return {
    Chart: Object.assign(mockChartInstance, {
      register: vi.fn()
    }),
    ArcElement: vi.fn(),
    Tooltip: vi.fn(),
    Legend: vi.fn(),
    DoughnutController: vi.fn()
  };
});

// Composant wrapper pour injecter des données de test
const TotalDetectedRulesWrapper = ({ mockResults }: { mockResults?: any }) => {
  const { setResults } = useAudit();

  useEffect(() => {
    if (mockResults) {
      setResults(mockResults);
    }
  }, [mockResults, setResults]);

  return <TotalDetectedRules />;
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

describe('TotalDetectedRules', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with empty state when no rules detected', () => {
    render(
      <AuditProvider>
        <TotalDetectedRules />
      </AuditProvider>
    );

    expect(screen.getByText('Règles détectées')).toBeInTheDocument();
    expect(screen.getByText('Aucune règle détectée')).toBeInTheDocument();
  });

  it('renders chart with data when rules are detected', () => {
    const { container } = render(
      <AuditProvider>
        <TotalDetectedRulesWrapper mockResults={mockResultsWithDetections} />
      </AuditProvider>
    );

    // Vérifie le titre
    expect(screen.getByText('Règles détectées')).toBeInTheDocument();

    // Vérifie que l'état vide n'est pas affiché
    expect(screen.queryByText('Aucune règle détectée')).not.toBeInTheDocument();
    expect(screen.queryByText('📊')).not.toBeInTheDocument();

    // Vérifie la présence du canvas
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();

    // Vérifie le nombre total de détections (2 nodes/résultats) au centre du doughnut
    const totalElement = container.querySelector('.text-2xl.font-bold.text-figma-button');
    expect(totalElement).toHaveTextContent('2');
    expect(screen.getByText('détections')).toBeInTheDocument();

    // Vérifie la légende avec les noms des règles et leurs détections
    expect(screen.getByText('Utilisation Auto Layout')).toBeInTheDocument();
    expect(screen.getByText('Nommage des calques')).toBeInTheDocument();

    // Vérifie que les deux règles sont affichées dans la légende
    const legendContainer = container.querySelector('.space-y-2.max-w-xs');
    expect(legendContainer?.children.length).toBe(2);
  });
});
