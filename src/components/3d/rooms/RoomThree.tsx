import React from 'react';
import * as THREE from 'three';
import { useMuseum } from '@/context/MuseumContext';
import { BaseRoom, BaseRoomProps } from './BaseRoom';
import { VideoPillar } from '../VideoPillar';
import { RoomThreeQuestSet } from './RoomThreeQuestSet';

// Static Geometries for VelvetRopeBarrier (Cách B: Tái sử dụng hình khối để tránh giật lag GPU)
const postGeom = new THREE.CylinderGeometry(0.055, 0.07, 0.96, 18);
const sphereGeom = new THREE.SphereGeometry(0.13, 18, 18);
const baseGeom = new THREE.CylinderGeometry(0.22, 0.28, 0.08, 24);
const unitRopeGeom1 = new THREE.CylinderGeometry(1, 1, 1, 20);
const unitRopeGeom2 = new THREE.CylinderGeometry(1, 1, 1, 16);

// Static Materials for VelvetRopeBarrier
const postMat = new THREE.MeshStandardMaterial({ color: '#2a2119', roughness: 0.28, metalness: 0.65 });
const metalMat = new THREE.MeshStandardMaterial({ color: '#c59b45', roughness: 0.22, metalness: 0.85 });
const baseMat = new THREE.MeshStandardMaterial({ color: '#2a2119', roughness: 0.35, metalness: 0.55 });
const ropeMat = new THREE.MeshStandardMaterial({ color: '#9f1239', roughness: 0.55, metalness: 0.05 });
const subRopeMat = new THREE.MeshStandardMaterial({ color: '#7f1d1d', roughness: 0.62, metalness: 0.03 });

// Static Geometries for Spotlight Hooks
const hookBaseGeom = new THREE.CylinderGeometry(0.03, 0.03, 0.06, 8);
const hookArmGeom = new THREE.CylinderGeometry(0.015, 0.015, 0.25, 8);
const hookBulbGeom = new THREE.SphereGeometry(0.025, 12, 12);

// Static Materials for Spotlight Hooks
const hookBaseMat = new THREE.MeshStandardMaterial({ color: '#334155', metalness: 0.9, roughness: 0.1 });
const hookArmMat = new THREE.MeshStandardMaterial({ color: '#475569', metalness: 0.8, roughness: 0.2 });
const hookBulbMat = new THREE.MeshBasicMaterial({ color: '#fff8e7' });

const VelvetRopeBarrier: React.FC<{
  p1: [number, number]; // [x, z] for post 1
  p2: [number, number]; // [x, z] for post 2
}> = ({ p1, p2 }) => {
  // Calculate distance and rotation
  const dx = p2[0] - p1[0];
  const dz = p2[1] - p1[1];
  const length = Math.sqrt(dx * dx + dz * dz);
  const angle = Math.atan2(dx, dz); // Rotation around Y-axis relative to Z-axis

  const midX = (p1[0] + p2[0]) / 2;
  const midZ = (p1[1] + p2[1]) / 2;

  return (
    <group>
      {/* Post 1 */}
      <group position={[p1[0], 0, p1[1]]}>
        <mesh geometry={postGeom} material={postMat} position={[0, 0.48, 0]} />
        <mesh geometry={sphereGeom} material={metalMat} position={[0, 0.98, 0]} />
        <mesh geometry={baseGeom} material={baseMat} position={[0, 0.06, 0]} />
      </group>

      {/* Post 2 */}
      <group position={[p2[0], 0, p2[1]]}>
        <mesh geometry={postGeom} material={postMat} position={[0, 0.48, 0]} />
        <mesh geometry={sphereGeom} material={metalMat} position={[0, 0.98, 0]} />
        <mesh geometry={baseGeom} material={baseMat} position={[0, 0.06, 0]} />
      </group>

      {/* Ropes group at the midpoint, rotated to align with the vector from p1 to p2 */}
      <group position={[midX, 0.94, midZ]} rotation={[0, angle, 0]}>
        <mesh 
          geometry={unitRopeGeom1} 
          material={ropeMat} 
          scale={[0.045, length, 0.045]} 
          rotation={[Math.PI / 2, 0, 0]} 
        />
        {/* Dây phụ thấp hơn tạo cảm giác dây nhung có độ dày */}
        <mesh 
          geometry={unitRopeGeom2} 
          material={subRopeMat} 
          scale={[0.028, length * 0.96, 0.028]} 
          position={[0, -0.12, 0]} 
          rotation={[Math.PI / 2, 0, 0]} 
        />
      </group>
    </group>
  );
};

