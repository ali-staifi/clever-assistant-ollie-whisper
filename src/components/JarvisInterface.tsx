
import React, { useEffect } from 'react';
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
    availableModels,
    errorMessage,
    speechRecognitionAvailable,
    micVolume,
    micSensitivity,
    setMicSensitivity,
    toggleListening,
    toggleSpeaking,
    handleOllamaUrlChange,
    handleOllamaModelChange,
    clearConversation,
    checkOllamaConnection,
    dismissError,
    testMicrophone,
    noMicrophoneMode,
    toggleNoMicrophoneMode
  } = useJarvisServices();
  
  // Listen for settings toggle events from Navigation
  useEffect(() => {
    const handleToggleSettings = () => {
      setShowSettings(prev => !prev);
    };
    
    document.addEventListener('toggle-jarvis-settings', handleToggleSettings);
    
    return () => {
      document.removeEventListener('toggle-jarvis-settings', handleToggleSettings);
    };
  }, [setShowSettings]);

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
        onRetryMic={testMicrophone}
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
          availableModels={availableModels}
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
          onTestMicrophone={testMicrophone}
          micVolume={micVolume}
          micSensitivity={micSensitivity}
          onSensitivityChange={setMicSensitivity}
          noMicrophoneMode={noMicrophoneMode}
          toggleNoMicrophoneMode={toggleNoMicrophoneMode}
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
