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
      });
      
      console.log(`[${this.sessionId}] Loaded ${this.availableCourses.size} courses from FAISS database`);
    } catch (error) {
      console.error(`[${this.sessionId}] Error initializing courses:`, error);
    }
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

  // --- Enhanced Message Building ---
  private async buildEnhancedMessage(message: string, queryAnalysis: QueryAnalysis): Promise<string> {
    const { isGreeting, isAllCourses, isFollowUp, compoundQuery, detectedCourses, faissResults } = queryAnalysis;
    
    // Build context information from FAISS data
    const contextInfo = this.formatFAISSResultsForContext(faissResults, compoundQuery);
    
    // Build conversation context
    const conversationContext = [
      `Currently discussing: ${this.lastDiscussedCourse || 'No previous course'}`,
      isFollowUp ? `[FOLLOW-UP]: User asking about ${this.lastDiscussedCourse}` : '',
      isAllCourses ? `[ALL COURSES]: User wants complete course listing` : '',
      compoundQuery.isCompound ? `[COMPOUND QUERY]: User wants ${compoundQuery.wantsTopics ? 'topics ' : ''}${compoundQuery.wantsDuration ? 'duration ' : ''}${compoundQuery.wantsPricing ? 'pricing ' : ''}for ${compoundQuery.interest}` : '',
      detectedCourses.length > 0 ? `[DETECTED COURSES]: ${detectedCourses.join(', ')}` : ''
    ].filter(Boolean).join('\n');
    
    // Generate enhanced message
    const enhancedMessage = `${this.generateSystemPrompt()}

[COURSE DATA FROM FAISS DATABASE]:
${contextInfo}

[CONVERSATION CONTEXT]:
${conversationContext}

[USER MESSAGE]:
${message}

[INSTRUCTIONS]: 
${this.getResponseInstructions(queryAnalysis)}`;
    
    return enhancedMessage;
  }

  // --- Format FAISS Results for Context ---
  private formatFAISSResultsForContext(faissResults: FAISSRecord[], compoundQuery: CompoundQuery): string {
    if (faissResults.length === 0) {
      return "No specific course data found in FAISS database.";
    }
    
    // Group results by course and type
    const courseGroups = new Map<string, {
      overview: FAISSRecord[],
      modules: FAISSRecord[],
      duration: FAISSRecord[],
      pricing: FAISSRecord[]
    }>();
    
    faissResults.forEach(result => {
      const courseTitle = result.metadata.title;
      if (!courseGroups.has(courseTitle)) {
        courseGroups.set(courseTitle, {
          overview: [],
          modules: [],
          duration: [],
          pricing: []
        });
      }
      
      const group = courseGroups.get(courseTitle)!;
      if (result.type === 'overview') {
        group.overview.push(result);
      } else if (result.type === 'module') {
        group.modules.push(result);
      } else if (result.type === 'duration') {
        group.duration.push(result);
      } else if (result.type === 'pricing') {
        group.pricing.push(result);
      }
    });
    
    // Format the context based on compound query requirements
    let contextParts: string[] = [];
    
    for (const [courseTitle, groups] of courseGroups) {
      let coursePart = `**${courseTitle}**:\n`;
      
      // Add overview
      if (groups.overview.length > 0) {
        coursePart += `Overview: ${groups.overview[0].text}\n`;
      }
      
      // Add modules/topics if requested or available
      if (compoundQuery.wantsTopics || groups.modules.length > 0) {
        if (groups.modules.length > 0) {
          coursePart += `Modules/Topics:\n`;
          groups.modules.forEach((module, index) => {
            coursePart += `- ${module.text}\n`;
          });
        }
      }
      
      // Add duration if requested or available
      if (compoundQuery.wantsDuration || groups.duration.length > 0) {
        if (groups.duration.length > 0) {
          coursePart += `Duration: ${groups.duration[0].text}\n`;
        }
      }
      
      // Add pricing if requested or available
      if (compoundQuery.wantsPricing || groups.pricing.length > 0) {
        if (groups.pricing.length > 0) {
          coursePart += `Pricing: ${groups.pricing[0].text}\n`;
        }
      }
      
      contextParts.push(coursePart);
    }
    
    return contextParts.join('\n');
  }

  // --- Response Instructions ---
  private getResponseInstructions(queryAnalysis: QueryAnalysis): string {
    const { isGreeting, isAllCourses, isFollowUp, compoundQuery } = queryAnalysis;
    
    if (isGreeting) {
      return "Respond with a warm, professional greeting and ask how you can help with course selection.";
    }
    
    if (isAllCourses) {
      return "Provide a comprehensive list of ALL available courses with brief descriptions. Use ONLY the course data from FAISS database. Do not include pricing information.";
    }
    
    if (compoundQuery.isCompound) {
      const requestedInfo = [];
      if (compoundQuery.wantsTopics) requestedInfo.push('detailed topics/modules');
      if (compoundQuery.wantsDuration) requestedInfo.push('exact duration');
      if (compoundQuery.wantsPricing) requestedInfo.push('pricing information');
      
      return `COMPOUND QUERY RESPONSE:
1. **Primary Focus**: Provide ${requestedInfo.join(' and ')} for ${compoundQuery.interest} course using ACTUAL course data from FAISS
2. **Course Details**: Extract real module names, topics, and course information from the provided data
3. **Structure**: Start with enthusiasm, provide requested information, mention 1-2 related courses briefly
4. **Engagement**: Ask ONE specific question about which aspect interests them most
5. **Enrollment**: End with contact information for advisors

CRITICAL: Use ONLY the real course data provided. Do NOT provide generic responses.`;
    }
    
    if (isFollowUp) {
      return `This is a follow-up question about ${this.lastDiscussedCourse}. Provide detailed information using the course data from FAISS database.`;
    }
    
    return "Analyze the user's query and provide relevant course recommendations using the FAISS database course data. Be enthusiastic and helpful.";
  }

  // --- System Prompt Generation ---
  private generateSystemPrompt(): string {
    return `# ROLE: Professional Course Advisor for BigClasses.AI

## Your Mission
You are an enthusiastic, knowledgeable course advisor helping users find the perfect course for their career goals. You work exclusively with the course data provided from our FAISS database.

## CRITICAL RULES

1. **MANDATORY DATA USAGE**: You MUST use ONLY the course data provided from the FAISS database. Never provide generic responses when real course data is available.

2. **COMPOUND QUERIES**: When users ask about a course AND want topics/duration/pricing:
   - Extract ACTUAL course modules, topics, and details from the provided data
   - Present information in a clear, structured format
   - Mention 1-2 related courses briefly
   - Ask ONE specific engagement question

3. **COURSE TOPICS**: When users ask about "topics" or "modules":
   - List ACTUAL module names and descriptions from the course data
   - Include specific topics covered in each module
   - Present in bullet points or numbered format

4. **PRICING QUERIES**: Always respond: "For accurate pricing details, please contact our advisors at +91 9666523199"

5. **ENTHUSIASM**: Show excitement about courses while being professional and informative

## RESPONSE STRUCTURE

**For Course + Topics Queries:**
🎯 **Excellent choice! [Course] is [brief excitement]**

**Course Modules & Topics:**
- **Module 1**: [Actual module name] - [Description and topics from data]
- **Module 2**: [Actual module name] - [Description and topics from data]

**Duration**: [Exact duration from data]

**Related Courses**: [Brief mention of 1-2 related courses]

**Which specific module interests you most?**

📞 **Contact our advisors at +91 9666523199 to enroll!**

## CONVERSATION MEMORY
- Track previously discussed courses
- Distinguish between new course queries and follow-ups
- Maintain context appropriately

Remember: You are a course advisor, not a generic chatbot. Use real course data and guide users toward enrollment!`;
  }

  // --- Response Generation ---
  private async generateResponse(enhancedMessage: string): Promise<string> {
    try {
      const result = await model.generateContent(enhancedMessage);
      const response = result.response;
      const responseText = response.text();
      
      // Update last discussed course if applicable
      this.updateLastDiscussedCourse(responseText);
      
      return responseText;
    } catch (error) {
      console.error(`[${this.sessionId}] Error generating response:`, error);
      return this.getErrorResponse();
    }
  }

  // --- Utility Methods ---
  private updateLastDiscussedCourse(response: string): void {
    // Extract course name from response to update context
    this.availableCourses.forEach(courseName => {
      if (response.toLowerCase().includes(courseName.toLowerCase())) {
        this.lastDiscussedCourse = courseName;
      }
    });
  }

  private updateConversationHistory(query: string, response: string): void {
    this.conversationHistory.push({
      query,
      response,
      timestamp: Date.now()
    });
    
    // Keep only last 10 conversations
    if (this.conversationHistory.length > 10) {
      this.conversationHistory = this.conversationHistory.slice(-10);
    }
  }

  private getErrorResponse(): string {
    return `I apologize, but I'm experiencing some technical difficulties right now. Please try again in a moment, or contact our support team at +91 9666523199 for immediate assistance with course information.`;
  }

  // --- Debug Methods ---
  public getDebugInfo(): any {
    return {
      sessionId: this.sessionId,
      lastDiscussedCourse: this.lastDiscussedCourse,
      availableCourses: Array.from(this.availableCourses),
      conversationHistory: this.conversationHistory.length
    };
  }
}
