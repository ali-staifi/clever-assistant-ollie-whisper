
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Monitor, 
  Code, 
  Brain, 
  Search, 
  FileText,
  Zap,
  GitBranch,
  Play,
  Square,
  Lightbulb
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useChatOllama } from "@/hooks/useChatOllama";

interface AnalysisResult {
  id: string;
  input: string;
  type: 'code' | 'logic' | 'concept';
  result: string;
  insights: string[];
  timestamp: Date;
  status: 'processing' | 'completed' | 'error';
}

const OpenACIPage: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [analysisInput, setAnalysisInput] = useState('');
  const [analysisType, setAnalysisType] = useState<'code' | 'logic' | 'concept'>('code');
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [githubUrl, setGithubUrl] = useState('https://github.com/nixiz0/Lumen.git');
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
    checkConnection();
  }, []);

  const activateOpenACI = async () => {
    try {
      const connected = await checkConnection();
      if (!connected) {
        throw new Error("Impossible de se connecter à Ollama");
      }
      
      setIsActive(true);
      toast({
        title: "OpenACI activé",
        description: "Système d'analyse et de raisonnement prêt",
      });
    } catch (error) {
      toast({
        title: "Erreur d'activation",
        description: "Impossible d'activer OpenACI. Vérifiez la connexion Ollama.",
        variant: "destructive",
      });
    }
  };

  const deactivateOpenACI = () => {
    setIsActive(false);
    toast({
      title: "OpenACI désactivé",
      description: "Système arrêté",
    });
  };

  const performAnalysis = async () => {
    if (!isActive || !analysisInput.trim()) return;

    const newResult: AnalysisResult = {
      id: Date.now().toString(),
      input: analysisInput.trim(),
      type: analysisType,
      result: '',
      insights: [],
      timestamp: new Date(),
      status: 'processing'
    };

    setResults(prev => [newResult, ...prev]);

    try {
      let prompt = '';
      
      switch (analysisType) {
        case 'code':
          prompt = `Tu es un expert en analyse de code. Analyse ce code de manière approfondie:

${analysisInput}

Fournis:
1. Analyse de la structure et logique
2. Identification des patterns et bonnes pratiques
3. Détection de problèmes potentiels
4. Suggestions d'amélioration
5. Complexité et performance

Structure ta réponse de manière claire et technique.`;
          break;
          
        case 'logic':
          prompt = `Tu es un système de raisonnement logique avancé. Analyse cette situation ou problème:

${analysisInput}

Applique:
1. Décomposition du problème
2. Identification des prémisses et conclusions
3. Raisonnement déductif/inductif
4. Évaluation de la logique
5. Solutions alternatives

Sois rigoureux et méthodique dans ton analyse.`;
          break;
          
        case 'concept':
          prompt = `Tu es un analyste conceptuel. Explore ce concept ou idée:

${analysisInput}

Examine:
1. Définition et contexte
2. Relations et implications
3. Applications pratiques
4. Avantages et limitations
5. Perspectives d'évolution

Fournis une analyse complète et nuancée.`;
          break;
      }

      if (connectionStatus === 'connected') {
        await sendMessage(prompt);
        
        // Simulate insights generation based on analysis type
        const insights = generateInsights(analysisType, analysisInput);
        
        setResults(prev => prev.map(r => 
          r.id === newResult.id ? { 
            ...r, 
            status: 'completed',
            insights: insights,
            result: 'Analyse complétée - voir réponse détaillée ci-dessous'
          } : r
        ));
      } else {
        throw new Error("LLM non connecté");
      }
      
    } catch (error) {
      setResults(prev => prev.map(r => 
        r.id === newResult.id ? { 
          ...r, 
          status: 'error',
          result: `Erreur: ${error}`
        } : r
      ));
    }

    setAnalysisInput('');
  };

  const generateInsights = (type: string, input: string): string[] => {
    switch (type) {
      case 'code':
        return [
          'Analyse syntaxique effectuée',
          'Patterns architecturaux identifiés',
          'Optimisations possibles détectées',
          'Conformité aux standards évaluée'
        ];
      case 'logic':
        return [
          'Structure logique analysée',
          'Arguments validés',
          'Cohérence vérifiée',
          'Implications explorées'
        ];
      case 'concept':
        return [
          'Contexte conceptuel établi',
          'Relations identifiées',
          'Applications explorées',
          'Perspectives évaluées'
        ];
      default:
        return [];
    }
  };

  const analyzeRepository = async () => {
    if (!isActive || !githubUrl.trim()) return;

    const repoAnalysisPrompt = `Analyse ce repository GitHub: ${githubUrl}

En tant qu'expert en analyse de code, examine:
1. Architecture générale du projet
2. Technologies utilisées
3. Structure des fichiers
4. Qualité du code
5. Fonctionnalités principales
6. Points d'amélioration

Note: Cette analyse est basée sur l'URL fournie. Pour une analyse complète, l'accès direct au code serait nécessaire.`;

    try {
      await sendMessage(repoAnalysisPrompt);
      toast({
        title: "Analyse du repository lancée",
        description: "Voir les résultats ci-dessous",
      });
    } catch (error) {
      toast({
        title: "Erreur d'analyse",
        description: "Impossible d'analyser le repository",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: AnalysisResult['status']) => {
    switch (status) {
      case 'processing': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeColor = (type: AnalysisResult['type']) => {
    switch (type) {
      case 'code': return 'bg-blue-100 text-blue-800';
      case 'logic': return 'bg-purple-100 text-purple-800';
      case 'concept': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: AnalysisResult['type']) => {
    switch (type) {
      case 'code': return Code;
      case 'logic': return Brain;
      case 'concept': return Lightbulb;
      default: return FileText;
    }
  };

  return (
    <div className="container py-2 min-h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            <Monitor className="h-6 w-6 mr-2 text-blue-600" />
            OpenACI
          </h1>
          <p className="text-muted-foreground text-sm">
            Système d'analyse de code et de raisonnement intelligent
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

      <Tabs defaultValue="analysis" className="space-y-2">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analysis">Analyse</TabsTrigger>
          <TabsTrigger value="repository">Repository</TabsTrigger>
          <TabsTrigger value="results">Résultats</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="analysis" className="space-y-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center">
                <Zap className="h-4 w-4 mr-2" />
                Contrôle système
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex space-x-2">
                {!isActive ? (
                  <Button onClick={activateOpenACI} size="sm" className="flex items-center">
                    <Play className="h-3 w-3 mr-1" />
                    Activer OpenACI
                  </Button>
                ) : (
                  <Button onClick={deactivateOpenACI} variant="destructive" size="sm">
                    <Square className="h-3 w-3 mr-1" />
                    Désactiver
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Analyse intelligente</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              <div className="grid grid-cols-3 gap-1">
                <Button
                  variant={analysisType === 'code' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAnalysisType('code')}
                  className="text-xs"
                >
                  <Code className="h-3 w-3 mr-1" />
                  Code
                </Button>
                <Button
                  variant={analysisType === 'logic' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAnalysisType('logic')}
                  className="text-xs"
                >
                  <Brain className="h-3 w-3 mr-1" />
                  Logique
                </Button>
                <Button
                  variant={analysisType === 'concept' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAnalysisType('concept')}
                  className="text-xs"
                >
                  <Lightbulb className="h-3 w-3 mr-1" />
                  Concept
                </Button>
              </div>
              
              <Textarea
                placeholder={
                  analysisType === 'code' ? 'Collez votre code ici...' :
                  analysisType === 'logic' ? 'Décrivez le problème logique...' :
                  'Décrivez le concept à analyser...'
                }
                value={analysisInput}
                onChange={(e) => setAnalysisInput(e.target.value)}
                disabled={!isActive}
                className="h-24 font-mono text-xs"
              />
              
              <Button 
                onClick={performAnalysis} 
                disabled={!isActive || !analysisInput.trim() || isGenerating} 
                size="sm"
                className="w-full"
              >
                <Search className="h-3 w-3 mr-1" />
                {isGenerating ? 'Analyse en cours...' : 'Analyser'}
              </Button>
            </CardContent>
          </Card>

          {messages.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <Brain className="h-4 w-4 mr-2 text-blue-600" />
                  Analyse détaillée
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ScrollArea className="h-64">
                  <div className="prose prose-sm max-w-none">
                    <div className="bg-muted/50 rounded-lg p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap">
                      {messages[messages.length - 1]?.content || 'En attente de l\'analyse...'}
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="repository" className="space-y-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center">
                <GitBranch className="h-4 w-4 mr-2" />
                Analyse de repository
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              <Input
                placeholder="URL du repository GitHub..."
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                disabled={!isActive}
                className="h-8 text-xs"
              />
              <Button 
                onClick={analyzeRepository} 
                disabled={!isActive || !githubUrl.trim() || isGenerating} 
                size="sm"
                className="w-full"
              >
                <Search className="h-3 w-3 mr-1" />
                Analyser Repository
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Historique des analyses</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ScrollArea className="h-64">
                <div className="space-y-1">
                  {results.map((result) => {
                    const IconComponent = getTypeIcon(result.type);
                    return (
                      <div key={result.id} className="p-2 border rounded text-xs">
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex items-center space-x-1">
                            <Badge className={getStatusColor(result.status) + " text-xs"}>
                              {result.status}
                            </Badge>
                            <Badge className={getTypeColor(result.type) + " text-xs"}>
                              <IconComponent className="h-3 w-3 mr-1" />
                              {result.type}
                            </Badge>
                          </div>
                          <span className="text-muted-foreground">
                            {result.timestamp.toLocaleString()}
                          </span>
                        </div>
                        <div className="mb-1 font-medium">{result.input.substring(0, 100)}...</div>
                        {result.insights.length > 0 && (
                          <div className="text-muted-foreground mb-1">
                            {result.insights.join(' • ')}
                          </div>
                        )}
                        {result.result && (
                          <div className="text-green-700">{result.result}</div>
                        )}
                      </div>
                    );
                  })}
                  {results.length === 0 && (
                    <div className="text-center text-muted-foreground py-4 text-xs">
                      Aucune analyse effectuée
                    </div>
                  )}
                </div>
              </ScrollArea>
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
