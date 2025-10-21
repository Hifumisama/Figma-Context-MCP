# CLAUDE.md

This file provides guidance to Claude Code when working with the **Figma to React Pipeline** powered by VoltAgent.

## Project Overview

**Figma to React Pipeline** is an AI-powered code generation system that transforms Figma designs into production-ready React applications using autonomous agents orchestrated by VoltAgent.

### Philosophy

- **Incremental**: One agent at a time, with human validation between steps
- **Simple First**: Minimalist versions that are enriched after validation
- **Context Managed**: Context window purging between agents to maintain focus
- **Budget Conscious**: Use economical models during development (gpt-4o-mini when possible)

### Core Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    VoltAgent Orchestrator                       │
└─────────────────────────────────────────────────────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
    ┌────▼────┐         ┌─────▼─────┐       ┌─────▼─────┐
    │ Agents  │         │ Workflows │       │   Tools   │
    └─────────┘         └───────────┘       └───────────┘
         │                    │                    │
         └────────────────────┼────────────────────┘
                              │
                    ┌─────────▼──────────┐
                    │   MCP Figma API    │
                    │ (localhost:3333)   │
                    └────────────────────┘
```

### Pipeline Stages

The complete pipeline follows this pattern:

```
[MCP JSON] → [Validation Script] → [Architect] → [Initializer]
                                                      ↓
[Optimizer] ← [Assembler] ← [Test Loop] ← [Design System] ←─┘
```

**11-Step Pipeline:**

1. **Validation Script** - Fetch JSON from MCP and validate structure (no agent, direct MCP call)
2. **Architect** - Create generation plan (atomic design)
3. **Initializer** - Setup React project structure
4. **Design System** - Generate Tailwind config from tokens
5. **Test Planner** - Define test specifications (TDD)
6. **Test Writer** - Write test files
7. **Coder** - Implement components to pass tests
8. **Test Runner** - Execute test suite
9. **Debugger** - Fix failing tests
10. **Assembler** - Create pages from components
11. **Optimizer** - Bundle analysis and optimization

## Project Structure

```
figmAgentReactCode/
├── src/
│   ├── index.ts                      # Main VoltAgent configuration
│   ├── utils/                        # Utility functions (no agents)
│   │   └── fetch-and-validate-figma.ts  # Step 1: Direct MCP call + validation
│   ├── agents/                       # Agent definitions (10 agents)
│   │   ├── architect.ts              # Step 2: Architecture planning
│   │   ├── initializer.ts            # Step 3: Project initialization
│   │   ├── design-system.ts          # Step 4: Design tokens → Tailwind
│   │   ├── test-planner.ts           # Step 5: Test strategy
│   │   ├── test-writer.ts            # Step 6: Write tests
│   │   ├── coder.ts                  # Step 7: Component implementation
│   │   ├── test-runner.ts            # Step 8: Test execution
│   │   ├── debugger.ts               # Step 9: Fix failures
│   │   ├── assembler.ts              # Step 10: Page assembly
│   │   └── optimizer.ts              # Step 11: Bundle optimization
│   ├── workflows/                    # Workflow chains
│   │   └── complete.ts               # Full pipeline workflow
│   └── tools/                        # Custom VoltAgent tools
│       ├── index.ts
│       └── weather.ts                # Example tool
├── workspace/                # Agent outputs
│   ├── json/                 # Extracted Figma data
│   ├── project/              # Generated React app
│   └── reports/              # Validation/audit reports
├── sampleData/               # Example inputs for testing
│   └── sample-portfolio.json # Portfolio design example
├── examples/                 # Example outputs
│   └── sample-button.json    # Button component example
├── .env                      # Environment configuration
├── CLAUDE.md                 # This file
├── plan.md                   # Detailed implementation plan
├── package.json
└── tsconfig.json
```

## Environment Configuration

### Required Variables

```env
# Google Generative AI (for agents using gpt-4o-mini or gpt-4o)
GOOGLE_GENERATIVE_AI_API_KEY=your_google_api_key

# MCP Figma Server
MCP_ENDPOINT=http://localhost:3333

# VoltOps Platform (Optional - for observability)
VOLTAGENT_PUBLIC_KEY=your_public_key
VOLTAGENT_SECRET_KEY=your_secret_key
```

### MCP Server Integration

The project integrates with the existing Figma MCP server located in `../back/`:

- **Development Server**: `http://localhost:3333` (stdio mode)
- **Production Server**: `https://figma-mcp-server-1045310654832.europe-west9.run.app`

**MCP Tools Used:**
- `get_figma_context` - Simplified Figma data extraction
- `get_figma_data` - Full Figma file data extraction

**Note**: The MCP server must be running before starting the VoltAgent pipeline.

