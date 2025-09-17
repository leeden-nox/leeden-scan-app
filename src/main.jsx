
import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom';
import App from './App'
import { createRoot } from 'react-dom/client';
import 'antd/dist/reset.css';
import { registerSW } from 'virtual:pwa-register';
import { ConfigProvider } from "antd-mobile";
import enUS from "antd-mobile/es/locales/en-US";
if ('serviceWorker' in navigator) {
  registerSW();
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ConfigProvider locale={enUS}>
      <App />
    </ConfigProvider>
  </StrictMode>,
)