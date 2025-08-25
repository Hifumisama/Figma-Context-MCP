// État de l'application
class AppState {
    constructor() {
        this.currentPage = 'homepage';
        this.analysisData = null;
        this.isAnalyzing = false;
    }

    setCurrentPage(page) {
        this.currentPage = page;
        this.updatePageVisibility();
    }

    updatePageVisibility() {
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById(this.currentPage).classList.add('active');
    }

    setAnalysisData(data) {
        this.analysisData = data;
    }

    setAnalyzing(state) {
        this.isAnalyzing = state;
        this.updateButtonStates();
    }

    updateButtonStates() {
        const buttons = document.querySelectorAll('.primary-button');
        buttons.forEach(button => {
            if (this.isAnalyzing) {
                button.disabled = true;
                button.textContent = 'Analyse en cours...';
                button.style.opacity = '0.6';
            } else {
                button.disabled = false;
                button.textContent = 'Analyser la maquette';
                button.style.opacity = '1';
            }
        });
    }
}

// Gestionnaire de données d'analyse simulées
class AnalysisDataManager {
    static generateMockData(figmaLink) {
        // Simulation de données d'analyse
        const ruleTypes = [
            { name: 'Style détaché', count: 8, color: 'purple' },
            { name: 'Auto-layout manquant', count: 12, color: 'blue' },
            { name: 'Nom layer incorrect', count: 6, color: 'dark-blue' },
            { name: 'Frame privilégié', count: 4, color: 'yellow' }
        ];

        const componentAnalysis = [];
        for (let i = 0; i < 5; i++) {
            componentAnalysis.push({
                id: `10:${114 + i}`,
                name: `Frame ${61 + i}`,
                rule: 'Nom de layer incorrect',
                advice: 'Ce nom de layer est trop générique, veuillez en appliquer un plus signifiant'
            });
        }

        const ruleAnalysis = [
            {
                id: 'check-layer-naming',
                name: 'Noms de calques incorrects',
                advice: 'Ce nom de layer est trop générique, veuillez en appliquer un plus signifiant',
                nodes: [
                    { id: '10:114', name: 'Frame 61' },
                    { id: '10:115', name: 'Frame 62' },
                    { id: '10:116', name: 'Frame 63' }
                ]
            },
            {
                id: 'check-auto-layout',
                name: 'Auto-layout manquant',
                advice: 'Utilisez auto-layout pour améliorer la structure et la réactivité',
                nodes: [
                    { id: '12:118', name: 'Container 1' },
                    { id: '12:119', name: 'Container 2' }
                ]
            }
        ];

        return {
            figmaLink,
            totalDetections: ruleTypes.reduce((sum, rule) => sum + rule.count, 0),
            ruleTypes,
            componentAnalysis,
            ruleAnalysis,
            timestamp: new Date().toISOString()
        };
    }
}

// Gestionnaire de l'interface utilisateur
class UIManager {
    static updateRuleTypes(ruleTypes) {
        const rulesTypesContainer = document.querySelector('.rules-types');
        if (!rulesTypesContainer) return;

        rulesTypesContainer.innerHTML = '';
        
        ruleTypes.forEach(rule => {
            const card = this.createRuleTypeCard(rule);
            rulesTypesContainer.appendChild(card);
        });
    }

    static createRuleTypeCard(rule) {
        const card = document.createElement('div');
        card.className = 'rule-type-card';
        
        card.innerHTML = `
            <div class="rule-container">
                <div class="tooltip-icon ${rule.color}">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <circle cx="6" cy="6" r="5.5" stroke="currentColor" fill="none"/>
                        <text x="6" y="8.5" text-anchor="middle" fill="currentColor" font-size="8" font-family="Arial, sans-serif">?</text>
                    </svg>
                </div>
                <span class="rule-name">${rule.name}</span>
                <div class="dots-menu">
                    <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
                        <circle cx="4" cy="8" r="1.5" fill="#D9E1FA"/>
                        <circle cx="10" cy="8" r="1.5" fill="#D9E1FA"/>
                        <circle cx="16" cy="8" r="1.5" fill="#D9E1FA"/>
                    </svg>
                </div>
            </div>
            <div class="node-container">
                <span class="nodes-label">Nodes :</span>
                <span class="nodes-count">${rule.count}</span>
            </div>
        `;
        
        return card;
    }

