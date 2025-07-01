
export interface ExecutionEnvironment {
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

export interface SecurityMetrics {
  threatLevel: string;
  activeThreats: number;
  quarantinedProcesses: number;
  securityScore: number;
}

export interface ExecutionSandboxProps {
  onExecute?: (code: string, environmentId: string) => Promise<any>;
  onQuarantine?: (environmentId: string) => void;
}
