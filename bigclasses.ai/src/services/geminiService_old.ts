import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { faissVectorDB, type CourseData } from './faissVectorDatabase';

// --- API Key Initialization ---
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
console.log("Gemini API key status:", apiKey ? `Key found (${apiKey.slice(0, 4)}...)` : "No key found");

if (!apiKey) {
  console.error("ERROR: No Gemini API key found in environment variables. Please add VITE_GEMINI_API_KEY to your .env file.");
}

const genAI = new GoogleGenerativeAI(apiKey);

// --- Safety Settings ---
const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

// Using a stable model version with safety settings
const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash",
  safetySettings
});

// --- Type Definitions ---
export type ChatMessage = {
  role: 'user' | 'model';
  parts: { text: string }[];
};

export const mapRoleToType = (role: 'user' | 'model'): 'user' | 'bot' => {
  return role === 'user' ? 'user' : 'bot';
};

// --- FAISS Database Record Interface ---
interface FAISSRecord {
  id: string;
  courseId: number;
  text: string;
  type: 'overview' | 'duration' | 'pricing' | 'module';
  chunkIndex?: number;
  metadata: {
    title: string;
    duration?: string;
    package?: string;
  };
}

// --- Compound Query Interface ---
interface CompoundQuery {
  interest: string | null;
  wantsTopics: boolean;
  wantsDuration: boolean;
  wantsPricing: boolean;
  isCompound: boolean;
}

// --- Query Analysis Result Interface ---
interface QueryAnalysis {
  isGreeting: boolean;
  isAllCourses: boolean;
  isFollowUp: boolean;
  compoundQuery: CompoundQuery;
  detectedCourses: string[];
  faissResults: FAISSRecord[];
}

export class GeminiChatService {
  private sessionId: string;
  private lastDiscussedCourse: string | null = null;
  private conversationHistory: Array<{ query: string; response: string; timestamp: number }> = [];
  private availableCourses: Set<string> = new Set();
  private courseNameMapping: Map<string, string> = new Map();

  constructor(sessionId: string) {
    this.sessionId = sessionId;
    console.log(`[${this.sessionId}] GeminiChatService initialized`);
    
    // Initialize available courses from FAISS database
    this.initializeAvailableCourses();
  }

  // --- Initialize Available Courses from FAISS ---
  private async initializeAvailableCourses(): Promise<void> {
    try {
      await faissVectorDB.initialize();
      
      // Get all available courses from FAISS database
      const allCourses = faissVectorDB.getAllCourses();
      allCourses.forEach(course => {
        this.availableCourses.add(course.title);
        this.buildCourseNameMapping(course.title);
      });
      
      console.log(`[${this.sessionId}] Loaded ${this.availableCourses.size} courses from FAISS database`);
    } catch (error) {
      console.error(`[${this.sessionId}] Error initializing courses:`, error);
    }
  }

  // --- Build dynamic course name mapping ---
  private buildCourseNameMapping(courseTitle: string): void {
    const lowerTitle = courseTitle.toLowerCase();
    this.courseNameMapping.set(lowerTitle, courseTitle);
    
    // Add common variations dynamically
    const words = lowerTitle.split(/\s+/);
    
    // Create abbreviations and variations
    if (lowerTitle.includes('machine learning')) {
      this.courseNameMapping.set('ml', courseTitle);
      this.courseNameMapping.set('machine learning', courseTitle);
    }
    
    if (lowerTitle.includes('generative ai')) {
      this.courseNameMapping.set('gen ai', courseTitle);
      this.courseNameMapping.set('generative ai', courseTitle);
      this.courseNameMapping.set('generative artificial intelligence', courseTitle);
    }
    
    if (lowerTitle.includes('deep learning')) {
      this.courseNameMapping.set('deep learning', courseTitle);
      this.courseNameMapping.set('dl', courseTitle);
    }
    
    if (lowerTitle.includes('python')) {
      this.courseNameMapping.set('python', courseTitle);
      this.courseNameMapping.set('python programming', courseTitle);
    }
    
    if (lowerTitle.includes('data science')) {
      this.courseNameMapping.set('data science', courseTitle);
      this.courseNameMapping.set('data analytics', courseTitle);
    }
    
    if (lowerTitle.includes('nlp')) {
      this.courseNameMapping.set('nlp', courseTitle);
      this.courseNameMapping.set('natural language processing', courseTitle);
    }
    
    if (lowerTitle.includes('mlops')) {
      this.courseNameMapping.set('mlops', courseTitle);
      this.courseNameMapping.set('ml ops', courseTitle);
    }
    
    if (lowerTitle.includes('llmops')) {
      this.courseNameMapping.set('llmops', courseTitle);
      this.courseNameMapping.set('llm ops', courseTitle);
    }
    
    if (lowerTitle.includes('agents')) {
      this.courseNameMapping.set('agents', courseTitle);
      this.courseNameMapping.set('ai agents', courseTitle);
    }
    
    // Add individual word mappings for partial matches
    words.forEach(word => {
      if (word.length > 3) {
        this.courseNameMapping.set(word, courseTitle);
      }
    });
  }

  public setUserName(name: string): void {
    if (typeof name === 'string' && name.trim()) {
      console.log(`[${this.sessionId}] User name set: ${name}`);
    }
  }

  public addInterest(interest: string): void {
    if (typeof interest === 'string' && interest.trim()) {
      console.log(`[${this.sessionId}] User interest added: ${interest}`);
    }
  }

  // --- Main Message Processing ---
  public async sendMessage(message: string): Promise<string> {
    console.log(`[${this.sessionId}] Processing message: "${message}"`);
    
    try {
      // Ensure FAISS database is initialized
      if (!faissVectorDB.isReady()) {
        await faissVectorDB.initialize();
      }

      // Analyze the query to determine its type and extract course information
      const queryAnalysis = await this.analyzeQuery(message);
      
      // Build enhanced message with FAISS context
      const enhancedMessage = await this.buildEnhancedMessage(message, queryAnalysis);
      
      // Generate response using Gemini
      const response = await this.generateResponse(enhancedMessage);
      
      // Update conversation history
      this.updateConversationHistory(message, response);
      
      return response;
    } catch (error) {
      console.error(`[${this.sessionId}] Error in sendMessage:`, error);
      return this.getErrorResponse();
    }
  }

  // --- Query Analysis ---
  private async analyzeQuery(message: string): Promise<QueryAnalysis> {
    const cleanMessage = message.toLowerCase();
    
    // Detect query types
    const isGreeting = this.isSimpleGreeting(cleanMessage);
    const isAllCourses = this.isAllCoursesQuery(cleanMessage);
    const isFollowUp = this.isFollowUpQuestion(cleanMessage);
    const compoundQuery = this.detectCompoundQuery(message);
    
    // Get course data from FAISS database
    const faissResults = await this.searchFAISSDatabase(message, compoundQuery);
    const detectedCourses = this.extractCourseNamesFromResults(faissResults);
    
    return {
      isGreeting,
      isAllCourses,
      isFollowUp,
      compoundQuery,
      detectedCourses,
      faissResults
    };
  }

  // --- FAISS Database Search ---
  private async searchFAISSDatabase(message: string, compoundQuery: CompoundQuery): Promise<FAISSRecord[]> {
    try {
      console.log(`[${this.sessionId}] Searching FAISS database for: "${message}"`);
      
      // Determine search strategy based on query type
      let searchResults;
      
      if (compoundQuery.isCompound && compoundQuery.interest) {
        // For compound queries, search specifically for the course and related information
        searchResults = await faissVectorDB.search(compoundQuery.interest, 20);
        
        // If we want topics, prioritize module results
        if (compoundQuery.wantsTopics) {
          const moduleResults = await faissVectorDB.search(`${compoundQuery.interest} module`, 15);
          searchResults = [...searchResults, ...moduleResults];
        }
        
        // If we want duration, prioritize duration results
        if (compoundQuery.wantsDuration) {
          const durationResults = await faissVectorDB.search(`${compoundQuery.interest} duration`, 5);
          searchResults = [...searchResults, ...durationResults];
        }
        
        // If we want pricing, prioritize pricing results
        if (compoundQuery.wantsPricing) {
          const pricingResults = await faissVectorDB.search(`${compoundQuery.interest} price`, 5);
          searchResults = [...searchResults, ...pricingResults];
        }
      } else {
        // For regular queries, use standard search
        searchResults = await faissVectorDB.search(message, 15);
      }
      
      // Convert to our internal format
      const faissResults: FAISSRecord[] = searchResults.map(result => ({
        id: result.id,
        courseId: result.courseId,
        text: result.content,
        type: result.metadata?.type || 'overview',
        chunkIndex: result.metadata?.chunkIndex,
        metadata: {
          title: result.metadata?.title || 'Unknown Course',
          duration: result.metadata?.duration,
          package: result.metadata?.package
        }
      }));
      
      console.log(`[${this.sessionId}] Found ${faissResults.length} results from FAISS database`);
      return faissResults;
    } catch (error) {
      console.error(`[${this.sessionId}] Error searching FAISS database:`, error);
      return [];
    }
  }

