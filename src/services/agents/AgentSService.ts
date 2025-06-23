
export interface AgentEngine {
  id: string;
  name: string;
  type: 'ollama' | 'openai' | 'anthropic' | 'local';
  status: 'online' | 'offline' | 'busy';
  performance: number;
  specialization: string[];
  maxConcurrency: number;
  currentLoad: number;
}

export interface TaskDistribution {
  taskId: string;
  engineId: string;
  priority: number;
  estimatedTime: number;
  status: 'queued' | 'running' | 'completed' | 'failed';
}

export class AgentSService {
  private engines: Map<string, AgentEngine> = new Map();
  private taskQueue: TaskDistribution[] = [];
  private runningTasks: Map<string, TaskDistribution> = new Map();

  constructor() {
    this.initializeEngines();
  }

  private initializeEngines() {
    const defaultEngines: AgentEngine[] = [
      {
        id: 'ollama-gemma',
        name: 'Ollama Gemma 7B',
        type: 'ollama',
        status: 'online',
        performance: 85,
        specialization: ['reasoning', 'analysis'],
        maxConcurrency: 3,
        currentLoad: 0
      },
      {
        id: 'ollama-llama',
        name: 'Ollama Llama 3.2',
        type: 'ollama',
        status: 'online',
        performance: 90,
        specialization: ['coding', 'problem-solving'],
        maxConcurrency: 2,
        currentLoad: 0
      },
      {
        id: 'local-processor',
        name: 'Local Processing Unit',
        type: 'local',
        status: 'online',
        performance: 95,
        specialization: ['fast-execution', 'lightweight-tasks'],
        maxConcurrency: 5,
        currentLoad: 0
      }
    ];

    defaultEngines.forEach(engine => {
      this.engines.set(engine.id, engine);
    });
  }

  getAvailableEngines(): AgentEngine[] {
    return Array.from(this.engines.values()).filter(engine => engine.status === 'online');
  }

  getBestEngineForTask(taskType: string, complexity: number): string | null {
    const availableEngines = this.getAvailableEngines()
      .filter(engine => engine.currentLoad < engine.maxConcurrency)
      .sort((a, b) => {
        // Score based on specialization match and performance
        const aScore = (a.specialization.includes(taskType) ? 20 : 0) + a.performance - (a.currentLoad * 10);
        const bScore = (b.specialization.includes(taskType) ? 20 : 0) + b.performance - (b.currentLoad * 10);
        return bScore - aScore;
      });

    return availableEngines.length > 0 ? availableEngines[0].id : null;
  }

  async distributeTask(task: any, engineId?: string): Promise<boolean> {
    const targetEngineId = engineId || this.getBestEngineForTask(task.type, task.complexity || 1);
    
    if (!targetEngineId) {
      console.error('No available engine for task distribution');
      return false;
    }

    const engine = this.engines.get(targetEngineId);
    if (!engine || engine.currentLoad >= engine.maxConcurrency) {
      return false;
    }

    const taskDistribution: TaskDistribution = {
      taskId: task.id,
      engineId: targetEngineId,
      priority: task.priority || 1,
      estimatedTime: this.estimateTaskTime(task),
      status: 'queued'
    };

    this.taskQueue.push(taskDistribution);
    engine.currentLoad++;
    
    // Simulate task processing
    setTimeout(() => {
      this.processTask(taskDistribution);
    }, 100);

    return true;
  }

  private estimateTaskTime(task: any): number {
    // Estimate based on task complexity
    const baseTime = 1000; // 1 second base
    const complexityMultiplier = task.complexity || 1;
    return baseTime * complexityMultiplier;
  }

  private async processTask(taskDistribution: TaskDistribution) {
    taskDistribution.status = 'running';
    this.runningTasks.set(taskDistribution.taskId, taskDistribution);

    // Simulate task execution
    const executionTime = taskDistribution.estimatedTime + (Math.random() * 500);
    
    setTimeout(() => {
      taskDistribution.status = Math.random() > 0.1 ? 'completed' : 'failed';
      
      const engine = this.engines.get(taskDistribution.engineId);
      if (engine) {
        engine.currentLoad = Math.max(0, engine.currentLoad - 1);
      }
      
      this.runningTasks.delete(taskDistribution.taskId);
      console.log(`Task ${taskDistribution.taskId} ${taskDistribution.status} on engine ${taskDistribution.engineId}`);
    }, Math.max(executionTime, 500));
  }

  getSystemStats() {
    const engines = Array.from(this.engines.values());
    const totalEngines = engines.length;
    const onlineEngines = engines.filter(e => e.status === 'online').length;
    const busyEngines = engines.filter(e => e.currentLoad > 0).length;
    const queuedTasks = this.taskQueue.filter(t => t.status === 'queued').length;
    const runningTasks = this.runningTasks.size;

    return {
      totalEngines,
      onlineEngines,
      busyEngines,
      queuedTasks,
      runningTasks,
      systemLoad: engines.reduce((sum, e) => sum + (e.currentLoad / e.maxConcurrency), 0) / totalEngines
    };
  }
}
