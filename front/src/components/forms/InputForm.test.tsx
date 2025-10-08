import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InputForm from './InputForm';
import { AuditProvider } from '../../contexts/AuditContext';
import * as api from '../../utils/api';

// Mock du module api
vi.mock('../../utils/api', () => ({
  isValidFigmaUrl: vi.fn(),
  auditFigmaDesign: vi.fn()
}));

describe('InputForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.isValidFigmaUrl).mockReturnValue(false);
  });

  it('renders form with inputs and button', () => {
    render(
      <AuditProvider>
        <InputForm />
      </AuditProvider>
    );

    expect(screen.getByLabelText(/Lien Figma/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Clé API/)).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('disables submit button when URL is invalid', () => {
    vi.mocked(api.isValidFigmaUrl).mockReturnValue(false);

    render(
      <AuditProvider>
        <InputForm />
      </AuditProvider>
    );

    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('enables submit button when URL is valid', async () => {
    const user = userEvent.setup();
    vi.mocked(api.isValidFigmaUrl).mockReturnValue(true);

    render(
      <AuditProvider>
        <InputForm />
      </AuditProvider>
    );

    const urlInput = screen.getByLabelText(/Lien Figma/);
    await user.type(urlInput, 'https://www.figma.com/file/abc123');

    await waitFor(() => {
      expect(screen.getByRole('button')).not.toBeDisabled();
    });
  });

  it('calls auditFigmaDesign on form submit', async () => {
    const user = userEvent.setup();
    const mockResults = { rulesDefinitions: [], results: [] };

    vi.mocked(api.isValidFigmaUrl).mockReturnValue(true);
    vi.mocked(api.auditFigmaDesign).mockResolvedValue(mockResults);

    render(
      <AuditProvider>
        <InputForm />
      </AuditProvider>
    );

    const urlInput = screen.getByLabelText(/Lien Figma/);
    await user.type(urlInput, 'https://www.figma.com/file/abc123');

    const submitButton = screen.getByRole('button');
    await user.click(submitButton);

    await waitFor(() => {
      expect(api.auditFigmaDesign).toHaveBeenCalledWith(
        expect.objectContaining({
          figmaUrl: 'https://www.figma.com/file/abc123'
        })
      );
    });
  });

  it('submits form on Enter key press', async () => {
    const user = userEvent.setup();
    const mockResults = { rulesDefinitions: [], results: [] };

    vi.mocked(api.isValidFigmaUrl).mockReturnValue(true);
    vi.mocked(api.auditFigmaDesign).mockResolvedValue(mockResults);

    render(
      <AuditProvider>
        <InputForm />
      </AuditProvider>
    );

    const urlInput = screen.getByLabelText(/Lien Figma/);
    await user.type(urlInput, 'https://www.figma.com/file/abc123{Enter}');

    await waitFor(() => {
      expect(api.auditFigmaDesign).toHaveBeenCalled();
    });
  });

  it('disables inputs during loading', async () => {
    const user = userEvent.setup();
    vi.mocked(api.isValidFigmaUrl).mockReturnValue(true);
    vi.mocked(api.auditFigmaDesign).mockImplementation(() =>
      new Promise(resolve => setTimeout(resolve, 1000))
    );

    render(
      <AuditProvider>
        <InputForm />
      </AuditProvider>
    );

    const urlInput = screen.getByLabelText(/Lien Figma/) as HTMLInputElement;
    const apiKeyInput = screen.getByLabelText(/Clé API/) as HTMLInputElement;
    await user.type(urlInput, 'https://www.figma.com/file/abc123');

    const submitButton = screen.getByRole('button');
    await user.click(submitButton);

    await waitFor(() => {
      expect(urlInput.disabled).toBe(true);
      expect(apiKeyInput.disabled).toBe(true);
    });
  });
});
