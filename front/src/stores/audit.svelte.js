// État global de l'audit Figma avec runes Svelte 5
export const auditState = $state({
  // Form state
  figmaUrl: '',
  figmaApiKey: '', // Toujours visible selon les specs
  outputFormat: 'json',
  
  // UI state
  currentView: 'home', // 'home' | 'report'
  isLoading: false,
  
  // Filtering state
  selectedRulesFilter: [], // Array des IDs de règles sélectionnées pour filtrage
  showCompliantRules: false,
  
  // Results state - nouvelle structure
  results: null, // Contient { rulesDefinitions: [], results: [], designSystem?: {} }
  rulesDefinitions: [], // Définitions dynamiques des règles du backend
  auditResults: [], // Résultats d'audit au format AuditResult[]
  designSystem: null, // Données du design system Figma
  error: null
});

// Fonction pour obtenir toutes les règles disponibles (dynamiques du backend)
export function getAllRules() {
  return auditState.rulesDefinitions;
}

// Fonction pour obtenir une règle par ID
export function getRuleById(id) {
  return auditState.rulesDefinitions.find(rule => rule.id === id);
}

// États dérivés - functions pour éviter l'erreur derived_invalid_export
export function hasResults() {
  return auditState.results !== null;
}

export function showReport() {
  return auditState.currentView === 'report' && hasResults();
}

// Données dérivées pour Chart.js pie chart - function pour éviter derived_invalid_export
export function chartData() {
  if (!auditState.auditResults.length || !auditState.rulesDefinitions.length) return null;
  
  // Compter les détections par règle
  const ruleCounts = {};
  auditState.auditResults.forEach(result => {
    result.ruleIds.forEach(ruleId => {
      ruleCounts[ruleId] = (ruleCounts[ruleId] || 0) + 1;
    });
  });
  
  // Créer les données du graphique seulement pour les règles avec des détections
  const rulesWithDetections = auditState.rulesDefinitions.filter(rule => ruleCounts[rule.id] > 0);
  
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
}

// Statistiques dérivées - functions pour éviter derived_invalid_export
export function totalRulesDetected() {
  return auditState.auditResults.length;
}

export function rulesCategoriesStats() {
  if (!auditState.rulesDefinitions.length) return { standard: { count: 0, total: 0 }, 'ai-based': { count: 0, total: 0 } };
  
  // Compter les détections par règle
  const ruleCounts = {};
  auditState.auditResults.forEach(result => {
    result.ruleIds.forEach(ruleId => {
      ruleCounts[ruleId] = (ruleCounts[ruleId] || 0) + 1;
    });
  });
  
  const stats = {
    standard: { count: 0, total: auditState.rulesDefinitions.filter(r => r.category === 'standard').length },
    'ai-based': { count: 0, total: auditState.rulesDefinitions.filter(r => r.category === 'ai-based').length }
  };
  
  auditState.rulesDefinitions.forEach(rule => {
    if (ruleCounts[rule.id] > 0) {
      stats[rule.category].count++;
    }
  });
  
  return stats;
}

// Fonction pour récupérer toutes les règles avec leur statut (conforme/non-conforme)
export function allRulesWithStatus() {
  if (!auditState.rulesDefinitions.length) return [];
  
  // Compter les détections par règle
  const ruleCounts = {};
  auditState.auditResults.forEach(result => {
    result.ruleIds.forEach(ruleId => {
      ruleCounts[ruleId] = (ruleCounts[ruleId] || 0) + 1;
    });
  });
  
  return auditState.rulesDefinitions.map(rule => {
    const detectedCount = ruleCounts[rule.id] || 0;
    
    return {
      ...rule,
      detectedCount,
      isCompliant: detectedCount === 0,
      status: detectedCount === 0 ? 'Conforme' : `${detectedCount} détection${detectedCount > 1 ? 's' : ''}`
    };
  });
}

// Actions pour modifier l'état
export function setLoading(loading) {
  auditState.isLoading = loading;
}

export function setError(error) {
  auditState.error = error;
  auditState.isLoading = false;
}

export function setResults(results) {
  auditState.results = results;
  auditState.rulesDefinitions = results.rulesDefinitions || [];
  auditState.auditResults = results.results || [];
  auditState.designSystem = results.designSystem || null;
  auditState.currentView = 'report';
  auditState.isLoading = false;
  auditState.error = null;
}

export function resetAudit() {
  auditState.currentView = 'home';
  auditState.results = null;
  auditState.rulesDefinitions = [];
  auditState.auditResults = [];
  auditState.designSystem = null;
  auditState.error = null;
  auditState.isLoading = false;
  auditState.selectedRulesFilter = [];
  auditState.showCompliantRules = false;
}

// Actions pour le filtrage
export function toggleRuleFilter(ruleId) {
  if (auditState.selectedRulesFilter.includes(ruleId)) {
    auditState.selectedRulesFilter = auditState.selectedRulesFilter.filter(id => id !== ruleId);
  } else {
    auditState.selectedRulesFilter = [...auditState.selectedRulesFilter, ruleId];
  }
}

export function clearAllFilters() {
  auditState.selectedRulesFilter = [];
}

export function selectAllRules() {
  auditState.selectedRulesFilter = auditState.rulesDefinitions.map(rule => rule.id);
}

export function toggleCompliantRules() {
  auditState.showCompliantRules = !auditState.showCompliantRules;
}

// Fonction pour obtenir les données filtrées du rapport
export function getFilteredReportData() {
  if (auditState.selectedRulesFilter.length === 0) {
    // Aucun filtre sélectionné, montrer tout
    return auditState.auditResults;
  }
  
  // Filtrer les résultats qui ont au moins une règle sélectionnée
  return auditState.auditResults.filter(result => {
    return result.ruleIds.some(ruleId => 
      auditState.selectedRulesFilter.includes(ruleId)
    );
  }).map(result => ({
    ...result,
    // Filtrer aussi les ruleIds du résultat
    ruleIds: result.ruleIds.filter(ruleId => 
      auditState.selectedRulesFilter.includes(ruleId)
    )
  }));
}

// Ces fonctions ne sont plus nécessaires avec la nouvelle structure
