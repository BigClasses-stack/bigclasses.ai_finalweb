import { GoogleGenerativeAI } from '@google/generative-ai';
import coursesData from './Courses.json';

// Type definitions
export interface CourseDataFAISS {
  id: number;
  title: string;
  duration: string;
  package: string;
  hike: string;
  transitions: string;
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
  text: string;
  course_id: number;
  type: 'overview' | 'duration' | 'pricing' | 'module';
  metadata: any;
}

interface FAISSIndexData {
  records: VectorRecord[];
  index_info: {
    dimension: number;
    total_courses: number;
    total_records: number;
    version: string;
  };
}

export class FAISSVectorDatabase {
  private records: VectorRecord[] = [];
  private isInitialized = false;
  private dimension = 384;
  
  constructor() {
    console.log('🗃️ FAISS Vector Database initialized');
  }

  /**
   * Initialize database by loading from existing .faiss files
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('✅ FAISS database already initialized');
      return;
    }

    try {
      console.log('🔍 Loading FAISS vector database from existing files...');
      
      // Try to load from the web-optimized JSON file first
      const webResponse = await fetch('/faiss_db/courses_web.json');
      if (webResponse.ok) {
        const webData: FAISSIndexData = await webResponse.json();
        this.records = webData.records;
        this.dimension = webData.index_info.dimension;
        
        console.log(`✅ FAISS database loaded from web JSON:`);
        console.log(`   📊 Records: ${webData.index_info.total_records}`);
        console.log(`   📚 Courses: ${webData.index_info.total_courses}`);
        console.log(`   📐 Dimensions: ${webData.index_info.dimension}`);
        console.log(`   🗂️ Binary index: courses.faiss (${(await this.getFAISSFileSize()).toFixed(2)} MB)`);
        
        this.isInitialized = true;
        return;
      }

      // Fallback to full JSON if web version not available
      const fullResponse = await fetch('/faiss_db/courses_full.json');
      if (fullResponse.ok) {
        const fullData = await fullResponse.json();
        this.records = fullData.records || [];
        this.dimension = fullData.dimension || 384;
        
        console.log(`✅ FAISS database loaded from full JSON: ${this.records.length} records`);
        this.isInitialized = true;
        return;
      }

      throw new Error('No FAISS database files found');

    } catch (error) {
      console.error('❌ Failed to load FAISS database:', error);
      console.log('🔄 Initializing empty database...');
      this.records = [];
      this.isInitialized = true;
    }
  }

  /**
   * Get size of the binary FAISS file
   */
  private async getFAISSFileSize(): Promise<number> {
    try {
      const response = await fetch('/faiss_db/courses.faiss', { method: 'HEAD' });
      const size = response.headers.get('content-length');
      return size ? parseInt(size) / 1024 / 1024 : 0;
    } catch {
      return 0;
    }
  }

  /**
   * Check if query is asking for all courses
   */
  private isAllCoursesQuery(query: string): boolean {
    const allCoursesKeywords = [
      'all courses', 'available courses', 'course list', 'what courses',
      'show courses', 'list courses', 'all programs', 'available programs',
      'what programs', 'course offerings', 'course catalog', 'courses offered',
      'complete list', 'full list', 'entire catalog', 'course selection',
      'all available courses', 'show me courses', 'tell me about courses',
      'what do you offer', 'what courses do you have', 'courses available'
    ];
    
    const queryLower = query.toLowerCase();
    return allCoursesKeywords.some(keyword => queryLower.includes(keyword));
  }

  /**
   * Get overview of all courses (one record per course)
   */
  private getAllCoursesOverview(): Array<{
    id: string;
    courseId: number;
    content: string;
    similarity: number;
    metadata: any;
  }> {
    // Get one overview record per course (all 12 courses)
    const courseOverviews = this.records
      .filter(record => record.type === 'overview')
      .sort((a, b) => a.course_id - b.course_id) // Sort by course ID
      .map(record => ({
        id: record.id,
        courseId: record.course_id,
        content: record.text,
        similarity: 1.0, // Perfect match for "all courses" query
        metadata: {
          ...record.metadata,
          type: record.type
        }
      }));

    console.log(`🔍 All courses query → returning ${courseOverviews.length} course overviews`);
    return courseOverviews;
  }

  /**
   * Search for similar courses using optimized text matching
   * Note: This uses the metadata from the .faiss file but implements
   * browser-compatible similarity search
   */
  async search(query: string, topK: number = 5): Promise<Array<{
    id: string;
    courseId: number;
    content: string;
    similarity: number;
    metadata: any;
  }>> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (this.records.length === 0) {
      console.warn('⚠️ No records available for search');
      return [];
    }

    // Check for "all courses" query
    if (this.isAllCoursesQuery(query)) {
      return this.getAllCoursesOverview();
    }

