import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Registra e gerencia atualizações do Service Worker de forma segura
if ('serviceWorker' in navigator) {
  // Detecta se já havia um controlador ativo antes (para diferenciar atualização de primeira instalação)
  const hasExistingController = Boolean(navigator.serviceWorker.controller);

  navigator.serviceWorker.ready.then((registration) => {
    // Checa atualização na rede somente se o dispositivo estiver online
    if (navigator.onLine) {
      registration.update().catch(() => {});
    }
  });

  // Só recarrega automaticamente se um Service Worker já existente foi substituído por uma nova versão
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (hasExistingController && !refreshing) {
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
