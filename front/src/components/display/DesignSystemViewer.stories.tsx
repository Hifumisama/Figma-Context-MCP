import type { Meta, StoryObj } from '@storybook/react';
import { useEffect } from 'react';
import DesignSystemViewer from './DesignSystemViewer';
import { AuditProvider, useAudit } from '../../contexts/AuditContext';

// Mock design system data based on real API format
const mockDesignSystemComplete = {
  text: {
    '126:18': {
      name: 'Texte qui super styley',
      value: {
        fontFamily: 'Poppins',
        fontWeight: 600,
        fontSize: 24,
        lineHeight: '1.5em',
        textAlignHorizontal: 'LEFT',
        textAlignVertical: 'TOP',
      },
    },
    '126:19': {
      name: 'Heading/H1',
      value: {
        fontFamily: 'Inter',
        fontWeight: 700,
        fontSize: 36,
        lineHeight: '1.2em',
        textAlignHorizontal: 'LEFT',
        textAlignVertical: 'TOP',
      },
    },
    '126:20': {
      name: 'Body/Regular',
      value: {
        fontFamily: 'Inter',
        fontWeight: 400,
        fontSize: 16,
        lineHeight: '1.5em',
        textAlignHorizontal: 'LEFT',
        textAlignVertical: 'TOP',
      },
    },
  },
  strokes: {
    '2:106': {
      name: 'Dark Blue',
      value: {
        colors: ['#03045E'],
        strokeWeight: '1px',
      },
    },
    '2:107': {
      name: 'Dark Brown',
      value: {
        colors: ['#474306'],
        strokeWeight: '1px',
      },
    },
  },
  layout: {},
  colors: {
    '2:109': {
      name: 'Light Yellow',
      hexValue: '#FBF8CC',
    },
    '2:106': {
      name: 'Dark Blue',
      hexValue: '#03045E',
    },
    '2:108': {
      name: 'Yellow',
      hexValue: '#F5EE84',
    },
    '2:110': {
      name: 'Too Light Yellow',
      hexValue: '#F7F197',
    },
    '2:107': {
      name: 'Dark Brown',
      hexValue: '#474306',
    },
  },
};

const mockLocalStyles = {
  text: {
    t1: {
      fontFamily: 'Poppins',
      fontWeight: 500,
      fontSize: 28,
      lineHeight: '1.5em',
      textAlignHorizontal: 'LEFT',
      textAlignVertical: 'TOP',
    },
    t2: {
      fontFamily: 'Poppins',
      fontWeight: 400,
      fontSize: 24,
      lineHeight: '1.8333333333333333em',
      textAlignHorizontal: 'LEFT',
      textAlignVertical: 'TOP',
    },
  },
  strokes: {
    s1: {
      colors: ['#000000'],
      strokeWeight: '1px',
    },
    s2: {
      colors: ['#7B61FF'],
      strokeWeight: '1px',
      strokeDashes: [10, 5],
    },
  },
  layout: {},
  colors: {
    c1: {
      name: '#FFFFFF',
      hexValue: '#FFFFFF',
    },
    c2: {
      name: '#F5EE84',
      hexValue: '#F5EE84',
    },
    c3: {
      name: '#000000',
      hexValue: '#000000',
    },
  },
};

const DesignSystemViewerContent = ({ designSystem, localStyles }: any) => {
  const { setResults } = useAudit();
  
  useEffect(() => {
    if (designSystem || localStyles) {
      setResults({
        rulesDefinitions: [],
        results: [],
        designSystem,
        localStyles,
      });
    }
  }, [designSystem, localStyles, setResults]);

  return <DesignSystemViewer />;
};

const DesignSystemViewerWithContext = ({ designSystem, localStyles }: any) => {
  return (
    <div className="min-h-screen bg-figma-background p-8">
      <AuditProvider>
        <DesignSystemViewerContent designSystem={designSystem} localStyles={localStyles} />
      </AuditProvider>
    </div>
  );
};

