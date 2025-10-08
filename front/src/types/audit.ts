// Types basés sur la structure réelle des données retournées par l'API

export type RuleCategory = 'standard' | 'ai-based';

export interface RuleDefinition {
  id: number;
  name: string;
  nameFr?: string;
  description: string;
  descriptionFr?: string;
  resolutionAdvice?: string;
  resolutionAdviceFr?: string;
  icon: string;
  color: string;
  category: RuleCategory;
  state: 'enabled' | 'disabled';
}

export interface AuditResult {
  ruleIds: number[];
  nodeId: string;
  nodeName: string;
  moreInfos: Record<string, any>;
  masterComponentId?: string;
}

export interface ComponentSuggestion {
  componentName: string;
  description: string;
  rootNodeId: string;
  rootNodeName: string;
  possibleInstances: Array<{ name: string; nodeId: string }>;
  usableNodes: Array<{ name: string; nodeId: string }>;
}

export interface ColorStyle {
  name: string;
  hexValue: string;
}

export interface TextStyle {
  name?: string;
  value?: {
    fontFamily: string;
    fontWeight: number;
    fontSize: number;
    lineHeight: string;
    textAlignHorizontal: string;
    textAlignVertical: string;
  };
  // Direct properties for localStyles
  fontFamily?: string;
  fontWeight?: number;
  fontSize?: number;
  lineHeight?: string;
  textAlignHorizontal?: string;
  textAlignVertical?: string;
}

export interface StrokeStyle {
  colors: string[];
  strokeWeight: string;
  strokeDashes?: number[];
}

export interface LayoutStyle {
  mode: string;
  sizing: Record<string, any>;
  dimensions?: {
    width: number;
    height: number;
  };
  position?: {
    x: number;
    y: number;
  };
  locationRelativeToParent?: {
    x: number;
    y: number;
  };
}

export interface DesignSystem {
  text: Record<string, TextStyle>;
  strokes: Record<string, { name: string; value: StrokeStyle }>;
  layout: Record<string, any>;
  colors: Record<string, ColorStyle>;
}

export interface LocalStyles {
  text: Record<string, TextStyle>;
  strokes: Record<string, StrokeStyle>;
  layout: Record<string, LayoutStyle>;
  colors: Record<string, ColorStyle>;
}

export interface AuditResponse {
  rulesDefinitions: RuleDefinition[];
  results: AuditResult[];
  designSystem: DesignSystem;
  localStyles: LocalStyles;
  componentSuggestions: ComponentSuggestion[];
  figmaAiDescription: string;
}

// Types pour l'état de l'application
export interface AuditState {
  // Form state
  figmaUrl: string;
  figmaApiKey: string;
  outputFormat: string;

  // UI state
  currentView: 'home' | 'report';
  isLoading: boolean;

  // Filtering state
  selectedRulesFilter: number[];
  showCompliantRules: boolean;

  // Results state
  results: AuditResponse | null;
  rulesDefinitions: RuleDefinition[];
  auditResults: AuditResult[];
  designSystem: DesignSystem | null;
  localStyles: LocalStyles | null;
  componentSuggestions: ComponentSuggestion[];
  figmaAiDescription: string;
  error: string | Error | null;
}

// Types utilitaires pour les vues
export interface RuleWithStatus extends RuleDefinition {
  detectedCount: number;
  isCompliant: boolean;
  status: string;
  ruleId: number;
  count: number;
}

export interface GroupedNodeData {
  nodeId: string;
  nodeName: string;
  ruleIds: number[];
  moreInfos: Record<string, any>;
}