export const RoomThree: React.FC<BaseRoomProps> = ({
  galleryId,
  customSettings,
  isVisible = true,
}) => {
  const { activeGallery, settings } = useMuseum();

  const roomHeight = customSettings?.room_height ?? activeGallery?.room_height ?? 8;
  const roomWidth = customSettings?.room_width ?? activeGallery?.room_width ?? 30;
  const roomLength = customSettings?.room_length ?? activeGallery?.room_length ?? 30;
  const wainscotingColor = customSettings?.wainscoting_color ?? activeGallery?.wainscoting_color ?? '#c8b89a';

  // Vị trí treo tranh
  const sideZPositions = [-8.0, 0.0, 8.0]; // 3 tranh mỗi tường dọc
  const doorXPositions = [-8.0, 8.0];       // 2 tranh hai bên cửa

  // Offset tường tính từ tâm
  const halfW = roomWidth / 2;   // 15
  const halfL = roomLength / 2;   // 15
  const mountOffset = 0.12;       // cách mặt trong tường

  // Chiều cao đèn rọi
  const spotY = roomHeight - 1.0;
  const showSpotLights = !settings.reducedLights;

  return (
    <BaseRoom galleryId={galleryId} customSettings={customSettings} isVisible={isVisible} showPilasters={false}>

      <VideoPillar />
      <RoomThreeQuestSet isVisible={isVisible} />

      {/* ============================================================
          ĐÈN RỌI TRANH — TƯỜNG TRÁI (x = -halfW)
          3 spotlight rọi từ trần xuống mỗi vị trí tranh
      ============================================================ */}
      {showSpotLights && sideZPositions.map((zPos, idx) => (
        <spotLight
          key={`spot-left-${idx}`}
          position={[-halfW + 1.5, spotY, zPos]}
          target-position={[-halfW + mountOffset, 3.2, zPos]}
          intensity={isVisible ? 12 : 0}
          distance={6}
          angle={Math.PI / 8}
          penumbra={0.4}
          color="#fff8e7"
        />
      ))}

      {/* ============================================================
          ĐÈN RỌI TRANH — TƯỜNG PHẢI (x = +halfW)
      ============================================================ */}
      {showSpotLights && sideZPositions.map((zPos, idx) => (
        <spotLight
          key={`spot-right-${idx}`}
          position={[halfW - 1.5, spotY, zPos]}
          target-position={[halfW - mountOffset, 3.2, zPos]}
          intensity={isVisible ? 12 : 0}
          distance={6}
          angle={Math.PI / 8}
          penumbra={0.4}
          color="#fff8e7"
        />
      ))}

      {/* ============================================================
          ĐÈN RỌI TRANH — TƯỜNG CỬA VÀO (z = -halfL)
          2 spotlight cho 2 tranh hai bên cửa
      ============================================================ */}
      {showSpotLights && doorXPositions.map((xPos, idx) => (
        <spotLight
          key={`spot-door-${idx}`}
          position={[xPos, spotY, -halfL + 1.5]}
          target-position={[xPos, 3.2, -halfL + mountOffset]}
          intensity={isVisible ? 12 : 0}
          distance={6}
          angle={Math.PI / 8}
          penumbra={0.4}
          color="#fff8e7"
        />
      ))}

      {/* ============================================================
          ĐÈN RỌI TRANH — TƯỜNG CUỐI SAU (z = +halfL)
          2 spotlight cho 2 tranh hai bên cửa sau
      ============================================================ */}
      {showSpotLights && doorXPositions.map((xPos, idx) => (
        <spotLight
          key={`spot-back-${idx}`}
          position={[xPos, spotY, halfL - 1.5]}
          target-position={[xPos, 3.2, halfL - mountOffset]}
          intensity={isVisible ? 12 : 0}
          distance={6}
          angle={Math.PI / 8}
          penumbra={0.4}
          color="#fff8e7"
        />
      ))}

      {/* ============================================================
          THANH RÃO ĐÈN (Picture Rail) — dải ốp mỏng sát trần
          dọc 2 tường dọc và tường cửa vào, làm điểm tựa đèn rọi
      ============================================================ */}
      {/* Rail tường trái */}
      <mesh position={[-halfW + 0.06, roomHeight - 0.6, 0]}>
        <boxGeometry args={[0.04, 0.08, roomLength - 0.4]} />
        <meshStandardMaterial color={wainscotingColor} roughness={0.3} metalness={0.2} />
      </mesh>
      {/* Rail tường phải */}
      <mesh position={[halfW - 0.06, roomHeight - 0.6, 0]}>
        <boxGeometry args={[0.04, 0.08, roomLength - 0.4]} />
        <meshStandardMaterial color={wainscotingColor} roughness={0.3} metalness={0.2} />
      </mesh>
      {/* Rail tường cửa vào (trước) — trừ khoảng cửa ±2m */}
      <mesh position={[-halfW * 0.5 - 1, roomHeight - 0.6, -halfL + 0.06]}>
        <boxGeometry args={[halfW - 2, 0.08, 0.04]} />
        <meshStandardMaterial color={wainscotingColor} roughness={0.3} metalness={0.2} />
      </mesh>
      <mesh position={[halfW * 0.5 + 1, roomHeight - 0.6, -halfL + 0.06]}>
        <boxGeometry args={[halfW - 2, 0.08, 0.04]} />
        <meshStandardMaterial color={wainscotingColor} roughness={0.3} metalness={0.2} />
      </mesh>
      {/* Rail tường cuối sau — trừ khoảng cửa ±2m */}
      <mesh position={[-halfW * 0.5 - 1, roomHeight - 0.6, halfL - 0.06]}>
        <boxGeometry args={[halfW - 2, 0.08, 0.04]} />
        <meshStandardMaterial color={wainscotingColor} roughness={0.3} metalness={0.2} />
      </mesh>
      <mesh position={[halfW * 0.5 + 1, roomHeight - 0.6, halfL - 0.06]}>
        <boxGeometry args={[halfW - 2, 0.08, 0.04]} />
        <meshStandardMaterial color={wainscotingColor} roughness={0.3} metalness={0.2} />
      </mesh>

      {/* ============================================================
          MÓC ĐÈN RỌI — gắn sát thanh rào ở từng vị trí tranh
      ============================================================ */}
      {/* Móc tường trái */}
      {sideZPositions.map((zPos, idx) => (
        <group key={`hook-left-${idx}`} position={[-halfW + 0.06, roomHeight - 0.62, zPos]}>
          <mesh geometry={hookBaseGeom} material={hookBaseMat} />
          <mesh geometry={hookArmGeom} material={hookArmMat} position={[0.12, -0.08, 0]} rotation={[0, 0, Math.PI / 4]} />
          <mesh geometry={hookBulbGeom} material={hookBulbMat} position={[0.21, -0.18, 0]} />
        </group>
      ))}

      {/* Móc tường phải */}
      {sideZPositions.map((zPos, idx) => (
        <group key={`hook-right-${idx}`} position={[halfW - 0.06, roomHeight - 0.62, zPos]}>
          <mesh geometry={hookBaseGeom} material={hookBaseMat} />
          <mesh geometry={hookArmGeom} material={hookArmMat} position={[-0.12, -0.08, 0]} rotation={[0, 0, -Math.PI / 4]} />
          <mesh geometry={hookBulbGeom} material={hookBulbMat} position={[-0.21, -0.18, 0]} />
        </group>
      ))}

      {/* Móc tường cửa vào */}
      {doorXPositions.map((xPos, idx) => (
        <group key={`hook-door-${idx}`} position={[xPos, roomHeight - 0.62, -halfL + 0.06]}>
          <mesh geometry={hookBaseGeom} material={hookBaseMat} />
          <mesh geometry={hookArmGeom} material={hookArmMat} position={[0, -0.08, 0.12]} rotation={[Math.PI / 4, 0, 0]} />
          <mesh geometry={hookBulbGeom} material={hookBulbMat} position={[0, -0.18, 0.21]} />
        </group>
      ))}

      {/* Móc tường cuối sau */}
      {doorXPositions.map((xPos, idx) => (
        <group key={`hook-back-${idx}`} position={[xPos, roomHeight - 0.62, halfL - 0.06]}>
          <mesh geometry={hookBaseGeom} material={hookBaseMat} />
          <mesh geometry={hookArmGeom} material={hookArmMat} position={[0, -0.08, -0.12]} rotation={[-Math.PI / 4, 0, 0]} />
          <mesh geometry={hookBulbGeom} material={hookBulbMat} position={[0, -0.18, -0.21]} />
        </group>
      ))}

      {/* ============================================================
          HÀNG RÀO DÂY NHUNG ĐỎ TRƯỚC TRANH (Velvet Rope Barriers)
      ============================================================ */}
      {/* 1. Tường trái (x = -halfW + 1.8 = -13.2) */}
      {sideZPositions.map((zPos) => (
        <VelvetRopeBarrier
          key={`barrier-left-${zPos}`}
          p1={[-halfW + 1.8, zPos - 2.2]}
          p2={[-halfW + 1.8, zPos + 2.2]}
        />
      ))}

      {/* 2. Tường phải (x = halfW - 1.8 = 13.2) */}
      {sideZPositions.map((zPos) => (
        <VelvetRopeBarrier
          key={`barrier-right-${zPos}`}
          p1={[halfW - 1.8, zPos - 2.2]}
          p2={[halfW - 1.8, zPos + 2.2]}
        />
      ))}

      {/* 3. Tường cửa vào (z = -halfL + 1.8 = -13.2) */}
      {doorXPositions.map((xPos) => (
        <VelvetRopeBarrier
          key={`barrier-door-${xPos}`}
          p1={[xPos - 2.2, -halfL + 1.8]}
          p2={[xPos + 2.2, -halfL + 1.8]}
        />
      ))}

      {/* 4. Tường cuối sau (z = halfL - 1.8 = 13.2) */}
      {doorXPositions.map((xPos) => {
        // Giữ lối đi bên phải phía sau cho bàn làm việc lịch sử.
        if (xPos > 0) return null;
        return (
          <VelvetRopeBarrier
            key={`barrier-back-${xPos}`}
            p1={[xPos - 2.2, halfL - 1.8]}
            p2={[xPos + 2.2, halfL - 1.8]}
          />
        );
      })}

    </BaseRoom>
  );
};

export default RoomThree;
