import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  subtext?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Audit en cours...',
  subtext = 'Analyse de votre design Figma en cours, veuillez patienter.'
}) => {
  return (
    <section className="text-center py-16">
      <div className="card-figma max-w-md mx-auto">
        {/* Spinner animé */}
        <div className="flex justify-center mb-6">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-figma-textMuted border-t-figma-button"></div>
        </div>

        {/* Message principal */}
        <h2 className="text-xl font-semibold text-figma-text mb-3">
          {message}
        </h2>

        {/* Sous-texte */}
        <p className="text-figma-textMuted leading-relaxed">
          {subtext}
        </p>

        {/* Barre de progression indéterminée */}
        <div className="mt-6 w-full bg-gray-700 rounded-full h-2">
          <div className="bg-figma-button h-2 rounded-full animate-pulse-progress"></div>
        </div>
      </div>
    </section>
  );
};

export default LoadingSpinner;
