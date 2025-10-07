import React from 'react';
import { useAudit } from './contexts/AuditContext';
import InputForm from './components/forms/InputForm';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorDisplay from './components/common/ErrorDisplay';
import StatsCards from './components/display/StatsCards';
import TotalDetectedRules from './components/display/TotalDetectedRules';
import FigmaDescription from './components/display/FigmaDescription';
import DesignSystemViewer from './components/display/DesignSystemViewer';
import DetailedTables from './components/display/DetailedTables';
import ComponentSuggestionsCards from './components/display/ComponentSuggestionsCards';

const App: React.FC = () => {
  const { state, showReport, hasComponentSuggestions, getComponentSuggestions, getFigmaAiDescription } = useAudit();

  // Titre intégré (pas de composant séparé selon les specs)
  const title = 'FigmAnalyse de maquette';

  // Message NoReportGenerated intégré (pas de composant séparé)
  const noReportMessage = 'Aucun rapport généré pour le moment';

  return (
    <div className="min-h-screen bg-figma-background">
      <div className="w-full px-8 py-12">
        {/* Titre intégré */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            {title}
          </h1>
        </header>

        {/* Formulaire toujours visible selon les specs */}
        <section className="mb-8">
          <InputForm />
        </section>

        {/* États conditionnels */}
        {state.error ? (
          <ErrorDisplay />
        ) : state.isLoading ? (
          <LoadingSpinner />
        ) : showReport() ? (
          /* Mode rapport */
          <div className="space-y-8">
            {/* Règles détectées et description côte à côte */}
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1">
                <TotalDetectedRules />
              </div>
              <div className="flex-1">
                <FigmaDescription description={getFigmaAiDescription()} />
              </div>
            </div>

            {/* Design System Viewer */}
            <DesignSystemViewer />

            {/* Component Suggestions (si disponibles) */}
            {hasComponentSuggestions() && (
              <ComponentSuggestionsCards
                componentSuggestions={getComponentSuggestions()}
                baseFigmaUrl={state.figmaUrl}
              />
            )}

            {/* cartes statistiques en haut */}
            <StatsCards />

            {/* Rapport d'analyse prend toute la largeur */}
            <div className="w-full">
              <DetailedTables />
            </div>
          </div>
        ) : (
          /* État initial - NoReportGenerated intégré */
          <section className="text-center py-16 w-full">
            <h2 className="text-2xl font-semibold text-white mb-6">
              {noReportMessage}
            </h2>
          </section>
        )}
      </div>
    </div>
  );
};

export default App;
