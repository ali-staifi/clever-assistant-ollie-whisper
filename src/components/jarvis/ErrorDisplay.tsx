
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Mic, Volume2, AlertCircle, Settings } from 'lucide-react';

interface ErrorDisplayProps {
  errorMessage: string;
  onDismiss?: () => void;
  onRetryMic?: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ errorMessage, onDismiss, onRetryMic }) => {
  if (!errorMessage) return null;
  
  const isMicrophoneError = errorMessage.toLowerCase().includes('microphone') || 
                           errorMessage.toLowerCase().includes('speech');
  
  return (
    <Alert variant="destructive" className="mb-4 animate-in fade-in duration-300">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <AlertTitle className="text-lg font-bold">Error:</AlertTitle>
          <AlertDescription className="mt-2 whitespace-pre-line">{errorMessage}</AlertDescription>
          
          {isMicrophoneError && (
            <div className="mt-3 space-y-3">
              <div className="text-sm">
                <h4 className="font-semibold">Suggestions to improve microphone performance:</h4>
                <ul className="list-disc pl-5 space-y-1 mt-1">
                  <li>Speak louder and more clearly, directly into your microphone</li>
                  <li>Try moving closer to your microphone</li>
                  <li>Open Settings to adjust microphone sensitivity (higher is more sensitive)</li>
                  <li>Check that your browser has permission to access the microphone</li>
                  <li>Make sure your microphone is not muted in system settings</li>
                  <li>Try using headphones with a built-in microphone</li>
                  <li>Consider using Chrome or Edge browsers for better speech recognition</li>
                </ul>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button 
                  size="sm"
                  variant="outline"
                  className="border-red-400 text-red-400 hover:bg-red-400/10"
                  onClick={onRetryMic}
                >
                  <Mic className="mr-2 h-4 w-4" />
                  Test Microphone
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="border-red-400 text-red-400 hover:bg-red-400/10"
                  onClick={() => window.open('chrome://settings/content/microphone', '_blank')}
                >
                  <Volume2 className="mr-2 h-4 w-4" />
                  Open Mic Settings (Chrome)
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="border-red-400 text-red-400 hover:bg-red-400/10"
                  onClick={() => window.open('ms-settings:sound', '_blank')}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Open Sound Settings (Windows)
                </Button>
              </div>
            </div>
          )}
        </div>
        
        {onDismiss && (
          <Button 
            variant="ghost" 
            className="h-8 w-8 p-0 text-red-300 hover:text-red-500"
            onClick={onDismiss}
          >
            ×
          </Button>
        )}
      </div>
    </Alert>
  );
};

export default ErrorDisplay;
