import React from 'react';
import { useAudit } from '../contexts/AuditContext';

interface RuleBadgeProps {
  ruleId: string;
  isActive?: boolean;
  onClick?: () => void;
}

const RuleBadge: React.FC<RuleBadgeProps> = ({ ruleId, isActive = false, onClick }) => {
  const { getRuleById } = useAudit();
  const rule = getRuleById(ruleId);

  const getDynamicBadgeStyle = (hexColor?: string): string => {
    const defaultColor = '#6B7280';
    const color = hexColor || defaultColor;

    return `background-color: ${color}20; color: ${color}; border-color: ${color}80;`;
  };

  const getSeverityIcon = (ruleId: string): string => {
    const highImpact = ['3', '1', '8'];
    const mediumImpact = ['2', '7', '4'];

    if (highImpact.includes(ruleId)) return '⚠️';
    if (mediumImpact.includes(ruleId)) return 'ℹ️';
    return '💡';
  };

  const badgeClass = `inline-flex items-center px-2 py-1 rounded-full text-xs font-medium cursor-pointer transition-all duration-200 border ${
    isActive ? 'ring-2 ring-figma-button ring-opacity-50' : ''
  }`.trim();

  const styleString = getDynamicBadgeStyle(rule?.color);
  const styleObject = Object.fromEntries(
    styleString.split(';')
      .map(s => s.trim())
      .filter(Boolean)
      .map(s => s.split(':').map(p => p.trim()))
  );

  return (
    <button
      className={badgeClass}
      style={styleObject}
      onClick={onClick}
      title={rule?.description || `Règle #${ruleId}`}
    >
      <span className="mr-1">{rule?.icon || getSeverityIcon(ruleId)}</span>
      <span>{rule?.name || `Règle #${ruleId}`}</span>
    </button>
  );
};

export default RuleBadge;
