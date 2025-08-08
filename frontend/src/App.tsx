import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import './App.css';

function App() {
  const [figmaApiKey, setFigmaApiKey] = useState('');
  const [figmaUrl, setFigmaUrl] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Retrieve Figma API key from session storage on component mount
    const savedApiKey = sessionStorage.getItem('figmaApiKey');
    if (savedApiKey) {
      setFigmaApiKey(savedApiKey);
    }
  }, []);

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newApiKey = e.target.value;
    setFigmaApiKey(newApiKey);
    // Save Figma API key to session storage
    sessionStorage.setItem('figmaApiKey', newApiKey);
  };

  const handleSubmit = async () => {
    if (!figmaApiKey || !figmaUrl) {
      setError('Veuillez fournir une clé d\'API Figma et une URL de fichier.');
      return;
    }
    setError('');
    setIsLoading(true);
    setAnalysis('');

    try {
      const response = await fetch('http://localhost:3002/api/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ figmaApiKey, figmaUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Une erreur inconnue est survenue.');
      }

      setAnalysis(data.analysis);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(`Erreur lors de l'analyse : ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Analyse de Design Figma avec l'IA</h1>
        <p>
          Fournissez une clé d'API Figma et un lien vers un fichier ou un nœud Figma pour obtenir une analyse de design générée par l'IA.
        </p>
      </header>
      <main>
        <div className="form-container">
          <input
            type="password"
            value={figmaApiKey}
            onChange={handleApiKeyChange}
            placeholder="Entrez votre clé d'API Figma"
            className="input-field"
            disabled={isLoading}
          />
          <input
            type="text"
            value={figmaUrl}
            onChange={(e) => setFigmaUrl(e.target.value)}
            placeholder="Entrez l'URL du fichier Figma"
            className="input-field"
            disabled={isLoading}
          />
          <button onClick={handleSubmit} className="analyze-button" disabled={isLoading}>
            {isLoading ? 'Analyse en cours...' : 'Analyser'}
          </button>
        </div>

        {error && <p className="error-message">{error}</p>}

        <div className="report-container">
          <h2>Rapport d'Analyse</h2>
          <div className="report-content">
            {isLoading && <p>Génération du rapport, veuillez patienter...</p>}
            {analysis ? <ReactMarkdown>{analysis}</ReactMarkdown> : !isLoading && <p>Le rapport s'affichera ici.</p>}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
