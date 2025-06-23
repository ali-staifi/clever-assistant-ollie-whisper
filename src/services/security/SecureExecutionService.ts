
import { ExecutionResult, SecurityPolicy, ExecutionStats } from './types/SecurityTypes';
import { SECURITY_POLICIES } from './policies/SecurityPolicies';
import { SecureCodeWrapper } from './execution/SecureCodeWrapper';
import { WorkerExecutor } from './execution/WorkerExecutor';

export class SecureExecutionService {
  private workers: Map<string, Worker> = new Map();
  private executionCount: Map<string, number> = new Map();
  private errorCount: Map<string, number> = new Map();

  async executeCode(code: string, environmentType: string, environmentId: string): Promise<ExecutionResult> {
    const startTime = performance.now();
    const policy = SECURITY_POLICIES[environmentType];
    
    if (!policy) {
      throw new Error(`Unknown environment type: ${environmentType}`);
    }

    // Increment execution count
    const currentCount = this.executionCount.get(environmentId) || 0;
    this.executionCount.set(environmentId, currentCount + 1);

    try {
      // Create secure execution context
      const secureCode = SecureCodeWrapper.createSecureWrapper(code, policy);
      const result = await WorkerExecutor.executeInWorker(secureCode, policy, environmentId);
      
      const executionTime = performance.now() - startTime;
      
      return {
        success: true,
        output: result.output,
        executionTime,
        memoryUsed: result.memoryUsed,
        securityViolations: result.securityViolations
      };
    } catch (error) {
      // Increment error count
      const currentErrors = this.errorCount.get(environmentId) || 0;
      this.errorCount.set(environmentId, currentErrors + 1);
      
      const executionTime = performance.now() - startTime;
      
      return {
        success: false,
        output: '',
        error: error instanceof Error ? error.message : 'Unknown execution error',
        executionTime,
        memoryUsed: 0,
        securityViolations: []
      };
    }
  }

  getExecutionStats(environmentId: string): ExecutionStats {
    const executions = this.executionCount.get(environmentId) || 0;
    const errors = this.errorCount.get(environmentId) || 0;
    const errorRate = executions > 0 ? (errors / executions) * 100 : 0;
    
    return {
      executions,
      errors,
      errorRate
    };
  }

  resetEnvironment(environmentId: string): void {
    this.executionCount.set(environmentId, 0);
    this.errorCount.set(environmentId, 0);
    
    // Terminate any existing worker
    const worker = this.workers.get(environmentId);
    if (worker) {
      worker.terminate();
      this.workers.delete(environmentId);
    }
  }

  quarantineEnvironment(environmentId: string): void {
    console.log(`Environment ${environmentId} has been quarantined`);
    
    // Terminate worker and reset stats
    const worker = this.workers.get(environmentId);
    if (worker) {
      worker.terminate();
      this.workers.delete(environmentId);
    }
  }
}

// Re-export types for backward compatibility
export type { ExecutionResult, SecurityPolicy, ExecutionStats };
