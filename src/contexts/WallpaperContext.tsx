
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTheme } from 'next-themes';

export interface Wallpaper {
  id: string;
  url: string;
  name: string;
  type: 'default' | 'custom';
}

interface WallpaperContextType {
  wallpapers: Wallpaper[];
  currentWallpaper: Wallpaper | null;
  isSlideshow: boolean;
  slideshowInterval: number;
  addWallpaper: (wallpaper: Wallpaper) => void;
  removeWallpaper: (id: string) => void;
  setCurrentWallpaper: (wallpaper: Wallpaper) => void;
  toggleSlideshow: () => void;
  setSlideshowInterval: (interval: number) => void;
}

const DEFAULT_WALLPAPERS: Wallpaper[] = [
  {
    id: 'default-1',
    url: 'https://images.unsplash.com/photo-1518554333660-c13223f3a1db',
    name: 'Bleu Horizon',
    type: 'default',
  },
  {
    id: 'default-2',
    url: 'https://images.unsplash.com/photo-1691145697195-1fd9333b53b8',
    name: 'Abstrait Violet',
    type: 'default',
  },
  {
    id: 'default-3',
    url: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e',
    name: 'Fluide Vert',
    type: 'default',
  },
];

export const WallpaperContext = createContext<WallpaperContextType | undefined>(undefined);

export const WallpaperProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>(() => {
    const savedWallpapers = localStorage.getItem('wallpapers');
    return savedWallpapers ? JSON.parse(savedWallpapers) : DEFAULT_WALLPAPERS;
  });
  
  const [currentWallpaper, setCurrentWallpaper] = useState<Wallpaper | null>(() => {
    const saved = localStorage.getItem('currentWallpaper');
    return saved ? JSON.parse(saved) : wallpapers[0];
  });
  
  const [isSlideshow, setIsSlideshow] = useState<boolean>(() => {
    const saved = localStorage.getItem('isSlideshow');
    return saved ? JSON.parse(saved) : false;
  });
  
  const [slideshowInterval, setSlideshowInterval] = useState<number>(() => {
    const saved = localStorage.getItem('slideshowInterval');
    return saved ? parseInt(saved, 10) : 60000; // Default 1 minute
  });
  
  // Save to localStorage when values change
  useEffect(() => {
    localStorage.setItem('wallpapers', JSON.stringify(wallpapers));
  }, [wallpapers]);
  
  useEffect(() => {
    if (currentWallpaper) {
      localStorage.setItem('currentWallpaper', JSON.stringify(currentWallpaper));
    }
  }, [currentWallpaper]);
  
  useEffect(() => {
    localStorage.setItem('isSlideshow', JSON.stringify(isSlideshow));
  }, [isSlideshow]);
  
  useEffect(() => {
    localStorage.setItem('slideshowInterval', String(slideshowInterval));
  }, [slideshowInterval]);
  
  // Slideshow functionality
  useEffect(() => {
    let intervalId: number;
    
    if (isSlideshow && wallpapers.length > 1) {
      intervalId = window.setInterval(() => {
        const currentIndex = currentWallpaper 
          ? wallpapers.findIndex(w => w.id === currentWallpaper.id)
          : -1;
        
        const nextIndex = (currentIndex + 1) % wallpapers.length;
        setCurrentWallpaper(wallpapers[nextIndex]);
      }, slideshowInterval);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isSlideshow, slideshowInterval, wallpapers, currentWallpaper]);
  
  const addWallpaper = (wallpaper: Wallpaper) => {
    setWallpapers(prev => [...prev, wallpaper]);
  };
  
  const removeWallpaper = (id: string) => {
    setWallpapers(prev => prev.filter(w => w.id !== id));
    if (currentWallpaper?.id === id) {
      setCurrentWallpaper(wallpapers[0]);
    }
  };
  
  const toggleSlideshow = () => {
    setIsSlideshow(prev => !prev);
  };
  
  const value = {
    wallpapers,
    currentWallpaper,
    isSlideshow,
    slideshowInterval,
    addWallpaper,
    removeWallpaper,
    setCurrentWallpaper,
    toggleSlideshow,
    setSlideshowInterval
  };
  
  return (
    <WallpaperContext.Provider value={value}>
      {children}
    </WallpaperContext.Provider>
  );
};

export const useWallpaper = () => {
  const context = useContext(WallpaperContext);
  if (context === undefined) {
    throw new Error('useWallpaper must be used within a WallpaperProvider');
  }
  return context;
};
