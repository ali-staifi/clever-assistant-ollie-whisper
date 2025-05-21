
import React, { useState } from 'react';
import { useMCP } from '@/hooks/useMCP';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Loader2 } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { ScrollArea } from '../ui/scroll-area';

const ApifyMCPPanel: React.FC = () => {
  const { isProcessing, processLocalRequest } = useMCP();
  const [requestType, setRequestType] = useState('web_scraping');
  const [url, setUrl] = useState('');
  const [selectors, setSelectors] = useState('');
  const [content, setContent] = useState('');
  const [format, setFormat] = useState('html');
  const [workflow, setWorkflow] = useState('');
  const [parameters, setParameters] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [result, setResult] = useState<any>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let requestContent: any = {};
      
      switch (requestType) {
        case 'web_scraping':
          requestContent = { 
            url, 
            selectors: selectors.split(',').map(s => s.trim()).filter(Boolean)
          };
          break;
        case 'data_extraction':
          requestContent = { 
            content, 
            format,
            extractionRules: ['default']
          };
          break;
        case 'automation_workflow':
          requestContent = { 
            workflow,
            parameters: parameters ? JSON.parse(parameters) : {}
          };
          break;
      }
      
      const response = await processLocalRequest(
        requestType, 
        requestContent,
        apiKey ? { apiKey } : undefined
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
  
  return (
    <Card className="w-full mb-16">
      <CardHeader className="pb-2">
        <CardTitle>ApifyMCP Demo</CardTitle>
        <CardDescription>
          Interagissez avec le module ApifyMCP pour l'automatisation web
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-2">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-2">
            <Label>Type de requête</Label>
            <RadioGroup 
              value={requestType} 
              onValueChange={setRequestType}
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
              placeholder="Entrez votre clé API Apify"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              type="password"
            />
            <p className="text-xs text-muted-foreground">
              Sans clé API, une simulation sera utilisée.
            </p>
          </div>
          
          {requestType === 'web_scraping' && (
            <>
              <div className="space-y-1">
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="selectors">Sélecteurs CSS (séparés par des virgules)</Label>
                <Input
                  id="selectors"
                  placeholder="Ex: h1, .product-card, #main-content"
                  value={selectors}
                  onChange={(e) => setSelectors(e.target.value)}
                />
              </div>
            </>
          )}
          
          {requestType === 'data_extraction' && (
            <>
              <div className="space-y-1">
                <Label htmlFor="content">Contenu à analyser</Label>
                <Textarea
                  id="content"
                  placeholder="Collez ici le contenu HTML, JSON, etc. à analyser"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="format">Format</Label>
                <Input
                  id="format"
                  placeholder="html, json, csv, etc."
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                />
              </div>
            </>
          )}
          
          {requestType === 'automation_workflow' && (
            <>
              <div className="space-y-1">
                <Label htmlFor="workflow">Workflow</Label>
                <Input
                  id="workflow"
                  placeholder="Nom du workflow Apify"
                  value={workflow}
                  onChange={(e) => setWorkflow(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="parameters">Paramètres (JSON)</Label>
                <Textarea
                  id="parameters"
                  placeholder='{"param1": "valeur1", "param2": "valeur2"}'
                  value={parameters}
                  onChange={(e) => setParameters(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
            </>
          )}
          
          <Button 
            type="submit" 
            disabled={isProcessing || 
              (requestType === 'web_scraping' && !url) ||
              (requestType === 'data_extraction' && !content) ||
              (requestType === 'automation_workflow' && !workflow)
            }
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
        
        {result && (
          <div className="mt-4">
            <Label>Résultat</Label>
            <ScrollArea className="h-[150px] mt-1 rounded-md border">
              <div className="bg-muted p-3 whitespace-pre-wrap">
                {result.error ? (
                  <div className="text-red-500">Erreur: {result.error}</div>
                ) : (
                  <pre className="text-sm">{JSON.stringify(result, null, 2)}</pre>
                )}
              </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-0">
        <Button variant="outline" onClick={() => setResult(null)} size="sm">
          Effacer le résultat
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ApifyMCPPanel;
