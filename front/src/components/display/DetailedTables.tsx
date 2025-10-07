import React, { useState } from 'react';
import { useAudit } from '../../contexts/AuditContext';
import RuleBadge from '../RuleBadge';
import RuleDetails from '../RuleDetails';
import { generateNodeUrl } from '../../utils/api';

const DetailedTables: React.FC = () => {
  const { getFilteredReportData, state } = useAudit();
  const [activeDetails, setActiveDetails] = useState<Record<string, string | null>>({});

  const groupedData = getFilteredReportData();

  const toggleDetails = (nodeId: string, ruleId: string) => {
    if (activeDetails[nodeId] === ruleId) {
      // Fermer si le même badge est cliqué
      setActiveDetails({ ...activeDetails, [nodeId]: null });
    } else {
      // Ouvrir le nouvel accordéon
      setActiveDetails({ ...activeDetails, [nodeId]: ruleId });
    }
  };

  const isDetailOpen = (nodeId: string, ruleId: string) => {
    return activeDetails[nodeId] === ruleId;
  };

  return (
    <div className="space-y-8">
      {/* Titre principal */}
      <h2 className="text-xl font-semibold text-white">
        Rapport d'analyse
      </h2>

      {groupedData.length === 0 ? (
        /* Message de félicitations quand aucune règle n'est détectée */
        <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold text-green-400 mb-2">
            Félicitations !
          </h3>
          <p className="text-lg text-green-300 mb-4">
            Votre design respecte parfaitement toutes les règles d'audit.
          </p>
          <p className="text-figma-textMuted">
            Aucune amélioration nécessaire - excellent travail !
          </p>
        </div>
      ) : (
        /* Tableau avec badges groupés par identifiant */
        <div className="bg-figma-card rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-figma-cardLight border-b border-gray-600">
                <tr className="text-figma-textMuted">
                  <th className="px-4 py-3 text-left">👤 ID Node</th>
                  <th className="px-4 py-3 text-left">📝 Nom node</th>
                  <th className="px-4 py-3 text-left">📋 Règles détectées</th>
                  <th className="px-4 py-3 text-left">🔗 Vérifier dans la maquette</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-600">
                {groupedData.map(node => (
                  <React.Fragment key={node.nodeId}>
                    {/* Ligne principale avec les badges */}
                    <tr className="text-white hover:bg-figma-cardLight transition-colors">
                      {/* ID Node */}
                      <td className="px-4 py-3 font-mono text-xs text-figma-button align-top">
                        {node.nodeId}
                      </td>

                      {/* Nom Node */}
                      <td className="px-4 py-3 font-medium align-top">
                        {node.nodeName}
                      </td>

                      {/* Badges des règles */}
                      <td className="px-4 py-3 align-top">
                        <div className="flex flex-wrap gap-2">
                          {node.ruleIds.map(ruleId => (
                            <RuleBadge
                              key={ruleId}
                              ruleId={ruleId}
                              isActive={isDetailOpen(node.nodeId, ruleId)}
                              onClick={() => toggleDetails(node.nodeId, ruleId)}
                            />
                          ))}
                        </div>
                      </td>

                      {/* Bouton Figma */}
                      <td className="px-4 py-3 align-top">
                        {state.figmaUrl ? (
                          <a
                            href={generateNodeUrl(state.figmaUrl, node.nodeId) || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium bg-figma-button hover:bg-figma-button/80 text-white rounded-lg transition-colors"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M15 7H20V12H15V7Z" fill="currentColor"/>
                              <path d="M10 7H15V12H10V17H5V12H10V7Z" fill="currentColor"/>
                              <path d="M10 17V22H15V17H10Z" fill="currentColor"/>
                            </svg>
                            Voir dans Figma
                          </a>
                        ) : (
                          <span className="text-figma-textMuted text-xs">URL non disponible</span>
                        )}
                      </td>
                    </tr>

                    {/* Ligne de l'accordéon qui s'étend sur toute la largeur */}
                    {node.ruleIds.map(ruleId => (
                      isDetailOpen(node.nodeId, ruleId) && (
                        <tr key={`${node.nodeId}-${ruleId}`}>
                          <td colSpan={4} className="p-0">
                            <RuleDetails
                              ruleId={ruleId}
                              isOpen={true}
                              moreInfos={node.moreInfos}
                            />
                          </td>
                        </tr>
                      )
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailedTables;
