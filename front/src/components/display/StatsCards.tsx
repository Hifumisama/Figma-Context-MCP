import React, { useEffect } from 'react';
import { useAudit } from '../../contexts/AuditContext';

const StatsCards: React.FC = () => {
  const { state, allRulesWithStatus, toggleRuleFilter, clearAllFilters, toggleCompliantRules } = useAudit();

  const statsCards = allRulesWithStatus();
  const filteredCards = state.showCompliantRules ? statsCards : statsCards.filter(card => !card.isCompliant);
  const selectedFilters = state.selectedRulesFilter;

  // Effet pour activer automatiquement "Voir conformes" quand aucune règle n'est détectée
  useEffect(() => {
    const hasDetections = statsCards.some(card => !card.isCompliant);
    if (!hasDetections && !state.showCompliantRules && statsCards.length > 0) {
      toggleCompliantRules();
    }
  }, [statsCards, state.showCompliantRules, toggleCompliantRules]);

  const handleCardClick = (ruleId: number) => {
    toggleRuleFilter(ruleId);
  };

  const isCardActive = (ruleId: number) => {
    return selectedFilters.includes(ruleId);
  };

  const getDynamicCardStyle = (hexColor?: string, isActive: boolean = false): React.CSSProperties => {
    const defaultColor = '#6B7280';
    const color = hexColor || defaultColor;

    if (isActive) {
      return {
        backgroundColor: color,
        borderColor: color,
        color: 'white'
      };
    } else {
      return {
        backgroundColor: `${color}20`,
        borderColor: color,
        color: color
      };
    }
  };

  return (
    <div className="space-y-4">
      {/* Boutons de contrôle */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">
          Règles d'audit
        </h2>
        <div className="flex items-center space-x-3">
          {/* Bouton pour reset les filtres */}
          <button
            onClick={clearAllFilters}
            className={`flex items-center space-x-2 px-3 py-1 rounded-lg bg-figma-card text-figma-textMuted hover:text-white transition-colors text-sm ${selectedFilters.length === 0 ? 'opacity-50' : ''}`}
            disabled={selectedFilters.length === 0}
          >
            <span className="text-xs">🔄</span>
            <span>Retirer filtres</span>
            {selectedFilters.length > 0 && (
              <span className="text-xs opacity-75">
                ({selectedFilters.length})
              </span>
            )}
          </button>

          {/* Bouton pour afficher/masquer les règles conformes */}
          <button
            onClick={toggleCompliantRules}
            className="flex items-center space-x-2 px-3 py-1 rounded-lg bg-figma-card text-figma-textMuted hover:text-white transition-colors text-sm"
          >
            <span className="text-xs">
              {state.showCompliantRules ? '👁️' : '👁️‍🗨️'}
            </span>
            <span>
              {state.showCompliantRules ? 'Masquer conformes' : 'Voir conformes'}
            </span>
            <span className="text-xs opacity-75">
              ({statsCards.filter(card => card.isCompliant).length})
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredCards.map((card) => (
          <button
            key={card.ruleId}
            className="rounded-lg border-l-4 p-4 relative transition-all duration-200 hover:scale-105 cursor-pointer text-left"
            style={getDynamicCardStyle(card.color, isCardActive(card.ruleId))}
            onClick={() => handleCardClick(card.ruleId)}
          >
            {/* Badge en haut à droite */}
            <div className="absolute top-3 right-3">
              {card.isCompliant ? (
                <span className="text-lg">✅</span>
              ) : (
                <div className="flex items-center space-x-1 bg-red-500/20 border border-red-500/50 text-red-400 px-2 py-1 rounded-full text-xs font-medium">
                  <span>⚠️</span>
                  <span>{card.count}</span>
                </div>
              )}
            </div>

            <div className="space-y-3 pr-8">
              <div className="flex items-center space-x-2">
                <span className="text-xl">{card.icon}</span>
                <span className="text-sm font-semibold opacity-90">{card.name}</span>
              </div>

              <p className="text-xs opacity-70 leading-relaxed">
                {card.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default StatsCards;
