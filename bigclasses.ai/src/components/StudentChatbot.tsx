import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, BookOpen, GraduationCap, Clock, HelpCircle, Lightbulb, Star, Loader } from 'lucide-react';

// This interface should match the one in useGeminiChat.ts
interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  quickReplies?: string[];
}

// 1. Define the props that this UI component will accept
interface StudentChatbotProps {
  messages: Message[];
  isTyping: boolean;
   isLoading: boolean; // <-- ADD THIS NEW PROP
  sendMessage: (content: string) => void;
  iconSize?: number; // <-- add this line
}

// 2. Update the component to accept the new props
const StudentChatbot: React.FC<StudentChatbotProps> = ({ messages, isTyping, isLoading, sendMessage, iconSize }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, isLoading]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    sendMessage(inputValue.trim());
    setInputValue('');
  };

  const handleQuickReply = (reply: string) => {
    sendMessage(reply);
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageContent = (content: string) => {
    // This function can be enhanced to render markdown, bold text, etc.
    return content.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < content.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <div className="z-50">
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          // Make the button smaller and circular, match other floating buttons
          className="relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full p-2 shadow-lg transition-all duration-300 hover:scale-110"
          aria-label="Open chat"
          style={{ width: 44, height: 44, minWidth: 44, minHeight: 44 }} // fixed size
        >
          <MessageCircle className="w-6 h-6" style={iconSize ? { width: iconSize, height: iconSize } : {}} />
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-bounce" style={{fontSize: '0.75rem'}}>
            AI
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className="bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col fixed z-[9999] student-chatbot-window"
          style={{
            bottom: 72,
            right: 64,
            width: 280,
            maxWidth: '96vw',
            height: 410,
            overflow: 'hidden',
          }}
        >
          <style>{`
            @media (max-width: 600px) {
              .student-chatbot-window {
                width: 95vw !important;
                min-width: 0 !important;
                max-width: 95vw !important;
                left: 50% !important;
                transform: translateX(-50%) !important;
                right: unset !important;
                bottom: 90px !important; /* Move window further up */
                top: unset !important;
                height: 70vh !important;
                max-height: 70vh !important;
                border-radius: 18px !important;
                margin-bottom: calc(env(safe-area-inset-bottom, 8px) + 90px) !important; /* Add extra space for floating icon */
                z-index: 99999 !important;
              }
            }
          `}</style>
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-[1rem]">BigClasses AI Advisor</h3>
                  <p className="text-xs opacity-90">Online</p>
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
            <div
              className="flex-1 overflow-y-auto p-2 space-y-3 bg-gray-50"
              style={{
                minHeight: 0,
                overflowX: 'hidden',
                wordBreak: 'break-word',
                // On mobile, ensure the messages area doesn't get cut off
                maxHeight: '100%',
              }}
            >
              {/* 3. USE THE isLoading PROP to show a loading spinner */}
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="flex flex-col items-center text-gray-500">
                    <Loader className="w-8 h-8 animate-spin text-purple-600" />
                    <p className="mt-2 text-sm">Initializing Advisor...</p>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex items-end gap-2 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {message.type === 'bot' && (
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-purple-100 text-purple-600">
                          <Bot className="w-5 h-5" />
                        </div>
                      )}
                      <div className={`rounded-2xl p-3 max-w-[80%] shadow-sm ${
                          message.type === 'user'
                            ? 'bg-blue-600 text-white rounded-br-none'
                            : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
                        }`}>
                        <div className="text-sm leading-relaxed whitespace-pre-wrap">
                          {formatMessageContent(message.content)}
                        </div>
                        {message.quickReplies && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {message.quickReplies.map((reply, index) => (
                              <button
                                key={index}
                                onClick={() => handleQuickReply(reply)}
                                className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs hover:bg-purple-200 transition-colors"
                              >
                                {reply}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                       {message.type === 'user' && (
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-100 text-blue-600">
                          <User className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex items-end gap-2">
                       <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-purple-100 text-purple-600">
                          <Bot className="w-5 h-5" />
                        </div>
                      <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none p-3 shadow-sm">
                        <div className="flex space-x-1.5">
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>
            {/* Input Area */}
            <div className="border-t border-gray-200 p-2 bg-white flex-shrink-0">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about a course..."
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={isTyping || isLoading}
                  style={{ minWidth: 0 }}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping || isLoading}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full p-2 transition-all duration-200"
                  style={{ minWidth: 36, minHeight: 36 }}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentChatbot;
