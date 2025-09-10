// État global de l'audit Figma avec runes Svelte 5
export const auditState = $state({
  // Form state
  figmaUrl: '',
  figmaApiKey: '', // Toujours visible selon les specs
  outputFormat: 'json',
  
  // UI state
  currentView: 'home', // 'home' | 'report'
  isLoading: false,
  
  // Results state
  results: null,
  rulesDetected: [], // Array des 9 règles avec leurs statuts
  rulesByComponent: [],
  rulesByType: [],
  error: null
});

// Les 9 règles d'audit définies dans CLAUDE.md
export const rulesList = [
  { 
    id: 1, 
    name: 'Auto Layout Usage', 
    nameFr: 'Utilisation d\'Auto Layout',
    category: 'standard',
    description: 'Containers with multiple children should use Auto Layout',
    descriptionFr: 'Les conteneurs avec plusieurs enfants devraient utiliser Auto Layout pour une meilleure flexibilité et réactivité',
    icon: '📐'
  },
  { 
    id: 2, 
    name: 'Layer Naming', 
    nameFr: 'Nommage des calques',
    category: 'standard',
    description: 'Avoid default Figma names like "Frame 123"',
    descriptionFr: 'Éviter les noms par défaut de Figma comme "Frame 123". Utiliser une convention claire (ex: btn-primary)',
    icon: '🏷️'
  },
  { 
    id: 3, 
    name: 'Detached Styles', 
    nameFr: 'Styles détachés',
    category: 'standard',
    description: 'Use design system tokens instead of inline styles',
    descriptionFr: 'Utiliser les tokens du Design System plutôt que les styles inline pour maintenir la cohérence',
    icon: '🎨'
  },
  { 
    id: 4, 
    name: 'Export Settings', 
    nameFr: 'Paramètres d\'export',
    category: 'standard',
    description: 'Assets should have proper export configuration',
    descriptionFr: 'Les assets doivent avoir une configuration d\'export appropriée pour l\'optimisation',
    icon: '📤'
  },
  { 
    id: 5, 
    name: 'Hidden Layers', 
    nameFr: 'Calques masqués',
    category: 'standard',
    description: 'Clean up files by removing hidden layers',
    descriptionFr: 'Nettoyer les fichiers en supprimant les calques masqués ou en les rendant visibles',
    icon: '👁️'
  },
  { 
    id: 6, 
    name: 'Group vs Frame Usage', 
    nameFr: 'Groupes vs Frames',
    category: 'standard',
    description: 'Use frames instead of groups for proper layout',
    descriptionFr: 'Utiliser des frames plutôt que des groupes pour un layout approprié et des fonctionnalités avancées',
    icon: '📦'
  },
  { 
    id: 7, 
    name: 'Component Candidates', 
    nameFr: 'Candidats à la composantisation',
    category: 'ai-ready',
    description: 'Repeated patterns that could be components',
    descriptionFr: 'Motifs répétés qui pourraient être convertis en composants réutilisables',
    icon: '🧩'
  },
  { 
    id: 8, 
    name: 'Interaction States', 
    nameFr: 'États d\'interaction',
    category: 'ai-ready',
    description: 'Interactive components should have all states',
    descriptionFr: 'Les composants interactifs doivent avoir tous leurs états (hover, focus, disabled)',
    icon: '🔄'
  },
  { 
    id: 9, 
    name: 'Color Naming', 
    nameFr: 'Nommage des couleurs',
    category: 'ai-active',
    description: 'Use semantic color names instead of literal ones',
    descriptionFr: 'Utiliser des noms sémantiques (primary, secondary) plutôt que des noms littéraux',
    icon: '🌈'
  }
];

// États dérivés - functions pour éviter l'erreur derived_invalid_export
export function hasResults() {
  return auditState.results !== null;
}

export function showReport() {
  return auditState.currentView === 'report' && hasResults();
}

// Données dérivées pour Chart.js pie chart - function pour éviter derived_invalid_export
export function chartData() {
  if (!auditState.rulesDetected.length) return null;
  
  // Filtrer seulement les règles qui ont des détections pour le graphique
  const rulesWithDetections = auditState.rulesDetected.filter(rule => rule.detectedCount > 0);
  
  if (rulesWithDetections.length === 0) return null;
  
  return {
    labels: rulesWithDetections.map(rule => rule.nameFr || rule.name),
    datasets: [{
      data: rulesWithDetections.map(rule => rule.detectedCount),
      backgroundColor: [
        '#CB3CFF', // Primary purple
        '#8A38F5', // Accent purple  
        '#6366F1', // Indigo
        '#3B82F6', // Blue
        '#10B981', // Emerald
        '#F59E0B', // Amber
        '#EF4444', // Red
        '#EC4899', // Pink
        '#8B5CF6'  // Violet
      ],
      borderWidth: 2,
      borderColor: '#FFFFFF',
      hoverOffset: 4
    }]
  };
}

// Statistiques dérivées - functions pour éviter derived_invalid_export
export function totalRulesDetected() {
  return auditState.rulesDetected.reduce((total, rule) => total + (rule.detectedCount || 0), 0);
}

