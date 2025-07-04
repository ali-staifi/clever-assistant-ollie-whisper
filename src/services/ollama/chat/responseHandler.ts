
export async function handleStreamedResponse(
  response: Response,
  onProgress: (token: string) => void,
  isQwenModel: boolean,
  abortController?: AbortController | null
): Promise<void> {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('Response body is empty');
  }

  const parseStreamedResponse = (await import('../responseParser')).parseStreamedResponse;
  let partialResponse = '';
  const decoder = new TextDecoder();
  
  // Add a watchdog timer to ensure we don't get stuck
  const watchdogTimer = setTimeout(() => {
    console.warn('Response watchdog timer triggered after 60 seconds');
    if (abortController) {
      abortController.abort();
    }
  }, 60000);

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      const chunk = decoder.decode(value);
      console.log("Received chunk:", chunk.substring(0, 100) + (chunk.length > 100 ? "..." : ""));
      
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.trim()) {
          try {
            const parsedToken = parseStreamedResponse(line, isQwenModel);
            if (parsedToken) {
              partialResponse += parsedToken;
              onProgress(parsedToken);
            }
          } catch (e) {
            console.error('Error parsing response line:', e);
            console.error('Line content:', line);
          }
        }
      }
    }
  } finally {
    clearTimeout(watchdogTimer);
  }
  
  if (!partialResponse.trim()) {
    console.warn('Empty response received from model');
    const fallbackMsg = "Je suis désolé, je n'ai pas pu générer de réponse. Veuillez vérifier si le modèle est correctement installé.";
    onProgress(fallbackMsg);
  }
}

export async function handleErrorResponse(response: Response): Promise<string> {
  let errorMsg = `HTTP error! Status: ${response.status}`;
  
  try {
    const errorData = await response.json();
    if (errorData.error) {
      errorMsg = `Ollama error: ${errorData.error}`;
      
      if (errorData.error.includes('not found') || errorData.error.includes('no model loaded')) {
        errorMsg += `\nPlease install model with command: ollama pull <model_name>`;
      }
    }
  } catch (e) {
    // If we can't parse the error, just use the HTTP status
  }
  
  return errorMsg;
}
