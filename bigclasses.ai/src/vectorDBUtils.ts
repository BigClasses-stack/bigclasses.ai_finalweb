import { faissVectorDB } from './services/faissVectorDatabase';

// Vector Database Debug Utilities
export const vectorDBUtils = {
  // Get database statistics
  getStats() {
    const stats = faissVectorDB.getStats();
    console.log('📊 FAISS Vector Database Statistics:');
    console.table(stats);
    return stats;
  },

  // Search for courses
  async search(query: string, topK: number = 5) {
    try {
      console.log(`🔍 Searching for: "${query}" (top ${topK})`);
      const results = await faissVectorDB.search(query, topK);
      
      console.log(`✅ Found ${results.length} results:`);
      results.forEach((result, index) => {
        console.log(`${index + 1}. Course ${result.courseId} (${result.metadata.type || 'unknown'}) - Similarity: ${result.similarity.toFixed(4)}`);
        console.log(`   Text: ${result.content.substring(0, 100)}...`);
      });
      
      return results;
    } catch (error) {
      console.error('❌ Search failed:', error);
      return [];
    }
  },

  // Get relevant context for chatbot
  async getContext(query: string, maxResults: number = 3) {
    try {
      console.log(`🎯 Getting context for: "${query}"`);
      const context = await faissVectorDB.getRelevantContext(query, maxResults);
      
      console.log(`✅ Found ${context.length} context items:`);
      context.forEach((text, index) => {
        console.log(`${index + 1}. ${text.substring(0, 150)}...`);
      });
      
      return context;
    } catch (error) {
      console.error('❌ Context retrieval failed:', error);
      return [];
    }
  },

  // Test search with multiple queries
  async testSearch() {
    const testQueries = [
      'Python programming',
      'Machine learning algorithms',
      'Deep learning neural networks',
      'React development',
      'Data science projects',
      'JavaScript frameworks'
    ];

    console.log('🧪 Running search tests...');
    
    for (const query of testQueries) {
      console.log(`\n--- Testing: "${query}" ---`);
      await this.search(query, 3);
    }
  },

  // Rebuild database (development only)
  async rebuild() {
    try {
      console.log('🔄 Rebuilding vector database...');
      console.warn('⚠️ This will generate new embeddings and may take several minutes');
      
      const confirm = window.confirm('Are you sure you want to rebuild the vector database? This will take several minutes.');
      if (!confirm) {
        console.log('❌ Rebuild cancelled');
        return;
      }

      await faissVectorDB.rebuild();
      console.log('✅ Vector database rebuilt successfully');
      
    } catch (error) {
      console.error('❌ Rebuild failed:', error);
    }
  },

  // Performance test
  async performanceTest() {
    const query = 'Python programming course';
    const iterations = 10;
    
    console.log(`⚡ Running performance test (${iterations} searches)...`);
    
    const startTime = Date.now();
    
    for (let i = 0; i < iterations; i++) {
      await faissVectorDB.search(query, 5);
    }
    
    const endTime = Date.now();
    const avgTime = (endTime - startTime) / iterations;
    
    console.log(`📊 Performance Results:`);
    console.log(`   Total time: ${endTime - startTime}ms`);
    console.log(`   Average per search: ${avgTime.toFixed(2)}ms`);
    console.log(`   Searches per second: ${(1000 / avgTime).toFixed(2)}`);
  },

  // Export database data (for inspection)
  exportData() {
    const stats = faissVectorDB.getStats();
    console.log('📁 Database export ready');
    console.log('Copy this data to inspect the database structure:');
    console.log(JSON.stringify(stats, null, 2));
    
    return stats;
  },

  // Help - show available commands
  help() {
    console.log(`
🛠️  FAISS Vector Database Debug Utilities

Available commands:
• vectorDBUtils.getStats()              - Show database statistics
• vectorDBUtils.search(query, topK)     - Search for courses
• vectorDBUtils.getContext(query, max)  - Get chatbot context
• vectorDBUtils.testSearch()            - Test multiple queries
• vectorDBUtils.rebuild()               - Rebuild database (dev only)
• vectorDBUtils.performanceTest()       - Run performance test
• vectorDBUtils.exportData()            - Export database stats
• vectorDBUtils.help()                  - Show this help

Examples:
vectorDBUtils.search("Python programming", 3)
vectorDBUtils.getContext("machine learning", 5)
vectorDBUtils.testSearch()
    `);
  }
};

// Make utilities available globally in development
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  (window as any).vectorDBUtils = vectorDBUtils;
  console.log('🛠️ Vector database utilities available: window.vectorDBUtils');
  console.log('💡 Type vectorDBUtils.help() for available commands');
}

export default vectorDBUtils;
