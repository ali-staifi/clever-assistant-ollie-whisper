
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MCPAgentChatService, AgentRecommendation } from '../../../services/mcp/agent/MCPAgentChatService';
import { useJarvisServices } from '@/hooks/useJarvisServices';
import { RecommendationStatsCards } from './RecommendationStatsCards';
import { RecommendationsList } from './RecommendationsList';

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

  return (
    <div className="space-y-6">
      <RecommendationStatsCards recommendations={recommendations} />
      <RecommendationsList 
        recommendations={recommendations}
        implementingId={implementingId}
        onImplement={implementRecommendation}
      />
    </div>
  );
};
