import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { vectorDB, type CourseData } from './vectorDatabase';

// --- API Key Initialization ---
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
console.log(
  `Gemini API key status: ${apiKey ? `Key found (${apiKey.slice(0, 4)}...)` : "No key found"}`
);

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

// CHANGE 2: Using the latest model version for optimal performance and features.
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

// --- Type Definitions (Unchanged) ---
export type ChatMessage = {
  role: 'user' | 'model';
  parts: { text: string }[];
};

export const mapRoleToType = (role: 'user' | 'model'): 'user' | 'bot' => {
  return role === 'user' ? 'user' : 'bot';
};

interface UserData {
  name?: string;
  interests?: string[];
}

export class GeminiChatService {
  private chatSession;
  private sessionId: string;
  private userData: UserData = {};
  private conversationContext: string[] = []; // Track conversation topics
  private lastDiscussedCourse: string | null = null; // Track the last course discussed

  constructor(sessionId: string) {
    this.sessionId = sessionId;

    // CHANGE 3: The VectorDatabase is no longer instantiated or initialized here.
    // We rely on the singleton instance being initialized once when the application starts.
    // This makes creating a new chat session extremely fast.

    this.chatSession = model.startChat({
      // CHANGE 4: The system instruction now uses the powerful new sales-oriented prompt.
      systemInstruction: {
        role: 'model',
        parts: [{ text: this.generateSalesAdvisorPrompt() }]
      },
      generationConfig: {
        // Tuned for faster, more creative, and engaging responses.
        temperature: 0.6,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 2048,
      },
      safetySettings,
      history: [], // Chat history is managed by the chatSession object.
    });
  }

  // User data management functionality is fully preserved.
  public setUserName(name: string): void {
    this.userData.name = name;
  }

  public addInterest(interest: string): void {
    if (!this.userData.interests) {
      this.userData.interests = [];
    }
    if (!this.userData.interests.includes(interest)) {
      this.userData.interests.push(interest);
    }
  }

