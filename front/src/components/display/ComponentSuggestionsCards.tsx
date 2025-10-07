import React, { useState, useEffect } from 'react';

/**
 * Component for displaying AI-generated component suggestions
 * Shows cards with component name, description, interactivity status, and usable nodes
 */

interface Node {
  name: string;
  nodeId: string;
}

interface ComponentSuggestion {
  componentName: string;
  description: string;
  possibleInstances: Node[];
  usableNodes: Node[];
}

interface ComponentSuggestionsCardsProps {
  componentSuggestions?: ComponentSuggestion[];
  baseFigmaUrl?: string;
}

interface AccordionState {
  instances: boolean;
  structure: boolean;
}

const ComponentSuggestionsCards: React.FC<ComponentSuggestionsCardsProps> = ({
  componentSuggestions = [],
  baseFigmaUrl = ''
}) => {
  // State for accordions - track which sections are open for each suggestion
  const [accordionStates, setAccordionStates] = useState<Record<number, AccordionState>>({});

  // State for main accordion (collapsed by default)
  const [isMainAccordionOpen, setIsMainAccordionOpen] = useState(false);

  // Helper function to generate Figma URLs for nodes
  const getFigmaNodeUrl = (nodeId: string, baseUrl: string = ''): string => {
    if (!baseUrl || !nodeId) return '#';
    try {
      const url = new URL(baseUrl);
      url.searchParams.set('node-id', nodeId);
      return url.toString();
    } catch {
      return '#';
    }
  };

  // Initialize accordion states for each suggestion
  useEffect(() => {
    if (componentSuggestions.length > 0) {
      setAccordionStates(prev => {
        const newStates = { ...prev };
        componentSuggestions.forEach((_, index) => {
          if (!newStates[index]) {
            newStates[index] = {
              instances: false,
              structure: false
            };
          }
        });
        return newStates;
      });
    }
  }, [componentSuggestions]);

  const toggleAccordion = (suggestionIndex: number, section: keyof AccordionState) => {
    setAccordionStates(prev => ({
      ...prev,
      [suggestionIndex]: {
        ...prev[suggestionIndex],
        [section]: !prev[suggestionIndex]?.[section]
      }
    }));
  };

  const toggleMainAccordion = () => {
    setIsMainAccordionOpen(prev => !prev);
  };

  // If no suggestions, don't render anything
  if (!componentSuggestions || componentSuggestions.length === 0) {
    return null;
  }

  return (
    <section className="mb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          🧩 Suggestions de composants
        </h2>
        <p className="text-white/70">
          Patterns détectés par IA qui pourraient être transformés en composants réutilisables
        </p>
      </div>

      {/* Encart cliquable avec résumé */}
      <button
        className="w-full bg-figma-card border border-gray-600 rounded-lg p-4 hover:border-gray-500 transition-all duration-200 mb-4"
        onClick={toggleMainAccordion}
      >
        <div className="flex items-center justify-between">
          <div className="text-left">
            <p className="text-white/60 text-sm">
              {componentSuggestions.length} suggestion{componentSuggestions.length > 1 ? 's' : ''} de composant{componentSuggestions.length > 1 ? 's' : ''} détectée{componentSuggestions.length > 1 ? 's' : ''}
              • {componentSuggestions.reduce((sum, s) => sum + s.possibleInstances.length, 0)} instances au total
            </p>
          </div>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`transition-transform duration-200 text-white/60 ${isMainAccordionOpen ? 'rotate-180' : ''}`}
          >
            <path d="M7 10L12 15L17 10H7Z" fill="currentColor"/>
          </svg>
        </div>
      </button>

      {/* Contenu de l'accordéon avec animation */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isMainAccordionOpen ? 'max-h-[9999px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {componentSuggestions.map((suggestion, suggestionIndex) => (
            <div key={suggestionIndex} className="bg-figma-card border border-gray-600 rounded-lg p-6 hover:border-gray-500 transition-colors">
              {/* Header with component name */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-white">
                  {suggestion.componentName}
                </h3>
              </div>

              {/* Description */}
              <p className="text-white/80 text-sm mb-6 leading-relaxed">
                {suggestion.description}
              </p>

              {/* Possible Instances */}
              <div className="mb-6">
                <button
                  className="w-full flex items-center justify-between text-sm font-medium text-white mb-3 hover:text-white/80 transition-colors"
                  onClick={() => toggleAccordion(suggestionIndex, 'instances')}
                >
                  <span>Instances détectées ({suggestion.possibleInstances.length})</span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={`transition-transform duration-200 ${accordionStates[suggestionIndex]?.instances ? 'rotate-180' : ''}`}
                  >
                    <path d="M7 10L12 15L17 10H7Z" fill="currentColor"/>
                  </svg>
                </button>

                {accordionStates[suggestionIndex]?.instances && (
                  <div className="space-y-2">
                    {suggestion.possibleInstances.map((instance, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-figma-background rounded border border-gray-700">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center">
                            <span className="text-blue-400 mr-2">{index + 1}.</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-white truncate font-medium">
                                {instance.name}
                              </p>
                              <p className="text-xs text-white/60 font-mono">
                                {instance.nodeId}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Link to this specific instance */}
                        {baseFigmaUrl && (
                          <a
                            href={getFigmaNodeUrl(instance.nodeId, baseFigmaUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-3 text-blue-400 hover:text-blue-300 transition-colors text-xs"
                            title="Voir cette instance dans Figma"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M15 7H20V12H15V7Z" fill="currentColor"/>
                              <path d="M10 7H15V12H10V17H5V12H10V7Z" fill="currentColor"/>
                              <path d="M10 17V22H15V17H10Z" fill="currentColor"/>
                            </svg>
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Usable Nodes (Structure example) */}
              <div>
                <button
                  className="w-full flex items-center justify-between text-sm font-medium text-white mb-3 hover:text-white/80 transition-colors"
                  onClick={() => toggleAccordion(suggestionIndex, 'structure')}
                >
                  <span>Structure du composant ({suggestion.usableNodes.length} éléments)</span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={`transition-transform duration-200 ${accordionStates[suggestionIndex]?.structure ? 'rotate-180' : ''}`}
                  >
                    <path d="M7 10L12 15L17 10H7Z" fill="currentColor"/>
                  </svg>
                </button>

                {accordionStates[suggestionIndex]?.structure && (
                  <div className="space-y-1">
                    {suggestion.usableNodes.map((node, index) => (
                      <div key={index} className="flex items-center p-2 bg-figma-background rounded border border-gray-700">
                        <div className="flex-1 min-w-0">
                          {/* Visual hierarchy indication */}
                          <div className="flex items-center">
                            {index === 0 ? (
                              <span className="text-green-400 mr-2">📦</span>
                            ) : (
                              <span className="text-gray-400 mr-2 ml-4">└─</span>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-white truncate font-medium">
                                {node.name}
                              </p>
                              <p className="text-xs text-white/60 font-mono">
                                {node.nodeId}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="mt-6 pt-4 border-t border-gray-700">
                {baseFigmaUrl && suggestion.usableNodes.length > 0 ? (
                  <a
                    href={getFigmaNodeUrl(suggestion.usableNodes[0].nodeId, baseFigmaUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium bg-figma-button hover:bg-figma-button/80 text-white rounded-lg transition-colors"
                    title="Voir la première instance dans Figma"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15 7H20V12H15V7Z" fill="currentColor"/>
                      <path d="M10 7H15V12H10V17H5V12H10V7Z" fill="currentColor"/>
                      <path d="M10 17V22H15V17H10Z" fill="currentColor"/>
                    </svg>
                    Voir l'exemple dans Figma
                  </a>
                ) : (
                  <button
                    disabled
                    className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium bg-gray-600 text-gray-400 rounded-lg cursor-not-allowed"
                  >
                    URL Figma non disponible
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ComponentSuggestionsCards;
