
import React from 'react';
import { Card } from "@/components/ui/card";
import { Mic, Volume2, Bot, Globe, Key, Search, Film, Video, Image, PlayCircle } from "lucide-react";

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

        {/* Amélioration de la qualité vocale */}
        <Card className="p-4 border transition-all hover:shadow-md">
          <div className="flex items-center mb-2">
            <Volume2 className="h-5 w-5 text-jarvis-blue mr-2" />
            <h3 className="font-medium">Qualité Vocale Améliorée</h3>
          </div>
          <p className="text-muted-foreground text-sm">
            Ajustez le timbre, la fluidité ou utilisez un moteur IA comme FastSpeech2 pour une voix plus naturelle.
          </p>
        </Card>

        {/* Personnalisation des réponses */}
        <Card className="p-4 border transition-all hover:shadow-md">
          <div className="flex items-center mb-2">
            <Bot className="h-5 w-5 text-jarvis-blue mr-2" />
            <h3 className="font-medium">Réponses Personnalisées</h3>
          </div>
          <p className="text-muted-foreground text-sm">
            Rendez Jarvis plus naturel avec des émotions et des pauses dans ses phrases pour une interaction plus humaine.
          </p>
        </Card>

        {/* Interaction multimodale */}
        <Card className="p-4 border transition-all hover:shadow-md">
          <div className="flex items-center mb-2">
            <Image className="h-5 w-5 text-jarvis-blue mr-2" />
            <h3 className="font-medium">Interaction Multimodale</h3>
          </div>
          <p className="text-muted-foreground text-sm">
            Connectez la synthèse vocale avec LLaVA pour que Jarvis puisse décrire des images en vocal.
          </p>
        </Card>
      </div>
      
      <h2 className="text-xl font-semibold mt-8 mb-4">Technologies d'IA Visuelle</h2>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* LLaVA-Llama3 */}
        <Card className="p-4 border transition-all hover:shadow-md">
          <div className="flex items-center mb-2">
            <Image className="h-5 w-5 text-jarvis-blue mr-2" />
            <h3 className="font-medium">LLaVA-Llama3</h3>
          </div>
          <p className="text-muted-foreground text-sm mb-2">
            Analyse des images et répond à des questions sur leur contenu grâce à un encodeur de vision qui transforme l'image en données exploitables.
          </p>
          <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
            <li>Génère des descriptions détaillées des images</li>
            <li>Reconnaît des objets et leurs relations</li>
            <li>Comprend le contexte visuel des scènes</li>
          </ul>
        </Card>
        
        {/* Video-LLaVA */}
        <Card className="p-4 border transition-all hover:shadow-md">
          <div className="flex items-center mb-2">
            <Film className="h-5 w-5 text-jarvis-blue mr-2" />
            <h3 className="font-medium">Video-LLaVA</h3>
          </div>
          <p className="text-muted-foreground text-sm mb-2">
            Version avancée qui permet d'analyser des séquences vidéo en extrayant des images clés d'une vidéo et en les interprétant.
          </p>
          <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
            <li>Répond à des questions sur le contenu visuel</li>
            <li>Suit des actions dans une vidéo</li>
            <li>Analyse le contexte temporel des événements</li>
          </ul>
        </Card>
      </div>
      
      <div className="mt-8">
        <h3 className="text-lg font-medium mb-3">Automatisation Avancée</h3>
        <div className="bg-muted p-4 rounded-md">
          <p className="mb-2">Couplage avec des commandes vocales pour exécuter des tâches comme :</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Ouvrir des fichiers ou applications</li>
            <li>Envoyer des messages et créer des rappels</li>
            <li>Contrôler des appareils connectés</li>
            <li>Lancer des recherches personnalisées</li>
          </ul>
        </div>
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
            <li>Analyse vocale des émotions</li>
          </ul>
        </div>
      </div>
    </Card>
  );
};

export default FeaturesTab;
