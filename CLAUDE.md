# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a TypeScript-based MCP (Model Context Protocol) server that provides tools for analyzing and extracting data from Figma design files. The server can run in two modes: stdio mode (for MCP clients) or HTTP mode (for web API access).

## Common Development Commands

### Build and Development
- `pnpm build` - Build TypeScript to JavaScript
- `pnpm dev` - Development mode with watch (for MCP stdio mode)
- `pnpm dev:cli` - Development mode with CLI stdio interface
- `pnpm type-check` - Run TypeScript type checking without emitting files

### Testing
- `pnpm test` - Run Jest test suite
- Test files are located in `src/tests/`

### Code Quality
- `pnpm lint` - Run ESLint for code linting
- `pnpm format` - Format code with Prettier

### Running the Server
- `pnpm start` - Start the built server (HTTP mode by default)
- `pnpm start:cli` - Start in CLI stdio mode for MCP clients
- `pnpm start:http` - Start in HTTP mode

### Debugging and Inspection
- `pnpm inspect` - Use MCP inspector tool to debug MCP connections

## Architecture Overview

### Core Components

1. **MCP Server** (`src/mcp/index.ts`) - Main server that registers and handles MCP tools
2. **CLI Entry Point** (`src/cli.ts`) - Command-line interface that can run in stdio or HTTP mode  
3. **HTTP Server** (`src/server.ts`) - Express server for HTTP API endpoints
4. **Figma Service** (`src/services/figma.ts`) - Service layer for interacting with Figma REST API

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
OUTPUT_FORMAT=yaml           # Tool output format: "yaml" or "json" (default: yaml)
SKIP_IMAGE_DOWNLOADS=false   # Disable image download tool (default: false)
ENABLE_AI_RULES=false        # Enable AI-based audit rules (default: false)
```

### CLI Arguments

All environment variables can be overridden with CLI arguments:
- `--figma-api-key` 
- `--figma-oauth-token`
- `--port`
- `--json` (sets OUTPUT_FORMAT to json)
- `--skip-image-downloads`
- `--enable-ai-rules`
- `--env path/to/custom/.env`

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

8. **Interaction States** (`check-interaction-states.ts`) 🤖 *AI-Ready*
   - **Current**: Detects missing state variants for interactive components (button, input, etc.)
   - **Future AI Enhancement**: Will use AI to analyze interaction patterns and suggest missing states
   - Looks for keywords: `button`, `input`, `select`, `toggle`, `checkbox`, `radio`, `switch`, `slider`, `tab`
   - Checks for states: `hover`, `focus`, `active`, `disabled`

9. **Color Naming** (`check-color-names.ts`) 🤖 *AI-Active*
   - Uses AI prompts to analyze color style naming conventions  
   - Identifies literal names (e.g., "Blue") vs. semantic names (e.g., "primary-500")
   - Requires `--enable-ai-rules` flag or `ENABLE_AI_RULES=true`

### Rule Configuration

Rules can be enabled/disabled and configured in the audit tool. AI-based rules are disabled by default for performance and cost considerations.

**Rule Categories:**
- **Standard Rules (1-6)**: Always active, use pattern matching and structural analysis
- **AI-Ready Rules (7-8)**: Currently use algorithmic detection, designed for future AI enhancement
- **AI-Active Rules (9)**: Currently use AI prompts, require `--enable-ai-rules` flag

**Implementation Details:**
- **Component Candidates** uses structural signature matching: `generateSignature()` creates patterns like `FRAME(RECTANGLE,TEXT)[FONT(family,size,weight)]`
- **Interaction States** uses keyword matching against `['button', 'input', 'select', 'toggle', 'checkbox', 'radio', 'switch', 'slider', 'tab']`
- Both are designed for future AI integration to detect more sophisticated design patterns

## Package Management

Uses **pnpm** as the package manager. Key dependencies:
- `@modelcontextprotocol/sdk` - MCP protocol implementation
- `@figma/rest-api-spec` - Figma API types
- `express` - HTTP server framework
- `zod` - Schema validation
- `sharp` - Image processing