    static updateTotalDetections(total) {
        const numberElement = document.querySelector('.rules-number .number');
        if (numberElement) {
            numberElement.textContent = total;
        }
    }

    static updateComponentAnalysis(componentAnalysis) {
        const reportRows = document.querySelector('.report-rows');
        if (!reportRows) return;

        reportRows.innerHTML = '';
        
        componentAnalysis.forEach((item, index) => {
            const row = document.createElement('div');
            row.className = `report-row ${index % 2 === 1 ? 'alternate' : ''}`;
            
            row.innerHTML = `
                <div class="row-cell">${item.id}</div>
                <div class="row-cell">${item.name}</div>
                <div class="row-cell">${item.rule}</div>
                <div class="row-cell">${item.advice}</div>
            `;
            
            reportRows.appendChild(row);
        });
    }

    static updateRuleAnalysis(ruleAnalysis) {
        const accordionSection = document.querySelector('.accordion-section');
        if (!accordionSection) return;

        accordionSection.innerHTML = '';
        
        ruleAnalysis.forEach((rule, index) => {
            const accordionItem = this.createAccordionItem(rule, index === 0);
            accordionSection.appendChild(accordionItem);
        });
        
        // Réattacher les gestionnaires d'événements
        this.attachAccordionListeners();
    }

    static createAccordionItem(rule, isExpanded = false) {
        const item = document.createElement('div');
        item.className = `accordion-item ${isExpanded ? 'expanded' : ''}`;
        
        const nodesRows = rule.nodes.map(node => `
            <div class="nodes-row">
                <div class="nodes-cell">${node.id}</div>
                <div class="nodes-cell">${node.name}</div>
            </div>
        `).join('');

        item.innerHTML = `
            <div class="accordion-header">
                <div class="chevron-icon ${isExpanded ? '' : 'collapsed'}">
                    <svg width="${isExpanded ? '6' : '3'}" height="${isExpanded ? '3' : '6'}" viewBox="0 0 ${isExpanded ? '6 3' : '3 6'}" fill="none">
                        <path d="${isExpanded ? 'M0 0L3 3L6 0' : 'M0 0L3 3L0 6'}" stroke="#AEB9E1" stroke-width="1"/>
                    </svg>
                </div>
                <div class="accordion-content">
                    <span class="rule-id">${rule.id}</span>
                    <span class="rule-title">${rule.name}</span>
                    <span class="rule-advice">${rule.advice}</span>
                </div>
            </div>
            <div class="accordion-body" style="display: ${isExpanded ? 'block' : 'none'};">
                <div class="nodes-list-title">
                    <h4>Liste des nodes</h4>
                </div>
                <div class="nodes-table">
                    <div class="nodes-header">
                        <div class="nodes-column">
                            <div class="header-icon">
                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                    <rect x="0.5" y="6" width="9" height="4" fill="#AEB9E1" rx="1"/>
                                    <circle cx="5" cy="3" r="2.5" fill="#AEB9E1"/>
                                </svg>
                            </div>
                            <span>Id Node</span>
                        </div>
                        <div class="nodes-column">
                            <div class="header-icon">
                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                    <rect x="0.5" y="6" width="9" height="4" fill="#AEB9E1" rx="1"/>
                                    <circle cx="5" cy="3" r="2.5" fill="#AEB9E1"/>
                                </svg>
                            </div>
                            <span>Nom node</span>
                        </div>
                    </div>
                    ${nodesRows}
                </div>
            </div>
        `;
        
        return item;
    }

    static attachAccordionListeners() {
        document.querySelectorAll('.accordion-header').forEach(header => {
            header.addEventListener('click', function() {
                const item = this.closest('.accordion-item');
                const body = item.querySelector('.accordion-body');
                const chevron = item.querySelector('.chevron-icon');
                const chevronSvg = chevron.querySelector('svg');
                const isExpanded = item.classList.contains('expanded');
                
                if (isExpanded) {
                    // Collapse
                    item.classList.remove('expanded');
                    body.style.display = 'none';
                    chevron.classList.add('collapsed');
                    chevronSvg.innerHTML = '<path d="M0 0L3 3L0 6" stroke="#AEB9E1" stroke-width="1"/>';
                    chevronSvg.setAttribute('viewBox', '0 0 3 6');
                    chevronSvg.setAttribute('width', '3');
                    chevronSvg.setAttribute('height', '6');
                } else {
                    // Expand
                    item.classList.add('expanded');
                    body.style.display = 'block';
                    chevron.classList.remove('collapsed');
                    chevronSvg.innerHTML = '<path d="M0 0L3 3L6 0" stroke="#AEB9E1" stroke-width="1"/>';
                    chevronSvg.setAttribute('viewBox', '0 0 6 3');
                    chevronSvg.setAttribute('width', '6');
                    chevronSvg.setAttribute('height', '3');
                }
            });
        });
    }

