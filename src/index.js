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
    // If we can't break out, at least warn the user
    document.body.innerHTML = '<div style="padding:20px;background:#f44336;color:white;font-family:Arial;text-align:center;"><h1>⚠️ Security Warning</h1><p>This page is being displayed in an unauthorized frame.</p><p>Please visit <a href="' + window.location.href + '" style="color:white;text-decoration:underline;">this page directly</a> for security.</p></div>';
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
