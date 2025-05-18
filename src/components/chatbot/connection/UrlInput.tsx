
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface UrlInputProps {
  ollamaUrl: string;
  onOllamaUrlChange: (url: string) => void;
  onCheckConnection: () => Promise<boolean>;
  connectionStatus: 'idle' | 'connecting' | 'connected' | 'error';
}

const UrlInput: React.FC<UrlInputProps> = ({
  ollamaUrl,
  onOllamaUrlChange,
  onCheckConnection,
  connectionStatus
}) => {
  const [tempUrl, setTempUrl] = useState(ollamaUrl);
  const [isChecking, setIsChecking] = useState(false);

  const handleTestConnection = async () => {
    setIsChecking(true);
    try {
      await onCheckConnection();
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Input 
          placeholder="URL Ollama (ex: http://localhost:11434)"
          value={tempUrl}
          onChange={(e) => setTempUrl(e.target.value)}
          className="flex-1"
        />
        <Button 
          onClick={() => {
            onOllamaUrlChange(tempUrl);
          }}
          variant="secondary"
          size="sm"
          disabled={connectionStatus === 'connecting' || tempUrl === ollamaUrl || isChecking}
        >
          Appliquer
        </Button>
        <Button
          onClick={handleTestConnection}
          variant={connectionStatus === 'connected' ? "outline" : "default"}
          size="sm"
          disabled={connectionStatus === 'connecting' || isChecking}
          className="flex items-center gap-1"
        >
          {isChecking && <RefreshCw className="h-3 w-3 animate-spin mr-1" />}
          {isChecking ? 'Test...' : 'Tester'}
        </Button>
      </div>
    </div>
  );
};

export default UrlInput;
