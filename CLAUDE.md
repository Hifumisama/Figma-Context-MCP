# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**FigmAudit** is a full-stack TypeScript project for analyzing and auditing Figma design files. It consists of two main parts:

- **Backend** (`back/`): TypeScript MCP (Model Context Protocol) server with REST API
  - Provides 4 MCP tools for Claude Code/Desktop integration
  - Exposes REST API endpoints for web clients
  - Runs in two modes: stdio (MCP) or HTTP (API)

- **Frontend** (`front/`): React + TypeScript web application
  - Interactive UI for auditing Figma files
  - Visualizes audit results with charts and tables
  - Connected to backend via REST API

The project is a **monorepo** where each part is independent but complementary.

## Common Development Commands

### Workspace Commands (from root)

These commands manage both backend and frontend from the project root:

```bash
# Installation
pnpm install:all              # Install dependencies for both back and front

# Build
pnpm build:back               # Build backend only
pnpm build:front              # Build frontend only

# Development
pnpm dev:back                 # Start backend in watch mode
pnpm dev:front                # Start frontend dev server

# Testing
pnpm test:back                # Run backend tests (Jest)
pnpm test:front               # Run frontend tests (Vitest)

# Code Quality
pnpm lint:back                # Lint backend
pnpm lint:front               # Lint frontend
```

### Backend Commands (from `back/`)

```bash
# Build and Development
pnpm build                    # Build TypeScript to JavaScript
pnpm dev                      # Development mode with watch (HTTP mode)
pnpm dev:cli                  # Development mode with CLI stdio interface
pnpm type-check               # Run TypeScript type checking without emitting files

# Testing
pnpm test                     # Run Jest test suite
pnpm test:watch               # Run tests in watch mode

# Code Quality
pnpm lint                     # Run ESLint for code linting
pnpm format                   # Format code with Prettier

# Running the Server
pnpm start                    # Start the built server (HTTP mode by default)
pnpm start:cli                # Start in CLI stdio mode for MCP clients
pnpm start:http               # Start in HTTP mode

# Debugging and Inspection
pnpm inspect                  # Use MCP inspector tool to debug MCP connections
```

### Frontend Commands (from `front/`)

```bash
# Build and Development
pnpm dev                      # Start Vite dev server (http://localhost:5173)
pnpm build                    # Build for production
pnpm preview                  # Preview production build locally
pnpm type-check               # Run TypeScript type checking

# Testing
pnpm test                     # Run Vitest test suite
pnpm test:ui                  # Run tests with UI
pnpm test:watch               # Run tests in watch mode
pnpm test:coverage            # Generate coverage report

# Code Quality
pnpm lint                     # Run ESLint
pnpm format                   # Format code with Prettier

# Documentation
pnpm storybook                # Start Storybook (http://localhost:6006)
pnpm build-storybook          # Build Storybook for deployment
```

## Architecture Overview

### Project Structure

```
.
├── back/                    # Backend MCP Server
├── front/                   # Frontend React App
├── CLAUDE.md               # This file (guidelines for Claude Code)
├── README.md               # Main project documentation
└── package.json            # Workspace scripts
```

### Backend Core Components (`back/`)

1. **MCP Server** (`src/mcp/index.ts`) - Main server that registers and handles MCP tools
2. **CLI Entry Point** (`src/cli.ts`) - Command-line interface that can run in stdio or HTTP mode
3. **HTTP Server** (`src/server.ts`) - Express server for HTTP API endpoints
4. **Figma Service** (`src/services/figma.ts`) - Service layer for interacting with Figma REST API

### Frontend Core Components (`front/`)

1. **App Component** (`src/App.tsx`) - Root component managing the main layout
2. **Audit Context** (`src/contexts/AuditContext.tsx`) - Global state management for audit data
3. **Components** (`src/components/`) - Reusable React components organized by category:
   - `common/` - Shared components (LoadingSpinner, ErrorDisplay)
   - `display/` - Data display components (StatsCards, DetailedTables)
   - `forms/` - Form components (InputForm, PrimaryButton)
4. **API Client** (`src/utils/api.ts`) - HTTP client for backend communication

### MCP Tools

The server provides 4 main MCP tools located in `src/mcp/tools/`:

1. **get_figma_data** - Comprehensive Figma file data extraction with layout, content, visuals, and components
2. **get_figma_context** - Simplified Figma data extraction for specific contexts (file, page, or node)
3. **audit_figma_design** - Analyzes Figma designs against best practices and generates reports
4. **download_figma_images** - Downloads SVG and PNG images from Figma files (can be disabled)

### Flexible Extractor System

The project uses a modular extractor system (`src/extractors/`) that allows for efficient, single-pass data extraction:

- **Individual Extractors**: `layoutExtractor`, `textExtractor`, `visualsExtractor`, `componentExtractor`
- **Predefined Combinations**: `allExtractors`, `layoutAndText`, `contentOnly`, `visualsOnly`, `layoutOnly`
- **Custom Extractors**: Easy to create domain-specific extraction logic

### Data Transformation

Transformers in `src/transformers/` handle conversion of raw Figma API data:
- `layout.ts` - Position, sizing, and flex properties
- `text.ts` - Text content and typography 
- `style.ts` - Fills, strokes, and visual styles
- `effects.ts` - Shadows, blurs, and other effects
- `component.ts` - Component instances and definitions

## Environment Configuration

### Required Environment Variables

Either `FIGMA_API_KEY` or `FIGMA_OAUTH_TOKEN` is required:

```bash
# Personal Access Token (recommended for development)
FIGMA_API_KEY=your_figma_personal_access_token

# OR OAuth Bearer Token (for production apps)  
FIGMA_OAUTH_TOKEN=your_figma_oauth_token

# Optional configuration
PORT=3333                    # HTTP server port (default: 3333)
OUTPUT_FORMAT=json           # Tool output format: "json" or "yaml" (default: json)
SKIP_IMAGE_DOWNLOADS=false   # Disable image download tool (default: false)
ENABLE_AI_RULES=false        # Enable AI-based audit rules (default: false)

# LLM Configuration (for AI-based rules) - Uses Google Cloud Vertex AI
GOOGLE_CLOUD_PROJECT=your_project_id     # Required: Google Cloud Project ID
GOOGLE_CLOUD_LOCATION=us-central1        # Optional: Vertex AI region (default: us-central1)
LLM_MODEL=gemini-2.0-flash-exp           # LLM model to use (default: gemini-2.0-flash-exp)
LLM_MAX_TOKENS=8192                      # Maximum tokens for LLM responses (default: 8192)
LLM_TEMPERATURE=0.9                      # LLM temperature (default: 0.9)

# Authentication: Application Default Credentials (ADC)
# The project uses ADC exclusively for Google Cloud authentication.
# Configure ADC by logging in with gcloud:
#   gcloud auth application-default login
#
# In production (Cloud Run), ADC automatically uses the service account
# of the runtime environment (metadata service)
```

### CLI Arguments

All environment variables can be overridden with CLI arguments:
- `--figma-api-key`
- `--figma-oauth-token`
- `--port`
- `--json` (sets OUTPUT_FORMAT to json)
- `--skip-image-downloads`
- `--enable-ai-rules`
- `--google-cloud-project` (Google Cloud Project ID)
- `--google-cloud-location` (Vertex AI region)
- `--env path/to/custom/.env`

**Note**: Authentication uses ADC (Application Default Credentials) exclusively. Configure it with `gcloud auth application-default login`.

## Typical Workflows

As an expert on this project, you can handle both backend and frontend features, as well as bugfixes. The workflow depends on the type of feature being developed.

### Backend-First Features

For features that start with backend changes (e.g., new audit rules, MCP tools, API endpoints):

1. **Backend Implementation**
   ```bash
   cd back

   # Create the feature (e.g., new audit rule)
   # - Add rule in src/mcp/tools/audit-figma-design/rules/
   # - Register in rules-registry.ts
   # - Write tests

   pnpm test           # Run tests
   pnpm build          # Build
   pnpm start          # Start server
   ```

2. **Frontend Integration** (if needed)
   ```bash
   cd ../front

   # Create component to display the new data
   # - Add component in src/components/display/
   # - Create tests and stories
   # - Update AuditContext if needed

   pnpm test           # Run tests
   pnpm storybook      # Verify in Storybook
   pnpm dev            # Test full integration
   ```

### Frontend-Only Features

For features that only affect the UI (e.g., new visualizations, UI improvements):

