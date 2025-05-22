
import { useState } from 'react';
import { useMCP } from '@/hooks/useMCP';
import { RequestFormData } from '@/components/mcp/apify/ApifyRequestForm';

export const useApifyMCP = () => {
  const { isProcessing, processLocalRequest } = useMCP();
  const [result, setResult] = useState<any>(null);
  
  const handleSubmitRequest = async (formData: RequestFormData) => {
    try {
      let requestContent: any = {};
      
      switch (formData.requestType) {
        case 'web_scraping':
          requestContent = { 
            url: formData.url, 
            selectors: formData.selectors?.split(',').map(s => s.trim()).filter(Boolean)
          };
          break;
        case 'data_extraction':
          requestContent = { 
            content: formData.content, 
            format: formData.format,
            extractionRules: ['default']
          };
          break;
        case 'automation_workflow':
          requestContent = { 
            workflow: formData.workflow,
            parameters: formData.parameters ? JSON.parse(formData.parameters) : {}
          };
          break;
      }
      
      const response = await processLocalRequest(
        formData.requestType, 
        requestContent,
        formData.apiKey ? { apiKey: formData.apiKey } : undefined
      );
      
      if (response.status === 'success') {
        setResult(response.content);
      } else {
        setResult({ error: response.content.error || 'Une erreur est survenue' });
      }
    } catch (error) {
      console.error('ApifyMCP error:', error);
      setResult({ error: error instanceof Error ? error.message : 'Une erreur inconnue est survenue' });
    }
  };
  
  return {
    result,
    isProcessing,
    setResult,
    handleSubmitRequest
  };
};
