import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { SmoothScrollProvider } from './lib/smoothScroll.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <SmoothScrollProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </SmoothScrollProvider>
    </BrowserRouter>
  </React.StrictMode>
);