export function rulesCategoriesStats() {
  const stats = {
    standard: { count: 0, total: 6 },
    'ai-ready': { count: 0, total: 2 },
    'ai-active': { count: 0, total: 1 }
  };
  
  auditState.rulesDetected.forEach(rule => {
    const ruleInfo = rulesList.find(r => r.id === rule.id);
    if (ruleInfo && rule.detectedCount > 0) {
      stats[ruleInfo.category].count++;
    }
  });
  
  return stats;
}

// Fonction pour récupérer toutes les règles avec leur statut (conforme/non-conforme)
export function allRulesWithStatus() {
  return rulesList.map(rule => {
    const detectedRule = auditState.rulesDetected.find(r => r.id === rule.id);
    const detectedCount = detectedRule ? detectedRule.detectedCount : 0;
    
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
  auditState.currentView = 'report';
  auditState.isLoading = false;
  auditState.error = null;
  
  // Transformer les résultats en format pour Chart.js
  processAuditResults(results);
}

export function resetAudit() {
  auditState.currentView = 'home';
  auditState.results = null;
  auditState.rulesDetected = [];
  auditState.rulesByComponent = [];
  auditState.rulesByType = [];
  auditState.error = null;
  auditState.isLoading = false;
}

// Fonction temporaire pour tester l'interface avec des données d'exemple
export function setTestData() {
  const testResults = {
    summary: {
      totalIssues: 45,
      issuesByRule: {
        'detached-styles': 15,
        'layer-naming': 12,
        'auto-layout-usage': 8,
        'group-vs-frame': 6,
        'hidden-layers': 4
      }
    },
    resultsByRule: {
      'detached-styles': Array.from({length: 15}, (_, i) => ({
        nodeId: `node-${i}`,
        nodeName: `Component ${i+1}`,
        message: 'Style détaché détecté'
      })),
      'layer-naming': Array.from({length: 12}, (_, i) => ({
        nodeId: `node-naming-${i}`,
        nodeName: `Frame ${i+1}`,
        message: 'Nom par défaut détecté'
      })),
      'auto-layout-usage': Array.from({length: 8}, (_, i) => ({
        nodeId: `node-layout-${i}`,
        nodeName: `Container ${i+1}`,
        message: 'Auto Layout manquant'
      })),
      'group-vs-frame': Array.from({length: 6}, (_, i) => ({
        nodeId: `node-group-${i}`,
        nodeName: `Group ${i+1}`,
        message: 'Groupe au lieu de Frame'
      })),
      'hidden-layers': Array.from({length: 4}, (_, i) => ({
        nodeId: `node-hidden-${i}`,
        nodeName: `Hidden Layer ${i+1}`,
        message: 'Calque masqué'
      }))
    }
  };

  auditState.results = testResults;
  auditState.currentView = 'report';
  auditState.isLoading = false;
  auditState.error = null;
  
  processAuditResults(testResults);
}

function processAuditResults(results) {
  // Traitement des résultats réels de l'API /api/audit-figma
  const { summary, resultsByRule } = results;
  
  // Mapper les IDs de règles vers nos règles connues
  const ruleIdMap = {
    'detached-styles': 3,
    'layer-naming': 2, 
    'auto-layout-usage': 1,
    'missing-export-settings': 4,
    'group-vs-frame': 6,
    'hidden-layers': 5,
    'find-component-candidates': 7,
    'interaction-states': 8,
    'color-names': 9
  };
  
  // Créer l'array des règles détectées avec les vraies données
  auditState.rulesDetected = rulesList.map(rule => {
    const ruleKey = Object.keys(ruleIdMap).find(key => ruleIdMap[key] === rule.id);
    const detectedCount = ruleKey && summary.issuesByRule[ruleKey] ? summary.issuesByRule[ruleKey] : 0;
    
    return {
      id: rule.id,
      name: rule.name,
      category: rule.category,
      detectedCount
    };
  });
  
  // Traiter les résultats pour les rapports détaillés
  const byComponent = [];
  const byRule = [];
  
  // Convertir resultsByRule en format pour nos composants
  for (const [ruleKey, issues] of Object.entries(resultsByRule)) {
    const ruleId = ruleIdMap[ruleKey];
    const rule = rulesList.find(r => r.id === ruleId);
    
    if (rule && issues.length > 0) {
      byRule.push({
        ruleId: rule.id,
        ruleName: rule.name,
        issues: issues.length,
        components: issues.map(issue => issue.nodeName)
      });
      
      // Grouper par composant pour la vue par composant
      issues.forEach(issue => {
        let component = byComponent.find(c => c.id === issue.nodeId);
        if (!component) {
          component = {
            id: issue.nodeId,
            name: issue.nodeName,
            type: 'FRAME', // Type par défaut, pourrait être amélioré
            issues: []
          };
          byComponent.push(component);
        }
        
        component.issues.push({
          ruleId: rule.id,
          message: issue.message,
          severity: getSeverityFromRule(rule.id)
        });
      });
    }
  }
  
  auditState.rulesByComponent = byComponent;
  auditState.rulesByType = byRule;
}

// Helper function pour déterminer la sévérité selon la règle
function getSeverityFromRule(ruleId) {
  const highImpact = [3, 1, 8]; // detached-styles, auto-layout-usage, interaction-states
  const mediumImpact = [2, 7, 4]; // layer-naming, component-candidates, export-settings
  
  if (highImpact.includes(ruleId)) return 'warning';
  if (mediumImpact.includes(ruleId)) return 'info';
  return 'info';
}