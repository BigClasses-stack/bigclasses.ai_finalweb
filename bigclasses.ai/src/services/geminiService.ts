import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { faissVectorDB } from './faissVectorDatabase';

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

// --- Enhanced Fuzzy String Matching Utilities ---
const levenshteinDistance = (str1: string, str2: string): number => {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i++) {
    matrix[0][i] = i;
  }

  for (let j = 0; j <= str2.length; j++) {
    matrix[j][0] = j;
  }

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }

  return matrix[str2.length][str1.length];
};

const calculateSimilarity = (str1: string, str2: string): number => {
  const maxLength = Math.max(str1.length, str2.length);
  if (maxLength === 0) return 1;
  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
  return (maxLength - distance) / maxLength;
};

// --- Enhanced Fuzzy Course Matching ---
const findBestCourseMatch = (query: string, availableCourses: Set<string>): { course: string; similarity: number } | null => {
  let bestMatch: string | null = null;
  let bestSimilarity = 0;
  const threshold = 0.6; // Minimum similarity threshold

  for (const course of availableCourses) {
    const similarity = calculateSimilarity(query, course);
    if (similarity > bestSimilarity && similarity >= threshold) {
      bestMatch = course;
      bestSimilarity = similarity;
    }
    
    // Also check individual words in the course name
    const courseWords = course.toLowerCase().split(' ');
    const queryWords = query.toLowerCase().split(' ');
    
    for (const queryWord of queryWords) {
      for (const courseWord of courseWords) {
        if (queryWord.length > 2 && courseWord.length > 2) {
          const wordSimilarity = calculateSimilarity(queryWord, courseWord);
          if (wordSimilarity > bestSimilarity && wordSimilarity >= threshold) {
            bestMatch = course;
            bestSimilarity = wordSimilarity;
          }
        }
      }
    }
  }
  
  return bestMatch ? { course: bestMatch, similarity: bestSimilarity } : null;
};

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
  courseId: string;
  text: string;
  type: 'overview' | 'duration' | 'pricing' | 'module';
  metadata: {
    title: string;
    duration?: string;
    package?: string;
    type?: string;
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
  specificInfoRequest?: SpecificInfoRequest; // New field to detect specific info requests
}

// --- Specific Information Request Interface ---
interface SpecificInfoRequest {
  type: 'duration' | 'topics' | 'price' | null;
  courseName: string | null;
}

