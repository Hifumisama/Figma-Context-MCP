import React, { useState, useEffect, useMemo } from 'react';
import { useAudit } from '../../contexts/AuditContext';

interface TextStyleValue {
  fontFamily?: string;
  fontSize: number;
  fontWeight?: number;
  lineHeight?: string | number;
}

interface TextStyle {
  name: string;
  value: TextStyleValue;
}

interface ColorInfo {
  name: string;
  hexValue: string;
}

interface StrokeValue {
  colors: string[];
  strokeWeight: string;
}

interface StrokeInfo {
  name: string;
  value?: StrokeValue;
  colors?: string[];
  strokeWeight?: string;
}

interface ProcessedStroke {
  name: string;
  colors: string[];
  strokeWeight: string;
}

const DesignSystemViewer: React.FC = () => {
  const { state } = useAudit();

  // États pour les sélections actives
  const [selectedTextStyle, setSelectedTextStyle] = useState<TextStyle | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('#FFFFFF');
  const [selectedColorName, setSelectedColorName] = useState<string>('couleur');
  const [selectedStroke, setSelectedStroke] = useState<{ color: string; weight: string }>({
    color: '#000000',
    weight: '1px'
  });
  const [selectedStrokeName, setSelectedStrokeName] = useState<string>('');

  // État pour l'accordéon principal (fermé par défaut)
  const [isDesignSystemOpen, setIsDesignSystemOpen] = useState<boolean>(false);

  // Fonction pour convertir la lineHeight en pixels
  const lineHeightToPixels = (lineHeight: string | number, fontSize: number): number => {
    if (typeof lineHeight === 'string') {
      if (lineHeight.endsWith('em')) {
        return Math.round(parseFloat(lineHeight) * fontSize);
      }
      if (lineHeight.endsWith('px')) {
        return parseInt(lineHeight);
      }
    }
    // Fallback: lineHeight as multiplier
    return Math.round((lineHeight as number) * fontSize);
  };

  // Fonction pour obtenir les styles CSS du texte sélectionné
  const getTextStyles = () => {
    if (!selectedTextStyle) {
      return {
        fontFamily: 'Roboto, sans-serif',
        fontSize: '16px',
        fontWeight: '400',
        lineHeight: '1.5',
        color: '#FFFFFF'
      };
    }

    const style = selectedTextStyle.value || selectedTextStyle;
    return {
      fontFamily: style.fontFamily || 'Roboto, sans-serif',
      fontSize: `${style.fontSize}px`,
      fontWeight: style.fontWeight?.toString() || '400',
      lineHeight: style.lineHeight || '1.5',
      color: '#FFFFFF'
    };
  };

  // Récupération des données du design system
  const designSystem = useMemo(() => state.designSystem, [state.designSystem]);
  const localStyles = useMemo(() => state.localStyles, [state.localStyles]);

  // Les styles de texte sont maintenant dans designSystem.text avec structure {name, value}
  const textStyles = useMemo(() => designSystem?.text || {}, [designSystem]);

  // Les couleurs du design system avec structure {name, hexValue}
  const colorFills = useMemo(() => designSystem?.colors || {}, [designSystem]);

  // Les couleurs locales (non design system) avec structure {name, hexValue}
  const localColorFills = useMemo(() => localStyles?.colors || {}, [localStyles]);

  // Transformation des strokes du design system en format exploitable
  const strokeStyles = useMemo(() => {
    if (!designSystem?.strokes) return {};
    const strokes: Record<string, ProcessedStroke> = {};
    Object.entries(designSystem.strokes as Record<string, StrokeInfo>).forEach(([id, strokeInfo]) => {
      if (strokeInfo.value?.colors && strokeInfo.value?.strokeWeight) {
        strokes[id] = {
          name: strokeInfo.name || id,
          colors: strokeInfo.value.colors,
          strokeWeight: strokeInfo.value.strokeWeight
        };
      }
    });
    return strokes;
  }, [designSystem]);

  // Transformation des strokes locaux en format exploitable
  const localStrokeStyles = useMemo(() => {
    if (!localStyles?.strokes) return {};
    const strokes: Record<string, ProcessedStroke> = {};
    Object.entries(localStyles.strokes as Record<string, StrokeInfo>).forEach(([id, strokeInfo]) => {
      // Les strokes locaux peuvent être des objets directs sans wrapper .value
      if (strokeInfo.colors && strokeInfo.strokeWeight) {
        strokes[id] = {
          name: id,
          colors: strokeInfo.colors,
          strokeWeight: strokeInfo.strokeWeight
        };
      }
    });
    return strokes;
  }, [localStyles]);

  // Initialisation des valeurs par défaut
  useEffect(() => {
    if (designSystem && !selectedTextStyle && Object.keys(textStyles).length > 0) {
      setSelectedTextStyle(Object.values(textStyles)[0] as TextStyle);
    }
  }, [designSystem, selectedTextStyle, textStyles]);

  // Fonction pour basculer l'accordéon principal
  const toggleDesignSystemAccordion = () => {
    setIsDesignSystemOpen(prev => !prev);
  };

  // Ne pas afficher le composant si designSystem est absent ou vide
  if (!designSystem) {
    return null;
  }

  const hasTextStyles = Object.keys(textStyles).length > 0;
  const hasColors = Object.keys(colorFills).length + Object.keys(localColorFills).length > 0;
  const hasStrokes = Object.keys(strokeStyles).length + Object.keys(localStrokeStyles).length > 0;

  // Ne rien afficher si aucune donnée n'est présente
  if (!hasTextStyles && !hasColors && !hasStrokes) {
    return null;
  }

  return (
    <section className="mb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          🎨 Design System
        </h2>
        <p className="text-white/70">
          Couleurs, typographies et styles détectés dans la maquette
        </p>
      </div>

      {/* Encart cliquable avec résumé */}
      <button
        className="w-full bg-figma-card border border-gray-600 rounded-lg p-4 hover:border-gray-500 transition-all duration-200 mb-4"
        onClick={toggleDesignSystemAccordion}
      >
        <div className="flex items-center justify-between">
          <div className="text-left">
            <p className="text-white/60 text-sm">
              {Object.keys(textStyles).length} style{Object.keys(textStyles).length > 1 ? 's' : ''} de texte
              • {Object.keys(colorFills).length + Object.keys(localColorFills).length} couleur{(Object.keys(colorFills).length + Object.keys(localColorFills).length) > 1 ? 's' : ''}
              • {Object.keys(strokeStyles).length + Object.keys(localStrokeStyles).length} contour{(Object.keys(strokeStyles).length + Object.keys(localStrokeStyles).length) > 1 ? 's' : ''}
            </p>
          </div>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`transition-transform duration-200 text-white/60 ${isDesignSystemOpen ? 'rotate-180' : ''}`}
          >
            <path d="M7 10L12 15L17 10H7Z" fill="currentColor"/>
          </svg>
        </div>
      </button>

      {/* Contenu de l'accordéon avec animation */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isDesignSystemOpen ? 'max-h-[9999px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="card-figma">
          <div className="space-y-6">
            {/* Contenu en 2 colonnes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* Colonne Typographie */}
              <div className="space-y-4">
                <h4 className="text-figma-button font-medium text-base">
                  Typographie
                </h4>

                {Object.keys(textStyles).length > 0 ? (
                  <>
                    {/* Nom de la police */}
                    <div className="text-white text-sm">
                      Police : <span className="font-medium">{getTextStyles().fontFamily}</span>
                    </div>

                    {/* Texte d'exemple avec style appliqué */}
                    <div
                      className="text-white p-4 bg-figma-secondary rounded-md"
                      style={{
                        fontFamily: getTextStyles().fontFamily,
                        fontSize: getTextStyles().fontSize,
                        fontWeight: getTextStyles().fontWeight,
                        lineHeight: getTextStyles().lineHeight
                      }}
                    >
                      Lorem ipsum dolor sit amet
                    </div>

                    {/* Badges cliquables pour les styles */}
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(textStyles).map(([styleId, style]) => (
                        <button
                          key={styleId}
                          className={`px-3 py-2 rounded-lg text-xs transition-colors ${
                            selectedTextStyle === style
                              ? 'bg-figma-button text-white'
                              : 'bg-figma-secondary text-figma-textMuted hover:bg-figma-button hover:text-white'
                          }`}
                          onClick={() => setSelectedTextStyle(style as TextStyle)}
                        >
                          <div className="flex flex-col items-center">
                            <span>Taille: {(style as TextStyle).value.fontSize}px</span>
                            <span>
                              Hauteur ligne: {
                                (style as TextStyle).value.lineHeight !== undefined
                                  ? `${lineHeightToPixels((style as TextStyle).value.lineHeight!, (style as TextStyle).value.fontSize)}px`
                                  : 'none'
                              }
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center text-figma-textMuted py-8">
                    <div className="text-2xl mb-2">📝</div>
                    <p className="text-sm">Aucun style de texte détecté</p>
                  </div>
                )}
              </div>

              {/* Colonne Couleurs */}
              <div className="space-y-4">
                <h4 className="text-figma-button font-medium text-base">
                  Couleurs
                </h4>

                {Object.keys(colorFills).length > 0 || Object.keys(localColorFills).length > 0 || Object.keys(strokeStyles).length > 0 || Object.keys(localStrokeStyles).length > 0 ? (
                  <>
                    {/* Rectangle de prévisualisation */}
                    <div
                      className="w-full h-24 rounded-md flex flex-col items-center justify-center font-medium border-2 relative"
                      style={{
                        backgroundColor: selectedColor,
                        borderColor: selectedStroke.color,
                        borderWidth: selectedStroke.weight
                      }}
                    >
                      <span style={{ mixBlendMode: 'difference', color: 'white' }} className="text-sm">
                        {selectedColorName}
                      </span>
                      {selectedStrokeName && (
                        <span style={{ mixBlendMode: 'difference', color: 'white' }} className="text-xs opacity-80">
                          {selectedStrokeName}
                        </span>
                      )}
                    </div>

                    {/* Couleurs et Contours en 2 colonnes (Design System | Locales) */}
                    {(Object.keys(colorFills).length > 0 || Object.keys(localColorFills).length > 0 || Object.keys(strokeStyles).length > 0 || Object.keys(localStrokeStyles).length > 0) && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* Colonne Design System */}
                        <div className="space-y-4">
                          <h5 className="text-figma-button text-base font-semibold">Design System</h5>

                          {/* Couleurs du Design System */}
                          {Object.keys(colorFills).length > 0 ? (
                            <div className="space-y-2">
                              <h6 className="text-white text-sm font-medium">🎨 Couleurs</h6>
                              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                {Object.entries(colorFills).map(([colorId, colorInfo]) => (
                                  <button
                                    key={colorId}
                                    className="flex flex-col items-center gap-1 group"
                                    onClick={() => {
                                      setSelectedColor((colorInfo as ColorInfo).hexValue);
                                      setSelectedColorName((colorInfo as ColorInfo).name);
                                    }}
                                  >
                                    <div
                                      className="w-16 h-16 rounded border-2 border-white/20 flex items-center justify-center font-mono transition-transform group-hover:scale-105"
                                      style={{
                                        backgroundColor: (colorInfo as ColorInfo).hexValue,
                                        fontSize: '12px'
                                      }}
                                    >
                                      <span style={{ mixBlendMode: 'difference', color: 'white' }}>
                                        {(colorInfo as ColorInfo).hexValue}
                                      </span>
                                    </div>
                                    <span className="text-figma-textMuted text-center break-words hyphens-auto" style={{ fontSize: '10px' }}>
                                      {(colorInfo as ColorInfo).name}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="text-center text-figma-textMuted py-4">
                              <p className="text-xs">Aucune couleur</p>
                            </div>
                          )}

                          {/* Contours du Design System */}
                          {Object.keys(strokeStyles).length > 0 ? (
                            <div className="space-y-2">
                              <h6 className="text-white text-sm font-medium">✏️ Contours</h6>
                              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                {Object.entries(strokeStyles).map(([strokeId, strokeInfo]) => (
                                  <button
                                    key={strokeId}
                                    className="flex flex-col items-center gap-1 group"
                                    onClick={() => {
                                      setSelectedStroke({
                                        color: strokeInfo.colors[0],
                                        weight: strokeInfo.strokeWeight
                                      });
                                      setSelectedStrokeName(strokeInfo.name);
                                    }}
                                  >
                                    <div
                                      className="w-16 h-16 rounded border-2 bg-white flex items-center justify-center text-xs font-mono transition-transform group-hover:scale-105"
                                      style={{
                                        borderColor: strokeInfo.colors[0],
                                        borderWidth: strokeInfo.strokeWeight
                                      }}
                                    >
                                      <span style={{ mixBlendMode: 'difference', color: 'white', fontSize: '12px' }}>
                                        {strokeInfo.colors[0]}
                                      </span>
                                    </div>
                                    <span className="text-figma-textMuted text-xs text-center break-words hyphens-auto">
                                      {strokeInfo.name}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="text-center text-figma-textMuted py-4">
                              <p className="text-xs">Aucun contour</p>
                            </div>
                          )}
                        </div>

                        {/* Colonne Styles Locaux */}
                        <div className="space-y-4">
                          <h5 className="text-figma-button text-base font-semibold">Styles Locaux</h5>

                          {/* Couleurs locales */}
                          {Object.keys(localColorFills).length > 0 ? (
                            <div className="space-y-2">
                              <h6 className="text-white text-sm font-medium">🖌️ Couleurs</h6>
                              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                {Object.entries(localColorFills).map(([colorId, colorInfo]) => (
                                  <button
                                    key={colorId}
                                    className="flex flex-col items-center gap-1 group"
                                    onClick={() => {
                                      setSelectedColor((colorInfo as ColorInfo).hexValue);
                                      setSelectedColorName((colorInfo as ColorInfo).name);
                                    }}
                                  >
                                    <div
                                      className="w-16 h-16 rounded border-2 border-white/20 flex items-center justify-center font-mono transition-transform group-hover:scale-105"
                                      style={{
                                        backgroundColor: (colorInfo as ColorInfo).hexValue,
                                        fontSize: '12px'
                                      }}
                                    >
                                      <span style={{ mixBlendMode: 'difference', color: 'white' }}>
                                        {(colorInfo as ColorInfo).hexValue}
                                      </span>
                                    </div>
                                    <span className="text-figma-textMuted text-center break-words hyphens-auto" style={{ fontSize: '10px' }}>
                                      {(colorInfo as ColorInfo).name}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="text-center text-figma-textMuted py-4">
                              <p className="text-xs">Aucune couleur locale</p>
                            </div>
                          )}

                          {/* Contours locaux */}
                          {Object.keys(localStrokeStyles).length > 0 ? (
                            <div className="space-y-2">
                              <h6 className="text-white text-sm font-medium">✏️ Contours</h6>
                              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                {Object.entries(localStrokeStyles).map(([strokeId, strokeInfo]) => (
                                  <button
                                    key={strokeId}
                                    className="flex flex-col items-center gap-1 group"
                                    onClick={() => {
                                      setSelectedStroke({
                                        color: strokeInfo.colors[0],
                                        weight: strokeInfo.strokeWeight
                                      });
                                      setSelectedStrokeName(strokeInfo.name);
                                    }}
                                  >
                                    <div
                                      className="w-16 h-16 rounded border-2 bg-white flex items-center justify-center text-xs font-mono transition-transform group-hover:scale-105"
                                      style={{
                                        borderColor: strokeInfo.colors[0],
                                        borderWidth: strokeInfo.strokeWeight
                                      }}
                                    >
                                      <span style={{ mixBlendMode: 'difference', color: 'white', fontSize: '12px' }}>
                                        {strokeInfo.colors[0]}
                                      </span>
                                    </div>
                                    <span className="text-figma-textMuted text-xs text-center break-words hyphens-auto">
                                      {strokeInfo.name}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="text-center text-figma-textMuted py-4">
                              <p className="text-xs">Aucun contour local</p>
                            </div>
                          )}
                        </div>

                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center text-figma-textMuted py-8">
                    <div className="text-2xl mb-2">🎨</div>
                    <p className="text-sm">Aucune couleur détectée</p>
                  </div>
                )}
              </div>
            </div>

            {Object.keys(textStyles).length === 0 && Object.keys(colorFills).length === 0 && Object.keys(localColorFills).length === 0 && Object.keys(strokeStyles).length === 0 && Object.keys(localStrokeStyles).length === 0 && (
              /* État vide global */
              <div className="text-center text-figma-textMuted py-8">
                <div className="text-3xl mb-2">🎨</div>
                <p className="text-sm">Aucun style de design system détecté</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DesignSystemViewer;
