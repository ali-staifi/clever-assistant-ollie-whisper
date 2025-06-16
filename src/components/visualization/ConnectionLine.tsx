
import React from 'react';
import { Line } from '@react-three/drei';

interface ConnectionLineProps {
  start: [number, number, number];
  end: [number, number, number];
  active: boolean;
  secure: boolean;
}

const ConnectionLine: React.FC<ConnectionLineProps> = ({ start, end, active, secure }) => {
  const points = [start, end];
  
  return (
    <Line
      points={points}
      color={secure ? (active ? "#00ff88" : "#00aa44") : (active ? "#ff8800" : "#aa4400")}
      lineWidth={active ? 3 : 1}
      transparent
      opacity={active ? 0.8 : 0.3}
    />
  );
};

export default ConnectionLine;
