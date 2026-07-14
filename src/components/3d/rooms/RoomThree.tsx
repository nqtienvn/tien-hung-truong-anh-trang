import React from 'react';
import { useMuseum } from '@/context/MuseumContext';
import { BaseRoom, BaseRoomProps } from './BaseRoom';

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
          <mesh>
            <cylinderGeometry args={[0.03, 0.03, 0.06, 8]} />
            <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh position={[0.12, -0.08, 0]} rotation={[0, 0, Math.PI / 4]}>
            <cylinderGeometry args={[0.015, 0.015, 0.25, 8]} />
            <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0.21, -0.18, 0]}>
            <sphereGeometry args={[0.025, 12, 12]} />
            <meshBasicMaterial color="#fff8e7" />
          </mesh>
        </group>
      ))}

      {/* Móc tường phải */}
      {sideZPositions.map((zPos, idx) => (
        <group key={`hook-right-${idx}`} position={[halfW - 0.06, roomHeight - 0.62, zPos]}>
          <mesh>
            <cylinderGeometry args={[0.03, 0.03, 0.06, 8]} />
            <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh position={[-0.12, -0.08, 0]} rotation={[0, 0, -Math.PI / 4]}>
            <cylinderGeometry args={[0.015, 0.015, 0.25, 8]} />
            <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[-0.21, -0.18, 0]}>
            <sphereGeometry args={[0.025, 12, 12]} />
            <meshBasicMaterial color="#fff8e7" />
          </mesh>
        </group>
      ))}

      {/* Móc tường cửa vào */}
      {doorXPositions.map((xPos, idx) => (
        <group key={`hook-door-${idx}`} position={[xPos, roomHeight - 0.62, -halfL + 0.06]}>
          <mesh>
            <cylinderGeometry args={[0.03, 0.03, 0.06, 8]} />
            <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh position={[0, -0.08, 0.12]} rotation={[Math.PI / 4, 0, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.25, 8]} />
            <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0, -0.18, 0.21]}>
            <sphereGeometry args={[0.025, 12, 12]} />
            <meshBasicMaterial color="#fff8e7" />
          </mesh>
        </group>
      ))}

      {/* Móc tường cuối sau */}
      {doorXPositions.map((xPos, idx) => (
        <group key={`hook-back-${idx}`} position={[xPos, roomHeight - 0.62, halfL - 0.06]}>
          <mesh>
            <cylinderGeometry args={[0.03, 0.03, 0.06, 8]} />
            <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh position={[0, -0.08, -0.12]} rotation={[-Math.PI / 4, 0, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.25, 8]} />
            <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0, -0.18, -0.21]}>
            <sphereGeometry args={[0.025, 12, 12]} />
            <meshBasicMaterial color="#fff8e7" />
          </mesh>
        </group>
      ))}

    </BaseRoom>
  );
};

export default RoomThree;
