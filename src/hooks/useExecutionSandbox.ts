
import { useState, useEffect } from 'react';
import { SecureExecutionService } from '../services/security/SecureExecutionService';
import { ExecutionEnvironment, SecurityMetrics } from '../components/security/types/ExecutionSandboxTypes';
import { getInitialEnvironments } from '../components/security/utils/ExecutionSandboxUtils';

export const useExecutionSandbox = () => {
  const [executionService] = useState(() => new SecureExecutionService());
  const [testCode, setTestCode] = useState(`// Test JavaScript code
const numbers = [1, 2, 3, 4, 5];
const sum = numbers.reduce((a, b) => a + b, 0);
console.log('Sum:', sum);
return sum;`);
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>('sandbox-1');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<string>('');
  const [environments, setEnvironments] = useState<ExecutionEnvironment[]>(getInitialEnvironments());
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics>({
    threatLevel: 'low',
    activeThreats: 0,
    quarantinedProcesses: 0,
    securityScore: 95
  });

  useEffect(() => {
    const securityMonitor = setInterval(() => {
      setEnvironments(prev => prev.map(env => {
        const stats = executionService.getExecutionStats(env.id);
        const errorRate = stats.errorRate;
        
        let newStatus = env.status;
        let newSecurityLevel = env.securityLevel;
        
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

  const executeCode = async (onExecute?: (code: string, environmentId: string) => Promise<any>) => {
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
      
      if (onExecute) {
        await onExecute(testCode, selectedEnvironment);
      }
    } catch (error) {
      setExecutionResult(`💥 Erreur système: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const quarantineEnvironment = (environmentId: string, onQuarantine?: (environmentId: string) => void) => {
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

  return {
    testCode,
    setTestCode,
    selectedEnvironment,
    setSelectedEnvironment,
    isExecuting,
    executionResult,
    environments,
    securityMetrics,
    executeCode,
    quarantineEnvironment,
    restoreEnvironment
  };
};
