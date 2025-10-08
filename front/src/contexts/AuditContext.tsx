import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type {
  RuleDefinition,
  AuditState,
  RuleWithStatus,
  GroupedNodeData,
  ComponentSuggestion,
  AuditResponse
} from '../types/audit';

interface AuditContextType {
  state: AuditState;
  // Getters
  getRuleById: (id: number) => RuleDefinition | undefined;
  showReport: () => boolean;
  hasComponentSuggestions: () => boolean;
  getComponentSuggestions: () => ComponentSuggestion[];
  getFigmaAiDescription: () => string;
  chartData: () => any;
  totalRulesDetected: () => number;
  allRulesWithStatus: () => RuleWithStatus[];
  getFilteredReportData: () => GroupedNodeData[];
  // Actions
  setFigmaUrl: (url: string) => void;
  setFigmaApiKey: (key: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | Error | null) => void;
  setResults: (results: AuditResponse) => void;
  resetAudit: () => void;
  toggleRuleFilter: (ruleId: number) => void;
  clearAllFilters: () => void;
  toggleCompliantRules: () => void;
}

const AuditContext = createContext<AuditContextType | undefined>(undefined);

const initialState: AuditState = {
  figmaUrl: '',
  figmaApiKey: '',
  outputFormat: 'json',
  currentView: 'home',
  isLoading: false,
  selectedRulesFilter: [],
  showCompliantRules: false,
  results: null,
  rulesDefinitions: [],
  auditResults: [],
  designSystem: null,
  localStyles: null,
  componentSuggestions: [],
  figmaAiDescription: '',
  error: null,
};

