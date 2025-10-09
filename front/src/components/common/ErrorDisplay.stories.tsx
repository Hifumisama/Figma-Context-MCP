import type { Meta, StoryObj } from '@storybook/react';
import { useEffect } from 'react';
import ErrorDisplay from './ErrorDisplay';
import { AuditProvider, useAudit } from '../../contexts/AuditContext';
import { ApiError } from '../../utils/api';

// Wrapper component to provide context
const ErrorDisplayContent = ({ errorType = 'unknown' }: { errorType?: string }) => {
  const { setError } = useAudit();

  useEffect(() => {
    let error: Error | ApiError | string;

    switch (errorType) {
      case '400':
        error = new ApiError(400, 'Invalid request', 'URL Figma invalide');
        break;
      case '401':
        error = new ApiError(401, 'Unauthorized', 'Accès refusé');
        break;
      case '500':
        error = new ApiError(500, 'Internal server error', 'Erreur serveur');
        break;
      case 'network':
        error = new Error('Network error');
        break;
      case 'string':
        error = 'Une erreur s\'est produite';
        break;
      case 'unknown':
      default:
        error = new Error('Unknown error');
    }

    setError(error);
  }, [errorType, setError]);

  return <ErrorDisplay />;
};

const ErrorDisplayWithContext = ({ errorType = 'unknown' }: { errorType?: string }) => {
  return (
    <div className="min-h-screen bg-figma-background p-8">
      <AuditProvider>
        <ErrorDisplayContent errorType={errorType} />
      </AuditProvider>
    </div>
  );
};

const meta = {
  title: 'Common/ErrorDisplay',
  component: ErrorDisplayWithContext,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Affichage d\'erreur contextuel avec icône, message, suggestions et actions de récupération. Supporte les erreurs API (400, 401, 500) et les erreurs génériques.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    errorType: {
      control: { type: 'select' },
      options: ['400', '401', '500', 'network', 'string', 'unknown'],
      description: 'Type d\'erreur à afficher',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'unknown' },
      },
    },
  },
  args: {
    errorType: 'unknown',
  },
} satisfies Meta<typeof ErrorDisplayWithContext>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BadRequest400: Story = {
  args: {
    errorType: '400',
  },
};

export const Unauthorized401: Story = {
  args: {
    errorType: '401',
  },
};

export const InternalServerError500: Story = {
  args: {
    errorType: '500',
  },
};

export const NetworkError: Story = {
  args: {
    errorType: 'network',
  },
};

export const StringError: Story = {
  args: {
    errorType: 'string',
  },
};

export const UnknownError: Story = {
  args: {
    errorType: 'unknown',
  },
};