  // --- Extract Course Names from FAISS Results ---
  private extractCourseNamesFromResults(faissResults: FAISSRecord[]): string[] {
    const courseNames = new Set<string>();
    faissResults.forEach(result => {
      if (result.metadata.title) {
        courseNames.add(result.metadata.title);
      }
    });
    return Array.from(courseNames);
  }

  // --- Compound Query Detection (Fixed) ---
  private detectCompoundQuery(message: string): CompoundQuery {
    const cleanMessage = message.toLowerCase();
    
    console.log(`[${this.sessionId}] Analyzing compound query: "${cleanMessage}"`);
    
    // Enhanced keyword detection for topics
    const topicKeywords = [
      'topics', 'modules', 'curriculum', 'syllabus', 'subjects', 'content',
      'what are the topics', 'what topics', 'what modules', 'what subjects',
      'topics covered', 'modules covered', 'curriculum covered', 'syllabus covered',
      'what will i learn', 'what do i learn', 'content covered', 'what is covered',
      'topics in it', 'modules in it', 'curriculum in it', 'syllabus in it',
      'what are in it', 'what is in it', 'what does it cover', 'what it covers',
      'learn in it', 'study in it', 'covered in it', 'course content'
    ];
    
    // Enhanced keyword detection for duration
    const durationKeywords = [
      'duration', 'how long', 'time', 'weeks', 'months', 'days', 'hours',
      'timeline', 'schedule', 'length', 'time frame', 'time period',
      'how much time', 'time needed', 'time required', 'completion time',
      'duration of it', 'how long is it', 'time for it', 'length of it',
      'how many weeks', 'how many months', 'course duration'
    ];
    
    // Enhanced keyword detection for pricing
    const pricingKeywords = [
      'price', 'cost', 'fee', 'pricing', 'how much', 'money', 'payment',
      'fees', 'costs', 'charges', 'amount', 'price of it', 'cost of it',
      'fee for it', 'how much does it cost', 'what is the price',
      'course fee', 'course cost', 'course price', 'enrollment fee'
    ];
    
    const wantsTopics = topicKeywords.some(keyword => cleanMessage.includes(keyword));
    const wantsDuration = durationKeywords.some(keyword => cleanMessage.includes(keyword));
    const wantsPricing = pricingKeywords.some(keyword => cleanMessage.includes(keyword));
    
    // Dynamic course interest detection from available courses
    const primaryInterest = this.extractPrimaryInterestFromAvailableCourses(cleanMessage);
    
    // Determine if it's a compound query
    const isCompound = primaryInterest && (wantsTopics || wantsDuration || wantsPricing);
    
    console.log(`[${this.sessionId}] Compound query result: interest="${primaryInterest}", topics=${wantsTopics}, duration=${wantsDuration}, pricing=${wantsPricing}, compound=${isCompound}`);
    
    return {
      interest: primaryInterest,
      wantsTopics,
      wantsDuration,
      wantsPricing,
      isCompound
    };
  }

  // --- Dynamic Course Interest Extraction (Fixed) ---
  private extractPrimaryInterestFromAvailableCourses(message: string): string | null {
    const cleanMessage = message.toLowerCase();
    
    // Create dynamic mappings from available courses
    const courseMapping = new Map<string, string>();
    
    // Add available courses with their variations
    this.availableCourses.forEach(courseTitle => {
      const lowerTitle = courseTitle.toLowerCase();
      courseMapping.set(lowerTitle, courseTitle);
      
      // Add common abbreviations and variations
      if (lowerTitle.includes('python')) {
        courseMapping.set('python', courseTitle);
        courseMapping.set('py', courseTitle);
      }
      if (lowerTitle.includes('machine learning')) {
        courseMapping.set('ml', courseTitle);
        courseMapping.set('machine learning', courseTitle);
        courseMapping.set('machine-learning', courseTitle);
      }
      if (lowerTitle.includes('deep learning')) {
        courseMapping.set('deep learning', courseTitle);
        courseMapping.set('dl', courseTitle);
        courseMapping.set('neural networks', courseTitle);
      }
      if (lowerTitle.includes('natural language')) {
        courseMapping.set('nlp', courseTitle);
        courseMapping.set('natural language processing', courseTitle);
        courseMapping.set('natural language', courseTitle);
      }
      if (lowerTitle.includes('generative')) {
        courseMapping.set('gen ai', courseTitle);
        courseMapping.set('generative ai', courseTitle);
        courseMapping.set('generative artificial intelligence', courseTitle);
      }
      if (lowerTitle.includes('langchain')) {
        courseMapping.set('langchain', courseTitle);
        courseMapping.set('lang chain', courseTitle);
      }
      if (lowerTitle.includes('langgraph')) {
        courseMapping.set('langgraph', courseTitle);
        courseMapping.set('lang graph', courseTitle);
      }
      if (lowerTitle.includes('mlops')) {
        courseMapping.set('mlops', courseTitle);
        courseMapping.set('ml ops', courseTitle);
      }
      if (lowerTitle.includes('llmops')) {
        courseMapping.set('llmops', courseTitle);
        courseMapping.set('llm ops', courseTitle);
      }
      if (lowerTitle.includes('agents')) {
        courseMapping.set('ai agents', courseTitle);
        courseMapping.set('agents', courseTitle);
      }
      if (lowerTitle.includes('ethics')) {
        courseMapping.set('ai ethics', courseTitle);
        courseMapping.set('ethics', courseTitle);
      }
      if (lowerTitle.includes('data analytics')) {
        courseMapping.set('data analytics', courseTitle);
        courseMapping.set('analytics', courseTitle);
        courseMapping.set('data science', courseTitle);
      }
    });
    
    // Find the best match
    for (const [keyword, courseTitle] of courseMapping) {
      if (cleanMessage.includes(keyword)) {
        console.log(`[${this.sessionId}] Matched "${keyword}" to course: ${courseTitle}`);
        return courseTitle;
      }
    }
    
    return null;
  }

  // --- Query Type Detection ---
  private isSimpleGreeting(message: string): boolean {
    const greetings = [
      'hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening',
      'greetings', 'howdy', 'hiya', 'sup', 'what\'s up', 'how are you',
      'how do you do', 'nice to meet you', 'pleased to meet you'
    ];
    
    return greetings.some(greeting => message.includes(greeting));
  }

  private isAllCoursesQuery(message: string): boolean {
    const allCoursesPatterns = [
      'what courses', 'list courses', 'all courses', 'available courses',
      'courses available', 'course catalog', 'course offerings', 'what do you offer',
      'what courses do you provide', 'what courses are available', 'course list',
      'show me courses', 'tell me about courses', 'what training', 'course options'
    ];
    
    return allCoursesPatterns.some(pattern => message.includes(pattern));
  }

  private isFollowUpQuestion(message: string): boolean {
    // Only consider it a follow-up if there's a previous course AND no new course mentioned
    if (!this.lastDiscussedCourse) return false;
    
    const hasNewCourseReference = this.extractPrimaryInterestFromAvailableCourses(message) !== null;
    if (hasNewCourseReference) return false;
    
    const followUpPatterns = [
      'tell me more', 'more details', 'more info', 'elaborate', 'explain',
      'how about', 'what about', 'duration', 'topics', 'modules', 'price',
      'cost', 'fee', 'schedule', 'timing', 'when', 'where', 'how'
    ];
    
    return followUpPatterns.some(pattern => message.includes(pattern));
  }

