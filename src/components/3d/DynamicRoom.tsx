import React, { Suspense, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ExhibitionRoom } from './ExhibitionRoom';
import { ExhibitObject } from './ExhibitObject';
import { LoadedRoom } from '@/context/MuseumContext';

/**
 * DynamicRoom — Component tải phòng triển lãm động tại offset Z cho trước
 * 
 * Được mount/unmount bởi hệ thống cửa:
 * - Admin mở cửa → DynamicRoom mount → ExhibitionRoom + exhibits render tại offset
 * - Admin đóng cửa → DynamicRoom unmount → giải phóng GPU resources
 */

interface DynamicRoomProps {
  room: LoadedRoom;
  /** Offset tọa độ Z để đặt phòng nối tiếp sảnh/phòng trước đó */
  offsetZ: number;
  /** Offset tọa độ Y (mặc định = 0) */
  offsetY?: number;
  /** Trạng thái hiển thị của phòng */
  isVisible?: boolean;
}

// Bản đồ offset cho mỗi phòng (Gallery ID → Z offset từ sảnh)
// Mỗi phòng dài 46 đơn vị. Phòng 1 bắt đầu ngay Z=8 (sau tường sảnh):
//   center = 8 + 46/2 = 31  →  offset = 31, spans Z 8..54
// Phòng 2: bắt đầu Z=54  →  center = 54 + 23 = 77,  spans Z 54..100
// Phòng 3: bắt đầu Z=100 →  center = 100 + 23 = 123, spans Z 100..146
// Phòng 4: bắt đầu Z=146 →  center = 146 + 15 = 161, spans Z 146..176
// Phòng 5: bắt đầu Z=176 →  center = 176 + 57.5 = 233.5, spans Z 176..291
export const ROOM_OFFSETS: Record<string, { z: number; y: number }> = {
  'gallery-subsidy': { z: 31.0, y: 3.0 },      // Phòng 1: Bao cấp    (Z 8  → 54)
  'gallery-paintings': { z: 77.0, y: 3.0 },    // Phòng 2: Hội họa   (Z 54 → 100)
  'gallery-sculptures': { z: 123.0, y: 3.0 },  // Phòng 3: Điêu khắc (Z 100 → 146)
  'gallery-ceramics': { z: 161.0, y: 3.0 },    // Phòng 4: Gốm sứ    (Z 146 → 176)
  'gallery-market-economy': { z: 233.5, y: 3.0 }, // Phòng 5: Kinh tế thị trường (Z 176 → 291)
};

// Spawn point mặc định khi người chơi bước vào phòng
export const ROOM_SPAWN_POINTS: Record<string, [number, number, number]> = {
  'gallery-subsidy': [0, 3.0, 10.0],           // Spawn gần cửa vào phòng 1 (Z=10)
  'gallery-paintings': [0, 3.0, 56.0],          // Spawn gần cửa vào phòng 2 (Z=56)
  'gallery-sculptures': [0, 3.0, 102.0],        // Spawn gần cửa vào phòng 3 (Z=102)
  'gallery-ceramics': [0, 3.0, 148.0],          // Spawn gần cửa vào phòng 4 (Z=148)
  'gallery-market-economy': [0, 3.0, 178.0],   // Spawn gần cửa vào phòng 5 (Z=178)
  'lobby': [0, 0, -5.0],                        // Spawn giữa sảnh
};

export const DynamicRoom: React.FC<DynamicRoomProps> = ({ room, offsetZ, offsetY = 0, isVisible = true }) => {
  const { galleryId, exhibits, gallery } = room;
  const groupRef = useRef<THREE.Group>(null);

  // Cơ chế Occlusion Culling (LOD): ẩn phòng nếu người chơi đi quá xa để giảm tải GPU vẽ hình
  useFrame((state) => {
    if (!groupRef.current) return;

    if (!isVisible) {
      if (groupRef.current.visible) groupRef.current.visible = false;
      return;
    }

    const player = state.scene.getObjectByName('lobby-player');
    if (player) {
      const playerZ = player.position.z;
      const roomZ = offsetZ;
      const dist = Math.abs(playerZ - roomZ);

      // Nếu người chơi ở khoảng cách > 75 đơn vị Z (không nằm gần phòng này hoặc phòng liền kề),
      // ta ẩn phòng đi để giảm thiểu tối đa số lệnh vẽ (draw calls) và số lượng đỉnh đa giác.
      const shouldBeVisible = dist < 75.0;
      if (groupRef.current.visible !== shouldBeVisible) {
        groupRef.current.visible = shouldBeVisible;
        console.log(`[LOD-CULLING] Phòng "${galleryId}" chuyển trạng thái visible = ${shouldBeVisible}`);
      }
    } else {
      if (!groupRef.current.visible) groupRef.current.visible = true;
    }
  });

  // Build custom settings từ gallery data
  const customSettings = gallery ? {
    room_width: gallery.room_width ?? 12,
    room_length: gallery.room_length ?? 30,
    room_height: gallery.room_height ?? 6,
    floor_color: gallery.floor_color ?? '#4e3629',
    wall_color: gallery.wall_color ?? '#8a1923',
    wainscoting_color: gallery.wainscoting_color ?? '#eae5dc',
    floor_type: (gallery.floor_type ?? 'wood') as 'wood' | 'marble' | 'carpet',
  } : undefined;

  return (
    <group ref={groupRef} position={[0, offsetY, offsetZ]}>
      <Suspense fallback={null}>
        {/* Phòng triển lãm */}
        <ExhibitionRoom galleryId={galleryId} customSettings={customSettings} isVisible={isVisible} />

        {/* Các hiện vật trong phòng */}
        {exhibits.map((exhibit) => (
          <ExhibitObject key={exhibit.id} exhibit={exhibit} isVisible={isVisible} />
        ))}
      </Suspense>
    </group>
  );
};

export default DynamicRoom;
