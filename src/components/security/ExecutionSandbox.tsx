
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Shield, Lock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface ExecutionEnvironment {
  id: string;
  name: string;
  type: 'sandbox' | 'isolated' | 'monitored';
  status: 'active' | 'idle' | 'quarantined' | 'error';
  memoryUsage: number;
  cpuUsage: number;
  securityLevel: number;
  executionCount: number;
  errorCount: number;
  lastActivity: Date;
}

interface ExecutionSandboxProps {
  onExecute: (code: string, environmentId: string) => Promise<any>;
  onQuarantine: (environmentId: string) => void;
}

const ExecutionSandbox: React.FC<ExecutionSandboxProps> = ({
  onExecute,
  onQuarantine
}) => {
  const [environments, setEnvironments] = useState<ExecutionEnvironment[]>([
    {
      id: 'sandbox-1',
      name: 'Sandbox Principal',
      type: 'sandbox',
      status: 'active',
      memoryUsage: 25,
      cpuUsage: 15,
      securityLevel: 95,
      executionCount: 0,
      errorCount: 0,
      lastActivity: new Date()
    },
    {
      id: 'isolated-1',
      name: 'Environnement Isolé',
      type: 'isolated',
      status: 'idle',
      memoryUsage: 10,
      cpuUsage: 5,
      securityLevel: 99,
      executionCount: 0,
      errorCount: 0,
      lastActivity: new Date()
    },
    {
      id: 'monitored-1',
      name: 'Zone Surveillée',
      type: 'monitored',
      status: 'idle',
      memoryUsage: 35,
      cpuUsage: 20,
      securityLevel: 85,
      executionCount: 0,
      errorCount: 0,
      lastActivity: new Date()
    }
  ]);

  const [securityMetrics, setSecurityMetrics] = useState({
    threatLevel: 'low',
    activeThreats: 0,
    quarantinedProcesses: 0,
    securityScore: 95
  });

  useEffect(() => {
    // Surveillance continue des environnements
    const securityMonitor = setInterval(() => {
      setEnvironments(prev => prev.map(env => {
        // Simulation de métriques de sécurité
        const errorRate = env.executionCount > 0 ? env.errorCount / env.executionCount : 0;
        
        let newStatus = env.status;
        let newSecurityLevel = env.securityLevel;
        
        // Détection automatique de menaces
        if (errorRate > 0.3) {
          newStatus = 'quarantined';
          newSecurityLevel = Math.max(50, env.securityLevel - 20);
        } else if (errorRate > 0.1) {
          newSecurityLevel = Math.max(70, env.securityLevel - 10);
        }

        return {
          ...env,
          status: newStatus,
          securityLevel: newSecurityLevel,
          memoryUsage: Math.max(5, env.memoryUsage + (Math.random() - 0.5) * 10),
          cpuUsage: Math.max(1, env.cpuUsage + (Math.random() - 0.5) * 15)
        };
      }));

      // Mise à jour des métriques globales
      const quarantinedCount = environments.filter(e => e.status === 'quarantined').length;
      const avgSecurity = environments.reduce((sum, e) => sum + e.securityLevel, 0) / environments.length;
      
      setSecurityMetrics({
        threatLevel: quarantinedCount > 1 ? 'high' : quarantinedCount > 0 ? 'medium' : 'low',
        activeThreats: quarantinedCount,
        quarantinedProcesses: quarantinedCount,
        securityScore: Math.round(avgSecurity)
      });
    }, 3000);

    return () => clearInterval(securityMonitor);
  }, [environments]);

  const executeInSandbox = async (environmentId: string, code: string) => {
    const env = environments.find(e => e.id === environmentId);
    if (!env || env.status === 'quarantined') {
      throw new Error('Environnement non disponible ou en quarantaine');
    }

    // Mise à jour des compteurs d'exécution
    setEnvironments(prev => prev.map(e => 
      e.id === environmentId 
        ? { ...e, executionCount: e.executionCount + 1, lastActivity: new Date() }
        : e
    ));

    try {
      const result = await onExecute(code, environmentId);
      return result;
    } catch (error) {
      // Comptage des erreurs pour surveillance
      setEnvironments(prev => prev.map(e => 
        e.id === environmentId 
          ? { ...e, errorCount: e.errorCount + 1 }
          : e
      ));
      throw error;
    }
  };

  const quarantineEnvironment = (environmentId: string) => {
    setEnvironments(prev => prev.map(e => 
      e.id === environmentId 
        ? { ...e, status: 'quarantined' as const }
        : e
    ));
    onQuarantine(environmentId);
  };

  const restoreEnvironment = (environmentId: string) => {
    setEnvironments(prev => prev.map(e => 
      e.id === environmentId 
        ? { 
            ...e, 
            status: 'idle' as const, 
            errorCount: 0, 
            securityLevel: e.type === 'isolated' ? 99 : e.type === 'sandbox' ? 95 : 85 
          }
        : e
    ));
  };

  const getStatusIcon = (status: ExecutionEnvironment['status']) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'idle': return <Shield className="h-4 w-4 text-blue-500" />;
      case 'quarantined': return <Lock className="h-4 w-4 text-red-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getTypeColor = (type: ExecutionEnvironment['type']) => {
    switch (type) {
      case 'sandbox': return 'bg-blue-100 text-blue-800';
      case 'isolated': return 'bg-green-100 text-green-800';
      case 'monitored': return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Shield className="h-5 w-5 mr-2 text-green-600" />
          Environnements d'Exécution Sécurisés
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Métriques de sécurité globales */}
        <div className="grid grid-cols-2 gap-3 p-3 bg-muted/50 rounded-lg">
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Score Sécurité</span>
              <span className="font-medium">{securityMetrics.securityScore}%</span>
            </div>
            <Progress value={securityMetrics.securityScore} className="h-2" />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Niveau Menace</span>
              <span className={`font-medium ${getThreatLevelColor(securityMetrics.threatLevel)}`}>
                {securityMetrics.threatLevel.toUpperCase()}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              {securityMetrics.activeThreats} menace(s) active(s)
            </div>
          </div>
        </div>

        {/* Environnements d'exécution */}
        <ScrollArea className="h-64">
          <div className="space-y-3">
            {environments.map((env) => (
              <div key={env.id} className="p-3 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(env.status)}
                    <span className="text-sm font-medium">{env.name}</span>
                    <Badge className={getTypeColor(env.type)}>
                      {env.type}
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    {env.status === 'quarantined' ? (
                      <Button 
                        onClick={() => restoreEnvironment(env.id)}
                        size="sm"
                        variant="outline"
                      >
                        Restaurer
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => quarantineEnvironment(env.id)}
                        size="sm"
                        variant="destructive"
                      >
                        Quarantaine
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <div className="flex justify-between">
                      <span>Mémoire</span>
                      <span>{env.memoryUsage.toFixed(0)}%</span>
                    </div>
                    <Progress value={env.memoryUsage} className="h-1 mt-1" />
                  </div>
                  <div>
                    <div className="flex justify-between">
                      <span>CPU</span>
                      <span>{env.cpuUsage.toFixed(0)}%</span>
                    </div>
                    <Progress value={env.cpuUsage} className="h-1 mt-1" />
                  </div>
                  <div>
                    <div className="flex justify-between">
                      <span>Sécurité</span>
                      <span>{env.securityLevel.toFixed(0)}%</span>
                    </div>
                    <Progress value={env.securityLevel} className="h-1 mt-1" />
                  </div>
                </div>

                <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                  <span>Exécutions: {env.executionCount}</span>
                  <span>Erreurs: {env.errorCount}</span>
                  <span>Taux erreur: {env.executionCount > 0 ? ((env.errorCount / env.executionCount) * 100).toFixed(1) : 0}%</span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Actions de sécurité */}
        <div className="flex justify-between items-center pt-2 border-t">
          <div className="text-sm">
            <AlertTriangle className="h-4 w-4 inline mr-1 text-yellow-500" />
            Surveillance automatique active
          </div>
          <div className="text-xs text-muted-foreground">
            Dernière vérification: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExecutionSandbox;
