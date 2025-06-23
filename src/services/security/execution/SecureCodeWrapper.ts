
import { SecurityPolicy } from '../types/SecurityTypes';

export class SecureCodeWrapper {
  static createSecureWrapper(code: string, policy: SecurityPolicy): string {
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
}
