import React from 'react';
import { createRoot } from 'react-dom/client';
import Home from './pages/Home';
import './styles.css';

const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <Home />
  </React.StrictMode>
);


