
import { MCPRequest, MCPResponse } from './MCPClient';
import { v4 as uuidv4 } from 'uuid';
import { OllamaService } from '../ollama/OllamaService';
import { LLaVAService } from '../vision/LLaVAService';
import { VisionOllamaService } from '../ollama/VisionOllamaService';

// Define handlers for different request types
type RequestHandler = (request: MCPRequest) => Promise<any>;

export class MCPServer {
  private handlers: Record<string, RequestHandler>;
  private ollamaService: OllamaService;
  private visionService: LLaVAService;
  
  constructor(ollamaBaseUrl: string = 'http://localhost:11434') {
    // Initialize services
    this.ollamaService = new OllamaService(ollamaBaseUrl);
    const visionOllamaService = new VisionOllamaService(ollamaBaseUrl);
    this.visionService = new LLaVAService(visionOllamaService);
    
    // Register handlers for different request types
    this.handlers = {
      'text_generation': this.handleTextGeneration.bind(this),
      'code_generation': this.handleCodeGeneration.bind(this),
      'image_analysis': this.handleImageAnalysis.bind(this),
      'data_retrieval': this.handleDataRetrieval.bind(this),
      'workflow_execution': this.handleWorkflowExecution.bind(this),
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
    const response = await this.ollamaService.generateCompletion(prompt, model);
    
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
    const code = await this.ollamaService.generateCompletion(codePrompt, model);
    
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
}
