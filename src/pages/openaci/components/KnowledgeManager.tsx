
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, Upload, Link, FileText } from 'lucide-react';
import { KnowledgeEntry } from '../types';

interface KnowledgeManagerProps {
  knowledgeBase: KnowledgeEntry[];
  newConcept: string;
  conceptDescription: string;
  onNewConceptChange: (concept: string) => void;
  onConceptDescriptionChange: (description: string) => void;
  onAddKnowledge: () => void;
  onAddKnowledgeFromSource: (concept: string, description: string, source: KnowledgeEntry['source']) => void;
}

const KnowledgeManager: React.FC<KnowledgeManagerProps> = ({
  knowledgeBase,
  newConcept,
  conceptDescription,
  onNewConceptChange,
  onConceptDescriptionChange,
  onAddKnowledge,
  onAddKnowledgeFromSource
}) => {
  const [webUrl, setWebUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const text = await file.text();
      const concept = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
      const description = `Contenu du fichier ${file.name}:\n\n${text.substring(0, 500)}${text.length > 500 ? '...' : ''}`;
      
      onAddKnowledgeFromSource(concept, description, {
        type: file.type.includes('pdf') ? 'pdf' : 'file',
        data: text,
        filename: file.name
      });
    } catch (error) {
      console.error('Erreur lors de la lecture du fichier:', error);
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleWebUrlAdd = async () => {
    if (!webUrl.trim()) return;
    
    setIsLoading(true);
    try {
      const concept = new URL(webUrl).hostname;
      const description = `Lien web vers: ${webUrl}`;
      
      onAddKnowledgeFromSource(concept, description, {
        type: 'url',
        url: webUrl
      });
      setWebUrl('');
    } catch (error) {
      console.error('Erreur lors de l\'ajout du lien:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Ajouter une connaissance</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Tabs defaultValue="manual" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="manual" className="text-xs">
                <Database className="h-3 w-3 mr-1" />
                Manuel
              </TabsTrigger>
              <TabsTrigger value="file" className="text-xs">
                <Upload className="h-3 w-3 mr-1" />
                Fichier
              </TabsTrigger>
              <TabsTrigger value="web" className="text-xs">
                <Link className="h-3 w-3 mr-1" />
                Web
              </TabsTrigger>
            </TabsList>

            <TabsContent value="manual" className="space-y-2 mt-2">
              <Input
                placeholder="Nouveau concept..."
                value={newConcept}
                onChange={(e) => onNewConceptChange(e.target.value)}
                className="h-8"
              />
              <Textarea
                placeholder="Description du concept..."
                value={conceptDescription}
                onChange={(e) => onConceptDescriptionChange(e.target.value)}
                className="h-16"
              />
              <Button 
                onClick={onAddKnowledge} 
                disabled={!newConcept.trim() || !conceptDescription.trim()} 
                size="sm"
                className="w-full"
              >
                <Database className="h-3 w-3 mr-1" />
                Ajouter manuellement
              </Button>
            </TabsContent>

            <TabsContent value="file" className="space-y-2 mt-2">
              <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileUpload}
                  accept=".txt,.md,.pdf,.json,.csv"
                  className="hidden"
                  id="file-upload"
                />
                <label 
                  htmlFor="file-upload" 
                  className="cursor-pointer flex flex-col items-center space-y-2"
                >
                  <FileText className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Cliquez pour sélectionner un fichier
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Formats: TXT, MD, PDF, JSON, CSV
                  </span>
                </label>
              </div>
            </TabsContent>

            <TabsContent value="web" className="space-y-2 mt-2">
              <Input
                placeholder="https://example.com"
                value={webUrl}
                onChange={(e) => setWebUrl(e.target.value)}
                className="h-8"
              />
              <Button 
                onClick={handleWebUrlAdd} 
                disabled={!webUrl.trim() || isLoading} 
                size="sm"
                className="w-full"
              >
                <Link className="h-3 w-3 mr-1" />
                Ajouter le lien
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Base de connaissances</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ScrollArea className="h-48">
            <div className="space-y-1">
              {knowledgeBase.map((entry) => (
                  <div key={entry.id} className="p-2 border rounded text-xs">
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{entry.concept}</span>
                        {entry.source && (
                          <Badge variant="secondary" className="text-xs">
                            {entry.source.type === 'file' && <FileText className="h-2 w-2 mr-1" />}
                            {entry.source.type === 'url' && <Link className="h-2 w-2 mr-1" />}
                            {entry.source.type === 'pdf' && <FileText className="h-2 w-2 mr-1" />}
                            {entry.source.type}
                          </Badge>
                        )}
                      </div>
                      <span className="text-muted-foreground">
                        {entry.timestamp.toLocaleString()}
                      </span>
                    </div>
                    <div className="mb-1 text-muted-foreground">{entry.description}</div>
                    {entry.source?.url && (
                      <div className="mb-1">
                        <a 
                          href={entry.source.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          {entry.source.url}
                        </a>
                      </div>
                    )}
                    {entry.relations.length > 0 && (
                      <div className="flex gap-1">
                        {entry.relations.map((relation, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {relation}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default KnowledgeManager;
