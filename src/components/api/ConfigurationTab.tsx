
import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ServerIcon, Search, Globe } from "lucide-react";
import ApiFormSection from './ApiFormSection';
import { useFormContext } from 'react-hook-form';
import { ApiFormValues } from '@/pages/ApiPage';

interface ConfigurationTabProps {
  saveApiKey: (keyName: string, keyValue: string) => void;
}

const ConfigurationTab = ({ saveApiKey }: ConfigurationTabProps) => {
  const form = useFormContext<ApiFormValues>();

  return (
    <form onSubmit={form.handleSubmit((values) => {
      // Save all keys
      if (values.tavilyKey) localStorage.setItem('tavily-api-key', values.tavilyKey);
      if (values.googleKey) localStorage.setItem('google-api-key', values.googleKey);
      if (values.generalKey) localStorage.setItem('general-api-key', values.generalKey);
    })} className="grid gap-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">API Externes</h2>
        <div className="space-y-4">
          <ApiFormSection 
            title="Générale"
            icon={<ServerIcon className="mr-2 h-5 w-5 text-jarvis-blue" />}
            keyName="generalKey"
            description="Pour accéder aux fonctionnalités avancées"
            placeholder="Entrez votre clé API générale"
            onSave={saveApiKey}
          />
        </div>
      </Card>

      <ApiFormSection 
        title="Tavily (Recherche Web)"
        icon={<Search className="mr-2 h-5 w-5 text-jarvis-blue" />}
        keyName="tavilyKey"
        description="Nécessaire pour les fonctionnalités de recherche web."
        placeholder="Entrez votre clé API Tavily"
        onSave={saveApiKey}
        link={{ text: "tavily.com", url: "https://tavily.com" }}
      />

      <ApiFormSection 
        title="Google"
        icon={<Globe className="mr-2 h-5 w-5 text-jarvis-blue" />}
        keyName="googleKey"
        description="Pour les services Google (Maps, YouTube, etc.)"
        placeholder="Entrez votre clé API Google"
        onSave={saveApiKey}
      />
      
      {/* Espace pour les futures API */}
      <Card className="p-6 border-2 border-dashed border-gray-300">
        <div className="flex items-center mb-4">
          <ServerIcon className="mr-2 h-5 w-5 text-muted-foreground" />
          <h2 className="text-xl font-semibold text-muted-foreground">Nouvelles API (À venir)</h2>
        </div>
        <p className="text-muted-foreground">
          Cet espace est réservé pour l'intégration de futures API. Restez à l'affût des mises à jour.
        </p>
      </Card>
      
      <div className="flex justify-end">
        <Button type="submit">
          Sauvegarder toutes les clés API
        </Button>
      </div>
    </form>
  );
};

export default ConfigurationTab;
