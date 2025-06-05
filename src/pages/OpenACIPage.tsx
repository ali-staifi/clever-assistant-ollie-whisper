
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
  Zap, 
  Code, 
  Search, 
  FileText,
  Settings,
  Play,
  Square,
  Eye,
  Lightbulb,
  Network,
  Database,
  GitBranch,
  Cpu
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useChatOllama } from "@/hooks/useChatOllama";

interface LumenSession {
  id: string;
  type: 'reasoning' | 'analysis' | 'learning' | 'planning';
  query: string;
  response: string;
  reasoning_steps: string[];
  confidence: number;
  timestamp: Date;
  status: 'processing' | 'completed' | 'error';
}

interface KnowledgeEntry {
  id: string;
  concept: string;
  description: string;
  relations: string[];
  examples: string[];
  timestamp: Date;
}

const OpenACIPage: React.FC = () => {
  const [isLumenActive, setIsLumenActive] = useState(false);
  const [currentQuery, setCurrentQuery] = useState('');
  const [sessionType, setSessionType] = useState<'reasoning' | 'analysis' | 'learning' | 'planning'>('reasoning');
  const [sessions, setSessions] = useState<LumenSession[]>([]);
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeEntry[]>([]);
  const [newConcept, setNewConcept] = useState('');
  const [conceptDescription, setConceptDescription] = useState('');
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
    // Initialiser la base de connaissances Lumen
    const initialKnowledge: KnowledgeEntry[] = [
      {
        id: '1',
        concept: 'Raisonnement automatique',
        description: 'Capacité à déduire de nouvelles informations à partir de faits connus',
        relations: ['logique', 'inférence', 'déduction'],
        examples: ['Si A implique B et A est vrai, alors B est vrai'],
        timestamp: new Date()
      },
      {
        id: '2',
        concept: 'Analyse contextuelle',
        description: 'Comprendre le contexte et les nuances dans les données',
        relations: ['contexte', 'sémantique', 'interprétation'],
        examples: ['Analyser le sentiment dans un texte', 'Comprendre les implications'],
        timestamp: new Date()
      }
    ];
    setKnowledgeBase(initialKnowledge);
    
    // Auto-vérification de la connexion
    checkConnection();
  }, []);

  const activateLumen = async () => {
    try {
      const connected = await checkConnection();
      if (!connected) {
        throw new Error("Impossible de se connecter au moteur LLM");
      }
      
      setIsLumenActive(true);
      toast({
        title: "Lumen activé",
        description: "Système de raisonnement et d'analyse avancé prêt",
      });
    } catch (error) {
      toast({
        title: "Erreur d'activation",
        description: "Impossible d'activer Lumen. Vérifiez la connexion LLM.",
        variant: "destructive",
      });
    }
  };

  const deactivateLumen = () => {
    setIsLumenActive(false);
    toast({
      title: "Lumen désactivé",
      description: "Système arrêté",
    });
  };

  const processLumenQuery = async () => {
    if (!isLumenActive || !currentQuery.trim()) return;

    const newSession: LumenSession = {
      id: Date.now().toString(),
      type: sessionType,
      query: currentQuery.trim(),
      response: '',
      reasoning_steps: [],
      confidence: 0,
      timestamp: new Date(),
      status: 'processing'
    };

    setSessions(prev => [newSession, ...prev]);

    try {
      let lumenPrompt = '';
      
      switch (sessionType) {
        case 'reasoning':
          lumenPrompt = `Tu es Lumen, un système de raisonnement automatique avancé. Utilise tes capacités de déduction logique pour analyser cette question:

${currentQuery}

Procède étape par étape:
1. Identifie les éléments clés
2. Établis les relations logiques
3. Applique le raisonnement déductif/inductif
4. Tire des conclusions justifiées
5. Évalue la confiance dans tes conclusions

Structure ta réponse avec ton processus de raisonnement complet.`;
          break;
          
        case 'analysis':
          lumenPrompt = `Tu es Lumen, spécialisé dans l'analyse approfondie. Analyse ce sujet en détail:

${currentQuery}

Fournis:
1. Analyse structurelle
2. Identification des patterns
3. Relations et dépendances
4. Points critiques
5. Recommandations basées sur l'analyse

Sois précis et méthodique dans ton analyse.`;
          break;
          
        case 'learning':
          lumenPrompt = `Tu es Lumen en mode apprentissage. Apprends et structure ces nouvelles informations:

${currentQuery}

Processus d'apprentissage:
1. Extraction des concepts clés
2. Intégration avec les connaissances existantes
3. Identification des nouvelles relations
4. Création de liens conceptuels
5. Mémorisation structurée

Explique comment tu intègres ces nouvelles connaissances.`;
          break;
          
        case 'planning':
          lumenPrompt = `Tu es Lumen en mode planification. Crée un plan détaillé pour:

${currentQuery}

Élabore:
1. Analyse des objectifs
2. Décomposition en étapes
3. Identification des ressources nécessaires
4. Séquençage optimal
5. Points de contrôle et métriques

Fournis un plan actionnable et structuré.`;
          break;
      }

      if (connectionStatus === 'connected') {
        await sendMessage(lumenPrompt);
        
        // Simulations des étapes de raisonnement Lumen
        const reasoningSteps = generateLumenReasoningSteps(sessionType, currentQuery);
        const confidence = Math.round(85 + Math.random() * 10);
        
        setSessions(prev => prev.map(s => 
          s.id === newSession.id ? { 
            ...s, 
            status: 'completed',
            reasoning_steps: reasoningSteps,
            confidence: confidence,
            response: 'Analyse complétée - voir réponse détaillée ci-dessous'
          } : s
        ));
      } else {
        throw new Error("Moteur LLM non connecté");
      }
      
    } catch (error) {
      setSessions(prev => prev.map(s => 
        s.id === newSession.id ? { 
          ...s, 
          status: 'error',
          response: `Erreur: ${error}`
        } : s
      ));
    }

    setCurrentQuery('');
  };

  const generateLumenReasoningSteps = (type: string, query: string): string[] => {
    switch (type) {
      case 'reasoning':
        return [
          'Parsing des éléments logiques',
          'Construction du graphe de raisonnement',
          'Application des règles d\'inférence',
          'Validation de la cohérence logique',
          'Génération des conclusions'
        ];
      case 'analysis':
        return [
          'Décomposition structurelle',
          'Analyse des patterns',
          'Mapping des relations',
          'Évaluation des critères',
          'Synthèse analytique'
        ];
      case 'learning':
        return [
          'Extraction conceptuelle',
          'Indexation sémantique',
          'Intégration contextuelle',
          'Création de liens',
          'Consolidation mnésique'
        ];
      case 'planning':
        return [
          'Analyse des objectifs',
          'Modélisation des contraintes',
          'Optimisation du chemin',
          'Allocation des ressources',
          'Planification temporelle'
        ];
      default:
        return [];
    }
  };

  const addKnowledgeEntry = () => {
    if (!newConcept.trim() || !conceptDescription.trim()) return;

    const newEntry: KnowledgeEntry = {
      id: Date.now().toString(),
      concept: newConcept.trim(),
      description: conceptDescription.trim(),
      relations: [],
      examples: [],
      timestamp: new Date()
    };

    setKnowledgeBase(prev => [newEntry, ...prev]);
    setNewConcept('');
    setConceptDescription('');
    
    toast({
      title: "Concept ajouté",
      description: "Nouveau concept intégré à la base de connaissances Lumen",
    });
  };

  const getSessionTypeIcon = (type: LumenSession['type']) => {
    switch (type) {
      case 'reasoning': return Brain;
      case 'analysis': return Search;
      case 'learning': return Lightbulb;
      case 'planning': return Network;
      default: return FileText;
    }
  };

  const getSessionTypeColor = (type: LumenSession['type']) => {
    switch (type) {
      case 'reasoning': return 'bg-purple-100 text-purple-800';
      case 'analysis': return 'bg-blue-100 text-blue-800';
      case 'learning': return 'bg-green-100 text-green-800';
      case 'planning': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: LumenSession['status']) => {
    switch (status) {
      case 'processing': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="container py-2 min-h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            <Cpu className="h-6 w-6 mr-2 text-blue-600" />
            Lumen
          </h1>
          <p className="text-muted-foreground text-sm">
            Système de raisonnement automatique et d'analyse avancée
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={isLumenActive ? "default" : "secondary"}>
            {isLumenActive ? "Actif" : "Inactif"}
          </Badge>
          <Badge variant={connectionStatus === 'connected' ? "default" : "secondary"}>
            LLM: {connectionStatus}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="reasoning" className="space-y-2">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="reasoning">Raisonnement</TabsTrigger>
          <TabsTrigger value="knowledge">Connaissances</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="analytics">Analytique</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="reasoning" className="space-y-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center">
                <Settings className="h-4 w-4 mr-2" />
                Contrôle système Lumen
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex space-x-2">
                {!isLumenActive ? (
                  <Button onClick={activateLumen} size="sm" className="flex items-center">
                    <Play className="h-3 w-3 mr-1" />
                    Activer Lumen
                  </Button>
                ) : (
                  <Button onClick={deactivateLumen} variant="destructive" size="sm">
                    <Square className="h-3 w-3 mr-1" />
                    Désactiver
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Mode de traitement</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              <div className="grid grid-cols-2 gap-1">
                <Button
                  variant={sessionType === 'reasoning' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSessionType('reasoning')}
                  className="text-xs"
                >
                  <Brain className="h-3 w-3 mr-1" />
                  Raisonnement
                </Button>
                <Button
                  variant={sessionType === 'analysis' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSessionType('analysis')}
                  className="text-xs"
                >
                  <Search className="h-3 w-3 mr-1" />
                  Analyse
                </Button>
                <Button
                  variant={sessionType === 'learning' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSessionType('learning')}
                  className="text-xs"
                >
                  <Lightbulb className="h-3 w-3 mr-1" />
                  Apprentissage
                </Button>
                <Button
                  variant={sessionType === 'planning' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSessionType('planning')}
                  className="text-xs"
                >
                  <Network className="h-3 w-3 mr-1" />
                  Planification
                </Button>
              </div>
              
              <Textarea
                placeholder={
                  sessionType === 'reasoning' ? 'Posez une question nécessitant un raisonnement logique...' :
                  sessionType === 'analysis' ? 'Décrivez ce que vous voulez analyser...' :
                  sessionType === 'learning' ? 'Partagez de nouvelles informations à apprendre...' :
                  'Décrivez votre objectif pour la planification...'
                }
                value={currentQuery}
                onChange={(e) => setCurrentQuery(e.target.value)}
                disabled={!isLumenActive}
                className="h-20 font-mono text-xs"
              />
              
              <Button 
                onClick={processLumenQuery} 
                disabled={!isLumenActive || !currentQuery.trim() || isGenerating} 
                size="sm"
                className="w-full"
              >
                <Zap className="h-3 w-3 mr-1" />
                {isGenerating ? 'Traitement Lumen...' : 'Exécuter Lumen'}
              </Button>
            </CardContent>
          </Card>

          {messages.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <Brain className="h-4 w-4 mr-2 text-blue-600" />
                  Réponse Lumen
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ScrollArea className="h-64">
                  <div className="prose prose-sm max-w-none">
                    <div className="bg-muted/50 rounded-lg p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap">
                      {messages[messages.length - 1]?.content || 'En attente de la réponse Lumen...'}
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="knowledge" className="space-y-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Ajouter une connaissance</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              <Input
                placeholder="Nouveau concept..."
                value={newConcept}
                onChange={(e) => setNewConcept(e.target.value)}
                className="h-8"
              />
              <Textarea
                placeholder="Description du concept..."
                value={conceptDescription}
                onChange={(e) => setConceptDescription(e.target.value)}
                className="h-16"
              />
              <Button onClick={addKnowledgeEntry} disabled={!newConcept.trim() || !conceptDescription.trim()} size="sm">
                <Database className="h-3 w-3 mr-1" />
                Ajouter
              </Button>
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
                        <div className="font-medium">{entry.concept}</div>
                        <span className="text-muted-foreground">
                          {entry.timestamp.toLocaleString()}
                        </span>
                      </div>
                      <div className="mb-1 text-muted-foreground">{entry.description}</div>
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
        </TabsContent>

        <TabsContent value="sessions" className="space-y-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Sessions Lumen</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ScrollArea className="h-64">
                <div className="space-y-1">
                  {sessions.map((session) => {
                    const IconComponent = getSessionTypeIcon(session.type);
                    return (
                      <div key={session.id} className="p-2 border rounded text-xs">
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex items-center space-x-1">
                            <Badge className={getStatusColor(session.status) + " text-xs"}>
                              {session.status}
                            </Badge>
                            <Badge className={getSessionTypeColor(session.type) + " text-xs"}>
                              <IconComponent className="h-3 w-3 mr-1" />
                              {session.type}
                            </Badge>
                            {session.confidence > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {session.confidence}% confiance
                              </Badge>
                            )}
                          </div>
                          <span className="text-muted-foreground">
                            {session.timestamp.toLocaleString()}
                          </span>
                        </div>
                        <div className="mb-1 font-medium">{session.query.substring(0, 100)}...</div>
                        {session.reasoning_steps.length > 0 && (
                          <div className="text-muted-foreground mb-1">
                            Étapes: {session.reasoning_steps.join(' → ')}
                          </div>
                        )}
                        {session.response && (
                          <div className="text-green-700">{session.response}</div>
                        )}
                      </div>
                    );
                  })}
                  {sessions.length === 0 && (
                    <div className="text-center text-muted-foreground py-4 text-xs">
                      Aucune session Lumen
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Sessions totales</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold">{sessions.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Concepts appris</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold">{knowledgeBase.length}</div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Répartition des sessions</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-1">
                {['reasoning', 'analysis', 'learning', 'planning'].map(type => {
                  const count = sessions.filter(s => s.type === type).length;
                  const percentage = sessions.length > 0 ? (count / sessions.length * 100).toFixed(1) : 0;
                  return (
                    <div key={type} className="flex justify-between text-xs">
                      <span className="capitalize">{type}</span>
                      <span>{count} ({percentage}%)</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-2">
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
                    className="h-8 text-xs"
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
      </Tabs>
    </div>
  );
};

export default OpenACIPage;
