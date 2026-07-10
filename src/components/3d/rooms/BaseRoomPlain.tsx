import React from 'react';
import * as THREE from 'three';
import { useMuseum } from '@/context/MuseumContext';

export interface BaseRoomProps {
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
  isVisible?: boolean;
  children?: React.ReactNode;
}

export const BaseRoomPlain: React.FC<BaseRoomProps> = ({ 
  galleryId, 
  customSettings, 
  isVisible = true,
  children 
}) => {
  const { activeGallery } = useMuseum();

  // Đọc cấu hình động hoặc fallback về mặc định
  const roomWidth = customSettings?.room_width ?? activeGallery?.room_width ?? 12;
  const roomLength = customSettings?.room_length ?? activeGallery?.room_length ?? 30;
  const roomHeight = (customSettings?.room_height ?? activeGallery?.room_height ?? 6) + 1;
  const floorColor = customSettings?.floor_color ?? activeGallery?.floor_color ?? '#4e3629';
  const wallColor = customSettings?.wall_color ?? activeGallery?.wall_color ?? '#8a1923';
  const floorType = customSettings?.floor_type ?? activeGallery?.floor_type ?? 'wood';

  // Tính toán kích thước trần vòm và giếng trời
  const skylightWidth = Math.min(roomWidth * 0.4, 5);
  const sideWidth = (roomWidth - skylightWidth) / 2;
  const panelWidth = sideWidth / Math.cos(Math.PI / 12);
  const leftPanelX = -(skylightWidth / 2 + sideWidth / 2);
  const rightPanelX = skylightWidth / 2 + sideWidth / 2;
  const panelHeightY = roomHeight - 0.6;

  return (
    <group>
      {/* Hộp chứa meshes, được ẩn/hiện tức thì mà không unmount để tránh lag WebGL */}
      <group visible={isVisible}>
        {/* 1. SÀN NHÀ & THẢM TRẢI SÀN (Floor & Center Carpet) */}
        {floorType === 'wood' && (
          <>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
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
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
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
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
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
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
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
        <mesh position={[leftPanelX, panelHeightY, 0]} rotation={[0, 0, -Math.PI / 12]}>
          <boxGeometry args={[panelWidth, 0.1, roomLength]} />
          <meshStandardMaterial 
            color="#eae5dc" 
            roughness={0.8}
          />
        </mesh>

        {/* Tấm trần vòm nghiêng bên phải */}
        <mesh position={[rightPanelX, panelHeightY, 0]} rotation={[0, 0, Math.PI / 12]}>
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
          <mesh key={`skylight-grid-${i}`} position={[0, roomHeight - 0.19, -roomLength / 2 + i * (roomLength / 10)]}>
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

        {/* 3. BỨC TƯỜNG (Dynamic Walls) */}
        {/* Tường trái */}
        <mesh position={[-roomWidth / 2, roomHeight / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[roomLength, roomHeight, 0.2]} />
          <meshStandardMaterial 
            color={wallColor} 
            roughness={0.7}
          />
        </mesh>

        {/* Tường phải */}
        <mesh position={[roomWidth / 2, roomHeight / 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <boxGeometry args={[roomLength, roomHeight, 0.2]} />
          <meshStandardMaterial 
            color={wallColor}
            roughness={0.7}
          />
        </mesh>

        {/* --- TƯỜNG TRƯỚC (Front Wall with Doorway) --- */}
        {/* Tường trước bên trái */}
        <mesh position={[-(roomWidth / 4 + 1), roomHeight / 2, -roomLength / 2]}>
          <boxGeometry args={[roomWidth / 2 - 2, roomHeight, 0.2]} />
          <meshStandardMaterial color={wallColor} roughness={0.7} />
        </mesh>
        {/* Tường trước bên phải */}
        <mesh position={[roomWidth / 4 + 1, roomHeight / 2, -roomLength / 2]}>
          <boxGeometry args={[roomWidth / 2 - 2, roomHeight, 0.2]} />
          <meshStandardMaterial color={wallColor} roughness={0.7} />
        </mesh>
        {/* Tường trước phía trên cửa */}
        <mesh position={[0, (roomHeight + 4) / 2, -roomLength / 2]}>
          <boxGeometry args={[4.0, roomHeight - 4.0, 0.2]} />
          <meshStandardMaterial color={wallColor} roughness={0.7} />
        </mesh>

        {/* --- TƯỜNG SAU (Back Wall with Doorway) --- */}
        {/* Tường sau bên trái */}
        <mesh position={[-(roomWidth / 4 + 1), roomHeight / 2, roomLength / 2]}>
          <boxGeometry args={[roomWidth / 2 - 2, roomHeight, 0.2]} />
          <meshStandardMaterial color={wallColor} roughness={0.7} />
        </mesh>
        {/* Tường sau bên phải */}
        <mesh position={[roomWidth / 4 + 1, roomHeight / 2, roomLength / 2]}>
          <boxGeometry args={[roomWidth / 2 - 2, roomHeight, 0.2]} />
          <meshStandardMaterial color={wallColor} roughness={0.7} />
        </mesh>
        {/* Tường sau phía trên cửa */}
        <mesh position={[0, (roomHeight + 4) / 2, roomLength / 2]}>
          <boxGeometry args={[4.0, roomHeight - 4.0, 0.2]} />
          <meshStandardMaterial color={wallColor} roughness={0.7} />
        </mesh>

        {/* Render các phần tử riêng biệt của phòng con */}
        {children}
      </group>

      {/* 6. HỆ THỐNG ĐÈN CHÙM / ĐÈN RỌI HÀNH LANG - ÁNH SÁNG THỰC TẾ */}
      {[-roomLength * 0.4, -roomLength * 0.2, 0, roomLength * 0.2, roomLength * 0.4].map((zPos, idx) => (
        <pointLight 
          key={`hall-light-source-${idx}`}
          position={[0, roomHeight - 1.0, zPos]}
          intensity={isVisible ? 4.5 : 0} 
          distance={roomLength * 0.6} 
          color="#fff1e0" 
        />
      ))}
    </group>
  );
};

export default BaseRoomPlain;
