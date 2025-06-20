
import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ConnectionLineProps {
  start: [number, number, number];
  end: [number, number, number];
  active: boolean;
  secure: boolean;
}

const ConnectionLine: React.FC<ConnectionLineProps> = ({ start, end, active, secure }) => {
  const lineRef = useRef<THREE.Line>(null);

  const lineColor = React.useMemo(() => {
    if (secure) {
      return active ? "#00ff88" : "#00aa44";
    } else {
      return active ? "#ff8800" : "#aa4400";
    }
  }, [active, secure]);

  useEffect(() => {
    if (lineRef.current) {
      // Update geometry
      const positions = new Float32Array([
        start[0], start[1], start[2],
        end[0], end[1], end[2]
      ]);
      lineRef.current.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      
      // Update material
      if (lineRef.current.material instanceof THREE.LineBasicMaterial) {
        lineRef.current.material.color.set(lineColor);
        lineRef.current.material.opacity = active ? 0.8 : 0.5;
      }
    }
  }, [start, end, lineColor, active]);

  return (
    <line ref={lineRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={2}
          array={new Float32Array([
            start[0], start[1], start[2],
            end[0], end[1], end[2]
          ])}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial
        color={lineColor}
        transparent
        opacity={active ? 0.8 : 0.5}
      />
    </line>
  );
};

export default ConnectionLine;
