
import React from 'react';
import { Line } from '@react-three/drei';
import * as THREE from 'three';

interface ConnectionLineProps {
  start: [number, number, number];
  end: [number, number, number];
  active: boolean;
  secure: boolean;
}

const ConnectionLine: React.FC<ConnectionLineProps> = ({ start, end, active, secure }) => {
  const lineColor = React.useMemo(() => {
    if (secure) {
      return active ? "#00ff88" : "#00aa44";
    } else {
      return active ? "#ff8800" : "#aa4400";
    }
  }, [active, secure]);

  const points = React.useMemo(() => [
    new THREE.Vector3(start[0], start[1], start[2]),
    new THREE.Vector3(end[0], end[1], end[2])
  ], [start, end]);

  return (
    <Line
      points={points}
      color={lineColor}
      lineWidth={active ? 3 : 2}
      transparent
      opacity={active ? 0.8 : 0.5}
    />
  );
};

export default ConnectionLine;
