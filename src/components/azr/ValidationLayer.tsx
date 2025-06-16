
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, XCircle, Play, Clock } from 'lucide-react';

interface Task {
  id: string;
  type: 'deduction' | 'abduction' | 'induction';
  description: string;
  code: string;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  timestamp: Date;
}

interface ExecutionResult {
  taskId: string;
  success: boolean;
  output: string;
  learnabilityReward: number;
  accuracyReward: number;
  executionTime: number;
}

interface ValidationLayerProps {
  tasks: Task[];
  onTaskExecuted: (result: ExecutionResult) => void;
  onTaskStatusUpdate: (taskId: string, status: Task['status']) => void;
}

const ValidationLayer: React.FC<ValidationLayerProps> = ({ 
  tasks, 
  onTaskExecuted, 
  onTaskStatusUpdate 
}) => {
  const [executionResults, setExecutionResults] = useState<ExecutionResult[]>([]);

  const simulatePythonExecution = async (task: Task): Promise<ExecutionResult> => {
    onTaskStatusUpdate(task.id, 'executing');
    
    // Simulation d'exécution Python
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    const success = Math.random() > 0.3; // 70% de chance de succès
    const executionTime = Math.random() * 500 + 100;
    
    let output = '';
    let learnabilityReward = 0;
    let accuracyReward = 0;
    
    if (success) {
      const outputs = {
        deduction: "Socrate is mortal",
        abduction: "rain",
        induction: "Pattern detected: average = 6.0"
      };
      output = outputs[task.type];
      learnabilityReward = Math.random() * 5 + 5; // 5-10
      accuracyReward = Math.random() * 5 + 7; // 7-12
      onTaskStatusUpdate(task.id, 'completed');
    } else {
      output = `Error: ${['NameError', 'TypeError', 'ValueError'][Math.floor(Math.random() * 3)]}`;
      learnabilityReward = Math.random() * 3 + 1; // 1-4
      accuracyReward = 0;
      onTaskStatusUpdate(task.id, 'failed');
    }
    
    const result: ExecutionResult = {
      taskId: task.id,
      success,
      output,
      learnabilityReward,
      accuracyReward,
      executionTime
    };
    
    return result;
  };

  const executeTask = async (task: Task) => {
    const result = await simulatePythonExecution(task);
    setExecutionResults(prev => [...prev, result]);
    onTaskExecuted(result);
  };

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-gray-500" />;
      case 'executing': return <Play className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'executing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Play className="h-5 w-5 mr-2 text-green-600" />
          Couche Validation - Exécution Python
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          <div className="space-y-2">
            {tasks.map((task) => {
              const result = executionResults.find(r => r.taskId === task.id);
              return (
                <div key={task.id} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(task.status)}
                      <Badge className={getStatusColor(task.status)}>
                        {task.type}
                      </Badge>
                    </div>
                    {task.status === 'pending' && (
                      <Button 
                        onClick={() => executeTask(task)}
                        size="sm"
                        variant="outline"
                      >
                        Exécuter
                      </Button>
                    )}
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-2">{task.description}</p>
                  
                  {result && (
                    <div className="bg-muted/50 rounded p-2 text-xs">
                      <div className="font-mono mb-1">Output: {result.output}</div>
                      <div className="flex gap-4 text-xs">
                        <span>Learnability: {result.learnabilityReward.toFixed(1)}</span>
                        <span>Accuracy: {result.accuracyReward.toFixed(1)}</span>
                        <span>Time: {result.executionTime.toFixed(0)}ms</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            
            {tasks.length === 0 && (
              <div className="text-center text-muted-foreground py-4 text-sm">
                Aucune tâche à valider
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ValidationLayer;
