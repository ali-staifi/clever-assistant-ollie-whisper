
import React from 'react';
import WallpaperManager from '@/components/wallpaper/WallpaperManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Switch } from '@/components/ui/switch';
import { motion } from "framer-motion";

const WallpaperPage: React.FC = () => {
  return (
    <motion.div 
      className="container py-8"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Personnalisation</h1>
        <ThemeToggle />
      </div>
      
      <Tabs defaultValue="wallpapers" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="wallpapers">Fonds d'écran</TabsTrigger>
          <TabsTrigger value="themes">Thèmes</TabsTrigger>
          <TabsTrigger value="effects">Effets visuels</TabsTrigger>
        </TabsList>
        
        <TabsContent value="wallpapers">
          <WallpaperManager />
        </TabsContent>
        
        <TabsContent value="themes">
          <div className="rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Gestion des thèmes</h2>
            <p className="text-muted-foreground">
              Personnalisez l'apparence de l'application en choisissant entre le mode clair et sombre.
              Le thème s'adapte automatiquement à vos préférences système.
            </p>
            
            <div className="flex items-center mt-6 space-x-4">
              <div className="flex flex-col items-center">
                <div className="h-24 w-40 rounded-lg bg-white border shadow-sm mb-2 flex items-center justify-center">
                  <span className="text-black">Mode clair</span>
                </div>
                <button className="px-3 py-1 text-sm rounded-full bg-primary text-white">Activer</button>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="h-24 w-40 rounded-lg bg-zinc-900 border border-zinc-700 mb-2 flex items-center justify-center">
                  <span className="text-white">Mode sombre</span>
                </div>
                <button className="px-3 py-1 text-sm rounded-full bg-primary text-white">Activer</button>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="h-24 w-40 rounded-lg bg-gradient-to-b from-white to-zinc-900 border mb-2 flex items-center justify-center">
                  <span className="text-zinc-800">Système</span>
                </div>
                <button className="px-3 py-1 text-sm rounded-full bg-primary text-white">Auto</button>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="effects">
          <div className="rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Effets visuels</h2>
            <p className="text-muted-foreground mb-4">
              Ajustez les effets visuels pour personnaliser votre expérience utilisateur.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Effet Mica</h3>
                  <p className="text-sm text-muted-foreground">
                    Transparence avec effet d'arrière-plan flou
                  </p>
                </div>
                <Switch id="mica-effect" />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Animations</h3>
                  <p className="text-sm text-muted-foreground">
                    Animations de transition fluides
                  </p>
                </div>
                <Switch id="animations" />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Ombres</h3>
                  <p className="text-sm text-muted-foreground">
                    Ombres douces pour les éléments d'interface
                  </p>
                </div>
                <Switch id="shadows" />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default WallpaperPage;
