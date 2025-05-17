
import React from 'react';
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume, VolumeX } from 'lucide-react';
import AudioVisualizer from '../AudioVisualizer';

interface VoiceControlProps {
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  toggleListening: () => void;
  toggleSpeaking: () => void;
  ollamaStatus: 'idle' | 'connecting' | 'connected' | 'error';
}

const VoiceControl: React.FC<VoiceControlProps> = ({
  isListening,
  isProcessing,
  isSpeaking,
  toggleListening,
  toggleSpeaking,
  ollamaStatus
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
            <Button 
              className={`rounded-full w-16 h-16 transition-all ${
                isListening ? 'bg-red-600 hover:bg-red-700' : 'bg-jarvis-blue hover:bg-jarvis-blue/80'
              }`}
              onClick={toggleListening}
              disabled={isProcessing || ollamaStatus === 'error'}
            >
              {isListening ? (
                <MicOff className="h-8 w-8" />
              ) : (
                <Mic className="h-8 w-8" />
              )}
            </Button>
            
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
          </div>
        </div>
        
        {/* Status Text */}
        <div className="absolute -bottom-10 left-0 right-0 text-center text-sm text-jarvis-blue">
          {isListening ? 'Listening...' : 
           isProcessing ? 'Processing...' : 
           isSpeaking ? 'Speaking...' : 
           'Ready'}
        </div>
      </div>
    </div>
  );
};

export default VoiceControl;