    static showNotification(message, type = 'info') {
        // Créer une notification temporaire
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#ff4444' : '#4CAF50'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 1000;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Animer l'entrée
        requestAnimationFrame(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        });
        
        // Supprimer après 3 secondes
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Validateur de liens Figma
class FigmaLinkValidator {
    static isValidFigmaLink(link) {
        const figmaPattern = /^https:\/\/(www\.)?figma\.com\/(file|design)\/[a-zA-Z0-9]+/;
        return figmaPattern.test(link);
    }

    static extractFileKey(link) {
        const match = link.match(/figma\.com\/(file|design)\/([a-zA-Z0-9]+)/);
        return match ? match[2] : null;
    }
}

// Gestionnaire principal de l'application
class FigmaAnalysisApp {
    constructor() {
        this.state = new AppState();
        this.init();
    }

    init() {
        this.attachEventListeners();
        this.setupInitialState();
        
        // Charger les données de session si disponibles
        this.loadSessionData();
    }

    attachEventListeners() {
        // Boutons d'analyse
        document.getElementById('analyzeBtn').addEventListener('click', () => {
            this.handleAnalysis('homepage');
        });
        
        document.getElementById('analyzeBtnDash').addEventListener('click', () => {
            this.handleAnalysis('dashboard');
        });
        
        // Synchronisation des champs entre les pages
        document.getElementById('figmaLink').addEventListener('input', (e) => {
            document.getElementById('figmaLinkDash').value = e.target.value;
        });
        
        document.getElementById('figmaLinkDash').addEventListener('input', (e) => {
            document.getElementById('figmaLink').value = e.target.value;
        });
        
        document.getElementById('apiKey').addEventListener('input', (e) => {
            document.getElementById('apiKeyDash').value = e.target.value;
        });
        
        document.getElementById('apiKeyDash').addEventListener('input', (e) => {
            document.getElementById('apiKey').value = e.target.value;
        });
        
        // Gestion de l'accordéon
        UIManager.attachAccordionListeners();
        
        // Écouter les changements d'URL (si on veut supporter la navigation par URL)
        window.addEventListener('popstate', () => {
            this.handleRouteChange();
        });
    }

    setupInitialState() {
        // Masquer le message "aucun rapport" au démarrage si on a des données
        if (this.state.analysisData) {
            document.getElementById('noReport').style.display = 'none';
        }
    }

    async handleAnalysis(source) {
        const figmaLinkInput = source === 'homepage' ? 
            document.getElementById('figmaLink') : 
            document.getElementById('figmaLinkDash');
        
        const apiKeyInput = source === 'homepage' ? 
            document.getElementById('apiKey') : 
            document.getElementById('apiKeyDash');
        
        const figmaLink = figmaLinkInput.value.trim();
        const apiKey = apiKeyInput.value.trim();
        
        // Validation
        if (!figmaLink) {
            UIManager.showNotification('Veuillez saisir un lien Figma', 'error');
            figmaLinkInput.focus();
            return;
        }
        
        if (!FigmaLinkValidator.isValidFigmaLink(figmaLink)) {
            UIManager.showNotification('Le lien Figma n\'est pas valide', 'error');
            figmaLinkInput.focus();
            return;
        }
        
        // Démarrer l'analyse
        this.state.setAnalyzing(true);
        
        try {
            // Simuler un délai d'analyse
            await this.simulateAnalysis(figmaLink, apiKey);
            
            // Générer des données d'analyse simulées
            const analysisData = AnalysisDataManager.generateMockData(figmaLink);
            this.state.setAnalysisData(analysisData);
            
            // Mettre à jour l'interface
            this.updateDashboardWithData(analysisData);
            
            // Passer au dashboard
            this.state.setCurrentPage('dashboard');
            
            // Masquer le message "aucun rapport"
            document.getElementById('noReport').style.display = 'none';
            
            // Sauvegarder en session
            this.saveSessionData(analysisData);
            
            UIManager.showNotification('Analyse terminée avec succès !', 'success');
            
        } catch (error) {
            console.error('Erreur lors de l\'analyse:', error);
            UIManager.showNotification('Erreur lors de l\'analyse. Veuillez réessayer.', 'error');
        } finally {
            this.state.setAnalyzing(false);
        }
    }

