import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Simple fallback for debugging FCP issues
function Fallback() {
  return <div>App failed to load. Please check your App component.</div>;
}

const rootElement = document.getElementById("root");
if (rootElement) {
  try {
    createRoot(rootElement).render(<App />);
  } catch (e) {
    // If App fails, render fallback
    createRoot(rootElement).render(<Fallback />);
    // Optionally log error for debugging
    // console.error(e);
  }
} else {
  // If #root is missing, create it and render fallback
  const fallbackDiv = document.createElement("div");
  fallbackDiv.id = "root";
  document.body.appendChild(fallbackDiv);
  createRoot(fallbackDiv).render(<Fallback />);
}
