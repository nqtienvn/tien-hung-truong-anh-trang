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
      {/* 4.5. HÀNH LANG RẼ CHỮ S: TƯỜNG NGĂN Z = -3 (Sculptures Room Side) */}
      <group>
        {/* Mảnh tường trái (rộng 14m, từ X = -12 đến X = 2) */}
        <mesh position={[-5.0, roomHeight / 2, -3.0]}>
          <boxGeometry args={[14.0, roomHeight, 0.4]} />
          <meshStandardMaterial color={wallColor} roughness={0.7} />
        </mesh>
        <mesh position={[-12.0 + 0.05, roomHeight / 2, -3.0]}>
          <boxGeometry args={[0.1, roomHeight, 0.48]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.8} />
        </mesh>
        <mesh position={[2.0 - 0.05, roomHeight / 2, -3.0]}>
          <boxGeometry args={[0.1, roomHeight, 0.48]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.8} />
        </mesh>
        {/* Wainscoting tường ngăn trái */}
        <mesh position={[-5.0, 0.6, -3.0 - 0.212]}>
          <boxGeometry args={[14.0, 1.2, 0.02]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.5} />
        </mesh>
        <mesh position={[-5.0, 1.2, -3.0 - 0.224]}>
          <boxGeometry args={[14.0, 0.06, 0.04]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.4} />
        </mesh>
        <mesh position={[-5.0, 0.6, -3.0 + 0.212]}>
          <boxGeometry args={[14.0, 1.2, 0.02]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.5} />
        </mesh>
        <mesh position={[-5.0, 1.2, -3.0 + 0.224]}>
          <boxGeometry args={[14.0, 0.06, 0.04]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.4} />
        </mesh>

        {/* Mảnh tường phải (rộng 7m, từ X = 5 đến X = 12) */}
        <mesh position={[8.5, roomHeight / 2, -3.0]}>
          <boxGeometry args={[7.0, roomHeight, 0.4]} />
          <meshStandardMaterial color={wallColor} roughness={0.7} />
        </mesh>
        <mesh position={[5.0 + 0.05, roomHeight / 2, -3.0]}>
          <boxGeometry args={[0.1, roomHeight, 0.48]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.8} />
        </mesh>
        <mesh position={[12.0 - 0.05, roomHeight / 2, -3.0]}>
          <boxGeometry args={[0.1, roomHeight, 0.48]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.8} />
        </mesh>
        {/* Wainscoting tường ngăn phải */}
        <mesh position={[8.5, 0.6, -3.0 - 0.212]}>
          <boxGeometry args={[7.0, 1.2, 0.02]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.5} />
        </mesh>
        <mesh position={[8.5, 1.2, -3.0 - 0.224]}>
          <boxGeometry args={[7.0, 0.06, 0.04]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.4} />
        </mesh>
        <mesh position={[8.5, 0.6, -3.0 + 0.212]}>
          <boxGeometry args={[7.0, 1.2, 0.02]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.5} />
        </mesh>
        <mesh position={[8.5, 1.2, -3.0 + 0.224]}>
          <boxGeometry args={[7.0, 0.06, 0.04]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.4} />
        </mesh>

        {/* Mảnh tường phía trên cổng (từ X = 2.0 đến X = 5.0) */}
        <mesh position={[3.5, (roomHeight + 3.5) / 2, -3.0]}>
          <boxGeometry args={[3.0, roomHeight - 3.5, 0.4]} />
          <meshStandardMaterial color={wallColor} roughness={0.7} />
        </mesh>
      </group>

      {/* 6. KHU VỰC PHÒNG ĐIÊU KHẮC (Sculptures Room - Z < -3) */}
      <group>
        {/* Các bệ đỡ tượng */}
        {[-8.0, -14.0, -20.0].map((zPos, idx) => (
          <group key={`pedestal-${idx}`} position={[0, 0, zPos]}>
            <mesh position={[0, 0.5, 0]}>
              <boxGeometry args={[1.0, 1.0, 1.0]} />
              <meshStandardMaterial 
                color="#26262b" 
                roughness={0.2}
                metalness={0.15}
              />
            </mesh>
            <mesh position={[0, 0.05, 0]}>
              <boxGeometry args={[1.05, 0.1, 1.05]} />
              <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.1} />
            </mesh>
            <mesh position={[0, 0.95, 0]}>
              <boxGeometry args={[1.05, 0.08, 1.05]} />
              <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.1} />
            </mesh>
          </group>
        ))}
      </group>
    </BaseRoom>
  );
};

export default RoomTwo;