```bash
cd front

# Create the component
# - Add in src/components/
# - Create ComponentName.tsx
# - Create ComponentName.test.tsx
# - Create ComponentName.stories.tsx

pnpm test           # Run tests
pnpm storybook      # Verify in Storybook
pnpm dev            # Test in dev server
```

### Fullstack Features

For features that require both backend and frontend changes:

```bash
# Terminal 1: Backend
cd back
# Implement backend changes
pnpm build && pnpm start

# Terminal 2: Frontend
cd front
# Implement frontend changes
pnpm dev

# Test the full integration at http://localhost:5173
```

### Bugfix Workflow

1. **Identify the bug location** (backend or frontend)
2. **Write a failing test** that reproduces the bug
3. **Fix the bug**
4. **Verify the test passes**
5. **Run the full test suite** to ensure no regressions

```bash
# Backend bugfix
cd back
pnpm test           # Should fail initially
# Fix the bug
pnpm test           # Should pass now

# Frontend bugfix
cd front
pnpm test           # Should fail initially
# Fix the bug
pnpm test           # Should pass now
```

## Testing and Development

### Running Tests
The project uses Jest with TypeScript support. Test configuration is in `jest.config.js`.

### Development Mode
- Use `pnpm dev` for stdio mode development with auto-rebuild
- Use `pnpm dev:cli` for CLI interface development
- The development server automatically rebuilds on file changes

### Adding New Tools
1. Create tool file in `src/mcp/tools/`
2. Export tool definition with `name`, `description`, `parameters`, and `handler`
3. Register tool in `src/mcp/index.ts` `registerTools()` function
4. Add export to `src/mcp/tools/index.ts`

## Deployment

### Docker
The project includes a multi-stage Dockerfile optimized for production:
- Build stage compiles TypeScript
- Production stage runs with minimal Node.js image
- Configured for Google Cloud Run deployment

### Cloud Run
- `cloudbuild.yaml` defines the Cloud Build pipeline
- Default port is 8080 in production
- Environment variables injected at runtime

#### Automatic Deployment
The project uses Cloud Build triggers for automatic deployment when pushing to the repository.

#### Manual Deployment (if needed)
For manual deployment to Google Cloud Run, use the following command:

```bash
gcloud builds submit --config cloudbuild.yaml --substitutions=COMMIT_SHA='latest' --region=europe-west9 .
```

**Note**: Manual deployment is typically not necessary as Cloud Build triggers handle automatic deployment on code changes.

## REST API Endpoints

In addition to MCP tools, the server provides REST API endpoints when running in HTTP mode:

### POST /api/audit-figma
Direct REST API for auditing Figma designs without MCP protocol.

**Request Body:**
```json
{
  "figmaUrl": "https://www.figma.com/file/...",
  "figmaApiKey": "your_api_key_here", // Optional for public files
  "outputFormat": "json" // or "markdown" (default)
}
```

**Response:**
- **Success (200)**: Returns audit results in specified format
- **Error (400)**: Invalid figmaUrl parameter
- **Error (401)**: Access denied (private file without valid API key)  
- **Error (500)**: Server processing error

**Features:**
- Works with public Figma files (no API key required)
- Handles private files with valid API key
- Automatic error handling with helpful messages
- Returns structured audit reports

## Figma Design Audit Rules

The audit tool analyzes Figma designs against these best practices:

### Core Audit Rules

1. **Auto Layout Usage** (`check-auto-layout-usage.ts`)
   - Identifies containers with multiple children that don't use Auto Layout
   - Suggests converting frames/groups for better responsive design
   - Critical for maintainable and scalable layouts

2. **Layer Naming** (`check-layer-naming.ts`) 
   - Detects default Figma names (e.g., "Frame 123", "Rectangle 45")
   - Uses regex pattern: `/^(Frame|Group|Rectangle|Ellipse|Vector|Line|Slice|Component) \d+$/`
   - Essential for design-developer collaboration

3. **Detached Styles** (`check-detached-styles.ts`)
   - Finds elements using inline styles instead of design system tokens
   - Checks fills, strokes, and text styles for raw values vs. style references
   - Promotes design system consistency

4. **Export Settings** (`check-export-settings.ts`)
   - Identifies potential assets (VECTOR, IMAGE-SVG types) missing export configuration
   - Checks nodes with "icon" in name or image fills
   - Crucial for developer handoff workflow

