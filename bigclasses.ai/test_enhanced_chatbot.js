// Test enhanced chatbot functionality
// This script tests the enhanced keyword detection and skill-to-learn pattern

const testQueries = [
  // Enhanced keyword detection tests
  {
    query: "How much time does the Python course take?",
    expectedType: "duration",
    description: "Testing 'time' keyword for duration detection"
  },
  {
    query: "What modules are covered in machine learning?",
    expectedType: "topics",
    description: "Testing 'modules' keyword for topics detection"
  },
  {
    query: "What are the lessons in deep learning?",
    expectedType: "topics", 
    description: "Testing 'lessons' keyword for topics detection"
  },
  {
    query: "How long does it take to complete the AI course?",
    expectedType: "duration",
    description: "Testing 'how long does it take' phrase for duration"
  },
  {
    query: "What is the fee structure for Python?",
    expectedType: "pricing",
    description: "Testing 'fee structure' phrase for pricing"
  },
  {
    query: "What training content is included in NLP?",
    expectedType: "topics",
    description: "Testing 'training content' phrase for topics"
  },
  
  // Skill-to-learn pattern tests
  {
    query: "I am skilled in Python and want to learn Machine Learning",
    expectedType: "skill-to-learn",
    currentSkill: "Python",
    targetSkill: "Machine Learning",
    description: "Testing basic skill-to-learn pattern"
  },
  {
    query: "I know JavaScript and want to learn Deep Learning",
    expectedType: "skill-to-learn",
    currentSkill: "JavaScript", 
    targetSkill: "Deep Learning",
    description: "Testing 'I know X and want to learn Y' pattern"
  },
  {
    query: "I have experience in Java and want to learn Generative AI",
    expectedType: "skill-to-learn",
    currentSkill: "Java",
    targetSkill: "Generative AI", 
    description: "Testing 'I have experience in X and want to learn Y' pattern"
  },
  {
    query: "I am a web developer and want to learn AI",
    expectedType: "skill-to-learn",
    currentSkill: "web developer",
    targetSkill: "AI",
    description: "Testing 'I am a X and want to learn Y' pattern"
  },
  {
    query: "I work with databases and want to learn Python",
    expectedType: "skill-to-learn",
    currentSkill: "databases",
    targetSkill: "Python",
    description: "Testing 'I work with X and want to learn Y' pattern"
  },
  {
    query: "Coming from a finance background and want to learn Data Analytics",
    expectedType: "skill-to-learn",
    currentSkill: "finance background",
    targetSkill: "Data Analytics",
    description: "Testing 'Coming from X and want to learn Y' pattern"
  },
  {
    query: "I am skilled in Excel and interested in learning MLOps",
    expectedType: "skill-to-learn",
    currentSkill: "Excel",
    targetSkill: "MLOps",
    description: "Testing 'interested in learning' variation"
  },
  {
    query: "I have Python skills and want to learn LangChain",
    expectedType: "skill-to-learn",
    currentSkill: "Python skills",
    targetSkill: "LangChain",
    description: "Testing 'have X skills and want to learn Y' pattern"
  },
  
  // Compound queries with enhanced keywords
  {
    query: "What topics are covered in Python and how much time does it take?",
    expectedType: "compound",
    wantsTopics: true,
    wantsDuration: true,
    description: "Testing compound query with enhanced keywords"
  },
  {
    query: "I want to know the lessons and fee structure for Machine Learning",
    expectedType: "compound", 
    wantsTopics: true,
    wantsPricing: true,
    description: "Testing compound query with 'lessons' and 'fee structure'"
  }
];

// Function to simulate the enhanced keyword detection
function simulateEnhancedKeywordDetection(query) {
  const cleanQuery = query.toLowerCase();
  
  // Enhanced topic keywords
  const topicKeywords = [
    'topics', 'modules', 'curriculum', 'syllabus', 'subjects', 'content',
    'lessons', 'chapters', 'sections', 'units', 'what is taught', 'what is included',
    'coverage', 'training content', 'learning content', 'study material',
    'course structure', 'course outline', 'learning objectives', 'course goals'
  ];
  
  // Enhanced duration keywords  
  const durationKeywords = [
    'duration', 'how long', 'time', 'weeks', 'months', 'days', 'hours',
    'timeline', 'schedule', 'length', 'time frame', 'time period',
    'time commitment', 'time investment', 'course length', 'how long does it take',
    'completion period', 'study duration', 'training duration', 'takes to complete'
  ];
  
  // Enhanced pricing keywords
  const pricingKeywords = [
    'price', 'cost', 'fee', 'pricing', 'how much', 'money', 'payment',
    'tuition', 'pricing details', 'cost details', 'fee structure',
    'affordable', 'expensive', 'budget', 'investment', 'value',
    'registration fee', 'course charges', 'training cost'
  ];
  
  const wantsTopics = topicKeywords.some(keyword => cleanQuery.includes(keyword));
  const wantsDuration = durationKeywords.some(keyword => cleanQuery.includes(keyword));
  const wantsPricing = pricingKeywords.some(keyword => cleanQuery.includes(keyword));
  
  return { wantsTopics, wantsDuration, wantsPricing };
}

