
import React from 'react';
import * as THREE from 'three';

interface ConnectionLineProps {
  start: [number, number, number];
  end: [number, number, number];
  active: boolean;
  secure: boolean;
}

const ConnectionLine: React.FC<ConnectionLineProps> = ({ start, end, active, secure }) => {
  const points = React.useMemo(() => {
    const startVector = new THREE.Vector3(start[0], start[1], start[2]);
    const endVector = new THREE.Vector3(end[0], end[1], end[2]);
    return [startVector, endVector];
  }, [start, end]);
  
  const lineColor = React.useMemo(() => {
    if (secure) {
      return active ? "#00ff88" : "#00aa44";
    } else {
      return active ? "#ff8800" : "#aa4400";
    }
  }, [active, secure]);

  const geometry = React.useMemo(() => {
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    return geometry;
  }, [points]);
  
  return (
    <line geometry={geometry}>
      <lineBasicMaterial 
        color={lineColor} 
        linewidth={active ? 3 : 1}
        transparent={true}
        opacity={active ? 0.8 : 0.3}
      />
    </line>
  );
};

export default ConnectionLine;
