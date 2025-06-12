import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App'; // Add .js extension
import reportWebVitals from './reportWebVitals';
import Modal from 'react-modal';

// Set the app element for accessibility
Modal.setAppElement('#root');

const login = document.getElementById('root');
const root = ReactDOM.createRoot(login);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
