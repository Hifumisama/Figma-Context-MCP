import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import RuleDetails from './RuleDetails';
import { AuditProvider, useAudit } from '../contexts/AuditContext';
import { useEffect } from 'react';

interface RuleDetailsWrapperProps {
  mockResults?: any;
  ruleId: number;
  isOpen?: boolean;
  moreInfos?: Record<string, string>;
}

// Composant wrapper pour injecter des données de test
const RuleDetailsWrapper = ({ mockResults, ...props }: RuleDetailsWrapperProps) => {
  const { setResults } = useAudit();

  useEffect(() => {
    if (mockResults) {
      setResults(mockResults);
    }
  }, [mockResults, setResults]);

  return <RuleDetails {...props} />;
};

// Helper pour rendre avec contexte
const renderWithContext = (props: any, mockResults?: any) => {
  return render(
    <AuditProvider>
      <RuleDetailsWrapper mockResults={mockResults} {...props} />
    </AuditProvider>
  );
};

const mockResults = {
  rulesDefinitions: [
    {
      id: 1,
      name: 'Auto Layout Usage',
      description: 'Check auto layout usage',
      resolutionAdvice: 'Enable auto layout in frame properties',
      category: 'standard' as const,
      color: '#FF6B6B',
      icon: '📐',
      state: 'enabled' as const
    }
  ],
  results: [],
  designSystem: {},
  localStyles: {},
  componentSuggestions: [],
  figmaAiDescription: ''
};

describe('RuleDetails', () => {
  it('renders nothing when isOpen is false', () => {
    const { container } = renderWithContext(
      { ruleId: 1, isOpen: false },
      mockResults
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when rule not found', () => {
    const { container } = renderWithContext(
      { ruleId: 999, isOpen: true },
      mockResults
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders rule details when isOpen is true', () => {
    renderWithContext(
      { ruleId: 1, isOpen: true },
      mockResults
    );

    expect(screen.getByText('Auto Layout Usage')).toBeInTheDocument();
  });

  it('displays rule description', () => {
    renderWithContext(
      { ruleId: 1, isOpen: true },
      mockResults
    );

    expect(screen.getByText(/Check auto layout usage/)).toBeInTheDocument();
  });

  it('displays resolution advice', () => {
    renderWithContext(
      { ruleId: 1, isOpen: true },
      mockResults
    );

    expect(screen.getByText(/Enable auto layout in frame properties/)).toBeInTheDocument();
  });

  it('displays default resolution advice when not provided', () => {
    const mockResultsWithoutAdvice = {
      ...mockResults,
      rulesDefinitions: [
        {
          ...mockResults.rulesDefinitions[0],
          resolutionAdvice: undefined
        }
      ]
    };

    renderWithContext(
      { ruleId: 1, isOpen: true },
      mockResultsWithoutAdvice
    );

    expect(screen.getByText(/Consulter la documentation Figma/)).toBeInTheDocument();
  });

  it('displays moreInfos when provided', () => {
    const moreInfos = {
      '1': 'Missing auto layout on container'
    };

    renderWithContext(
      { ruleId: 1, isOpen: true, moreInfos },
      mockResults
    );

    expect(screen.getByText(/Détails/)).toBeInTheDocument();
    expect(screen.getByText(/Missing auto layout on container/)).toBeInTheDocument();
  });

  it('does not display moreInfos section when empty', () => {
    renderWithContext(
      { ruleId: 1, isOpen: true, moreInfos: {} },
      mockResults
    );

    expect(screen.queryByText(/Détails/)).not.toBeInTheDocument();
  });

  it('does not display moreInfos section when only whitespace', () => {
    const moreInfos = {
      '1': '   '
    };

    renderWithContext(
      { ruleId: 1, isOpen: true, moreInfos },
      mockResults
    );

    expect(screen.queryByText(/Détails/)).not.toBeInTheDocument();
  });
});