  /**
   * Fixed: Improved system prompt with better structure and clearer instructions
   */
  private generateSalesAdvisorPrompt(): string {
    return `# ROLE & MISSION: Your Ultimate Career Catalyst & Course Advisor for BigClasses.AI

## Your Core Identity
You are a highly enthusiastic, professional, and persuasive AI-powered course advisor from BigClasses.AI. Your primary mission is to help users discover the perfect course for their career goals and ignite excitement about their learning journey. You are not a simple Q&A bot; you are a career transformation partner who guides users through course discovery. Your entire knowledge about courses comes **EXCLUSIVELY** from the vector database context provided with each query.

## Initial Interaction Guidelines
When users greet you with simple messages like "hi", "hello", or similar:
- Respond warmly and professionally
- Ask about their learning goals, career interests, or what skills they want to develop
- Mention that BigClasses.AI offers various courses in technology, data science, programming, and more
- Encourage them to share what field or skill they're most interested in
- DO NOT assume or directly mention specific courses unless the user has already shown interest

## CRITICAL: Specific Interest Response Rules
When users express interest in SPECIFIC fields or technologies (like "generative AI", "machine learning", "data science", "python", etc.):
- NEVER show the complete course catalog
- Focus ONLY on courses directly related to their stated interest
- If they mention 2-3 specific interests, show only those relevant courses
- Provide a targeted learning path for their specific interests
- Ask follow-up questions to narrow down their exact needs
- Example: If they say "generative AI and machine learning", only show courses related to these two fields

## Non-Negotiable Rules
1. **STRICT DATA SOURCE**: Your knowledge is **STRICTLY LIMITED** to the RELEVANT COURSE INFORMATION context I provide in the prompt. You **MUST NOT** invent, hallucinate, or use any external knowledge about courses. If the context doesn't contain the answer, you must say so with confidence.

2. **MANDATORY REAL DATA USAGE**: When users ask about course topics, modules, curriculum, or duration, you MUST use the EXACT information from the course context. Never provide generic responses like "To help you find the perfect course, could you tell me a bit more about your background" - instead, use the actual course data provided.

3. **NO FINANCIALS OR SALARIES**: You are **STRICTLY FORBIDDEN** from discussing course prices, fees, costs, or salary information. If asked, you **MUST** respond with this exact phrase: "That's an excellent question! For the most accurate and up-to-date details on pricing and career outcomes, our dedicated human advisors are the best point of contact. You can reach them at +91 9666523199. They can also discuss potential financing options with you!"

4. **DURATION QUERIES**: When users ask about course duration, timing, or "how long" a course takes, always provide the specific duration information from the context. Present it in a clear, engaging way that emphasizes the value of the time investment.

5. **TOPICS/MODULES QUERIES**: When users ask about course topics, modules, or curriculum, always provide the specific modules, topics, and projects from the context. List them clearly and in detail from the actual course data.

6. **HANDLE UNKNOWN QUERIES**: If a user asks about a course or topic you cannot find information for in the provided context, respond with enthusiasm and guidance: "While I don't have the specifics on that topic in my database, it sounds interesting! For specialized queries like that, the best step is to chat with our expert advisors at +91 9666523199. They have the full picture of all our offerings."

7. **INSTITUTIONAL AI**: You are the voice of BigClasses.AI. Do not use personal names for yourself. Address the user respectfully and professionally.

## The Conversational Sales Flow (Your Strategy)

### 1. Maintain Flawless Conversational Memory
This is ABSOLUTELY CRITICAL. You **MUST** remember the course being discussed and maintain context across the conversation. Key rules:

**NEW COURSE QUERIES vs FOLLOW-UP QUESTIONS:**
- When users mention specific course names, technologies, or say "I want to learn about [topic]", this is a NEW COURSE QUERY
- When users ask about "topics in it", "duration of it", "modules in it", "what will I learn", they refer to the PREVIOUSLY DISCUSSED COURSE
- NEVER confuse the two - new course queries should get course information, follow-up questions should refer to the previous course

**Context Management:**
- Use the [Conversation Context] section provided in each message to understand what was previously discussed
- Build upon previous responses and maintain continuity for follow-up questions
- When a user asks about a NEW course/topic, reset the conversation context to focus on that new course
- Pay special attention to [IMPORTANT] tags that indicate follow-up questions about a specific course
- The conversation context overrides any new search results when the user is asking follow-up questions
- When answering follow-up questions, ONLY use information about the course mentioned in the conversation context, ignore any other course information that might appear in the search results

**Examples:**
- "I want to learn about LLMOps" = NEW COURSE QUERY (provide LLMOps course info)
- "What are the topics in it?" = FOLLOW-UP QUESTION (refer to previously discussed course)
- "Tell me about machine learning" = NEW COURSE QUERY (provide ML course info)
- "Duration of it" = FOLLOW-UP QUESTION (refer to previously discussed course)

### 2. The Excitement Funnel: Your Response Structure

**For General Inquiries and Interest Discovery:**
When users express general interest or ask about learning, follow this approach:
- Ask about their career goals, current background, or what they want to achieve
- Suggest exploring different fields based on their interests
- Guide them towards specific courses only after understanding their needs
- Use questions like: "What field excites you most?", "Are you looking to switch careers or advance in your current field?", "What type of projects would you love to work on?"

**For Specific Interest Queries:**
When users mention specific technologies or fields they're interested in:
- Focus ONLY on courses that match their stated interests
- Provide a targeted learning path
- Suggest 2-3 most relevant courses maximum
- Ask which specific aspect interests them most
- Example response structure: "Since you're interested in [specific field], I'd recommend focusing on [specific courses]. Which aspect would you like to start with?"

**For Compound Queries (Course + Topics/Duration/Pricing):**
When users ask about a specific course AND want to know additional information (e.g., "I want to learn about gen ai and what are the topics in it" or "mlops duration and pricing"):
- **MANDATORY**: You MUST ONLY use the actual course data provided in the context - NO generic responses
- **PRIMARY FOCUS**: Start with the main course's specific topics/modules/curriculum/duration from the context
- **SECONDARY**: Briefly mention related courses as additional learning paths
- **STRUCTURE**: Main course detailed content first, then related courses, then engagement question
- **CRITICAL**: If topics are requested, list the ACTUAL modules/topics from the course context
- **CRITICAL**: If duration is requested, provide the EXACT duration from the course context
- **CRITICAL**: If pricing is requested, direct to advisors at +91 9666523199
- **NEVER**: Respond with generic questions like "could you tell me more about your background" - always provide the actual course information first
- Example: "Generative AI covers [ACTUAL topics from context]. Duration: [ACTUAL duration from context]. Related courses include [brief mention]. Which aspect interests you most?"

**For Topic/Module Queries:**
When users ask about "topics", "modules", "curriculum", or "what will I learn":
- **MANDATORY**: Extract and list the ACTUAL module names, topics, and projects from the course context
- **STRUCTURE**: Present modules clearly with their topics and projects
- **ENGAGEMENT**: Ask which specific module interests them most
- **NEVER**: Provide generic responses - always use the real course data

**For "All Courses" or "Course Listing" Queries:**
ONLY when users explicitly ask for a complete list (using phrases like "all courses", "what courses do you offer", "show me everything"):
- Present ALL courses from the context provided in a well-organized format
- Use a clear structure with course titles, durations, and key highlights
- Group them logically (Programming, AI/ML, Data Science, etc.)
- End with "Which of these courses interests you most?"

**For Specific Course Inquiries:**
When a user asks about a course, and you are provided with context, follow this structure:

*Step A: Acknowledge & Excite* - Start with an enthusiastic confirmation.
*Step B: The Core Value & Highlights* - Use the provided context to present the most exciting aspects.
*Step C: Set Expectations* - Frame potential difficulties professionally as prerequisites or challenges.
*Step D: The Call to Action* - Always end by opening the door to the next piece of information.
`;
  }

