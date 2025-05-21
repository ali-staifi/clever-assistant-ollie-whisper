
import React, { useState } from 'react';
import MCPDemoPanel from '../components/mcp/MCPDemoPanel';
import BioMCPPanel from '../components/mcp/BioMCPPanel';
import ApifyMCPPanel from '../components/mcp/ApifyMCPPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const MCPPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('standard');
  
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Model Context Protocol (MCP)</h1>
      
      <div className="mb-6">
        <p className="text-lg mb-4">
          Le Model Context Protocol (MCP) permet une interaction dynamique entre les modèles d'IA et les services externes,
          permettant aux applications de tirer parti des capacités de l'IA tout en maintenant le contexte à travers plusieurs services.
        </p>
        
        <h2 className="text-xl font-semibold mt-6 mb-3">Caractéristiques principales</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Interaction dynamique des modèles d'IA avec un format de requête/réponse standardisé</li>
          <li>Intégration avec des services et API externes</li>
          <li>Traitement contextuel à travers plusieurs requêtes</li>
          <li>Support pour diverses tâches d'IA: génération de texte, écriture de code, analyse d'images</li>
          <li>Architecture extensible pour des flux de travail personnalisés</li>
        </ul>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
        <TabsList className="grid grid-cols-4 mb-6 w-full md:w-[600px]">
          <TabsTrigger value="standard">Standard MCP</TabsTrigger>
          <TabsTrigger value="bio">BioMCP</TabsTrigger>
          <TabsTrigger value="apify">ApifyMCP</TabsTrigger>
          <TabsTrigger value="others">Autres</TabsTrigger>
        </TabsList>
        
        <TabsContent value="standard">
          <MCPDemoPanel />
        </TabsContent>
        
        <TabsContent value="bio">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>BioMCP</CardTitle>
                <CardDescription>
                  Adaptation du protocole MCP pour les applications de génomique, basée sur 
                  <a href="https://github.com/genomoncology/biomcp" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline ml-1">genomoncology/biomcp</a>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-lg mb-2">Fonctionnalités principales</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Analyse de séquences génomiques et protéiques</li>
                      <li>Annotation de variants génétiques</li>
                      <li>Analyse de voies métaboliques</li>
                      <li>Intégration avec les bases de données biologiques</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <BioMCPPanel />
          </div>
        </TabsContent>
        
        <TabsContent value="apify">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>ApifyMCP</CardTitle>
                <CardDescription>
                  Implementation du protocole MCP pour l'automatisation web, basée sur 
                  <a href="https://mcpservers.org/servers/apify/actors-mcp-server" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline ml-1">Apify Actors MCP Server</a>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-lg mb-2">Capacités</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Web scraping de sites dynamiques et statiques</li>
                      <li>Extraction de données structurées</li>
                      <li>Automatisation de workflows web complexes</li>
                      <li>Intégration avec la plateforme Apify</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <ApifyMCPPanel />
          </div>
        </TabsContent>
        
        <TabsContent value="others">
          <Card>
            <CardHeader>
              <CardTitle>Autres implémentations MCP</CardTitle>
              <CardDescription>
                Le protocole MCP est extensible et peut être adapté à de nombreux domaines
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-lg mb-2">Modules potentiels</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>FinanceMCP - Pour le traitement des données financières et l'analyse de marché</li>
                    <li>LegalMCP - Pour l'assistance juridique et l'analyse de documents légaux</li>
                    <li>EduMCP - Pour des applications éducatives et d'apprentissage</li>
                    <li>MedicalMCP - Pour des applications médicales et d'aide au diagnostic</li>
                  </ul>
                </div>
                
                <div className="bg-muted/50 p-4 rounded-md border border-dashed border-muted-foreground/50 flex flex-col items-center justify-center h-48">
                  <p className="text-muted-foreground text-center">
                    Cet espace est réservé pour de futures implémentations MCP.
                    <br/>
                    Les contributions sont bienvenues!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MCPPage;
