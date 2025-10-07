import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

// Types
interface RuleDefinition {
  id: string;
  name: string;
  nameFr?: string;
  category: 'standard' | 'ai-based';
  color: string;
  description?: string;
  descriptionFr?: string;
  icon?: string;
  resolutionAdvice?: string;
}

interface AuditResult {
  ruleIds: string[];
  [key: string]: any;
}

interface AuditState {
  // Form state
  figmaUrl: string;
  figmaApiKey: string;
  outputFormat: string;

  // UI state
  currentView: 'home' | 'report';
  isLoading: boolean;

  // Filtering state
  selectedRulesFilter: string[];
  showCompliantRules: boolean;

  // Results state
  results: any;
  rulesDefinitions: RuleDefinition[];
  auditResults: AuditResult[];
  designSystem: any;
  localStyles: any;
  componentSuggestions: any[];
  figmaAiDescription: string;
  error: string | null;
}

interface AuditContextType {
  state: AuditState;
  // Getters
  getAllRules: () => RuleDefinition[];
  getRuleById: (id: string) => RuleDefinition | undefined;
  hasResults: () => boolean;
  showReport: () => boolean;
  hasComponentSuggestions: () => boolean;
  getComponentSuggestions: () => any[];
  getFigmaAiDescription: () => string;
  chartData: () => any;
  totalRulesDetected: () => number;
  rulesCategoriesStats: () => { standard: { count: number; total: number }; 'ai-based': { count: number; total: number } };
  allRulesWithStatus: () => any[];
  getFilteredReportData: () => AuditResult[];
  // Actions
  setFigmaUrl: (url: string) => void;
  setFigmaApiKey: (key: string) => void;
  setOutputFormat: (format: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setResults: (results: any) => void;
  resetAudit: () => void;
  toggleRuleFilter: (ruleId: string) => void;
  clearAllFilters: () => void;
  selectAllRules: () => void;
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
  const getAllRules = useCallback(() => state.rulesDefinitions, [state.rulesDefinitions]);

  const getRuleById = useCallback((id: string) => {
    return state.rulesDefinitions.find(rule => rule.id === id);
  }, [state.rulesDefinitions]);

  const hasResults = useCallback(() => state.results !== null, [state.results]);

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

  const rulesCategoriesStats = useCallback(() => {
    if (!state.rulesDefinitions.length) {
      return { standard: { count: 0, total: 0 }, 'ai-based': { count: 0, total: 0 } };
    }

    const ruleCounts: Record<string, number> = {};
    state.auditResults.forEach(result => {
      result.ruleIds.forEach(ruleId => {
        ruleCounts[ruleId] = (ruleCounts[ruleId] || 0) + 1;
      });
    });

    const stats = {
      standard: { count: 0, total: state.rulesDefinitions.filter(r => r.category === 'standard').length },
      'ai-based': { count: 0, total: state.rulesDefinitions.filter(r => r.category === 'ai-based').length }
    };

    state.rulesDefinitions.forEach(rule => {
      if (ruleCounts[rule.id] > 0) {
        stats[rule.category].count++;
      }
    });

    return stats;
  }, [state.auditResults, state.rulesDefinitions]);

  const allRulesWithStatus = useCallback(() => {
    if (!state.rulesDefinitions.length) return [];

    const ruleCounts: Record<string, number> = {};
    state.auditResults.forEach(result => {
      result.ruleIds.forEach(ruleId => {
        ruleCounts[ruleId] = (ruleCounts[ruleId] || 0) + 1;
      });
    });

    return state.rulesDefinitions.map(rule => {
      const detectedCount = ruleCounts[rule.id] || 0;

      return {
        ...rule,
        detectedCount,
        isCompliant: detectedCount === 0,
        status: detectedCount === 0 ? 'Conforme' : `${detectedCount} détection${detectedCount > 1 ? 's' : ''}`
      };
    });
  }, [state.auditResults, state.rulesDefinitions]);

  const getFilteredReportData = useCallback(() => {
    if (state.selectedRulesFilter.length === 0) {
      return state.auditResults;
    }

    return state.auditResults.filter(result => {
      return result.ruleIds.some(ruleId =>
        state.selectedRulesFilter.includes(ruleId)
      );
    }).map(result => ({
      ...result,
      ruleIds: result.ruleIds.filter(ruleId =>
        state.selectedRulesFilter.includes(ruleId)
      )
    }));
  }, [state.auditResults, state.selectedRulesFilter]);

  // Actions
  const setFigmaUrl = useCallback((url: string) => {
    setState(prev => ({ ...prev, figmaUrl: url }));
  }, []);

  const setFigmaApiKey = useCallback((key: string) => {
    setState(prev => ({ ...prev, figmaApiKey: key }));
  }, []);

  const setOutputFormat = useCallback((format: string) => {
    setState(prev => ({ ...prev, outputFormat: format }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error, isLoading: false }));
  }, []);

  const setResults = useCallback((results: any) => {
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

  const toggleRuleFilter = useCallback((ruleId: string) => {
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

  const selectAllRules = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedRulesFilter: prev.rulesDefinitions.map(rule => rule.id)
    }));
  }, []);

  const toggleCompliantRules = useCallback(() => {
    setState(prev => ({ ...prev, showCompliantRules: !prev.showCompliantRules }));
  }, []);

  const value = useMemo(() => ({
    state,
    getAllRules,
    getRuleById,
    hasResults,
    showReport,
    hasComponentSuggestions,
    getComponentSuggestions,
    getFigmaAiDescription,
    chartData,
    totalRulesDetected,
    rulesCategoriesStats,
    allRulesWithStatus,
    getFilteredReportData,
    setFigmaUrl,
    setFigmaApiKey,
    setOutputFormat,
    setLoading,
    setError,
    setResults,
    resetAudit,
    toggleRuleFilter,
    clearAllFilters,
    selectAllRules,
    toggleCompliantRules,
  }), [
    state,
    getAllRules,
    getRuleById,
    hasResults,
    showReport,
    hasComponentSuggestions,
    getComponentSuggestions,
    getFigmaAiDescription,
    chartData,
    totalRulesDetected,
    rulesCategoriesStats,
    allRulesWithStatus,
    getFilteredReportData,
    setFigmaUrl,
    setFigmaApiKey,
    setOutputFormat,
    setLoading,
    setError,
    setResults,
    resetAudit,
    toggleRuleFilter,
    clearAllFilters,
    selectAllRules,
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
