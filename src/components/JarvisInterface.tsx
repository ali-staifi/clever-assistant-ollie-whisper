
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
import VoiceSettingsDialog from './dialogs/VoiceSettingsDialog';
import { useFastSpeech2 } from '@/hooks/jarvis/useFastSpeech2';
import { Button } from './ui/button';
import { Settings } from 'lucide-react';

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
    changeResponseLanguage,
    // Paramètres vocaux globaux
    globalVoiceSettings,
    updateGlobalVoiceSettings,
    speechService
  } = useJarvisServices();
  
  // Intégration des paramètres vocaux avancés
  const { voiceParams } = useFastSpeech2();
  
  // État pour la boîte de dialogue des paramètres vocaux
  const [voiceSettingsOpen, setVoiceSettingsOpen] = React.useState(false);
  
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
        {/* Header avec bouton paramètres vocaux */}
        <div className="flex justify-between items-center mb-4">
          <JarvisHeader 
            ollamaStatus={ollamaStatus}
            toggleSettings={() => setShowSettings(!showSettings)}
          />
          
          {/* Bouton paramètres vocaux intégré */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setVoiceSettingsOpen(true)}
              className="text-white border-white/20 hover:bg-white/10"
            >
              <Settings className="h-4 w-4 mr-2" />
              Paramètres Vocaux
            </Button>
            
            {/* Indicateur des paramètres vocaux actifs */}
            <div className="text-xs text-white/60">
              Voix {globalVoiceSettings.voiceGender} • 
              Effet: {Math.round(globalVoiceSettings.roboticEffect * 100)}%
            </div>
          </div>
        </div>
        
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
            speechService={speechService}
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
      
      {/* Dialog des paramètres vocaux */}
      <VoiceSettingsDialog
        open={voiceSettingsOpen}
        onOpenChange={setVoiceSettingsOpen}
        globalVoiceSettings={globalVoiceSettings}
        onUpdateGlobalVoiceSettings={updateGlobalVoiceSettings}
      />
    </div>
  );
};

export default JarvisInterface;