  // Fixed: Added comprehensive error handling and improved search logic
  public async sendMessage(message: string): Promise<string> {
    if (!message || typeof message !== 'string') {
      return "I'd be happy to help you! Please share what you'd like to know about our courses.";
    }

    try {
      console.log(`[${this.sessionId}] User message: "${message}"`);
      console.log(`[${this.sessionId}] Current conversation state - Last course: ${this.lastDiscussedCourse || 'None'}`);

      // Fixed: Better message classification with input validation
      const cleanMessage = message.trim().toLowerCase();
      const isSimpleGreeting = this.isSimpleGreeting(cleanMessage);
      const isFollowUpQuestion = this.isFollowUpQuestion(cleanMessage);
      const isAllCoursesQuery = this.isAllCoursesQuery(cleanMessage);
      
      console.log(`[${this.sessionId}] Message analysis - IsGreeting: ${isSimpleGreeting}, IsFollowUp: ${isFollowUpQuestion}, IsAllCourses: ${isAllCoursesQuery}`);
      
      let relevantCourseInfo: Array<{metadata: {courseTitle: string}, content: string}> = [];
      
      // Fixed: Improved search logic with better error handling
      if (isSimpleGreeting) {
        relevantCourseInfo = [];
      } else if (isFollowUpQuestion && this.lastDiscussedCourse) {
        relevantCourseInfo = await this.getFollowUpCourseInfo(this.lastDiscussedCourse);
      } else if (isAllCoursesQuery) {
        relevantCourseInfo = await this.getAllCoursesInfo();
      } else {
        relevantCourseInfo = await this.searchCourseInfo(message);
      }
      
      // Fixed: Build enhanced message with proper context handling
      const enhancedMessage = this.buildEnhancedMessage(
        message, 
        relevantCourseInfo, 
        isSimpleGreeting, 
        isFollowUpQuestion, 
        isAllCoursesQuery
      );

      const result = await this.chatSession.sendMessage(enhancedMessage);
      const responseText = result.response.text();

      console.log(`[${this.sessionId}] Gemini response received.`);
      return responseText;

    } catch (error: any) {
      console.error(`[${this.sessionId}] Error sending message to Gemini API:`, error);
      return this.handleError(error);
    }
  }

  // Fixed: Added proper error handling method
  private handleError(error: any): string {
    if (!apiKey) {
      return "⚠️ **Service Configuration Issue**\n\nThe AI service is not configured correctly. Please contact our support team at +91 9666523199.";
    }
    
    if (error.message?.includes('API key not valid')) {
      return "⚠️ **Authentication Issue**\n\nThere's an authentication issue with our AI service. Please contact our support team at +91 9666523199.";
    }
    
    if (error.message?.includes('quota') || error.message?.includes('limit')) {
      return "⚠️ **High Demand**\n\nOur AI service is experiencing high demand. Please try again in a moment, or contact our advisors at +91 9666523199 for immediate assistance.";
    }
    
    return "⚠️ **Technical Issue**\n\nI'm experiencing a technical issue at the moment. Please try again in a little while, or contact our advisors at +91 9666523199 for immediate assistance.";
  }

  // Fixed: Improved follow-up course info retrieval
  private async getFollowUpCourseInfo(courseTitle: string): Promise<Array<{metadata: {courseTitle: string}, content: string}>> {
    try {
      console.log(`[${this.sessionId}] Follow-up question detected, searching for: ${courseTitle}`);
      
      const allSearchResults = await faissVectorDB.search(courseTitle, 12);
      const courseSpecificResults = allSearchResults.filter(result => {
        const course = faissVectorDB.getCourseById(result.courseId);
        return course && this.isCourseMatch(course.title, courseTitle);
      });
      
      console.log(`[${this.sessionId}] Found ${courseSpecificResults.length} specific results for "${courseTitle}"`);
      
      if (courseSpecificResults.length > 0) {
        return courseSpecificResults.map(result => {
          const course = faissVectorDB.getCourseById(result.courseId);
          return {
            metadata: { courseTitle: course?.title || 'Unknown Course' },
            content: result.content
          };
        });
      }
      
      // Fallback to course details
      const courseDetails = await this.getCourseDetails(courseTitle);
      if (courseDetails) {
        return [{
          metadata: { courseTitle: courseDetails.title },
          content: this.buildCourseContent(courseDetails)
        }];
      }
      
      return [];
    } catch (error) {
      console.error(`[${this.sessionId}] Error getting follow-up course info:`, error);
      return [];
    }
  }

  // Added: Method to get course details by title
  private async getCourseDetails(courseTitle: string): Promise<CourseData | null> {
    try {
      const allCourses = faissVectorDB.getAllCourses();
      const foundCourse = allCourses.find(course =>
        this.isCourseMatch(course.title, courseTitle)
      );
      return foundCourse || null;
    } catch (error) {
      console.error(`[${this.sessionId}] Error in getCourseDetails:`, error);
      return null;
    }
  }

  // Fixed: Added method to get all courses info
  private async getAllCoursesInfo(): Promise<Array<{metadata: {courseTitle: string}, content: string}>> {
    try {
      console.log(`[${this.sessionId}] Getting all courses information`);
      
      const allCourses = faissVectorDB.getAllCourses();
      const courseOverviews = new Map<number, {metadata: {courseTitle: string}, content: string}>();
      
      // Get overview for each course
      for (const course of allCourses) {
        try {
          const searchResults = await faissVectorDB.search(course.title, 3);
          const courseResult = searchResults.find(result => result.courseId === course.id);
          
          if (courseResult) {
            courseOverviews.set(course.id, {
              metadata: { courseTitle: course.title },
              content: courseResult.content
            });
          } else {
            // Fallback to basic course info
            courseOverviews.set(course.id, {
              metadata: { courseTitle: course.title },
              content: `${course.title} (${course.duration}): ${course.highlights.slice(0, 3).join(', ')}`
            });
          }
        } catch (error) {
          console.error(`[${this.sessionId}] Error getting info for course ${course.title}:`, error);
          // Continue with other courses
        }
      }
      
      return Array.from(courseOverviews.values());
    } catch (error) {
      console.error(`[${this.sessionId}] Error getting all courses info:`, error);
      return [];
    }
  }

  // Fixed: Enhanced search logic to detect specific interests
  private async searchCourseInfo(message: string): Promise<Array<{metadata: {courseTitle: string}, content: string}>> {
    try {
      // Check for compound queries first
      const compoundQuery = this.detectCompoundQuery(message);
      
      if (compoundQuery.isCompound && compoundQuery.interest) {
        console.log(`[${this.sessionId}] Compound query detected: ${compoundQuery.interest} + topics`);
        return await this.getComprehensiveCourseInfo(compoundQuery.interest);
      }
      
      // Regular specific interest detection
      const specificInterests = this.detectSpecificInterests(message);
      
      if (specificInterests.length > 0) {
        console.log(`[${this.sessionId}] Detected specific interests: ${specificInterests.join(', ')}`);
        const interestResults = await this.getCoursesForSpecificInterests(specificInterests);
        
        if (interestResults.length > 0) {
          console.log(`[${this.sessionId}] Found ${interestResults.length} courses for specific interests`);
          return interestResults;
        } else {
          console.log(`[${this.sessionId}] No courses found for specific interests, falling back to general search`);
        }
      }
      
      // Default search for general queries or fallback
      console.log(`[${this.sessionId}] Performing general search for: "${message}"`);
      const searchResults = await faissVectorDB.search(message, 5);
      console.log(`[${this.sessionId}] General search returned ${searchResults.length} results`);
      
      const results = searchResults.map(result => {
        const course = faissVectorDB.getCourseById(result.courseId);
        return {
          metadata: { courseTitle: course?.title || 'Unknown Course' },
          content: result.content
        };
      });
      
      console.log(`[${this.sessionId}] Final general search results: ${results.map(r => r.metadata.courseTitle).join(', ')}`);
      return results;
    } catch (error) {
      console.error(`[${this.sessionId}] Error searching course info:`, error);
      return [];
    }
  }

