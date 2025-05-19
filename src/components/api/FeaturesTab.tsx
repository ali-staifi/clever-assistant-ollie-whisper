
import React from 'react';
import { Card } from "@/components/ui/card";
import { Mic, Volume2, Bot, Globe, Key, Search } from "lucide-react";

const FeaturesTab = () => {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Fonctionnalités de Jarvis</h2>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Reconnaissance vocale */}
        <Card className="p-4 border transition-all hover:shadow-md">
          <div className="flex items-center mb-2">
            <Mic className="h-5 w-5 text-jarvis-blue mr-2" />
            <h3 className="font-medium">Reconnaissance Vocale</h3>
          </div>
          <p className="text-muted-foreground text-sm">
            Jarvis peut comprendre vos commandes vocales grâce à la reconnaissance vocale intégrée.
          </p>
        </Card>
        
        {/* Synthèse vocale */}
        <Card className="p-4 border transition-all hover:shadow-md">
          <div className="flex items-center mb-2">
            <Volume2 className="h-5 w-5 text-jarvis-blue mr-2" />
            <h3 className="font-medium">Synthèse Vocale</h3>
          </div>
          <p className="text-muted-foreground text-sm">
            Répond vocalement à vos questions en utilisant la synthèse vocale du navigateur ou un service externe comme MaryTTS.
          </p>
        </Card>
        
        {/* Traitement du langage naturel */}
        <Card className="p-4 border transition-all hover:shadow-md">
          <div className="flex items-center mb-2">
            <Bot className="h-5 w-5 text-jarvis-blue mr-2" />
            <h3 className="font-medium">Traitement du Langage</h3>
          </div>
          <p className="text-muted-foreground text-sm">
            Utilise des modèles de langage (via Ollama) pour comprendre et répondre à vos questions intelligemment.
          </p>
        </Card>
        
        {/* Support multilingue */}
        <Card className="p-4 border transition-all hover:shadow-md">
          <div className="flex items-center mb-2">
            <Globe className="h-5 w-5 text-jarvis-blue mr-2" />
            <h3 className="font-medium">Support Multilingue</h3>
          </div>
          <p className="text-muted-foreground text-sm">
            Prend en charge plusieurs langues, notamment le français, l'anglais et l'arabe.
          </p>
        </Card>
        
        {/* Mode sans microphone */}
        <Card className="p-4 border transition-all hover:shadow-md">
          <div className="flex items-center mb-2">
            <Key className="h-5 w-5 text-jarvis-blue mr-2" />
            <h3 className="font-medium">Mode sans Microphone</h3>
          </div>
          <p className="text-muted-foreground text-sm">
            Si vous n'avez pas de microphone ou préférez ne pas l'utiliser, Jarvis propose un mode texte.
          </p>
        </Card>
        
        {/* Recherche web */}
        <Card className="p-4 border transition-all hover:shadow-md">
          <div className="flex items-center mb-2">
            <Search className="h-5 w-5 text-jarvis-blue mr-2" />
            <h3 className="font-medium">Recherche Web</h3>
          </div>
          <p className="text-muted-foreground text-sm">
            Jarvis peut utiliser l'API Tavily pour rechercher des informations sur le web et les intégrer dans ses réponses.
          </p>
        </Card>
      </div>
      
      <div className="mt-8">
        <h3 className="text-lg font-medium mb-3">Configuration de la Recherche Web</h3>
        <div className="bg-muted p-4 rounded-md">
          <p className="mb-2">Pour activer la recherche web avec Jarvis:</p>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Configurez votre clé API Tavily dans l'onglet "Configuration"</li>
            <li>Assurez-vous que votre modèle Ollama est correctement configuré</li>
            <li>Posez des questions qui nécessitent des informations factuelles ou d'actualité</li>
          </ol>
        </div>
      </div>
      
      <div className="mt-8">
        <h3 className="text-lg font-medium mb-3">Fonctionnalités à venir</h3>
        <div className="border-2 border-dashed border-gray-300 p-4 rounded-md">
          <ul className="space-y-2 text-muted-foreground">
            <li>Intégration avec d'autres services d'IA</li>
            <li>Support pour la traduction en temps réel</li>
            <li>Contrôle d'appareils intelligents</li>
            <li>Personnalisation avancée des voix</li>
          </ul>
        </div>
      </div>
    </Card>
  );
};

export default FeaturesTab;
