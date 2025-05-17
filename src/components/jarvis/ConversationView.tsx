
import React, { useRef, useEffect } from 'react';
import { Message } from '@/services/OllamaService';

interface ConversationViewProps {
  messages: Message[];
  isProcessing: boolean;
  response: string;
  isListening: boolean;
  transcript: string;
  ollamaUrl: string;
  ollamaModel: string;
}

const ConversationView: React.FC<ConversationViewProps> = ({
  messages,
  isProcessing,
  response,
  isListening,
  transcript,
  ollamaUrl,
  ollamaModel
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sanitize text to remove undefined values
  const sanitizeText = (text: string): string => {
    return typeof text === 'string' ? text.replace(/undefined/g, '').trim() : '';
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing, isListening]);

  return (
    <div className="flex-1 bg-jarvis-darkBlue/50 rounded-lg p-4 overflow-hidden flex flex-col">
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-10">
            <p>Say "Hello" to start a conversation</p>
            <p className="mt-2 text-sm">Make sure Ollama is running at {ollamaUrl}</p>
            <p className="mt-1 text-sm">Using model: {ollamaModel}</p>
          </div>
        )}
        
        {messages.map((msg, index) => (
          <div 
            key={index}
            className={`p-3 rounded-lg max-w-[85%] animate-fade-in ${
              msg.role === 'user' 
                ? 'bg-jarvis-blue/30 ml-auto' 
                : 'bg-muted text-white/90 mr-auto'
            }`}
          >
            <div className="text-xs text-gray-400 mb-1">
              {msg.role === 'user' ? 'You' : 'J.A.R.V.I.S'}
            </div>
            <div className="whitespace-pre-wrap">
              {sanitizeText(msg.content)}
            </div>
          </div>
        ))}
        
        {/* Current processing message */}
        {isProcessing && response && (
          <div className="bg-muted text-white/90 p-3 rounded-lg max-w-[85%] mr-auto animate-fade-in">
            <div className="text-xs text-gray-400 mb-1">
              J.A.R.V.I.S
            </div>
            <div className="whitespace-pre-wrap">
              {sanitizeText(response)}
            </div>
          </div>
        )}
        
        {/* Current transcript */}
        {isListening && transcript && (
          <div className="bg-jarvis-blue/30 p-3 rounded-lg max-w-[85%] ml-auto animate-fade-in">
            <div className="text-xs text-gray-400 mb-1">
              You (listening...)
            </div>
            <div>{sanitizeText(transcript)}</div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ConversationView;