const meta = {
  title: 'Display/DesignSystemViewer',
  component: DesignSystemViewerWithContext,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Visualiseur interactif du design system extrait du fichier Figma. Affiche les typographies, couleurs et contours avec prévisualisations.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    designSystem: {
      control: 'object',
      description: 'Design system extrait avec text, colors et strokes',
      table: {
        type: { summary: 'DesignSystem' },
      },
    },
    localStyles: {
      control: 'object',
      description: 'Styles locaux (non design system) détectés',
      table: {
        type: { summary: 'LocalStyles' },
      },
    },
  },
} satisfies Meta<typeof DesignSystemViewerWithContext>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Complete: Story = {
  args: {
    designSystem: mockDesignSystemComplete,
    localStyles: mockLocalStyles,
  },
};

export const OnlyDesignSystem: Story = {
  args: {
    designSystem: mockDesignSystemComplete,
    localStyles: {
      text: {},
      colors: {},
      strokes: {},
      layout: {},
    },
  },
};

export const OnlyColors: Story = {
  args: {
    designSystem: {
      text: {},
      colors: mockDesignSystemComplete.colors,
      strokes: {},
      layout: {},
    },
    localStyles: {
      text: {},
      colors: {},
      strokes: {},
      layout: {},
    },
  },
};

export const OnlyTypography: Story = {
  args: {
    designSystem: {
      text: mockDesignSystemComplete.text,
      colors: {},
      strokes: {},
      layout: {},
    },
    localStyles: {
      text: {},
      colors: {},
      strokes: {},
      layout: {},
    },
  },
};

export const OnlyStrokes: Story = {
  args: {
    designSystem: {
      text: {},
      colors: {},
      strokes: mockDesignSystemComplete.strokes,
      layout: {},
    },
    localStyles: {
      text: {},
      colors: {},
      strokes: {},
      layout: {},
    },
  },
};

export const MinimalTypography: Story = {
  args: {
    designSystem: {
      text: {
        '1:1': {
          name: 'Body',
          value: {
            fontFamily: 'Roboto',
            fontSize: 16,
            fontWeight: 400,
            lineHeight: '1.5em',
            textAlignHorizontal: 'LEFT',
            textAlignVertical: 'TOP',
          },
        },
      },
      colors: {},
      strokes: {},
      layout: {},
    },
    localStyles: {
      text: {},
      colors: {},
      strokes: {},
      layout: {},
    },
  },
};

export const MinimalColors: Story = {
  args: {
    designSystem: {
      text: {},
      colors: {
        '1:1': {
          name: 'Primary',
          hexValue: '#667eea',
        },
        '1:2': {
          name: 'Secondary',
          hexValue: '#10B981',
        },
      },
      strokes: {},
      layout: {},
    },
    localStyles: {
      text: {},
      colors: {},
      strokes: {},
      layout: {},
    },
  },
};

export const OnlyLocalStyles: Story = {
  args: {
    designSystem: {
      text: {},
      colors: {},
      strokes: {},
      layout: {},
    },
    localStyles: mockLocalStyles,
  },
};

export const ManyColors: Story = {
  args: {
    designSystem: {
      text: {},
      colors: Object.fromEntries(
        Array.from({ length: 20 }, (_, i) => [
          `${i}:${i}`,
          {
            name: `Color ${i + 1}`,
            hexValue: `#${Math.floor(Math.random() * 16777215)
              .toString(16)
              .padStart(6, '0')}`,
          },
        ])
      ),
      strokes: {},
      layout: {},
    },
    localStyles: {
      text: {},
      colors: {},
      strokes: {},
      layout: {},
    },
  },
};

export const Empty: Story = {
  args: {
    designSystem: {
      text: {},
      colors: {},
      strokes: {},
      layout: {},
    },
    localStyles: {
      text: {},
      colors: {},
      strokes: {},
      layout: {},
    },
  },
};