## Agent Development Guidelines

### Agent Structure

Each agent follows this pattern:

```typescript
import { Agent } from "@voltagent/core";
import { VercelAIProvider } from "@voltagent/vercel-ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

export const myAgent = new Agent({
  id: "my-agent",
  name: "Descriptive Agent Name",
  instructions: `
    Clear, concise instructions for the agent.
    1. Step one
    2. Step two
    3. Expected output
  `,
  llm: new VercelAIProvider(),
  model: openai("gpt-4o-mini"), // Or gpt-4o for complex tasks
  maxSteps: 3, // Limit agent iterations
  tools: [], // Optional tools
  markdown: false, // Set to true for code generation agents
});
```

### Model Selection

Choose models based on task complexity:

**gpt-4o-mini** (Fast & Cheap)
- JSON extraction and parsing
- Validation and simple analysis
- Test execution
- File operations

**gpt-4o** (Reasoning & Quality)
- Architecture planning
- Test strategy design
- Code generation (components)
- Debugging complex errors

### Agent-Specific Patterns

#### 1. Validation Script (Step 1) - Token Optimized

**Purpose**: Fetch JSON from MCP and validate structure
**Approach**: Direct MCP call (NO AGENT - saves tokens!)
**Output**: ValidationResult with errors, warnings, and stats

**Key Concept**: Using an agent just to fetch data wastes tokens. Instead, we call MCP tools directly and use TypeScript + Zod for validation.

```typescript
import { MCPConfiguration } from "@voltagent/core";
import { z } from "zod";

// Configure MCP connection to Figma server
const mcpConfig = new MCPConfiguration({
  servers: {
    figma: {
      type: "http",
      url: process.env.MCP_ENDPOINT || "http://localhost:3333",
      timeout: 30000,
    },
  },
});

export async function fetchAndValidateFigma(
  figmaUrl: string
): Promise<ValidationResult> {
  // 1. Get MCP tools
  const toolsets = await mcpConfig.getToolsets();
  const figmaTools = toolsets.figma.getTools();

  // 2. Find get_figma_context tool
  const getFigmaContextTool = figmaTools.find(
    (tool) => tool.name === "get_figma_context"
  );

  // 3. Call MCP tool directly (no agent!)
  const response = await getFigmaContextTool.execute({
    url: figmaUrl,
    scope: "auto",
  });

  // 4. Parse JSON response
  const figmaData = JSON.parse(response.content[0].text);

  // 5. Validate with Zod schema
  FigmaContextSchema.parse(figmaData);

  // 6. Custom validation checks
  // - Single root node (reject multi-page)
  // - Components presence (warning if none)
  // - Design tokens (warning if none)

  return {
    success: true,
    errors: [],
    warnings: [],
    stats: { /* ... */ },
    data: figmaData,
  };
}
```

**Why this approach?**
- **No AI tokens used** for simple data fetching
- **Faster execution** (no LLM round-trip)
- **More reliable** (deterministic validation)
- **Cost effective** (only uses MCP bandwidth)

**Usage:**
```bash
npm run test:validation
```

#### 2. Architect Agent (Step 2)

**Purpose**: Create component generation plan
**Model**: gpt-4o (needs reasoning)
**Output**: Atomic design hierarchy

```typescript
export const architectAgent = new Agent({
  id: "architect",
  name: "Project Architect",
  instructions: `
    Analyze Figma JSON and create:
    1. Component order (atoms → molecules → organisms)
    2. Folder structure
    3. Required dependencies
    Return structured plan in JSON.
  `,
  llm: new VercelAIProvider(),
  model: openai("gpt-4o"),
  maxSteps: 5,
});
```

#### 4. Test-Driven Development Loop (Steps 6-10)

**TDD Pattern**:
1. Test Planner → Define test specs
2. Test Writer → Write .test.tsx files
3. Coder → Implement component
4. Test Runner → Execute tests
5. Debugger → Fix failures (if any)

**Key Principle**: Tests are written BEFORE implementation.

### Tool Development

#### Using MCP Tools (Recommended)

For external services like Figma, **always use MCP tools** instead of creating custom HTTP fetch tools:

```typescript
import { MCPConfiguration } from "@voltagent/core";

// Connect to MCP server
const mcpConfig = new MCPConfiguration({
  servers: {
    figma: {
      type: "http",
      url: "http://localhost:3333",
      timeout: 30000,
    },
  },
});

// Get tools automatically
const mcpTools = await mcpConfig.getTools();
// Now you have: get_figma_context, get_figma_data, audit_figma_design, etc.
```

#### Custom Local Tools (When Needed)

For agent-specific functionality (like file operations), create custom tools:

```typescript
import { createTool } from "@voltagent/core";
import { z } from "zod";
import fs from "fs/promises";

export const writeFileTool = createTool({
  name: "write_file",
  description: "Write content to a file in workspace",
  parameters: z.object({  // Note: 'parameters' not 'input'
    path: z.string(),
    content: z.string(),
  }),
  execute: async ({ path, content }) => {  // Note: 'execute' not 'handler'
    const fullPath = `workspace/${path}`;
    await fs.writeFile(fullPath, content);
    return { success: true, path: fullPath };
  },
});
```

**Key Differences:**
- MCP tools: Use for external services (Figma, GitHub, databases)
- Custom tools: Use for local operations (file I/O, calculations)
- MCP handles protocol complexity automatically

### Workflow Development

Workflows chain agents together:

```typescript
import { createWorkflowChain } from "@voltagent/core";
import { z } from "zod";

export const validationWorkflow = createWorkflowChain({
  id: "validation-pipeline",
  name: "Extract and Validate JSON",
  purpose: "Fetch Figma data and validate structure",
  input: z.object({
    figmaUrl: z.string().url(),
  }),
  result: z.object({
    json: z.string(),
    validationReport: z.object({
      valid: z.boolean(),
      warnings: z.array(z.string()),
    }),
  }),
})
  .andAgent(
    () => "Fetch the JSON from MCP endpoint",
    extractorAgent,
    { schema: z.object({ json: z.string() }) }
  )
  .andAgent(
    ({ data }) => `Validate this JSON: ${data.json}`,
    validatorAgent,
    { schema: validationSchema }
  );
```

## Figma Data Structure

Understanding the Figma JSON structure is crucial for agent development.

### Key Top-Level Properties

```typescript
interface FigmaContext {
  name: string;                    // File name
  lastModified: string;            // ISO timestamp
  thumbnailUrl: string;            // Preview image
  nodes: Node[];                   // All design nodes
  components: Record<string, ComponentMetadata>;
  componentSets: Record<string, ComponentSetMetadata>;
  globalVars: {
    designSystem: DesignSystem;    // Design tokens
    localStyles: LocalStyles;      // Component-specific styles
    images: Record<string, ImageRef>;
  };
}
```

### Node Structure

Nodes follow a recursive tree structure:

```typescript
interface Node {
  id: string;                      // Figma node ID
  name: string;                    // Layer name
  type: NodeType;                  // FRAME, TEXT, INSTANCE, etc.
  layout?: string;                 // Layout reference (e.g., "l1")
  children?: Node[];               // Nested nodes
  text?: string;                   // For TEXT nodes
  textStyle?: string;              // Text style reference
  fills?: string;                  // Fill style reference
  componentId?: string;            // For INSTANCE nodes
  componentProperties?: Property[];
}
```

### Design System Tokens

```typescript
interface DesignSystem {
  text: Record<string, TextStyle>;        // Typography
  colors: Record<string, ColorStyle>;     // Color palette
  strokes: Record<string, StrokeStyle>;   // Borders
  layout: Record<string, LayoutStyle>;    // Spacing, sizing
}
```

**Example Text Style:**
```json
{
  "197:31": {
    "name": "Poppins Paragraph",
    "value": {
      "fontFamily": "Poppins",
      "fontWeight": 400,
      "fontSize": 24,
      "lineHeight": "1.5em"
    }
  }
}
```

**Example Color:**
```json
{
  "2:106": {
    "name": "primary-dark",
    "hexValue": "#03045E"
  }
}
```

## Development Workflow

### Starting Development

```bash
# 1. Start the MCP server (in ../back/)
cd ../back
pnpm dev

# 2. In a new terminal, start VoltAgent
cd ../figmAgentReactCode
npm run dev
```

### Testing the Validation Script

Test the validation utility before using it in workflows:

```bash
npm run test:validation
```

This will:
1. Connect to the MCP server
2. Fetch Figma data using `get_figma_context` tool
3. Validate JSON structure with Zod
4. Check for single root node, components, and design tokens
5. Save validated JSON to `workspace/json/validated-figma-data.json`

### Incremental Pipeline Development

**Phase 1: Core Pipeline (Steps 1-4)**
1. Run validation script to fetch and validate Figma data
2. Architect agent creates generation plan
3. Human review of architecture plan
4. Initializer → Design System
5. Verify project structure and Tailwind config

**Phase 2: TDD Loop (Steps 6-10)**
1. Test Planner → Test Writer
2. Verify test files are syntactically correct
3. Coder → Test Runner
4. Debugger (if tests fail)
5. Iterate until all tests pass

**Phase 3: Assembly & Optimization (Steps 11-12)**
1. Assembler creates pages
2. Optimizer analyzes bundle
3. Final manual review