  // New: Method to detect specific interests from user message
  private detectSpecificInterests(message: string): string[] {
    const cleanMessage = message.toLowerCase();
    const interests: string[] = [];
    
    console.log(`[${this.sessionId}] Detecting interests in message: "${cleanMessage}"`);
    
    // Define interest mappings
    const interestKeywords = {
      'generative ai': ['generative ai', 'gen ai', 'generative artificial intelligence', 'generative', 'ai generation'],
      'machine learning': ['machine learning', 'ml', 'machine learning', 'ml course', 'learn ml'],
      'deep learning': ['deep learning', 'neural networks', 'dl', 'deep neural networks'],
      'python': ['python programming', 'python', 'python course'],
      'data science': ['data science', 'data analytics', 'data analysis', 'data scientist'],
      'nlp': ['natural language processing', 'nlp', 'text processing', 'language processing'],
      'langchain': ['langchain', 'lang chain'],
      'langgraph': ['langgraph', 'lang graph'],
      'mlops': ['mlops', 'ml ops', 'machine learning operations', 'mlops course'],
      'llmops': ['llmops', 'llm ops', 'large language model operations', 'llm operations'],
      'ai agents': ['ai agents', 'artificial intelligence agents', 'intelligent agents', 'agents'],
      'ai ethics': ['ai ethics', 'artificial intelligence ethics', 'ethical ai']
    };
    
    // Check for each interest
    for (const [interest, keywords] of Object.entries(interestKeywords)) {
      const matchedKeywords = keywords.filter(keyword => cleanMessage.includes(keyword));
      if (matchedKeywords.length > 0) {
        console.log(`[${this.sessionId}] ✅ Interest "${interest}" detected via keywords: ${matchedKeywords.join(', ')}`);
        interests.push(interest);
      }
    }
    
    console.log(`[${this.sessionId}] Final detected interests: ${interests.join(', ')}`);
    return interests;
  }

  // New: Method to get courses for specific interests
  private async getCoursesForSpecificInterests(interests: string[]): Promise<Array<{metadata: {courseTitle: string}, content: string}>> {
    try {
      const relevantCourses = new Map<number, {metadata: {courseTitle: string}, content: string}>();
      
      for (const interest of interests) {
        console.log(`[${this.sessionId}] Searching for interest: "${interest}"`);
        
        // Use multiple search terms to find relevant courses
        const searchTerms = [interest];
        
        // Add variations for better matching
        if (interest === 'generative ai') {
          searchTerms.push('generative artificial intelligence', 'gen ai', 'ai generation');
        } else if (interest === 'machine learning') {
          searchTerms.push('ml', 'machine learning algorithms', 'ml course');
        } else if (interest === 'deep learning') {
          searchTerms.push('neural networks', 'deep neural networks', 'dl');
        } else if (interest === 'python') {
          searchTerms.push('python programming', 'python course');
        } else if (interest === 'data science') {
          searchTerms.push('data analytics', 'data analysis', 'data scientist');
        } else if (interest === 'nlp') {
          searchTerms.push('natural language processing', 'language processing');
        } else if (interest === 'mlops') {
          searchTerms.push('ml ops', 'machine learning operations');
        } else if (interest === 'llmops') {
          searchTerms.push('llm ops', 'large language model operations');
        } else if (interest === 'ai agents') {
          searchTerms.push('agents', 'intelligent agents');
        }
        
        for (const searchTerm of searchTerms) {
          const searchResults = await faissVectorDB.search(searchTerm, 8);
          console.log(`[${this.sessionId}] Search "${searchTerm}" returned ${searchResults.length} results`);
          
          for (const result of searchResults) {
            const course = faissVectorDB.getCourseById(result.courseId);
            if (course) {
              console.log(`[${this.sessionId}] Evaluating course: "${course.title}" for interest: "${interest}"`);
              
              if (this.isCourseRelevantToInterest(course.title, interest)) {
                console.log(`[${this.sessionId}] ✅ Course "${course.title}" is relevant to "${interest}"`);
                relevantCourses.set(course.id, {
                  metadata: { courseTitle: course.title },
                  content: result.content
                });
              } else {
                console.log(`[${this.sessionId}] ❌ Course "${course.title}" is NOT relevant to "${interest}"`);
              }
            }
          }
        }
      }
      
      const results = Array.from(relevantCourses.values()).slice(0, 4);
      console.log(`[${this.sessionId}] Final results: ${results.map(r => r.metadata.courseTitle).join(', ')}`);
      
      return results;
    } catch (error) {
      console.error(`[${this.sessionId}] Error getting courses for specific interests:`, error);
      return [];
    }
  }

  // New: Method to check if course is relevant to specific interest
  private isCourseRelevantToInterest(courseTitle: string, interest: string): boolean {
    const title = courseTitle.toLowerCase();
    
    const relevanceMap: Record<string, string[]> = {
      'generative ai': ['generative ai', 'generative', 'ai', 'artificial intelligence'],
      'machine learning': ['machine learning', 'ml', 'machine', 'learning'],
      'deep learning': ['deep learning', 'deep', 'neural', 'neural networks'],
      'python': ['python'],
      'data science': ['data', 'analytics', 'science'],
      'nlp': ['nlp', 'natural language', 'language', 'processing'],
      'langchain': ['langchain', 'chain'],
      'langgraph': ['langgraph', 'graph'],
      'mlops': ['mlops', 'operations', 'ops'],
      'llmops': ['llmops', 'llm'],
      'ai agents': ['agents', 'agent'],
      'ai ethics': ['ethics', 'ethical']
    };
    
    const keywords = relevanceMap[interest] || [];
    const isRelevant = keywords.some(keyword => title.includes(keyword));
    
    console.log(`[${this.sessionId}] Checking relevance: "${courseTitle}" vs "${interest}" -> ${isRelevant}`);
    console.log(`[${this.sessionId}] Keywords checked: ${keywords.join(', ')}`);
    
    return isRelevant;
  }

  // Fixed: Added method to build enhanced message
  private buildEnhancedMessage(
    originalMessage: string,
    relevantCourseInfo: Array<{metadata: {courseTitle: string}, content: string}>,
    isSimpleGreeting: boolean,
    isFollowUpQuestion: boolean,
    isAllCoursesQuery: boolean
  ): string {
    if (isSimpleGreeting) {
      return `[User's Current Message]:
${originalMessage}

[Instructions]: The user is greeting you. Respond warmly and ask about their learning goals or what field/skills they're interested in. Help them discover the right course for their needs.`;
    }

    // Detect compound queries
    const compoundQuery = this.detectCompoundQuery(originalMessage);
    
    // Detect specific interests for targeted responses
    const specificInterests = this.detectSpecificInterests(originalMessage);
    const isSpecificInterestQuery = specificInterests.length > 0 && !isAllCoursesQuery;
    
    // CRITICAL: If this is a new course query (not a follow-up), reset conversation context
    if (!isFollowUpQuestion && (isSpecificInterestQuery || relevantCourseInfo.length > 0)) {
      const newCourseTitle = relevantCourseInfo[0]?.metadata?.courseTitle;
      if (newCourseTitle && newCourseTitle !== this.lastDiscussedCourse) {
        console.log(`[${this.sessionId}] New course detected: "${newCourseTitle}" (was: "${this.lastDiscussedCourse || 'none'}")`);
        this.lastDiscussedCourse = newCourseTitle;
        if (!this.conversationContext.includes(newCourseTitle)) {
          this.conversationContext.push(newCourseTitle);
        }
      }
    }

    if (relevantCourseInfo.length === 0) {
      return `[Conversation Context]:
${this.lastDiscussedCourse ? `Currently discussing course: ${this.lastDiscussedCourse}` : 'No previous course discussed'}

[User's Current Message]:
${originalMessage}

[Instructions]: ${this.lastDiscussedCourse ? `The user's message relates to our ongoing conversation about ${this.lastDiscussedCourse}. Remember what we've discussed and maintain conversational continuity.` : 'Help the user discover the right course for their needs.'}`;
    }

    const contextInfo = relevantCourseInfo.map(
      (result) => `Course: ${result.metadata.courseTitle}\nDetails: ${result.content}`
    ).join('\n\n');

    return `[Context for this query - Course Information Available]:
${contextInfo}

[Conversation Context]:
${this.lastDiscussedCourse ? `Currently discussing course: ${this.lastDiscussedCourse}` : 'No previous course discussed'}
${isFollowUpQuestion ? `[IMPORTANT: This is a follow-up question about ${this.lastDiscussedCourse}]` : ''}
${isAllCoursesQuery ? `[IMPORTANT: This is a request for ALL AVAILABLE COURSES - User wants complete course listing]` : ''}
${compoundQuery.isCompound ? `[IMPORTANT: This is a COMPOUND QUERY - User wants ${compoundQuery.wantsTopics ? 'topics/modules' : ''}${compoundQuery.wantsDuration ? ' duration' : ''}${compoundQuery.wantsPricing ? ' pricing' : ''} for ${compoundQuery.interest} course AND brief info about related courses]` : ''}
${isSpecificInterestQuery && !compoundQuery.isCompound ? `[IMPORTANT: This is a SPECIFIC INTEREST query for: ${specificInterests.join(', ')}. Show ONLY courses related to these interests, not all courses.]` : ''}

[MANDATORY DATA USAGE RULES]:
- You MUST use ONLY the actual course data provided in the context above
- When providing topics/modules, use the EXACT module names and topics from the course context
- When providing duration, use the EXACT duration specified in the course context
- When providing course details, use the EXACT highlights, features, and module information from the context
- DO NOT create generic responses or use external knowledge - ONLY use the provided course data
- If specific information is not available in the context, direct users to contact advisors at +91 9666523199

[User's Current Message]:
${originalMessage}

[Instructions]: Use the provided context to answer the user's question. Remember our conversation history. ${this.getSpecificInstructions(isAllCoursesQuery, isFollowUpQuestion, isSpecificInterestQuery, specificInterests, compoundQuery)}`;
  }