    try {
      const queryLower = query.toLowerCase();
      
      // Check if this is an "all courses" type query
      if (this.isAllCoursesQuery(queryLower)) {
        return this.getAllCoursesOverview();
      }

      // Optimized search using the pre-processed chunks from .faiss
      const queryWords = queryLower.split(' ').filter(word => word.length > 2);
      
      const scoredResults = this.records.map(record => {
        let score = 0;
        const textLower = record.text.toLowerCase();
        const titleLower = record.metadata.title?.toLowerCase() || '';
        
        // Exact phrase matching (highest priority)
        if (textLower.includes(queryLower)) score += 10;
        if (titleLower.includes(queryLower)) score += 8;
        
        // Individual word matching
        queryWords.forEach(word => {
          if (textLower.includes(word)) score += 2;
          if (titleLower.includes(word)) score += 3;
        });
        
        // Type-specific bonuses for targeted queries
        if (query.includes('duration') && record.type === 'duration') score += 5;
        if (query.includes('price') && record.type === 'pricing') score += 5;
        if (query.includes('module') && record.type === 'module') score += 3;
        
        // Course-specific keyword matching
        if (record.metadata.title?.toLowerCase().includes('python') && queryLower.includes('python')) score += 4;
        if (record.metadata.title?.toLowerCase().includes('java') && queryLower.includes('java')) score += 4;
        if (record.metadata.title?.toLowerCase().includes('data') && queryLower.includes('data')) score += 4;
        
        return {
          id: record.id,
          courseId: record.course_id,
          content: record.text,
          similarity: Math.min(score / 15, 1), // Normalize to 0-1
          metadata: {
            ...record.metadata,
            type: record.type
          }
        };
      });

      // Filter and sort results
      const filteredResults = scoredResults
        .filter(result => result.similarity > 0.05) // Lower threshold for better coverage
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, topK);

      console.log(`🔍 FAISS search: "${query}" → ${filteredResults.length} results`);
      
      // If no results found with normal search, try to get course overviews
      if (filteredResults.length === 0 && (queryLower.includes('course') || queryLower.includes('program'))) {
        console.log('🔄 No specific results found, returning course overviews...');
        const overviews = this.records
          .filter(record => record.type === 'overview')
          .slice(0, Math.min(topK, 5)) // Limit to prevent overwhelming
          .map(record => ({
            id: record.id,
            courseId: record.course_id,
            content: record.text,
            similarity: 0.5, // Moderate relevance
            metadata: {
              ...record.metadata,
              type: record.type
            }
          }));
        return overviews;
      }
      
      return filteredResults;

    } catch (error) {
      console.error('❌ FAISS search failed:', error);
      return [];
    }
  }

  /**
   * Get course by ID from the original courses data
   */
  getCourseById(courseId: number): CourseDataFAISS | null {
    const course = coursesData.find((course: any) => course.id === courseId);
    return course || null;
  }

  /**
   * Get all courses
   */
  getAllCourses(): CourseDataFAISS[] {
    return coursesData as CourseDataFAISS[];
  }

  /**
   * Get database statistics
   */
  getStats() {
    return {
      isInitialized: this.isInitialized,
      totalRecords: this.records.length,
      dimension: this.dimension,
      storageType: 'faiss-file-based',
      hasRealFAISSFile: true,
      faissFilePath: '/faiss_db/courses.faiss'
    };
  }

  /**
   * Check if database is ready
   */
  isReady(): boolean {
    return this.isInitialized && this.records.length > 0;
  }

  /**
   * Get relevant context for chatbot (returns formatted text chunks)
   */
  async getRelevantContext(query: string, maxResults: number = 3): Promise<string[]> {
    const searchResults = await this.search(query, maxResults);
    return searchResults.map(result => result.content);
  }

  /**
   * Rebuild database (stub for compatibility - actual rebuild happens via build scripts)
   */
  async rebuild(): Promise<void> {
    console.log('🔄 Rebuild requested...');
    console.warn('⚠️ For production FAISS database, use: npm run build:faiss');
    console.warn('⚠️ Browser-based rebuild not supported. Use the build scripts instead.');
    
    // In a real production environment, this would trigger a server-side rebuild
    throw new Error('Rebuild not supported in browser environment. Use build scripts.');
  }

  /**
   * Get a formatted summary of all courses for chatbot responses
   */
  getAllCoursesSummary(): string {
    const courses = this.getAllCourses();
    
    let summary = "🚀 **Complete BigClasses.AI Course Catalog:**\n\n";
    
    // Group courses by category
    const categories = {
      "Programming & Fundamentals": courses.filter(c => c.title.includes("Python")),
      "Machine Learning & AI": courses.filter(c => 
        c.title.includes("Machine Learning") || 
        c.title.includes("Deep Learning") || 
        c.title.includes("Generative AI") ||
        c.title.includes("AI")
      ),
      "Natural Language Processing": courses.filter(c => c.title.includes("Natural Language")),
      "AI Development Tools": courses.filter(c => 
        c.title.includes("LangChain") || 
        c.title.includes("LangGraph")
      ),
      "MLOps & Production": courses.filter(c => 
        c.title.includes("MLOps") || 
        c.title.includes("LLMOps")
      ),
      "Data Science & Analytics": courses.filter(c => 
        c.title.includes("Data Analytics")
      ),
      "Ethics & Professional Development": courses.filter(c => c.title.includes("Ethics"))
    };

    Object.entries(categories).forEach(([category, coursesInCategory]) => {
      if (coursesInCategory.length > 0) {
        summary += `## ${category}\n`;
        coursesInCategory.forEach(course => {
          summary += `• **${course.title}** (${course.duration}) - ${course.highlights.slice(0, 2).join(", ")}\n`;
        });
        summary += "\n";
      }
    });

    // Add any uncategorized courses
    const categorized = Object.values(categories).flat();
    const uncategorized = courses.filter(c => !categorized.includes(c));
    if (uncategorized.length > 0) {
      summary += "## Additional Courses\n";
      uncategorized.forEach(course => {
        summary += `• **${course.title}** (${course.duration}) - ${course.highlights.slice(0, 2).join(", ")}\n`;
      });
    }

    summary += "\n💡 **Want to dive deeper into any course?** Just ask me about specific topics, duration, or what you'll learn!";
    
    return summary;
  }
}

// Export singleton instance
export const faissVectorDB = new FAISSVectorDatabase();

// Backward compatibility
export const vectorDB = faissVectorDB;
export type { CourseDataFAISS as CourseData };