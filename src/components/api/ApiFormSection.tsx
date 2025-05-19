
import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Key } from "lucide-react";
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { useFormContext } from "react-hook-form";
import { ApiFormValues } from "@/pages/ApiPage";

interface ApiFormSectionProps {
  title: string;
  icon: React.ReactNode;
  keyName: "tavilyKey" | "googleKey" | "generalKey";
  description: string;
  placeholder: string;
  onSave: (keyName: string, value: string) => void;
  link?: {
    text: string;
    url: string;
  };
}

const ApiFormSection = ({
  title,
  icon,
  keyName,
  description,
  placeholder,
  onSave,
  link
}: ApiFormSectionProps) => {
  const form = useFormContext<ApiFormValues>();
  
  return (
    <Card className="p-6">
      <div className="flex items-center mb-4">
        {icon}
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>
      <div className="space-y-4">
        <FormField
          control={form.control}
          name={keyName}
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center mb-2">
                <Key className="mr-2 h-4 w-4 text-jarvis-blue" />
                <FormLabel>Clé API {title}</FormLabel>
              </div>
              <FormControl>
                <Input 
                  type="password" 
                  placeholder={placeholder} 
                  className="max-w-md"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                {description}
                {link && (
                  <> Obtenez votre clé sur <a href={link.url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">{link.text}</a></>
                )}
              </FormDescription>
            </FormItem>
          )}
        />
        <div className="pt-2">
          <Button onClick={() => onSave(`${keyName.replace('Key', '')}-api-key`, form.getValues(keyName))}>
            Sauvegarder la clé {title}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ApiFormSection;
