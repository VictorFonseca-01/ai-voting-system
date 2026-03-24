import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Supressão do erro de HMR no Windows (CRA 5 bug)
if (process.env.NODE_ENV === 'development') {
  window.addEventListener('error', e => {
    if (e.message && e.message.includes('Hot Module Replacement is disabled')) {
      e.stopImmediatePropagation();
      e.preventDefault();
      console.warn("HMR Warning suprimido para evitar bloqueio da UI.");
    }
  });
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
