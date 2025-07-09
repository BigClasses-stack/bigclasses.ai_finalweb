// Simple test for compound query functionality
async function testCompoundQueries() {
  console.log('🧪 Testing Compound Query Functionality...\n');
  
  try {
    // Import the service
    const { GeminiChatService } = await import('./src/services/geminiService.js');
    const { faissVectorDB } = await import('./src/services/faissVectorDatabase.js');
    
    // Initialize
    await faissVectorDB.initialize();
    const chatService = new GeminiChatService('test-compound');
    
    // Test cases for compound queries
    const testCases = [
      'i want to learn about gen ai and what are the topics in it',
      'mlops duration and pricing',
      'machine learning topics and how long',
      'what are the topics in python programming and duration',
      'generative ai modules and time needed',
      'deep learning curriculum and cost'
    ];
    
    for (const testCase of testCases) {
      console.log(`\n--- Testing: "${testCase}" ---`);
      
      // Test compound query detection
      const compoundQuery = chatService.detectCompoundQuery(testCase);
      console.log(`Interest: ${compoundQuery.interest}`);
      console.log(`Wants Topics: ${compoundQuery.wantsTopics}`);
      console.log(`Wants Duration: ${compoundQuery.wantsDuration}`);
      console.log(`Wants Pricing: ${compoundQuery.wantsPricing}`);
      console.log(`Is Compound: ${compoundQuery.isCompound}`);
      
      if (compoundQuery.isCompound) {
        console.log('✅ Compound query detected correctly');
      } else {
        console.log('❌ Compound query NOT detected');
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testCompoundQueries();
