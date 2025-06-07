
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ConfigPanelProps {
  ollamaUrl: string;
  ollamaModel: string;
  availableModels: string[];
  onUrlChange: (url: string) => void;
  onModelChange: (model: string) => void;
  onTestConnection: () => void;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({
  ollamaUrl,
  ollamaModel,
  availableModels,
  onUrlChange,
  onModelChange,
  onTestConnection
}) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Configuration LLM</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-medium">URL Ollama</label>
            <Input
              value={ollamaUrl}
              onChange={(e) => onUrlChange(e.target.value)}
              placeholder="http://localhost:11434"
              className="h-8 text-xs"
            />
          </div>
          <div>
            <label className="text-xs font-medium">Modèle</label>
            <select 
              value={ollamaModel}
              onChange={(e) => onModelChange(e.target.value)}
              className="w-full p-1 border rounded text-xs h-8"
            >
              {availableModels.map(model => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
          </div>
        </div>
        <Button onClick={onTestConnection} size="sm">
          Tester la connexion
        </Button>
      </CardContent>
    </Card>
  );
};

export default ConfigPanel;