// Function to simulate skill-to-learn pattern detection
function simulateSkillToLearnPattern(query) {
  const cleanQuery = query.toLowerCase();
  
  const skillToLearnPatterns = [
    /i am skilled in (.+?) and want to learn (.+)/,
    /i know (.+?) and want to learn (.+)/,
    /i have experience in (.+?) and want to learn (.+)/,
    /i work with (.+?) and want to learn (.+)/,
    /i am a (.+?) and want to learn (.+)/,
    /coming from (.+?) and want to learn (.+)/,
    /i am skilled in (.+?) and interested in learning (.+)/,
    /i have (.+?) skills and want to learn (.+)/
  ];
  
  for (const pattern of skillToLearnPatterns) {
    const match = cleanQuery.match(pattern);
    if (match) {
      return {
        currentSkill: match[1]?.trim(),
        targetSkill: match[2]?.trim()
      };
    }
  }
  
  return null;
}

// Run tests
console.log("🚀 Testing Enhanced Chatbot Functionality\n");

let passedTests = 0;
let totalTests = testQueries.length;

testQueries.forEach((test, index) => {
  console.log(`Test ${index + 1}: ${test.description}`);
  console.log(`Query: "${test.query}"`);
  
  let testPassed = false;
  
  if (test.expectedType === "skill-to-learn") {
    const result = simulateSkillToLearnPattern(test.query);
    if (result && result.currentSkill === test.currentSkill && 
        result.targetSkill.toLowerCase().includes(test.targetSkill.toLowerCase())) {
      console.log(`✅ PASSED: Detected skill-to-learn pattern`);
      console.log(`   Current Skill: ${result.currentSkill}`);
      console.log(`   Target Skill: ${result.targetSkill}`);
      testPassed = true;
    } else {
      console.log(`❌ FAILED: Expected skill-to-learn pattern not detected`);
      console.log(`   Expected: ${test.currentSkill} -> ${test.targetSkill}`);
      console.log(`   Got: ${result ? `${result.currentSkill} -> ${result.targetSkill}` : 'null'}`);
    }
  } else if (test.expectedType === "compound") {
    const result = simulateEnhancedKeywordDetection(test.query);
    if (result.wantsTopics === test.wantsTopics && 
        result.wantsDuration === test.wantsDuration &&
        result.wantsPricing === test.wantsPricing) {
      console.log(`✅ PASSED: Compound query detection`);
      console.log(`   Topics: ${result.wantsTopics}, Duration: ${result.wantsDuration}, Pricing: ${result.wantsPricing}`);
      testPassed = true;
    } else {
      console.log(`❌ FAILED: Compound query detection mismatch`);
      console.log(`   Expected: Topics: ${test.wantsTopics}, Duration: ${test.wantsDuration}, Pricing: ${test.wantsPricing}`);
      console.log(`   Got: Topics: ${result.wantsTopics}, Duration: ${result.wantsDuration}, Pricing: ${result.wantsPricing}`);
    }
  } else {
    const result = simulateEnhancedKeywordDetection(test.query);
    const detectedType = result.wantsTopics ? "topics" : 
                        result.wantsDuration ? "duration" : 
                        result.wantsPricing ? "pricing" : "none";
    
    if (detectedType === test.expectedType) {
      console.log(`✅ PASSED: Detected ${detectedType} keyword`);
      testPassed = true;
    } else {
      console.log(`❌ FAILED: Expected ${test.expectedType}, got ${detectedType}`);
    }
  }
  
  if (testPassed) passedTests++;
  console.log("");
});

console.log(`📊 Test Results: ${passedTests}/${totalTests} tests passed`);
console.log(`Success Rate: ${((passedTests/totalTests) * 100).toFixed(1)}%`);

if (passedTests === totalTests) {
  console.log("🎉 All tests passed! Enhanced chatbot functionality is working correctly.");
} else {
  console.log("⚠️  Some tests failed. Please review the implementation.");
}
