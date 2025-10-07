import React from 'react';

interface PrimaryButtonProps {
  canSubmit?: boolean;
  isLoading?: boolean;
  text?: string;
  loadingText?: string;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  canSubmit = true,
  isLoading = false,
  text = '🔍 Lancer l\'audit',
  loadingText = '⏳ Audit en cours...',
  type = 'submit',
  onClick
}) => {
  return (
    <button
      type={type}
      disabled={!canSubmit || isLoading}
      className={`btn-primary w-full sm:w-auto min-w-48 relative overflow-hidden group ${isLoading ? 'cursor-not-allowed' : ''}`}
      onClick={onClick}
    >
      {/* Contenu du bouton */}
      <span className="relative z-10 flex items-center justify-center space-x-2">
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            <span>{loadingText}</span>
          </>
        ) : (
          <span>{text}</span>
        )}
      </span>

      {/* Animation de fond au survol */}
      {!isLoading && canSubmit && (
        <div className="absolute inset-0 bg-purple-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
      )}
    </button>
  );
};

export default PrimaryButton;
