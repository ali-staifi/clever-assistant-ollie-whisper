
/**
 * Tests the connection to an Ollama server
 */
export async function testOllamaConnection(baseUrl: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${baseUrl}/api/tags`, { 
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      return { 
        success: false, 
        error: `Status: ${response.status} ${response.statusText}` 
      };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error testing Ollama connection:', error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    return { 
      success: false, 
      error: errorMsg
    };
  }
}

/**
 * Fetches available models from an Ollama server
 */
export async function getAvailableModels(baseUrl: string): Promise<string[]> {
  try {
    const response = await fetch(`${baseUrl}/api/tags`, { 
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    // Extract model names from the response
    if (data && data.models) {
      return data.models.map((model: any) => model.name);
    }
    return [];
  } catch (error) {
    console.error('Error fetching Ollama models:', error);
    return [];
  }
}
