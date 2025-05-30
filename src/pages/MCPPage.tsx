
import React, { useState } from 'react';
import MCPDemoPanel from '../components/mcp/MCPDemoPanel';
import BioMCPPanel from '../components/mcp/BioMCPPanel';
import ApifyMCPPanel from '../components/mcp/apify/ApifyMCPPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

const MCPPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('standard');
  
  return (
    <div className="container py-4 min-h-full">
      <h1 className="text-3xl font-bold mb-6">MCP</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col">
        <TabsList className="grid grid-cols-4 mb-4 w-full md:w-[600px]">
          <TabsTrigger value="standard">Standard MCP</TabsTrigger>
          <TabsTrigger value="bio">BioMCP</TabsTrigger>
          <TabsTrigger value="apify">ApifyMCP</TabsTrigger>
          <TabsTrigger value="others">Autres</TabsTrigger>
        </TabsList>
        
        <div className="mb-20">
          <ScrollArea className="h-full pr-4">
            <TabsContent value="standard" className="mt-0">
              <MCPDemoPanel />
            </TabsContent>
            
            <TabsContent value="bio" className="mt-0">
              <BioMCPPanel />
            </TabsContent>
            
            <TabsContent value="apify" className="mt-0">
              <div className="space-y-4">
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
            
            <TabsContent value="others" className="mt-0">
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
          </ScrollArea>
        </div>
      </Tabs>
    </div>
  );
};

export default MCPPage;
