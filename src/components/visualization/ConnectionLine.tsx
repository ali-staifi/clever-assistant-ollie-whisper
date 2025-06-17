
import React from 'react';
import { Line } from '@react-three/drei';

interface ConnectionLineProps {
  start: [number, number, number];
  end: [number, number, number];
  active: boolean;
  secure: boolean;
}

const ConnectionLine: React.FC<ConnectionLineProps> = ({ start, end, active, secure }) => {
  // Créer les points pour la ligne (format attendu par Line)
  const points = React.useMemo(() => {
    return [start, end];
  }, [start, end]);
  
  // Déterminer la couleur
  const lineColor = React.useMemo(() => {
    if (secure) {
      return active ? "#00ff88" : "#00aa44";
    } else {
      return active ? "#ff8800" : "#aa4400";
    }
  }, [active, secure]);
  
  return (
    <Line
      points={points}
      color={lineColor}
      lineWidth={active ? 3 : 1}
      transparent
      opacity={active ? 0.8 : 0.3}
    />
  );
};

export default ConnectionLine;
