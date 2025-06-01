
import React from 'react';
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const DocumentationTab = () => {
  return (
    <Card className="p-4">
      <h2 className="text-lg font-semibold mb-3">Documentation API</h2>
      
      <div className="mb-4">
        <h3 className="text-base font-medium mb-2">Connexion des modèles au web</h3>
        <p className="mb-3 text-sm">
          Pour connecter vos modèles LLM au web, vous devez:
        </p>
        <ol className="list-decimal pl-5 space-y-1 text-sm">
          <li>Obtenir une clé API Tavily (<a href="https://tavily.com" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">tavily.com</a>)</li>
          <li>Enregistrer cette clé dans la section Configuration</li>
          <li>Utiliser des outils de RAG (Retrieval Augmented Generation) dans vos prompts</li>
        </ol>
        <div className="bg-muted p-3 rounded-md mt-3">
          <p className="text-xs font-medium">Exemple de système de prompt pour la recherche web:</p>
          <pre className="text-xs mt-1 overflow-x-auto">
            {`Tu es un assistant qui utilise la recherche web pour répondre aux questions.
Pour les questions factuelles ou d'actualité, utilise l'outil de recherche avant de répondre.`}
          </pre>
        </div>
      </div>
      
      <Separator className="my-3" />
      
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-medium">Endpoints</h3>
          <div className="mt-2 p-3 bg-muted rounded-md">
            <div className="flex justify-between items-center">
              <code className="text-xs">/api/chat</code>
              <span className="bg-green-500/10 text-green-500 text-xs px-2 py-1 rounded">POST</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Envoyer un message au modèle et recevoir une réponse
            </p>
          </div>
        </div>
        
        <div>
          <h3 className="text-base font-medium">Exemple</h3>
          <pre className="mt-2 p-3 bg-muted rounded-md overflow-x-auto">
            <code className="text-xs">
{`fetch('http://localhost:11434/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: "llama3",
    messages: [{ role: 'user', content: 'Bonjour' }],
    stream: true
  })
})`}
            </code>
          </pre>
        </div>
        
        <div className="flex justify-end pt-2">
          <Button size="sm">
            Documentation complète <ArrowRight className="ml-2 h-3 w-3" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default DocumentationTab;
