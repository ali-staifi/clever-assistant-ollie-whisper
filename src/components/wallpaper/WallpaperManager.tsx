
import React, { useState } from 'react';
import { useWallpaper, Wallpaper } from '@/contexts/WallpaperContext';
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { v4 as uuidv4 } from 'uuid';
import { useToast } from "@/hooks/use-toast";
import { ImageIcon, Settings, RefreshCcw, Download } from "lucide-react";
import { motion } from "framer-motion";

const WallpaperManager = () => {
  const {
    wallpapers,
    currentWallpaper,
    isSlideshow,
    slideshowInterval,
    addWallpaper,
    removeWallpaper,
    setCurrentWallpaper,
    toggleSlideshow,
    setSlideshowInterval
  } = useWallpaper();
  
  const [fileUpload, setFileUpload] = useState<File | null>(null);
  const { toast } = useToast();
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileUpload(e.target.files[0]);
    }
  };
  
  const handleUpload = () => {
    if (!fileUpload) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        const newWallpaper: Wallpaper = {
          id: uuidv4(),
          url: e.target.result as string,
          name: fileUpload.name,
          type: 'custom'
        };
        
        addWallpaper(newWallpaper);
        setCurrentWallpaper(newWallpaper);
        setFileUpload(null);
        
        toast({
          title: "Fond d'écran ajouté",
          description: `${fileUpload.name} a été ajouté avec succès.`
        });
      }
    };
    reader.readAsDataURL(fileUpload);
  };
  
  const handleIntervalChange = (value: number[]) => {
    setSlideshowInterval(value[0] * 1000); // Convert to milliseconds
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Gestion des fonds d'écran</h3>
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
        
        <Card className="overflow-hidden backdrop-blur-md border border-white/10 bg-white/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <RefreshCcw className="h-4 w-4" />
                <span>Diaporama automatique</span>
              </div>
              <Switch 
                checked={isSlideshow} 
                onCheckedChange={toggleSlideshow} 
              />
            </div>
            
            {isSlideshow && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Intervalle: {slideshowInterval / 1000}s</span>
                </div>
                <Slider 
                  value={[slideshowInterval / 1000]} 
                  min={5} 
                  max={300} 
                  step={5} 
                  onValueChange={handleIntervalChange} 
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Separator />
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Télécharger un fond d'écran</h3>
        
        <div className="grid gap-4">
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
            <ImageIcon className="h-10 w-10 mb-2 text-muted-foreground" />
            <label className="cursor-pointer">
              <span className="text-primary font-medium">Choisir une image</span>
              <input 
                type="file" 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange} 
              />
            </label>
            <p className="text-sm text-muted-foreground mt-2">
              {fileUpload ? fileUpload.name : "PNG, JPG, GIF (max 10MB)"}
            </p>
          </div>
          
          {fileUpload && (
            <Button onClick={handleUpload}>
              <Download className="h-4 w-4 mr-2" />
              Utiliser cette image
            </Button>
          )}
        </div>
      </div>
      
      <Separator />
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Mes fonds d'écran</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wallpapers.map((wallpaper) => (
            <motion.div
              key={wallpaper.id}
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.2 }}
            >
              <div 
                className={`relative rounded-lg overflow-hidden aspect-video cursor-pointer group ${
                  currentWallpaper?.id === wallpaper.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setCurrentWallpaper(wallpaper)}
              >
                <img 
                  src={wallpaper.url} 
                  alt={wallpaper.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 w-full p-3 flex items-center justify-between">
                    <span className="text-white text-sm font-medium">{wallpaper.name}</span>
                    {wallpaper.type === 'custom' && (
                      <Button 
                        variant="destructive" 
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeWallpaper(wallpaper.id);
                        }}
                      >
                        &times;
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WallpaperManager;
