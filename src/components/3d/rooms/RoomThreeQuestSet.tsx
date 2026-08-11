import React from 'react';
import { Html } from '@react-three/drei';
import { ROOM_THREE_FRAGMENTS } from '@/lib/roomThreeQuest';

interface RoomThreeQuestSetProps {
  isVisible?: boolean;
}

const framedFragmentIds = new Set([
  'legal-equality',
  'press-freedom',
  'assembly-freedom',
  'versailles-representation',
]);

const panelStyle: React.CSSProperties = {
  color: '#fef3c7',
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: '9px',
  fontWeight: 800,
  letterSpacing: '0.04em',
  textAlign: 'center',
  textShadow: '0 1px 3px rgba(0,0,0,0.9)',
  whiteSpace: 'nowrap',
};

const ExhibitLabel: React.FC<{ title: string; source: string }> = ({ title, source }) => (
  <Html position={[0, -1.65, 0.08]} center distanceFactor={8} style={{ pointerEvents: 'none' }}>
    <div style={panelStyle}>
      <div>{source}</div>
      <div style={{ color: '#fde68a', marginTop: 3 }}>{title}</div>
    </div>
  </Html>
);

const HistoricDisplay: React.FC<{
  title: string;
  source: string;
  position: readonly [number, number, number];
  rotationY?: number;
  framed?: boolean;
}> = ({ title, source, position, rotationY = 0, framed = false }) => (
  <group position={position} rotation={[0, rotationY, 0]}>
    <mesh castShadow>
      <boxGeometry args={framed ? [4.1, 2.7, 0.16] : [3.6, 2.25, 0.12]} />
      <meshStandardMaterial color={framed ? '#5b3a24' : '#2b3a4b'} roughness={0.7} metalness={0.15} />
    </mesh>
    <mesh position={[0, 0, 0.1]}>
      <boxGeometry args={framed ? [3.7, 2.3, 0.04] : [3.2, 1.85, 0.04]} />
      <meshStandardMaterial color={framed ? '#d6b77a' : '#d8c49b'} roughness={0.82} />
    </mesh>
    <mesh position={[0, 0, 0.13]}>
      <boxGeometry args={framed ? [3.35, 1.95, 0.02] : [2.9, 1.5, 0.02]} />
      <meshStandardMaterial color={framed ? '#4a3b2b' : '#7b6041'} roughness={0.9} />
    </mesh>
    <ExhibitLabel title={title} source={source} />
  </group>
);

const Desk: React.FC = () => (
  <group position={[7.1, 0, 10.9]}>
    <mesh position={[0, 1.05, 0]} castShadow>
      <boxGeometry args={[5.4, 0.28, 2.3]} />
      <meshStandardMaterial color="#6b3f24" roughness={0.58} />
    </mesh>
    {[-2.15, 2.15].map((x) => (
      <mesh key={`desk-leg-${x}`} position={[x, 0.5, 0]} castShadow>
        <boxGeometry args={[0.3, 1.0, 1.8]} />
        <meshStandardMaterial color="#4a2b1a" roughness={0.65} />
      </mesh>
    ))}
    <mesh position={[0, 1.25, 0.05]} rotation={[0, 0, -0.015]}>
      <boxGeometry args={[2.1, 0.035, 1.45]} />
      <meshStandardMaterial color="#d9c29a" roughness={0.95} />
    </mesh>
    <mesh position={[0.45, 1.27, 0.05]} rotation={[0, 0, 0.03]}>
      <boxGeometry args={[1.1, 0.04, 1.45]} />
      <meshStandardMaterial color="#8f6b46" roughness={0.95} />
    </mesh>

    {/* Máy đánh chữ */}
    <group position={[-1.35, 1.33, -0.28]}>
      <mesh castShadow>
        <boxGeometry args={[1.7, 0.38, 0.9]} />
        <meshStandardMaterial color="#20252b" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.32, 0.04]}>
        <boxGeometry args={[1.3, 0.45, 0.12]} />
        <meshStandardMaterial color="#303944" metalness={0.5} roughness={0.35} />
      </mesh>
      {[-0.45, -0.15, 0.15, 0.45].map((x) => (
        <mesh key={`key-${x}`} position={[x, 0.22, 0.34]}>
          <boxGeometry args={[0.16, 0.04, 0.16]} />
          <meshStandardMaterial color="#d6b77a" roughness={0.6} />
        </mesh>
      ))}
    </group>

    {/* Phong thư và báo cũ */}
    <mesh position={[-0.4, 1.28, 0.75]} rotation={[0.03, 0.15, -0.08]}>
      <boxGeometry args={[1.15, 0.04, 0.75]} />
      <meshStandardMaterial color="#efe0bd" roughness={0.95} />
    </mesh>
    <mesh position={[-1.85, 1.27, 0.72]} rotation={[0, -0.18, 0.05]}>
      <boxGeometry args={[1.35, 0.035, 0.9]} />
      <meshStandardMaterial color="#b5a17d" roughness={1} />
    </mesh>
    <mesh position={[-1.6, 1.3, 0.72]}>
      <boxGeometry args={[0.08, 0.09, 0.08]} />
      <meshStandardMaterial color="#2b1d16" roughness={0.5} />
    </mesh>

    {/* Con dấu đỏ */}
    <mesh position={[1.25, 1.39, 0.35]} castShadow>
      <cylinderGeometry args={[0.18, 0.18, 0.22, 20]} />
      <meshStandardMaterial color="#991b1b" roughness={0.4} metalness={0.2} />
    </mesh>
    <mesh position={[1.25, 1.58, 0.35]}>
      <cylinderGeometry args={[0.09, 0.12, 0.28, 16]} />
      <meshStandardMaterial color="#4a2518" roughness={0.5} />
    </mesh>

    {/* Đèn bàn vàng */}
    <mesh position={[1.9, 1.35, -0.55]}>
      <cylinderGeometry args={[0.04, 0.04, 0.8, 12]} />
      <meshStandardMaterial color="#c59b45" metalness={0.8} roughness={0.25} />
    </mesh>
    <mesh position={[1.9, 1.8, -0.55]}>
      <coneGeometry args={[0.4, 0.38, 20, 1, true]} />
      <meshStandardMaterial color="#f4c95d" emissive="#6b4a10" emissiveIntensity={0.35} side={2} />
    </mesh>
    <pointLight position={[1.9, 1.65, -0.55]} color="#ffd86b" intensity={1.3} distance={4} />

    <Html position={[0, 2.35, 0]} center distanceFactor={7} style={{ pointerEvents: 'none' }}>
      <div style={{ ...panelStyle, color: '#fde68a', fontSize: '11px' }}>
        BÀN LÀM VIỆC CỦA NGUYỄN ÁI QUỐC
      </div>
    </Html>
  </group>
);

export const RoomThreeQuestSet: React.FC<RoomThreeQuestSetProps> = ({ isVisible = true }) => (
  <group visible={isVisible}>
    {ROOM_THREE_FRAGMENTS
      .filter((fragment) => !fragment.sourceLocation.includes('Bàn') && !fragment.sourceLocation.includes('Phong thư') && !fragment.sourceLocation.includes('Hồ sơ'))
      .map((fragment) => (
        <HistoricDisplay
          key={fragment.id}
          title={fragment.title}
          source={fragment.sourceLocation}
          position={fragment.position}
          rotationY={fragment.position[0] < -10 ? Math.PI / 2 : fragment.position[0] > 10 ? -Math.PI / 2 : Math.PI}
          framed={framedFragmentIds.has(fragment.id)}
        />
      ))}
    <Desk />
  </group>
);

export default RoomThreeQuestSet;
