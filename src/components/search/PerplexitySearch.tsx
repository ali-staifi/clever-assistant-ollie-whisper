import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, ExternalLink, Clock, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SearchResult {
  query: string;
  answer: string;
  timestamp: string;
  model: string;
  sources?: string[];
}

export const PerplexitySearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedModel, setSelectedModel] = useState('llama-3.1-sonar-small-128k-online');
  const [apiKey, setApiKey] = useState('');
  const [recencyFilter, setRecencyFilter] = useState('month');
  
  const { toast } = useToast();

  const models = [
    { id: 'llama-3.1-sonar-small-128k-online', name: 'Sonar Small (8B)', description: 'Rapide et efficace' },
    { id: 'llama-3.1-sonar-large-128k-online', name: 'Sonar Large (70B)', description: 'Plus puissant' },
    { id: 'llama-3.1-sonar-huge-128k-online', name: 'Sonar Huge (405B)', description: 'Le plus avancé' },
  ];

  const recencyOptions = [
    { value: 'month', label: 'Ce mois' },
    { value: 'week', label: 'Cette semaine' },
    { value: 'day', label: 'Aujourd\'hui' },
    { value: 'hour', label: 'Cette heure' },
  ];

  // Recherche avec Perplexity AI
  const performSearch = useCallback(async () => {
    if (!query.trim()) {
      toast({
        title: "Requête vide",
        description: "Veuillez saisir une question",
        variant: "destructive",
      });
      return;
    }

    if (!apiKey.trim()) {
      toast({
        title: "Clé API manquante",
        description: "Veuillez configurer votre clé API Perplexity",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            {
              role: 'system',
              content: 'Vous êtes un assistant de recherche intelligent. Fournissez des réponses précises et concises avec des sources fiables.'
            },
            {
              role: 'user',
              content: query
            }
          ],
          temperature: 0.2,
          top_p: 0.9,
          max_tokens: 1000,
          return_images: false,
          return_related_questions: false,
          search_recency_filter: recencyFilter,
          frequency_penalty: 1,
          presence_penalty: 0
        }),
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      const answer = data.choices?.[0]?.message?.content || 'Aucune réponse trouvée';

      const result: SearchResult = {
        query,
        answer,
        timestamp: new Date().toLocaleString(),
        model: selectedModel,
        sources: []
      };

      setResults(prev => [result, ...prev]);
      setQuery('');

      toast({
        title: "Recherche terminée",
        description: `Résultat obtenu avec ${models.find(m => m.id === selectedModel)?.name}`,
      });
    } catch (error) {
      console.error('Erreur recherche:', error);
      toast({
        title: "Erreur de recherche",
        description: "Impossible d'effectuer la recherche. Vérifiez votre clé API.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  }, [query, apiKey, selectedModel, recencyFilter, toast]);

  // Gérer la soumission du formulaire
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    performSearch();
  }, [performSearch]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="w-5 h-5" />
            <span>🔍 Recherche Intelligente Perplexity</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Configuration API */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Clé API Perplexity</label>
            <Input
              type="password"
              placeholder="pplx-xxxxxxxxxxxxxxxx"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Obtenez votre clé sur{' '}
              <a href="https://www.perplexity.ai/settings/api" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                perplexity.ai/settings/api
              </a>
            </p>
          </div>

          {/* Paramètres de recherche */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Modèle</label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {models.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      <div>
                        <div className="font-medium">{model.name}</div>
                        <div className="text-xs text-muted-foreground">{model.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Période de recherche</label>
              <Select value={recencyFilter} onValueChange={setRecencyFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {recencyOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-3 h-3" />
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Formulaire de recherche */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex space-x-2">
              <Input
                placeholder="Posez votre question ici..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={isSearching}
                className="flex-1"
              />
              <Button type="submit" disabled={isSearching || !apiKey.trim()}>
                {isSearching ? (
                  <div className="animate-spin">🔄</div>
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>
          </form>

          {/* Résultats de recherche */}
          {results.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Résultats ({results.length})</h3>
                <Button
                  onClick={() => setResults([])}
                  variant="outline"
                  size="sm"
                >
                  Effacer
                </Button>
              </div>

              <div className="max-h-96 overflow-y-auto space-y-3">
                {results.map((result, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-3">
                      {/* Question */}
                      <div className="flex items-start space-x-2">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{result.query}</p>
                        </div>
                      </div>

                      {/* Réponse */}
                      <div className="pl-4 border-l-2 border-muted">
                        <p className="text-sm whitespace-pre-wrap">{result.answer}</p>
                      </div>

                      {/* Métadonnées */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className="text-xs">
                            {models.find(m => m.id === result.model)?.name}
                          </Badge>
                          <span>{result.timestamp}</span>
                        </div>
                        <Globe className="w-3 h-3" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Informations sur les capacités */}
          <div className="text-xs text-muted-foreground p-3 bg-muted rounded-lg">
            <div className="grid grid-cols-2 gap-2">
              <div>🌐 <strong>Temps réel:</strong> Informations actualisées</div>
              <div>🎯 <strong>Contextuel:</strong> Réponses avec sources</div>
              <div>⚡ <strong>Rapide:</strong> Résultats en secondes</div>
              <div>🔒 <strong>Filtré:</strong> Contrôle de la période</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};