import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RuleBadge from './RuleBadge';
import { AuditProvider } from '../contexts/AuditContext';

// Helper pour rendre RuleBadge avec contexte
const renderWithContext = (props: any) => {
  return render(
    <AuditProvider>
      <RuleBadge {...props} />
    </AuditProvider>
  );
};

describe('RuleBadge', () => {
  it('renders with fallback name when rule not found', () => {
    renderWithContext({ ruleId: 999 });

    expect(screen.getByText(/Règle #999/)).toBeInTheDocument();
  });

  it('renders with active state', () => {
    renderWithContext({ ruleId: 1, isActive: true });

    const badge = screen.getByRole('button');
    expect(badge).toHaveClass('ring-2');
  });

  it('renders without active state by default', () => {
    renderWithContext({ ruleId: 1 });

    const badge = screen.getByRole('button');
    expect(badge).not.toHaveClass('ring-2');
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    renderWithContext({ ruleId: 1, onClick: handleClick });

    const badge = screen.getByRole('button');
    await user.click(badge);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
