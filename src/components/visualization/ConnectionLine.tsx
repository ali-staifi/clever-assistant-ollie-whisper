
import React from 'react';
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

  const geometry = React.useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const points = new Float32Array([
      start[0], start[1], start[2],
      end[0], end[1], end[2]
    ]);
    geometry.setAttribute('position', new THREE.BufferAttribute(points, 3));
    return geometry;
  }, [start, end]);

  const material = React.useMemo(() => {
    return new THREE.LineBasicMaterial({
      color: lineColor,
      linewidth: active ? 3 : 1,
      transparent: true,
      opacity: active ? 0.8 : 0.5
    });
  }, [lineColor, active]);

  return (
    <primitive object={new THREE.Line(geometry, material)} />
  );
};

export default ConnectionLine;
