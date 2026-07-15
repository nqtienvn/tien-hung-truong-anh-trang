import React from 'react';
import * as THREE from 'three';
import { useMuseum } from '@/context/MuseumContext';
import { BaseRoom, BaseRoomProps } from './BaseRoom';

// ═══════════════════════════════════════════════════════════════════════════
// ĐỊNH NGHĨA GEOMETRIES & MATERIALS DÙNG CHUNG ĐỂ TRÁNH GIẬT LAG WEBGL
// ═══════════════════════════════════════════════════════════════════════════
const postCylinderGeom = new THREE.CylinderGeometry(0.055, 0.07, 0.96, 8);
const postSphereGeom   = new THREE.SphereGeometry(0.13, 8, 8);
const postBaseGeom     = new THREE.CylinderGeometry(0.22, 0.28, 0.08, 10);
const ropeMainGeom     = new THREE.CylinderGeometry(0.045, 0.045, 1.0, 8);
const ropeThinGeom     = new THREE.CylinderGeometry(0.028, 0.028, 1.0, 8);

const benchBoxGeom        = new THREE.BoxGeometry(3.2, 0.08, 0.8);
const benchLegGeom        = new THREE.BoxGeometry(0.15, 0.4, 0.7);
const centralBenchTopGeom  = new THREE.BoxGeometry(4.0, 0.12, 0.82);
const centralBenchBackGeom = new THREE.BoxGeometry(4.0, 0.12, 0.72);
const centralBenchLegGeom  = new THREE.BoxGeometry(0.16, 0.5, 0.16);

const tableTopGeom   = new THREE.CylinderGeometry(0.42, 0.46, 0.08, 10);
const tableLegGeom   = new THREE.CylinderGeometry(0.055, 0.075, 0.64, 8);
const tableBaseGeom  = new THREE.CylinderGeometry(0.28, 0.34, 0.06, 8);
const vaseBodyGeom   = new THREE.CylinderGeometry(0.09, 0.13, 0.26, 8);
const vaseMouthGeom  = new THREE.SphereGeometry(0.11, 8, 8);
const flowerStemGeom = new THREE.CylinderGeometry(0.008, 0.009, 0.3, 8);
const flowerBudGeom  = new THREE.SphereGeometry(0.045, 8, 8);

const postMat     = new THREE.MeshStandardMaterial({ color: '#2a2119', roughness: 0.28, metalness: 0.65 });
const metalMat    = new THREE.MeshStandardMaterial({ color: '#c59b45', roughness: 0.22, metalness: 0.85 });
const ropeMat     = new THREE.MeshStandardMaterial({ color: '#9f1239', roughness: 0.55, metalness: 0.05 });
const ropeThinMat = new THREE.MeshStandardMaterial({ color: '#7f1d1d', roughness: 0.62, metalness: 0.03 });

const benchMat            = new THREE.MeshStandardMaterial({ color: '#4e2e1e', roughness: 0.3 });
const benchLegMat         = new THREE.MeshStandardMaterial({ color: '#361f14', roughness: 0.5 });
const centralBenchTopMat  = new THREE.MeshStandardMaterial({ color: '#5a3421', roughness: 0.38 });
const centralBenchBackMat = new THREE.MeshStandardMaterial({ color: '#4a2b1b', roughness: 0.42 });
const centralBenchLegMat  = new THREE.MeshStandardMaterial({ color: '#2d1a11', roughness: 0.55 });

const tableTopMat      = new THREE.MeshStandardMaterial({ color: '#4b2a19', roughness: 0.42 });
const tableLegMat      = new THREE.MeshStandardMaterial({ color: '#2f1a10', roughness: 0.55 });
const vaseBodyMat      = new THREE.MeshStandardMaterial({ color: '#8d6e63', roughness: 0.5 });
const vaseMouthMat     = new THREE.MeshStandardMaterial({ color: '#a1887f', roughness: 0.55 });
const flowerStemMat    = new THREE.MeshStandardMaterial({ color: '#2f5d3a', roughness: 0.7 });
const flowerBudRedMat  = new THREE.MeshStandardMaterial({ color: '#ef4444', roughness: 0.6 });
const flowerBudPinkMat = new THREE.MeshStandardMaterial({ color: '#f8b4c4', roughness: 0.6 });

