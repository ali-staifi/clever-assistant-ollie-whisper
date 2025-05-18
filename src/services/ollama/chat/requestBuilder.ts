
import { Message } from '../types';
import { formatMessagesToPrompt } from '../formatUtils';
import { isGenerateAPIModel, createSystemMessage } from './modelUtils';

export interface RequestOptions {
  temperature?: number;
  numPredict?: number;
  topK?: number;
  topP?: number;
}

export function buildRequestBody(
  model: string, 
  prompt: string, 
  messages: Message[], 
  options: RequestOptions
): { body: string, endpoint: string } {
  const isQwen = isGenerateAPIModel(model);
  const endpoint = isQwen ? '/api/generate' : '/api/chat';
  
  let requestBody: string;
  
  if (isQwen) {
    const formattedPrompt = formatMessagesToPrompt(messages, prompt, true, 'french');
    console.log("Formatted Qwen prompt:", formattedPrompt.substring(0, 100) + "...");
    
    requestBody = JSON.stringify({
      model: model,
      prompt: formattedPrompt,
      stream: true,
      options: options
    });
  } else {
    const systemMessage = createSystemMessage(prompt);
    
    requestBody = JSON.stringify({
      model: model,
      messages: [
        { role: 'system', content: systemMessage },
        ...messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        { role: 'user', content: prompt }
      ],
      stream: true,
      options: options
    });
  }
  
  return { body: requestBody, endpoint };
}
