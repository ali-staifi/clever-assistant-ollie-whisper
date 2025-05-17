
import React from 'react';
import { useJarvisServices } from '@/hooks/useJarvisServices';
import JarvisHeader from './jarvis/JarvisHeader';
import VoiceControl from './jarvis/VoiceControl';
import ConversationView from './jarvis/ConversationView';
import ErrorDisplay from './jarvis/ErrorDisplay';
import SettingsPanel from './SettingsPanel';

const JarvisInterface = () => {
  const {
    isListening,
    isProcessing,
    isSpeaking,
    transcript,
    response,
    showSettings,
    setShowSettings,
    messages,
    ollamaUrl,
    ollamaModel,
    ollamaStatus,
    errorMessage,
    speechRecognitionAvailable,
    toggleListening,
    toggleSpeaking,
    handleOllamaUrlChange,
    handleOllamaModelChange,
    clearConversation,
    checkOllamaConnection,
    dismissError,
  } = useJarvisServices();

  return (
    <div className="flex flex-col h-screen bg-jarvis-darkBlue text-white p-4 overflow-hidden">
      {/* Header */}
      <JarvisHeader 
        ollamaStatus={ollamaStatus}
        toggleSettings={() => setShowSettings(!showSettings)}
      />
      
      {/* Error Message */}
      <ErrorDisplay 
        errorMessage={errorMessage} 
        onDismiss={dismissError}
      />
      
      {/* Settings Panel */}
      {showSettings && (
        <SettingsPanel
          ollamaUrl={ollamaUrl}
          ollamaModel={ollamaModel}
          onOllamaUrlChange={handleOllamaUrlChange}
          onOllamaModelChange={handleOllamaModelChange}
          onClearConversation={clearConversation}
          onClose={() => setShowSettings(false)}
          checkConnection={checkOllamaConnection}
          ollamaStatus={ollamaStatus}
        />
      )}
      
      {/* Main Interface */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 overflow-hidden">
        {/* Visualizer Section */}
        <VoiceControl
          isListening={isListening}
          isProcessing={isProcessing}
          isSpeaking={isSpeaking}
          toggleListening={toggleListening}
          toggleSpeaking={toggleSpeaking}
          ollamaStatus={ollamaStatus}
          speechRecognitionAvailable={speechRecognitionAvailable}
        />
        
        {/* Conversation Section */}
        <ConversationView
          messages={messages}
          isProcessing={isProcessing}
          response={response}
          isListening={isListening}
          transcript={transcript}
          ollamaUrl={ollamaUrl}
          ollamaModel={ollamaModel}
        />
      </div>
    </div>
  );
};

export default JarvisInterface;