export const AuditProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuditState>(initialState);

  // Getters
  const getRuleById = useCallback((id: number) => {
    return state.rulesDefinitions.find(rule => rule.id === id);
  }, [state.rulesDefinitions]);

  const showReport = useCallback(() => {
    return state.currentView === 'report' && state.results !== null;
  }, [state.currentView, state.results]);

  const hasComponentSuggestions = useCallback(() => {
    return state.componentSuggestions && state.componentSuggestions.length > 0;
  }, [state.componentSuggestions]);

  const getComponentSuggestions = useCallback(() => {
    return state.componentSuggestions || [];
  }, [state.componentSuggestions]);

  const getFigmaAiDescription = useCallback(() => {
    return state.figmaAiDescription || '';
  }, [state.figmaAiDescription]);

  const chartData = useCallback(() => {
    if (!state.auditResults.length || !state.rulesDefinitions.length) return null;

    const ruleCounts: Record<string, number> = {};
    state.auditResults.forEach(result => {
      result.ruleIds.forEach(ruleId => {
        ruleCounts[ruleId] = (ruleCounts[ruleId] || 0) + 1;
      });
    });

    const rulesWithDetections = state.rulesDefinitions.filter(rule => ruleCounts[rule.id] > 0);

    if (rulesWithDetections.length === 0) return null;

    return {
      labels: rulesWithDetections.map(rule => rule.name),
      datasets: [{
        data: rulesWithDetections.map(rule => ruleCounts[rule.id]),
        backgroundColor: rulesWithDetections.map(rule => rule.color),
        borderWidth: 2,
        borderColor: '#FFFFFF',
        hoverOffset: 4
      }]
    };
  }, [state.auditResults, state.rulesDefinitions]);

  const totalRulesDetected = useCallback(() => {
    return state.auditResults.length;
  }, [state.auditResults]);

  const allRulesWithStatus = useCallback((): RuleWithStatus[] => {
    if (!state.rulesDefinitions.length) return [];

    const ruleCounts: Record<number, number> = {};
    state.auditResults.forEach(result => {
      result.ruleIds.forEach(ruleId => {
        ruleCounts[ruleId] = (ruleCounts[ruleId] || 0) + 1;
      });
    });

    return state.rulesDefinitions.map(rule => {
      const detectedCount = ruleCounts[rule.id] || 0;

      return {
        ...rule,
        ruleId: rule.id,
        count: detectedCount,
        detectedCount,
        isCompliant: detectedCount === 0,
        status: detectedCount === 0 ? 'Conforme' : `${detectedCount} détection${detectedCount > 1 ? 's' : ''}`
      };
    });
  }, [state.auditResults, state.rulesDefinitions]);

  const getFilteredReportData = useCallback((): GroupedNodeData[] => {
    const dataToFilter = state.selectedRulesFilter.length === 0
      ? state.auditResults
      : state.auditResults.filter(result => {
          return result.ruleIds.some(ruleId =>
            state.selectedRulesFilter.includes(ruleId)
          );
        }).map(result => ({
          ...result,
          ruleIds: result.ruleIds.filter(ruleId =>
            state.selectedRulesFilter.includes(ruleId)
          )
        }));

    // Transform to GroupedNodeData format
    return dataToFilter.map(result => ({
      nodeId: result.nodeId,
      nodeName: result.nodeName,
      ruleIds: result.ruleIds,
      moreInfos: result.moreInfos
    }));
  }, [state.auditResults, state.selectedRulesFilter]);

  // Actions
  const setFigmaUrl = useCallback((url: string) => {
    setState(prev => ({ ...prev, figmaUrl: url }));
  }, []);

  const setFigmaApiKey = useCallback((key: string) => {
    setState(prev => ({ ...prev, figmaApiKey: key }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }));
  }, []);

  const setError = useCallback((error: string | Error | null) => {
    setState(prev => ({ ...prev, error, isLoading: false }));
  }, []);

  const setResults = useCallback((results: AuditResponse) => {
    setState(prev => ({
      ...prev,
      results,
      rulesDefinitions: results.rulesDefinitions || [],
      auditResults: results.results || [],
      designSystem: results.designSystem || null,
      localStyles: results.localStyles || null,
      componentSuggestions: results.componentSuggestions || [],
      figmaAiDescription: results.figmaAiDescription || '',
      currentView: 'report',
      isLoading: false,
      error: null,
    }));
  }, []);

  const resetAudit = useCallback(() => {
    setState(initialState);
  }, []);

  const toggleRuleFilter = useCallback((ruleId: number) => {
    setState(prev => ({
      ...prev,
      selectedRulesFilter: prev.selectedRulesFilter.includes(ruleId)
        ? prev.selectedRulesFilter.filter(id => id !== ruleId)
        : [...prev.selectedRulesFilter, ruleId]
    }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setState(prev => ({ ...prev, selectedRulesFilter: [] }));
  }, []);

  const toggleCompliantRules = useCallback(() => {
    setState(prev => ({ ...prev, showCompliantRules: !prev.showCompliantRules }));
  }, []);

  const value = useMemo(() => ({
    state,
    getRuleById,
    showReport,
    hasComponentSuggestions,
    getComponentSuggestions,
    getFigmaAiDescription,
    chartData,
    totalRulesDetected,
    allRulesWithStatus,
    getFilteredReportData,
    setFigmaUrl,
    setFigmaApiKey,
    setLoading,
    setError,
    setResults,
    resetAudit,
    toggleRuleFilter,
    clearAllFilters,
    toggleCompliantRules,
  }), [
    state,
    getRuleById,
    showReport,
    hasComponentSuggestions,
    getComponentSuggestions,
    getFigmaAiDescription,
    chartData,
    totalRulesDetected,
    allRulesWithStatus,
    getFilteredReportData,
    setFigmaUrl,
    setFigmaApiKey,
    setLoading,
    setError,
    setResults,
    resetAudit,
    toggleRuleFilter,
    clearAllFilters,
    toggleCompliantRules,
  ]);

  return <AuditContext.Provider value={value}>{children}</AuditContext.Provider>;
};

export const useAudit = () => {
  const context = useContext(AuditContext);
  if (context === undefined) {
    throw new Error('useAudit must be used within an AuditProvider');
  }
  return context;
};
