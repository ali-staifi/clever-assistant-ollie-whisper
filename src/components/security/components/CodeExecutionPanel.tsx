
import React from 'react';
import { Code, Play } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ExecutionEnvironment } from '../types/ExecutionSandboxTypes';

interface CodeExecutionPanelProps {
  testCode: string;
  setTestCode: (code: string) => void;
  selectedEnvironment: string;
  setSelectedEnvironment: (id: string) => void;
  environments: ExecutionEnvironment[];
  isExecuting: boolean;
  executionResult: string;
  onExecuteCode: () => void;
}

export const CodeExecutionPanel: React.FC<CodeExecutionPanelProps> = ({
  testCode,
  setTestCode,
  selectedEnvironment,
  setSelectedEnvironment,
  environments,
  isExecuting,
  executionResult,
  onExecuteCode
}) => {
  return (
    <div className="p-4 bg-muted/50 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <Code className="h-4 w-4 text-blue-500" />
        <span className="font-medium">Test d'Exécution Sécurisée</span>
      </div>
      
      <div className="space-y-2">
        <select 
          value={selectedEnvironment}
          onChange={(e) => setSelectedEnvironment(e.target.value)}
          className="px-3 py-2 border rounded w-full"
        >
          {environments.map(env => (
            <option key={env.id} value={env.id} disabled={env.status === 'quarantined'}>
              {env.name} ({env.type}) {env.status === 'quarantined' ? '- QUARANTAINE' : ''}
            </option>
          ))}
        </select>
        
        <Textarea
          value={testCode}
          onChange={(e) => setTestCode(e.target.value)}
          placeholder="Entrez votre code JavaScript à tester..."
          className="min-h-[100px] font-mono text-sm"
        />
        
        <div className="flex gap-2">
          <Button 
            onClick={onExecuteCode}
            disabled={isExecuting || !testCode.trim()}
            size="sm"
          >
            <Play className="h-4 w-4 mr-1" />
            {isExecuting ? 'Exécution...' : 'Exécuter Code'}
          </Button>
        </div>
        
        {executionResult && (
          <div className="p-3 bg-gray-100 rounded border font-mono text-sm whitespace-pre-wrap">
            {executionResult}
          </div>
        )}
      </div>
    </div>
  );
};
