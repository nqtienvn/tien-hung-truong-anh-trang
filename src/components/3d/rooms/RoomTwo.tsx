import React from 'react';
import * as THREE from 'three';
import { useMuseum } from '@/context/MuseumContext';
import { BaseRoom, BaseRoomProps } from './BaseRoom';

export const RoomTwo: React.FC<BaseRoomProps> = ({ 
  galleryId, 
  customSettings, 
  isVisible = true 
}) => {
  const { activeGallery } = useMuseum();

  // Đọc cấu hình động hoặc fallback về mặc định
  const roomHeight = customSettings?.room_height ?? activeGallery?.room_height ?? 6;
  const wallColor = customSettings?.wall_color ?? activeGallery?.wall_color ?? '#8a1923';
  const wainscotingColor = customSettings?.wainscoting_color ?? activeGallery?.wainscoting_color ?? '#eae5dc';

  return (
    <BaseRoom galleryId={galleryId} customSettings={customSettings} isVisible={isVisible}>
        {/* Ghế băng dài cổ điển trong Phòng Tranh */}
        {[8.0, 18.0].map((zPos, idx) => (
          <group key={`bench-${idx}`} position={[0, 0, zPos]}>
            <mesh position={[0, 0.45, 0]}>
              <boxGeometry args={[4.0, 0.15, 1.2]} />
              <meshStandardMaterial color="#4e2c1e" roughness={0.5} />
            </mesh>
            <mesh position={[0, 0.32, 0]}>
              <boxGeometry args={[4.1, 0.1, 1.3]} />
              <meshStandardMaterial color="#27150c" roughness={0.3} />
            </mesh>
            <mesh position={[-1.7, 0.15, 0]}>
              <boxGeometry args={[0.2, 0.3, 1.1]} />
              <meshStandardMaterial color="#1b110b" roughness={0.4} />
            </mesh>
            <mesh position={[1.7, 0.15, 0]}>
              <boxGeometry args={[0.2, 0.3, 1.1]} />
              <meshStandardMaterial color="#1b110b" roughness={0.4} />
            </mesh>
          </group>
        ))}
    </BaseRoom>
  );
};

export default RoomTwo;
