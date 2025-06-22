import { MCPRequest, MCPResponse } from './MCPClient';
import { v4 as uuidv4 } from 'uuid';
import { OllamaService } from '../ollama/OllamaService';
import { LLaVAService } from '../vision/LLaVAService';
import { VisionOllamaService } from '../ollama/VisionOllamaService';
import { BioMCPService } from './biomcp/BioMCPService';
import { ApifyMCPService } from './apify/ApifyMCPService';

// Define handlers for different request types
type RequestHandler = (request: MCPRequest) => Promise<any>;

export class MCPServer {
  private handlers: Record<string, RequestHandler>;
  private ollamaService: OllamaService;
  private visionService: LLaVAService;
  private bioMCPService: BioMCPService;
  private apifyMCPService: ApifyMCPService;
  
  constructor(ollamaBaseUrl: string = 'http://localhost:11434') {
    // Initialize services
    this.ollamaService = new OllamaService(ollamaBaseUrl);
    const visionOllamaService = new VisionOllamaService(ollamaBaseUrl);
    this.visionService = new LLaVAService(visionOllamaService);
    this.bioMCPService = new BioMCPService();
    this.apifyMCPService = new ApifyMCPService();
    
    // Register handlers for different request types
    this.handlers = {
      'text_generation': this.handleTextGeneration.bind(this),
      'code_generation': this.handleCodeGeneration.bind(this),
      'image_analysis': this.handleImageAnalysis.bind(this),
      'data_retrieval': this.handleDataRetrieval.bind(this),
      'workflow_execution': this.handleWorkflowExecution.bind(this),
      
      // BioMCP handlers
      'genomic_sequence_analysis': this.handleBioMCPRequest.bind(this),
      'variant_annotation': this.handleBioMCPRequest.bind(this),
      'pathway_analysis': this.handleBioMCPRequest.bind(this),
      'medical_research': this.handleBioMCPRequest.bind(this),
      
      // ApifyMCP handlers
      'web_scraping': this.handleApifyMCPRequest.bind(this),
      'data_extraction': this.handleApifyMCPRequest.bind(this),
      'automation_workflow': this.handleApifyMCPRequest.bind(this),
      
      // New intelligent handlers
      'system_analysis': this.handleSystemAnalysis.bind(this),
      'implement_recommendation': this.handleImplementRecommendation.bind(this),
    };
  }
  
  public async processRequest(request: MCPRequest): Promise<MCPResponse> {
    console.log(`Processing MCP request (${request.type}):`, request);
    
    try {
      // Find the appropriate handler
      const handler = this.handlers[request.type];
      
      if (!handler) {
        return this.createErrorResponse(request.id, `Unsupported request type: ${request.type}`);
      }
      
      // Process the request with the handler
      const result = await handler(request);
      
      // Return successful response
      return {
        id: uuidv4(),
        requestId: request.id,
        status: 'success',
        content: result,
        metadata: {
          timestamp: new Date().toISOString(),
        }
      };
    } catch (error) {
      console.error(`Error processing ${request.type} request:`, error);
      return this.createErrorResponse(request.id, error instanceof Error ? error.message : 'Unknown error');
    }
  }
  
  private createErrorResponse(requestId: string, errorMessage: string): MCPResponse {
    return {
      id: uuidv4(),
      requestId,
      status: 'error',
      content: {
        error: errorMessage
      },
      metadata: {
        timestamp: new Date().toISOString(),
      }
    };
  }
  
  // Handlers for different request types
  
  private async handleTextGeneration(request: MCPRequest): Promise<any> {
    const { prompt, model = 'gemma:7b' } = request.content;
    
    if (!prompt) {
      throw new Error('Prompt is required for text generation');
    }
    
    // Use the Ollama service to generate text
    // Changed from generateCompletion to generateResponse to match the OllamaService API
    const response = await this.ollamaService.generateResponse(prompt, [], undefined);
    
    return {
      text: response,
      model
    };
  }
  
  private async handleCodeGeneration(request: MCPRequest): Promise<any> {
    const { prompt, language, context, model = 'gemma:7b' } = request.content;
    
    if (!prompt) {
      throw new Error('Prompt is required for code generation');
    }
    
    // Create a specialized prompt for code generation
    const codePrompt = `Generate ${language || 'code'} for the following task:
${prompt}
${context ? `\nContext: ${context}` : ''}
\nPlease provide only the code without explanations.`;

    // Use the Ollama service with a model good at code generation
    // Changed from generateCompletion to generateResponse to match the OllamaService API
    const code = await this.ollamaService.generateResponse(codePrompt, [], undefined);
    
    return {
      code,
      language: language || 'unknown'
    };
  }
  
  private async handleImageAnalysis(request: MCPRequest): Promise<any> {
    const { imageBase64, prompt } = request.content;
    
    if (!imageBase64) {
      throw new Error('Image data is required for image analysis');
    }
    
    // Use the LLaVA service to analyze the image
    const description = await this.visionService.analyzeImage(imageBase64, prompt);
    
    return {
      description,
      entities: [] // This could be enhanced with an entity extraction step
    };
  }
  
  private async handleDataRetrieval(request: MCPRequest): Promise<any> {
    const { query, source } = request.content;
    
    if (!query) {
      throw new Error('Query is required for data retrieval');
    }
    
    // This is a placeholder - in a real implementation, this would connect to 
    // external data sources like databases or APIs
    console.log(`Data retrieval request for ${source}: ${query}`);
    
    // Simulate a data retrieval operation
    return {
      data: {
        message: `Data retrieved from ${source} using query: ${query}`,
        timestamp: new Date().toISOString(),
        results: []
      }
    };
  }
  
