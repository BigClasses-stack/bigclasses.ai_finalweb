import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeVectorDatabase } from './initVectorDB'
import './vectorDBUtils' // Load debug utilities

// Initialize vector database at app startup
initializeVectorDatabase().catch(error => {
  console.error('Failed to initialize vector database at startup:', error);
});

createRoot(document.getElementById("root")!).render(<App />);
