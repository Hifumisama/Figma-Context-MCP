import React, { useEffect, useRef } from 'react';
import { Chart, ArcElement, Tooltip, Legend, DoughnutController, ChartConfiguration } from 'chart.js';
import { useAudit } from '../../contexts/AuditContext';

// Enregistrer les composants Chart.js nécessaires
Chart.register(ArcElement, Tooltip, Legend, DoughnutController);

const TotalDetectedRules: React.FC = () => {
  const { chartData, totalRulesDetected, allRulesWithStatus } = useAudit();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  const data = chartData();
  const total = totalRulesDetected();
  const rulesWithStatus = allRulesWithStatus();

  useEffect(() => {
    if (!canvasRef.current || !data) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Détruire l'ancien graphique s'il existe
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    // Créer le nouveau graphique
    const config: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: '#081028',
            titleColor: '#FFFFFF',
            bodyColor: '#AEB9E1',
            borderColor: '#CB3CFF',
            borderWidth: 1,
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.parsed;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
                return `${label}: ${value} problèmes (${percentage}%)`;
              }
            }
          }
        },
        cutout: '70%',
        animation: {
          animateRotate: true,
          animateScale: true,
          duration: 1000,
          easing: 'easeInOutQuart'
        },
        elements: {
          arc: {
            borderWidth: 2,
            borderColor: '#FFFFFF'
          }
        }
      }
    };

    chartInstanceRef.current = new Chart(ctx, config);

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [data]);

  const getRuleColorStyle = (hexColor?: string): React.CSSProperties => {
    if (!hexColor || hexColor === 'gray') {
      return { backgroundColor: '#6B7280' };
    }
    return { backgroundColor: hexColor };
  };

  return (
    <div className="card-figma">
      <div className="space-y-4">
        {/* Titre principal */}
        <h3 className="text-white font-semibold text-lg text-center">
          Règles détectées
        </h3>

        {/* Chart et légende */}
        {data && total > 0 ? (
          <div className="flex items-center justify-center space-x-8">
            {/* Graphique Chart.js agrandi avec texte centré */}
            <div className="relative w-44 h-44 flex-shrink-0">
              <canvas ref={canvasRef}></canvas>
              {/* Texte au centre du doughnut */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="text-2xl font-bold text-figma-button">
                  {total}
                </div>
                <div className="text-xs text-figma-textMuted">
                  détections
                </div>
              </div>
            </div>

            {/* Légende personnalisée pour chaque règle avec détections */}
            <div className="space-y-2 max-w-xs">
              {rulesWithStatus.filter(rule => rule.detectedCount > 0).map(rule => (
                <div key={rule.id} className="flex items-center space-x-3 text-sm">
                  <div className="w-3 h-3 rounded-full" style={getRuleColorStyle(rule.color)}></div>
                  <span className="text-white text-xs">
                    {rule.nameFr || rule.name}
                  </span>
                  <span className="text-figma-textMuted text-xs">
                    {rule.detectedCount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* État vide */
          <div className="text-center text-figma-textMuted">
            <div className="text-3xl mb-2">📊</div>
            <p className="text-sm">Aucune règle détectée</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TotalDetectedRules;
