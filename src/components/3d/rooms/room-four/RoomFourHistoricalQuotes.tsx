'use client';

import { Html } from '@react-three/drei';
import * as THREE from 'three';
import {
  ROOM_FOUR_QUOTE_PANELS,
  type RoomFourQuotePanel,
} from '@/lib/roomFourHistoricalMarkers';

const IGNORE_RAYCAST: THREE.Object3D['raycast'] = () => undefined;

const QUOTE_MATERIALS = {
  coldBacking: new THREE.MeshStandardMaterial({ color: '#0d141b', roughness: 0.78, metalness: 0.22 }),
  coldSurface: new THREE.MeshStandardMaterial({ color: '#182631', roughness: 0.88, metalness: 0.08 }),
  coldAccent: new THREE.MeshStandardMaterial({ color: '#9cbeca', roughness: 0.56, metalness: 0.42 }),
  warmBacking: new THREE.MeshStandardMaterial({ color: '#181411', roughness: 0.8, metalness: 0.2 }),
  warmSurface: new THREE.MeshStandardMaterial({ color: '#2a251e', roughness: 0.88, metalness: 0.05 }),
  warmAccent: new THREE.MeshStandardMaterial({ color: '#d6a76a', roughness: 0.53, metalness: 0.38 }),
} as const;

const HistoricalQuotePanel = ({
  panel,
  language,
  visible,
}: {
  panel: RoomFourQuotePanel;
  language: 'vi' | 'en';
  visible: boolean;
}) => {
  const [width, height] = panel.dimensions;
  const isSoviet = panel.zone === 'soviet';
  const backing = isSoviet ? QUOTE_MATERIALS.coldBacking : QUOTE_MATERIALS.warmBacking;
  const surface = isSoviet ? QUOTE_MATERIALS.coldSurface : QUOTE_MATERIALS.warmSurface;
  const accent = isSoviet ? QUOTE_MATERIALS.coldAccent : QUOTE_MATERIALS.warmAccent;
  const quoteLines = language === 'vi' ? panel.quoteLinesVi : panel.quoteLinesEn;
  const attribution = language === 'vi' ? panel.attributionVi : panel.attributionEn;
  const frontDepth = 0.08;

  return (
    <group
      name={`room-four-${panel.id}-wall-quote`}
      position={panel.position}
      rotation={panel.rotation}
      raycast={IGNORE_RAYCAST}
    >
      {/* An opposing-wall reading moment: static scenery only, with no collider
          or pointer target, so the approved eight-station journey is unchanged. */}
      <mesh position={[0, 0, -0.06]} material={backing} raycast={IGNORE_RAYCAST}>
        <boxGeometry args={[width + 0.28, height + 0.28, 0.13]} />
      </mesh>
      <mesh position={[0, 0, 0.02]} material={surface} raycast={IGNORE_RAYCAST}>
        <boxGeometry args={[width, height, 0.06]} />
      </mesh>
      <mesh position={[0, height / 2 - 0.18, frontDepth]} material={accent} raycast={IGNORE_RAYCAST}>
        <boxGeometry args={[width - 0.4, 0.035, 0.025]} />
      </mesh>
      <mesh position={[0, -height / 2 + 0.18, frontDepth]} material={accent} raycast={IGNORE_RAYCAST}>
        <boxGeometry args={[width - 0.4, 0.035, 0.025]} />
      </mesh>
      <mesh position={[-width / 2 + 0.18, 0, frontDepth]} material={accent} raycast={IGNORE_RAYCAST}>
        <boxGeometry args={[0.035, height - 0.4, 0.025]} />
      </mesh>

      <Html
        // Lift the type block slightly so the signature has generous bottom space.
        position={[0, 0.1, frontDepth + 0.11]}
        center
        transform
        occlude
        distanceFactor={8.8}
        zIndexRange={[100, 0]}
        style={{
          pointerEvents: 'none',
          userSelect: 'none',
          // Html lives in the DOM, so mirror the Three group visibility here.
          // This guarantees that no quotation can layer over an open station form.
          visibility: visible ? 'visible' : 'hidden',
        }}
        >
        <div
          style={{
            width: 620,
            color: '#f2e5cc',
            textAlign: 'center',
            textShadow: '0 3px 12px rgba(0, 0, 0, 0.82)',
          }}
        >
          <div
            style={{
              fontFamily: '"EB Garamond", Georgia, serif',
              fontSize: 25,
              fontStyle: 'italic',
              fontWeight: 700,
              letterSpacing: '0.005em',
              lineHeight: 1.14,
            }}
          >
            {quoteLines.map((line) => (
              <span key={line} style={{ display: 'block', whiteSpace: 'nowrap' }}>
                {line}
              </span>
            ))}
          </div>
          <div
            style={{
              color: isSoviet ? '#9db9c2' : '#d7b17c',
              fontFamily: '"EB Garamond", Georgia, serif',
              fontSize: 13,
              fontWeight: 600,
              fontStyle: 'italic',
              letterSpacing: '0.025em',
              marginTop: 17,
            }}
          >
            {attribution}
          </div>
        </div>
      </Html>
    </group>
  );
};

/**
 * The two quotations occupy the wall opposite each framed flag, completing
 * the Soviet and Guangzhou reading pairs without altering the room's route.
 * They are temporarily hidden while a station form is open so the form always
 * remains the primary reading surface.
 */
export const RoomFourHistoricalQuotes = ({
  language,
  visible = true,
}: {
  language: 'vi' | 'en';
  visible?: boolean;
}) => (
  <group name="room-four-historical-wall-quotes" visible={visible} raycast={IGNORE_RAYCAST}>
    {ROOM_FOUR_QUOTE_PANELS.map((panel) => (
      <HistoricalQuotePanel key={panel.id} panel={panel} language={language} visible={visible} />
    ))}
  </group>
);

export default RoomFourHistoricalQuotes;
