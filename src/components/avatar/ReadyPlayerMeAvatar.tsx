import React, { useEffect, useRef, useState } from 'react';
import { Engine, Scene, FreeCamera, Vector3, HemisphericLight, SceneLoader, MorphTargetManager, Sound, Analyser } from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import { motion } from 'framer-motion';

interface ReadyPlayerMeAvatarProps {
  isListening: boolean;
  isSpeaking: boolean;
  emotionalState: 'neutral' | 'encouraging' | 'supportive' | 'energetic';
  currentText?: string;
  audioUrl?: string;
}

export const ReadyPlayerMeAvatar: React.FC<ReadyPlayerMeAvatarProps> = ({
  isListening,
  isSpeaking,
  emotionalState,
  currentText,
  audioUrl
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const avatarRef = useRef<any>(null);
  const analyserRef = useRef<Analyser | null>(null);
  const soundRef = useRef<Sound | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Avatar Ready Player Me URL
  const avatarUrl = "https://models.readyplayer.me/689129bfdebb07631bc0ba6e.glb";

  useEffect(() => {
    if (!canvasRef.current) return;

    const initBabylon = async () => {
      try {
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

        // Charger l'avatar
        const result = await SceneLoader.ImportMeshAsync("", "", avatarUrl, scene);
        
        if (result.meshes.length > 0) {
          avatarRef.current = result.meshes[0];
          
          // Chercher les morph targets pour l'animation de la bouche
          result.meshes.forEach(mesh => {
            if (mesh.morphTargetManager) {
              console.log("Morph targets trouvés:", mesh.morphTargetManager.numTargets);
            }
          });
          
          setIsLoading(false);
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
      if (engineRef.current) {
        engineRef.current.dispose();
      }
    };
  }, []);

  // Effet pour la synchronisation audio/morph targets
  useEffect(() => {
    if (!sceneRef.current || !avatarRef.current || !audioUrl || !isSpeaking) return;

    const playAudioWithMorphTargets = async () => {
      try {
        // Créer le son
        const sound = new Sound("voice", audioUrl, sceneRef.current!, null, {
          loop: false,
          autoplay: true,
          volume: 1.0
        });

        soundRef.current = sound;

        // Créer l'analyseur audio
        const analyser = new Analyser(sceneRef.current!);
        analyser.SMOOTHING = 0.8;
        analyser.FFT_SIZE = 512;
        analyserRef.current = analyser;

        // Connecter l'analyseur au son (utiliser l'API Web Audio directement)
        if ((sound as any).spatialSound) {
          analyser.connectAudioNodes((sound as any).spatialSound, (sound as any).spatialSound);
        }

        // Animation des morph targets basée sur l'analyse audio
        const animateMouthFromAudio = () => {
          if (!analyserRef.current || !avatarRef.current) return;

          const dataArray = analyserRef.current.getByteFrequencyData();
          
          // Calculer l'amplitude moyenne
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const average = sum / dataArray.length;
          
          // Normaliser entre 0 et 1
          const normalizedAmplitude = Math.min(average / 100, 1);

          // Animer les morph targets de la bouche
          avatarRef.current.getChildMeshes().forEach((mesh: any) => {
            if (mesh.morphTargetManager) {
              const manager = mesh.morphTargetManager as MorphTargetManager;
              
              // Chercher les morph targets liés à la bouche
              for (let i = 0; i < manager.numTargets; i++) {
                const target = manager.getTarget(i);
                const targetName = target.name.toLowerCase();
                
                if (targetName.includes('mouth') || targetName.includes('jaw') || targetName.includes('lips')) {
                  // Animer en fonction de l'amplitude audio
                  target.influence = normalizedAmplitude * 0.6; // Facteur d'atténuation
                }
              }
            }
          });

          if (sound.isPlaying) {
            requestAnimationFrame(animateMouthFromAudio);
          }
        };

        // Démarrer l'animation quand le son commence
        sound.onEndedObservable.add(() => {
          // Remettre les morph targets à zéro
          avatarRef.current?.getChildMeshes().forEach((mesh: any) => {
            if (mesh.morphTargetManager) {
              const manager = mesh.morphTargetManager as MorphTargetManager;
              for (let i = 0; i < manager.numTargets; i++) {
                manager.getTarget(i).influence = 0;
              }
            }
          });
        });

        animateMouthFromAudio();

      } catch (err) {
        console.error("Erreur lors de la lecture audio:", err);
      }
    };

    playAudioWithMorphTargets();

    return () => {
      if (soundRef.current) {
        soundRef.current.dispose();
      }
    };
  }, [audioUrl, isSpeaking]);

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