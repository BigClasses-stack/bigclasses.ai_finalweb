// Comprehensive test for the user's specific scenario
import { faissVectorDB } from './src/services/faissVectorDatabase.js';
import { GeminiChatService } from './src/services/geminiService.js';

async function testUserScenario() {
  console.log('🧪 Testing User Scenario: Gen AI compound query...\n');
  
  try {
    // Initialize
    await faissVectorDB.initialize();
    const chatService = new GeminiChatService('test-user-scenario');
    
    // Test the specific user query: "i want to learn about gen ai and what are topics in it"
    const query = 'i want to learn about gen ai and what are the topics in it';
    console.log(`Testing query: "${query}"`);
    
    // Step 1: Test compound query detection
    const compoundQuery = chatService.detectCompoundQuery(query);
    console.log(`\n1. Compound Query Detection:`);
    console.log(`   Interest: ${compoundQuery.interest}`);
    console.log(`   Wants topics: ${compoundQuery.wantsTopics}`);
    console.log(`   Wants duration: ${compoundQuery.wantsDuration}`);
    console.log(`   Wants pricing: ${compoundQuery.wantsPricing}`);
    console.log(`   Is compound: ${compoundQuery.isCompound}`);
    
    // Step 2: Test course search
    if (compoundQuery.isCompound && compoundQuery.interest) {
      console.log(`\n2. Getting comprehensive course info for: ${compoundQuery.interest}`);
      const courseInfo = await chatService.getComprehensiveCourseInfo(compoundQuery.interest);
      
      console.log(`   Found ${courseInfo.length} courses:`);
      courseInfo.forEach((course, index) => {
        console.log(`   ${index + 1}. ${course.metadata.courseTitle}`);
        console.log(`      Content preview: ${course.content.substring(0, 150)}...`);
        
        // Check if content contains actual module/topic information
        const hasModules = course.content.includes('Module') || course.content.includes('Topics:');
        const hasDuration = course.content.includes('Duration:');
        console.log(`      Has modules/topics: ${hasModules ? '✅' : '❌'}`);
        console.log(`      Has duration: ${hasDuration ? '✅' : '❌'}`);
      });
    }
    
    // Step 3: Test different compound queries
    console.log(`\n3. Testing various compound queries...`);
    
    const testQueries = [
      'machine learning topics and duration',
      'python programming modules and how long',
      'data science curriculum and pricing',
      'deep learning topics and cost'
    ];
    
    for (const testQuery of testQueries) {
      console.log(`\n   Testing: "${testQuery}"`);
      const result = chatService.detectCompoundQuery(testQuery);
      console.log(`   → Interest: ${result.interest}, Topics: ${result.wantsTopics}, Duration: ${result.wantsDuration}, Pricing: ${result.wantsPricing}, Compound: ${result.isCompound}`);
    }
    
    console.log(`\n✅ Test completed successfully!`);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testUserScenario();
