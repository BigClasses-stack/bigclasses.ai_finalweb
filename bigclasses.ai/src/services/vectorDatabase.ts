import { GoogleGenerativeAI } from "@google/generative-ai";
import courseDataJson from './Courses.json'; // line 5

// --- Interface Definitions (Unchanged) ---
export interface CourseData {
  id: number;
  title: string;
  package: string;
  hike: string;
  transitions: string;
  image: string;
  highlights: string[];
  features: string[];
  modules: Array<{
    name: string;
    description: string;
    topics: string[];
    project?: string;
  }>;
}

interface VectorRecord {
  id: string;
  courseId: number;
  content: string;
  embedding: number[];
  type: 'overview' | 'module';
  metadata: {
    courseTitle: string;
    section?: string;
    moduleIndex?: number;
  };
}

// The class is now private to this module. We will export an instance of it.
class VectorDatabase {
  private records: VectorRecord[] = [];
  private genAI: GoogleGenerativeAI;
  private isInitialized = false; // The flag to prevent re-initialization

  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    if (!apiKey) {
      console.error("API key is missing in VectorDatabase constructor.");
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    console.log("VectorDatabase instance created. Ready to be initialized.");
  }

  /**
   * Initializes the database by creating embeddings for all courses.
   * This is an expensive, one-time operation that should be called at application startup.
   */
  public async initialize(): Promise<void> {
    // CHANGE 2: The most important change for performance.
    // This guard prevents the expensive initialization from running more than once.
    if (this.isInitialized) {
      console.log("Vector database is already initialized. Skipping.");
      return;
    }

    console.log("Initializing vector database for the first time... This may take a moment.");
    
    try {
      const courseData = this.getCourseData();
      
      // Process all courses. This loop populates the `this.records` array.
      for (const course of courseData) {
        await this.indexCourse(course);
      }
      
      this.isInitialized = true;
      console.log(`✅ Vector database initialized successfully with ${this.records.length} records.`);

    } catch (error) {
      console.error("FATAL: Failed to initialize VectorDatabase:", error);
      throw error; // Throw error to halt startup if DB initialization fails.
    }
  }

  /**
   * Creates a text embedding using the Google Generative AI model.
   */
  private async createEmbedding(text: string): Promise<number[]> {
    try {
      const model = this.genAI.getGenerativeModel({ model: "text-embedding-004" });
      const result = await model.embedContent(text);
      return result.embedding.values;
    } catch (error) {
      console.error(`Error creating embedding for text snippet: "${text.substring(0, 50)}..."`, error);
      return []; // Return an empty array on failure to prevent adding bad data.
    }
  }

  /**
   * CHANGE 3: Optimized indexing process.
   * Chunks a course into meaningful pieces, and creates embeddings in parallel.
   */
  private async indexCourse(course: CourseData): Promise<void> {
    const chunks: { type: VectorRecord['type'], content: string, metadata: VectorRecord['metadata'] }[] = [];

    // Create a comprehensive "overview" chunk for general queries.
    const overviewText = `Course Title: ${course.title}. Key Highlights: ${course.highlights.join('. ')}. Course Features: ${course.features.join('. ')}`;
    chunks.push({
      type: 'overview',
      content: overviewText,
      metadata: { courseTitle: course.title }
    });

    // Create a separate chunk for each module, as they are detailed.
    course.modules.forEach((module, i) => {
      const moduleText = `In the ${course.title} course, the module named "${module.name}" covers: ${module.description}. Specific topics include: ${module.topics.join(', ')}. The project for this module is: ${module.project || 'Not specified'}.`;
      chunks.push({
        type: 'module',
        content: moduleText,
        metadata: { courseTitle: course.title, section: module.name, moduleIndex: i }
      });
    });

    // Generate all embeddings for this course's chunks in parallel for speed.
    const embeddings = await Promise.all(chunks.map(chunk => this.createEmbedding(chunk.content)));

    // Add the records to our in-memory database.
    chunks.forEach((chunk, i) => {
      const embedding = embeddings[i];
      if (embedding && embedding.length > 0) { // Only add if embedding was successful
        this.records.push({
          id: `course_${course.id}_${chunk.type}_${i}`,
          courseId: course.id,
          content: chunk.content,
          embedding: embedding,
          type: chunk.type,
          metadata: chunk.metadata,
        });
      }
    });
  }

  /**
   * Calculates the cosine similarity between two vectors.
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length || a.length === 0) return 0;
    
    let dotProduct = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);
    
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (normA * normB);
  }

  /**
   * Searches the in-memory vector database for the most relevant content.
   * This is now extremely fast as it only does a query embedding and in-memory search.
   */
  public async search(query: string, limit: number = 3): Promise<VectorRecord[]> {
    if (!this.isInitialized) {
      console.warn("Search called before database was initialized! This will cause a delay.");
      await this.initialize();
    }

    const queryEmbedding = await this.createEmbedding(query);
    if (queryEmbedding.length === 0) return [];

    const results = this.records
      .map(record => ({ ...record, similarity: this.cosineSimilarity(queryEmbedding, record.embedding) }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
      
    console.log(`Search for "${query}" found ${results.length} relevant records.`);
    return results;
  }

  // --- Helper Methods (Unchanged logic, now use getCourseData) ---
  public getCourseById(courseId: number): CourseData | null {
    return this.getCourseData().find(course => course.id === courseId) || null;
  }

  public getAllCourses(): CourseData[] {
    return this.getCourseData();
  }

  private getCourseData(): CourseData[] {
    return courseDataJson as CourseData[];
  }
}

// Export a singleton instance
export const vectorDB = new VectorDatabase();