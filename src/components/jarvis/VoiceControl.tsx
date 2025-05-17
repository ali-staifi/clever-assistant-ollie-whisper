
import React from 'react';
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume, VolumeX, AlertTriangle, Settings } from 'lucide-react';
import AudioVisualizer from '../AudioVisualizer';

interface VoiceControlProps {
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  toggleListening: () => void;
  toggleSpeaking: () => void;
  ollamaStatus: 'idle' | 'connecting' | 'connected' | 'error';
  speechRecognitionAvailable?: boolean;
  onTestMicrophone?: () => void;
}

const VoiceControl: React.FC<VoiceControlProps> = ({
  isListening,
  isProcessing,
  isSpeaking,
  toggleListening,
  toggleSpeaking,
  ollamaStatus,
  speechRecognitionAvailable = true,
  onTestMicrophone
}) => {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="relative w-64 h-64 md:w-80 md:h-80">
        {/* Pulse Ring */}
        <div className={`absolute inset-0 rounded-full border-2 border-jarvis-blue/30 animate-pulse-ring ${isListening || isProcessing || isSpeaking ? 'opacity-100' : 'opacity-0'}`}></div>
        
        {/* Rotating Ring */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[110%] h-[110%] border border-jarvis-blue/20 rounded-full animate-rotate-circle"></div>
          <div className="absolute w-[95%] h-[95%] border border-jarvis-blue/30 rounded-full animate-rotate-circle-slow"></div>
        </div>
        
        {/* Core Visualizer */}
        <div className="absolute inset-0">
          <AudioVisualizer 
            isListening={isListening} 
            isPulsing={isProcessing || isSpeaking} 
          />
        </div>
        
        {/* Control Buttons */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex gap-4">
            {/* Mic Button */}
            {speechRecognitionAvailable ? (
              <Button 
                className={`rounded-full w-16 h-16 transition-all ${
                  isListening ? 'bg-red-600 hover:bg-red-700' : 'bg-jarvis-blue hover:bg-jarvis-blue/80'
                }`}
                onClick={toggleListening}
                disabled={isProcessing || ollamaStatus === 'error'}
                title={ollamaStatus === 'error' ? "Cannot connect to Ollama" : isListening ? "Stop listening" : "Start listening"}
              >
                {isListening ? (
                  <MicOff className="h-8 w-8" />
                ) : (
                  <Mic className="h-8 w-8" />
                )}
              </Button>
            ) : (
              <Button 
                className="rounded-full w-16 h-16 bg-red-500 hover:bg-red-600 cursor-not-allowed"
                disabled={true}
                title="Speech recognition not available in this browser"
              >
                <AlertTriangle className="h-8 w-8" />
              </Button>
            )}
            
            {/* Speaker Button - Only visible when speaking */}
            {isSpeaking && (
              <Button 
                className="rounded-full w-12 h-12 bg-jarvis-blue hover:bg-jarvis-blue/80 ml-2"
                onClick={toggleSpeaking}
              >
                {isSpeaking ? (
                  <VolumeX className="h-6 w-6" />
                ) : (
                  <Volume className="h-6 w-6" />
                )}
              </Button>
            )}

            {/* Test Mic Button - Only visible when not listening */}
            {!isListening && onTestMicrophone && (
              <Button 
                className="rounded-full w-12 h-12 bg-jarvis-blue/60 hover:bg-jarvis-blue/80"
                onClick={onTestMicrophone}
                title="Test microphone"
              >
                <Settings className="h-6 w-6" />
              </Button>
            )}
          </div>
        </div>
        
        {/* Status Text */}
        <div className="absolute -bottom-10 left-0 right-0 text-center text-sm text-jarvis-blue">
          {!speechRecognitionAvailable ? 'Speech recognition not supported in this browser' :
           isListening ? 'Listening...' : 
           isProcessing ? 'Processing...' : 
           isSpeaking ? 'Speaking...' : 
           'Ready'}
        </div>
      </div>
    </div>
  );
};

export default VoiceControl;