  /**
   * CHANGE 5: The completely new, sales-focused, and persona-driven system prompt.
   * This defines the chatbot's expert, enthusiastic, and persuasive character.
   */
  private generateSalesAdvisorPrompt(): string {
    return `# ROLE & MISSION: Your Ultimate Career Catalyst & Course Advisor for BigClasses.AI

## Your Core Identity
You are a highly enthusiastic, professional, and persuasive AI-powered course advisor from BigClasses.AI. Your primary mission is to help users discover the perfect course for their career goals and ignite excitement about their learning journey. You are not a simple Q&A bot; you are a career transformation partner who guides users through course discovery. Your entire knowledge about courses comes *EXCLUSIVELY* from the vector database context provided with each query.

## Initial Interaction Guidelines
When users greet you with simple messages like "hi", "hello", or similar:
- Respond warmly and professionally
- Ask about their learning goals, career interests, or what skills they want to develop
- Mention that BigClasses.AI offers various courses in technology, data science, programming, and more
- Encourage them to share what field or skill they're most interested in
- DO NOT assume or directly mention specific courses unless the user has already shown interest

---

## Non-Negotiable Rules
1.  *STRICT DATA SOURCE: Your knowledge is **STRICTLY LIMITED* to the RELEVANT COURSE INFORMATION context I provide in the prompt. You *MUST NOT* invent, hallucinate, or use any external knowledge about courses. If the context doesn't contain the answer, you must say so with confidence.
2.  *NO FINANCIALS OR SALARIES: You are **STRICTLY FORBIDDEN* from discussing course prices, fees, costs, or salary information. If asked, you *MUST* respond with this exact phrase: "That's an excellent question! For the most accurate and up-to-date details on pricing and career outcomes, our dedicated human advisors are the best point of contact. You can reach them at +91 9666523199. They can also discuss potential financing options with you!"
3.  *DURATION QUERIES*: When users ask about course duration, timing, or "how long" a course takes, always provide the specific duration information from the context. Present it in a clear, engaging way that emphasizes the value of the time investment.
4.  *HANDLE UNKNOWN QUERIES*: If a user asks about a course or topic you cannot find information for in the provided context, respond with enthusiasm and guidance: "While I don't have the specifics on that topic in my database, it sounds interesting! For specialized queries like that, the best step is to chat with our expert advisors at +91 9666523199. They have the full picture of all our offerings."
5.  *INSTITUTIONAL AI*: You are the voice of BigClasses.AI. Do not use personal names for yourself. Address the user respectfully and professionally.

---

## The Conversational Sales Flow (Your Strategy)

### 1. Maintain Flawless Conversational Memory
This is ABSOLUTELY CRITICAL. You *MUST* remember the course being discussed and maintain context across the conversation. Key rules:
- When users say "it", "this course", "that program", "topics in it", "duration of it", etc., they refer to the PREVIOUSLY DISCUSSED COURSE
- NEVER ask "Which course are you referring to?" if context is available from previous conversation
- Use the [Conversation Context] section provided in each message to understand what was previously discussed
- Build upon previous responses and maintain continuity
- If a user asks follow-up questions, ALWAYS relate them to the ongoing conversation topic
- Pay special attention to [IMPORTANT] tags that indicate follow-up questions
- The conversation context overrides any new search results when the user is asking follow-up questions

### 2. The Excitement Funnel: Your Response Structure

*For General Inquiries and Interest Discovery:*
When users express general interest or ask about learning, follow this approach:
- Ask about their career goals, current background, or what they want to achieve
- Suggest exploring different fields based on their interests
- Guide them towards specific courses only after understanding their needs
- Use questions like: "What field excites you most?", "Are you looking to switch careers or advance in your current field?", "What type of projects would you love to work on?"

*For Specific Course Inquiries:*
When a user asks about a course, and you are provided with context, follow this structure to create a compelling and professional response:

*   *Step A: Acknowledge & Excite:* Start with an enthusiastic confirmation.
    *   Example: "Excellent choice! The Data Science course is one of our flagship programs for a reason. Let's dive into what makes it so transformative."

*   *Step B: The Core Value & Highlights (The "Pros"):* Use the provided context (like description, highlights, duration) to present the most exciting aspects. Always include duration when available. Use bullet points with emojis for visual appeal.
    *   Example: "This program is designed to turn you into a job-ready expert. Here’s a glimpse of what you'll master:
        *   🚀 Building predictive models with Python.
        *   📊 Mastering data visualization tools like Tableau.
        *   🤖 Working on multiple real-world industry projects."

*   *Step C: Set Expectations (The "Cons" as "Challenges"):* Frame the potential difficulties professionally as prerequisites or challenges, which adds to the course's value. Use the context to infer these.
    *   Example: "To ensure your success, it's good to know that this is an intensive program. It's perfect for individuals who are:
        *   *Committed:* Ready to dedicate consistent time to mastering new skills.
        *   *Problem-Solvers:* Excited by challenges and logical thinking.
        *   A background in basic statistics is helpful but not required, as we cover the fundamentals!"

*   *Step D: The Call to Action (Guide the Next Step):* Always end by opening the door to the next piece of information. Make it easy for them to say yes.
    *   Example: "Feeling inspired? We can explore the detailed week-by-week modules next, or I can show you the exciting capstone project you'll be building. What sounds best to you?"
---
`;
  }

