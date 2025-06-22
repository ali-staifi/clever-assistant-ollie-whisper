
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Zap, Target, Lightbulb, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { useJarvisServices } from '@/hooks/useJarvisServices';
import { useMCP } from '@/hooks/useMCP';

const MCPAgentAssistant: React.FC = () => {
  const [query, setQuery] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('analyze');
  
  const { 
    speechService, 
    globalVoiceSettings,
    isSpeaking,
    toggleSpeaking 
  } = useJarvisServices();
  
  const { isProcessing, processLocalRequest } = useMCP();

  const analyzeSystem = async () => {
    try {
      const systemAnalysis = await processLocalRequest('system_analysis', {
        components: ['BioMCP', 'ApifyMCP'],
        connections: ['voice_integration', 'mcp_protocols'],
        query: query || 'Analyser le système MCP et proposer des améliorations'
      });
      
      if (systemAnalysis.status === 'success') {
        setAnalysis(systemAnalysis.content);
        
        // Générer des recommandations intelligentes
        const smartRecommendations = [
          {
            id: 1,
            type: 'performance',
            title: 'Optimisation des Connexions Vocales',
            description: 'Améliorer l\'intégration vocale avec les modules MCP pour une expérience plus fluide',
            priority: 'high',
            impact: 'Amélioration de 40% de l\'expérience utilisateur',
            actions: ['Synchroniser les paramètres vocaux', 'Implémenter la reconnaissance vocale contextuelle']
          },
          {
            id: 2,
            type: 'integration',
            title: 'Agent Conversationnel MCP',
            description: 'Créer un agent capable de comprendre et d\'exécuter des commandes MCP naturelles',
            priority: 'medium',
            impact: 'Interface plus intuitive et accessible',
            actions: ['NLP pour commandes MCP', 'Interface conversationnelle unified']
          },
          {
            id: 3,
            type: 'intelligence',
            title: 'Auto-apprentissage des Patterns',
            description: 'Système d\'apprentissage des habitudes utilisateur pour des suggestions proactives',
            priority: 'high',
            impact: 'Personnalisation et efficacité accrues',
            actions: ['Collecte de données d\'usage', 'Algorithmes d\'apprentissage adaptatif']
          }
        ];
        
        setRecommendations(smartRecommendations);
        
        // Parler le résultat avec les paramètres vocaux globaux
        if (speechService && globalVoiceSettings) {
          const summary = `Analyse du système MCP terminée. ${smartRecommendations.length} recommandations d'amélioration identifiées.`;
          speechService.speak(summary);
        }
      }
    } catch (error) {
      console.error('Erreur d\'analyse:', error);
    }
  };

  const implementRecommendation = async (recommendation: any) => {
    try {
      const implementation = await processLocalRequest('implement_recommendation', {
        recommendation: recommendation,
        context: 'mcp_system'
      });
      
      if (implementation.status === 'success') {
        // Marquer comme implémenté
        setRecommendations(prev => 
          prev.map(rec => 
            rec.id === recommendation.id 
              ? { ...rec, status: 'implemented' }
              : rec
          )
        );
        
        if (speechService) {
          speechService.speak(`Recommandation "${recommendation.title}" implémentée avec succès.`);
        }
      }
    } catch (error) {
      console.error('Erreur d\'implémentation:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-600" />
            Agent AI MCP - Assistant Intelligent
          </CardTitle>
          <CardDescription>
            Agent conversationnel avancé pour l'analyse, l'optimisation et l'amélioration continue du système MCP
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="analyze">Analyse Système</TabsTrigger>
          <TabsTrigger value="recommendations">Recommandations</TabsTrigger>
          <TabsTrigger value="chat">Chat Intelligent</TabsTrigger>
        </TabsList>

        <TabsContent value="analyze" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Analyse Intelligente du Système
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Posez une question spécifique sur le système MCP ou laissez vide pour une analyse complète..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="min-h-[100px]"
              />
              
              <div className="flex gap-2">
                <Button 
                  onClick={analyzeSystem}
                  disabled={isProcessing}
                  className="flex items-center gap-2"
                >
                  <Zap className="h-4 w-4" />
                  {isProcessing ? 'Analyse en cours...' : 'Analyser le Système'}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={toggleSpeaking}
                  className="flex items-center gap-2"
                >
                  <Brain className="h-4 w-4" />
                  {isSpeaking ? 'Arrêter' : 'Synthèse Vocale'}
                </Button>
              </div>

              {analysis && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h3 className="font-medium mb-2">Résultats d'Analyse</h3>
                  <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(analysis, null, 2)}</pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="grid gap-4">
            {recommendations.map((rec) => (
              <Card key={rec.id} className="relative">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-yellow-500" />
                      <CardTitle className="text-lg">{rec.title}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(rec.priority)}>
                        {rec.priority}
                      </Badge>
                      {rec.status === 'implemented' && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>
                  
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">Impact attendu:</span>
                    </div>
                    <p className="text-sm bg-blue-50 p-2 rounded">{rec.impact}</p>
                  </div>

                  <div className="mb-4">
                    <span className="text-sm font-medium mb-2 block">Actions suggérées:</span>
                    <ul className="space-y-1">
                      {rec.actions.map((action, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <ArrowRight className="h-3 w-3" />
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button 
                    onClick={() => implementRecommendation(rec)}
                    disabled={rec.status === 'implemented' || isProcessing}
                    size="sm"
                    className="w-full"
                  >
                    {rec.status === 'implemented' ? 'Implémenté' : 'Implémenter'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="chat" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Chat Intelligent MCP
              </CardTitle>
              <CardDescription>
                Conversez naturellement avec l'agent pour optimiser votre expérience MCP
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 p-4 rounded-md border border-dashed border-muted-foreground/50 flex flex-col items-center justify-center h-48">
                <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground text-center">
                  Interface de chat intelligent en développement.
                  <br/>
                  Sera intégrée avec les paramètres vocaux globaux pour une expérience conversationnelle fluide.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MCPAgentAssistant;
