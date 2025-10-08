import React from 'react';
import { useAudit } from '../contexts/AuditContext';

interface RuleBadgeProps {
  ruleId: number;
  isActive?: boolean;
  onClick?: () => void;
}

const RuleBadge: React.FC<RuleBadgeProps> = ({ ruleId, isActive = false, onClick }) => {
  const { getRuleById } = useAudit();
  const rule = getRuleById(ruleId);

  const getDynamicBadgeStyle = (hexColor?: string): React.CSSProperties => {
    const defaultColor = '#6B7280';
    const color = hexColor || defaultColor;

    return {
      backgroundColor: `${color}20`,
      color: color,
      borderColor: `${color}80`
    };
  };

  const badgeClass = `inline-flex items-center px-2 py-1 rounded-full text-xs font-medium cursor-pointer transition-all duration-200 border ${
    isActive ? 'ring-2 ring-figma-button ring-opacity-50' : ''
  }`.trim();

  return (
    <button
      className={badgeClass}
      style={getDynamicBadgeStyle(rule?.color)}
      onClick={onClick}
      title={rule?.description || `Règle #${ruleId}`}
    >
      {rule?.icon && <span className="mr-1">{rule.icon}</span>}
      <span>{rule?.name || `Règle #${ruleId}`}</span>
    </button>
  );
};

export default RuleBadge;
