
export interface ExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  executionTime: number;
  memoryUsed: number;
  securityViolations: string[];
}

export interface SecurityPolicy {
  allowedAPIs: string[];
  memoryLimit: number; // in MB
  executionTimeout: number; // in ms
  allowNetworkAccess: boolean;
  allowFileAccess: boolean;
}

export interface ExecutionStats {
  executions: number;
  errors: number;
  errorRate: number;
}
