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
    
    return {
      isGreeting,
      isAllCourses,
      isFollowUp,
      compoundQuery,
      detectedCourses,
      faissResults
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
            const topicResults = await faissVectorDB.search(`${compoundQuery.interest} topics modules curriculum syllabus`, 15);
            searchResults = [...searchResults, ...topicResults];
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

  // --- Enhanced Message Building ---
  private async buildEnhancedMessage(message: string, queryAnalysis: QueryAnalysis): Promise<string> {
    const { isGreeting, isAllCourses, isFollowUp, compoundQuery, detectedCourses, faissResults } = queryAnalysis;
    
    // Build context information
    let contextInfo = this.buildEnhancedCourseContext(faissResults, compoundQuery, isFollowUp);
    
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

  // --- Enhanced Course Context Formatting ---
  private buildEnhancedCourseContext(faissResults: FAISSRecord[], compoundQuery: CompoundQuery, isFollowUp: boolean = false): string {
    if (faissResults.length === 0) {
      return "No specific course data found. Our expert advisors at +91 9666523199 have comprehensive information about all our courses and can provide personalized guidance for your learning journey.";
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
          groups.modules.forEach((module, index) => {
            let moduleText = this.filterSalaryHikeData(module.text);
            coursePart += `${index + 1}. **${moduleText.split(':')[0] || `Module ${index + 1}`}**: ${moduleText.split(':').slice(1).join(':') || moduleText}\n`;
          });
          coursePart += `\n`;
        } else {
          coursePart += `📚 **Comprehensive curriculum** covers all essential topics with hands-on projects and real-world applications.\n\n`;
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
    const { isGreeting, isAllCourses, isFollowUp, compoundQuery, faissResults } = queryAnalysis;
    
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

6. **CONVERSATIONAL FLOW**: Remember previously discussed courses and maintain context

7. **MISSPELLING HANDLING**: When users misspell course names (like "dta analytrics" for "Data Analytics"):
   - Use fuzzy matching to identify the intended course
   - Provide information about the matched course
   - Ask for confirmation if needed

## RESPONSE STRUCTURE

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