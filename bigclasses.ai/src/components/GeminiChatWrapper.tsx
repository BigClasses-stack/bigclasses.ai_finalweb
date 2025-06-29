import React from 'react';
import { useGeminiChat } from '@/hooks/useGeminiChat';
import StudentChatbot from './StudentChatbot'; // The UI component

// Accept iconSize as an optional prop and forward it
interface GeminiChatWrapperProps {
  iconSize?: number;
}

const GeminiChatWrapper: React.FC<GeminiChatWrapperProps> = ({ iconSize }) => {
  return <GeminiEnabledChatbot iconSize={iconSize} />;
};

// This component bridges the gap between the Gemini hook and the UI component.
const GeminiEnabledChatbot: React.FC<{ iconSize?: number }> = ({ iconSize }) => {
  // All the complex logic is now neatly contained in the useGeminiChat hook.
  const { messages, isTyping, isLoading, sendMessage } = useGeminiChat();
  
  // The StudentChatbot component is responsible for rendering the UI.
  // We pass it the live state from our Gemini-powered hook.
  // Note: The StudentChatbot component itself will need to be updated to accept and use the 'isLoading' prop
  // to show a loading indicator, for example.
  return (
    <StudentChatbot
      messages={messages}
      isTyping={isTyping}
      isLoading={isLoading} // Pass the loading state to the UI component
      sendMessage={sendMessage}
      iconSize={iconSize}
    />
  );
};

export default GeminiChatWrapper;