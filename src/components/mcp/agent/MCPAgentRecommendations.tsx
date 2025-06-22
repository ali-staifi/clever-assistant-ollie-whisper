
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Target, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Zap, 
  TrendingUp,
  Settings,
  Shield
} from 'lucide-react';
import { MCPAgentChatService, AgentRecommendation } from '../../../services/mcp/agent/MCPAgentChatService';
import { useJarvisServices } from '@/hooks/useJarvisServices';

export const MCPAgentRecommendations: React.FC = () => {
  const [recommendations, setRecommendations] = useState<AgentRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [implementingId, setImplementingId] = useState<string | null>(null);
  const [chatService] = useState(() => new MCPAgentChatService());
  
  const { speechService } = useJarvisServices();

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    setIsLoading(true);
    try {
      // Simuler le chargement des recommandations
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockRecommendations: AgentRecommendation[] = [
        {
          id: '1',
          type: 'performance',
          priority: 'high',
          title: 'Cache Intelligent MCP',
          description: 'Implémenter un système de cache adaptatif pour optimiser les requêtes répétitives',
          impact: 'Réduction de 60% du temps de réponse moyen',
          implementation: {
            difficulty: 'medium',
            estimatedTime: '2-3 heures',
            steps: [
              'Analyser les patterns de requêtes actuels',
              'Configurer Redis/Memory cache',
              'Implémenter les politiques d\'expiration',
              'Tester et optimiser les performances'
            ]
          },
          status: 'pending'
        },
        {
          id: '2',
          type: 'integration',
          priority: 'high',
          title: 'Unification Vocale Jarvis-MCP',
          description: 'Créer une interface vocale centralisée pour tous les modules MCP',
          impact: 'Expérience utilisateur 40% plus fluide',
          implementation: {
            difficulty: 'hard',
            estimatedTime: '4-5 heures',
            steps: [
              'Standardiser les paramètres vocaux globaux',
              'Créer le gestionnaire vocal central',
              'Intégrer reconnaissance contextuelle',
              'Synchroniser avec tous les agents MCP'
            ]
          },
          status: 'pending'
        },
        {
          id: '3',
          type: 'optimization',
          priority: 'medium',
          title: 'Monitoring Temps Réel',
          description: 'Système de surveillance en temps réel des performances MCP',
          impact: 'Détection proactive des problèmes',
          implementation: {
            difficulty: 'medium',
            estimatedTime: '3 heures',
            steps: [
              'Implémenter collecteurs de métriques',
              'Créer tableau de bord temps réel',
              'Configurer alertes automatiques',
              'Intégrer notifications vocales'
            ]
          },
          status: 'pending'
        },
        {
          id: '4',
          type: 'security',
          priority: 'medium',
          title: 'Sandbox Sécurisé',
          description: 'Environnement d\'exécution sécurisé pour les scripts MCP',
          impact: 'Sécurité renforcée de 80%',
          implementation: {
            difficulty: 'hard',
            estimatedTime: '6 heures',
            steps: [
              'Créer environnement isolé',
              'Implémenter validation code',
              'Configurer permissions granulaires',
              'Tester sécurité'
            ]
          },
          status: 'pending'
        }
      ];
      
      setRecommendations(mockRecommendations);
    } catch (error) {
      console.error('Erreur chargement recommandations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const implementRecommendation = async (recommendation: AgentRecommendation) => {
    setImplementingId(recommendation.id);
    
    try {
      // Notification vocale de début
      if (speechService) {
        speechService.speak(`Implémentation de "${recommendation.title}" en cours...`);
      }

      const success = await chatService.implementRecommendation(recommendation.id);
      
      if (success) {
        setRecommendations(prev =>
          prev.map(rec =>
            rec.id === recommendation.id
              ? { ...rec, status: 'completed' }
              : rec
          )
        );
        
        if (speechService) {
          speechService.speak(`"${recommendation.title}" implémenté avec succès!`);
        }
      } else {
        setRecommendations(prev =>
          prev.map(rec =>
            rec.id === recommendation.id
              ? { ...rec, status: 'failed' }
              : rec
          )
        );
        
        if (speechService) {
          speechService.speak(`Échec de l'implémentation de "${recommendation.title}".`);
        }
      }
    } catch (error) {
      console.error('Erreur implémentation:', error);
      if (speechService) {
        speechService.speak('Erreur lors de l\'implémentation.');
      }
    } finally {
      setImplementingId(null);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'performance': return <TrendingUp className="h-4 w-4" />;
      case 'integration': return <Zap className="h-4 w-4" />;
      case 'optimization': return <Settings className="h-4 w-4" />;
      case 'security': return <Shield className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'in_progress': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getDifficultyProgress = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 25;
      case 'medium': return 50;
      case 'hard': return 75;
      default: return 0;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Chargement des recommandations...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const pendingRecommendations = recommendations.filter(r => r.status === 'pending');
  const completedRecommendations = recommendations.filter(r => r.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total</p>
                <p className="text-2xl font-bold">{recommendations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium">En attente</p>
                <p className="text-2xl font-bold">{pendingRecommendations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Complétées</p>
                <p className="text-2xl font-bold">{completedRecommendations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium">Critiques</p>
                <p className="text-2xl font-bold">
                  {recommendations.filter(r => r.priority === 'critical').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des recommandations */}
      <div className="space-y-4">
        {recommendations.map((recommendation) => (
          <Card key={recommendation.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {getTypeIcon(recommendation.type)}
                  <div>
                    <CardTitle className="text-lg">{recommendation.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {recommendation.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getPriorityColor(recommendation.priority)}>
                    {recommendation.priority}
                  </Badge>
                  {recommendation.status === 'completed' && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Impact */}
              <div className="bg-blue-50 p-3 rounded-lg border">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Impact attendu</span>
                </div>
                <p className="text-sm">{recommendation.impact}</p>
              </div>

              {/* Détails d'implémentation */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Difficulté</span>
                  <div className="flex items-center gap-2">
                    <Progress value={getDifficultyProgress(recommendation.implementation.difficulty)} className="w-20" />
                    <span className="text-sm capitalize">{recommendation.implementation.difficulty}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Temps estimé</span>
                  <span className="text-sm">{recommendation.implementation.estimatedTime}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Statut</span>
                  <span className={`text-sm font-medium ${getStatusColor(recommendation.status)}`}>
                    {recommendation.status === 'pending' ? 'En attente' :
                     recommendation.status === 'completed' ? 'Complété' :
                     recommendation.status === 'failed' ? 'Échec' : 'En cours'}
                  </span>
                </div>
              </div>

              <Separator />

              {/* Étapes d'implémentation */}
              <div>
                <span className="text-sm font-medium mb-2 block">Étapes d'implémentation:</span>
                <ul className="space-y-1">
                  {recommendation.implementation.steps.map((step, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs">
                        {index + 1}
                      </div>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => implementRecommendation(recommendation)}
                  disabled={
                    recommendation.status === 'completed' || 
                    implementingId === recommendation.id ||
                    implementingId !== null
                  }
                  size="sm"
                  className="flex-1"
                >
                  {implementingId === recommendation.id ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Implémentation...
                    </>
                  ) : recommendation.status === 'completed' ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Complété
                    </>
                  ) : (
                    'Implémenter'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