  // Enhanced: Updated specific instructions method
  private getSpecificInstructions(
    isAllCoursesQuery: boolean, 
    isFollowUpQuestion: boolean, 
    isSpecificInterestQuery: boolean, 
    specificInterests: string[],
    compoundQuery?: {interest: string | null, wantsTopics: boolean, wantsDuration: boolean, wantsPricing: boolean, isCompound: boolean}
  ): string {
    if (isAllCoursesQuery) {
      return `The user is asking for a complete list of all available courses. You MUST present ALL courses from the context above in an organized, exciting format. Do NOT say you don't have information - use all the course context provided above to create a comprehensive course listing. Group them by category and include course titles, durations, and highlights. End with asking which course interests them most.`;
    }
    
    if (compoundQuery?.isCompound) {
      const requestedInfo: string[] = [];
      if (compoundQuery.wantsTopics) requestedInfo.push('topics/modules/curriculum');
      if (compoundQuery.wantsDuration) requestedInfo.push('duration/timeline');
      if (compoundQuery.wantsPricing) requestedInfo.push('pricing information');
      
      return `The user is asking for ${requestedInfo.join(' and ')} for the ${compoundQuery.interest} course AND wants to know about related courses. 

CRITICAL INSTRUCTIONS FOR COMPOUND QUERIES:
- You MUST ONLY use the ACTUAL course data provided in the context above
- DO NOT provide generic responses like "To help you find the perfect course, could you tell me more about your background"
- Extract specific details from the course context for the requested information
- NEVER ask questions about their background when they've already specified what they want to learn

STRUCTURE YOUR RESPONSE AS FOLLOWS:
      
1. **PRIMARY FOCUS**: Start with the main ${compoundQuery.interest} course:
   ${compoundQuery.wantsTopics ? `- List the ACTUAL topics/modules/curriculum from the course context with module names and topics` : ''}
   ${compoundQuery.wantsDuration ? `- State the EXACT duration from the course context` : ''}
   ${compoundQuery.wantsPricing ? `- For pricing, respond: "For the most accurate pricing details, please contact our advisors at +91 9666523199."` : ''}

2. **RELATED COURSES**: Briefly mention related courses from the context as additional learning paths

3. **ENGAGEMENT**: Ask which specific aspect interests them most

MANDATORY: Use ONLY the real course data from the context above. Extract the actual module names, topics, projects, and duration. If the context doesn't contain specific ${requestedInfo.join(' or ')}, say so and direct to advisors at +91 9666523199.`;
    }
    
    if (isSpecificInterestQuery) {
      return `The user is interested in specific fields: ${specificInterests.join(', ')}. You MUST focus ONLY on courses that directly relate to these interests. Do NOT show all courses or unrelated courses. Provide a targeted learning path for their specific interests. Suggest 2-3 most relevant courses maximum and ask which aspect they'd like to start with.`;
    }
    
    if (isFollowUpQuestion && this.lastDiscussedCourse) {
      return `The user is asking a follow-up question about "${this.lastDiscussedCourse}" specifically. When they ask about "topics", "modules", "curriculum", "duration", "how long", "time", "what will I learn", or similar questions, they are referring to "${this.lastDiscussedCourse}" ONLY. 

CRITICAL: You must ONLY use information about "${this.lastDiscussedCourse}" from the context above. If you see information about other courses in the context, completely ignore it. Focus exclusively on "${this.lastDiscussedCourse}".`;
    }
    
    return `If the user refers to "it", "this course", "that program", etc., they are likely referring to the last discussed course: ${this.lastDiscussedCourse || 'none'}. Maintain the conversational flow and remember what we've discussed.`;
  }

  // Fixed: Helper method to check if course matches
  private isCourseMatch(courseTitle: string, targetTitle: string): boolean {
    const normalize = (title: string) => title.toLowerCase().replace(/\s+/g, '');
    const normalizedCourse = normalize(courseTitle);
    const normalizedTarget = normalize(targetTitle);
    
    return normalizedCourse === normalizedTarget ||
           normalizedCourse.includes(normalizedTarget) ||
           normalizedTarget.includes(normalizedCourse);
  }

  // Fixed: Helper method to build course content with comprehensive details
  private buildCourseContent(course: CourseData): string {
    const moduleDetails = course.modules.map((module, index) => {
      const moduleInfo = [];
      if (module.name) moduleInfo.push(`Module ${index + 1}: ${module.name}`);
      if (module.description) moduleInfo.push(`Description: ${module.description}`);
      if (module.topics && module.topics.length > 0) {
        moduleInfo.push(`Topics: ${module.topics.join(', ')}`);
      }
      if (module.project) moduleInfo.push(`Project: ${module.project}`);
      return moduleInfo.join(' | ');
    }).join('\n');

    return `Course: ${course.title}
Duration: ${course.duration}
Package: ${course.package}
Career Growth: ${course.hike}
Transitions: ${course.transitions}
Highlights: ${course.highlights.join(', ')}
Features: ${course.features.join(', ')}
Detailed Modules & Topics:
${moduleDetails}`;
  }

  // Fixed: Improved greeting detection
  private isSimpleGreeting(message: string): boolean {
    const greetings = [
      'hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening',
      'hii', 'hiii', 'helo', 'hellow', 'hai', 'hey there', 'yo', 'sup',
      'greetings', 'howdy', 'what\'s up', 'whats up', 'wassup'
    ];
    
    const cleanMessage = message.toLowerCase().trim().replace(/[!.?]+$/, '');
    return greetings.some(greeting => 
      cleanMessage === greeting || 
      cleanMessage.startsWith(greeting + ' ') ||
      cleanMessage.endsWith(' ' + greeting)
    );
  }

