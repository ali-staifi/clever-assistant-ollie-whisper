
import React, { useEffect, useState } from 'react';
import { useWallpaper } from '@/contexts/WallpaperContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';

interface DynamicBackgroundProps {
  children: React.ReactNode;
}

const DynamicBackground: React.FC<DynamicBackgroundProps> = ({ children }) => {
  const { currentWallpaper } = useWallpaper();
  const { resolvedTheme } = useTheme();
  const [prevWallpaper, setPrevWallpaper] = useState<string | null>(null);
  
  useEffect(() => {
    if (currentWallpaper) {
      setPrevWallpaper(currentWallpaper.url);
    }
  }, [currentWallpaper]);
  
  // Different opacity levels based on the theme
  const overlayOpacity = resolvedTheme === 'dark' ? '0.8' : '0.6';
  const bgBlendMode = resolvedTheme === 'dark' ? 'color-burn' : 'soft-light';
  
  return (
    <div className="relative w-full h-screen overflow-hidden">
      <AnimatePresence mode="wait">
        {currentWallpaper && (
          <motion.div
            key={currentWallpaper.url}
            className="absolute inset-0 w-full h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url('${currentWallpaper.url}')`, filter: 'blur(8px)' }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Fluent Design elements: Mica/Acrylic effect */}
      <div 
        className={`absolute inset-0 backdrop-blur-xl`}
        style={{ 
          backdropFilter: 'blur(20px)',
          backgroundColor: resolvedTheme === 'dark' 
            ? `rgba(10, 10, 18, ${overlayOpacity})` 
            : `rgba(240, 240, 249, ${overlayOpacity})`,
          mixBlendMode: bgBlendMode
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
};

export default DynamicBackground;
