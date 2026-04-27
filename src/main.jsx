import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from './config/ConfigContext';
import { AppStateProvider } from './components/AppState';
import AppShell from './components/AppShell';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConfigProvider>
      <AppStateProvider>
        <AppShell />
      </AppStateProvider>
    </ConfigProvider>
  </React.StrictMode>
);
