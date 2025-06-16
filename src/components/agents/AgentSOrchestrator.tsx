
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Cpu, Zap, Database, Globe, Settings, Activity } from 'lucide-react';
import { useMemoryContext } from '@/hooks/useMemoryContext';

interface ExecutionEngine {
  id: string;
  name: string;
  type: 'subprocess' | 'pyexecjs' | 'webcontainer' | 'supabase' | 'netlify';
  status: 'active' | 'idle' | 'overloaded' | 'error';
  performance: number;
  taskCount: number;
  lastActivity: Date;
}

interface ResourceMetrics {
  cpuUsage: number;
  memoryUsage: number;
  networkLatency: number;
  taskQueue: number;
}

interface AgentSOrchestratorProps {
  onEngineSelect: (engineId: string) => void;
  onTaskDistribute: (task: any, engineId: string) => void;
}

const AgentSOrchestrator: React.FC<AgentSOrchestratorProps> = ({
  onEngineSelect,
  onTaskDistribute
}) => {
  const [engines, setEngines] = useState<ExecutionEngine[]>([
    {
      id: 'subprocess-1',
      name: 'Subprocess Engine',
      type: 'subprocess',
      status: 'active',
      performance: 85,
      taskCount: 3,
      lastActivity: new Date()
    },
    {
      id: 'pyexecjs-1',
      name: 'PyExecJS Engine',
      type: 'pyexecjs',
      status: 'idle',
      performance: 92,
      taskCount: 0,
      lastActivity: new Date(Date.now() - 300000)
    },
    {
      id: 'webcontainer-1',
      name: 'Web Container',
      type: 'webcontainer',
      status: 'active',
      performance: 78,
      taskCount: 2,
      lastActivity: new Date()
    }
  ]);

  const [resourceMetrics, setResourceMetrics] = useState<ResourceMetrics>({
    cpuUsage: 0,
    memoryUsage: 0,
    networkLatency: 0,
    taskQueue: 0
  });

  const [adaptiveMode, setAdaptiveMode] = useState(true);
  const memoryContext = useMemoryContext('AgentS-Orchestrator');

  useEffect(() => {
    // Simulation des métriques en temps réel
    const interval = setInterval(() => {
      setResourceMetrics({
        cpuUsage: Math.random() * 100,
        memoryUsage: Math.random() * 100,
        networkLatency: Math.random() * 200,
        taskQueue: Math.floor(Math.random() * 10)
      });

      // Mise à jour des performances des moteurs
      setEngines(prev => prev.map(engine => ({
        ...engine,
        performance: Math.max(50, Math.min(100, engine.performance + (Math.random() - 0.5) * 10)),
        status: engine.performance > 80 ? 'active' : engine.performance > 60 ? 'idle' : 'overloaded'
      })));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const optimizeEngineDistribution = async () => {
    // Algorithme d'optimisation adaptative
    const sortedEngines = [...engines].sort((a, b) => b.performance - a.performance);
    const bestEngine = sortedEngines[0];

    await memoryContext.addContextualMemory(
      `Agent S optimisation: Moteur ${bestEngine.name} sélectionné (performance: ${bestEngine.performance.toFixed(1)}%)`,
      'context',
      8,
      ['agents', 'optimization', 'performance']
    );

    onEngineSelect(bestEngine.id);
  };

  const handleAdaptiveModeToggle = async () => {
    setAdaptiveMode(!adaptiveMode);
    await memoryContext.addContextualMemory(
      `Agent S mode adaptatif ${!adaptiveMode ? 'activé' : 'désactivé'}`,
      'context',
      7,
      ['agents', 'configuration']
    );
  };

  const getEngineIcon = (type: ExecutionEngine['type']) => {
    switch (type) {
      case 'subprocess': return <Cpu className="h-4 w-4" />;
      case 'pyexecjs': return <Zap className="h-4 w-4" />;
      case 'webcontainer': return <Globe className="h-4 w-4" />;
      case 'supabase': return <Database className="h-4 w-4" />;
      case 'netlify': return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: ExecutionEngine['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'idle': return 'bg-blue-100 text-blue-800';
      case 'overloaded': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Settings className="h-5 w-5 mr-2 text-purple-600" />
          Agent S - Orchestrateur Multi-Moteurs
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Métriques de ressources */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>CPU</span>
              <span>{resourceMetrics.cpuUsage.toFixed(1)}%</span>
            </div>
            <Progress value={resourceMetrics.cpuUsage} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Mémoire</span>
              <span>{resourceMetrics.memoryUsage.toFixed(1)}%</span>
            </div>
            <Progress value={resourceMetrics.memoryUsage} className="h-2" />
          </div>
        </div>

        {/* Moteurs d'exécution */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Moteurs d'Exécution</span>
            <div className="flex gap-2">
              <Button
                onClick={handleAdaptiveModeToggle}
                size="sm"
                variant={adaptiveMode ? "default" : "outline"}
              >
                Mode Adaptatif
              </Button>
              <Button onClick={optimizeEngineDistribution} size="sm" variant="outline">
                Optimiser
              </Button>
            </div>
          </div>
          <ScrollArea className="h-48">
            <div className="space-y-2">
              {engines.map((engine) => (
                <div key={engine.id} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      {getEngineIcon(engine.type)}
                      <span className="text-sm font-medium">{engine.name}</span>
                      <Badge className={getStatusColor(engine.status)}>
                        {engine.status}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {engine.taskCount} tâches
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Performance</span>
                      <span>{engine.performance.toFixed(1)}%</span>
                    </div>
                    <Progress value={engine.performance} className="h-1" />
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center">
            <div className="font-medium">{resourceMetrics.networkLatency.toFixed(0)}ms</div>
            <div className="text-muted-foreground">Latence</div>
          </div>
          <div className="text-center">
            <div className="font-medium">{resourceMetrics.taskQueue}</div>
            <div className="text-muted-foreground">File d'attente</div>
          </div>
          <div className="text-center">
            <div className="font-medium">{engines.filter(e => e.status === 'active').length}</div>
            <div className="text-muted-foreground">Moteurs actifs</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentSOrchestrator;
