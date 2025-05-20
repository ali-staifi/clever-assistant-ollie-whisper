
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { MCPServer } from '@/services/mcp/MCPServer';
import { MCPRequest, MCPResponse } from '@/services/mcp/MCPClient';

export const useMCP = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const mcpServer = new MCPServer();
  
  /**
   * Process a request through the local MCP server
   * @param type The type of request to process
   * @param content The content of the request
   * @param metadata Optional metadata for the request
   * @returns The response from the MCP server
   */
  const processLocalRequest = async (
    type: string, 
    content: any, 
    metadata?: Record<string, any>
  ): Promise<MCPResponse> => {
    setIsProcessing(true);
    
    try {
      const request: MCPRequest = {
        id: uuidv4(),
        type,
        content,
        metadata
      };
      
      const response = await mcpServer.processRequest(request);
      return response;
    } catch (error) {
      console.error('Error processing MCP request:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };
  
  /**
   * Send a request to a remote MCP server
   * @param serverUrl The URL of the MCP server
   * @param type The type of request to process
   * @param content The content of the request
   * @param metadata Optional metadata for the request
   * @returns The response from the MCP server
   */
  const sendRemoteRequest = async (
    serverUrl: string,
    type: string,
    content: any,
    metadata?: Record<string, any>
  ): Promise<MCPResponse> => {
    setIsProcessing(true);
    
    try {
      const request: MCPRequest = {
        id: uuidv4(),
        type,
        content,
        metadata
      };
      
      const response = await fetch(serverUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error sending remote MCP request:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };
  
  return {
    isProcessing,
    processLocalRequest,
    sendRemoteRequest
  };
};
