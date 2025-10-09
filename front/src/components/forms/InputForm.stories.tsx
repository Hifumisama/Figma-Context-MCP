import type { Meta, StoryObj } from '@storybook/react';
import InputForm from './InputForm';
import { AuditProvider } from '../../contexts/AuditContext';

// Wrapper to provide context
const InputFormWithContext = () => {
  return (
    <div className="min-h-screen bg-figma-background p-8">
      <AuditProvider>
        <InputForm />
      </AuditProvider>
    </div>
  );
};

const meta = {
  title: 'Forms/InputForm',
  component: InputFormWithContext,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Formulaire de saisie pour lancer un audit Figma. Permet de renseigner l\'URL du fichier Figma et la clé API pour l\'authentification. Valide les entrées et gère la soumission.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof InputFormWithContext>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithMockData: Story = {
  decorators: [
    (Story) => {
      // Pre-fill form with mock data
      setTimeout(() => {
        const urlInput = document.querySelector('#figma-url') as HTMLInputElement;
        const apiKeyInput = document.querySelector('#figma-api-key') as HTMLInputElement;

        if (urlInput) urlInput.value = 'https://www.figma.com/design/abc123/My-Design';
        if (apiKeyInput) apiKeyInput.value = 'figd_mock_api_key_1234567890';
      }, 100);

      return <Story />;
    },
  ],
};