  private async handleWorkflowExecution(request: MCPRequest): Promise<any> {
    const { workflowId, parameters } = request.content;
    
    if (!workflowId) {
      throw new Error('Workflow ID is required for workflow execution');
    }
    
    // This is a placeholder - in a real implementation, this would trigger 
    // external workflows in tools like n8n
    console.log(`Workflow execution request for ${workflowId} with parameters:`, parameters);
    
    // Simulate a workflow execution
    return {
      executionId: uuidv4(),
      status: 'completed',
      results: {
        message: `Workflow ${workflowId} executed successfully`,
        output: {}
      }
    };
  }
  
  // Nouveaux handlers pour les services BioMCP et ApifyMCP
  
  private async handleBioMCPRequest(request: MCPRequest): Promise<any> {
    const response = await this.bioMCPService.processRequest(request);
    return response.content;
  }
  
  private async handleApifyMCPRequest(request: MCPRequest): Promise<any> {
    const response = await this.apifyMCPService.processRequest(request);
    return response.content;
  }
  
  private async handleSystemAnalysis(request: MCPRequest): Promise<any> {
    const { components, connections, query } = request.content;
    
    // Analyser l'état du système MCP
    const systemStatus = {
      components: components?.map((comp: string) => ({
        name: comp,
        status: 'active',
        health: 'optimal',
        connections: this.analyzeComponentConnections(comp)
      })) || [],
      connections: this.analyzeSystemConnections(connections || []),
      recommendations: this.generateIntelligentRecommendations(query)
    };
    
    return {
      analysis: systemStatus,
      timestamp: new Date().toISOString(),
      query: query || 'Analyse système complète'
    };
  }
  
  private async handleImplementRecommendation(request: MCPRequest): Promise<any> {
    const { recommendation, context } = request.content;
    
    // Simuler l'implémentation d'une recommandation
    const implementation = {
      recommendationId: recommendation.id,
      status: 'implemented',
      changes: this.generateImplementationChanges(recommendation),
      impact: `Amélioration implémentée: ${recommendation.title}`,
      timestamp: new Date().toISOString()
    };
    
    return implementation;
  }
  
  private analyzeComponentConnections(componentName: string): any[] {
    const connectionMap = {
      'BioMCP': [
        { type: 'voice_integration', status: 'connected', quality: 'excellent' },
        { type: 'data_processing', status: 'connected', quality: 'good' },
        { type: 'result_synthesis', status: 'connected', quality: 'excellent' }
      ],
      'ApifyMCP': [
        { type: 'voice_integration', status: 'connected', quality: 'good' },
        { type: 'web_automation', status: 'connected', quality: 'excellent' },
        { type: 'data_extraction', status: 'connected', quality: 'excellent' }
      ]
    };
    
    return connectionMap[componentName] || [];
  }
  
  private analyzeSystemConnections(connections: string[]): any {
    return {
      voice_integration: {
        status: 'active',
        components_connected: ['BioMCP', 'ApifyMCP'],
        quality: 'excellent',
        suggestions: ['Optimiser la synchronisation vocale', 'Ajouter reconnaissance contextuelle']
      },
      mcp_protocols: {
        status: 'active',
        components_connected: ['BioMCP', 'ApifyMCP', 'AgentAI'],
        quality: 'good',
        suggestions: ['Implémenter cache intelligent', 'Ajouter métriques de performance']
      }
    };
  }
  
  private generateIntelligentRecommendations(query?: string): any[] {
    const baseRecommendations = [
      {
        type: 'performance',
        title: 'Cache Intelligent MCP',
        description: 'Implémenter un système de cache intelligent pour les requêtes MCP fréquentes',
        priority: 'medium',
        impact: 'Réduction de 60% du temps de réponse'
      },
      {
        type: 'integration',
        title: 'Unification Vocale',
        description: 'Créer une interface vocale unifiée pour tous les modules MCP',
        priority: 'high',
        impact: 'Expérience utilisateur cohérente et intuitive'
      },
      {
        type: 'intelligence',
        title: 'Prédiction Contextuelle',
        description: 'Système de prédiction des besoins utilisateur basé sur le contexte',
        priority: 'high',
        impact: 'Suggestions proactives et personnalisées'
      }
    ];
    
    // Adapter les recommandations selon la requête
    if (query?.toLowerCase().includes('vocal')) {
      return baseRecommendations.filter(rec => rec.type === 'integration');
    }
    
    return baseRecommendations;
  }
  
  private generateImplementationChanges(recommendation: any): any[] {
    const changeMap = {
      'Optimisation des Connexions Vocales': [
        'Synchronisation paramètres vocaux globaux',
        'Amélioration latence reconnaissance vocale',
        'Intégration contextuelle améliorée'
      ],
      'Agent Conversationnel MCP': [
        'Interface NLP pour commandes naturelles',
        'Système de compréhension contextuelle',
        'Réponses adaptatives intelligentes'
      ],
      'Auto-apprentissage des Patterns': [
        'Collecteur de données d\'usage',
        'Algorithmes d\'apprentissage adaptatif',
        'Système de recommandations personnalisées'
      ]
    };
    
    return changeMap[recommendation.title] || ['Implémentation générique'];
  }
}