export class GeminiChatService {
  private sessionId: string;
  private lastDiscussedCourse: string | null = null;
  private conversationHistory: Array<{ query: string; response: string; timestamp: number }> = [];
  private availableCourses: Set<string> = new Set();
  private isInitialized: boolean = false;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
    console.log(`[${this.sessionId}] GeminiChatService initialized`);
  }

  // --- Async Initialization ---
  private async ensureInitialized(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      console.log(`[${this.sessionId}] Initializing FAISS database...`);
      await faissVectorDB.initialize();
      
      // Load available courses from FAISS database
      await this.loadAvailableCoursesFromFAISS();
      
      this.isInitialized = true;
      console.log(`[${this.sessionId}] Initialization complete. Loaded ${this.availableCourses.size} courses.`);
    } catch (error) {
      console.error(`[${this.sessionId}] Error during initialization:`, error);
      // Set fallback courses if FAISS fails
      this.setFallbackCourses();
    }
  }

  // --- Load Available Courses from FAISS ---
  private async loadAvailableCoursesFromFAISS(): Promise<void> {
    try {
      // Try multiple search strategies to get all available courses
      const searchStrategies = [
        "course overview",
        "course",
        "programming",
        "learning",
        "ai",
        "data",
        ""
      ];
      
      const allCourses = new Set<string>();
      
      for (const strategy of searchStrategies) {
        try {
          const results = await faissVectorDB.search(strategy, 50);
          results.forEach(result => {
            if (result.metadata?.title && result.metadata.title !== 'Unknown Course') {
              allCourses.add(result.metadata.title);
            }
          });
        } catch (error) {
          console.warn(`[${this.sessionId}] Search strategy "${strategy}" failed:`, error);
        }
      }
      
      this.availableCourses = allCourses;
      console.log(`[${this.sessionId}] Loaded courses from FAISS: ${Array.from(allCourses).join(', ')}`);
      
      // If still no courses found, use fallback
      if (this.availableCourses.size === 0) {
        this.setFallbackCourses();
      }
    } catch (error) {
      console.error(`[${this.sessionId}] Error loading courses from FAISS:`, error);
      this.setFallbackCourses();
    }
  }

  // --- Enhanced Fallback Courses ---
  private setFallbackCourses(): void {
    console.log(`[${this.sessionId}] Setting fallback courses due to FAISS failure`);
    this.availableCourses = new Set([
      'Python Programming',
      'Machine Learning',
      'Deep Learning',
      'Natural Language Processing',
      'Generative AI',
      'LangChain',
      'LangGraph',
      'MLOps',
      'LLMOps',
      'AI Agents',
      'AI Ethics',
      'Data Analytics'
    ]);
  }

  // --- Enhanced Course Description with Compelling Content ---
  private getCourseDescription(courseName: string): string {
    const descriptions: Record<string, string> = {
      'Python Programming': 'Master Python from fundamentals to advanced concepts! Build real-world applications, automate tasks, and develop powerful programming skills that open doors to countless career opportunities in tech, data science, and beyond.',
      'Machine Learning': 'Dive into the exciting world of ML algorithms! Learn data preprocessing, model training, evaluation techniques, and predictive analytics. Transform raw data into intelligent insights and build systems that learn and adapt.',
      'Deep Learning': 'Explore the cutting-edge of AI with neural networks, CNNs, RNNs, and transformer architectures! Create intelligent systems that can see, understand, and make decisions like never before.',
      'Natural Language Processing': 'Unlock the power of human language with AI! Work with text data, build language models, perform sentiment analysis, and create applications that understand and generate human-like text.',
      'Generative AI': 'Shape the future with generative models! Build and deploy GPT-style systems, diffusion models, and creative AI applications that can generate text, images, and innovative solutions.',
      'LangChain': 'Build next-generation LLM-powered applications! Master the LangChain framework, create intelligent agents, and integrate large language models into real-world applications seamlessly.',
      'LangGraph': 'Master complex AI workflows and intelligent agent systems! Use LangGraph to create sophisticated, multi-step AI applications that can reason, plan, and execute complex tasks autonomously.',
      'MLOps': 'Bridge the gap between ML development and production! Learn to deploy, monitor, and manage machine learning models at scale in enterprise environments with industry best practices.',
      'LLMOps': 'Specialize in the operational side of Large Language Models! Master deployment, scaling, monitoring, and lifecycle management of LLM systems in production environments.',
      'AI Agents': 'Create the future of autonomous AI! Build intelligent agents and multi-agent systems that can collaborate, reason, and solve complex problems independently across various domains.',
      'AI Ethics': 'Lead responsible AI development! Understand ethical AI practices, bias mitigation, fairness in algorithms, and build AI systems that benefit society while minimizing harm.',
      'Data Analytics': 'Turn data into actionable business insights! Master Excel, SQL, PowerBI, and Python for data analysis. Learn visualization techniques that drive informed decision-making and business growth.'
    };
    
    return descriptions[courseName] || 'Comprehensive, industry-focused curriculum designed with hands-on projects, real-world applications, and expert mentorship to accelerate your career growth!';
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
      // Ensure proper initialization
      await this.ensureInitialized();

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

  // --- Enhanced Query Analysis ---
  private async analyzeQuery(message: string): Promise<QueryAnalysis> {
    const cleanMessage = message.toLowerCase();
    
    // Detect query types
    const isGreeting = this.isSimpleGreeting(cleanMessage);
    const isAllCourses = this.isAllCoursesQuery(cleanMessage);
    const isFollowUp = this.isFollowUpQuestion(cleanMessage);
    const compoundQuery = this.detectCompoundQuery(message);
    
    // Get course data from FAISS database with proper error handling
    const faissResults = await this.searchFAISSDatabase(message, compoundQuery);
    const detectedCourses = this.extractCourseNamesFromResults(faissResults);
    
    // Detect if this is a specific information request
    const specificInfoRequest = this.detectSpecificInfoRequest(message, detectedCourses);
    
    console.log(`[${this.sessionId}] Query analysis: greeting=${isGreeting}, allCourses=${isAllCourses}, followUp=${isFollowUp}, specificInfo=${specificInfoRequest ? specificInfoRequest.type : 'none'}`);
    
    return {
      isGreeting,
      isAllCourses,
      isFollowUp,
      compoundQuery,
      detectedCourses,
      faissResults,
      specificInfoRequest
    };
  }

  // --- Enhanced FAISS Database Search ---
  private async searchFAISSDatabase(message: string, compoundQuery: CompoundQuery): Promise<FAISSRecord[]> {
    try {
      console.log(`[${this.sessionId}] Searching FAISS database for: "${message}"`);
      
      let searchResults: any[] = [];
      
      if (compoundQuery.isCompound && compoundQuery.interest) {
        // For compound queries, search specifically for the course and related information
        const primaryResults = await faissVectorDB.search(compoundQuery.interest, 20);
        searchResults = [...primaryResults];
        
        // Add specific searches based on what user wants
        if (compoundQuery.wantsTopics) {
          try {
            // Enhanced topics search - increased limit and more topic-related terms
            const topicResults = await faissVectorDB.search(`${compoundQuery.interest} topics modules curriculum syllabus lessons content`, 25);
            
            // Add another search with different keywords to increase coverage
            const additionalTopicResults = await faissVectorDB.search(`${compoundQuery.interest} course content lessons chapters what you will learn`, 20);
            
            // Combine all results
            searchResults = [...searchResults, ...topicResults, ...additionalTopicResults];
          } catch (error) {
            console.warn(`[${this.sessionId}] Topic search failed:`, error);
          }
        }
        
        if (compoundQuery.wantsDuration) {
          try {
            const durationResults = await faissVectorDB.search(`${compoundQuery.interest} duration weeks months time`, 10);
            searchResults = [...searchResults, ...durationResults];
          } catch (error) {
            console.warn(`[${this.sessionId}] Duration search failed:`, error);
          }
        }
        
        if (compoundQuery.wantsPricing) {
          try {
            const pricingResults = await faissVectorDB.search(`${compoundQuery.interest} price cost fee pricing`, 10);
            searchResults = [...searchResults, ...pricingResults];
          } catch (error) {
            console.warn(`[${this.sessionId}] Pricing search failed:`, error);
          }
        }
      } else {
        // For regular queries, use enhanced search with fuzzy matching
        const directResults = await faissVectorDB.search(message, 20);
        searchResults = [...directResults];
        
        // If no results found, try fuzzy matching
        if (searchResults.length === 0) {
          const fuzzyMatch = findBestCourseMatch(message, this.availableCourses);
          if (fuzzyMatch) {
            console.log(`[${this.sessionId}] Fuzzy match found: "${message}" -> "${fuzzyMatch.course}" (similarity: ${fuzzyMatch.similarity})`);
            const fuzzyResults = await faissVectorDB.search(fuzzyMatch.course, 15);
            searchResults = [...fuzzyResults];
          }
        }
      }
      
      // Convert to our internal format
      const faissResults: FAISSRecord[] = searchResults.map(result => ({
        id: result.id || 'unknown',
        courseId: result.courseId || result.metadata?.courseId || 'unknown',
        text: result.text || result.content || '',
        type: result.metadata?.type || 'overview',
        metadata: {
          title: result.metadata?.title || 'Unknown Course',
          duration: result.metadata?.duration,
          package: result.metadata?.package,
          type: result.metadata?.type
        }
      }));
      
      console.log(`[${this.sessionId}] Found ${faissResults.length} results from FAISS database`);
      return faissResults;
    } catch (error) {
      console.error(`[${this.sessionId}] Error searching FAISS database:`, error);
      return this.getFallbackResults(message, compoundQuery);
    }
  }

  // --- Enhanced Fallback Results ---
  private getFallbackResults(message: string, compoundQuery: CompoundQuery): FAISSRecord[] {
    console.log(`[${this.sessionId}] Providing fallback results for: "${message}"`);
    
    const fallbackResults: FAISSRecord[] = [];
    
    // Try fuzzy matching first
    const fuzzyMatch = findBestCourseMatch(message, this.availableCourses);
    if (fuzzyMatch) {
      console.log(`[${this.sessionId}] Fuzzy match in fallback: "${message}" -> "${fuzzyMatch.course}"`);
      fallbackResults.push({
        id: 'fuzzy_match',
        courseId: '1',
        text: this.getCourseDescription(fuzzyMatch.course),
        type: 'overview',
        metadata: {
          title: fuzzyMatch.course,
          duration: 'Contact advisors for details',
          package: 'Contact advisors for details'
        }
      });
    } else {
      // If no fuzzy match, provide all courses for "all courses" type queries
      Array.from(this.availableCourses).forEach((course, index) => {
        fallbackResults.push({
          id: `course_${index}`,
          courseId: `${index + 1}`,
          text: this.getCourseDescription(course),
          type: 'overview',
          metadata: {
            title: course,
            duration: 'Contact advisors for details',
            package: 'Contact advisors for details'
          }
        });
      });
    }
    
    return fallbackResults;
  }

  // --- Extract Course Names from FAISS Results ---
  private extractCourseNamesFromResults(faissResults: FAISSRecord[]): string[] {
    const courseNames = new Set<string>();
    faissResults.forEach(result => {
      if (result.metadata?.title && result.metadata.title !== 'Unknown Course') {
        courseNames.add(result.metadata.title);
      }
    });
    return Array.from(courseNames);
  }

  // --- Enhanced Compound Query Detection ---
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
      'learn in it', 'study in it', 'covered in it', 'course content',
      'course structure', 'course outline', 'learning objectives', 'course goals',
      'what you learn', 'what you study', 'what you will learn', 'what you will study',
      'course details', 'course breakdown', 'course overview', 'course summary',
      'lessons', 'chapters', 'sections', 'units', 'what is taught', 'what is included',
      'coverage', 'training content', 'learning content', 'study material'
    ];
    
    // Enhanced keyword detection for duration
    const durationKeywords = [
      'duration', 'how long', 'time', 'weeks', 'months', 'days', 'hours',
      'timeline', 'schedule', 'length', 'time frame', 'time period',
      'how much time', 'time needed', 'time required', 'completion time',
      'duration of it', 'how long is it', 'time for it', 'length of it',
      'how many weeks', 'how many months', 'course duration',
      'study time', 'learning time', 'time commitment', 'time investment',
      'course length', 'how long does it take', 'when can i complete',
      'completion period', 'study duration', 'training duration', 'course timeline',
      'timeframe', 'span', 'period', 'takes to complete'
    ];
    
    // Enhanced keyword detection for pricing
    const pricingKeywords = [
      'price', 'cost', 'fee', 'pricing', 'how much', 'money', 'payment',
      'fees', 'costs', 'charges', 'amount', 'price of it', 'cost of it',
      'fee for it', 'how much does it cost', 'what is the price',
      'course fee', 'course cost', 'course price', 'enrollment fee',
      'tuition', 'pricing details', 'cost details', 'fee structure',
      'affordable', 'expensive', 'budget', 'investment', 'value',
      'what does it cost', 'how much to pay', 'payment options',
      'registration fee', 'course charges', 'training cost'
    ];
    
    const wantsTopics = topicKeywords.some(keyword => cleanMessage.includes(keyword));
    const wantsDuration = durationKeywords.some(keyword => cleanMessage.includes(keyword));
    const wantsPricing = pricingKeywords.some(keyword => cleanMessage.includes(keyword));
    
    // Enhanced course interest detection with fuzzy matching
    let primaryInterest = this.extractPrimaryInterestDynamically(cleanMessage);
    
    // If no exact match found, try fuzzy matching
    if (!primaryInterest) {
      const fuzzyMatch = findBestCourseMatch(cleanMessage, this.availableCourses);
      if (fuzzyMatch) {
        primaryInterest = fuzzyMatch.course;
        console.log(`[${this.sessionId}] Fuzzy match in compound query: "${cleanMessage}" -> "${fuzzyMatch.course}"`);
      }
    }
    
    // Detect "I am skilled in X and want to learn Y" pattern
    const skillToLearnPattern = this.detectSkillToLearnPattern(cleanMessage);
    if (skillToLearnPattern && skillToLearnPattern.targetSkill) {
      primaryInterest = skillToLearnPattern.targetSkill;
    }
    
    // If no course detected but we have a last discussed course and this looks like a follow-up
    if (!primaryInterest && this.lastDiscussedCourse && (wantsTopics || wantsDuration || wantsPricing)) {
      primaryInterest = this.lastDiscussedCourse;
    }
    
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

  // --- Enhanced Dynamic Course Interest Extraction ---
  private extractPrimaryInterestDynamically(message: string): string | null {
    const cleanMessage = message.toLowerCase();
    
    // Create comprehensive dynamic mappings from available courses
    const courseMapping = new Map<string, string>();
    
    // Add available courses with their variations
    this.availableCourses.forEach(courseTitle => {
      const lowerTitle = courseTitle.toLowerCase();
      
      // Add exact course title
      courseMapping.set(lowerTitle, courseTitle);
      
      // Add individual words from course title
      const words = lowerTitle.split(' ').filter(word => word.length > 2);
      words.forEach(word => {
        courseMapping.set(word, courseTitle);
      });
      
      // Add comprehensive abbreviations and variations
      if (lowerTitle.includes('python')) {
        courseMapping.set('python', courseTitle);
        courseMapping.set('py', courseTitle);
        courseMapping.set('python programming', courseTitle);
        courseMapping.set('python course', courseTitle);
      }
      if (lowerTitle.includes('machine learning')) {
        courseMapping.set('ml', courseTitle);
        courseMapping.set('machine learning', courseTitle);
        courseMapping.set('machine-learning', courseTitle);
        courseMapping.set('machinelearning', courseTitle);
      }
      if (lowerTitle.includes('deep learning')) {
        courseMapping.set('deep learning', courseTitle);
        courseMapping.set('deeplearning', courseTitle);
        courseMapping.set('deep-learning', courseTitle);
        courseMapping.set('dl', courseTitle);
        courseMapping.set('neural networks', courseTitle);
        courseMapping.set('neural', courseTitle);
      }
      if (lowerTitle.includes('natural language')) {
        courseMapping.set('nlp', courseTitle);
        courseMapping.set('natural language processing', courseTitle);
        courseMapping.set('natural language', courseTitle);
        courseMapping.set('language processing', courseTitle);
      }
      if (lowerTitle.includes('generative')) {
        courseMapping.set('gen ai', courseTitle);
        courseMapping.set('generative ai', courseTitle);
        courseMapping.set('generative artificial intelligence', courseTitle);
        courseMapping.set('generative', courseTitle);
        courseMapping.set('genai', courseTitle);
      }
      if (lowerTitle.includes('langchain')) {
        courseMapping.set('langchain', courseTitle);
        courseMapping.set('lang chain', courseTitle);
        courseMapping.set('lang-chain', courseTitle);
      }
      if (lowerTitle.includes('langgraph')) {
        courseMapping.set('langgraph', courseTitle);
        courseMapping.set('lang graph', courseTitle);
        courseMapping.set('lang-graph', courseTitle);
      }
      if (lowerTitle.includes('mlops')) {
        courseMapping.set('mlops', courseTitle);
        courseMapping.set('ml ops', courseTitle);
        courseMapping.set('ml-ops', courseTitle);
        courseMapping.set('mlops', courseTitle);
      }
      if (lowerTitle.includes('llmops')) {
        courseMapping.set('llmops', courseTitle);
        courseMapping.set('llm ops', courseTitle);
        courseMapping.set('llm-ops', courseTitle);
      }
      if (lowerTitle.includes('ai agents')) {
        courseMapping.set('ai agents', courseTitle);
        courseMapping.set('agents', courseTitle);
        courseMapping.set('ai agent', courseTitle);
      }
      if (lowerTitle.includes('ai ethics')) {
        courseMapping.set('ai ethics', courseTitle);
        courseMapping.set('ethics', courseTitle);
        courseMapping.set('ai ethic', courseTitle);
      }
      if (lowerTitle.includes('data analytics')) {
        courseMapping.set('data analytics', courseTitle);
        courseMapping.set('data analysis', courseTitle);
        courseMapping.set('analytics', courseTitle);
        courseMapping.set('data analytic', courseTitle);
        courseMapping.set('dta analytics', courseTitle); // Common misspelling
        courseMapping.set('data analytrics', courseTitle); // Common misspelling
        courseMapping.set('dataanalytics', courseTitle);
      }
    });
    
    // Find the best match (prioritize longer matches)
    let bestMatch: string | null = null;
    let bestMatchLength = 0;
    
    for (const [keyword, courseTitle] of courseMapping) {
      if (cleanMessage.includes(keyword) && keyword.length > bestMatchLength) {
        bestMatch = courseTitle;
        bestMatchLength = keyword.length;
      }
    }
    
    if (bestMatch) {
      console.log(`[${this.sessionId}] Matched course: ${bestMatch}`);
      return bestMatch;
    }
    
    return null;
  }

  // --- Detect "I am skilled in X and want to learn Y" Pattern ---
  private detectSkillToLearnPattern(message: string): { currentSkill: string | null, targetSkill: string | null } | null {
    const cleanMessage = message.toLowerCase();
    
    // Patterns that indicate "I know X and want to learn Y"
    const skillToLearnPatterns = [
      /i am skilled in (.+?) and want to learn (.+)/,
      /i know (.+?) and want to learn (.+)/,
      /i have experience in (.+?) and want to learn (.+)/,
      /i am experienced in (.+?) and want to learn (.+)/,
      /i work with (.+?) and want to learn (.+)/,
      /i use (.+?) and want to learn (.+)/,
      /i am proficient in (.+?) and want to learn (.+)/,
      /i specialize in (.+?) and want to learn (.+)/,
      /i am good at (.+?) and want to learn (.+)/,
      /i am familiar with (.+?) and want to learn (.+)/,
      /i know (.+?) but want to learn (.+)/,
      /i have (.+?) skills and want to learn (.+)/,
      /i am a (.+?) and want to learn (.+)/,
      /i come from (.+?) and want to learn (.+)/,
      /i have background in (.+?) and want to learn (.+)/,
      /coming from (.+?) and want to learn (.+)/,
      /i am skilled in (.+?) and looking to learn (.+)/,
      /i know (.+?) and looking to learn (.+)/,
      /i have experience in (.+?) and looking to learn (.+)/,
      /i work with (.+?) and looking to learn (.+)/,
      /i am skilled in (.+?) and interested in learning (.+)/,
      /i know (.+?) and interested in learning (.+)/,
      /i have (.+?) experience and want to learn (.+)/,
      /i am from (.+?) background and want to learn (.+)/
    ];
    
    for (const pattern of skillToLearnPatterns) {
      const match = cleanMessage.match(pattern);
      if (match) {
        const currentSkill = match[1]?.trim();
        const targetSkill = match[2]?.trim();
        
        if (currentSkill && targetSkill) {
          // Try to match the target skill to an available course
          const matchedCourse = this.extractPrimaryInterestDynamically(targetSkill);
          
          console.log(`[${this.sessionId}] Skill-to-learn pattern detected: "${currentSkill}" -> "${targetSkill}" (matched: ${matchedCourse})`);
          
          return {
            currentSkill,
            targetSkill: matchedCourse || targetSkill
          };
        }
      }
    }
    
    return null;
  }

  // --- Enhanced Query Type Detection ---
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
      'show me courses', 'tell me about courses', 'what training', 'course options',
      'what are the course', 'course are required', 'courses required', 'courses provided',
      'what courses provided', 'institute courses', 'available training', 'training options'
    ];
    
    return allCoursesPatterns.some(pattern => message.includes(pattern));
  }

  private isFollowUpQuestion(message: string): boolean {
    // Only consider it a follow-up if there's a previous course AND no new course mentioned
    if (!this.lastDiscussedCourse) return false;
    
    const hasNewCourseReference = this.extractPrimaryInterestDynamically(message) !== null;
    if (hasNewCourseReference) return false;
    
    const followUpPatterns = [
      'tell me more', 'more details', 'more info', 'elaborate', 'explain',
      'how about', 'what about', 'duration', 'topics', 'modules', 'price',
      'cost', 'fee', 'schedule', 'timing', 'when', 'where', 'how',
      'topics in it', 'modules in it', 'what is in it', 'what are in it'
    ];
    
    return followUpPatterns.some(pattern => message.includes(pattern));
  }

  // --- Method to detect specific info requests ---
  private detectSpecificInfoRequest(query: string, detectedCourses: string[]): SpecificInfoRequest | null {
    const normalizedQuery = query.toLowerCase();
    
    // Enhanced pattern detection for specific queries
    const durationPatterns = [
      // Direct questions
      /what is the duration (for|of) (the )?(.+?)( course)?[\?]?/i,
      /how long (is|does) (the )?(.+?)( course|take)?[\?]?/i,
      // Time-related questions
      /(duration|time|length|how long|hours|weeks|months) .{0,20}(for|of|in) .{0,10}([a-z\s]+?)( course)?[\?\.]?$/i,
      // Simple forms with course name
      /(.+?) (course )?(duration|how long|time frame|length)[\?]?/i,
    ];
    
    const topicsPatterns = [
      // Direct questions
      /what (are the|is the|are|is) (topics|curriculum|syllabus|subject|modules) (for|of|in) (the )?(.+?)( course)?[\?]?/i,
      /what (will|do) (i|you) (learn|teach|cover) in (the )?(.+?)( course)?[\?]?/i,
      // Topics-related questions
      /(topics|modules|curriculum|syllabus) .{0,20}(for|of|in) .{0,10}([a-z\s]+?)( course)?[\?\.]?$/i,
      // Simple forms with course name
      /(.+?) (course )?(topics|curriculum|syllabus|content)[\?]?/i,
      /what.{0,20}(learn|topics|teach).{0,20}(.+?)[\?]?/i
    ];
    
    const pricePatterns = [
      // Direct questions
      /what is the (price|cost|fee) (for|of) (the )?(.+?)( course)?[\?]?/i,
      /how much (does|is) (the )?(.+?)( course)? cost[\?]?/i,
      // Price-related questions
      /(price|cost|fee|how much|payment) .{0,20}(for|of) .{0,10}([a-z\s]+?)( course)?[\?\.]?$/i,
      // Simple forms with course name
      /(.+?) (course )?(price|cost|fee|pricing)[\?]?/i,
    ];
    
    // Initialize result variables
    let infoType: 'duration' | 'topics' | 'price' | null = null;
    let courseName: string | null = null;
    
    // Try to match each pattern and extract course name
    for (const pattern of durationPatterns) {
      const match = normalizedQuery.match(pattern);
      if (match) {
        infoType = 'duration';
        // Extract course name from the appropriate capture group based on pattern
        for (const group of match.slice(1)) {
          if (group && group.length > 3 && !/^(course|duration|the|for|of|in|is|does|take|how long|time)$/i.test(group)) {
            courseName = group.trim();
            break;
          }
        }
        break;
      }
    }
    
    if (!infoType) {
      for (const pattern of topicsPatterns) {
        const match = normalizedQuery.match(pattern);
        if (match) {
          infoType = 'topics';
          // Extract course name from the appropriate capture group
          for (const group of match.slice(1)) {
            if (group && group.length > 3 && !/^(course|topics|curriculum|the|for|of|in|is|are|syllabus|subject|modules|will|do|i|you|learn|teach|cover|what)$/i.test(group)) {
              courseName = group.trim();
              break;
            }
          }
          break;
        }
      }
    }
    
    if (!infoType) {
      for (const pattern of pricePatterns) {
        const match = normalizedQuery.match(pattern);
        if (match) {
          infoType = 'price';
          // Extract course name from the appropriate capture group
          for (const group of match.slice(1)) {
            if (group && group.length > 3 && !/^(course|price|cost|fee|the|for|of|in|is|does|how much|payment)$/i.test(group)) {
              courseName = group.trim();
              break;
            }
          }
          break;
        }
      }
    }
    
    // Fallback to simple keyword detection if regex didn't match
    if (!infoType) {
      // Check for duration-related keywords
      if (normalizedQuery.includes('duration') || 
          normalizedQuery.includes('how long') || 
          normalizedQuery.includes('time') || 
          normalizedQuery.includes('hours') || 
          normalizedQuery.includes('weeks')) {
        infoType = 'duration';
      }
      // Check for topics-related keywords
      else if (normalizedQuery.includes('topics') || 
               normalizedQuery.includes('subject') || 
               normalizedQuery.includes('curriculum') || 
               normalizedQuery.includes('syllabus') || 
               normalizedQuery.includes('what will i learn') ||
               normalizedQuery.includes('what do you teach')) {
        infoType = 'topics';
      }
      // Check for price-related keywords
      else if (normalizedQuery.includes('price') || 
               normalizedQuery.includes('cost') || 
               normalizedQuery.includes('fee') || 
               normalizedQuery.includes('how much') || 
               normalizedQuery.includes('payment')) {
        infoType = 'price';
      }
    }
    
    // If we have an info type but no course name, use the detected courses
    if (infoType && !courseName && detectedCourses.length > 0) {
      courseName = detectedCourses[0];
    }
    
    // If we have an info type and course name, try to verify/correct the course name
    if (infoType && courseName) {
      // Try fuzzy matching to find the actual course
      const fuzzyMatch = findBestCourseMatch(courseName, this.availableCourses);
      if (fuzzyMatch) {
        courseName = fuzzyMatch.course;  // Use the properly formatted course name
      }
      
      console.log(`[${this.sessionId}] Detected specific info request: ${infoType} for "${courseName}"`);
      
      return {
        type: infoType,
        courseName: courseName
      };
    }
    
    // If we have an info type but no course name, and we have a last discussed course
    if (infoType && !courseName && this.lastDiscussedCourse) {
      console.log(`[${this.sessionId}] Using last discussed course for specific info request: ${infoType} for "${this.lastDiscussedCourse}"`);
      return {
        type: infoType,
        courseName: this.lastDiscussedCourse
      };
    }
    
    return null;
  }

  // --- Enhanced Message Building ---
  private async buildEnhancedMessage(message: string, queryAnalysis: QueryAnalysis): Promise<string> {
    const { isGreeting, isAllCourses, isFollowUp, compoundQuery, detectedCourses, faissResults, specificInfoRequest } = queryAnalysis;
    
    // Build context information
    let contextInfo = this.buildEnhancedCourseContext(faissResults, compoundQuery, isFollowUp, specificInfoRequest);
    
    // For follow-up questions, search for the previously discussed course
    if (isFollowUp && this.lastDiscussedCourse && faissResults.length < 3) {
      const followUpResults = await this.searchFAISSDatabase(this.lastDiscussedCourse, {
        interest: this.lastDiscussedCourse,
        wantsTopics: compoundQuery.wantsTopics || queryAnalysis.compoundQuery.wantsTopics,
        wantsDuration: compoundQuery.wantsDuration || queryAnalysis.compoundQuery.wantsDuration,
        wantsPricing: compoundQuery.wantsPricing || queryAnalysis.compoundQuery.wantsPricing,
        isCompound: true
      });
      contextInfo = this.buildEnhancedCourseContext(followUpResults, {
        interest: this.lastDiscussedCourse,
        wantsTopics: compoundQuery.wantsTopics || queryAnalysis.compoundQuery.wantsTopics,
        wantsDuration: compoundQuery.wantsDuration || queryAnalysis.compoundQuery.wantsDuration,
        wantsPricing: compoundQuery.wantsPricing || queryAnalysis.compoundQuery.wantsPricing,
        isCompound: true
      }, true);
    }
    
    // For all courses query, ALWAYS provide ALL available courses
    if (isAllCourses) {
      const allCoursesResults: FAISSRecord[] = Array.from(this.availableCourses).map((course, index) => ({
        id: `course_${index}`,
        courseId: `${index + 1}`,
        text: this.getCourseDescription(course),
        type: 'overview' as const,
        metadata: {
          title: course,
          duration: 'Flexible timeline - contact advisors for details',
          package: 'Multiple learning options available'
        }
      }));
      contextInfo = this.buildEnhancedCourseContext(allCoursesResults, compoundQuery);
    }
    
    // Build conversation context
    const conversationContext = [
      `CONVERSATION STATE: ${this.lastDiscussedCourse ? `Previously discussed ${this.lastDiscussedCourse} - maintain continuity` : 'New conversation - be welcoming'}`,
      `AVAILABLE COURSES: ${Array.from(this.availableCourses).join(', ')}`,
      isFollowUp ? `[FOLLOW-UP CONTEXT]: User is asking follow-up questions about ${this.lastDiscussedCourse}. Show deeper knowledge and build on previous discussion.` : '',
      isAllCourses ? `[ALL COURSES REQUEST]: User wants complete course overview. Present ALL ${this.availableCourses.size} courses enthusiastically with compelling descriptions.` : '',
      compoundQuery.isCompound ? `[DETAILED COURSE QUERY]: User wants ${compoundQuery.wantsTopics ? 'comprehensive topics/modules breakdown ' : ''}${compoundQuery.wantsDuration ? 'detailed duration and time commitment info ' : ''}${compoundQuery.wantsPricing ? 'pricing guidance ' : ''}for ${compoundQuery.interest}. Provide complete course details with enthusiasm.` : '',
      detectedCourses.length > 0 ? `[DETECTED INTEREST]: User mentioned: ${detectedCourses.join(', ')}. Focus on these courses with detailed information.` : '',
      faissResults.length === 0 ? `[COURSE NOT AVAILABLE]: Requested course not in catalog. Use fuzzy matching to find similar courses or apologize professionally.` : '',
      specificInfoRequest ? `[SPECIFIC INFO REQUEST]: User is asking specifically about the ${specificInfoRequest.type} for ${specificInfoRequest.courseName}. Provide a concise answer focusing only on this information.` : '',
      `[CONVERSATION GOAL]: Maintain enthusiastic, professional tone. Help user understand course value and make informed decisions. Keep conversation flowing naturally.`
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

  // --- Extract Specific Course Information ---
  private extractSpecificCourseInfo(faissResults: FAISSRecord[], specificInfoRequest: SpecificInfoRequest): string {
    if (!specificInfoRequest || !specificInfoRequest.type || !specificInfoRequest.courseName) {
      return "";
    }
    
    const courseName = specificInfoRequest.courseName;
    const infoType = specificInfoRequest.type;
    
    console.log(`[${this.sessionId}] Extracting ${infoType} information for ${courseName}`);
    
    // Filter results for the requested course
    const courseResults = faissResults.filter(result => 
      result.metadata.title.toLowerCase() === courseName.toLowerCase());
    
    if (courseResults.length === 0) {
      // Fallback for when no results are found for the course
      return this.getGenericCourseInfo(courseName, infoType);
    }
    
    // Extract specific information based on request type
    switch (infoType) {
      case 'duration':
        // Find duration-specific records first
        const durationRecords = courseResults.filter(result => result.type === 'duration');
        if (durationRecords.length > 0) {
          return this.filterSalaryHikeData(durationRecords[0].text);
        }
        // If no duration records, look for duration in metadata
        for (const result of courseResults) {
          if (result.metadata.duration) {
            return result.metadata.duration;
          }
        }
        return this.getGenericCourseInfo(courseName, 'duration');
      
      case 'topics':
        // Enhanced topic extraction - collects all available module topics
        
        // First, find all module-specific records
        const moduleRecords = courseResults.filter(result => result.type === 'module');
        
        // If we have module records, format them as a comprehensive list
        if (moduleRecords.length > 0) {
          console.log(`[${this.sessionId}] Found ${moduleRecords.length} modules for ${courseName}`);
          
          // Process all modules into a comprehensive, numbered list
          const formattedModules = moduleRecords.map((module, index) => {
            // Clean the module text
            const cleanText = this.filterSalaryHikeData(module.text);
            
            // Extract module title and description if it has a format like "Title: Description"
            const parts = cleanText.split(':');
            const moduleTitle = parts[0].trim();
            const moduleDescription = parts.length > 1 ? parts.slice(1).join(':').trim() : '';
            
            // Return a nicely formatted module entry
            return `${index + 1}. **${moduleTitle}**${moduleDescription ? ': ' + moduleDescription : ''}`;
          }).join('\n');
          
          // Add an introduction to the module list
          return `The ${courseName} course includes the following ${moduleRecords.length} topics/modules:\n\n${formattedModules}`;
        }
        
        // If no specific module records but we have overview records that might contain topic info
        const overviewRecords = courseResults.filter(result => result.type === 'overview');
        if (overviewRecords.length > 0) {
          // Try to extract topic information from the overview
          const overviewText = this.filterSalaryHikeData(overviewRecords[0].text);
          
          // Check if the overview mentions topics or curriculum
          if (overviewText.toLowerCase().includes('topics') || 
              overviewText.toLowerCase().includes('curriculum') || 
              overviewText.toLowerCase().includes('module') || 
              overviewText.toLowerCase().includes('syllabus')) {
            return `Topics for ${courseName}:\n\n${overviewText}`;
          }
          
          return `The ${courseName} course curriculum includes: ${overviewText}`;
        }
        
        // If no specific information found, use generic info
        return this.getGenericCourseInfo(courseName, 'topics');
      
      case 'price':
        // Find pricing-specific records
        const pricingRecords = courseResults.filter(result => result.type === 'pricing');
        if (pricingRecords.length > 0) {
          return this.filterSalaryHikeData(pricingRecords[0].text);
        }
        // If no pricing records, look for package in metadata
        for (const result of courseResults) {
          if (result.metadata.package) {
            return result.metadata.package;
          }
        }
        return "For detailed pricing information and flexible payment options, our advisors at +91 9666523199 will help you find the perfect plan that fits your budget.";
    }
    
    return "";
  }

  // --- Generic Course Information ---
  private getGenericCourseInfo(courseName: string, infoType: 'duration' | 'topics' | 'price'): string {
    switch (infoType) {
      case 'duration':
        return "The course is designed with a flexible schedule to accommodate your learning pace. Typically, it can be completed in 8-12 weeks with dedicated study time of 5-10 hours per week. For your specific situation, our advisors can create a personalized learning timeline.";
      
      case 'topics':
        // Enhanced topic information with more structured and detailed fallback content
        const genericTopics = this.getGenericTopicsForCourse(courseName);
        return `The ${courseName} curriculum covers fundamental to advanced concepts with hands-on projects, real-world applications, and industry-relevant skills. The curriculum is regularly updated to include the latest industry practices and technologies.\n\n${genericTopics}`;
      
      case 'price':
        return "For detailed pricing information and flexible payment options, our advisors at +91 9666523199 will help you find the perfect plan that fits your budget.";
    }
  }
  
  // --- Generate Generic Topics Based on Course Name ---
  private getGenericTopicsForCourse(courseName: string): string {
    const lowerCourseName = courseName.toLowerCase();
    
    // Predefined generic topics for common courses
    if (lowerCourseName.includes('python')) {
      return "Common topics include:\n\n1. **Python Fundamentals**: Variables, data types, operators, and basic syntax\n2. **Control Flow**: Conditional statements, loops, and exception handling\n3. **Data Structures**: Lists, tuples, dictionaries, and sets\n4. **Functions**: Defining functions, parameters, and return values\n5. **Object-Oriented Programming**: Classes, objects, inheritance, and polymorphism\n6. **File Handling**: Reading and writing files, working with directories\n7. **Modules and Packages**: Creating and importing modules, using standard libraries\n8. **Advanced Python Concepts**: Decorators, generators, and context managers\n9. **Working with External Libraries**: NumPy, Pandas, Matplotlib\n10. **Python for Data Analysis**: Data manipulation, visualization, and basic analysis\n11. **Web Development with Python**: Introduction to Flask or Django\n12. **Practical Projects**: Hands-on applications of Python in real-world scenarios";
    }
    
    if (lowerCourseName.includes('machine learning')) {
      return "Common topics include:\n\n1. **Fundamentals of Machine Learning**: Core concepts, terminology, and workflow\n2. **Data Preprocessing**: Cleaning, transformation, normalization, and feature engineering\n3. **Regression Algorithms**: Linear regression, polynomial regression, regularization techniques\n4. **Classification Algorithms**: Logistic regression, decision trees, random forests, SVM\n5. **Clustering**: K-means, hierarchical clustering, DBSCAN\n6. **Dimensionality Reduction**: PCA, t-SNE, feature selection methods\n7. **Ensemble Methods**: Bagging, boosting, stacking, and voting classifiers\n8. **Model Evaluation**: Cross-validation, metrics, and performance evaluation\n9. **Hyperparameter Tuning**: Grid search, random search, and Bayesian optimization\n10. **Feature Engineering**: Creating and selecting features for optimal model performance\n11. **Working with Scikit-learn**: Implementation of ML algorithms using Python\n12. **Real-world Applications**: Practical projects and case studies";
    }
    
    if (lowerCourseName.includes('deep learning')) {
      return "Common topics include:\n\n1. **Neural Network Fundamentals**: Neurons, activation functions, and backpropagation\n2. **Deep Neural Networks**: Multi-layer perceptrons and deep architectures\n3. **Optimization Techniques**: Gradient descent variants, learning rate strategies\n4. **Convolutional Neural Networks (CNNs)**: Architecture, filters, pooling layers\n5. **Image Classification and Object Detection**: Working with visual data\n6. **Recurrent Neural Networks (RNNs)**: Sequence modeling, LSTM, and GRU\n7. **Natural Language Processing with Deep Learning**: Word embeddings, text classification\n8. **Transformers**: Attention mechanisms, BERT, GPT models\n9. **Generative Models**: Autoencoders, VAEs, and GANs\n10. **Transfer Learning**: Using pre-trained models and fine-tuning\n11. **Deep Learning Frameworks**: TensorFlow and PyTorch implementation\n12. **Deployment of Deep Learning Models**: Serving models in production environments";
    }
    
    if (lowerCourseName.includes('data analytics')) {
      return "Common topics include:\n\n1. **Introduction to Data Analytics**: Core concepts and analytics workflow\n2. **Statistical Analysis**: Descriptive and inferential statistics\n3. **Data Collection and Preparation**: Sources, cleaning, and transformation\n4. **Data Visualization**: Principles, tools, and best practices\n5. **Exploratory Data Analysis**: Techniques for understanding data patterns\n6. **SQL for Data Analysis**: Database queries and data extraction\n7. **Excel for Data Analysis**: Advanced functions, pivot tables, and dashboards\n8. **Python/R for Analytics**: Using programming languages for data manipulation\n9. **Business Intelligence Tools**: Power BI, Tableau implementation\n10. **Dashboard Creation**: Designing effective analytics dashboards\n11. **Storytelling with Data**: Communicating insights effectively\n12. **Practical Analytics Projects**: Real-world business applications";
    }
    
    if (lowerCourseName.includes('natural language processing') || lowerCourseName.includes('nlp')) {
      return "Common topics include:\n\n1. **NLP Fundamentals**: Text processing, tokenization, and normalization\n2. **Text Representation**: Bag of words, TF-IDF, word embeddings\n3. **Language Modeling**: N-grams and statistical language models\n4. **Part-of-Speech Tagging**: Grammatical tagging and chunking\n5. **Named Entity Recognition**: Identifying entities in text\n6. **Sentiment Analysis**: Determining sentiment in text data\n7. **Topic Modeling**: LDA, NMF for discovering topics in documents\n8. **Word Embeddings**: Word2Vec, GloVe, and contextual embeddings\n9. **Sequence Models for NLP**: RNNs, LSTMs for text processing\n10. **Transformers**: BERT, GPT, and modern NLP architectures\n11. **Machine Translation**: Neural machine translation approaches\n12. **Question Answering Systems**: Building systems that answer questions from text";
    }
    
    if (lowerCourseName.includes('generative ai')) {
      return "Common topics include:\n\n1. **Fundamentals of Generative AI**: Core concepts and applications\n2. **Generative Models Overview**: Types and architectures\n3. **Language Models**: GPT, LLaMA, and other foundation models\n4. **Diffusion Models**: Image generation with DALL-E, Stable Diffusion\n5. **Prompt Engineering**: Crafting effective prompts for generative AI\n6. **Fine-tuning Large Language Models**: Methods and best practices\n7. **Multimodal AI**: Systems that work with text, images, and audio\n8. **Generative AI Ethics**: Addressing bias, safety, and responsible use\n9. **Retrieval-Augmented Generation**: Enhancing outputs with external knowledge\n10. **Building AI Agents**: Creating autonomous systems with generative AI\n11. **Evaluation of Generative AI**: Metrics and assessment techniques\n12. **Practical Applications**: Implementation in various business contexts";
    }
    
    if (lowerCourseName.includes('langchain')) {
      return "Common topics include:\n\n1. **Introduction to LangChain**: Framework fundamentals and components\n2. **LLM Integration**: Connecting to various language models\n3. **Prompt Templates**: Creating and managing prompts\n4. **Chains**: Building sequential processing workflows\n5. **Memory Systems**: Adding context and history to conversations\n6. **Document Loading**: Working with different file formats\n7. **Text Splitting and Chunking**: Preprocessing for vector stores\n8. **Vector Stores and Embeddings**: Setting up semantic search\n9. **Retrieval Systems**: Building RAG (Retrieval Augmented Generation)\n10. **Tools and Agents**: Creating systems that can use tools\n11. **LangChain Expression Language**: Advanced workflow construction\n12. **Building Applications**: End-to-end applications with LangChain";
    }
    
    if (lowerCourseName.includes('langgraph')) {
      return "Common topics include:\n\n1. **LangGraph Fundamentals**: Core concepts and architecture\n2. **Graph-based Workflows**: Creating nodes and edges for AI processes\n3. **State Management**: Handling complex state in AI applications\n4. **Agent Networks**: Building multi-agent systems\n5. **Cyclic Processing**: Creating feedback loops in AI workflows\n6. **Conversation Management**: Advanced dialogue systems\n7. **Integration with LangChain**: Using LangGraph with LangChain components\n8. **Decision-making Frameworks**: Creating agents that can reason\n9. **Event-based Systems**: Trigger-based workflow execution\n10. **Custom Node Development**: Building specialized components\n11. **Debugging and Visualizing Graphs**: Monitoring and optimizing workflows\n12. **Advanced Applications**: Multi-step reasoning and planning systems";
    }
    
    // Default generic topics for other courses
    return "The curriculum typically includes comprehensive coverage of fundamental concepts, practical applications, and advanced techniques relevant to this field. Contact our advisors for the detailed module breakdown tailored to your learning goals.";
  }

  // --- Enhanced Course Context Formatting ---
  private buildEnhancedCourseContext(faissResults: FAISSRecord[], compoundQuery: CompoundQuery, isFollowUp: boolean = false, specificInfoRequest?: SpecificInfoRequest): string {
    if (faissResults.length === 0) {
      return "No specific course data found. Our expert advisors at +91 9666523199 have comprehensive information about all our courses and can provide personalized guidance for your learning journey.";
    }
    
    // Handle specific information request if present
    if (specificInfoRequest) {
      const specificInfo = this.extractSpecificCourseInfo(faissResults, specificInfoRequest);
      if (specificInfo) {
        return `SPECIFIC INFORMATION REQUEST RESULT:
Information Type: ${specificInfoRequest.type}
Course: ${specificInfoRequest.courseName}
Data: ${specificInfo}`;
      }
    }
    
    // Group results by course for better organization
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
      switch (result.type) {
        case 'overview':
          group.overview.push(result);
          break;
        case 'module':
          group.modules.push(result);
          break;
        case 'duration':
          group.duration.push(result);
          break;
        case 'pricing':
          group.pricing.push(result);
          break;
        default:
          group.overview.push(result);
      }
    });
    
    let contextParts: string[] = [];
    
    for (const [courseTitle, groups] of courseGroups) {
      let coursePart = `**${courseTitle} - Complete Information**:\n`;
      
      // Add engaging course description
      coursePart += `🎯 **Course Overview**: ${this.getCourseDescription(courseTitle)}\n\n`;
      
      // Add detailed overview from FAISS data
      if (groups.overview.length > 0) {
        let overviewText = this.filterSalaryHikeData(groups.overview[0].text);
        coursePart += `📋 **What You'll Learn**: ${overviewText}\n\n`;
      }
      
      // Add comprehensive modules/topics
      if (compoundQuery.wantsTopics || groups.modules.length > 0 || isFollowUp) {
        if (groups.modules.length > 0) {
          coursePart += `🔥 **Complete Module Breakdown**:\n`;
          
          // Sort modules to ensure consistent ordering if possible
          const sortedModules = [...groups.modules].sort((a, b) => {
            // Try to extract module numbers if they exist (like "Module 1", "Chapter 2", etc.)
            const aMatch = a.text.match(/^(module|chapter|section|unit|part|lesson)\s*(\d+)/i);
            const bMatch = b.text.match(/^(module|chapter|section|unit|part|lesson)\s*(\d+)/i);
            
            if (aMatch && bMatch) {
              return parseInt(aMatch[2]) - parseInt(bMatch[2]);
            }
            
            return 0; // Keep original order if no pattern found
          });
          
          // Process all modules
          sortedModules.forEach((module, index) => {
            let moduleText = this.filterSalaryHikeData(module.text);
            
            // Improve formatting - detect if it has a "Title: Description" pattern
            const titleMatch = moduleText.match(/^(.+?):\s*(.+)$/);
            if (titleMatch) {
              // Format with proper title and description
              coursePart += `${index + 1}. **${titleMatch[1].trim()}**: ${titleMatch[2].trim()}\n`;
            } else {
              // If no clear title-description pattern, just use as-is
              coursePart += `${index + 1}. **${moduleText.trim()}**\n`;
            }
          });
          
          coursePart += `\n`;
        } else {
          // If no specific modules, use our generic topics function to provide meaningful content
          coursePart += `📚 **Complete Curriculum Breakdown**:\n${this.getGenericTopicsForCourse(courseTitle)}\n\n`;
        }
      }
      
      // Add duration information
      if (compoundQuery.wantsDuration || groups.duration.length > 0 || isFollowUp) {
        if (groups.duration.length > 0) {
          let durationText = this.filterSalaryHikeData(groups.duration[0].text);
          coursePart += `⏱️ **Duration & Time Commitment**: ${durationText}\n\n`;
        } else {
          coursePart += `⏱️ **Flexible learning schedule** designed to fit your lifestyle - contact advisors for detailed timeline.\n\n`;
        }
      }
      
      // Add pricing guidance
      if (compoundQuery.wantsPricing || groups.pricing.length > 0) {
        coursePart += `💰 **Investment in Your Future**: For detailed pricing information and flexible payment options, our advisors at +91 9666523199 will help you find the perfect plan that fits your budget.\n\n`;
      }
      
      contextParts.push(coursePart);
    }
    
    return contextParts.join('\n');
  }

  // --- Filter Salary/Hike Data ---
  private filterSalaryHikeData(text: string): string {
    // Remove salary, hike, and career transition related data
    const filteredText = text
      .replace(/\$\d+,?\d*\s*(salary|increase|hike)?/gi, '')
      .replace(/\d+%\s*hike/gi, '')
      .replace(/\d+\+?\s*(successful\s*)?(career\s*)?(transitions?|placements?)/gi, '')
      .replace(/salary\s*increase/gi, '')
      .replace(/career\s*transitions?/gi, '')
      .replace(/placement\s*record/gi, '')
      .replace(/job\s*opportunities/gi, '')
      .replace(/\.\s*\.\s*\./g, '') // Remove multiple dots
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();
    
    return filteredText;
  }

  // --- Enhanced Response Instructions ---
  private getResponseInstructions(queryAnalysis: QueryAnalysis): string {
    const { isGreeting, isAllCourses, isFollowUp, compoundQuery, faissResults, specificInfoRequest } = queryAnalysis;
    
    // Handle specific information requests
    if (specificInfoRequest) {
      const infoTypeMap = {
        'duration': 'duration and time commitment',
        'topics': 'curriculum topics and modules',
        'price': 'pricing and payment options'
      };
      
      // Special instructions for topics to ensure we show ALL topics
      if (specificInfoRequest.type === 'topics') {
        return `CURRICULUM TOPICS RESPONSE:
1. **COMPREHENSIVE LISTING**: Respond with ALL the topics/modules for ${specificInfoRequest.courseName}
2. **COMPLETE FORMAT**: Show the FULL list of topics, not just a sample or summary
3. **NUMBERED LIST**: Present topics in a clear, numbered format (1., 2., 3., etc.)
4. **INCLUDE DESCRIPTIONS**: Include brief descriptions of topics when available
5. **FORMATTING**: Use bold formatting for topic names to improve readability
6. **INTRODUCTION**: Start with "The ${specificInfoRequest.courseName} curriculum includes the following topics/modules:"

CRITICAL: This is a topics request - show ALL modules/topics in the curriculum. Don't abbreviate or truncate the list.`;
      }
      
      // Default handling for other types of specific information requests
      return `SPECIFIC INFORMATION RESPONSE:
1. **DIRECT ANSWER**: Respond ONLY with the requested ${infoTypeMap[specificInfoRequest.type]} for ${specificInfoRequest.courseName}
2. **CONCISE FORMAT**: Keep the response short and focused only on the specific information requested
3. **NO ADDITIONAL INFO**: Do not include other course details unless directly relevant to the question
4. **INFORMATION GAPS**: If exact information is not available, provide a generic but helpful response about ${specificInfoRequest.type}
5. **STRUCTURE**: Start directly with "The ${infoTypeMap[specificInfoRequest.type]} for ${specificInfoRequest.courseName} is..."

CRITICAL: This is a targeted information request. Keep the response brief and focused only on the ${specificInfoRequest.type}.`;
    }
    
    if (isGreeting) {
      return "Respond with a warm, professional greeting and ask how you can help with course selection.";
    }
    
    if (isAllCourses) {
      return `ALL COURSES LISTING RESPONSE:
1. **MANDATORY**: List ALL ${this.availableCourses.size} available courses: ${Array.from(this.availableCourses).join(', ')}
2. **Format**: Present each course with its compelling description
3. **Structure**: Use numbered list (1., 2., 3., etc.) for clarity
4. **Engagement**: Ask which course interests them most
5. **Contact**: End with advisor contact information
6. **NO PRICING**: Do not include pricing information
7. **ENTHUSIASM**: Show excitement about the breadth of learning opportunities

CRITICAL: Show ALL available courses, not just a subset. Use the course descriptions provided.`;
    }
    
    if (compoundQuery.isCompound) {
      const requestedInfo = [];
      if (compoundQuery.wantsTopics) requestedInfo.push('ALL detailed topics/modules with comprehensive descriptions');
      if (compoundQuery.wantsDuration) requestedInfo.push('exact duration and time commitment');
      if (compoundQuery.wantsPricing) requestedInfo.push('pricing information');
      
      return `COMPOUND QUERY RESPONSE - ENTHUSIASTIC & PROFESSIONAL:
1. **ENTHUSIASTIC OPENING**: Start with excitement about their interest in ${compoundQuery.interest}
2. **COMPLETE COURSE OVERVIEW**: Provide comprehensive course information
3. **DETAILED INFORMATION**: Provide ${requestedInfo.join(' and ')} with ALL available modules/topics
4. **PRICING HANDLING**: For pricing queries, respond: "For detailed pricing information and flexible payment options, our advisors at +91 9666523199 will help you find the perfect plan for your budget."
5. **NO SALARY/HIKE DATA**: Remove all salary, career transition, or hike statistics
6. **ENGAGEMENT**: Ask which specific aspect excites them most
7. **PROFESSIONAL STRUCTURE**: Use clear headings and organized information

CRITICAL: Use ONLY the real course data provided. Show ALL available modules/topics with detailed descriptions.`;
    }
    
    if (isFollowUp) {
      return `FOLLOW-UP CONVERSATION RESPONSE:
1. **ACKNOWLEDGE CONTINUITY**: Reference the previous discussion about ${this.lastDiscussedCourse}
2. **PROVIDE COMPREHENSIVE DETAILS**: Show ALL available modules/topics with rich descriptions
3. **MAINTAIN ENTHUSIASM**: Keep the energy high and positive
4. **NO SALARY DATA**: Remove any salary/hike related information
5. **ADVISOR CONTACT**: End with warm invitation to contact advisors

CRITICAL: Use the course data provided to give comprehensive information while maintaining conversational flow.`;
    }
    
    // Check if no course was found or fuzzy match needed
    if (faissResults.length === 0 && compoundQuery.interest && !this.availableCourses.has(compoundQuery.interest)) {
      // Try fuzzy matching
      const fuzzyMatch = findBestCourseMatch(compoundQuery.interest, this.availableCourses);
      if (fuzzyMatch) {
        return `FUZZY MATCH RESPONSE:
1. **ACKNOWLEDGE QUERY**: Acknowledge their interest in "${compoundQuery.interest}"
2. **SUGGEST SIMILAR COURSE**: "Did you mean ${fuzzyMatch.course}? (similarity: ${Math.round(fuzzyMatch.similarity * 100)}%)"
3. **PROVIDE COURSE DETAILS**: Give comprehensive information about the matched course
4. **ENGAGEMENT**: Ask if this is what they were looking for
5. **CONTACT INFO**: End with advisor contact information

CRITICAL: Use fuzzy matching to help users find the right course even with misspellings.`;
      } else {
        return `COURSE NOT FOUND RESPONSE:
1. **APOLOGIZE**: Say sorry that the requested course is not available
2. **CONTACT ADVISORS**: Direct user to contact advisors at +91 9666523199
3. **NO COURSE LISTING**: Do not list available courses unless specifically asked
4. **BE PROFESSIONAL**: Keep response short and helpful

CRITICAL: Only apologize and direct to advisors.`;
      }
    }
    
    return "Analyze the user's query and provide relevant course recommendations using the course data. Be enthusiastic and helpful. Remove any salary/hike related information.";
  }

  // --- Enhanced System Prompt ---
  private generateSystemPrompt(): string {
    return `# ROLE: Professional Course Advisor for BigClasses.AI

## Your Mission
You are an enthusiastic, knowledgeable course advisor helping users find the perfect course for their career goals. You work exclusively with the course data provided and available courses.

## CRITICAL RULES

1. **MANDATORY DATA USAGE**: You MUST use ONLY the course data provided.

2. **NO SALARY/HIKE DATA**: NEVER include salary increases, percentage hikes, or career transition statistics.

3. **FUZZY MATCHING**: When users misspell course names, use fuzzy matching to find similar courses and suggest corrections.

4. **ALL COURSES QUERIES**: When users ask "what courses are available" or similar:
   - List ALL ${this.availableCourses.size} available courses: ${Array.from(this.availableCourses).join(', ')}
   - Use clear numbering (1., 2., 3., etc.)
   - Include compelling descriptions for each course
   - Show enthusiasm about the breadth of learning opportunities

5. **COMPOUND QUERIES**: When users ask about a course AND want topics/duration/pricing:
   - Show ALL available modules/topics with descriptions
   - For pricing: Always respond "For detailed pricing information, please contact our advisors at +91 9666523199"

6. **SPECIFIC INFO REQUESTS**: When users ask only for specific information (duration, topics, or price):
   - Provide ONLY the requested information in a targeted response
   - For topics/curriculum requests, list ALL topics in the course, not just a summary
   - For duration or price, provide a brief, direct answer
   - Do not include other course details or promotional content
   - Start with a direct answer to their specific question

7. **CONVERSATIONAL FLOW**: Remember previously discussed courses and maintain context

8. **MISSPELLING HANDLING**: When users misspell course names (like "dta analytrics" for "Data Analytics"):
   - Use fuzzy matching to identify the intended course
   - Provide information about the matched course
   - Ask for confirmation if needed

## RESPONSE STRUCTURE

**For Specific Information Requests about Duration/Price:**
The [duration/price] for [Course Name] is:

[Only the specific information requested, presented concisely]

**For Topic/Curriculum Requests:**
The [Course Name] curriculum includes the following topics/modules:

1. **[Module 1]**: [Description]
2. **[Module 2]**: [Description]
3. **[Module 3]**: [Description]
[Include ALL modules, no abbreviation]

**For All Courses Listing:**
Hello there! Welcome to BigClasses.AI! We have a fantastic range of courses designed to boost your career.

Here are our available courses:

1. **[Course 1]** - [Compelling description]
2. **[Course 2]** - [Compelling description]
3. **[Course 3]** - [Compelling description]
[Continue for ALL courses...]

Which course interests you most? Contact our advisors at +91 9666523199 for detailed information and enrollment.

**For Misspelled Course Names:**
🎯 **I think you're asking about [Corrected Course Name]!** 

[Provide complete course information with enthusiasm]

**For Course + Topics Queries:**
🎯 **Fantastic choice! [Course] is an incredible opportunity!**

**📚 Complete Course Information:**
- **Course Name:** [Course Name]
- **Duration:** [Duration from data]

**🔥 What You'll Master - Complete Module Breakdown:**
1. **[Module 1]** - [Detailed description]
2. **[Module 2]** - [Detailed description]
[Continue for all modules...]

**Ready to advance your skills? Contact our advisors at +91 9666523199!**

## CONVERSATION MEMORY
- Track previously discussed courses
- For follow-up questions, refer to the last discussed course
- Maintain enthusiastic, professional tone

## CONTENT FILTERING
- Remove ALL salary, hike, and career transition statistics
- Focus on course content and educational value

Remember: You are focused on education and helping users find the right course. Be professional, helpful, and enthusiastic!`;
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
    const responseText = response.toLowerCase();
    
    // Find the most mentioned course in the response
    let bestMatch = '';
    let maxMentions = 0;
    
    this.availableCourses.forEach(courseName => {
      const courseNameLower = courseName.toLowerCase();
      const mentions = (responseText.match(new RegExp(courseNameLower, 'g')) || []).length;
      
      if (mentions > maxMentions) {
        maxMentions = mentions;
        bestMatch = courseName;
      }
    });
    
    if (bestMatch && maxMentions > 0) {
      this.lastDiscussedCourse = bestMatch;
      console.log(`[${this.sessionId}] Updated conversation context: now discussing ${bestMatch}`);
    }
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
      conversationHistory: this.conversationHistory.length,
      isInitialized: this.isInitialized
    };
  }
}