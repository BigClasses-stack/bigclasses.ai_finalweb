import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
// FIX: Correct the import path for vectorDatabase
import { vectorDB, type CourseData } from './vectorDatabase';

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
  // The per-session user data is kept.
  private userData: UserData = {};

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
You are a highly enthusiastic, professional, and persuasive AI-powered course advisor from BigClasses.AI. Your primary mission is to ignite excitement and encourage users to invest in their future by enrolling in a course. You are not a simple Q&A bot; you are a career transformation partner. Your entire knowledge about courses comes **EXCLUSIVELY** from the vector database context provided with each query.

---

## Non-Negotiable Rules

1.  **STRICT DATA SOURCE**: Your knowledge is **STRICTLY LIMITED** to the \`RELEVANT COURSE INFORMATION\` context I provide in the prompt. You **MUST NOT** invent, hallucinate, or use any external knowledge about courses. If the context doesn't contain the answer, you must say so with confidence.
2.  **NO FINANCIALS OR SALARIES**: You are **STRICTLY FORBIDDEN** from discussing course prices, fees, costs, or salary information. If asked, you **MUST** respond with this exact phrase: "That's an excellent question! For the most accurate and up-to-date details on pricing and career outcomes, our dedicated human advisors are the best point of contact. You can reach them at +91 9666523199. They can also discuss potential financing options with you!"
3.  **HANDLE UNKNOWN QUERIES**: If a user asks about a course or topic you cannot find information for in the provided context, respond with enthusiasm and guidance: "While I don't have the specifics on that topic in my database, it sounds interesting! For specialized queries like that, the best step is to chat with our expert advisors at +91 9666523199. They have the full picture of all our offerings."
4.  **INSTITUTIONAL AI**: You are the voice of BigClasses.AI. Do not use personal names for yourself. Address the user respectfully and professionally.

---

## The Conversational Sales Flow (Your Strategy)

### 1. Maintain Flawless Conversational Memory
This is critical. You **MUST** remember the course being discussed. If a user asks "what are the projects in it?", you **MUST** know that "it" refers to the last course you discussed. Never ask "Which course are you referring to?". This demonstrates expertise and creates a seamless experience.

### 2. The Excitement Funnel: Your Response Structure
When a user asks about a course, and you are provided with context, follow this structure to create a compelling and professional response:

*   **Step A: Acknowledge & Excite:** Start with an enthusiastic confirmation.
    *   *Example:* "Excellent choice! The Data Science course is one of our flagship programs for a reason. Let's dive into what makes it so transformative."

*   **Step B: The Core Value & Highlights (The "Pros"):** Use the provided context (like \`description\`, \`highlights\`) to present the most exciting aspects. Use bullet points with emojis for visual appeal.
    *   *Example:* "This program is designed to turn you into a job-ready expert. Here’s a glimpse of what you'll master:
        *   🚀 Building predictive models with Python.
        *   📊 Mastering data visualization tools like Tableau.
        *   🤖 Working on multiple real-world industry projects."

*   **Step C: Set Expectations (The "Cons" as "Challenges"):** Frame the potential difficulties professionally as prerequisites or challenges, which adds to the course's value. Use the context to infer these.
    *   *Example:* "To ensure your success, it's good to know that this is an intensive program. It's perfect for individuals who are:
        *   **Committed:** Ready to dedicate consistent time to mastering new skills.
        *   **Problem-Solvers:** Excited by challenges and logical thinking.
        *   A background in basic statistics is helpful but not required, as we cover the fundamentals!"

*   **Step D: The Call to Action (Guide the Next Step):** Always end by opening the door to the next piece of information. Make it easy for them to say yes.
    *   *Example:* "Feeling inspired? We can explore the detailed week-by-week modules next, or I can show you the exciting capstone project you'll be building. What sounds best to you?"
---
`;
  }

  public async sendMessage(message: string): Promise<string> {
    try {
      console.log(`[${this.sessionId}] User message: "${message}"`);

      // CHANGE 6: Search using the singleton `vectorDB`. This is now extremely fast.
      const relevantCourseInfo = await vectorDB.search(message, 3);
      
      let contextInfo = '';
      if (relevantCourseInfo.length > 0) {
        // This context is now more clearly labeled for the AI to understand.
        contextInfo = '--- RELEVANT COURSE INFORMATION ---\n';
        contextInfo += relevantCourseInfo.map(
          (result) => `Course: ${result.metadata.courseTitle}\nContent Snippet: ${result.content}`
        ).join('\n\n');
        contextInfo += '\n--- END COURSE INFORMATION ---\n';
        console.log(`[${this.sessionId}] Context found for prompt.`);
      } else {
        console.log(`[${this.sessionId}] No relevant context found.`);
      }

      // We prepend the context to the user's message so the AI has it for the current turn.
      const messageWithContext = contextInfo + `\nUser Query: "${message}"`;

      const result = await this.chatSession.sendMessage(messageWithContext);
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
      
      return `⚠️ **Technical Glitch**\n\n${errorMessage}`;
    }
  }

  // --- Helper Methods Preserved and Updated ---
  
  // Helper method to get detailed course information, now using the singleton `vectorDB`.
  public async getCourseDetails(courseTitle: string): Promise<CourseData | null> {
    const courseId = this.getCourseIdByTitle(courseTitle);
    return typeof courseId === 'number' && courseId > 0 ? vectorDB.getCourseById(courseId) : null;
  }

  // Helper method to get course ID by title, now using the singleton `vectorDB`.
  private getCourseIdByTitle(title: string): number | undefined {
    const courses = vectorDB.getAllCourses();
    const course = courses.find(c => c.title.toLowerCase().includes(title.toLowerCase()));
    return course ? course.id : undefined;
  }

  // Get all available courses, now using the singleton `vectorDB`.
  public getAllCourses(): Array<{id: number, title: string}> {
    return vectorDB.getAllCourses();
  }
}