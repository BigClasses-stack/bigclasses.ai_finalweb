import { faissVectorDB } from './services/faissVectorDatabase';

// Initialize FAISS Vector Database
export async function initializeVectorDatabase(): Promise<void> {
  try {
    console.log('🚀 Initializing FAISS Vector Database...');
    
    const startTime = Date.now();
    await faissVectorDB.initialize();
    const endTime = Date.now();
    
    const stats = faissVectorDB.getStats();
    
    console.log('✅ FAISS Vector Database initialized successfully!');
    console.log(`⏱️ Initialization time: ${endTime - startTime}ms`);
    console.log('📊 Database Statistics:', stats);
    
    // Make vector database available globally for debugging
    if (typeof window !== 'undefined') {
      (window as any).faissVectorDB = faissVectorDB;
    }
    
  } catch (error) {
    console.error('❌ Failed to initialize FAISS Vector Database:', error);
    
    // Don't throw to prevent app from crashing
    // The chatbot will gracefully handle missing vector DB
    console.warn('⚠️ App will continue without vector database functionality');
  }
}

// Utility function to check if database is ready
export function isVectorDatabaseReady(): boolean {
  return faissVectorDB.getStats().isInitialized;
}

// Get vector database instance
export function getVectorDatabase() {
  return faissVectorDB;
}
