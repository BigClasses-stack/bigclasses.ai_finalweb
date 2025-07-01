import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { GeminiChatService, ChatMessage, mapRoleToType } from '@/services/geminiService';

// The message structure for the UI
interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  quickReplies?: string[];
}

// The return type of our custom hook
interface UseGeminiChatReturn {
  messages: Message[];
  isTyping: boolean;
  isLoading: boolean;
  sendMessage: (content: string) => Promise<void>;
  chatService: GeminiChatService | null;
}

export function useGeminiChat(): UseGeminiChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatService, setChatService] = useState<GeminiChatService | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Start in a loading state

  // Main effect for initializing the chat service.
  // This now creates a new, fresh session on every component mount (e.g., page load).
  useEffect(() => {
    const initChat = () => {
      setIsLoading(true);
      
      // Create a unique session ID for this new session.
      const sessionId = uuidv4();
      
      // Always create a brand new chat service, as there's no session persistence.
      const newChatService = new GeminiChatService(sessionId);
      setChatService(newChatService);

      // Display the initial welcome message for every new session.
      setMessages([{
        id: uuidv4(),
        type: 'bot',
        content: 'Hi there! 👋 I\'m your BigClasses.AI enrollment advisor. I\'m here to help you discover the perfect course to accelerate your career and transform your skills. Our industry-leading courses feature hands-on projects, real-time support, and expert instruction. What field or skill are you most interested in learning about today? I can help you explore our offerings in technology, programming, data science, and more!',
        timestamp: new Date()
      }]);
      
      setIsLoading(false); // Initialization complete
    };
    
    initChat();

    // No cleanup function is needed to save the session anymore.
  }, []); // Empty dependency array ensures this runs only once on mount

  const extractQuickReplies = (content: string): string[] | undefined => {
    // This function remains useful for parsing potential quick replies from the bot's response text.
    const quickRepliesMatch = content.match(/Quick replies:([\s\S]+)$/);
    if (quickRepliesMatch && quickRepliesMatch[1]) {
      return quickRepliesMatch[1]
        .split('-')
        .map(line => line.trim().replace(/^\[|\]$/g, '')) // Clean up the reply
        .filter(line => line.length > 0);
    }
    return undefined;
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || !chatService || isTyping) return;

    const userMessage: Message = {
      id: uuidv4(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    
    try {
      const responseText = await chatService.sendMessage(content);
      
      const quickReplies = extractQuickReplies(responseText);
      const cleanedResponse = responseText.replace(/Quick replies:[\s\S]+$/, '').trim();
      
      const botMessage: Message = {
        id: uuidv4(),
        type: 'bot',
        content: cleanedResponse,
        timestamp: new Date(),
        quickReplies: quickReplies
      };
      setMessages(prev => [...prev, botMessage]);
      // No need to save the session here anymore.

    } catch (error: any) {
      const errorMessage: Message = {
        id: uuidv4(),
        type: 'bot',
        content: "I seem to be having some technical difficulties right now. Please try again in a moment, or contact our support team directly.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return { messages, isTyping, isLoading, sendMessage, chatService };
}