5. **Hidden Layers** (`check-hidden-layers.ts`)
   - Detects layers with visibility set to false
   - Helps clean up design files and reduce complexity

6. **Group vs Frame Usage** (`check-group-vs-frame.ts`)
   - Identifies inappropriate use of groups instead of frames
   - Promotes proper layout container usage

### AI-Enhanced Rules (Optional)

7. **Component Candidates** (`find-component-candidates.ts`) 🤖 *AI-Ready*
   - **Current**: Finds nodes with similar structural signatures and dimensions
   - **Future AI Enhancement**: Will use AI to detect complex patterns and suggest componentization strategies
   - Generates structural signatures like: `FRAME(RECTANGLE,TEXT,TEXT)[FONT(Poppins,12,400);FONT(Roboto,14,700)]`
   - Groups nodes by signature and similar dimensions (±20% tolerance)

8. **Color Naming** (`check-color-names.ts`) 🤖 *AI-Active*
   - Uses Google Gemini 2.0 Flash to analyze color style naming conventions  
   - Identifies literal names (e.g., "Blue", "red-500") vs. semantic names (e.g., "primary-500", "text-danger")
   - Provides semantic suggestions for literal color names
   - Requires `--enable-ai-rules` flag or `ENABLE_AI_RULES=true` and Vertex AI configuration

### Rule Configuration

Rules can be enabled/disabled and configured in the audit tool. AI-based rules are disabled by default for performance and cost considerations.

**Rule Categories:**
- **Standard Rules (1-6)**: Always active, use pattern matching and structural analysis
- **AI-Ready Rules (7)**: Currently use algorithmic detection, designed for future AI enhancement
- **AI-Active Rules (8)**: Currently use AI prompts, require `--enable-ai-rules` flag

**Implementation Details:**
- **Component Candidates** uses structural signature matching: `generateSignature()` creates patterns like `FRAME(RECTANGLE,TEXT)[FONT(family,size,weight)]`
- **Color Naming** uses Google Gemini 2.0 Flash to analyze color style naming conventions and provide semantic suggestions

## Package Management

Uses **pnpm** as the package manager. Key dependencies:
- `@modelcontextprotocol/sdk` - MCP protocol implementation
- `@figma/rest-api-spec` - Figma API types
- `@google-cloud/vertexai` - Google Cloud Vertex AI SDK for LLM functionality
- `google-auth-library` - Google Cloud authentication (OAuth2, Service Account, ADC)
- `express` - HTTP server framework
- `zod` - Schema validation
- `sharp` - Image processing

## LLM Service Migration

The project has been migrated from the deprecated `@google/generative-ai` package to Google Cloud Vertex AI:

### What Changed
- **Before**: Used Google AI Studio API with direct API key authentication
- **After**: Uses Google Cloud Vertex AI with OAuth2/Service Account authentication
- **Benefits**: Better security, enterprise-grade authentication, and long-term support

### Authentication Method
The project uses **Application Default Credentials (ADC)** exclusively for Google Cloud authentication:
- **Local development**: Configure with `gcloud auth application-default login`
- **Production (Cloud Run)**: Automatically uses the service account of the runtime environment

---

## Frontend Development Guidelines

This section provides comprehensive guidelines for developing React components in the frontend application.

### Naming Conventions

**Files and Components**
- React components: `PascalCase` (e.g., `StatsCards.tsx`, `InputForm.tsx`)
- Utilities: `camelCase` (e.g., `api.ts`, `formatters.ts`)
- Contexts: suffix `Context` (e.g., `AuditContext.tsx`)
- Types: `camelCase` (e.g., `audit.ts`, `common.ts`)

**Component Structure**

Each component follows this organization:
```
ComponentName.tsx         # Main component
ComponentName.test.tsx    # Unit tests (Vitest)
ComponentName.stories.tsx # Storybook documentation
```

### Import Organization

Always structure imports in this order:

```typescript
// 1. React and external libraries
import React from 'react';
import { marked } from 'marked';

// 2. Contexts and custom hooks
import { useAudit } from '../../contexts/AuditContext';

// 3. Local components
import RuleBadge from './RuleBadge';
import PrimaryButton from './PrimaryButton';

// 4. Utilities
import { auditFigmaDesign, isValidFigmaUrl } from '../../utils/api';

// 5. Types
import type { RuleDefinition, AuditResult } from '../../types/audit';
```

