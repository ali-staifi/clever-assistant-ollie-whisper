
import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { RadioGroup, RadioGroupItem } from '../../ui/radio-group';
import { Loader2 } from 'lucide-react';
import WebScrapingForm from './forms/WebScrapingForm';
import DataExtractionForm from './forms/DataExtractionForm';
import AutomationWorkflowForm from './forms/AutomationWorkflowForm';

export interface RequestFormData {
  requestType: string;
  apiKey: string;
  url?: string;
  selectors?: string;
  content?: string;
  format?: string;
  workflow?: string;
  parameters?: string;
}

interface ApifyRequestFormProps {
  onSubmit: (formData: RequestFormData) => Promise<void>;
  isProcessing: boolean;
}

const ApifyRequestForm: React.FC<ApifyRequestFormProps> = ({ onSubmit, isProcessing }) => {
  const [formData, setFormData] = useState<RequestFormData>({
    requestType: 'web_scraping',
    apiKey: '',
    url: '',
    selectors: '',
    content: '',
    format: 'html',
    workflow: '',
    parameters: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = (value: string) => {
    setFormData(prev => ({ ...prev, requestType: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isSubmitDisabled = () => {
    if (isProcessing) return true;
    
    switch (formData.requestType) {
      case 'web_scraping':
        return !formData.url;
      case 'data_extraction':
        return !formData.content;
      case 'automation_workflow':
        return !formData.workflow;
      default:
        return false;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-2">
        <Label>Type de requête</Label>
        <RadioGroup 
          value={formData.requestType} 
          onValueChange={handleRadioChange}
          className="flex flex-col space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="web_scraping" id="scraping" />
            <Label htmlFor="scraping">Web Scraping</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="data_extraction" id="extraction" />
            <Label htmlFor="extraction">Extraction de données</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="automation_workflow" id="automation" />
            <Label htmlFor="automation">Workflow d'automatisation</Label>
          </div>
        </RadioGroup>
      </div>
      
      <div className="space-y-1">
        <Label htmlFor="apiKey">Clé API Apify (optionnel)</Label>
        <Input
          id="apiKey"
          name="apiKey"
          placeholder="Entrez votre clé API Apify"
          value={formData.apiKey}
          onChange={handleChange}
          type="password"
        />
        <p className="text-xs text-muted-foreground">
          Sans clé API, une simulation sera utilisée.
        </p>
      </div>
      
      {formData.requestType === 'web_scraping' && (
        <WebScrapingForm 
          url={formData.url || ''}
          selectors={formData.selectors || ''}
          onChange={handleChange}
        />
      )}
      
      {formData.requestType === 'data_extraction' && (
        <DataExtractionForm 
          content={formData.content || ''}
          format={formData.format || ''}
          onChange={handleChange}
        />
      )}
      
      {formData.requestType === 'automation_workflow' && (
        <AutomationWorkflowForm 
          workflow={formData.workflow || ''}
          parameters={formData.parameters || ''}
          onChange={handleChange}
        />
      )}
      
      <Button 
        type="submit" 
        disabled={isSubmitDisabled()}
        className="w-full"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Traitement...
          </>
        ) : 'Exécuter'}
      </Button>
    </form>
  );
};

export default ApifyRequestForm;
