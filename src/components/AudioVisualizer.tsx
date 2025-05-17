
import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  isListening: boolean;
  isPulsing?: boolean;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ isListening, isPulsing = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  useEffect(() => {
    let audioContext: AudioContext | null = null;
    let micStream: MediaStream | null = null;

    const setupMicrophone = async () => {
      try {
        if (isListening) {
          audioContext = new (window.AudioContext || window.webkitAudioContext)();
          analyserRef.current = audioContext.createAnalyser();
          analyserRef.current.fftSize = 256;
          
          micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const source = audioContext.createMediaStreamSource(micStream);
          source.connect(analyserRef.current);
          
          const bufferLength = analyserRef.current.frequencyBinCount;
          dataArrayRef.current = new Uint8Array(bufferLength);
          
          startVisualization();
        } else {
          stopVisualization();
        }
      } catch (error) {
        console.error("Error accessing microphone:", error);
      }
    };

    setupMicrophone();

    return () => {
      stopVisualization();
      if (micStream) {
        micStream.getTracks().forEach(track => track.stop());
      }
      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close();
      }
    };
  }, [isListening]);

  const startVisualization = () => {
    if (!canvasRef.current || !analyserRef.current || !dataArrayRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      if (!isListening) return;
      if (!analyserRef.current || !dataArrayRef.current || !ctx) return;

      animationRef.current = requestAnimationFrame(draw);

      // Get the visualization data
      analyserRef.current.getByteFrequencyData(dataArrayRef.current);
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw circular visualizer
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(centerX, centerY) * 0.8;
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = '#0066AA';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw frequency data around the circle
      const bufferLength = analyserRef.current.frequencyBinCount;
      
      for (let i = 0; i < bufferLength; i++) {
        const value = dataArrayRef.current[i];
        const percent = value / 256;
        const barHeight = radius * 0.1 + percent * radius * 0.3;
        
        const angle = (i * Math.PI * 2) / bufferLength;
        const x = centerX + Math.cos(angle) * (radius - barHeight / 2);
        const y = centerY + Math.sin(angle) * (radius - barHeight / 2);
        
        ctx.beginPath();
        ctx.moveTo(
          centerX + Math.cos(angle) * radius,
          centerY + Math.sin(angle) * radius
        );
        ctx.lineTo(x, y);
        
        // Gradient from blue to cyan based on amplitude
        const hue = 200 + percent * 40; // 200 (blue) to 240 (cyan)
        ctx.strokeStyle = `hsl(${hue}, 100%, ${50 + percent * 30}%)`;
        ctx.lineWidth = 2 + percent * 3;
        ctx.stroke();
      }
    };

    draw();
  };

  const stopVisualization = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const drawSimplePulse = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxRadius = Math.min(centerX, centerY) * 0.8;

    // Draw outer circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, maxRadius, 0, Math.PI * 2);
    ctx.strokeStyle = '#0066AA';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw pulsing circle if needed
    if (isPulsing) {
      const now = Date.now() / 1000;
      const pulseSize = Math.sin(now * 3) * 0.1 + 0.9; // 0.8 to 1.0
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, maxRadius * pulseSize, 0, Math.PI * 2);
      ctx.strokeStyle = '#00AAFF';
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    // Request next frame if pulsing
    if (isPulsing) {
      animationRef.current = requestAnimationFrame(drawSimplePulse);
    }
  };

  useEffect(() => {
    if (!isListening && isPulsing) {
      animationRef.current = requestAnimationFrame(drawSimplePulse);
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [isPulsing, isListening]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      width={300}
      height={300}
    />
  );
};

export default AudioVisualizer;

// Add AudioContext to window type
declare global {
  interface Window {
    AudioContext: typeof AudioContext;
    webkitAudioContext: typeof AudioContext;
  }
}
