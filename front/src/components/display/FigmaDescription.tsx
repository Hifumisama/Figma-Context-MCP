import React, { useMemo } from 'react';
import { marked } from 'marked';
import './FigmaDescription.css';

interface FigmaDescriptionProps {
  description?: string;
  title?: string;
}

// Configure marked for security and consistency
marked.setOptions({
  breaks: true,
  gfm: true
});

const FigmaDescription: React.FC<FigmaDescriptionProps> = ({
  description = '',
  title = 'Description de la maquette'
}) => {
  const htmlDescription = useMemo(() => {
    return description ? marked.parse(description) : '';
  }, [description]);

  return (
    <div className="card-figma">
      <div className="space-y-4">
        {/* Titre */}
        <h3 className="text-white font-semibold text-lg text-center">
          {title}
        </h3>

        {/* Contenu de la description */}
        {description ? (
          <div className="text-figma-textMuted text-sm leading-relaxed space-y-3">
            {/* Rendu HTML du markdown */}
            <div dangerouslySetInnerHTML={{ __html: htmlDescription }} />
          </div>
        ) : (
          /* État vide */
          <div className="text-center text-figma-textMuted">
            <div className="text-3xl mb-2">📝</div>
            <p className="text-sm">Aucune description disponible</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FigmaDescription;
