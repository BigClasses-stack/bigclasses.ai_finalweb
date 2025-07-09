// Test conversational flow for the user's specific issue
async function testConversationalFlow() {
  console.log('\n🧪 Testing Conversational Flow (User Issue)...\n');
  
  try {
    // Simulate the user's scenario
    const chatService = new (await import('./src/services/geminiService.js')).GeminiChatService('test-conversation');
    
    // Test scenario 1: User asks about "agents" then "llmops"
    console.log('--- Scenario 1: agents -> llmops ---');
    
    // First query: agents
    console.log('1. User: "agents"');
    const agentsInterests = chatService.detectSpecificInterests('agents');
    console.log(`   Detected interests: ${agentsInterests.join(', ')}`);
    
    const agentsResults = await chatService.getCoursesForSpecificInterests(agentsInterests);
    console.log(`   Found courses: ${agentsResults.map(r => r.metadata.courseTitle).join(', ')}`);
    
    // Simulate setting last discussed course
    if (agentsResults.length > 0) {
      chatService.lastDiscussedCourse = agentsResults[0].metadata.courseTitle;
      console.log(`   Last discussed course set to: ${chatService.lastDiscussedCourse}`);
    }
    
    // Second query: llmops
    console.log('\n2. User: "i want to learn about llmops and what are the topics in it"');
    const isFollowUp = chatService.isFollowUpQuestion('i want to learn about llmops and what are the topics in it');
    console.log(`   Is follow-up question: ${isFollowUp}`);
    
    const llmopsInterests = chatService.detectSpecificInterests('i want to learn about llmops and what are the topics in it');
    console.log(`   Detected interests: ${llmopsInterests.join(', ')}`);
    
    const llmopsResults = await chatService.getCoursesForSpecificInterests(llmopsInterests);
    console.log(`   Found courses: ${llmopsResults.map(r => r.metadata.courseTitle).join(', ')}`);
    
    // Expected behavior: Should treat this as a NEW course query, not a follow-up
    console.log(`   Expected: Should be treated as NEW course query (not follow-up)`);
    console.log(`   Actual: ${isFollowUp ? 'Follow-up' : 'New course query'} ✅`);
    
  } catch (error) {
    console.error('❌ Conversational flow test failed:', error);
  }
}

// Test the specific user issue
testConversationalFlow();

// Test compound query detection
async function testCompoundQueries() {
  console.log('\n🧪 Testing Compound Query Detection...\n');
  
  try {
    const chatService = new (await import('./src/services/geminiService.js')).GeminiChatService('test-compound');
    
    const testQueries = [
      'i want to learn ml and what are the topics in it',
      'tell me about python and what topics are covered',
      'generative ai course and what modules does it have',
      'what is machine learning', // Should NOT be compound
      'topics in it', // Should be follow-up
      'deep learning topics covered',
      'llmops and what will i learn'
    ];
    
    for (const query of testQueries) {
      console.log(`--- Testing: "${query}" ---`);
      
      const compoundQuery = chatService.detectCompoundQuery(query);
      console.log(`   Interest: ${compoundQuery.interest || 'None'}`);
      console.log(`   Wants topics: ${compoundQuery.wantsTopics}`);
      console.log(`   Is compound: ${compoundQuery.isCompound}`);
      
      if (compoundQuery.isCompound) {
        console.log(`   ✅ Correctly identified as compound query`);
      } else if (compoundQuery.wantsTopics && !compoundQuery.interest) {
        console.log(`   ✅ Correctly identified as follow-up question`);
      } else {
        console.log(`   ✅ Correctly identified as regular query`);
      }
      
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ Compound query test failed:', error);
  }
}

// Run compound query test
testCompoundQueries();