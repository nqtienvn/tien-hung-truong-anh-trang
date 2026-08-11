'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Html, useVideoTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useMuseum } from '@/context/MuseumContext';
import {
  getVideoPillarTransition,
  isInsideVideoPillarZone,
} from '@/lib/videoPillarZone';

const VIDEO_URL = '/videos/room-three-pillar.mp4';
const DEFAULT_ACTIVATION_RADIUS = 3;

export interface VideoPillarProps {
  activationRadius?: number;
}

const SCREEN_CONFIG = [
  { position: [0, 2.35, 0.78] as [number, number, number], rotationY: 0 },
  { position: [0.78, 2.35, 0] as [number, number, number], rotationY: Math.PI / 2 },
  { position: [0, 2.35, -0.78] as [number, number, number], rotationY: Math.PI },
  { position: [-0.78, 2.35, 0] as [number, number, number], rotationY: -Math.PI / 2 },
];

export const VideoPillar: React.FC<VideoPillarProps> = ({
  activationRadius = DEFAULT_ACTIVATION_RADIUS,
}) => {
  const { language } = useMuseum();
  const pillarRef = useRef<THREE.Group>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const wasInsideRef = useRef(false);
  const worldCenter = useMemo(() => new THREE.Vector3(), []);
  const videoTexture = useVideoTexture(VIDEO_URL, {
    start: false,
    muted: false,
    loop: true,
    playsInline: true,
    crossOrigin: 'anonymous',
  });
  const video = videoTexture.image as HTMLVideoElement;
  const [needsUnmute, setNeedsUnmute] = useState(false);

  useEffect(() => {
    videoRef.current = video;

    return () => {
      video.pause();
      video.currentTime = 0;
      videoRef.current = null;
    };
  }, [video]);

  const playFromBeginning = useCallback(async () => {
    const activeVideo = videoRef.current;
    if (!activeVideo) return;

    activeVideo.currentTime = 0;
    activeVideo.muted = false;

    try {
      await activeVideo.play();
      setNeedsUnmute(false);
    } catch {
      activeVideo.muted = true;
      setNeedsUnmute(true);
      await activeVideo.play().catch(() => undefined);
    }
  }, []);

  const stopAndReset = useCallback(() => {
    const activeVideo = videoRef.current;
    if (!activeVideo) return;

    activeVideo.pause();
    activeVideo.currentTime = 0;
    setNeedsUnmute(false);
  }, []);

  const handleUnmute = useCallback(async () => {
    const activeVideo = videoRef.current;
    if (!activeVideo) return;

    activeVideo.muted = false;
    try {
      await activeVideo.play();
      setNeedsUnmute(false);
    } catch {
      activeVideo.muted = true;
      setNeedsUnmute(true);
    }
  }, []);

  useFrame((state) => {
    const player = state.scene.getObjectByName('lobby-player');
    if (!player || !pillarRef.current) return;

    pillarRef.current.getWorldPosition(worldCenter);
    const isInside = isInsideVideoPillarZone(
      player.position.x,
      player.position.z,
      worldCenter.x,
      worldCenter.z,
      activationRadius,
    );
    const transition = getVideoPillarTransition(wasInsideRef.current, isInside);

    if (transition === 'enter') {
      void playFromBeginning();
    } else if (transition === 'leave') {
      stopAndReset();
    }

    wasInsideRef.current = isInside;
  });

  return (
    <group ref={pillarRef}>
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

      {needsUnmute && (
        <Html position={[0, 4.25, 0]} center distanceFactor={7}>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              void handleUnmute();
            }}
            style={{
              border: '1px solid rgba(245, 158, 11, 0.7)',
              borderRadius: '999px',
              background: 'rgba(15, 23, 42, 0.94)',
              color: '#fef3c7',
              cursor: 'pointer',
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '12px',
              fontWeight: 800,
              letterSpacing: '0.04em',
              padding: '9px 16px',
              whiteSpace: 'nowrap',
            }}
          >
            {language === 'vi' ? 'Bật tiếng' : 'Unmute'}
          </button>
        </Html>
      )}
    </group>
  );
};

export default VideoPillar;
