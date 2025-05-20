
import { v4 as uuidv4 } from 'uuid';

export interface MCPRequest {
  id: string;
  type: string;
  content: any;
  metadata?: Record<string, any>;
}

export interface MCPResponse {
  id: string;
  requestId: string;
  status: 'success' | 'error';
  content: any;
  metadata?: Record<string, any>;
}

export class MCPClient {
  private serverUrl: string;
  private headers: HeadersInit;
  
  constructor(serverUrl: string, apiKey?: string) {
    this.serverUrl = serverUrl;
    this.headers = {
      'Content-Type': 'application/json',
      ...(apiKey && { 'Authorization': `Bearer ${apiKey}` }),
    };
  }
  
  public async sendRequest(type: string, content: any, metadata?: Record<string, any>): Promise<MCPResponse> {
    try {
      const request: MCPRequest = {
        id: uuidv4(),
        type,
        content,
        metadata
      };
      
      console.log(`Sending MCP request (${type}):`, request);
      
      const response = await fetch(this.serverUrl, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(request)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data: MCPResponse = await response.json();
      console.log('MCP response received:', data);
      
      return data;
    } catch (error) {
      console.error('Error sending MCP request:', error);
      throw error;
    }
  }
  
  // Utility method for code generation requests
  public async generateCode(prompt: string, language: string, context?: string): Promise<string> {
    const response = await this.sendRequest('code_generation', {
      prompt,
      language,
      context
    });
    
    if (response.status === 'error') {
      throw new Error(`Code generation failed: ${response.content.error}`);
    }
    
    return response.content.code;
  }
  
  // Utility method for data retrieval requests
  public async retrieveData(query: string, source: string): Promise<any> {
    const response = await this.sendRequest('data_retrieval', {
      query,
      source
    });
    
    if (response.status === 'error') {
      throw new Error(`Data retrieval failed: ${response.content.error}`);
    }
    
    return response.content.data;
  }
}
