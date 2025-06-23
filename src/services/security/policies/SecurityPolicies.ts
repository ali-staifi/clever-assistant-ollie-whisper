
import { SecurityPolicy } from '../types/SecurityTypes';

export const SECURITY_POLICIES: Record<string, SecurityPolicy> = {
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