  // Fixed: Improved follow-up question detection
  private isFollowUpQuestion(message: string): boolean {
    if (!this.lastDiscussedCourse) return false;
    
    const cleanMessage = message.toLowerCase().trim();
    
    // CRITICAL: If the message mentions a new course/topic, it's NOT a follow-up question
    const specificInterests = this.detectSpecificInterests(message);
    if (specificInterests.length > 0) {
      console.log(`[${this.sessionId}] Message contains specific interests: ${specificInterests.join(', ')} - NOT a follow-up question`);
      return false;
    }
    
    // Check if message contains any course-related keywords that suggest a new course query
    const courseKeywords = [
      'learn about', 'course on', 'course in', 'want to learn', 'interested in',
      'tell me about', 'what is', 'explain', 'course for', 'training in',
      'study', 'master', 'understand', 'explore'
    ];
    
    const containsNewCourseQuery = courseKeywords.some(keyword => 
      cleanMessage.includes(keyword)
    );
    
    if (containsNewCourseQuery) {
      console.log(`[${this.sessionId}] Message contains new course query keywords - NOT a follow-up question`);
      return false;
    }
    
    // Specific follow-up phrases that clearly refer to the previous course
    const followUpPhrases = [
      'topics in it', 'modules in it', 'curriculum in it', 'syllabus in it',
      'duration of it', 'how long is it', 'length of it', 'time for it',
      'price of it', 'cost of it', 'fee for it', 'projects in it',
      'assignments in it', 'what will i learn', 'what do i learn',
      'prerequisite', 'requirements', 'eligibility',
      'about it', 'more about it', 'details about it', 'tell me more',
      'in this course', 'in that course', 'about this course', 'about that course'
    ];
    
    // Check for explicit follow-up phrases
    if (followUpPhrases.some(phrase => cleanMessage.includes(phrase))) {
      console.log(`[${this.sessionId}] Message contains follow-up phrases - IS a follow-up question`);
      return true;
    }
    
    // Check for pronouns referring to the previous course (but be more specific)
    const pronouns = ['it', 'this', 'that'];
    const hasPronouns = pronouns.some(pronoun => 
      cleanMessage.includes(' ' + pronoun + ' ') || 
      cleanMessage.startsWith(pronoun + ' ') || 
      cleanMessage.endsWith(' ' + pronoun)
    );
    
    // Only consider it a follow-up if it has pronouns AND is a question AND doesn't mention new topics
    if (hasPronouns && cleanMessage.includes('?') && !containsNewCourseQuery) {
      console.log(`[${this.sessionId}] Message has pronouns and is a question - IS a follow-up question`);
      return true;
    }
    
    // Check for very specific follow-up patterns
    const specificFollowUpPatterns = [
      'topics', 'modules', 'curriculum', 'syllabus', 'duration', 'how long',
      'what will i learn', 'what do i learn', 'timeline', 'schedule'
    ];
    
    // Only if it's JUST asking about these topics without mentioning new courses
    const isJustFollowUpQuery = specificFollowUpPatterns.some(pattern => 
      cleanMessage.includes(pattern)
    ) && !containsNewCourseQuery && cleanMessage.length < 50; // Short queries are more likely to be follow-ups
    
    if (isJustFollowUpQuery) {
      console.log(`[${this.sessionId}] Message is a short follow-up query - IS a follow-up question`);
      return true;
    }
    
    console.log(`[${this.sessionId}] Message is NOT a follow-up question`);
    return false;
  }

  // Fixed: Added method to detect all courses queries
  private isAllCoursesQuery(message: string): boolean {
    const explicitAllCoursesKeywords = [
      'all courses', 'available courses', 'course list', 'complete course list',
      'show all courses', 'list all courses', 'what courses do you offer',
      'show me all courses', 'tell me about all courses', 'complete catalog',
      'course catalog', 'all programs', 'what programs do you have',
      'everything you offer', 'full course list'
    ];
    
    const cleanMessage = message.toLowerCase();
    
    // First check for explicit "all courses" requests
    const isExplicitAllCoursesRequest = explicitAllCoursesKeywords.some(keyword => 
      cleanMessage.includes(keyword)
    );
    
    if (isExplicitAllCoursesRequest) {
      return true;
    }
    
    // Check if it's a specific interest query (should NOT show all courses)
    const specificInterests = this.detectSpecificInterests(message);
    if (specificInterests.length > 0) {
      return false; // This is a specific interest query, not an "all courses" query
    }
    
    // For general queries about courses without specific interests
    const generalCourseKeywords = ['what courses', 'which courses', 'courses available'];
    const hasGeneralCourseQuery = generalCourseKeywords.some(keyword => 
      cleanMessage.includes(keyword)
    );
    
    // Only return true for general queries that don't mention specific technologies
    return hasGeneralCourseQuery && !this.hasSpecificTechMentions(cleanMessage);
  }

  // New: Helper method to check for specific technology mentions
  private hasSpecificTechMentions(message: string): boolean {
    const techKeywords = [
      'ai', 'ml', 'python', 'data science', 'machine learning', 'deep learning',
      'generative', 'nlp', 'langchain', 'langgraph', 'mlops', 'analytics',
      'programming', 'neural networks', 'artificial intelligence'
    ];
    
    return techKeywords.some(keyword => message.includes(keyword));
  }

  // New: Method to check if a course name/topic exists in the database
  private async courseExistsInDatabase(query: string): Promise<boolean> {
    try {
      const searchResults = await faissVectorDB.search(query, 1);
      return searchResults.length > 0;
    } catch (error) {
      console.error(`[${this.sessionId}] Error checking course existence:`, error);
      return false;
    }
  }

  // New: Method to get all available course names for dynamic matching
  private getAllAvailableCourseNames(): string[] {
    try {
      const allCourses = faissVectorDB.getAllCourses();
      return allCourses.map(course => course.title.toLowerCase());
    } catch (error) {
      console.error(`[${this.sessionId}] Error getting course names:`, error);
      return [];
    }
  }

  // New: Method to detect compound queries (course + topics)
  private detectCompoundQuery(message: string): {
    interest: string | null,
    wantsTopics: boolean,
    wantsDuration: boolean,
    wantsPricing: boolean,
    isCompound: boolean
  } {
    const cleanMessage = message.toLowerCase();
    
    console.log(`[${this.sessionId}] Analyzing compound query: "${cleanMessage}"`);
    
    // Detect what additional info the user wants
    const topicKeywords = [
      'topics', 'modules', 'curriculum', 'syllabus', 'subjects', 'content',
      'what are the topics', 'what topics', 'what modules', 'what subjects',
      'topics covered', 'modules covered', 'curriculum covered', 'syllabus covered',
      'what will i learn', 'what do i learn', 'content covered', 'what is covered',
      'topics in it', 'modules in it', 'curriculum in it', 'syllabus in it',
      'what are in it', 'what is in it', 'what does it cover', 'what it covers',
      'learn in it', 'study in it', 'covered in it'
    ];
    
    const durationKeywords = [
      'duration', 'how long', 'time', 'weeks', 'months', 'days', 'hours',
      'timeline', 'schedule', 'length', 'time frame', 'time period',
      'how much time', 'time needed', 'time required', 'completion time',
      'duration of it', 'how long is it', 'time for it', 'length of it'
    ];
    
    const pricingKeywords = [
      'price', 'cost', 'fee', 'pricing', 'how much', 'money', 'payment',
      'fees', 'costs', 'charges', 'amount', 'price of it', 'cost of it',
      'fee for it', 'how much does it cost', 'what is the price'
    ];
    
    const wantsTopics = topicKeywords.some(keyword => cleanMessage.includes(keyword));
    const wantsDuration = durationKeywords.some(keyword => cleanMessage.includes(keyword));
    const wantsPricing = pricingKeywords.some(keyword => cleanMessage.includes(keyword));
    
    // Detect course interest dynamically
    let primaryInterest: string | null = null;
    
    // Get all available courses and check if any are mentioned
    try {
      const allCourses = faissVectorDB.getAllCourses();
      const courseKeywords = new Map<string, string[]>();
      
      // Build dynamic keyword mappings from actual course data
      for (const course of allCourses) {
        const courseTitle = course.title.toLowerCase();
        const keywords: string[] = [courseTitle];
        
        // Add common variations
        if (courseTitle.includes('machine learning')) {
          keywords.push('ml', 'machine learning', 'machine-learning');
        }
        if (courseTitle.includes('generative ai')) {
          keywords.push('gen ai', 'generative ai', 'generative artificial intelligence');
        }
        if (courseTitle.includes('deep learning')) {
          keywords.push('deep learning', 'dl', 'neural networks');
        }
        if (courseTitle.includes('python')) {
          keywords.push('python', 'python programming');
        }
        if (courseTitle.includes('data science')) {
          keywords.push('data science', 'data analytics', 'data analysis');
        }
        if (courseTitle.includes('nlp')) {
          keywords.push('nlp', 'natural language processing');
        }
        if (courseTitle.includes('mlops')) {
          keywords.push('mlops', 'ml ops', 'machine learning operations');
        }
        if (courseTitle.includes('llmops')) {
          keywords.push('llmops', 'llm ops', 'large language model operations');
        }
        if (courseTitle.includes('agents')) {
          keywords.push('agents', 'ai agents', 'intelligent agents');
        }
        
        courseKeywords.set(course.title, keywords);
      }
      
      // Find which course is mentioned in the message
      for (const [courseTitle, keywords] of courseKeywords) {
        if (keywords.some(keyword => cleanMessage.includes(keyword))) {
          primaryInterest = courseTitle;
          console.log(`[${this.sessionId}] Detected course interest: "${courseTitle}" via keywords: ${keywords.filter(k => cleanMessage.includes(k)).join(', ')}`);
          break;
        }
      }
    } catch (error) {
      console.error(`[${this.sessionId}] Error in dynamic course detection:`, error);
      // Fallback to static detection
      const specificInterests = this.detectSpecificInterests(message);
      primaryInterest = specificInterests[0] || null;
    }
    
    // Check if it's a compound query
    const isCompound = primaryInterest && (wantsTopics || wantsDuration || wantsPricing);
    
    console.log(`[${this.sessionId}] Compound query result: interest="${primaryInterest}", topics=${wantsTopics}, duration=${wantsDuration}, pricing=${wantsPricing}, compound=${isCompound}`);
    
    return {
      interest: primaryInterest,
      wantsTopics,
      wantsDuration,
      wantsPricing,
      isCompound
    };
  }

