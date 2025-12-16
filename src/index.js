import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Optional frame-busting code (defense-in-depth)
// Note: Backend security headers are the PRIMARY protection
if (window.self !== window.top) {
  // Site is in an iframe - attempt to break out
  try {
    window.top.location = window.self.location;
  } catch (e) {
    // If we can't break out, render a warning without injecting HTML strings
    document.body.textContent = '';
    const warning = document.createElement('div');
    Object.assign(warning.style, {
      padding: '20px',
      background: '#f44336',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      textAlign: 'center',
    });

    const title = document.createElement('h1');
    title.textContent = 'Security Warning';

    const message = document.createElement('p');
    message.textContent = 'This page is being displayed in an unauthorized frame.';

    const linkMessage = document.createElement('p');
    const link = document.createElement('a');
    link.href = window.location.href;
    link.textContent = 'Visit this page directly';
    link.style.color = 'white';
    link.style.textDecoration = 'underline';
    linkMessage.append('Please visit ', link, ' for security.');

    warning.append(title, message, linkMessage);
    document.body.appendChild(warning);
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
