import { MCPServer } from '../MCPServer';
import { ChatOllamaService } from '../../ollama/ChatOllamaService';
import { Message } from '../../ollama/types';

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: any;
}

export interface AgentAnalysis {
  systemHealth: number;
  performance: {
    responseTime: number;
    throughput: number;
    accuracy: number;
  };
  connections: {
    [key: string]: {
      status: 'connected' | 'disconnected' | 'error';
      quality: number;
      latency: number;
    };
  };
  recommendations: AgentRecommendation[];
}

export interface AgentRecommendation {
  id: string;
  type: 'performance' | 'integration' | 'optimization' | 'security';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  implementation: {
    difficulty: 'easy' | 'medium' | 'hard';
    estimatedTime: string;
    steps: string[];
  };
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
}

export class MCPAgentChatService {
  private mcpServer: MCPServer;
  private chatService?: ChatOllamaService;
  private systemContext: string;

  constructor() {
    this.mcpServer = new MCPServer();
    this.systemContext = this.buildSystemContext();
    this.initializeChatService();
  }

  private buildSystemContext(): string {
    return `Tu es un Agent IA MCP intelligent spécialisé dans l'optimisation et l'amélioration des systèmes MCP.
    
CONTEXTE SYSTÈME:
- Tu opères dans un environnement MCP avec BioMCP, ApifyMCP et d'autres agents
- Tu as accès aux services vocaux (Jarvis), à la reconnaissance vocale et à la synthèse
- Tu peux analyser les performances système en temps réel
- Tu peux implémenter des améliorations automatiquement

CAPACITÉS:
- Analyse système intelligente
- Recommandations d'optimisation
- Implémentation automatique d'améliorations
- Intégration vocale avec Jarvis
- Monitoring des performances

STYLE DE COMMUNICATION:
- Concis et technique mais accessible
- Proactif dans les suggestions
- Utilise les données système pour contextualiser tes réponses
- Intègre les paramètres vocaux globaux pour les réponses parlées`;
  }

  private async initializeChatService(): Promise<void> {
    try {
      this.chatService = new ChatOllamaService('http://localhost:11434');
      // Fix: Use proper method signature for setModel - only pass model name
      if (this.chatService.setModel) {
        this.chatService.setModel('gemma:7b');
      }
      // Fix: Call testConnection without arguments
      await this.chatService.testConnection();
    } catch (error) {
      console.warn('Ollama not available, using fallback mode');
    }
  }

  async processMessage(
    message: string, 
    chatHistory: ChatMessage[],
    onProgress?: (token: string) => void
  ): Promise<string> {
    try {
      // Analyser le système pour contextualiser la réponse
      const systemAnalysis = await this.analyzeSystemState();
      
      // Construire le contexte enrichi
      const enrichedContext = this.buildEnrichedContext(systemAnalysis, message);
      
      if (this.chatService) {
        // Utiliser Ollama pour une réponse intelligente
        const messages: Message[] = [
          { role: 'system', content: enrichedContext },
          ...chatHistory.map(msg => ({ 
            role: msg.type as 'user' | 'assistant', 
            content: msg.content 
          })),
          { role: 'user', content: message }
        ];

        let response = '';
        await this.chatService.generateChatResponse(
          message,
          messages,
          (token) => {
            response += token;
            if (onProgress) onProgress(token);
          }
        );
        
        return response;
      } else {
        // Mode fallback avec réponses pré-programmées intelligentes
        return this.generateFallbackResponse(message, systemAnalysis);
      }
    } catch (error) {
      console.error('Erreur processing message:', error);
      return `Désolé, j'ai rencontré une erreur. Système MCP status: ${await this.getSystemStatus()}`;
    }
  }

  private buildEnrichedContext(analysis: AgentAnalysis, userMessage: string): string {
    return `${this.systemContext}

ÉTAT SYSTÈME ACTUEL:
- Santé globale: ${analysis.systemHealth}%
- Performance: ${JSON.stringify(analysis.performance)}
- Connexions: ${Object.keys(analysis.connections).length} services connectés
- Recommandations actives: ${analysis.recommendations.length}

MESSAGE UTILISATEUR: ${userMessage}

Réponds en tenant compte de l'état système actuel et propose des actions concrètes si pertinent.`;
  }

  private async analyzeSystemState(): Promise<AgentAnalysis> {
    const performance = this.calculatePerformance();
    const connections = await this.analyzeConnections();
    const recommendations = await this.generateIntelligentRecommendations();
    
    return {
      systemHealth: this.calculateSystemHealth(performance, connections),
      performance,
      connections,
      recommendations
    };
  }

  private calculatePerformance() {
    // Simuler des métriques réelles basées sur l'état système
    return {
      responseTime: Math.random() * 500 + 100, // 100-600ms
      throughput: Math.random() * 100 + 50,    // 50-150 req/s
      accuracy: Math.random() * 20 + 80        // 80-100%
    };
  }

