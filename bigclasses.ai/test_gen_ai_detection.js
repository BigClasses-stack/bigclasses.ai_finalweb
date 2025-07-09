import { faissVectorDB } from './src/services/faissVectorDatabase.js';
import { GeminiChatService } from './src/services/geminiService.js';

// Test script to debug the "gen ai" detection issue
async function testGenAIDetection() {
  console.log('🧪 Testing Gen AI Detection...\n');
  
  try {
    // Initialize vector database
    console.log('1. Initializing vector database...');
    await faissVectorDB.initialize();
    
    // Test 1: Check if Generative AI course exists
    console.log('\n2. Checking for Generative AI course...');
    const allCourses = faissVectorDB.getAllCourses();
    const genAICourse = allCourses.find(course => 
      course.title.toLowerCase().includes('generative ai') || 
      course.title.toLowerCase().includes('generative')
    );
    
    if (genAICourse) {
      console.log('✅ Found Generative AI course:', genAICourse.title);
      console.log('   Course ID:', genAICourse.id);
      console.log('   Duration:', genAICourse.duration);
      console.log('   Description:', genAICourse.description?.substring(0, 100) + '...');
    } else {
      console.log('❌ No Generative AI course found');
    }
    
    // Test 2: Search for "gen ai"
    console.log('\n3. Testing search for "gen ai"...');
    const searchResults = await faissVectorDB.search('gen ai', 5);
    console.log(`   Found ${searchResults.length} results:`);
    
    searchResults.forEach((result, index) => {
      const course = faissVectorDB.getCourseById(result.courseId);
      console.log(`   ${index + 1}. Course: ${course?.title || 'Unknown'}`);
      console.log(`      Similarity: ${result.similarity.toFixed(4)}`);
      console.log(`      Content: ${result.content.substring(0, 80)}...`);
    });
    
    // Test 3: Search for "generative ai"
    console.log('\n4. Testing search for "generative ai"...');
    const searchResults2 = await faissVectorDB.search('generative ai', 5);
    console.log(`   Found ${searchResults2.length} results:`);
    
    searchResults2.forEach((result, index) => {
      const course = faissVectorDB.getCourseById(result.courseId);
      console.log(`   ${index + 1}. Course: ${course?.title || 'Unknown'}`);
      console.log(`      Similarity: ${result.similarity.toFixed(4)}`);
      console.log(`      Content: ${result.content.substring(0, 80)}...`);
    });
    
    // Test 4: Test the GeminiChatService
    console.log('\n5. Testing GeminiChatService with "I want to learn about gen ai"...');
    const chatService = new GeminiChatService('test-session');
    
    // Mock the sendMessage method to test just the course detection
    const testMessage = 'I want to learn about gen ai';
    console.log(`   Testing message: "${testMessage}"`);
    
    // Test the internal methods
    const specificInterests = chatService.detectSpecificInterests(testMessage);
    console.log(`   Detected interests: ${specificInterests.join(', ')}`);
    
    if (specificInterests.length > 0) {
      const coursesForInterests = await chatService.getCoursesForSpecificInterests(specificInterests);
      console.log(`   Found ${coursesForInterests.length} courses for interests:`);
      coursesForInterests.forEach((course, index) => {
        console.log(`   ${index + 1}. ${course.metadata.courseTitle}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testGenAIDetection();
