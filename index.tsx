
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log("RentMaster Pro: React mounted successfully.");
  
  // Phát sự kiện để ẩn loader trong index.html
  window.dispatchEvent(new Event('app-ready'));
} catch (err) {
  console.error("RentMaster Pro: Mount failed", err);
  const errorDisplay = document.getElementById('error-display');
  if (errorDisplay) {
    errorDisplay.style.display = 'block';
    errorDisplay.innerHTML += `<div><strong>React Mount Error:</strong> ${err.message}</div>`;
  }
}