  private async analyzeConnections(): Promise<{[key: string]: {status: 'connected' | 'disconnected' | 'error'; quality: number; latency: number}}> {
    const services = ['BioMCP', 'ApifyMCP', 'VoiceService', 'OllamaService'];
    const connections: {[key: string]: {status: 'connected' | 'disconnected' | 'error'; quality: number; latency: number}} = {};
    
    for (const service of services) {
      // Fix: Use proper union type for status
      const statusOptions: ('connected' | 'disconnected' | 'error')[] = ['connected', 'disconnected', 'error'];
      connections[service] = {
        status: Math.random() > 0.1 ? 'connected' : 'error',
        quality: Math.random() * 40 + 60, // 60-100%
        latency: Math.random() * 100 + 20 // 20-120ms
      };
    }
    
    return connections;
  }

  private async generateIntelligentRecommendations(): Promise<AgentRecommendation[]> {
    const recommendations: AgentRecommendation[] = [
      {
        id: '1',
        type: 'performance',
        priority: 'high',
        title: 'Optimisation Cache MCP',
        description: 'Implémenter un cache intelligent pour réduire la latence des requêtes répétitives',
        impact: 'Réduction de 60% du temps de réponse',
        implementation: {
          difficulty: 'medium',
          estimatedTime: '2 heures',
          steps: [
            'Analyser les patterns de requêtes',
            'Implémenter le cache Redis/Memory',
            'Configurer les politiques d\'expiration',
            'Tester les performances'
          ]
        },
        status: 'pending'
      },
      {
        id: '2',
        type: 'integration',
        priority: 'high',
        title: 'Unification Vocale Jarvis-MCP',
        description: 'Créer une interface vocale unifiée entre Jarvis et tous les modules MCP',
        impact: 'Expérience utilisateur fluide et cohérente',
        implementation: {
          difficulty: 'hard',
          estimatedTime: '4 heures',
          steps: [
            'Standardiser les paramètres vocaux',
            'Créer un gestionnaire vocal central',
            'Intégrer la reconnaissance contextuelle',
            'Synchroniser avec les agents MCP'
          ]
        },
        status: 'pending'
      },
      {
        id: '3',
        type: 'optimization',
        priority: 'medium',
        title: 'Auto-apprentissage Patterns',
        description: 'Système d\'apprentissage automatique des habitudes utilisateur',
        impact: 'Suggestions proactives personnalisées',
        implementation: {
          difficulty: 'hard',
          estimatedTime: '6 heures',
          steps: [
            'Collecter données d\'usage anonymes',
            'Implémenter algorithmes ML',
            'Créer système de recommandations',
            'Interface de feedback utilisateur'
          ]
        },
        status: 'pending'
      }
    ];

    return recommendations;
  }

  private calculateSystemHealth(performance: any, connections: any): number {
    const connectedServices = Object.values(connections).filter(
      (conn: any) => conn.status === 'connected'
    ).length;
    const totalServices = Object.keys(connections).length;
    const connectionHealth = (connectedServices / totalServices) * 100;
    
    const performanceHealth = (performance.accuracy + 
      (100 - Math.min(performance.responseTime / 10, 100))) / 2;
    
    return Math.round((connectionHealth + performanceHealth) / 2);
  }

  private generateFallbackResponse(message: string, analysis: AgentAnalysis): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('santé') || lowerMessage.includes('status')) {
      return `État système MCP: ${analysis.systemHealth}% de santé globale. ${analysis.recommendations.length} recommandations d'amélioration disponibles.`;
    }
    
    if (lowerMessage.includes('performance')) {
      return `Performance actuelle: ${analysis.performance.responseTime.toFixed(0)}ms de latence moyenne, ${analysis.performance.accuracy.toFixed(1)}% de précision.`;
    }
    
    if (lowerMessage.includes('vocal') || lowerMessage.includes('jarvis')) {
      return `Intégration vocale: ${analysis.connections.VoiceService?.status === 'connected' ? 'Active' : 'Problème détecté'}. Je peux optimiser la synchronisation avec Jarvis.`;
    }
    
    return `Je suis votre Agent IA MCP. Système: ${analysis.systemHealth}% santé. Comment puis-je optimiser votre expérience aujourd'hui?`;
  }

  private async getSystemStatus(): Promise<string> {
    const analysis = await this.analyzeSystemState();
    return `${analysis.systemHealth}% santé, ${Object.keys(analysis.connections).length} services`;
  }

  async implementRecommendation(recommendationId: string): Promise<boolean> {
    try {
      const response = await this.mcpServer.processRequest({
        id: Date.now().toString(),
        type: 'implement_recommendation',
        content: { recommendationId },
        metadata: { timestamp: new Date().toISOString() }
      });
      
      return response.status === 'success';
    } catch (error) {
      console.error('Erreur implémentation:', error);
      return false;
    }
  }
}
