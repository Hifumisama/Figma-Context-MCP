import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AuditProvider, useAudit } from './AuditContext';
import React from 'react';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuditProvider>{children}</AuditProvider>
);

const mockResults = {
  rulesDefinitions: [
    {
      id: 1,
      name: 'Auto Layout Usage',
      category: 'standard' as const,
      color: '#FF6B6B',
      description: 'Check auto layout usage',
      icon: '📐',
      state: 'enabled' as const
    },
    {
      id: 2,
      name: 'Layer Naming',
      category: 'standard' as const,
      color: '#4ECDC4',
      description: 'Check layer naming',
      icon: '🏷️',
      state: 'enabled' as const
    },
    {
      id: 3,
      name: 'Component Candidates',
      category: 'ai-based' as const,
      color: '#95E1D3',
      description: 'Find component candidates',
      icon: '🧩',
      state: 'enabled' as const
    }
  ],
  results: [
    { nodeId: 'node1', ruleIds: [1, 2], nodeName: 'Frame 1', moreInfos: {} },
    { nodeId: 'node2', ruleIds: [1], nodeName: 'Frame 2', moreInfos: {} },
    { nodeId: 'node3', ruleIds: [3], nodeName: 'Frame 3', moreInfos: {} }
  ],
  designSystem: { colors: {}, text: {}, strokes: {}, layout: {} },
  localStyles: { colors: {}, text: {}, strokes: {}, layout: {} },
  componentSuggestions: [
    { componentName: 'Button', description: 'Button group', rootNodeId: 'comp1', rootNodeName: 'Button', possibleInstances: [], usableNodes: [] }
  ],
  figmaAiDescription: 'Design system for a portfolio website'
};

describe('AuditContext', () => {
  it('throws error when useAudit is called outside provider', () => {
    const originalError = console.error;
    console.error = () => {};

    expect(() => {
      renderHook(() => useAudit());
    }).toThrow('useAudit must be used within an AuditProvider');

    console.error = originalError;
  });

  it('manages state updates (setFigmaUrl, setFigmaApiKey, setLoading, setError)', () => {
    const { result } = renderHook(() => useAudit(), { wrapper });

    act(() => {
      result.current.setFigmaUrl('https://figma.com/file/test');
      result.current.setFigmaApiKey('test-key');
      result.current.setLoading(true);
    });

    expect(result.current.state.figmaUrl).toBe('https://figma.com/file/test');
    expect(result.current.state.figmaApiKey).toBe('test-key');
    expect(result.current.state.isLoading).toBe(true);

    act(() => {
      result.current.setError('Test error');
    });

    expect(result.current.state.error).toBe('Test error');
    expect(result.current.state.isLoading).toBe(false); // setError stops loading
  });

  it('updates results and switches to report view', () => {
    const { result } = renderHook(() => useAudit(), { wrapper });

    act(() => {
      result.current.setResults(mockResults);
    });

    expect(result.current.state.results).toEqual(mockResults);
    expect(result.current.state.currentView).toBe('report');
    expect(result.current.state.isLoading).toBe(false);
    expect(result.current.state.error).toBeNull();
    expect(result.current.showReport()).toBe(true);
  });

  it('resets state to initial values', () => {
    const { result } = renderHook(() => useAudit(), { wrapper });

    act(() => {
      result.current.setFigmaUrl('https://test.com');
      result.current.setResults(mockResults);
      result.current.setError('Some error');
      result.current.resetAudit();
    });

    expect(result.current.state.figmaUrl).toBe('');
    expect(result.current.state.results).toBeNull();
    expect(result.current.state.error).toBeNull();
    expect(result.current.state.currentView).toBe('home');
  });

  it('getRuleById returns rule or undefined', () => {
    const { result } = renderHook(() => useAudit(), { wrapper });

    act(() => {
      result.current.setResults(mockResults);
    });

    expect(result.current.getRuleById(1)?.name).toBe('Auto Layout Usage');
    expect(result.current.getRuleById(999)).toBeUndefined();
  });

  it('computes totalRulesDetected, chartData, and allRulesWithStatus', () => {
    const { result } = renderHook(() => useAudit(), { wrapper });

    act(() => {
      result.current.setResults(mockResults);
    });

    // totalRulesDetected
    expect(result.current.totalRulesDetected()).toBe(3);

    // chartData
    const chart = result.current.chartData();
    expect(chart).not.toBeNull();
    expect(chart?.labels).toHaveLength(3);
    expect(chart?.datasets[0].data).toEqual([2, 1, 1]); // Rule 1: 2 detections, Rule 2: 1, Rule 3: 1

    // allRulesWithStatus
    const rulesWithStatus = result.current.allRulesWithStatus();
    expect(rulesWithStatus).toHaveLength(3);

    const rule1 = rulesWithStatus.find(r => r.id === 1);
    expect(rule1?.detectedCount).toBe(2);
    expect(rule1?.isCompliant).toBe(false);
    expect(rule1?.status).toBe('2 détections');
  });

  it('handles filtering (toggleRuleFilter, clearAllFilters, getFilteredReportData)', () => {
    const { result } = renderHook(() => useAudit(), { wrapper });

    act(() => {
      result.current.setResults(mockResults);
    });

    // No filter: all results
    expect(result.current.getFilteredReportData()).toHaveLength(3);

    // Add filter
    act(() => {
      result.current.toggleRuleFilter(1);
    });
    expect(result.current.state.selectedRulesFilter).toContain(1);

    const filtered = result.current.getFilteredReportData();
    expect(filtered).toHaveLength(2); // Only results with rule 1
    expect(filtered.every(r => r.ruleIds.includes(1))).toBe(true);

    // Remove filter
    act(() => {
      result.current.toggleRuleFilter(1);
    });
    expect(result.current.state.selectedRulesFilter).not.toContain(1);

    // Clear all filters
    act(() => {
      result.current.toggleRuleFilter(1);
      result.current.toggleRuleFilter(2);
      result.current.clearAllFilters();
    });
    expect(result.current.state.selectedRulesFilter).toHaveLength(0);
  });

  it('toggles compliant rules visibility', () => {
    const { result } = renderHook(() => useAudit(), { wrapper });

    expect(result.current.state.showCompliantRules).toBe(false);

    act(() => {
      result.current.toggleCompliantRules();
    });
    expect(result.current.state.showCompliantRules).toBe(true);

    act(() => {
      result.current.toggleCompliantRules();
    });
    expect(result.current.state.showCompliantRules).toBe(false);
  });

  it('provides component suggestions and description', () => {
    const { result } = renderHook(() => useAudit(), { wrapper });

    act(() => {
      result.current.setResults(mockResults);
    });

    expect(result.current.hasComponentSuggestions()).toBe(true);
    expect(result.current.getComponentSuggestions()).toHaveLength(1);
    expect(result.current.getFigmaAiDescription()).toBe('Design system for a portfolio website');
  });
});
