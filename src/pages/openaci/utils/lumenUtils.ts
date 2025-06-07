
import { LumenSession, KnowledgeEntry } from '../types';

export const generateLumenReasoningSteps = (type: LumenSession['type'], query: string): string[] => {
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

export const generateLumenPrompt = (sessionType: LumenSession['type'], query: string): string => {
  switch (sessionType) {
    case 'reasoning':
      return `Tu es Lumen, un système de raisonnement automatique avancé. Utilise tes capacités de déduction logique pour analyser cette question:

${query}

Procède étape par étape:
1. Identifie les éléments clés
2. Établis les relations logiques
3. Applique le raisonnement déductif/inductif
4. Tire des conclusions justifiées
5. Évalue la confiance dans tes conclusions

Structure ta réponse avec ton processus de raisonnement complet.`;
      
    case 'analysis':
      return `Tu es Lumen, spécialisé dans l'analyse approfondie. Analyse ce sujet en détail:

${query}

Fournis:
1. Analyse structurelle
2. Identification des patterns
3. Relations et dépendances
4. Points critiques
5. Recommandations basées sur l'analyse

Sois précis et méthodique dans ton analyse.`;
      
    case 'learning':
      return `Tu es Lumen en mode apprentissage. Apprends et structure ces nouvelles informations:

${query}

Processus d'apprentissage:
1. Extraction des concepts clés
2. Intégration avec les connaissances existantes
3. Identification des nouvelles relations
4. Création de liens conceptuels
5. Mémorisation structurée

Explique comment tu intègres ces nouvelles connaissances.`;
      
    case 'planning':
      return `Tu es Lumen en mode planification. Crée un plan détaillé pour:

${query}

Élabore:
1. Analyse des objectifs
2. Décomposition en étapes
3. Identification des ressources nécessaires
4. Séquençage optimal
5. Points de contrôle et métriques

Fournis un plan actionnable et structuré.`;
      
    default:
      return query;
  }
};

export const getInitialKnowledge = (): KnowledgeEntry[] => [
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
