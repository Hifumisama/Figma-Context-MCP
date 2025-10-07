import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuditProvider } from './contexts/AuditContext';
import App from './App';
import './app.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuditProvider>
      <App />
    </AuditProvider>
  </React.StrictMode>
);
