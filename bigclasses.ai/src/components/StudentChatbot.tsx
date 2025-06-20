import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, BookOpen, GraduationCap, Clock, HelpCircle, Lightbulb, Star } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  quickReplies?: string[];
}

interface QuickQuestion {
  id: string;
  question: string;
  category: string;
  icon: React.ReactNode;
}

interface CourseDetails {
  name: string;
  rating: number;
  duration: string;
  topics: string[];
  projects: string[];
  description: string;
  prerequisites?: string[];
}

const StudentChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickQuestions, setShowQuickQuestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Comprehensive course database
  const courseDatabase: Record<string, CourseDetails> = {
    'data analytics': {
      name: 'Data Analytics',
      rating: 4.9,
      duration: '8-12 weeks',
      topics: ['Excel with Advanced Functions', 'SQL Server Database Management', 'PowerBI Dashboard Creation', 'Python for Data Analysis', 'Git and Github Version Control', 'Statistical Analysis', 'Data Visualization', 'ETL Processes'],
      projects: ['Excel Sales Dashboard', 'SQL Database Design Project', 'PowerBI Interactive Reports', 'Python Data Analysis Capstone', 'End-to-End Analytics Pipeline'],
      description: 'Comprehensive data analytics course covering the complete pipeline from data collection to visualization and reporting.',
      prerequisites: ['Basic computer skills', 'High school mathematics']
    },
    'python programming': {
      name: 'Python Programming',
      rating: 4.7,
      duration: '8-12 weeks',
      topics: ['Python Fundamentals', 'Data Types and Structures', 'Object-Oriented Programming', 'File Handling', 'Exception Handling', 'Libraries (NumPy, Pandas)', 'Web Scraping', 'API Integration', 'Testing and Debugging'],
      projects: ['Calculator Application', 'File Management System', 'Web Scraper Tool', 'Data Processing Pipeline', 'Personal Portfolio Website'],
      description: 'Complete Python programming course from fundamentals to advanced concepts with practical applications.',
      prerequisites: ['Basic programming concepts helpful but not required']
    },
    'machine learning': {
      name: 'Machine Learning',
      rating: 4.6,
      duration: '8-12 weeks',
      topics: ['Supervised Learning', 'Unsupervised Learning', 'Feature Engineering', 'Model Selection', 'Cross-Validation', 'Regression Algorithms', 'Classification Algorithms', 'Clustering', 'Ensemble Methods', 'Model Deployment'],
      projects: ['House Price Prediction', 'Customer Segmentation', 'Fraud Detection System', 'Recommendation Engine', 'ML Model Deployment'],
      description: 'Comprehensive machine learning course covering algorithms, implementation, and real-world deployment.',
      prerequisites: ['Python programming', 'Basic statistics', 'Linear algebra basics']
    },
    'deep learning': {
      name: 'Deep Learning',
      rating: 4.8,
      duration: '8-12 weeks',
      topics: ['Neural Networks', 'Convolutional Neural Networks (CNN)', 'Recurrent Neural Networks (RNN)', 'LSTM and GRU', 'Transformer Architecture', 'Transfer Learning', 'Computer Vision', 'TensorFlow and PyTorch', 'Model Optimization'],
      projects: ['Image Classification System', 'Text Generation Model', 'Object Detection App', 'Sentiment Analysis Tool', 'Custom Neural Network Architecture'],
      description: 'Advanced deep learning course covering neural networks, computer vision, and natural language processing.',
      prerequisites: ['Python programming', 'Machine learning basics', 'Linear algebra', 'Calculus']
    },
    'natural language processing': {
      name: 'Natural Language Processing',
      rating: 4.7,
      duration: '8-12 weeks',
      topics: ['Text Preprocessing', 'Tokenization', 'Named Entity Recognition', 'Sentiment Analysis', 'Topic Modeling', 'Word Embeddings', 'Transformer Models', 'BERT and GPT', 'Language Generation', 'Chatbot Development'],
      projects: ['Sentiment Analysis Dashboard', 'Document Classification System', 'Chatbot Implementation', 'Text Summarization Tool', 'Language Translation App'],
      description: 'Comprehensive NLP course covering text processing, analysis, and modern language models.',
      prerequisites: ['Python programming', 'Basic machine learning', 'Linear algebra']
    },
    'generative ai': {
      name: 'Generative AI',
      rating: 4.7,
      duration: '8-12 weeks',
      topics: ['Generative Models', 'GANs (Generative Adversarial Networks)', 'VAE (Variational Autoencoders)', 'Diffusion Models', 'Text Generation', 'Image Generation', 'DALL-E and Midjourney', 'GPT Models', 'Prompt Engineering', 'Fine-tuning'],
      projects: ['Text Generator Application', 'Image Creation Tool', 'Style Transfer System', 'Creative Writing Assistant', 'Multi-modal AI Application'],
      description: 'Cutting-edge course on generative AI covering text, image, and multi-modal generation.',
      prerequisites: ['Deep learning basics', 'Python programming', 'Neural networks understanding']
    },
    'langchain': {
      name: 'LangChain',
      rating: 4.7,
      duration: '8-12 weeks',
      topics: ['LangChain Framework', 'Chains and Agents', 'Memory Management', 'Document Loading', 'Vector Stores', 'Embeddings', 'Prompt Templates', 'Output Parsers', 'Tool Integration', 'Custom Chains'],
      projects: ['Q&A System with Documents', 'Chatbot with Memory', 'Document Analysis Tool', 'Knowledge Base Assistant', 'Multi-step Reasoning System'],
      description: 'Practical course on building LLM applications using the LangChain framework.',
      prerequisites: ['Python programming', 'Basic understanding of LLMs', 'API usage knowledge']
    },
    'langgraph': {
      name: 'LangGraph',
      rating: 4.9,
      duration: '8-12 weeks',
      topics: ['Graph-based AI Workflows', 'State Management', 'Node Creation', 'Edge Conditions', 'Parallel Processing', 'Error Handling', 'Workflow Orchestration', 'Complex Decision Trees', 'Multi-agent Systems', 'Production Deployment'],
      projects: ['Workflow Automation System', 'Multi-step Data Processing', 'Decision Support System', 'Agent Coordination Platform', 'Complex Business Logic Implementation'],
      description: 'Advanced course on creating sophisticated AI workflows using graph-based architectures.',
      prerequisites: ['LangChain knowledge', 'Python programming', 'System design basics']
    },
    'mlops': {
      name: 'MLOps',
      rating: 4.6,
      duration: '8-12 weeks',
      topics: ['CI/CD for ML', 'Model Versioning', 'Docker Containerization', 'Kubernetes Orchestration', 'Azure ML Platform', 'Model Monitoring', 'Data Drift Detection', 'Pipeline Automation', 'A/B Testing', 'Production Deployment', 'Model Governance'],
      projects: ['Automated ML Pipeline', 'Model Deployment System', 'Monitoring Dashboard', 'A/B Testing Framework', 'End-to-End MLOps Implementation'],
      description: 'Comprehensive MLOps course covering production ML workflows, monitoring, and deployment.',
      prerequisites: ['Machine learning experience', 'Python programming', 'Basic DevOps knowledge', 'Cloud platform familiarity']
    },
    'llmops': {
      name: 'LLMOps',
      rating: 4.6,
      duration: '8-12 weeks',
      topics: ['LLM Deployment', 'Model Fine-tuning', 'Prompt Engineering', 'LLM Monitoring', 'Cost Optimization', 'Scaling Strategies', 'Security Best Practices', 'Performance Optimization', 'Version Control for LLMs', 'Production Workflows'],
      projects: ['LLM Deployment Pipeline', 'Fine-tuning System', 'Cost Monitoring Tool', 'Performance Optimization Project', 'Production LLM Application'],
      description: 'Specialized course on operationalizing Large Language Models in production environments.',
      prerequisites: ['LLM understanding', 'Python programming', 'Cloud platforms', 'DevOps basics']
    },
    'ai agents': {
      name: 'AI Agents',
      rating: 4.9,
      duration: '8-12 weeks',
      topics: ['Agent Architecture', 'Planning and Reasoning', 'Tool Usage', 'Multi-agent Systems', 'Agent Communication', 'Task Decomposition', 'Environment Interaction', 'Autonomous Decision Making', 'Agent Coordination', 'Reinforcement Learning for Agents'],
      projects: ['Autonomous Task Agent', 'Multi-agent Collaboration System', 'Tool-using Agent', 'Planning and Execution Agent', 'Complex Problem-solving Agent'],
      description: 'Advanced course on building autonomous AI agents capable of complex reasoning and task execution.',
      prerequisites: ['Python programming', 'LLM knowledge', 'Problem-solving skills', 'System design understanding']
    },
    'ai ethics': {
      name: 'AI Ethics',
      rating: 4.9,
      duration: '8-12 weeks',
      topics: ['Bias Detection', 'Fairness Metrics', 'Explainable AI', 'Privacy Preservation', 'Algorithmic Accountability', 'Ethical AI Frameworks', 'Responsible AI Development', 'Legal Compliance', 'Social Impact Assessment', 'Governance Structures'],
      projects: ['Bias Detection System', 'Fairness Evaluation Tool', 'Explainability Dashboard', 'Privacy-preserving ML System', 'Ethical AI Assessment Framework'],
      description: 'Critical course on developing and deploying AI systems responsibly with focus on ethics and fairness.',
      prerequisites: ['Basic AI/ML knowledge', 'Critical thinking skills', 'Understanding of social issues']
    }
  };

  const quickQuestions: QuickQuestion[] = [
    {
      id: '1',
      question: 'What courses are available?',
      category: 'Course Catalog',
      icon: <BookOpen className="w-4 h-4" />
    },
    {
      id: '2',
      question: 'Course ratings and reviews?',
      category: 'Ratings',
      icon: <Star className="w-4 h-4" />
    },
    {
      id: '3',
      question: 'What are the course durations?',
      category: 'Duration',
      icon: <Clock className="w-4 h-4" />
    },
    {
      id: '4',
      question: 'Course topics and curriculum?',
      category: 'Curriculum',
      icon: <GraduationCap className="w-4 h-4" />
    },
    {
      id: '5',
      question: 'Tell me about Data Analytics course',
      category: 'Data Analytics',
      icon: <Bot className="w-4 h-4" />
    },
    {
      id: '6',
      question: 'What projects will I work on?',
      category: 'Projects',
      icon: <Lightbulb className="w-4 h-4" />
    }
  ];

  const getCourseName = (input: string): string | null => {
    const lowerInput = input.toLowerCase();
    const courseNames = Object.keys(courseDatabase);
    
    // Direct match
    for (const courseName of courseNames) {
      if (lowerInput.includes(courseName)) {
        return courseName;
      }
    }
    
    // Handle alternative names
    const alternatives: Record<string, string> = {
      'ml': 'machine learning',
      'nlp': 'natural language processing',
      'dl': 'deep learning',
      'gen ai': 'generative ai',
      'genai': 'generative ai',
      'python': 'python programming',
      'data analysis': 'data analytics',
      'data science': 'data analytics'
    };
    
    for (const [alt, actual] of Object.entries(alternatives)) {
      if (lowerInput.includes(alt)) {
        return actual;
      }
    }
    
    return null;
  };

  const CONTACT_ADVISOR_MESSAGE = 
  "For detailed information about course fees, discounts, payment plans, or any personalized queries, please contact our course advisor directly:\n\n" +
  "📞 **Call/WhatsApp:** +91 9666523199\n" +
  "💬 **Live Chat:** Available on our website\n\n" +
  "Our advisors will provide you with the most accurate and up-to-date information!";

  const GREETING_RESPONSES = [
    "Hello! 👋 I'm your BigClasses.AI course assistant. Ask me about any course, topics, duration, projects, or curriculum details.",
    "Hi there! 😊 How can I help you explore our courses today?",
    "Welcome! 🚀 You can ask about course topics, duration, projects, or ratings. How can I assist you?"
  ];

  const isFeeQuery = (input: string) => {
    const lower = input.toLowerCase();
    return (
      lower.includes("fee") ||
      lower.includes("fees") ||
      lower.includes("amount") ||
      lower.includes("price") ||
      lower.includes("cost") ||
      lower.includes("payment") ||
      lower.includes("charge") ||
      lower.includes("pay") ||
      lower.includes("discount")
    );
  };

  const isGreeting = (input: string) => {
    const lower = input.toLowerCase();
    return (
      /\b(hi|hello|hey|greetings|good morning|good afternoon|good evening|namaste|hola|howdy)\b/.test(lower)
    );
  };

  const isHelpQuery = (input: string) => {
    const lower = input.toLowerCase();
    return (
      lower.includes("help") ||
      lower.includes("assist") ||
      lower.includes("support") ||
      lower.includes("how to") ||
      lower.includes("what can you do")
    );
  };

  const getContextualResponse = (input: string): { answer: string; quickReplies?: string[] } => {
    // Handle fee/amount queries
    if (isFeeQuery(input)) {
      return {
        answer: CONTACT_ADVISOR_MESSAGE,
        quickReplies: ['Contact advisor', 'Call now', 'WhatsApp advisor']
      };
    }

    // Handle greetings
    if (isGreeting(input)) {
      return {
        answer: GREETING_RESPONSES[Math.floor(Math.random() * GREETING_RESPONSES.length)],
        quickReplies: ['Course catalog', 'Popular courses', 'Course durations', 'Course ratings']
      };
    }

    // Handle help queries
    if (isHelpQuery(input)) {
      return {
        answer: "I'm here to help you with course information! You can ask about:\n\n" +
          "• Course topics and curriculum\n" +
          "• Duration and time commitment\n" +
          "• Projects and assignments\n" +
          "• Ratings and reviews\n\n" +
          "Try asking: \"Topics in MLOps\" or \"Duration of Python Programming\".",
        quickReplies: ['Course catalog', 'Course durations', 'Course ratings']
      };
    }

    // --- BEGIN: Inserted logic for fallback to advisor for unknown questions ---
    // Try to answer with pre-defined logic
    const lowerInput = input.toLowerCase();
    const courseName = getCourseName(input);
    
    // Handle specific course queries
    if (courseName && courseDatabase[courseName]) {
      const course = courseDatabase[courseName];
      
      // Course duration queries
      if (lowerInput.includes('duration') || lowerInput.includes('how long') || lowerInput.includes('weeks') || lowerInput.includes('time')) {
        return {
          answer: `⏰ **${course.name} Course Duration:**\n\n🎯 **Duration**: ${course.duration}\n⭐ **Rating**: ${course.rating}★\n\n📋 **Course Structure:**\n• Flexible self-paced learning\n• Weekend batches available\n• Intensive bootcamp format option\n• Hands-on projects throughout\n\n💡 **Time Investment:**\n• 8-12 hours per week recommended\n• Includes lectures, assignments, and projects\n• Additional time for practice and review\n\nWould you like to know more about the ${course.name} curriculum?`,
          quickReplies: [`${course.name} topics`, `${course.name} projects`, 'Other courses', 'Course comparison']
        };
      }
      
      // Course topics/curriculum queries
      if (lowerInput.includes('topics') || lowerInput.includes('curriculum') || lowerInput.includes('syllabus') || lowerInput.includes('content') || lowerInput.includes('cover')) {
        const topicsList = course.topics.map((topic, index) => `${index + 1}. ${topic}`).join('\n');
        const prereqsText = course.prerequisites ? `\n\n📋 **Prerequisites:**\n${course.prerequisites.map(req => `• ${req}`).join('\n')}` : '';
        
        return {
          answer: `📚 **${course.name} Course Topics:**\n\n⭐ **Rating**: ${course.rating}★ | ⏰ **Duration**: ${course.duration}\n\n🎯 **Key Topics Covered:**\n${topicsList}\n\n📖 **Course Description:**\n${course.description}${prereqsText}\n\nReady to dive deeper into any specific topic?`,
          quickReplies: [`${course.name} projects`, `${course.name} duration`, 'Prerequisites details', 'Course comparison']
        };
      }
      
      // Course projects queries
      if (lowerInput.includes('project') || lowerInput.includes('practical') || lowerInput.includes('hands-on') || lowerInput.includes('assignment')) {
        const projectsList = course.projects.map((project, index) => `${index + 1}. ${project}`).join('\n');
        
        return {
          answer: `🚀 **${course.name} Course Projects:**\n\n⭐ **Rating**: ${course.rating}★ | ⏰ **Duration**: ${course.duration}\n\n💼 **Hands-on Projects:**\n${projectsList}\n\n🎯 **Project Benefits:**\n• Real-world application of concepts\n• Portfolio-ready projects\n• Industry-relevant skills\n• Practical experience\n• Interview preparation\n\nThese projects will give you hands-on experience and build your portfolio!`,
          quickReplies: [`${course.name} topics`, `${course.name} duration`, 'Portfolio guidance', 'Project requirements']
        };
      }
      
      // General course info
      return {
        answer: `🎓 **${course.name} Course Overview:**\n\n⭐ **Rating**: ${course.rating}★\n⏰ **Duration**: ${course.duration}\n\n📖 **Description:**\n${course.description}\n\n🎯 **What You'll Learn:**\n${course.topics.slice(0, 5).map(topic => `• ${topic}`).join('\n')}\n${course.topics.length > 5 ? `• And ${course.topics.length - 5} more topics...` : ''}\n\n💼 **Key Projects:**\n${course.projects.slice(0, 3).map(project => `• ${project}`).join('\n')}\n${course.projects.length > 3 ? `• Plus ${course.projects.length - 3} more projects...` : ''}\n\nWhat specific aspect would you like to explore?`,
        quickReplies: [`${course.name} topics`, `${course.name} projects`, `${course.name} duration`, 'Prerequisites']
      };
    }
    
    // General queries
    if (lowerInput.includes('course') && (lowerInput.includes('available') || lowerInput.includes('list') || lowerInput.includes('catalog'))) {
      const courseList = Object.values(courseDatabase).map(course => 
        `${course.name} (${course.rating}★) - ${course.duration}`
      ).join('\n• ');
      
      return {
        answer: `🎓 **BigClasses.AI Course Catalog:**\n\n• ${courseList}\n\n🌟 **All courses feature:**\n• Hands-on projects\n• Industry-relevant curriculum\n• Flexible learning options\n• Expert instruction\n• Career support\n\nWhich course interests you most?`,
        quickReplies: ['Data Analytics', 'Python Programming', 'Machine Learning', 'Deep Learning']
      };
    }
    
    if (lowerInput.includes('duration') || lowerInput.includes('how long') || lowerInput.includes('weeks') || lowerInput.includes('time')) {
      return {
        answer: `⏰ **Course Durations Overview:**\n\nAll BigClasses.AI courses are designed for **8-12 weeks** duration with flexible learning options:\n\n📊 **Learning Formats:**\n• **Self-paced**: Complete at your own speed\n• **Weekend batches**: Perfect for working professionals\n• **Intensive bootcamp**: Accelerated learning\n• **Part-time**: 8-12 hours per week\n\n🎯 **Time Investment:**\n• Lectures and tutorials\n• Hands-on assignments\n• Capstone projects\n• Practice sessions\n\nWhich specific course duration would you like to know about?`,
        quickReplies: ['Data Analytics duration', 'Python Programming duration', 'MLOps duration', 'LLMOps duration']
      };
    }
    
    if (lowerInput.includes('rating') || lowerInput.includes('review') || lowerInput.includes('feedback') || lowerInput.includes('star')) {
      const topRated = Object.values(courseDatabase)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 6)
        .map(course => `• ${course.name}: ${course.rating}★`)
        .join('\n');
      
      return {
        answer: `⭐ **Course Ratings Overview:**\n\n**Top Rated Courses:**\n${topRated}\n\n🎯 **Average Rating: 4.7/5 stars**\n\n💯 **Why students love our courses:**\n• Practical, hands-on approach\n• Industry-relevant projects\n• Expert instructors\n• Comprehensive curriculum\n• Career support\n\nWhich highly-rated course interests you?`,
        quickReplies: ['Top rated courses', 'Course comparison', 'Student testimonials', 'Course selection help']
      };
    }

    // Default response
    return {
      answer: 'I\'d be happy to help you with detailed course information! You can ask me about:\n\n🎓 **Specific Course Details:**\n• Course topics and curriculum\n• Course duration and time commitment\n• Hands-on projects and assignments\n• Prerequisites and requirements\n• Ratings and reviews\n\n💡 **Examples of what you can ask:**\n• "Topics in MLOps course"\n• "Course duration of Python Programming"\n• "Projects in Deep Learning"\n• "Prerequisites for AI Agents"\n\nWhat would you like to know about our courses?',
      quickReplies: ['Course catalog', 'Course ratings', 'Course durations', 'Popular courses']
    };
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest'
      });
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [messages, isTyping]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: '1',
        type: 'bot',
        content: 'Hi there! 👋 I\'m your BigClasses.AI course assistant. I can provide detailed information about any of our 12 courses!\n\n🎓 **What I can help with:**\n• Specific course topics and curriculum\n• Course duration and time commitment\n• Hands-on projects and assignments\n• Prerequisites and requirements\n• Course ratings and reviews\n\n💡 **Try asking:** "Topics in MLOps" or "Duration of Python Programming"\n\nWhat would you like to know?',
        timestamp: new Date(),
        quickReplies: ['Course catalog', 'Data Analytics details', 'MLOps topics', 'Course durations']
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen]);

  const handleSendMessage = (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setShowQuickQuestions(false);
    setIsTyping(true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      const response = getContextualResponse(content);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: response.answer,
        timestamp: new Date(),
        quickReplies: response.quickReplies
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleQuickQuestion = (question: string) => {
    handleSendMessage(question);
  };

  const handleQuickReply = (reply: string) => {
    handleSendMessage(reply);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  const formatMessageContent = (content: string) => {
    return content.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < content.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <div className="w-full flex flex-col items-end">
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110"
          aria-label="Open chat"
        >
          <MessageCircle className="w-6 h-6" />
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-bounce">
            !
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-80 h-[500px] flex flex-col overflow-hidden mt-2">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">BigClasses AI Assistant</h3>
                <p className="text-xs opacity-90">Always here to help</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-start space-x-2 max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.type === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white border-2 border-purple-200'
                  }`}>
                    {message.type === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3 text-purple-600" />}
                  </div>
                  <div className={`rounded-xl p-2.5 shadow-sm ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-200'
                  }`}>
                    <div className="text-xs leading-relaxed whitespace-pre-wrap">
                      {formatMessageContent(message.content)}
                    </div>
                    {message.quickReplies && message.quickReplies.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {message.quickReplies.map((reply, index) => (
                          <button
                            key={index}
                            onClick={() => handleQuickReply(reply)}
                            className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs hover:bg-purple-200 transition-colors"
                          >
                            {reply}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2 max-w-[85%]">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 bg-white border-2 border-purple-200">
                    <Bot className="w-3 h-3 text-purple-600" />
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl p-2.5 shadow-sm">
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Questions */}
            {showQuickQuestions && messages.length <= 1 && (
              <div className="space-y-2">
                <p className="text-xs text-gray-600 font-medium">Quick questions to get started:</p>
                <div className="grid grid-cols-1 gap-1.5">
                  {quickQuestions.map((question) => (
                    <button
                      key={question.id}
                      onClick={() => handleQuickQuestion(question.question)}
                      className="flex items-center space-x-2 p-2 bg-white border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-200 transition-all duration-200 text-left"
                    >
                      <div className="text-purple-600 flex-shrink-0">
                        {question.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-gray-800 truncate">{question.question}</p>
                        <p className="text-xs text-gray-500">{question.category}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-3 bg-white">
            <div className="flex items-center space-x-2">
              <div className="flex-1">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about specific courses... (e.g., 'MLOps topics')"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={isTyping}
                />
              </div>
              <button
                onClick={() => handleSendMessage(inputValue)}
                disabled={!inputValue.trim() || isTyping}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full p-2 transition-all duration-200"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>      
  );
};

export default StudentChatbot;

