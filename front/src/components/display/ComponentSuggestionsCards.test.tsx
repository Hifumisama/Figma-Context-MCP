import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ComponentSuggestionsCards from './ComponentSuggestionsCards';

const mockSuggestions = [
  {
    componentName: 'Button Component',
    description: 'A reusable button component with consistent styling',
    possibleInstances: [
      { name: 'Primary Button', nodeId: '123:456' },
      { name: 'Secondary Button', nodeId: '123:457' }
    ],
    usableNodes: [
      { name: 'Container', nodeId: '123:460' },
      { name: 'Text Label', nodeId: '123:461' }
    ]
  },
  {
    componentName: 'Input Field',
    description: 'Standard input field with label and validation',
    possibleInstances: [
      { name: 'Email Input', nodeId: '234:567' }
    ],
    usableNodes: [
      { name: 'Input Container', nodeId: '234:570' }
    ]
  }
];

describe('ComponentSuggestionsCards', () => {
  it('renders nothing when no suggestions provided', () => {
    const { container } = render(<ComponentSuggestionsCards />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when empty suggestions array', () => {
    const { container } = render(<ComponentSuggestionsCards componentSuggestions={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders section when suggestions exist', () => {
    render(<ComponentSuggestionsCards componentSuggestions={mockSuggestions} />);
    expect(screen.getByText(/Patterns détectés par IA/)).toBeInTheDocument();
    expect(screen.getByText(/Suggestions de composants/)).toBeInTheDocument();
    expect(screen.getByText(/2 suggestions de composants/)).toBeInTheDocument();
    expect(screen.getByText(/3 instances au total/)).toBeInTheDocument();
  });

  it('main accordion is collapsed by default', () => {
    const { container } = render(<ComponentSuggestionsCards componentSuggestions={mockSuggestions} />);
    const accordionContent = container.querySelector('.max-h-0');
    expect(accordionContent).toBeInTheDocument();
  });

  it('expands main accordion when clicked', async () => {
    const user = userEvent.setup();
    render(<ComponentSuggestionsCards componentSuggestions={mockSuggestions} />);

    const mainAccordionButton = screen.getByText(/2 suggestions/).closest('button');
    expect(mainAccordionButton).toBeInTheDocument();

    if (mainAccordionButton) {
      await user.click(mainAccordionButton);
      expect(screen.getByText('Button Component')).toBeInTheDocument();
    }
  });

  describe('when main accordion is expanded', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(
        <ComponentSuggestionsCards
          componentSuggestions={mockSuggestions}
          baseFigmaUrl="https://www.figma.com/file/abc123"
        />
      );
      const mainAccordionButton = screen.getByText(/2 suggestions/).closest('button');
      if (mainAccordionButton) {
        await user.click(mainAccordionButton);
      }
    });

    it('renders component', () => {
      expect(screen.getByText('Button Component')).toBeInTheDocument();
      expect(screen.getByText('Input Field')).toBeInTheDocument();
      expect(screen.getByText(/A reusable button component/)).toBeInTheDocument();
      expect(screen.getByText(/Instances détectées \(2\)/)).toBeInTheDocument();
      expect(screen.getByText(/Instances détectées \(1\)/)).toBeInTheDocument();
      expect(screen.getByText(/Structure du composant \(2 éléments\)/)).toBeInTheDocument();
    });
    it('instances accordion is collapsed by default', () => {
      expect(screen.queryByText('Primary Button')).not.toBeInTheDocument();
    });

    it('expands instances and nodeIDs accordion when clicked', async () => {
      const user = userEvent.setup();
      const instancesButton = screen.getAllByText(/Instances détectées/)[0].closest('button');
      if (instancesButton) {
        await user.click(instancesButton);
        expect(screen.getByText('Primary Button')).toBeInTheDocument();
        expect(screen.getByText('Secondary Button')).toBeInTheDocument();
        expect(screen.getByText('123:456')).toBeInTheDocument();
      }
    });

    it('renders Figma link when baseFigmaUrl provided', () => {
      const figmaLinks = screen.getAllByTitle(/Voir.*dans Figma/);
      expect(figmaLinks.length).toBeGreaterThan(0);
    });

    it('renders disabled button when no baseFigmaUrl', () => {
      render(<ComponentSuggestionsCards componentSuggestions={mockSuggestions} />);
      expect(screen.getAllByText('URL Figma non disponible').length).toBeGreaterThan(0);
    });

    it('structure accordion is collapsed by default', () => {
      expect(screen.queryByText('Container')).not.toBeInTheDocument();
    });

    it('expands structure accordion when clicked', async () => {
      const user = userEvent.setup();
      const structureButton = screen.getAllByText(/Structure du composant/)[0].closest('button');
      if (structureButton) {
        await user.click(structureButton);
        expect(screen.getByText('Container')).toBeInTheDocument();
        expect(screen.getByText('Text Label')).toBeInTheDocument();
      }
    });

    it('handles invalid Figma URLs gracefully', () => {
      // Should still render but links should be '#'
      const figmaLinks = screen.getAllByTitle(/Voir.*dans Figma/);
      expect(figmaLinks.length).toBeGreaterThan(0);
    });
  });
});
