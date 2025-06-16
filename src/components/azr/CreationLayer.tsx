
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Brain, Code, Lightbulb, Play } from 'lucide-react';

interface Task {
  id: string;
  type: 'deduction' | 'abduction' | 'induction';
  description: string;
  code: string;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  timestamp: Date;
}

interface CreationLayerProps {
  onTaskGenerated: (task: Task) => void;
  isGenerating: boolean;
}

const CreationLayer: React.FC<CreationLayerProps> = ({ onTaskGenerated, isGenerating }) => {
  const [currentTask, setCurrentTask] = useState<string>('');

  const generateTask = (type: 'deduction' | 'abduction' | 'induction') => {
    const taskTemplates = {
      deduction: {
        description: "Dérivation logique: Si tous les humains sont mortels et Socrate est humain, alors...",
        code: `# Raisonnement déductif\ndef deductive_reasoning(premise1, premise2, subject):\n    if premise1 and subject in premise2:\n        return f"{subject} is mortal"\n    return "Cannot deduce"\n\nresult = deductive_reasoning(True, ["Socrate"], "Socrate")`
      },
      abduction: {
        description: "Inférence causale: L'herbe est mouillée, quelle pourrait être la cause ?",
        code: `# Raisonnement abductif\ndef abductive_reasoning(observation):\n    possible_causes = ["rain", "sprinkler", "dew"]\n    probabilities = {"rain": 0.6, "sprinkler": 0.3, "dew": 0.1}\n    return max(probabilities, key=probabilities.get)\n\nresult = abductive_reasoning("wet_grass")`
      },
      induction: {
        description: "Généralisation: Analyser des exemples pour établir une règle générale",
        code: `# Raisonnement inductif\ndef inductive_reasoning(examples):\n    pattern = sum(examples) / len(examples)\n    return f"Pattern detected: average = {pattern}"\n\nresult = inductive_reasoning([2, 4, 6, 8, 10])`
      }
    };

    const template = taskTemplates[type];
    const task: Task = {
      id: Date.now().toString(),
      type,
      description: template.description,
      code: template.code,
      status: 'pending',
      timestamp: new Date()
    };

    setCurrentTask(template.code);
    onTaskGenerated(task);
  };

  const typeColors = {
    deduction: 'bg-blue-100 text-blue-800',
    abduction: 'bg-green-100 text-green-800',
    induction: 'bg-purple-100 text-purple-800'
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Brain className="h-5 w-5 mr-2 text-purple-600" />
          Couche Création - Génération de Tâches
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          {(['deduction', 'abduction', 'induction'] as const).map((type) => (
            <Button
              key={type}
              onClick={() => generateTask(type)}
              disabled={isGenerating}
              variant="outline"
              size="sm"
              className="flex flex-col h-auto p-3"
            >
              <Code className="h-4 w-4 mb-1" />
              <span className="text-xs capitalize">{type}</span>
            </Button>
          ))}
        </div>

        {currentTask && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Tâche générée:</span>
            </div>
            <Textarea
              value={currentTask}
              onChange={(e) => setCurrentTask(e.target.value)}
              className="font-mono text-xs h-24"
              placeholder="Code généré automatiquement..."
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CreationLayer;
