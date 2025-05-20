
import { useState } from 'react';
import { MCPClient, MCPRequest, MCPResponse } from '../services/mcp/MCPClient';
import { MCPServer } from '../services/mcp/MCPServer';
import { useToast } from './use-toast';

// This hook provides a simplified interface to the MCP functionality
export const useMCP = (serverUrl?: string) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResponse, setLastResponse] = useState<MCPResponse | null>(null);
  const { toast } = useToast();
  
  // Create client and server instances
  // For this example, we're simulating both client and server in the browser
  // In a real application, the server would be a separate service
  const mcpClient = new MCPClient(serverUrl || '/api/mcp');
  const mcpServer = new MCPServer();
  
  // Process a request locally (simulation of client-server interaction)
  const processLocalRequest = async (type: string, content: any, metadata?: Record<string, any>) => {
    setIsProcessing(true);
    
    try {
      // Create a request object
      const request: MCPRequest = {
        id: crypto.randomUUID(),
        type,
        content,
        metadata
      };
      
      // Process the request with the local server
      const response = await mcpServer.processRequest(request);
      
      setLastResponse(response);
      
      if (response.status === 'error') {
        toast({
          title: "MCP Request Failed",
          description: response.content.error,
          variant: "destructive",
        });
      }
      
      return response;
    } catch (error) {
      console.error('Error processing MCP request:', error);
      
      toast({
        title: "MCP Error",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Send a request to a remote MCP server
  const sendRequest = async (type: string, content: any, metadata?: Record<string, any>) => {
    setIsProcessing(true);
    
    try {
      const response = await mcpClient.sendRequest(type, content, metadata);
      setLastResponse(response);
      return response;
    } catch (error) {
      console.error('Error sending MCP request:', error);
      
      toast({
        title: "MCP Request Failed",
        description: error instanceof Error ? error.message : "Failed to send MCP request",
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };
  
  return {
    isProcessing,
    lastResponse,
    processLocalRequest,
    sendRequest,
    // Utility methods
    generateCode: async (prompt: string, language: string, context?: string) => {
      return processLocalRequest('code_generation', { prompt, language, context });
    },
    analyzeImage: async (imageBase64: string, prompt?: string) => {
      return processLocalRequest('image_analysis', { imageBase64, prompt });
    },
    retrieveData: async (query: string, source: string) => {
      return processLocalRequest('data_retrieval', { query, source });
    },
    executeWorkflow: async (workflowId: string, parameters?: any) => {
      return processLocalRequest('workflow_execution', { workflowId, parameters });
    }
  };
};