  // New: Method to get comprehensive course information for compound queries
  private async getComprehensiveCourseInfo(interest: string): Promise<Array<{metadata: {courseTitle: string}, content: string}>> {
    try {
      console.log(`[${this.sessionId}] Getting comprehensive info for interest: "${interest}"`);
      
      const relevantCourses = new Map<number, {metadata: {courseTitle: string}, content: string}>();
      
      // Search with multiple strategies
      const searchStrategies = [
        interest, // Direct search
        interest.toLowerCase(), // Lowercase
        interest.replace(/\s+/g, ''), // Remove spaces
      ];
      
      // Add common variations based on the interest
      if (interest.toLowerCase().includes('gen')) {
        searchStrategies.push('generative ai', 'generative artificial intelligence');
      }
      if (interest.toLowerCase().includes('ml') || interest.toLowerCase().includes('machine')) {
        searchStrategies.push('machine learning', 'ml');
      }
      
      const allSearchResults: any[] = [];
      
      // Perform searches with all strategies
      for (const searchTerm of searchStrategies) {
        try {
          const results = await faissVectorDB.search(searchTerm, 15);
          allSearchResults.push(...results);
          console.log(`[${this.sessionId}] Search "${searchTerm}" returned ${results.length} results`);
        } catch (error) {
          console.error(`[${this.sessionId}] Search failed for "${searchTerm}":`, error);
        }
      }
      
      // Remove duplicates and categorize courses
      const uniqueResults = new Map<string, any>();
      allSearchResults.forEach(result => {
        const key = `${result.courseId}-${result.id}`;
        if (!uniqueResults.has(key)) {
          uniqueResults.set(key, result);
        }
      });
      
      const primaryCourses: Array<{course: any, content: string, similarity: number}> = [];
      const relatedCourses: Array<{course: any, content: string, similarity: number}> = [];
      
      // Categorize results
      for (const result of uniqueResults.values()) {
        const course = faissVectorDB.getCourseById(result.courseId);
        if (course) {
          const isExactMatch = this.isExactCourseMatch(course.title, interest);
          const courseInfo = { course, content: result.content, similarity: result.similarity };
          
          if (isExactMatch) {
            primaryCourses.push(courseInfo);
          } else {
            relatedCourses.push(courseInfo);
          }
        }
      }
      
      // Sort by similarity
      primaryCourses.sort((a, b) => b.similarity - a.similarity);
      relatedCourses.sort((a, b) => b.similarity - a.similarity);
      
      console.log(`[${this.sessionId}] Found ${primaryCourses.length} primary courses, ${relatedCourses.length} related courses`);
      
      // Prioritize primary courses - get ALL content for the main course
      for (const {course, content} of primaryCourses) {
        if (!relevantCourses.has(course.id)) {
          // Get all available content for the primary course
          const allCourseContent = await this.getAllContentForCourse(course.id);
          relevantCourses.set(course.id, {
            metadata: { courseTitle: course.title },
            content: allCourseContent || content
          });
        }
      }
      
      // Add a few related courses with basic info
      for (const {course, content} of relatedCourses.slice(0, 2)) {
        if (!relevantCourses.has(course.id)) {
          relevantCourses.set(course.id, {
            metadata: { courseTitle: course.title },
            content: content
          });
        }
      }
      
      const results = Array.from(relevantCourses.values());
      console.log(`[${this.sessionId}] Final comprehensive results: ${results.map(r => r.metadata.courseTitle).join(', ')}`);
      
      return results;
    } catch (error) {
      console.error(`[${this.sessionId}] Error getting comprehensive course info:`, error);
      return [];
    }
  }

  // New: Method to get all available content for a specific course
  private async getAllContentForCourse(courseId: number): Promise<string> {
    try {
      const course = faissVectorDB.getCourseById(courseId);
      if (!course) return '';
      
      // Search for all content related to this course
      const searchResults = await faissVectorDB.search(course.title, 20);
      const courseContent = searchResults
        .filter(result => result.courseId === courseId)
        .map(result => result.content)
        .join('\n\n');
      
      // Always include the detailed course structure
      const detailedContent = this.buildCourseContent(course);
      
      // If we have search results, combine them with detailed content
      if (courseContent && courseContent.trim()) {
        return `${detailedContent}\n\nAdditional Course Information:\n${courseContent}`;
      }
      
      // Otherwise return the detailed content
      return detailedContent;
    } catch (error) {
      console.error(`[${this.sessionId}] Error getting all content for course ${courseId}:`, error);
      return '';
    }
  }

  // New: Method to check if course title exactly matches the interest
  private isExactCourseMatch(courseTitle: string, interest: string): boolean {
    const title = courseTitle.toLowerCase();
    const interestLower = interest.toLowerCase();
    
    // Direct title match
    if (title.includes(interestLower) || interestLower.includes(title)) {
      console.log(`[${this.sessionId}] Direct match: "${courseTitle}" contains "${interest}"`);
      return true;
    }
    
    // Dynamic mapping based on common abbreviations and variations
    const commonMappings: Record<string, string[]> = {
      'generative ai': ['gen ai', 'generative artificial intelligence', 'generative'],
      'machine learning': ['ml', 'machine-learning'],
      'deep learning': ['dl', 'deep neural networks'],
      'python programming': ['python'],
      'data science': ['data analytics', 'data analysis'],
      'natural language processing': ['nlp'],
      'machine learning operations': ['mlops', 'ml ops'],
      'large language model operations': ['llmops', 'llm ops'],
      'ai agents': ['agents', 'intelligent agents'],
      'artificial intelligence': ['ai']
    };
    
    // Check if the course title matches any variations of the interest
    for (const [fullName, variations] of Object.entries(commonMappings)) {
      if (title.includes(fullName) && variations.some(v => interestLower.includes(v))) {
        console.log(`[${this.sessionId}] Variation match: "${courseTitle}" (${fullName}) matches interest "${interest}"`);
        return true;
      }
      if (variations.some(v => title.includes(v)) && interestLower.includes(fullName)) {
        console.log(`[${this.sessionId}] Reverse variation match: "${courseTitle}" matches interest "${interest}"`);
        return true;
      }
    }
    
    // Check word-by-word similarity for fuzzy matching
    const titleWords = title.split(/\s+/);
    const interestWords = interestLower.split(/\s+/);
    
    const matchedWords = titleWords.filter(word => 
      word.length > 2 && interestWords.some(iWord => 
        iWord.length > 2 && (word.includes(iWord) || iWord.includes(word))
      )
    );
    
    const similarity = matchedWords.length / Math.max(titleWords.length, interestWords.length);
    const isExact = similarity >= 0.5; // 50% word similarity threshold
    
    if (isExact) {
      console.log(`[${this.sessionId}] Fuzzy match: "${courseTitle}" vs "${interest}" (similarity: ${similarity.toFixed(2)})`);
    }
    
    return isExact;
  }
}