### Context Management

To prevent context window overflow:

1. **Save intermediate results** to `workspace/` between agents
2. **Clear agent memory** after each major step
3. **Use file-based communication** instead of in-memory data
4. **Limit agent maxSteps** to prevent runaway iterations

```typescript
// Example: Validation script saves output to file
const validationResult = await fetchAndValidateFigma(figmaUrl);
await fs.writeFile(
  "workspace/json/validated-figma-data.json",
  JSON.stringify(validationResult.data, null, 2)
);

// Next agent (Architect) reads from file instead of context
const figmaData = await fs.readFile(
  "workspace/json/validated-figma-data.json",
  "utf-8"
);
```

## VoltOps Observability

### Local Development

VoltOps console connects automatically to `http://localhost:3141`:
- Real-time agent execution visualization
- Step-by-step debugging
- Performance metrics
- Local-only (no data leaves your machine)

### Production Monitoring

For deployed agents, configure VoltOpsClient:

```typescript
import { VoltOpsClient } from "@voltagent/logger";

const client = new VoltOpsClient({
  publicKey: process.env.VOLTAGENT_PUBLIC_KEY!,
  secretKey: process.env.VOLTAGENT_SECRET_KEY!,
});
```

## Common Commands

```bash
# Development
npm run dev              # Start with hot reload
npm run volt             # VoltAgent CLI tools

# Build & Deploy
npm run build            # Compile TypeScript
npm start                # Run production build

# Code Quality
npm run lint             # Check code with Biome
npm run lint:fix         # Auto-fix issues
npm run typecheck        # TypeScript validation

# Testing
# (Will be added as agents are developed)
npm test                 # Run test suite
npm run test:watch       # Watch mode
```

## Integration with Main Project

This VoltAgent pipeline is part of the larger Figma-Context-MCP monorepo:

```
Figma-Context-MCP/
├── back/                    # MCP Server (Figma API integration)
├── front/                   # React Audit UI
├── figmAgentReactCode/      # This project (VoltAgent pipeline)
├── CLAUDE.md                # Main project guidelines
└── README.md
```

**Relationship:**
- `back/` provides the MCP tools that agents consume
- `front/` is an example of a React app (manual development)
- `figmAgentReactCode/` automates React app generation from Figma

## Troubleshooting

### MCP Server Connection Issues

**Problem**: Agent fails to fetch JSON from MCP endpoint

**Solutions**:
1. Verify MCP server is running: `cd ../back && pnpm dev`
2. Check endpoint URL in `.env`: `MCP_ENDPOINT=http://localhost:3333`
3. Test endpoint manually: `curl http://localhost:3333/api/figma-context`

### Agent Not Progressing

**Problem**: Agent stuck in infinite loop or not completing

**Solutions**:
1. Reduce `maxSteps` to force termination
2. Simplify agent instructions
3. Check VoltOps console for execution trace
4. Add explicit termination conditions in instructions

### Out of Memory / Context Overflow

**Problem**: Agent runs out of context or memory

**Solutions**:
1. Save intermediate results to files
2. Clear agent history between major steps
3. Use smaller data samples for testing
4. Switch to gpt-4o-mini for parsing tasks

## Future Enhancements

Planned improvements beyond the initial 12-agent pipeline:

1. **Multi-file Support**: Handle multiple Figma files
2. **Component Library**: Reusable component repository
3. **Style Variants**: Support for dark mode, themes
4. **Accessibility**: Automated a11y improvements
5. **Storybook Integration**: Auto-generate stories
6. **CI/CD Pipeline**: Automated testing and deployment

## Resources

- **VoltAgent Docs**: [voltagent.dev/docs](https://voltagent.dev/docs/)
- **Figma API**: [figma.com/developers/api](https://www.figma.com/developers/api)
- **Plan Details**: See `plan.md` for detailed implementation steps
- **Sample Data**: Check `sampleData/sample-portfolio.json` for structure examples

---

## Summary for Claude Code

As Claude Code working on this project, you should:

1. **Understand the pipeline**: 12 agents in sequence, each with a specific role
2. **Follow the philosophy**: Incremental, simple-first, context-managed
3. **Use the right models**: gpt-4o-mini for simple tasks, gpt-4o for reasoning
4. **Test incrementally**: Validate each agent before moving to the next
5. **Manage context**: Save to files, clear memory between steps
6. **Integrate with MCP**: Use the existing Figma MCP server for data
7. **Document decisions**: Update this file when making architectural changes

When in doubt, refer to:
- Agent patterns in this file
- Detailed plan in `plan.md`
- Main project guidelines in `../CLAUDE.md`
- VoltAgent documentation at [voltagent.dev](https://voltagent.dev)
