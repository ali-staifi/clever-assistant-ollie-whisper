import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, ServerIcon, Key } from "lucide-react";

const ApiPage = () => {
  return (
    <div className="container py-8 mx-auto">
      <div className="flex items-center mb-6">
        <ServerIcon className="mr-2 h-6 w-6 text-jarvis-blue" />
        <h1 className="text-2xl font-bold">API Configuration</h1>
      </div>

      <Tabs defaultValue="settings">
        <TabsList className="mb-4">
          <TabsTrigger value="settings">Configuration</TabsTrigger>
          <TabsTrigger value="docs">Documentation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="settings">
          <div className="grid gap-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Paramètres Ollama</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">URL du serveur</label>
                  <Input 
                    defaultValue="http://localhost:11434" 
                    placeholder="URL du serveur Ollama" 
                    className="max-w-md"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    L'URL où votre serveur Ollama est accessible
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Modèle</label>
                  <Input 
                    defaultValue="llama3" 
                    placeholder="Nom du modèle" 
                    className="max-w-md"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Le modèle à utiliser pour les requêtes
                  </p>
                </div>
                
                <div className="pt-2">
                  <Button>
                    Vérifier la connexion
                  </Button>
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">API Externes</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center mb-2">
                    <Key className="mr-2 h-4 w-4 text-jarvis-blue" />
                    <label className="text-sm font-medium">Clé API</label>
                  </div>
                  <Input 
                    type="password" 
                    placeholder="Entrez votre clé API" 
                    className="max-w-md"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Pour accéder aux fonctionnalités avancées
                  </p>
                </div>
                
                <div className="pt-2">
                  <Button>
                    Sauvegarder
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="docs">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Documentation API</h2>
            <p className="mb-4">
              Utilisez notre API pour intégrer les capacités de J.A.R.V.I.S dans vos applications.
            </p>
            
            <Separator className="my-4" />
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Endpoints</h3>
                <div className="mt-2 p-4 bg-muted rounded-md">
                  <div className="flex justify-between items-center">
                    <code className="text-sm">/api/chat</code>
                    <span className="bg-green-500/10 text-green-500 text-xs px-2 py-1 rounded">POST</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Envoyer un message au modèle et recevoir une réponse
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium">Exemple</h3>
                <pre className="mt-2 p-4 bg-muted rounded-md overflow-x-auto">
                  <code className="text-sm">
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
              
              <div className="flex justify-end">
                <Button>
                  Documentation complète <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApiPage;
