import React, { useEffect, useRef, useState } from 'react';
import { Engine, Scene, FreeCamera, Vector3, HemisphericLight, SceneLoader } from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import { motion } from 'framer-motion';

interface ReadyPlayerMeAvatarProps {
  isListening: boolean;
  isSpeaking: boolean;
  emotionalState: 'neutral' | 'encouraging' | 'supportive' | 'energetic';
  currentText?: string;
}

export const ReadyPlayerMeAvatar: React.FC<ReadyPlayerMeAvatarProps> = ({
  isListening,
  isSpeaking,
  emotionalState,
  currentText
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const avatarRef = useRef<any>(null);
  const animationRef = useRef<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [morphTargetsFound, setMorphTargetsFound] = useState(0);

  // Avatar Ready Player Me URL
  const avatarUrl = "https://models.readyplayer.me/689129bfdebb07631bc0ba6e.glb";

  useEffect(() => {
    if (!canvasRef.current) return;

    const initBabylon = async () => {
      try {
        console.log("🚀 Initialisation de Babylon.js...");
        
        // Créer l'engine et la scène
        const engine = new Engine(canvasRef.current!, true);
        const scene = new Scene(engine);
        
        engineRef.current = engine;
        sceneRef.current = scene;

        // Caméra
        const camera = new FreeCamera("camera", new Vector3(0, 1.6, 2), scene);
        camera.setTarget(new Vector3(0, 1.6, 0));
        camera.attachControl(canvasRef.current!, true);

        // Éclairage
        const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
        light.intensity = 0.8;

        console.log("🌐 Chargement de l'avatar depuis:", avatarUrl);
        
        // Charger l'avatar
        const result = await SceneLoader.ImportMeshAsync("", "", avatarUrl, scene);
        
        if (result.meshes.length > 0) {
          console.log("✅ Avatar chargé avec", result.meshes.length, "meshes");
          avatarRef.current = result.meshes[0];
          
          // Chercher les morph targets pour l'animation de la bouche
          let totalMorphTargets = 0;
          result.meshes.forEach((mesh, index) => {
            console.log(`Mesh ${index}:`, mesh.name, "MorphTargets:", !!mesh.morphTargetManager);
            if (mesh.morphTargetManager) {
              const numTargets = mesh.morphTargetManager.numTargets;
              totalMorphTargets += numTargets;
              console.log(`  - ${numTargets} morph targets trouvés dans ${mesh.name}`);
              
              // Lister tous les morph targets
              for (let i = 0; i < numTargets; i++) {
                const target = mesh.morphTargetManager.getTarget(i);
                console.log(`    Target ${i}: ${target.name}`);
              }
            }
          });
          
          setMorphTargetsFound(totalMorphTargets);
          
          if (totalMorphTargets === 0) {
            console.warn("⚠️ Aucun morph target trouvé dans l'avatar");
          } else {
            console.log(`✅ Total de ${totalMorphTargets} morph targets disponibles`);
          }
          
          setIsLoading(false);
        } else {
          console.error("❌ Aucun mesh trouvé dans l'avatar");
          setError("Avatar chargé mais aucun mesh trouvé");
        }

        // Boucle de rendu
        engine.runRenderLoop(() => {
          scene.render();
        });

        // Redimensionnement
        window.addEventListener("resize", () => {
          engine.resize();
        });

      } catch (err) {
        console.error("Erreur lors du chargement de l'avatar:", err);
        setError("Impossible de charger l'avatar Ready Player Me");
        setIsLoading(false);
      }
    };

    initBabylon();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (engineRef.current) {
        engineRef.current.dispose();
      }
    };
  }, []);

  // Effet pour l'animation des lèvres
  useEffect(() => {
    console.log("🎵 Effet animation déclenché:", { 
      hasScene: !!sceneRef.current, 
      hasAvatar: !!avatarRef.current, 
      isSpeaking,
      morphTargetsFound
    });
    
    if (!sceneRef.current || !avatarRef.current || !isSpeaking) {
      console.log("❌ Conditions non remplies pour l'animation");
      // Arrêter l'animation et remettre à zéro
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      
      // Remettre les morph targets à zéro
      if (avatarRef.current) {
        avatarRef.current.getChildMeshes().forEach((mesh: any) => {
          if (mesh.morphTargetManager) {
            const manager = mesh.morphTargetManager;
            for (let i = 0; i < manager.numTargets; i++) {
              const target = manager.getTarget(i);
              target.influence = 0;
            }
          }
        });
        console.log("🔄 Morph targets remis à zéro");
      }
      return;
    }

    console.log("🔊 Animation des lèvres démarrée");
    
    // Animation simple basée sur des oscillations pendant la synthèse vocale
    const startTime = Date.now();
    
    const animateMouth = () => {
      if (!avatarRef.current || !isSpeaking) {
        console.log("⏹️ Animation arrêtée");
        return;
      }
      
      const elapsed = Date.now() - startTime;
      const amplitude = (Math.sin(elapsed * 0.008) + 1) * 0.5; // Oscillation entre 0 et 1
      const frequency = 0.2 + Math.sin(elapsed * 0.005) * 0.1; // Variation de fréquence
      
      // Log moins fréquent pour éviter le spam
      if (elapsed % 1000 < 50) {
        console.log("💋 Animation amplitude:", amplitude.toFixed(2));
      }
      
      // Animer tous les morph targets liés à la bouche
      avatarRef.current.getChildMeshes().forEach((mesh: any) => {
        if (mesh.morphTargetManager) {
          const manager = mesh.morphTargetManager;
          
          for (let i = 0; i < manager.numTargets; i++) {
            const target = manager.getTarget(i);
            const targetName = target.name.toLowerCase();
            
            // Chercher les morph targets liés à la parole
            if (targetName.includes('mouth') || 
                targetName.includes('jaw') || 
                targetName.includes('lips') ||
                targetName.includes('open') ||
                targetName.includes('close') ||
                targetName.includes('smile') ||
                targetName.includes('viseme') ||
                targetName.includes('aa') ||
                targetName.includes('ee') ||
                targetName.includes('ih') ||
                targetName.includes('oh') ||
                targetName.includes('ou')) {
              
              // Différents types d'animation selon le nom du morph target
              let influence = 0;
              if (targetName.includes('open') || targetName.includes('jaw') || targetName.includes('aa')) {
                influence = amplitude * frequency * 0.8;
              } else if (targetName.includes('smile')) {
                influence = amplitude * 0.2; // Sourire subtil
              } else if (targetName.includes('oh') || targetName.includes('ou')) {
                influence = amplitude * frequency * 0.6;
              } else {
                influence = amplitude * frequency * 0.5;
              }
              
              target.influence = Math.min(Math.max(influence, 0), 1);
              
              // Log occasionnel pour debug
              if (elapsed % 2000 < 50 && target.influence > 0.1) {
                console.log(`👄 ${targetName}: ${target.influence.toFixed(2)}`);
              }
            }
          }
        }
      });
      
      if (isSpeaking) {
        animationRef.current = requestAnimationFrame(animateMouth);
      }
    };
    
    animateMouth();
    
    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
    
  }, [isSpeaking, morphTargetsFound]);

  const getEmotionColor = () => {
    switch (emotionalState) {
      case 'encouraging': return 'hsl(142, 76%, 60%)';
      case 'supportive': return 'hsl(217, 91%, 75%)';
      case 'energetic': return 'hsl(45, 100%, 70%)';
      default: return 'hsl(200, 100%, 70%)';
    }
  };

  return (
    <div className="relative w-96 h-96 mx-auto">
      {/* Canvas Babylon.js */}
      <motion.div
        className="relative w-full h-full rounded-lg overflow-hidden shadow-2xl"
        style={{
          border: `4px solid ${getEmotionColor()}`
        }}
        animate={{
          scale: isListening ? [1, 1.02, 1] : 1,
          boxShadow: isSpeaking 
            ? [`0 0 20px ${getEmotionColor()}40`, `0 0 40px ${getEmotionColor()}60`, `0 0 20px ${getEmotionColor()}40`]
            : `0 0 20px ${getEmotionColor()}20`
        }}
        transition={{
          scale: { duration: 2, repeat: isListening ? Infinity : 0 },
          boxShadow: { duration: 1.5, repeat: isSpeaking ? Infinity : 0 }
        }}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
        />

        {/* Overlay de chargement */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <motion.div
              className="w-8 h-8 border-4 border-white border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <span className="ml-3 text-white font-medium">Chargement d'Alex...</span>
          </div>
        )}

        {/* Indicateur d'écoute */}
        {isListening && (
          <motion.div
            className="absolute -top-4 -right-4 w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
            style={{ backgroundColor: getEmotionColor() }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [1, 0.7, 1]
            }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <span className="text-white text-lg">🎤</span>
          </motion.div>
        )}

        {/* Ondes sonores */}
        {(isSpeaking || isLoading) && (
          <div className="absolute inset-0">
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                className="absolute w-full h-full rounded-lg border-2 opacity-30"
                style={{ borderColor: getEmotionColor() }}
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0, 0.3]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: index * 0.7
                }}
              />
            ))}
          </div>
        )}

        {/* Indicateur de morph targets */}
        {!isLoading && morphTargetsFound > 0 && (
          <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
            {morphTargetsFound} Morph Targets
          </div>
        )}
      </motion.div>

      {/* Indicateur d'état émotionnel */}
      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
        <motion.div
          className="px-4 py-2 rounded-full text-xs font-medium text-white shadow-lg"
          style={{ backgroundColor: getEmotionColor() }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          {emotionalState === 'neutral' ? 'Calme' : 
           emotionalState === 'encouraging' ? 'Encourageant' :
           emotionalState === 'supportive' ? 'Bienveillant' : 'Énergique'}
        </motion.div>
      </div>

      {/* Statut */}
      <motion.div
        className="absolute -bottom-8 left-0 right-0 text-center"
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <p className="text-sm font-medium text-muted-foreground">
          {isLoading ? "Alex se prépare..." :
           error ? "Erreur de chargement" :
           isSpeaking ? "Alex vous parle..." :
           isListening ? "Alex vous écoute..." :
           "Alex est prêt à vous aider"}
        </p>
      </motion.div>

      {/* Erreur */}
      {error && (
        <motion.div
          className="absolute -bottom-20 left-0 right-0 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-xs text-destructive bg-destructive/10 px-3 py-1 rounded-full">
            {error}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default ReadyPlayerMeAvatar;