  public async sendMessage(message: string): Promise<string> {
    try {
      console.log(`[${this.sessionId}] User message: "${message}"`);
      console.log(`[${this.sessionId}] Current conversation state - Last course: ${this.lastDiscussedCourse || 'None'}`);

      // Check if this is a simple greeting that doesn't need course context
      const isSimpleGreeting = this.isSimpleGreeting(message.trim().toLowerCase());
      
      // Check if this is a follow-up question referring to the previously discussed course
      const isFollowUpQuestion = this.isFollowUpQuestion(message.trim().toLowerCase());
      
      console.log(`[${this.sessionId}] Message analysis - IsGreeting: ${isSimpleGreeting}, IsFollowUp: ${isFollowUpQuestion}`);
      
      let relevantCourseInfo: any[] = [];
      
      if (isSimpleGreeting) {
        // Don't search for greetings
        relevantCourseInfo = [];
      } else if (isFollowUpQuestion && this.lastDiscussedCourse) {
        // For follow-up questions, search specifically for the last discussed course
        console.log(`[${this.sessionId}] Follow-up question detected, searching for: ${this.lastDiscussedCourse}`);
        relevantCourseInfo = await vectorDB.search(`${this.lastDiscussedCourse} ${message}`, 3);
        
        // If no results found with combined search, try searching for just the course name
        if (relevantCourseInfo.length === 0) {
          console.log(`[${this.sessionId}] No results with combined search, trying course name only: ${this.lastDiscussedCourse}`);
          relevantCourseInfo = await vectorDB.search(this.lastDiscussedCourse, 3);
        }
        
        // If still no results, get course details directly from the database
        if (relevantCourseInfo.length === 0) {
          console.log(`[${this.sessionId}] No vector search results, getting course details directly`);
          const courseDetails = await this.getCourseDetails(this.lastDiscussedCourse);
          if (courseDetails) {
            relevantCourseInfo = [{
              metadata: { courseTitle: courseDetails.title },
              content: `Title: ${courseDetails.title}\nDuration: ${courseDetails.duration}\nPackage: ${courseDetails.package}\nHighlights: ${courseDetails.highlights.join(', ')}\nFeatures: ${courseDetails.features.join(', ')}`
            }];
          }
        }
      } else {
        // Regular search for new topics
        relevantCourseInfo = await vectorDB.search(message, 3);
      }
      
      // Build the enhanced prompt that includes context but preserves conversational flow
      let enhancedMessage = message;
      
      if (relevantCourseInfo.length > 0) {
        // Extract course titles from the context to track conversation
        const courseTitle = relevantCourseInfo[0]?.metadata?.courseTitle;
        if (courseTitle && !isFollowUpQuestion) {
          // Only update the last discussed course if this isn't a follow-up question
          this.lastDiscussedCourse = courseTitle;
          // Add to conversation context if not already present
          if (!this.conversationContext.includes(courseTitle)) {
            this.conversationContext.push(courseTitle);
          }
        }

        // Build context information
        const contextInfo = relevantCourseInfo.map(
          (result) => `Course: ${result.metadata.courseTitle}\nDetails: ${result.content}`
        ).join('\n\n');

        // Create an enhanced message that includes context while preserving the original message
        enhancedMessage = `[Context for this query - Course Information Available]:
${contextInfo}

[Conversation Context]:
${this.lastDiscussedCourse ? `Currently discussing course: ${this.lastDiscussedCourse}` : 'No previous course discussed'}
${isFollowUpQuestion ? `[IMPORTANT: This is a follow-up question about ${this.lastDiscussedCourse}]` : ''}

[User's Current Message]:
${message}

[Instructions]: Use the provided context to answer the user's question. Remember our conversation history. ${isFollowUpQuestion ? `The user is asking a follow-up question about ${this.lastDiscussedCourse}. When they ask about "duration", "how long", "time", or similar questions, they are referring to ${this.lastDiscussedCourse}. Always answer about ${this.lastDiscussedCourse}, NOT about any other course that might appear in the search results. When they say "it", "this course", "that program", they are referring to ${this.lastDiscussedCourse}.` : `If the user refers to "it", "this course", "that program", etc., they are likely referring to the last discussed course: ${this.lastDiscussedCourse || 'none'}.`} Maintain the conversational flow and remember what we've discussed.`;

        console.log(`[${this.sessionId}] Context found and conversation tracking updated.`);
      } else if (this.lastDiscussedCourse && !isSimpleGreeting) {
        // Even without new context, remind the AI of the conversation state (but not for greetings)
        enhancedMessage = `[Conversation Context]: We were discussing: ${this.lastDiscussedCourse}

[User's Current Message]:
${message}

[Instructions]: The user's message relates to our ongoing conversation about ${this.lastDiscussedCourse}. ${isFollowUpQuestion ? `This appears to be a follow-up question about ${this.lastDiscussedCourse}. When they ask about "duration", "how long", "time", or similar questions, they are asking about ${this.lastDiscussedCourse} specifically.` : ''} Remember what we've discussed and maintain conversational continuity. If you need specific details about ${this.lastDiscussedCourse}, refer to your knowledge about this course.`;
        console.log(`[${this.sessionId}] No new context found, using conversation memory.`);
      } else if (isSimpleGreeting) {
        // For simple greetings, add instruction to ask about interests
        enhancedMessage = `[User's Current Message]:
${message}

[Instructions]: The user is greeting you. Respond warmly and ask about their learning goals or what field/skills they're interested in. Help them discover the right course for their needs.`;
        console.log(`[${this.sessionId}] Simple greeting detected, will ask about interests.`);
      } else {
        console.log(`[${this.sessionId}] No context found and no previous course discussed.`);
      }

      const result = await this.chatSession.sendMessage(enhancedMessage);
      const responseText = result.response.text();

      console.log(`[${this.sessionId}] Gemini response received.`);
      return responseText;

    } catch (error: any) {
      console.error('Error sending message to Gemini API:', error);
      // Improved, more user-friendly error messages.
      let errorMessage = "I'm facing a slight technical issue at the moment. Please try again in a little while. For immediate assistance, our advisors are ready to help at +91 9666523199.";
      if (!apiKey) {
        errorMessage = "The AI service is not configured correctly. Please notify support.";
      } else if (error.message?.includes('API key not valid')) {
        errorMessage = "There's an authentication issue with our AI service. Please contact our support team.";
      } else if (error.message?.includes('quota')) {
        errorMessage = "Our AI service is currently experiencing very high demand. Please try again in a few moments.";
      }
      
      return `⚠ **Technical Glitch**\n\n${errorMessage}`;
    }
  }

