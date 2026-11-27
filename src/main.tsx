import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Força a verificação e atualização imediata do Service Worker e Manifest para instalações existentes
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.ready.then((registration) => {
    registration.update().catch(() => {});
  });

  // Quando o novo Service Worker ativa, recarrega para aplicar a nova versão instantaneamente
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
