import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders with default message and subtext', () => {
    render(<LoadingSpinner />);

    expect(screen.getByText('Audit en cours...')).toBeInTheDocument();
    expect(screen.getByText('Analyse de votre design Figma en cours, veuillez patienter.')).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    render(<LoadingSpinner message="Chargement personnalisé" />);

    expect(screen.getByText('Chargement personnalisé')).toBeInTheDocument();
  });

  it('renders with custom subtext', () => {
    render(<LoadingSpinner subtext="Un instant s'il vous plaît" />);

    expect(screen.getByText("Un instant s'il vous plaît")).toBeInTheDocument();
  });

  it('renders with custom message and subtext', () => {
    render(
      <LoadingSpinner
        message="Traitement en cours"
        subtext="Veuillez patienter quelques instants"
      />
    );

    expect(screen.getByText('Traitement en cours')).toBeInTheDocument();
    expect(screen.getByText('Veuillez patienter quelques instants')).toBeInTheDocument();
  });
});
