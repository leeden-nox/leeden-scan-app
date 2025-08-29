
import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom';
import App from './App'
import { createRoot } from 'react-dom/client';
import 'antd/dist/reset.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)