### Tailwind Design System

The project uses custom Tailwind tokens defined in `tailwind.config.js`:

**Figma Brand Colors**
```css
bg-figma-background   /* #081028 - Main app background */
bg-figma-card         /* #0B1739 - Card backgrounds */
bg-figma-button       /* #CB3CFF - Primary button color */
text-figma-text       /* #FFFFFF - Primary text */
text-figma-textMuted  /* #AEB9E1 - Secondary text */
text-figma-components /* #D9E1FA - Component text */
```

**Primary Colors**
```css
bg-primary-500  /* #4570ea - Default primary */
bg-primary      /* #CB3CFF - Custom primary */
```

**Typography**
```css
font-sans  /* Work Sans - Headings and important text */
font-body  /* Roboto - Body text */
```

**Custom Animations**
```css
animate-pulse-progress  /* Progress animation for loaders */
```

### Pattern: Creating Display Components

Display components (`src/components/display/`) render data from context without business logic:

```typescript
// src/components/display/MyNewComponent.tsx
import React from 'react';
import { useAudit } from '../../contexts/AuditContext';

interface MyNewComponentProps {
  title?: string;
}

const MyNewComponent: React.FC<MyNewComponentProps> = ({
  title = 'Default Title'
}) => {
  const { state, getRuleById } = useAudit();

  if (!state.results) {
    return null;
  }

  return (
    <div className="bg-figma-card rounded-lg p-6 space-y-4">
      <h2 className="text-xl font-semibold text-figma-text">
        {title}
      </h2>

      <div className="space-y-2">
        {/* Your content here */}
      </div>
    </div>
  );
};

export default MyNewComponent;
```

### Pattern: Using AuditContext

The context centralizes all application state:

**Accessing Data**
```typescript
import { useAudit } from '../contexts/AuditContext';

const MyComponent = () => {
  const {
    state,                    // Complete state
    getRuleById,              // Get rule by ID
    allRulesWithStatus,       // All rules with counters
    showReport,               // Boolean: show report?
    chartData,                // Data formatted for Chart.js
    getFilteredReportData     // Filtered data
  } = useAudit();

  const rule = getRuleById(1);
  const hasResults = showReport();

  return (/* JSX */);
};
```

**Modifying State**
```typescript
const {
  setFigmaUrl,           // Update URL
  setFigmaApiKey,        // Update API key
  setLoading,            // Toggle loading
  setError,              // Set error
  setResults,            // Save audit results
  toggleRuleFilter,      // Add/remove filter
  clearAllFilters,       // Reset filters
  toggleCompliantRules,  // Show/hide compliant rules
  resetAudit             // Complete reset
} = useAudit();
```

### Pattern: API Calls

All API calls go through `utils/api.ts`:

```typescript
import { auditFigmaDesign, isValidFigmaUrl, ApiError } from '../../utils/api';

const handleAudit = async () => {
  // 1. Validation
  if (!isValidFigmaUrl(figmaUrl)) {
    setError('Invalid Figma URL');
    return;
  }

  // 2. Loading
  setLoading(true);

  try {
    // 3. API Call
    const results = await auditFigmaDesign({
      figmaUrl,
      figmaApiKey,
      outputFormat: 'json'
    });

    // 4. Success
    setResults(results);
  } catch (error) {
    // 5. Error Handling
    if (error instanceof ApiError) {
      const userMessage = error.getUserMessage();
      setError(`${userMessage.title}: ${userMessage.message}`);
    } else {
      setError('An unexpected error occurred');
    }
  } finally {
    setLoading(false);
  }
};
```

### Testing with Vitest

**Standard Test Pattern**
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('renders with default props', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    const { user } = render(<MyComponent />);
    const button = screen.getByRole('button');

    await user.click(button);

    expect(screen.getByText('Updated Text')).toBeInTheDocument();
  });
});
```

**Coverage Thresholds**
- Lines: 70% minimum
- Functions: 70% minimum
- Branches: 70% minimum
- Statements: 70% minimum

**What to Test**
- ✅ Default rendering
- ✅ Custom props
- ✅ User interactions (clicks, inputs)
- ✅ Conditional states
- ✅ Error handling

**What to Skip**
- ❌ Purely visual components without logic
- ❌ Storybook stories
- ❌ Configuration files
- ❌ TypeScript types

### Storybook Documentation

**Standard Story Pattern**
```typescript
import type { Meta, StoryObj } from '@storybook/react';
import MyComponent from './MyComponent';

