
/**
 * Tests the connection to an Ollama server
 */
export async function testOllamaConnection(baseUrl: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`Testing connection to Ollama at ${baseUrl}...`);
    
    // Ajout d'un timeout pour éviter les attentes infinies
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout
    
    const response = await fetch(`${baseUrl}/api/tags`, { 
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      return { 
        success: false, 
        error: `Status: ${response.status} ${response.statusText}` 
      };
    }
    
    // Vérifier que la réponse contient des données valides
    const data = await response.json();
    console.log('Ollama connection test response:', data);
    
    if (!data || !data.models || !Array.isArray(data.models)) {
      return {
        success: false,
        error: 'La réponse du serveur Ollama ne contient pas de liste de modèles valide'
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
    console.log(`Fetching available models from ${baseUrl}...`);
    
    // Ajout d'un timeout pour éviter les attentes infinies
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout
    
    const response = await fetch(`${baseUrl}/api/tags`, { 
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Available models response:', data);
    
    // Extract model names from the response
    if (data && data.models && Array.isArray(data.models)) {
      return data.models.map((model: any) => model.name);
    }
    
    console.error('Invalid models response format:', data);
    return [];
  } catch (error) {
    console.error('Error fetching Ollama models:', error);
    return [];
  }
}
