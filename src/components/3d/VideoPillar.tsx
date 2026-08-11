'use client';

import React from 'react';
import { useVideoTexture } from '@react-three/drei';

import { ROOM_THREE_VIDEO_URL } from '@/lib/roomThreeQuest';

export interface VideoPillarProps {}

const SCREEN_CONFIG = [
  { position: [0, 2.35, 0.78] as [number, number, number], rotationY: 0 },
  { position: [0.78, 2.35, 0] as [number, number, number], rotationY: Math.PI / 2 },
  { position: [0, 2.35, -0.78] as [number, number, number], rotationY: Math.PI },
  { position: [-0.78, 2.35, 0] as [number, number, number], rotationY: -Math.PI / 2 },
];

export const VideoPillar: React.FC<VideoPillarProps> = () => {
  const videoTexture = useVideoTexture(ROOM_THREE_VIDEO_URL, {
    start: false,
    muted: true,
    loop: true,
    playsInline: true,
    crossOrigin: 'anonymous',
  });

  return (
    <group>
      <mesh position={[0, 0.14, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.85, 1, 0.28, 32]} />
        <meshStandardMaterial color="#211a16" metalness={0.75} roughness={0.25} />
      </mesh>

      <mesh position={[0, 1.72, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.58, 0.7, 3.25, 24]} />
        <meshStandardMaterial color="#3b2a22" metalness={0.55} roughness={0.3} />
      </mesh>

      <mesh position={[0, 3.35, 0]}>
        <cylinderGeometry args={[0.7, 0.7, 0.16, 24]} />
        <meshStandardMaterial color="#b8893e" metalness={0.8} roughness={0.2} />
      </mesh>

      {SCREEN_CONFIG.map(({ position, rotationY }, index) => (
        <group key={`video-screen-${index}`} position={position} rotation={[0, rotationY, 0]}>
          <mesh position={[0, 0, -0.045]} castShadow>
            <boxGeometry args={[2.95, 1.95, 0.12]} />
            <meshStandardMaterial color="#111827" metalness={0.5} roughness={0.22} />
          </mesh>
          <mesh position={[0, 0, 0.025]}>
            <planeGeometry args={[2.65, 1.62]} />
            <meshBasicMaterial map={videoTexture} toneMapped={false} color="#ffffff" />
          </mesh>
          <mesh position={[0, 0, 0.045]}>
            <boxGeometry args={[2.78, 1.74, 0.025]} />
            <meshBasicMaterial color="#d4a85a" wireframe />
          </mesh>
        </group>
      ))}

    </group>
  );
};

export default VideoPillar;