const VelvetRopeBarrier: React.FC<{
  side: 'left' | 'right';
  zPoints: number[];
  xOffset?: number;
  zOffset?: number;
  onClick?: () => void;
}> = ({ side, zPoints, xOffset = 0, zOffset = 0, onClick }) => {
  const x = (side === 'left' ? -10.55 : 10.55) + xOffset;
  const adjustedZPoints = zPoints.map(z => z + zOffset);

  return (
    <group onClick={(e) => { e.stopPropagation(); onClick?.(); }}>
      {adjustedZPoints.map((z) => (
        <group key={`${side}-post-${z}`} position={[x, 0, z]}>
          <mesh geometry={postCylinderGeom} material={postMat} position={[0, 0.48, 0]} />
          <mesh geometry={postSphereGeom} material={metalMat} position={[0, 0.98, 0]} />
          <mesh geometry={postBaseGeom} material={postMat} position={[0, 0.06, 0]} />
        </group>
      ))}

      {adjustedZPoints.slice(0, -1).map((z, index) => {
        const nextZ = adjustedZPoints[index + 1];
        const midZ = (z + nextZ) / 2;
        const length = Math.abs(nextZ - z);

        return (
          <group key={`${side}-rope-${z}-${nextZ}`}>
            <mesh 
              geometry={ropeMainGeom} 
              material={ropeMat} 
              position={[x, 0.94, midZ]} 
              rotation={[Math.PI / 2, 0, 0]} 
              scale={[1, length, 1]} 
            />
            {/* Dây phụ thấp hơn tạo cảm giác dây nhung có độ dày */}
            <mesh 
              geometry={ropeThinGeom} 
              material={ropeThinMat} 
              position={[x, 0.82, midZ]} 
              rotation={[Math.PI / 2, 0, 0]} 
              scale={[1, length * 0.96, 1]} 
            />
          </group>
        );
      })}
    </group>
  );
};

type RoomOneProps = BaseRoomProps & {
  ropeBarriersConfig?: string;
};

