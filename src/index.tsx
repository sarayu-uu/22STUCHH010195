import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { log } from './utils/logger';

// Log application initialization
log.info('component', 'React application initializing');

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Log successful initialization
log.info('component', 'React application initialized successfully');