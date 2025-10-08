import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import FigmaDescription from './FigmaDescription';

describe('FigmaDescription', () => {
  it('renders with default title', () => {
    render(<FigmaDescription />);

    expect(screen.getByText('Description de la maquette')).toBeInTheDocument();
  });

  it('renders with custom title', () => {
    render(<FigmaDescription title="Mon titre personnalisé" />);

    expect(screen.getByText('Mon titre personnalisé')).toBeInTheDocument();
  });

  it('renders empty state when no description provided', () => {
    render(<FigmaDescription />);

    expect(screen.getByText('Aucune description disponible')).toBeInTheDocument();
  });

  it('renders description text when provided', () => {
    render(<FigmaDescription description="Ceci est une description simple" />);

    expect(screen.getByText(/Ceci est une description simple/)).toBeInTheDocument();
  });

  it('renders markdown content', () => {
    const markdownDescription = '**Texte en gras** et *texte en italique*';
    render(<FigmaDescription description={markdownDescription} />);

    expect(screen.getByText(/Texte en gras/)).toBeInTheDocument();
    expect(screen.getByText(/texte en italique/)).toBeInTheDocument();
  });
});
