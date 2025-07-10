import React from 'react';
import { useGeminiChat } from '@/hooks/useGeminiChat';
import StudentChatbot from './StudentChatbot'; // The UI component

interface GeminiChatWrapperProps {
  iconSize?: number;
}

const GeminiChatWrapper: React.FC<GeminiChatWrapperProps> = ({ iconSize }) => {
  return <GeminiEnabledChatbot iconSize={iconSize} />;
};

const GeminiEnabledChatbot: React.FC<{ iconSize?: number }> = ({ iconSize }) => {
  const { messages, isTyping, isLoading, sendMessage } = useGeminiChat();

  return (
    <StudentChatbot
      messages={messages}
      isTyping={isTyping}
      isLoading={isLoading}
      sendMessage={sendMessage}
      iconSize={iconSize}
    />
  );
};

export default GeminiChatWrapper;