    async simulateAnalysis(figmaLink, apiKey) {
        // Simuler un appel API avec délai
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, 2000 + Math.random() * 1000); // 2-3 secondes
        });
    }

    updateDashboardWithData(data) {
        UIManager.updateRuleTypes(data.ruleTypes);
        UIManager.updateTotalDetections(data.totalDetections);
        UIManager.updateComponentAnalysis(data.componentAnalysis);
        UIManager.updateRuleAnalysis(data.ruleAnalysis);
    }

    saveSessionData(data) {
        try {
            sessionStorage.setItem('figmaAnalysisData', JSON.stringify(data));
        } catch (error) {
            console.warn('Impossible de sauvegarder les données en session:', error);
        }
    }

    loadSessionData() {
        try {
            const saved = sessionStorage.getItem('figmaAnalysisData');
            if (saved) {
                const data = JSON.parse(saved);
                this.state.setAnalysisData(data);
                
                // Remplir les champs avec le dernier lien analysé
                if (data.figmaLink) {
                    document.getElementById('figmaLink').value = data.figmaLink;
                    document.getElementById('figmaLinkDash').value = data.figmaLink;
                }
                
                // Mettre à jour le dashboard
                this.updateDashboardWithData(data);
                
                // Si on a des données, aller directement au dashboard
                this.state.setCurrentPage('dashboard');
                document.getElementById('noReport').style.display = 'none';
            }
        } catch (error) {
            console.warn('Impossible de charger les données de session:', error);
        }
    }

    handleRouteChange() {
        // Gérer les changements de route si nécessaire
        const hash = window.location.hash;
        if (hash === '#dashboard' && this.state.analysisData) {
            this.state.setCurrentPage('dashboard');
        } else {
            this.state.setCurrentPage('homepage');
        }
    }

    // Méthode publique pour revenir à l'accueil
    goToHomepage() {
        this.state.setCurrentPage('homepage');
        window.history.pushState({}, '', '#');
    }

    // Méthode publique pour aller au dashboard
    goToDashboard() {
        if (this.state.analysisData) {
            this.state.setCurrentPage('dashboard');
            window.history.pushState({}, '', '#dashboard');
        }
    }
}

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', () => {
    window.figmaApp = new FigmaAnalysisApp();
    
    // Ajouter des fonctions globales pour les tests ou le débogage
    window.debugApp = {
        generateTestData: () => {
            const testData = AnalysisDataManager.generateMockData('https://www.figma.com/file/test123/Test-File');
            window.figmaApp.state.setAnalysisData(testData);
            window.figmaApp.updateDashboardWithData(testData);
            window.figmaApp.state.setCurrentPage('dashboard');
            UIManager.showNotification('Données de test chargées', 'success');
        },
        
        clearData: () => {
            sessionStorage.removeItem('figmaAnalysisData');
            window.figmaApp.state.setAnalysisData(null);
            window.figmaApp.state.setCurrentPage('homepage');
            document.getElementById('noReport').style.display = 'block';
            UIManager.showNotification('Données effacées', 'info');
        },
        
        getCurrentState: () => {
            return window.figmaApp.state;
        }
    };
});

// Gestion des erreurs globales
window.addEventListener('error', (event) => {
    console.error('Erreur JavaScript:', event.error);
    UIManager.showNotification('Une erreur inattendue s\'est produite', 'error');
});

// Gestion des erreurs de promesses non catchées
window.addEventListener('unhandledrejection', (event) => {
    console.error('Promesse rejetée non gérée:', event.reason);
    UIManager.showNotification('Une erreur inattendue s\'est produite', 'error');
    event.preventDefault();
});

// Export pour les tests (si module)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        FigmaAnalysisApp,
        AnalysisDataManager,
        UIManager,
        FigmaLinkValidator
    };
}
