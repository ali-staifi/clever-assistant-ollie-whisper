
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

export class SecureExecutionService {
  private workers: Map<string, Worker> = new Map();
  private executionCount: Map<string, number> = new Map();
  private errorCount: Map<string, number> = new Map();
  
  private securityPolicies: Record<string, SecurityPolicy> = {
    'sandbox': {
      allowedAPIs: ['console', 'Math', 'JSON', 'Array', 'Object', 'String', 'Number'],
      memoryLimit: 50,
      executionTimeout: 5000,
      allowNetworkAccess: false,
      allowFileAccess: false
    },
    'isolated': {
      allowedAPIs: ['console', 'Math', 'JSON'],
      memoryLimit: 25,
      executionTimeout: 3000,
      allowNetworkAccess: false,
      allowFileAccess: false
    },
    'monitored': {
      allowedAPIs: ['console', 'Math', 'JSON', 'Array', 'Object', 'String', 'Number', 'Date'],
      memoryLimit: 100,
      executionTimeout: 10000,
      allowNetworkAccess: true,
      allowFileAccess: false
    }
  };

  async executeCode(code: string, environmentType: string, environmentId: string): Promise<ExecutionResult> {
    const startTime = performance.now();
    const policy = this.securityPolicies[environmentType];
    
    if (!policy) {
      throw new Error(`Unknown environment type: ${environmentType}`);
    }

    // Increment execution count
    const currentCount = this.executionCount.get(environmentId) || 0;
    this.executionCount.set(environmentId, currentCount + 1);

    try {
      // Create secure execution context
      const secureCode = this.createSecureWrapper(code, policy);
      const result = await this.executeInWorker(secureCode, policy, environmentId);
      
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

  private createSecureWrapper(code: string, policy: SecurityPolicy): string {
    // Create a secure execution wrapper that restricts API access
    const allowedAPIsStr = policy.allowedAPIs.join(', ');
    
    return `
      (function() {
        'use strict';
        
        // Security restrictions
        const securityViolations = [];
        const startMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
        
        // Create restricted global context
        const restrictedGlobal = {
          ${policy.allowedAPIs.map(api => `${api}: typeof ${api} !== 'undefined' ? ${api} : undefined`).join(',\n          ')}
        };
        
        // Override dangerous functions
        const originalEval = eval;
        eval = function() {
          securityViolations.push('Attempted to use eval()');
          throw new Error('eval() is not allowed in secure environment');
        };
        
        const originalFunction = Function;
        Function = function() {
          securityViolations.push('Attempted to use Function constructor');
          throw new Error('Function constructor is not allowed');
        };
        
        // Execution wrapper
        try {
          const result = (function() {
            ${code}
          }).call(restrictedGlobal);
          
          const endMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
          const memoryUsed = Math.max(0, endMemory - startMemory);
          
          return {
            output: typeof result !== 'undefined' ? String(result) : 'Code executed successfully',
            memoryUsed: memoryUsed,
            securityViolations: securityViolations
          };
        } catch (error) {
          return {
            output: '',
            error: error.message,
            memoryUsed: 0,
            securityViolations: securityViolations
          };
        }
      })();
    `;
  }

  private async executeInWorker(code: string, policy: SecurityPolicy, environmentId: string): Promise<{output: string, memoryUsed: number, securityViolations: string[]}> {
    return new Promise((resolve, reject) => {
      // Create worker for isolated execution
      const workerCode = `
        self.onmessage = function(e) {
          const { code, timeout } = e.data;
          
          const timeoutId = setTimeout(() => {
            self.postMessage({ 
              error: 'Execution timeout exceeded',
              securityViolations: ['Execution timeout exceeded'] 
            });
          }, timeout);
          
          try {
            const result = eval(code);
            clearTimeout(timeoutId);
            self.postMessage(result);
          } catch (error) {
            clearTimeout(timeoutId);
            self.postMessage({ 
              error: error.message,
              securityViolations: ['Runtime error: ' + error.message] 
            });
          }
        };
      `;
      
      const blob = new Blob([workerCode], { type: 'application/javascript' });
      const worker = new Worker(URL.createObjectURL(blob));
      
      worker.onmessage = (e) => {
        const result = e.data;
        worker.terminate();
        URL.revokeObjectURL(blob);
        
        if (result.error) {
          reject(new Error(result.error));
        } else {
          resolve({
            output: result.output || 'Execution completed',
            memoryUsed: result.memoryUsed || 0,
            securityViolations: result.securityViolations || []
          });
        }
      };
      
      worker.onerror = (error) => {
        worker.terminate();
        URL.revokeObjectURL(blob);
        reject(new Error(`Worker error: ${error.message}`));
      };
      
      // Send code to worker
      worker.postMessage({
        code: code,
        timeout: policy.executionTimeout
      });
    });
  }

  getExecutionStats(environmentId: string) {
    const executions = this.executionCount.get(environmentId) || 0;
    const errors = this.errorCount.get(environmentId) || 0;
    const errorRate = executions > 0 ? (errors / executions) * 100 : 0;
    
    return {
      executions,
      errors,
      errorRate
    };
  }

  resetEnvironment(environmentId: string) {
    this.executionCount.set(environmentId, 0);
    this.errorCount.set(environmentId, 0);
    
    // Terminate any existing worker
    const worker = this.workers.get(environmentId);
    if (worker) {
      worker.terminate();
      this.workers.delete(environmentId);
    }
  }

  quarantineEnvironment(environmentId: string) {
    console.log(`Environment ${environmentId} has been quarantined`);
    
    // Terminate worker and reset stats
    const worker = this.workers.get(environmentId);
    if (worker) {
      worker.terminate();
      this.workers.delete(environmentId);
    }
  }
}
