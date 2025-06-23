
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Shield, Lock, AlertTriangle, CheckCircle, XCircle, Play, Code } from 'lucide-react';
import { SecureExecutionService } from '../../services/security/SecureExecutionService';

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
  onExecute?: (code: string, environmentId: string) => Promise<any>;
  onQuarantine?: (environmentId: string) => void;
}

const ExecutionSandbox: React.FC<ExecutionSandboxProps> = ({
  onExecute,
  onQuarantine
}) => {
  const [executionService] = useState(() => new SecureExecutionService());
  const [testCode, setTestCode] = useState(`// Test JavaScript code
const numbers = [1, 2, 3, 4, 5];
const sum = numbers.reduce((a, b) => a + b, 0);
console.log('Sum:', sum);
return sum;`);
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>('sandbox-1');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<string>('');

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
        const stats = executionService.getExecutionStats(env.id);
        const errorRate = stats.errorRate;
        
        let newStatus = env.status;
        let newSecurityLevel = env.securityLevel;
        
        // Détection automatique de menaces basée sur les vraies métriques
        if (errorRate > 30) {
          newStatus = 'quarantined';
          newSecurityLevel = Math.max(50, env.securityLevel - 20);
        } else if (errorRate > 10) {
          newSecurityLevel = Math.max(70, env.securityLevel - 10);
        }

        return {
          ...env,
          status: newStatus,
          securityLevel: newSecurityLevel,
          executionCount: stats.executions,
          errorCount: stats.errors,
          memoryUsage: Math.max(5, env.memoryUsage + (Math.random() - 0.5) * 5),
          cpuUsage: Math.max(1, env.cpuUsage + (Math.random() - 0.5) * 10),
          lastActivity: stats.executions > env.executionCount ? new Date() : env.lastActivity
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
  }, [executionService, environments]);

  const executeCode = async () => {
    if (!testCode.trim() || isExecuting) return;
    
    const env = environments.find(e => e.id === selectedEnvironment);
    if (!env || env.status === 'quarantined') {
      setExecutionResult('❌ Environnement non disponible ou en quarantaine');
      return;
    }

    setIsExecuting(true);
    setExecutionResult('🔄 Exécution en cours...');

    try {
      const result = await executionService.executeCode(testCode, env.type, env.id);
      
      if (result.success) {
        setExecutionResult(`✅ Succès:\n${result.output}\n\n📊 Métriques:\n- Temps: ${result.executionTime.toFixed(2)}ms\n- Mémoire: ${result.memoryUsed} bytes\n- Violations: ${result.securityViolations.length}`);
      } else {
        setExecutionResult(`❌ Erreur:\n${result.error}\n\n📊 Métriques:\n- Temps: ${result.executionTime.toFixed(2)}ms`);
      }
      
      // Call external handler if provided
      if (onExecute) {
        await onExecute(testCode, selectedEnvironment);
      }
    } catch (error) {
      setExecutionResult(`💥 Erreur système: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const quarantineEnvironment = (environmentId: string) => {
    executionService.quarantineEnvironment(environmentId);
    setEnvironments(prev => prev.map(e => 
      e.id === environmentId 
        ? { ...e, status: 'quarantined' as const }
        : e
    ));
    if (onQuarantine) {
      onQuarantine(environmentId);
    }
  };

  const restoreEnvironment = (environmentId: string) => {
    executionService.resetEnvironment(environmentId);
    setEnvironments(prev => prev.map(e => 
      e.id === environmentId 
        ? { 
            ...e, 
            status: 'idle' as const, 
            errorCount: 0, 
            executionCount: 0,
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
          Environnements d'Exécution Sécurisés - Fonctionnel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Code execution interface */}
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
                onClick={executeCode}
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
            <AlertTriangle className="h-4 w-4 inline mr-1 text-green-500" />
            Surveillance active - Exécution réelle
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
