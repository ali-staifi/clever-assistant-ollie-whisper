
import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, ServerIcon, Key, Search, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const apiFormSchema = z.object({
  tavilyKey: z.string().optional(),
  googleKey: z.string().optional(),
  generalKey: z.string().optional(),
});

type ApiFormValues = z.infer<typeof apiFormSchema>;

const ApiPage = () => {
  const { toast } = useToast();
  const form = useForm<ApiFormValues>({
    resolver: zodResolver(apiFormSchema),
    defaultValues: {
      tavilyKey: '',
      googleKey: '',
      generalKey: '',
    }
  });

  // Load saved keys on component mount
  useEffect(() => {
    const tavilyKey = localStorage.getItem('tavily-api-key') || '';
    const googleKey = localStorage.getItem('google-api-key') || '';
    const generalKey = localStorage.getItem('general-api-key') || '';
    
    form.reset({
      tavilyKey,
      googleKey,
      generalKey
    });
  }, [form]);

  const saveApiKey = (keyName: string, keyValue: string) => {
    if (keyValue) localStorage.setItem(keyName, keyValue);
    
    toast({
      title: "Clé API sauvegardée",
      description: `La clé ${keyName} a été enregistrée avec succès`,
    });
  };

  const onSubmit = (values: ApiFormValues) => {
    // Save all keys
    if (values.tavilyKey) localStorage.setItem('tavily-api-key', values.tavilyKey);
    if (values.googleKey) localStorage.setItem('google-api-key', values.googleKey);
    if (values.generalKey) localStorage.setItem('general-api-key', values.generalKey);
    
    toast({
      title: "Clés API sauvegardées",
      description: "Les clés ont été enregistrées avec succès",
    });
  };

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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">API Externes</h2>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="generalKey"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center mb-2">
                          <Key className="mr-2 h-4 w-4 text-jarvis-blue" />
                          <FormLabel>Clé API Générale</FormLabel>
                        </div>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="Entrez votre clé API générale" 
                            className="max-w-md"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Pour accéder aux fonctionnalités avancées
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                  
                  <div className="pt-2">
                    <Button onClick={() => saveApiKey('general-api-key', form.getValues('generalKey'))}>
                      Sauvegarder
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Tavily API Section */}
              <Card className="p-6">
                <div className="flex items-center mb-4">
                  <Search className="mr-2 h-5 w-5 text-jarvis-blue" />
                  <h2 className="text-xl font-semibold">API Tavily (Recherche Web)</h2>
                </div>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="tavilyKey"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center mb-2">
                          <Key className="mr-2 h-4 w-4 text-jarvis-blue" />
                          <FormLabel>Clé API Tavily</FormLabel>
                        </div>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="Entrez votre clé API Tavily" 
                            className="max-w-md"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Nécessaire pour les fonctionnalités de recherche web. Obtenez votre clé sur <a href="https://tavily.com" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">tavily.com</a>
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                  <div className="pt-2">
                    <Button onClick={() => saveApiKey('tavily-api-key', form.getValues('tavilyKey'))}>
                      Sauvegarder la clé Tavily
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Google API Section */}
              <Card className="p-6">
                <div className="flex items-center mb-4">
                  <Globe className="mr-2 h-5 w-5 text-jarvis-blue" />
                  <h2 className="text-xl font-semibold">API Google</h2>
                </div>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="googleKey"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center mb-2">
                          <Key className="mr-2 h-4 w-4 text-jarvis-blue" />
                          <FormLabel>Clé API Google</FormLabel>
                        </div>
                        <FormControl>
                          <Input 
                            type="password"
                            placeholder="Entrez votre clé API Google" 
                            className="max-w-md"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Pour les services Google (Maps, YouTube, etc.)
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                  <div className="pt-2">
                    <Button onClick={() => saveApiKey('google-api-key', form.getValues('googleKey'))}>
                      Sauvegarder la clé Google
                    </Button>
                  </div>
                </div>
              </Card>
              
              <div className="flex justify-end">
                <Button type="submit">
                  Sauvegarder toutes les clés API
                </Button>
              </div>
            </form>
          </Form>
        </TabsContent>
        
        <TabsContent value="docs">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Documentation API</h2>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Connexion des modèles au web</h3>
              <p className="mb-4">
                Pour connecter vos modèles LLM au web, vous devez:
              </p>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Obtenir une clé API Tavily (<a href="https://tavily.com" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">tavily.com</a>)</li>
                <li>Enregistrer cette clé dans la section Configuration</li>
                <li>Utiliser des outils de RAG (Retrieval Augmented Generation) dans vos prompts</li>
              </ol>
              <div className="bg-muted p-4 rounded-md mt-4">
                <p className="text-sm font-medium">Exemple de système de prompt pour la recherche web:</p>
                <pre className="text-sm mt-2 overflow-x-auto">
                  {`Tu es un assistant qui utilise la recherche web pour répondre aux questions.
Pour les questions factuelles ou d'actualité, utilise l'outil de recherche avant de répondre.`}
                </pre>
              </div>
            </div>
            
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