export const RoomOne: React.FC<RoomOneProps> = ({ 
  galleryId, 
  customSettings, 
  isVisible = true,
  onRopeClick,
  ropeBarriersConfig
}) => {
  const { activeGallery } = useMuseum();

  // Parse config riêng từng dây từ customSettings hoặc DB
  // Thứ tự: [0]=trái-18, [1]=trái-8, [2]=trái+2, [3]=phải-18, [4]=phải-8, [5]=phải+2
  const DEFAULT_ROPE = { xOffset: 0, zOffset: 0 };
  let ropeConfigs: Array<{ xOffset: number; zOffset: number }> = Array(6).fill(DEFAULT_ROPE);
  try {
    const raw = ropeBarriersConfig ?? (customSettings as any)?.rope_barriers_config ?? activeGallery?.rope_barriers_config;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length === 6) ropeConfigs = parsed;
    }
  } catch { /* dùng mặc định */ }

  const roomHeight = customSettings?.room_height ?? activeGallery?.room_height ?? 6;
  const wallColor = customSettings?.wall_color ?? activeGallery?.wall_color ?? '#8a1923';
  const wainscotingColor = customSettings?.wainscoting_color ?? activeGallery?.wainscoting_color ?? '#eae5dc';

  const overriddenSettings = {
    room_width: customSettings?.room_width ?? activeGallery?.room_width ?? 24,
    room_length: customSettings?.room_length ?? activeGallery?.room_length ?? 46,
    room_height: roomHeight,
    floor_color: customSettings?.floor_color ?? '#3d2516', // Sàn gỗ tối mộc mạc
    wall_color: wallColor,
    wainscoting_color: wainscotingColor,
    floor_type: (customSettings?.floor_type ?? 'wood') as 'wood' | 'marble' | 'carpet',
  };

  return (
    <BaseRoom galleryId={galleryId} customSettings={overriddenSettings} isVisible={isVisible}>
      {/* 3. GHẾ GỖ DÀI CHO KHÁCH NGHỈ (Z = -12.0 & Z = 12.0) */}
      {[-12.0, 12.0].map((z) => (
        <group key={z} position={[0, 0, z]}>
          <mesh geometry={benchBoxGeom} material={benchMat} position={[0, 0.45, 0]} />
          {[-1.4, 1.4].map((x, i) => (
            <mesh key={i} geometry={benchLegGeom} material={benchLegMat} position={[x, 0.2, 0]} />
          ))}
        </group>
      ))}

      {/* 4. CỤM GHẾ NGỒI GIỮA PHÒNG (phân bố đều tại Z = -4.0, Z = 4.0) */}
      {[-4.0, 4.0].map((z, index) => (
        <group key={`central-bench-${z}`} position={[0, 0, z]} rotation={[0, index % 2 === 0 ? 0 : Math.PI, 0]}>
          <mesh geometry={centralBenchTopGeom} material={centralBenchTopMat} position={[0, 0.52, 0]} />
          <mesh geometry={centralBenchBackGeom} material={centralBenchBackMat} position={[0, 0.9, -0.36]} rotation={[0.08, 0, 0]} />
          {[-1.65, 1.65].map((x) => (
            <group key={x}>
              <mesh geometry={centralBenchLegGeom} material={centralBenchLegMat} position={[x, 0.25, -0.26]} />
              <mesh geometry={centralBenchLegGeom} material={centralBenchLegMat} position={[x, 0.25, 0.26]} />
            </group>
          ))}
        </group>
      ))}

      {/* 5. BÀN TRANG TRÍ GỌN VỚI LỌ HOA (mỗi bên 3 bàn phân bố đều tại Z = -16.0, Z = 0.0, Z = 16.0) */}
      {[
        { x: -7.2, z: -16.0 },
        { x: -7.2, z: 0.0 },
        { x: -7.2, z: 16.0 },
        { x: 7.2, z: -16.0 },
        { x: 7.2, z: 0.0 },
        { x: 7.2, z: 16.0 },
      ].map((item, index) => (
        <group key={`decor-table-${index}`} position={[item.x, 0, item.z]}>
          <mesh geometry={tableTopGeom} material={tableTopMat} position={[0, 0.64, 0]} />
          <mesh geometry={tableLegGeom} material={tableLegMat} position={[0, 0.32, 0]} />
          <mesh geometry={tableBaseGeom} material={tableLegMat} position={[0, 0.05, 0]} />
 
          <mesh geometry={vaseBodyGeom} material={vaseBodyMat} position={[0, 0.82, 0]} />
          <mesh geometry={vaseMouthGeom} material={vaseMouthMat} position={[0, 0.98, 0]} />
          {[-0.09, 0.09].map((x, flowerIndex) => (
            <group key={flowerIndex} position={[x, 1.05, 0]} rotation={[0, 0, x * 2.4]}>
              <mesh geometry={flowerStemGeom} material={flowerStemMat} position={[0, 0.09, 0]} />
              <mesh geometry={flowerBudGeom} material={flowerIndex === 0 ? flowerBudRedMat : flowerBudPinkMat} position={[0, 0.25, 0]} />
            </group>
          ))}
        </group>
      ))}

      {/* 6. HÀNG RÀO DÂY NHUNG ĐỎ TRƯỚC DÃY TRANH - từng dây có offset riêng */}
      <VelvetRopeBarrier side="left" zPoints={[-19, -13]} xOffset={ropeConfigs[0].xOffset} zOffset={ropeConfigs[0].zOffset} onClick={() => onRopeClick?.(0)} />
      <VelvetRopeBarrier side="left" zPoints={[-3, 3]} xOffset={ropeConfigs[1].xOffset} zOffset={ropeConfigs[1].zOffset} onClick={() => onRopeClick?.(1)} />
      <VelvetRopeBarrier side="left" zPoints={[13, 19]} xOffset={ropeConfigs[2].xOffset} zOffset={ropeConfigs[2].zOffset} onClick={() => onRopeClick?.(2)} />
      <VelvetRopeBarrier side="right" zPoints={[-19, -13]} xOffset={-ropeConfigs[3].xOffset} zOffset={ropeConfigs[3].zOffset} onClick={() => onRopeClick?.(3)} />
      <VelvetRopeBarrier side="right" zPoints={[-3, 3]} xOffset={-ropeConfigs[4].xOffset} zOffset={ropeConfigs[4].zOffset} onClick={() => onRopeClick?.(4)} />
      <VelvetRopeBarrier side="right" zPoints={[13, 19]} xOffset={-ropeConfigs[5].xOffset} zOffset={ropeConfigs[5].zOffset} onClick={() => onRopeClick?.(5)} />
    </BaseRoom>
  );
};

export default RoomOne;
