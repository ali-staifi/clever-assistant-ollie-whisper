
import React, { useState, useEffect } from 'react';
import { ServerIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import { useTavily } from "@/hooks/useTavily";

import ConfigurationTab from "@/components/api/ConfigurationTab";
import DocumentationTab from "@/components/api/DocumentationTab";
import FeaturesTab from "@/components/api/FeaturesTab";

const apiFormSchema = z.object({
  tavilyKey: z.string().optional(),
  googleKey: z.string().optional(),
  generalKey: z.string().optional(),
});

export type ApiFormValues = z.infer<typeof apiFormSchema>;

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
    <div className="container py-4 mx-auto">
      <div className="flex items-center mb-4">
        <ServerIcon className="mr-2 h-5 w-5 text-jarvis-blue" />
        <h1 className="text-xl font-bold">API Configuration</h1>
      </div>

      <Tabs defaultValue="settings">
        <TabsList className="mb-3">
          <TabsTrigger value="settings">Configuration</TabsTrigger>
          <TabsTrigger value="docs">Documentation</TabsTrigger>
          <TabsTrigger value="features">Fonctionnalités</TabsTrigger>
        </TabsList>
        
        <TabsContent value="settings">
          <FormProvider {...form}>
            <ConfigurationTab saveApiKey={saveApiKey} />
          </FormProvider>
        </TabsContent>
        
        <TabsContent value="docs">
          <DocumentationTab />
        </TabsContent>
        
        <TabsContent value="features">
          <FeaturesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApiPage;
