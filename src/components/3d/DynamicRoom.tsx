import React, { Suspense } from 'react';
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
}

// Bản đồ offset cho mỗi phòng (Gallery ID → Z offset từ sảnh)
// Phòng 1 đặt ngay sau tường sau sảnh (Z = 8.0 → offset +23)
// Phòng 2 offset thêm 35m tiếp
export const ROOM_OFFSETS: Record<string, { z: number; y: number }> = {
  'gallery-paintings': { z: 33.0, y: 3.0 },    // Phòng 1: Nối từ cầu thang tầng 2 sảnh (Y = 3m, Z spans 8.0 to 58.0)
  'gallery-sculptures': { z: 83.0, y: 3.0 },   // Phòng 2: Nối tiếp sau phòng 1 (Z spans 58.0 to 108.0)
};

// Spawn point mặc định khi người chơi bước vào phòng
export const ROOM_SPAWN_POINTS: Record<string, [number, number, number]> = {
  'gallery-paintings': [0, 3.0, 10.0],    // Spawn gần cửa vào phòng 1 (vừa qua cửa Z=8)
  'gallery-sculptures': [0, 3.0, 60.0],   // Spawn gần cửa vào phòng 2 (vừa qua cửa Z=58)
  'lobby': [0, 0, -5.0],                  // Spawn giữa sảnh
};

export const DynamicRoom: React.FC<DynamicRoomProps> = ({ room, offsetZ, offsetY = 0 }) => {
  const { galleryId, exhibits, gallery } = room;

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
    <group position={[0, offsetY, offsetZ]}>
      <Suspense fallback={null}>
        {/* Phòng triển lãm */}
        <ExhibitionRoom galleryId={galleryId} customSettings={customSettings} />

        {/* Các hiện vật trong phòng */}
        {exhibits.map((exhibit) => (
          <ExhibitObject key={exhibit.id} exhibit={exhibit} />
        ))}

        {/* Ánh sáng bổ sung cho phòng động */}
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[3, 8, 3]}
          intensity={0.6}
          castShadow
          shadow-mapSize-width={512}
          shadow-mapSize-height={512}
        />
        <directionalLight
          position={[0, 7, 0]}
          intensity={1.0}
          color="#f0f9ff"
        />
      </Suspense>
    </group>
  );
};

export default DynamicRoom;
