
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Cpu, Activity, Zap, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { AgentSService, AgentEngine } from '../../services/agents/AgentSService';

interface AgentSOrchestratorProps {
  onEngineSelect?: (engineId: string) => void;
  onTaskDistribute?: (task: any, engineId: string) => void;
}

const AgentSOrchestrator: React.FC<AgentSOrchestratorProps> = ({
  onEngineSelect,
  onTaskDistribute
}) => {
  const [agentService] = useState(() => new AgentSService());
  const [engines, setEngines] = useState<AgentEngine[]>([]);
  const [selectedEngine, setSelectedEngine] = useState<string>('');
  const [systemStats, setSystemStats] = useState({
    totalEngines: 0,
    onlineEngines: 0,
    busyEngines: 0,
    queuedTasks: 0,
    runningTasks: 0,
    systemLoad: 0
  });

  useEffect(() => {
    // Initialize and update engines
    const updateEngines = () => {
      const availableEngines = agentService.getAvailableEngines();
      setEngines(availableEngines);
      
      const stats = agentService.getSystemStats();
      setSystemStats(stats);
    };

    updateEngines();
    const interval = setInterval(updateEngines, 2000);
    return () => clearInterval(interval);
  }, [agentService]);

  const handleEngineSelect = (engineId: string) => {
    setSelectedEngine(engineId);
    if (onEngineSelect) {
      onEngineSelect(engineId);
    }
  };

  const handleTaskDistribute = async (taskType: string) => {
    const mockTask = {
      id: Date.now().toString(),
      type: taskType,
      description: `Task: ${taskType}`,
      complexity: Math.ceil(Math.random() * 3),
      priority: Math.ceil(Math.random() * 5)
    };

    const success = await agentService.distributeTask(mockTask, selectedEngine || undefined);
    
    if (success && onTaskDistribute) {
      onTaskDistribute(mockTask, selectedEngine || 'auto-selected');
    }
  };

  const getEngineStatusIcon = (status: AgentEngine['status']) => {
    switch (status) {
      case 'online': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'busy': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'offline': return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getLoadColor = (load: number, maxConcurrency: number) => {
    const percentage = (load / maxConcurrency) * 100;
    if (percentage < 50) return 'text-green-600';
    if (percentage < 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <Cpu className="h-5 w-5 mr-2 text-blue-600" />
          Agent S - Orchestrateur Multi-Moteurs (Fonctionnel)
        </CardTitle>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-2">
          <div className="text-center p-2 bg-muted/50 rounded">
            <div className="text-lg font-bold text-blue-600">{systemStats.onlineEngines}</div>
            <div className="text-xs text-muted-foreground">Moteurs En Ligne</div>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded">
            <div className="text-lg font-bold text-green-600">{systemStats.runningTasks}</div>
            <div className="text-xs text-muted-foreground">Tâches Actives</div>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded">
            <div className="text-lg font-bold text-yellow-600">{systemStats.queuedTasks}</div>
            <div className="text-xs text-muted-foreground">File d'Attente</div>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded">
            <div className="text-lg font-bold text-purple-600">{(systemStats.systemLoad * 100).toFixed(0)}%</div>
            <div className="text-xs text-muted-foreground">Charge Système</div>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded">
            <div className="text-lg font-bold text-cyan-600">{systemStats.busyEngines}</div>
            <div className="text-xs text-muted-foreground">Moteurs Occupés</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Engine Selection */}
        <div className="space-y-3">
          <h3 className="font-medium flex items-center">
            <Activity className="h-4 w-4 mr-2" />
            Moteurs Disponibles
          </h3>
          <ScrollArea className="h-48">
            <div className="space-y-2">
              {engines.map((engine) => (
                <div
                  key={engine.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedEngine === engine.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => handleEngineSelect(engine.id)}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      {getEngineStatusIcon(engine.status)}
                      <span className="font-medium text-sm">{engine.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {engine.type}
                      </Badge>
                    </div>
                    <div className={`text-xs font-medium ${getLoadColor(engine.currentLoad, engine.maxConcurrency)}`}>
                      {engine.currentLoad}/{engine.maxConcurrency}
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Performance</span>
                      <span>{engine.performance}%</span>
                    </div>
                    <Progress value={engine.performance} className="h-1" />
                    
                    <div className="flex justify-between text-xs">
                      <span>Charge</span>
                      <span>{Math.round((engine.currentLoad / engine.maxConcurrency) * 100)}%</span>
                    </div>
                    <Progress value={(engine.currentLoad / engine.maxConcurrency) * 100} className="h-1" />
                    
                    <div className="text-xs text-muted-foreground mt-1">
                      Spécialisations: {engine.specialization.join(', ')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Task Distribution */}
        <div className="space-y-3">
          <h3 className="font-medium flex items-center">
            <Zap className="h-4 w-4 mr-2" />
            Distribution de Tâches
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => handleTaskDistribute('reasoning')}
              size="sm"
              variant="outline"
              disabled={engines.length === 0}
            >
              Tâche Raisonnement
            </Button>
            <Button
              onClick={() => handleTaskDistribute('analysis')}
              size="sm"
              variant="outline"
              disabled={engines.length === 0}
            >
              Tâche Analyse
            </Button>
            <Button
              onClick={() => handleTaskDistribute('coding')}
              size="sm"
              variant="outline"
              disabled={engines.length === 0}
            >
              Tâche Codage
            </Button>
            <Button
              onClick={() => handleTaskDistribute('optimization')}
              size="sm"
              variant="outline"
              disabled={engines.length === 0}
            >
              Optimisation
            </Button>
          </div>
        </div>

        {/* Status */}
        <div className="text-xs text-muted-foreground border-t pt-3">
          Moteur sélectionné: {selectedEngine || 'Auto-sélection'} • 
          Dernière mise à jour: {new Date().toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentSOrchestrator;
