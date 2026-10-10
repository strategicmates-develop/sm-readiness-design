import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import ReadinessPage from './readiness/ReadinessPage';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ReadinessPage />
  </StrictMode>,
);