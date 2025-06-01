
import React from 'react';
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";

const FeaturesTab = () => {
  return (
    <Card className="p-4">
      <h2 className="text-lg font-semibold mb-3">Fonctionnalités disponibles</h2>
      
      <div className="mb-4">
        <h3 className="text-base font-medium mb-2">Recherche web avec Tavily</h3>
        <p className="mb-2 text-sm">
          Notre intégration avec Tavily permet de connecter vos modèles d'IA au web pour obtenir des informations récentes et précises.
        </p>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>Recherche en temps réel d'informations pertinentes</li>
          <li>Vérification des faits à partir de sources fiables</li>
          <li>Enrichissement des réponses avec des données actualisées</li>
        </ul>
      </div>
      
      <Separator className="my-3" />
      
      <div className="mb-4">
        <h3 className="text-base font-medium mb-2">API Google</h3>
        <p className="mb-2 text-sm">
          L'intégration avec les API Google vous permet d'accéder à de nombreux services:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>Google Search pour des requêtes web avancées</li>
          <li>YouTube Data API pour l'intégration de contenu vidéo</li>
          <li>Google Maps pour les fonctionnalités géospatiales</li>
        </ul>
      </div>
      
      <Separator className="my-3" />
      
      <div>
        <h3 className="text-base font-medium mb-2">Model Context Protocol (MCP)</h3>
        <p className="mb-2 text-sm">
          Le Model Context Protocol (MCP) permet une interaction dynamique entre les modèles d'IA et les services externes.
        </p>
        
        <div className="mt-3">
          <h4 className="font-medium text-sm">Objectifs du MCP:</h4>
          <ul className="list-disc pl-5 space-y-1 mb-3 text-sm">
            <li>Interactions dynamiques avec les modèles d'IA</li>
            <li>Compatibilité standardisée entre différents services</li>
            <li>Architecture extensible et adaptative</li>
            <li>Communication sécurisée entre composants</li>
          </ul>
        </div>
        
        <div className="mt-3">
          <h4 className="font-medium text-sm">Cas d'utilisation:</h4>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>Génération automatique de code et suggestions en temps réel</li>
            <li>Analyse et adaptation dynamique aux interactions utilisateur</li>
            <li>Connexion avec des APIs externes pour enrichir l'expérience</li>
            <li>Automatisation d'agents IA avec déclenchement d'actions dans des outils comme n8n</li>
            <li>Exécution de workflows avancés (gestion de tâches, analyse de données)</li>
          </ul>
          
          <div className="mt-3 bg-muted p-3 rounded-md">
            <p className="text-xs text-muted-foreground">
              Pour voir une démonstration pratique du MCP, visitez la 
              <Link to="/mcp" className="text-blue-500 hover:underline ml-1">
                page MCP dédiée
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default FeaturesTab;
