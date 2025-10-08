import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DesignSystemViewer from './DesignSystemViewer';
import { AuditProvider, useAudit } from '../../contexts/AuditContext';
import { useEffect } from 'react';

// Composant wrapper pour injecter des données de design system
const DesignSystemViewerWrapper = ({ mockResults }: { mockResults?: any }) => {
  const { setResults } = useAudit();

  useEffect(() => {
    if (mockResults) {
      setResults(mockResults);
    }
  }, [mockResults, setResults]);

  return <DesignSystemViewer />;
};

// Helper pour rendre avec contexte
const renderWithDesignSystem = (mockResults?: any) => {
  return render(
    <AuditProvider>
      <DesignSystemViewerWrapper mockResults={mockResults} />
    </AuditProvider>
  );
};

const mockDesignSystemData = {
  rulesDefinitions: [],
  results: [],
  designSystem: {
    colors: {
      primary: { name: 'Primary', hexValue: '#FF6B6B' },
      secondary: { name: 'Secondary', hexValue: '#4ECDC4' }
    },
    text: {
      heading: {
        name: 'Heading',
        value: {
          fontFamily: 'Poppins',
          fontSize: 32,
          fontWeight: 700,
          lineHeight: '1.2'
        }
      },
      body: {
        name: 'Body',
        value: {
          fontFamily: 'Roboto',
          fontSize: 16,
          fontWeight: 400,
          lineHeight: '1.5'
        }
      }
    },
    strokes: [
      {
        name: 'Border',
        value: {
          colors: ['#000000'],
          strokeWeight: '2px'
        }
      }
    ]
  },
  localStyles: {},
  componentSuggestions: [],
  figmaAiDescription: ''
};

describe('DesignSystemViewer', () => {
  it('renders nothing with empty design system', () => {
    const { container } = renderWithDesignSystem();
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing with design system but no data', () => {
    const emptyData = {
      rulesDefinitions: [],
      results: [],
      designSystem: {},
      localStyles: {},
      componentSuggestions: [],
      figmaAiDescription: ''
    };
    const { container } = renderWithDesignSystem(emptyData);
    expect(container.firstChild).toBeNull();
  });

  it('renders main title when data exists', () => {
    renderWithDesignSystem(mockDesignSystemData);
    expect(screen.getByRole('heading', { name: /🎨 Design System/i })).toBeInTheDocument();
  });

  it('accordion is collapsed by default', () => {
    const { container } = renderWithDesignSystem(mockDesignSystemData);
    // L'accordéon devrait avoir max-h-0 et opacity-0 par défaut
    const accordionContent = container.querySelector('.max-h-0.opacity-0');
    expect(accordionContent).toBeInTheDocument();
  });

  it('expands accordion when clicked', async () => {
    const user = userEvent.setup();
    renderWithDesignSystem(mockDesignSystemData);

    // Trouver le bouton d'accordéon (avec le résumé)
    const accordionButton = screen.getByText(/2 styles de texte/).closest('button');
    if (accordionButton) {
      await user.click(accordionButton);
      // Les sections devraient être visibles
      expect(screen.getByText('Typographie')).toBeInTheDocument();
    }
  });

  it('displays color, text styles and stroke count in summary', () => {
    renderWithDesignSystem(mockDesignSystemData);
    expect(screen.getByText(/2 couleurs/)).toBeInTheDocument();
    expect(screen.getByText(/2 styles de texte/)).toBeInTheDocument();
    expect(screen.getByText(/1 contour/)).toBeInTheDocument();
  });
  it('renders color swatches after expanding', async () => {
    const user = userEvent.setup();
    renderWithDesignSystem(mockDesignSystemData);

    const accordionButton = screen.getByText(/2 styles de texte/).closest('button');
    if (accordionButton) {
      await user.click(accordionButton);
      expect(screen.getByText('Primary')).toBeInTheDocument();
      expect(screen.getByText('Secondary')).toBeInTheDocument();
    }
  });

  it('renders typography section after expanding', async () => {
    const user = userEvent.setup();
    renderWithDesignSystem(mockDesignSystemData);

    const accordionButton = screen.getByText(/2 styles de texte/).closest('button');
    if (accordionButton) {
      await user.click(accordionButton);
      expect(screen.getByText('Typographie')).toBeInTheDocument();
    }
  });

  it('changes selected color when color swatch clicked', async () => {
    const user = userEvent.setup();
    renderWithDesignSystem(mockDesignSystemData);

    const accordionButton = screen.getByText(/2 styles de texte/).closest('button');
    if (accordionButton) {
      await user.click(accordionButton);

      const primaryColor = screen.getByText('Primary').closest('button');
      if (primaryColor) {
        await user.click(primaryColor);
        // La couleur sélectionnée devrait changer (vérifiable via le style de la preview)
        expect(primaryColor).toBeInTheDocument();
      }
    }
  });

  it('renders text style selector buttons', async () => {
    const user = userEvent.setup();
    renderWithDesignSystem(mockDesignSystemData);

    const accordionButton = screen.getByText(/2 styles de texte/).closest('button');
    if (accordionButton) {
      await user.click(accordionButton);

      // Devrait avoir des boutons pour chaque taille de texte
      expect(screen.getByText(/Taille: 32px/)).toBeInTheDocument();
      expect(screen.getByText(/Taille: 16px/)).toBeInTheDocument();
    }
  });

  it('displays hex value for colors', async () => {
    const user = userEvent.setup();
    renderWithDesignSystem(mockDesignSystemData);

    const accordionButton = screen.getByText(/2 styles de texte/).closest('button');
    if (accordionButton) {
      await user.click(accordionButton);
      expect(screen.getByText('#FF6B6B')).toBeInTheDocument();
      expect(screen.getByText('#4ECDC4')).toBeInTheDocument();
    }
  });

  it('displays font properties for text styles', async () => {
    const user = userEvent.setup();
    renderWithDesignSystem(mockDesignSystemData);

    const accordionButton = screen.getByText(/2 styles de texte/).closest('button');
    if (accordionButton) {
      await user.click(accordionButton);
      // Vérifie que la police et la taille sont affichées
      expect(screen.getByText(/Poppins/)).toBeInTheDocument();
      expect(screen.getByText(/Taille: 32px/)).toBeInTheDocument();
    }
  });

  it('renders when only colors are present', () => {
    const onlyColorsData = {
      ...mockDesignSystemData,
      designSystem: {
        colors: mockDesignSystemData.designSystem.colors,
        text: {},
        strokes: []
      }
    };

    renderWithDesignSystem(onlyColorsData);
    expect(screen.getByRole('heading', { name: /🎨 Design System/i })).toBeInTheDocument();
  });

  it('renders when only text styles are present', () => {
    const onlyTextData = {
      ...mockDesignSystemData,
      designSystem: {
        colors: {},
        text: mockDesignSystemData.designSystem.text,
        strokes: []
      }
    };

    renderWithDesignSystem(onlyTextData);
    expect(screen.getByRole('heading', { name: /🎨 Design System/i })).toBeInTheDocument();
  });

  it('renders when only strokes are present', () => {
    const onlyStrokesData = {
      ...mockDesignSystemData,
      designSystem: {
        colors: {},
        text: {},
        strokes: mockDesignSystemData.designSystem.strokes
      }
    };

    renderWithDesignSystem(onlyStrokesData);
    expect(screen.getByRole('heading', { name: /🎨 Design System/i })).toBeInTheDocument();
  });
});
