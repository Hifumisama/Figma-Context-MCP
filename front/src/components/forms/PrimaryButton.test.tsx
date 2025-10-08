import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PrimaryButton from './PrimaryButton';

describe('PrimaryButton', () => {
  it('renders with default and custom text', () => {
    const { rerender } = render(<PrimaryButton />);

    expect(screen.getByText("🔍 Lancer l'audit")).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');

    rerender(<PrimaryButton text="Bouton personnalisé" />);
    expect(screen.getByText('Bouton personnalisé')).toBeInTheDocument();
  });

  it('renders loading state with spinner and disabled', () => {
    const { container, rerender } = render(<PrimaryButton isLoading={true} />);

    const button = screen.getByRole('button');
    expect(screen.getByText('⏳ Audit en cours...')).toBeInTheDocument();
    expect(button).toBeDisabled();
    expect(button).toHaveClass('cursor-not-allowed');
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();

    rerender(<PrimaryButton isLoading={true} loadingText="Chargement..." />);
    expect(screen.getByText('Chargement...')).toBeInTheDocument();
  });

  it('handles disabled state when canSubmit is false', () => {
    render(<PrimaryButton canSubmit={false} />);

    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('handles button type attribute', () => {
    const { rerender } = render(<PrimaryButton type="button" />);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');

    rerender(<PrimaryButton type="reset" />);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'reset');
  });

  it('handles onClick events', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    const { rerender } = render(<PrimaryButton onClick={handleClick} />);
    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);

    rerender(<PrimaryButton canSubmit={false} onClick={handleClick} />);
    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1); // Still 1, not called again
  });
});
