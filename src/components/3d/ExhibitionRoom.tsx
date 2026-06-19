import React from 'react';
import * as THREE from 'three';
import { useMuseum } from '@/context/MuseumContext';

interface ExhibitionRoomProps {
  galleryId: string;
  customSettings?: {
    room_width: number;
    room_length: number;
    room_height: number;
    floor_color: string;
    wall_color: string;
    wainscoting_color: string;
    floor_type: 'wood' | 'marble' | 'carpet';
  };
}

export const ExhibitionRoom: React.FC<ExhibitionRoomProps> = ({ galleryId, customSettings }) => {
  const isSculptures = galleryId === 'gallery-sculptures';
  const { activeGallery } = useMuseum();

  // Đọc cấu hình động hoặc fallback về mặc định
  const roomWidth = customSettings?.room_width ?? activeGallery?.room_width ?? 12;
  const roomLength = customSettings?.room_length ?? activeGallery?.room_length ?? 30;
  const roomHeight = customSettings?.room_height ?? activeGallery?.room_height ?? 6;
  const floorColor = customSettings?.floor_color ?? activeGallery?.floor_color ?? '#4e3629';
  const wallColor = customSettings?.wall_color ?? activeGallery?.wall_color ?? '#8a1923';
  const wainscotingColor = customSettings?.wainscoting_color ?? activeGallery?.wainscoting_color ?? '#eae5dc';
  const floorType = customSettings?.floor_type ?? activeGallery?.floor_type ?? 'wood';

  // Tính toán kích thước trần vòm và giếng trời
  const skylightWidth = Math.min(roomWidth * 0.4, 5);
  const sideWidth = (roomWidth - skylightWidth) / 2;
  const panelWidth = sideWidth / Math.cos(Math.PI / 12);
  const leftPanelX = -(skylightWidth / 2 + sideWidth / 2);
  const rightPanelX = skylightWidth / 2 + sideWidth / 2;
  const panelHeightY = roomHeight - 0.6;

  // Tính toán chiều rộng vách ngăn (ở phòng tranh)
  const partitionWidth = Math.min(roomWidth * 0.5, 8);

  return (
    <group>
      {/* 1. SÀN NHÀ & THẢM TRẢI SÀN (Floor & Center Carpet) */}
      {/* Sàn gỗ/đá/thảm dựa trên cấu hình */}
      {floorType === 'wood' && (
        <>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
            <planeGeometry args={[roomWidth, roomLength]} />
            <meshStandardMaterial 
              color={floorColor} 
              roughness={0.4}
              metalness={0.1}
            />
          </mesh>
          <gridHelper args={[roomLength, Math.round(roomLength), '#312017', '#251811']} position={[0, 0.005, 0]} />
        </>
      )}

      {floorType === 'marble' && (
        <>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
            <planeGeometry args={[roomWidth, roomLength]} />
            <meshStandardMaterial 
              color={floorColor} 
              roughness={0.15}
              metalness={0.25}
            />
          </mesh>
          <gridHelper args={[roomLength, Math.round(roomLength / 2), '#cbd5e1', '#94a3b8']} position={[0, 0.005, 0]} />
        </>
      )}

      {floorType === 'carpet' && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[roomWidth, roomLength]} />
          <meshStandardMaterial 
            color={floorColor} 
            roughness={0.95}
            metalness={0.0}
          />
        </mesh>
      )}

      {/* Tấm thảm dài màu xám-be cổ điển ở trục chính hành lang (chỉ hiển thị nếu sàn chính không phải thảm) */}
      {floorType !== 'carpet' && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
          <planeGeometry args={[Math.min(roomWidth / 2, 6), roomLength]} />
          <meshStandardMaterial 
            color="#a29587" 
            roughness={0.95}
            metalness={0.0}
          />
        </mesh>
      )}

      {/* 2. TRẦN NHÀ HÌNH VÒM & GIẾNG TRỜI (Vaulted Ceiling & Glass Skylight) */}
      {/* Tấm trần vòm nghiêng bên trái */}
      <mesh position={[leftPanelX, panelHeightY, 0]} rotation={[0, 0, -Math.PI / 12]} castShadow receiveShadow>
        <boxGeometry args={[panelWidth, 0.1, roomLength]} />
        <meshStandardMaterial 
          color="#eae5dc" 
          roughness={0.8}
        />
      </mesh>

      {/* Tấm trần vòm nghiêng bên phải */}
      <mesh position={[rightPanelX, panelHeightY, 0]} rotation={[0, 0, Math.PI / 12]} castShadow receiveShadow>
        <boxGeometry args={[panelWidth, 0.1, roomLength]} />
        <meshStandardMaterial 
          color="#eae5dc"
          roughness={0.8}
        />
      </mesh>

      {/* Trần giếng trời kính (Skylight) ở chính giữa trục dọc hành lang */}
      <mesh position={[0, roomHeight - 0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[skylightWidth, roomLength]} />
        <meshStandardMaterial 
          color="#bae6fd" 
          emissive="#bae6fd"
          emissiveIntensity={1.5} 
          transparent
          opacity={0.8}
          roughness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Khung sắt giếng trời cổ điển chạy dọc */}
      {Array.from({ length: 11 }).map((_, i) => (
        <mesh key={`skylight-grid-${i}`} position={[0, roomHeight - 0.19, -roomLength / 2 + i * (roomLength / 10)]} castShadow>
          <boxGeometry args={[skylightWidth, 0.05, 0.05]} />
          <meshStandardMaterial color="#1e293b" roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[0, roomHeight - 0.19, 0]}>
        <boxGeometry args={[0.05, 0.05, roomLength]} />
        <meshStandardMaterial color="#1e293b" roughness={0.9} />
      </mesh>
      <mesh position={[-skylightWidth / 2, roomHeight - 0.19, 0]}>
        <boxGeometry args={[0.05, 0.05, roomLength]} />
        <meshStandardMaterial color="#1e293b" roughness={0.9} />
      </mesh>
      <mesh position={[skylightWidth / 2, roomHeight - 0.19, 0]}>
        <boxGeometry args={[0.05, 0.05, roomLength]} />
        <meshStandardMaterial color="#1e293b" roughness={0.9} />
      </mesh>


      {/* 3. BỨC TƯỜNG & PHÀO CHÂN TƯỜNG (Dynamic Walls & Wainscoting) */}
      {/* Tường trái */}
      <mesh position={[-roomWidth / 2, roomHeight / 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[roomLength, roomHeight, 0.2]} />
        <meshStandardMaterial 
          color={wallColor} 
          roughness={0.7}
        />
      </mesh>

      {/* Tường phải */}
      <mesh position={[roomWidth / 2, roomHeight / 2, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[roomLength, roomHeight, 0.2]} />
        <meshStandardMaterial 
          color={wallColor}
          roughness={0.7}
        />
      </mesh>

      {/* Tường sau */}
      <mesh position={[0, roomHeight / 2, roomLength / 2]} receiveShadow>
        <boxGeometry args={[roomWidth, roomHeight, 0.2]} />
        <meshStandardMaterial 
          color={wallColor}
          roughness={0.7}
        />
      </mesh>

      {/* Tường trước */}
      <mesh position={[0, roomHeight / 2, -roomLength / 2]} receiveShadow>
        <boxGeometry args={[roomWidth, roomHeight, 0.2]} />
        <meshStandardMaterial 
          color={wallColor}
          roughness={0.7}
        />
      </mesh>

      {/* Ốp gỗ chân tường (Wainscoting) màu kem sáng cao 1.2m */}
      {/* Wainscoting tường trái */}
      <mesh position={[-roomWidth / 2 + 0.112, 0.6, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[roomLength, 1.2, 0.02]} />
        <meshStandardMaterial color={wainscotingColor} roughness={0.5} />
      </mesh>
      <mesh position={[-roomWidth / 2 + 0.124, 1.2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[roomLength, 0.06, 0.04]} />
        <meshStandardMaterial color={wainscotingColor} roughness={0.4} />
      </mesh>

      {/* Wainscoting tường phải */}
      <mesh position={[roomWidth / 2 - 0.112, 0.6, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[roomLength, 1.2, 0.02]} />
        <meshStandardMaterial color={wainscotingColor} roughness={0.5} />
      </mesh>
      <mesh position={[roomWidth / 2 - 0.124, 1.2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <boxGeometry args={[roomLength, 0.06, 0.04]} />
        <meshStandardMaterial color={wainscotingColor} roughness={0.4} />
      </mesh>

      {/* Wainscoting tường trước */}
      <mesh position={[0, 0.6, -roomLength / 2 + 0.112]} receiveShadow>
        <boxGeometry args={[roomWidth - 0.224, 1.2, 0.02]} />
        <meshStandardMaterial color={wainscotingColor} roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.2, -roomLength / 2 + 0.124]}>
        <boxGeometry args={[roomWidth - 0.248, 0.06, 0.04]} />
        <meshStandardMaterial color={wainscotingColor} roughness={0.4} />
      </mesh>

      {/* Wainscoting tường sau */}
      <mesh position={[0, 0.6, roomLength / 2 - 0.112]} receiveShadow>
        <boxGeometry args={[roomWidth - 0.224, 1.2, 0.02]} />
        <meshStandardMaterial color={wainscotingColor} roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.2, roomLength / 2 - 0.124]}>
        <boxGeometry args={[roomWidth - 0.248, 0.06, 0.04]} />
        <meshStandardMaterial color={wainscotingColor} roughness={0.4} />
      </mesh>

      {/* Các cột trang trí ốp tường (Pilasters) giả lập thạch cao trắng kem dọc hai bên */}
      {Array.from({ length: 6 }).map((_, idx) => {
        const zPos = -roomLength / 2 + 2.5 + idx * ((roomLength - 5) / 5);
        // Bỏ qua cột ở vị trí vách ngăn hành lang (Z = -3, Z = 3) hoặc vách ngăn phụ (Z = 13) để tránh va chạm hình ảnh
        if (Math.abs(zPos - 3) < 2 || Math.abs(zPos + 3) < 2 || Math.abs(zPos - 13) < 2) return null;

        return (
          <group key={`pilasters-${idx}`}>
            {/* Cột trái */}
            <mesh position={[-roomWidth / 2 + 0.13, roomHeight / 2, zPos]} castShadow receiveShadow>
              <boxGeometry args={[0.1, roomHeight, 0.4]} />
              <meshStandardMaterial color={wainscotingColor} roughness={0.8} />
            </mesh>
            {/* Cột phải */}
            <mesh position={[roomWidth / 2 - 0.13, roomHeight / 2, zPos]} castShadow receiveShadow>
              <boxGeometry args={[0.1, roomHeight, 0.4]} />
              <meshStandardMaterial color={wainscotingColor} roughness={0.8} />
            </mesh>
          </group>
        );
      })}

      {/* 4. HÀNH LANG RẼ CHỮ S: TƯỜNG NGĂN Z = 3 (Paintings Room Side) */}
      <group>
        {/* Mảnh tường trái (rộng 7m, từ X = -12 đến X = -5) */}
        <mesh position={[-8.5, roomHeight / 2, 3.0]} castShadow receiveShadow>
          <boxGeometry args={[7.0, roomHeight, 0.4]} />
          <meshStandardMaterial color={wallColor} roughness={0.7} />
        </mesh>
        <mesh position={[-12.0 + 0.05, roomHeight / 2, 3.0]} castShadow receiveShadow>
          <boxGeometry args={[0.1, roomHeight, 0.48]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.8} />
        </mesh>
        <mesh position={[-5.0 - 0.05, roomHeight / 2, 3.0]} castShadow receiveShadow>
          <boxGeometry args={[0.1, roomHeight, 0.48]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.8} />
        </mesh>
        {/* Wainscoting tường ngăn trái */}
        <mesh position={[-8.5, 0.6, 3.0 - 0.212]} receiveShadow>
          <boxGeometry args={[7.0, 1.2, 0.02]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.5} />
        </mesh>
        <mesh position={[-8.5, 1.2, 3.0 - 0.224]}>
          <boxGeometry args={[7.0, 0.06, 0.04]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.4} />
        </mesh>
        <mesh position={[-8.5, 0.6, 3.0 + 0.212]} receiveShadow>
          <boxGeometry args={[7.0, 1.2, 0.02]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.5} />
        </mesh>
        <mesh position={[-8.5, 1.2, 3.0 + 0.224]}>
          <boxGeometry args={[7.0, 0.06, 0.04]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.4} />
        </mesh>

        {/* Mảnh tường phải (rộng 14m, từ X = -2 đến X = 12) */}
        <mesh position={[5.0, roomHeight / 2, 3.0]} castShadow receiveShadow>
          <boxGeometry args={[14.0, roomHeight, 0.4]} />
          <meshStandardMaterial color={wallColor} roughness={0.7} />
        </mesh>
        <mesh position={[-2.0 + 0.05, roomHeight / 2, 3.0]} castShadow receiveShadow>
          <boxGeometry args={[0.1, roomHeight, 0.48]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.8} />
        </mesh>
        <mesh position={[12.0 - 0.05, roomHeight / 2, 3.0]} castShadow receiveShadow>
          <boxGeometry args={[0.1, roomHeight, 0.48]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.8} />
        </mesh>
        {/* Wainscoting tường ngăn phải */}
        <mesh position={[5.0, 0.6, 3.0 - 0.212]} receiveShadow>
          <boxGeometry args={[14.0, 1.2, 0.02]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.5} />
        </mesh>
        <mesh position={[5.0, 1.2, 3.0 - 0.224]}>
          <boxGeometry args={[14.0, 0.06, 0.04]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.4} />
        </mesh>
        <mesh position={[5.0, 0.6, 3.0 + 0.212]} receiveShadow>
          <boxGeometry args={[14.0, 1.2, 0.02]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.5} />
        </mesh>
        <mesh position={[5.0, 1.2, 3.0 + 0.224]}>
          <boxGeometry args={[14.0, 0.06, 0.04]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.4} />
        </mesh>

        {/* Mảnh tường phía trên cổng (từ X = -5.0 đến X = -2.0) */}
        <mesh position={[-3.5, (roomHeight + 3.5) / 2, 3.0]} castShadow receiveShadow>
          <boxGeometry args={[3.0, roomHeight - 3.5, 0.4]} />
          <meshStandardMaterial color={wallColor} roughness={0.7} />
        </mesh>
      </group>

      {/* 4.5. HÀNH LANG RẼ CHỮ S: TƯỜNG NGĂN Z = -3 (Sculptures Room Side) */}
      <group>
        {/* Mảnh tường trái (rộng 14m, từ X = -12 đến X = 2) */}
        <mesh position={[-5.0, roomHeight / 2, -3.0]} castShadow receiveShadow>
          <boxGeometry args={[14.0, roomHeight, 0.4]} />
          <meshStandardMaterial color={wallColor} roughness={0.7} />
        </mesh>
        <mesh position={[-12.0 + 0.05, roomHeight / 2, -3.0]} castShadow receiveShadow>
          <boxGeometry args={[0.1, roomHeight, 0.48]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.8} />
        </mesh>
        <mesh position={[2.0 - 0.05, roomHeight / 2, -3.0]} castShadow receiveShadow>
          <boxGeometry args={[0.1, roomHeight, 0.48]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.8} />
        </mesh>
        {/* Wainscoting tường ngăn trái */}
        <mesh position={[-5.0, 0.6, -3.0 - 0.212]} receiveShadow>
          <boxGeometry args={[14.0, 1.2, 0.02]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.5} />
        </mesh>
        <mesh position={[-5.0, 1.2, -3.0 - 0.224]}>
          <boxGeometry args={[14.0, 0.06, 0.04]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.4} />
        </mesh>
        <mesh position={[-5.0, 0.6, -3.0 + 0.212]} receiveShadow>
          <boxGeometry args={[14.0, 1.2, 0.02]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.5} />
        </mesh>
        <mesh position={[-5.0, 1.2, -3.0 + 0.224]}>
          <boxGeometry args={[14.0, 0.06, 0.04]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.4} />
        </mesh>

        {/* Mảnh tường phải (rộng 7m, từ X = 5 đến X = 12) */}
        <mesh position={[8.5, roomHeight / 2, -3.0]} castShadow receiveShadow>
          <boxGeometry args={[7.0, roomHeight, 0.4]} />
          <meshStandardMaterial color={wallColor} roughness={0.7} />
        </mesh>
        <mesh position={[5.0 + 0.05, roomHeight / 2, -3.0]} castShadow receiveShadow>
          <boxGeometry args={[0.1, roomHeight, 0.48]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.8} />
        </mesh>
        <mesh position={[12.0 - 0.05, roomHeight / 2, -3.0]} castShadow receiveShadow>
          <boxGeometry args={[0.1, roomHeight, 0.48]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.8} />
        </mesh>
        {/* Wainscoting tường ngăn phải */}
        <mesh position={[8.5, 0.6, -3.0 - 0.212]} receiveShadow>
          <boxGeometry args={[7.0, 1.2, 0.02]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.5} />
        </mesh>
        <mesh position={[8.5, 1.2, -3.0 - 0.224]}>
          <boxGeometry args={[7.0, 0.06, 0.04]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.4} />
        </mesh>
        <mesh position={[8.5, 0.6, -3.0 + 0.212]} receiveShadow>
          <boxGeometry args={[7.0, 1.2, 0.02]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.5} />
        </mesh>
        <mesh position={[8.5, 1.2, -3.0 + 0.224]}>
          <boxGeometry args={[7.0, 0.06, 0.04]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.4} />
        </mesh>

        {/* Mảnh tường phía trên cổng (từ X = 2.0 đến X = 5.0) */}
        <mesh position={[3.5, (roomHeight + 3.5) / 2, -3.0]} castShadow receiveShadow>
          <boxGeometry args={[3.0, roomHeight - 3.5, 0.4]} />
          <meshStandardMaterial color={wallColor} roughness={0.7} />
        </mesh>
      </group>

      {/* 5. KHU VỰC PHÒNG TRANH (Paintings Room - Z > 3) */}
      <group>
        {/* Vách ngăn trung tâm khu vực tranh tại Z = 13.0 (rộng 12m) */}
        <mesh position={[0, 2.0, 13.0]} castShadow receiveShadow>
          <boxGeometry args={[12.0, 4.0, 0.4]} />
          <meshStandardMaterial color={wallColor} roughness={0.7} />
        </mesh>

        {/* Cột trang trí ở rìa vách ngăn trung tâm */}
        <mesh position={[-6.0, 2.0, 13.0]} castShadow receiveShadow>
          <boxGeometry args={[0.1, 4.0, 0.48]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.8} />
        </mesh>
        <mesh position={[6.0, 2.0, 13.0]} castShadow receiveShadow>
          <boxGeometry args={[0.1, 4.0, 0.48]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.8} />
        </mesh>

        {/* Ốp chân tường wainscoting cho vách ngăn */}
        <mesh position={[0, 0.6, 13.0 - 0.212]} receiveShadow>
          <boxGeometry args={[12.0, 1.2, 0.02]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.5} />
        </mesh>
        <mesh position={[0, 1.2, 13.0 - 0.224]}>
          <boxGeometry args={[12.0, 0.06, 0.04]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.6, 13.0 + 0.212]} receiveShadow>
          <boxGeometry args={[12.0, 1.2, 0.02]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.5} />
        </mesh>
        <mesh position={[0, 1.2, 13.0 + 0.224]}>
          <boxGeometry args={[12.0, 0.06, 0.04]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.4} />
        </mesh>

        {/* Bàn Console gỗ cổ điển bên dưới vách ngăn */}
        <group position={[0, 0, 13.0 - 0.45]}>
          <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
            <boxGeometry args={[2.0, 0.1, 0.5]} />
            <meshStandardMaterial color="#3e2723" roughness={0.2} />
          </mesh>
          <mesh position={[-0.8, 0.35, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.08, 0.7, 8]} />
            <meshStandardMaterial color="#2d1d19" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.35, 0.15]} castShadow>
            <cylinderGeometry args={[0.04, 0.04, 0.7, 8]} />
            <meshStandardMaterial color="#2d1d19" roughness={0.4} />
          </mesh>
          <mesh position={[0.8, 0.35, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.08, 0.7, 8]} />
            <meshStandardMaterial color="#2d1d19" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.9, 0]} castShadow>
            <torusKnotGeometry args={[0.1, 0.03, 64, 8]} />
            <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.1} />
          </mesh>
        </group>
        <group position={[0, 0, 13.0 + 0.45]}>
          <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
            <boxGeometry args={[2.0, 0.1, 0.5]} />
            <meshStandardMaterial color="#3e2723" roughness={0.2} />
          </mesh>
          <mesh position={[-0.8, 0.35, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.08, 0.7, 8]} />
            <meshStandardMaterial color="#2d1d19" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.35, -0.15]} castShadow>
            <cylinderGeometry args={[0.04, 0.04, 0.7, 8]} />
            <meshStandardMaterial color="#2d1d19" roughness={0.4} />
          </mesh>
          <mesh position={[0.8, 0.35, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.08, 0.7, 8]} />
            <meshStandardMaterial color="#2d1d19" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.9, 0]} castShadow>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.1} />
          </mesh>
        </group>

        {/* Ghế băng dài cổ điển trong Phòng Tranh */}
        {[8.0, 18.0].map((zPos, idx) => (
          <group key={`bench-${idx}`} position={[0, 0, zPos]}>
            <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
              <boxGeometry args={[4.0, 0.15, 1.2]} />
              <meshStandardMaterial color="#4e2c1e" roughness={0.5} />
            </mesh>
            <mesh position={[0, 0.32, 0]} castShadow receiveShadow>
              <boxGeometry args={[4.1, 0.1, 1.3]} />
              <meshStandardMaterial color="#27150c" roughness={0.3} />
            </mesh>
            <mesh position={[-1.7, 0.15, 0]} castShadow>
              <boxGeometry args={[0.2, 0.3, 1.1]} />
              <meshStandardMaterial color="#1b110b" roughness={0.4} />
            </mesh>
            <mesh position={[1.7, 0.15, 0]} castShadow>
              <boxGeometry args={[0.2, 0.3, 1.1]} />
              <meshStandardMaterial color="#1b110b" roughness={0.4} />
            </mesh>
          </group>
        ))}
      </group>

      {/* 6. KHU VỰC PHÒNG ĐIÊU KHẮC (Sculptures Room - Z < -3) */}
      <group>
        {/* Các bệ đỡ tượng */}
        {[-8.0, -14.0, -20.0].map((zPos, idx) => (
          <group key={`pedestal-${idx}`} position={[0, 0, zPos]}>
            <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
              <boxGeometry args={[1.0, 1.0, 1.0]} />
              <meshStandardMaterial 
                color="#26262b" 
                roughness={0.2}
                metalness={0.15}
              />
            </mesh>
            <mesh position={[0, 0.05, 0]} castShadow>
              <boxGeometry args={[1.05, 0.1, 1.05]} />
              <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.1} />
            </mesh>
            <mesh position={[0, 0.95, 0]} castShadow>
              <boxGeometry args={[1.05, 0.08, 1.05]} />
              <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.1} />
            </mesh>
          </group>
        ))}
      </group>

      {/* 6. HỆ THỐNG ĐÈN CHÙM / ĐÈN RỌI HÀNH LANG (Hallway Lighting Systems) */}
      {[-roomLength * 0.4, -roomLength * 0.2, 0, roomLength * 0.2, roomLength * 0.4].map((zPos, idx) => (
        <group key={`hall-light-${idx}`} position={[0, roomHeight - 1.0, zPos]}>
          <mesh>
            <cylinderGeometry args={[0.15, 0.15, 0.1, 12]} />
            <meshStandardMaterial color="#334155" metalness={0.8} />
          </mesh>
          <mesh position={[0, -0.06, 0]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshBasicMaterial color="#fff" />
          </mesh>
          <pointLight 
            intensity={4.5} 
            distance={roomLength * 0.6} 
            color="#fff1e0" 
            castShadow
            shadow-mapSize-width={512}
            shadow-mapSize-height={512}
          />
        </group>
      ))}
    </group>
  );
};
