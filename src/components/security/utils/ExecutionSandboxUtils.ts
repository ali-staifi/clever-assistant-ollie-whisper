
import { ExecutionEnvironment } from '../types/ExecutionSandboxTypes';
import { CheckCircle, Shield, Lock, XCircle } from 'lucide-react';

export const getStatusIcon = (status: ExecutionEnvironment['status']) => {
  switch (status) {
    case 'active': return CheckCircle;
    case 'idle': return Shield;
    case 'quarantined': return Lock;
    case 'error': return XCircle;
  }
};

export const getTypeColor = (type: ExecutionEnvironment['type']) => {
  switch (type) {
    case 'sandbox': return 'bg-blue-100 text-blue-800';
    case 'isolated': return 'bg-green-100 text-green-800';
    case 'monitored': return 'bg-yellow-100 text-yellow-800';
  }
};

export const getThreatLevelColor = (level: string) => {
  switch (level) {
    case 'low': return 'text-green-600';
    case 'medium': return 'text-yellow-600';
    case 'high': return 'text-red-600';
    default: return 'text-gray-600';
  }
};

export const getInitialEnvironments = (): ExecutionEnvironment[] => [
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
];
