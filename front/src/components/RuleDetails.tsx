import React from 'react';
import { useAudit } from '../contexts/AuditContext';

interface RuleDetailsProps {
  ruleId: string;
  isOpen?: boolean;
  moreInfos?: Record<string, string>;
}

const RuleDetails: React.FC<RuleDetailsProps> = ({ ruleId, isOpen = false, moreInfos = {} }) => {
  const { getRuleById } = useAudit();
  const rule = getRuleById(ruleId);

  const getDynamicDetailsStyle = (hexColor?: string): React.CSSProperties => {
    const defaultColor = '#6B7280';
    const color = hexColor || defaultColor;

    return {
      backgroundColor: `${color}10`,
      borderColor: `${color}80`,
      color: color
    };
  };

  const getMoreInfosBorderStyle = (hexColor?: string): React.CSSProperties => {
    const defaultColor = '#6B7280';
    const color = hexColor || defaultColor;

    return {
      borderLeftColor: color
    };
  };

  if (!isOpen || !rule) return null;

  return (
    <div
      className="p-4 rounded-lg border animate-in slide-in-from-top-2 duration-200"
      style={getDynamicDetailsStyle(rule?.color)}
    >
      {/* Titre avec icône */}
      <div className="flex items-center space-x-2 mb-3">
        <span className="text-xl">{rule.icon}</span>
        <h4 className="text-white font-semibold">{rule.name}</h4>
      </div>

      {/* Description et conseil sur la même ligne sur grands écrans */}
      <div className="space-y-3 text-sm text-white/80">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="leading-relaxed">
            <span className="font-medium">📋</span> {rule.description}
          </div>
          <div className="leading-relaxed">
            <span className="font-medium">💡</span> {rule.resolutionAdvice || "Consulter la documentation Figma"}
          </div>
        </div>

        {/* Affichage des moreInfos si présentes */}
        {moreInfos && moreInfos[ruleId.toString()] && moreInfos[ruleId.toString()].trim() && (
          <div
            className="bg-black/20 rounded-lg p-3 border-l-2"
            style={getMoreInfosBorderStyle(rule?.color)}
          >
            <div className="leading-relaxed">
              <span className="font-medium">🔍</span> <strong>Détails :</strong> {moreInfos[ruleId.toString()]}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RuleDetails;
