
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Brain, 
  Database, 
  Search, 
  GitBranch, 
  Code, 
  FileText,
  Settings,
  Play,
  Square
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useChatOllama } from "@/hooks/useChatOllama";

interface ReasoningSession {
  id: string;
  query: string;
  reasoning: string[];
  conclusion: string;
  timestamp: Date;
  status: 'processing' | 'completed' | 'error';
}

interface MemoryEntry {
  id: string;
  content: string;
  type: 'fact' | 'procedure' | 'concept';
  tags: string[];
  timestamp: Date;
}

const GitDatabasePage: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [query, setQuery] = useState('');
  const [sessions, setSessions] = useState<ReasoningSession[]>([]);
  const [memory, setMemory] = useState<MemoryEntry[]>([]);
  const [memoryContent, setMemoryContent] = useState('');
  const [memoryType, setMemoryType] = useState<'fact' | 'procedure' | 'concept'>('fact');
  const [memoryTags, setMemoryTags] = useState('');
  const { toast } = useToast();
  
  const {
    ollamaUrl,
    ollamaModel,
    connectionStatus,
    availableModels,
    messages,
    isGenerating,
    setOllamaUrl,
    setOllamaModel,
    checkConnection,
    sendMessage,
    clearMessages
  } = useChatOllama();

  useEffect(() => {
    // Load initial memory
    const initialMemory: MemoryEntry[] = [
      {
        id: '1',
        content: 'Absolute Zero Reasoner utilise des techniques de raisonnement automatique avancées',
        type: 'fact',
        tags: ['système', 'raisonnement'],
        timestamp: new Date()
      },
      {
        id: '2',
        content: 'Analyser le problème étape par étape, identifier les contraintes, générer des hypothèses',
        type: 'procedure',
        tags: ['méthode', 'analyse'],
        timestamp: new Date()
      }
    ];
    setMemory(initialMemory);
    
    // Auto-check connection
    checkConnection();
  }, []);

  const activateSystem = async () => {
    try {
      // Check Ollama connection first
      const connected = await checkConnection();
      if (!connected) {
        throw new Error("Impossible de se connecter à Ollama");
      }
      
      setIsActive(true);
      toast({
        title: "Absolute Zero Reasoner activé",
        description: "Le système de raisonnement automatique est maintenant actif",
      });
    } catch (error) {
      toast({
        title: "Erreur d'activation",
        description: "Impossible d'activer le système. Vérifiez la connexion Ollama.",
        variant: "destructive",
      });
    }
  };

  const deactivateSystem = () => {
    setIsActive(false);
    toast({
      title: "Système désactivé",
      description: "Absolute Zero Reasoner a été désactivé",
    });
  };

  const processQuery = async () => {
    if (!isActive || !query.trim()) return;

    const newSession: ReasoningSession = {
      id: Date.now().toString(),
      query: query.trim(),
      reasoning: [],
      conclusion: '',
      timestamp: new Date(),
      status: 'processing'
    };

    setSessions(prev => [newSession, ...prev]);

    try {
      // Create reasoning prompt with memory context
      const memoryContext = memory.map(m => m.content).join('\n');
      const reasoningPrompt = `Tu es Absolute Zero Reasoner, un système de raisonnement automatique avancé développé par LeapLab THU. Tu as accès à la mémoire partagée contenant: ${memoryContext}. 

Utilise des techniques de raisonnement sophistiquées pour analyser et résoudre cette question: ${query.trim()}

Structure ta réponse ainsi:
1. Analyse du problème
2. Identification des contraintes
3. Génération d'hypothèses  
4. Évaluation logique
5. Conclusion raisonnée`;

      if (connectionStatus === 'connected') {
        await sendMessage(reasoningPrompt);
        
        // Update session status
        setSessions(prev => prev.map(s => 
          s.id === newSession.id ? { 
            ...s, 
            status: 'completed',
            reasoning: ['Analyse terminée', 'Contraintes évaluées', 'Hypothèses générées', 'Conclusion formulée'],
            conclusion: 'Analyse complétée avec succès'
          } : s
        ));
      } else {
        throw new Error("LLM non connecté");
      }
      
    } catch (error) {
      setSessions(prev => prev.map(s => 
        s.id === newSession.id ? { 
          ...s, 
          status: 'error',
          conclusion: `Erreur: ${error}`
        } : s
      ));
    }

    setQuery('');
  };

  const addMemoryEntry = () => {
    if (!memoryContent.trim()) return;

    const newEntry: MemoryEntry = {
      id: Date.now().toString(),
      content: memoryContent.trim(),
      type: memoryType,
      tags: memoryTags.split(',').map(t => t.trim()).filter(t => t),
      timestamp: new Date()
    };

    setMemory(prev => [newEntry, ...prev]);
    setMemoryContent('');
    setMemoryTags('');
    
    toast({
      title: "Entrée ajoutée",
      description: "Nouvelle entrée ajoutée à la mémoire partagée",
    });
  };

  const getStatusColor = (status: ReasoningSession['status']) => {
    switch (status) {
      case 'processing': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeColor = (type: MemoryEntry['type']) => {
    switch (type) {
      case 'fact': return 'bg-green-100 text-green-800';
      case 'procedure': return 'bg-blue-100 text-blue-800';
      case 'concept': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container py-2 min-h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            <Brain className="h-6 w-6 mr-2 text-purple-600" />
            Absolute Zero Reasoner
          </h1>
          <p className="text-muted-foreground text-sm">
            Système de raisonnement automatique avancé
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Actif" : "Inactif"}
          </Badge>
          <Badge variant={connectionStatus === 'connected' ? "default" : "secondary"}>
            LLM: {connectionStatus}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="reasoning" className="space-y-2">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="reasoning">Raisonnement</TabsTrigger>
          <TabsTrigger value="memory">Mémoire</TabsTrigger>
          <TabsTrigger value="llm">LLM Config</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="reasoning" className="space-y-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center">
                <Settings className="h-4 w-4 mr-2" />
                Contrôle du système
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex space-x-2">
                {!isActive ? (
                  <Button onClick={activateSystem} size="sm" className="flex items-center">
                    <Play className="h-3 w-3 mr-1" />
                    Activer
                  </Button>
                ) : (
                  <Button onClick={deactivateSystem} variant="destructive" size="sm">
                    <Square className="h-3 w-3 mr-1" />
                    Désactiver
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Requête de raisonnement</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <Textarea
                  placeholder="Posez votre question ou décrivez le problème à analyser..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  disabled={!isActive}
                  className="h-16 font-mono text-sm"
                />
                <Button 
                  onClick={processQuery} 
                  disabled={!isActive || !query.trim() || isGenerating} 
                  size="sm"
                >
                  <Brain className="h-3 w-3 mr-1" />
                  {isGenerating ? 'Analyse en cours...' : 'Analyser'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Display latest LLM response with improved formatting */}
          {messages.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <Brain className="h-4 w-4 mr-2 text-purple-600" />
                  Réponse du système
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ScrollArea className="h-64">
                  <div className="prose prose-sm max-w-none">
                    <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                      {messages[messages.length - 1]?.content || 'En attente de la réponse...'}
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="memory" className="space-y-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Ajouter à la mémoire</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              <Textarea
                placeholder="Contenu de la mémoire..."
                value={memoryContent}
                onChange={(e) => setMemoryContent(e.target.value)}
                className="h-16"
              />
              <div className="grid grid-cols-2 gap-2">
                <select 
                  value={memoryType}
                  onChange={(e) => setMemoryType(e.target.value as any)}
                  className="p-1 border rounded text-xs h-8"
                >
                  <option value="fact">Fait</option>
                  <option value="procedure">Procédure</option>
                  <option value="concept">Concept</option>
                </select>
                <Input
                  placeholder="Tags (séparés par virgules)"
                  value={memoryTags}
                  onChange={(e) => setMemoryTags(e.target.value)}
                  className="h-8"
                />
              </div>
              <Button onClick={addMemoryEntry} disabled={!memoryContent.trim()} size="sm">
                <Database className="h-3 w-3 mr-1" />
                Ajouter
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Mémoire partagée</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ScrollArea className="h-48">
                <div className="space-y-1">
                  {memory.map((entry) => (
                    <div key={entry.id} className="p-2 border rounded text-xs">
                      <div className="flex justify-between items-start mb-1">
                        <Badge className={getTypeColor(entry.type) + " text-xs"}>
                          {entry.type}
                        </Badge>
                        <span className="text-muted-foreground">
                          {entry.timestamp.toLocaleString()}
                        </span>
                      </div>
                      <div className="mb-1">{entry.content}</div>
                      {entry.tags.length > 0 && (
                        <div className="flex gap-1">
                          {entry.tags.map((tag, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {tag}
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
        </TabsContent>

        <TabsContent value="llm" className="space-y-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Configuration LLM</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium">URL Ollama</label>
                  <Input
                    value={ollamaUrl}
                    onChange={(e) => setOllamaUrl(e.target.value)}
                    placeholder="http://localhost:11434"
                    className="h-8"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium">Modèle</label>
                  <select 
                    value={ollamaModel}
                    onChange={(e) => setOllamaModel(e.target.value)}
                    className="w-full p-1 border rounded text-xs h-8"
                  >
                    {availableModels.map(model => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                </div>
              </div>
              <Button onClick={checkConnection} size="sm">
                Tester la connexion
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Sessions de raisonnement</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ScrollArea className="h-64">
                <div className="space-y-1">
                  {sessions.map((session) => (
                    <div key={session.id} className="p-2 border rounded text-xs">
                      <div className="flex justify-between items-start mb-1">
                        <Badge className={getStatusColor(session.status) + " text-xs"}>
                          {session.status}
                        </Badge>
                        <span className="text-muted-foreground">
                          {session.timestamp.toLocaleString()}
                        </span>
                      </div>
                      <div className="font-medium mb-1">{session.query}</div>
                      {session.reasoning.length > 0 && (
                        <div className="text-muted-foreground mb-1">
                          {session.reasoning.join(' → ')}
                        </div>
                      )}
                      {session.conclusion && (
                        <div className="font-medium">{session.conclusion}</div>
                      )}
                    </div>
                  ))}
                  {sessions.length === 0 && (
                    <div className="text-center text-muted-foreground py-4 text-xs">
                      Aucune session de raisonnement
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GitDatabasePage;