  // --- Helper Methods Preserved and Updated ---
  
  // Check if a message is a simple greeting
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

  // Check if a message is a follow-up question referring to the previously discussed course
  private isFollowUpQuestion(message: string): boolean {
    const followUpPhrases = [
      'topics in it', 'modules in it', 'curriculum in it', 'syllabus in it',
      'what are the topics', 'what topics', 'what modules', 'what subjects',
      'topics covered', 'modules covered', 'curriculum covered',
      'duration of it', 'how long is it', 'length of it', 'time for it',
      'duration', 'how long', 'how much time', 'time duration', 'course duration',
      'weeks', 'months', 'days', 'hours', 'timeline', 'schedule',
      'price of it', 'cost of it', 'fee for it', 'projects in it',
      'assignments in it', 'what will i learn', 'what do i learn',
      'prerequisite', 'requirements', 'eligibility',
      'about it', 'more about it', 'details about it', 'tell me more',
      'in this course', 'in that course', 'about this course', 'about that course'
    ];

    const pronouns = ['it', 'this', 'that', 'these', 'those'];
    const questionWords = ['what', 'how', 'when', 'where', 'why', 'which'];
    const durationWords = ['duration', 'long', 'time', 'weeks', 'months', 'days', 'hours'];
    
    const cleanMessage = message.toLowerCase().trim();
    
    // Check for explicit follow-up phrases
    if (followUpPhrases.some(phrase => cleanMessage.includes(phrase))) {
      return true;
    }
    
    // Special check for duration-related questions when we have a previous course
    if (this.lastDiscussedCourse && durationWords.some(word => cleanMessage.includes(word))) {
      return true;
    }
    
    // Check for questions that contain pronouns (likely referring to previous context)
    const containsPronoun = pronouns.some(pronoun => 
      cleanMessage.includes(' ' + pronoun + ' ') || 
      cleanMessage.startsWith(pronoun + ' ') || 
      cleanMessage.endsWith(' ' + pronoun)
    );
    
    const containsQuestionWord = questionWords.some(word => 
      cleanMessage.startsWith(word + ' ')
    );
    
    return containsPronoun && (containsQuestionWord || cleanMessage.includes('?'));
  }
  
  // Get current conversation context
  public getConversationContext(): { lastCourse: string | null; topics: string[] } {
    return {
      lastCourse: this.lastDiscussedCourse,
      topics: [...this.conversationContext]
    };
  }

  // Debug method to check conversation state
  public debugConversationState(): void {
    console.log(`[${this.sessionId}] DEBUG - Conversation State:`);
    console.log(`- Last discussed course: ${this.lastDiscussedCourse || 'None'}`);
    console.log(`- Conversation topics: ${this.conversationContext.join(', ') || 'None'}`);
  }

  // Check if a message is asking about duration
  private isDurationQuestion(message: string): boolean {
    const durationKeywords = ['duration', 'how long', 'time', 'weeks', 'months', 'days', 'hours', 'timeline', 'schedule'];
    const cleanMessage = message.toLowerCase().trim();
    return durationKeywords.some(keyword => cleanMessage.includes(keyword));
  }

  // Reset conversation context (useful for new topics)
  public resetConversationContext(): void {
    this.conversationContext = [];
    this.lastDiscussedCourse = null;
  }

  // Manually set the current course being discussed
  public setCurrentCourse(courseTitle: string): void {
    this.lastDiscussedCourse = courseTitle;
    if (!this.conversationContext.includes(courseTitle)) {
      this.conversationContext.push(courseTitle);
    }
  }
  
  // Helper method to get detailed course information, now using the singleton vectorDB.
  public async getCourseDetails(courseTitle: string): Promise<CourseData | null> {
    const courseId = this.getCourseIdByTitle(courseTitle);
    return typeof courseId === 'number' && courseId > 0 ? vectorDB.getCourseById(courseId) : null;
  }

  // Helper method to get course ID by title, now using the singleton vectorDB.
  private getCourseIdByTitle(title: string): number | undefined {
    const courses = vectorDB.getAllCourses();
    const course = courses.find(c => c.title.toLowerCase().includes(title.toLowerCase()));
    return course ? course.id : undefined;
  }

  // Get all available courses, now using the singleton vectorDB.
  public getAllCourses(): Array<{id: number, title: string}> {
    return vectorDB.getAllCourses();
  }
}