
import React from 'react';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

interface JarvisHeaderProps {
  ollamaStatus: 'idle' | 'connecting' | 'connected' | 'error';
  toggleSettings: () => void;
}

const JarvisHeader: React.FC<JarvisHeaderProps> = ({ ollamaStatus, toggleSettings }) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h1 className="text-4xl font-bold text-jarvis-blue text-shadow-glow">J.A.R.V.I.S</h1>
      <div className="flex items-center gap-2">
        <div className={`h-3 w-3 rounded-full ${
          ollamaStatus === 'connected' ? 'bg-green-500' : 
          ollamaStatus === 'connecting' ? 'bg-yellow-500' : 
          'bg-red-500'
        }`}></div>
        <span className="text-xs text-gray-400">
          {ollamaStatus === 'connected' ? 'Ollama connected' : 
           ollamaStatus === 'connecting' ? 'Connecting...' : 
           'Ollama offline'}
        </span>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSettings}
          className="text-jarvis-blue hover:bg-jarvis-darkBlue/30"
        >
          <Settings className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};

export default JarvisHeader;
