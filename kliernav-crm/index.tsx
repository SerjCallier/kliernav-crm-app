import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { AuthProvider } from './AuthContext';

const startApp = () => {
  const container = document.getElementById('root');
  if (!container) {
    console.error("No se encontró el elemento raíz 'root'.");
    return;
  }

  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
    </React.StrictMode>
  );
};

// Asegurar que el DOM esté listo antes de montar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}