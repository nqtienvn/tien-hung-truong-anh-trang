'use client';

import { useEffect } from 'react';
import { Html, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import {
  ROOM_FOUR_FLAG_FRAMES,
  type RoomFourFlagFrame,
} from '@/lib/roomFourHistoricalMarkers';

const IGNORE_RAYCAST: THREE.Object3D['raycast'] = () => undefined;

const FRAME_MATERIALS = {
  backing: new THREE.MeshStandardMaterial({ color: '#15110f', roughness: 0.76, metalness: 0.16 }),
  mat: new THREE.MeshStandardMaterial({ color: '#282019', roughness: 0.92, metalness: 0.02 }),
  timber: new THREE.MeshStandardMaterial({ color: '#4a3021', roughness: 0.71, metalness: 0.07 }),
  innerTrim: new THREE.MeshStandardMaterial({ color: '#9c7042', roughness: 0.57, metalness: 0.28 }),
} as const;

const FramedFlag = ({
  frame,
  texture,
  language,
  visible,
}: {
  frame: RoomFourFlagFrame;
  texture: THREE.Texture;
  language: 'vi' | 'en';
  visible: boolean;
}) => {
  const [width, height] = frame.dimensions;
  const trim = 0.19;
  const mat = 0.16;
  const outerWidth = width + (trim + mat) * 2;
  const outerHeight = height + (trim + mat) * 2;
  const frontDepth = 0.12;

  return (
    <group
      name={`room-four-${frame.id}-framed-flag`}
      position={frame.position}
      rotation={frame.rotation}
      raycast={IGNORE_RAYCAST}
    >
      {/* One large, fixed 3:2 frame. It is a visual marker only: no collider,
          light, animation, pointer event, or journey step. */}
      <mesh position={[0, 0, -0.03]} material={FRAME_MATERIALS.backing} raycast={IGNORE_RAYCAST}>
        <boxGeometry args={[outerWidth + 0.08, outerHeight + 0.08, 0.1]} />
      </mesh>
      <mesh position={[0, 0, 0.025]} material={FRAME_MATERIALS.mat} raycast={IGNORE_RAYCAST}>
        <boxGeometry args={[width + mat * 2, height + mat * 2, 0.08]} />
      </mesh>
      <mesh position={[0, 0, frontDepth]} raycast={IGNORE_RAYCAST}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial map={texture} roughness={0.83} metalness={0.02} side={THREE.DoubleSide} />
      </mesh>

      <mesh position={[-(width + trim) / 2, 0, frontDepth + 0.025]} material={FRAME_MATERIALS.timber} raycast={IGNORE_RAYCAST}>
        <boxGeometry args={[trim, outerHeight, 0.15]} />
      </mesh>
      <mesh position={[(width + trim) / 2, 0, frontDepth + 0.025]} material={FRAME_MATERIALS.timber} raycast={IGNORE_RAYCAST}>
        <boxGeometry args={[trim, outerHeight, 0.15]} />
      </mesh>
      <mesh position={[0, (height + trim) / 2, frontDepth + 0.025]} material={FRAME_MATERIALS.timber} raycast={IGNORE_RAYCAST}>
        <boxGeometry args={[width, trim, 0.15]} />
      </mesh>
      <mesh position={[0, -(height + trim) / 2, frontDepth + 0.025]} material={FRAME_MATERIALS.timber} raycast={IGNORE_RAYCAST}>
        <boxGeometry args={[width, trim, 0.15]} />
      </mesh>

      <mesh position={[0, height / 2 + 0.055, frontDepth + 0.11]} material={FRAME_MATERIALS.innerTrim} raycast={IGNORE_RAYCAST}>
        <boxGeometry args={[width + 0.05, 0.035, 0.025]} />
      </mesh>
      <mesh position={[0, -height / 2 - 0.055, frontDepth + 0.11]} material={FRAME_MATERIALS.innerTrim} raycast={IGNORE_RAYCAST}>
        <boxGeometry args={[width + 0.05, 0.035, 0.025]} />
      </mesh>

      <Html
        position={[0, height / 2 + 0.54, frontDepth + 0.16]}
        center
        transform
        occlude
        distanceFactor={8}
        zIndexRange={[100, 0]}
        style={{
          pointerEvents: 'none',
          userSelect: 'none',
          // Html is rendered in the DOM, so mirror the Three visibility when
          // a station form opens to prevent the heading from overlapping it.
          visibility: visible ? 'visible' : 'hidden',
        }}
      >
        <div
          style={{
            minWidth: 320,
            textAlign: 'center',
            textShadow: '0 3px 14px rgba(0, 0, 0, 0.8)',
            whiteSpace: 'nowrap',
          }}
        >
          <div
            style={{
              color: '#f2e5cc',
              fontFamily: '"EB Garamond", Georgia, serif',
              fontSize: 34,
              fontWeight: 700,
              letterSpacing: '0.06em',
              lineHeight: 0.96,
            }}
          >
            {language === 'vi' ? frame.titleVi : frame.titleEn}
          </div>
          <div
            style={{
              color: '#d6ab69',
              fontFamily: '"Space Grotesk", ui-monospace, monospace',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.2em',
              marginTop: 7,
            }}
          >
            {language === 'vi' ? frame.timelineVi : frame.timelineEn}
          </div>
        </div>
      </Html>
    </group>
  );
};

/**
 * The user-provided flags occupy only one framed wall section per historical
 * zone. All remaining Room 4 walls stay untouched for later customization.
 */
export const RoomFourHistoricalFlags = ({
  language,
  visible = true,
}: {
  language: 'vi' | 'en';
  visible?: boolean;
}) => {
  const textures = useTexture(ROOM_FOUR_FLAG_FRAMES.map((frame) => frame.textureSrc));

  useEffect(() => {
    textures.forEach((texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 4;
      texture.needsUpdate = true;
    });
  }, [textures]);

  return (
    <group name="room-four-framed-flags" visible={visible} raycast={IGNORE_RAYCAST}>
      {ROOM_FOUR_FLAG_FRAMES.map((frame, index) => (
        <FramedFlag
          key={frame.id}
          frame={frame}
          texture={textures[index]}
          language={language}
          visible={visible}
        />
      ))}
    </group>
  );
};

export default RoomFourHistoricalFlags;