const meta = {
  title: 'Category/MyComponent',  // e.g., Forms/PrimaryButton
  component: MyComponent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Detailed component description',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    propName: {
      control: 'text',
      description: 'Prop description',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: "'default value'" },
      },
    },
  },
} satisfies Meta<typeof MyComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

// Required stories
export const Default: Story = {
  args: {},
};

export const WithCustomProps: Story = {
  args: {
    propName: 'custom value',
  },
};

// State-specific stories
export const Loading: Story = {
  args: {
    isLoading: true,
  },
};

export const Error: Story = {
  args: {
    error: 'Something went wrong',
  },
};
```

**Storybook Categories**
- `Common/` - Reusable components (LoadingSpinner, ErrorDisplay)
- `Forms/` - Form components (InputForm, PrimaryButton)
- `Display/` - Data display components (StatsCards, DetailedTables)

### TypeScript Best Practices

**Strict Mode Enabled**
```json
{
  "strict": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "noFallthroughCasesInSwitch": true
}
```

**Types vs Interfaces**
- Use `interface` for component props
- Use `type` for unions, intersections, and complex types

```typescript
// ✅ Component props
interface MyComponentProps {
  title: string;
  count?: number;
}

// ✅ Complex types
type RuleCategory = 'standard' | 'ai-based';
type AuditState = {
  isLoading: boolean;
  error: string | null;
};
```

### Error Handling

**Standard Pattern**
```typescript
try {
  const result = await someAsyncOperation();
  handleSuccess(result);
} catch (error) {
  if (error instanceof ApiError) {
    // Structured API error
    const userMessage = error.getUserMessage();
    setError(`${userMessage.title}: ${userMessage.message}`);
  } else if (error instanceof Error) {
    // Standard JavaScript error
    setError(error.message);
  } else {
    // Unknown error
    setError('An unexpected error occurred');
  }
}
```

### Performance Optimization

**React Optimizations**
- Use `useMemo` for expensive computations
- Use `useCallback` for functions passed as props
- `AuditContext` is already optimized with `useMemo` and `useCallback`

**Tailwind CSS**
- Avoid dynamic inline styles unless necessary
- Prefer Tailwind utility classes
- For dynamic colors, use `style={{ backgroundColor: color }}`

### Pre-PR Checklist

Before submitting a pull request, ensure:

- [ ] Code compiles without TypeScript errors (`pnpm type-check`)
- [ ] Linter passes without errors (`pnpm lint`)
- [ ] Code is formatted with Prettier (`pnpm format`)
- [ ] Tests pass (`pnpm test`)
- [ ] Storybook story exists for new components
- [ ] Custom Tailwind tokens are used instead of raw colors
- [ ] Imports are organized in the correct order
- [ ] Component uses `AuditContext` if accessing audit data

### Development URLs

- **Backend Dev**: `http://localhost:3333`
- **Frontend Dev**: `http://localhost:5173`
- **Storybook**: `http://localhost:6006`
- **Backend Production**: `https://figma-mcp-server-1045310654832.europe-west9.run.app`
- **Frontend Production**: `https://storage.googleapis.com/figma-mcp-frontend/index.html`

### Type Duplication Note

Currently, TypeScript types are **duplicated** between backend and frontend. In the future, these should be unified in a shared types package. For now, ensure consistency when modifying types that exist in both codebases.

---

## Summary

This CLAUDE.md provides comprehensive guidelines for working on the FigmAudit project. As Claude Code, you should:

1. **Understand the architecture**: Backend (MCP server + REST API) and Frontend (React app)
2. **Follow typical workflows**: Backend-first for audit rules, frontend-only for UI, fullstack for integrated features
3. **Use the right tools**: Jest for backend, Vitest for frontend, Storybook for component docs
4. **Apply conventions**: Naming, imports, Tailwind tokens, TypeScript best practices
5. **Write tests**: Always include tests for new features and bugfixes
6. **Document components**: Create Storybook stories for all new React components

When in doubt, refer to:
- Backend details: `back/README.md`
- Frontend details: `front/README.md`
- Main project overview: `README.md`
