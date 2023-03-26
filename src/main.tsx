import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';

import './index.css';

import minMax from 'dayjs/plugin/minMax';
import dayjs from 'dayjs';
dayjs.extend(minMax);


ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
