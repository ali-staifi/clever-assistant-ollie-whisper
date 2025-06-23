
import { SecurityPolicy } from '../types/SecurityTypes';

export class WorkerExecutor {
  static async executeInWorker(
    code: string, 
    policy: SecurityPolicy, 
    environmentId: string
  ): Promise<{output: string, memoryUsed: number, securityViolations: string[]}> {
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
      const workerUrl = URL.createObjectURL(blob);
      const worker = new Worker(workerUrl);
      
      worker.onmessage = (e) => {
        const result = e.data;
        worker.terminate();
        URL.revokeObjectURL(workerUrl);
        
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
        URL.revokeObjectURL(workerUrl);
        reject(new Error(`Worker error: ${error.message}`));
      };
      
      // Send code to worker
      worker.postMessage({
        code: code,
        timeout: policy.executionTimeout
      });
    });
  }
}
