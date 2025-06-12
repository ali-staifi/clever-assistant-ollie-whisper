
import React, { useEffect } from 'react';
import { useJarvisServices } from '@/hooks/useJarvisServices';
import JarvisHeader from './jarvis/JarvisHeader';
import VoiceControl from './jarvis/VoiceControl';
import ConversationView from './jarvis/ConversationView';
import ErrorDisplay from './jarvis/ErrorDisplay';
import SettingsPanel from './SettingsPanel';
import LanguageControls from './jarvis/LanguageControls';
import Jarvis3DVisualizer from './jarvis/Jarvis3DVisualizer';
import VoiceReactiveEffects from './jarvis/VoiceReactiveEffects';
import { useFastSpeech2 } from '@/hooks/jarvis/useFastSpeech2';

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
    toggleNoMicrophoneMode,
    responseLanguage,
    changeResponseLanguage
  } = useJarvisServices();
  
  // Intégration des paramètres vocaux avancés
  const { voiceParams } = useFastSpeech2();
  
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
    <div className="flex flex-col h-screen bg-jarvis-darkBlue text-white overflow-hidden relative">
      {/* Effets de fond réactifs */}
      <div className="absolute inset-0 z-0">
        <VoiceReactiveEffects
          isListening={isListening}
          isSpeaking={isSpeaking}
          micVolume={micVolume}
          voiceParams={voiceParams}
        />
      </div>
      
      {/* Contenu principal */}
      <div className="relative z-10 flex flex-col h-full p-4">
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
        
        {/* Language Controls */}
        <div className="mb-4">
          <LanguageControls
            currentLanguage={responseLanguage}
            onLanguageChange={changeResponseLanguage}
          />
        </div>
        
        {/* Visualiseur 3D Jarvis */}
        <div className="mb-4 mx-auto max-w-2xl w-full">
          <Jarvis3DVisualizer
            isListening={isListening}
            isSpeaking={isSpeaking}
            micVolume={micVolume}
            voiceParams={voiceParams}
          />
        </div>
        
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
    </div>
  );
};

export default JarvisInterface;
