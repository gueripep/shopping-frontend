import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { createClient, Environment, KameleoonProvider } from '@kameleoon/react-sdk';

// Kameleoon configuration
const configuration = {
  updateInterval: 60,
  environment: Environment.Production,
};
const kameleoonClient = createClient({ siteCode: '17lbovqbd1', configuration });



const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <KameleoonProvider client={kameleoonClient}>
      <App />
    </KameleoonProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
