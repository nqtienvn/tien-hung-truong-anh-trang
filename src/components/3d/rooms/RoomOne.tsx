import React from 'react';
import * as THREE from 'three';
import { useMuseum } from '@/context/MuseumContext';
import { BaseRoom, BaseRoomProps } from './BaseRoom';

export const RoomOne: React.FC<BaseRoomProps> = ({ 
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
      {/* 4. HÀNH LANG RẼ CHỮ S: TƯỜNG NGĂN Z = 3 (Paintings Room Side) */}
      <group>
        {/* Mảnh tường trái (rộng 7m, từ X = -12 đến X = -5) */}
        <mesh position={[-8.5, roomHeight / 2, 3.0]}>
          <boxGeometry args={[7.0, roomHeight, 0.4]} />
          <meshStandardMaterial color={wallColor} roughness={0.7} />
        </mesh>
        <mesh position={[-12.0 + 0.05, roomHeight / 2, 3.0]}>
          <boxGeometry args={[0.1, roomHeight, 0.48]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.8} />
        </mesh>
        <mesh position={[-5.0 - 0.05, roomHeight / 2, 3.0]}>
          <boxGeometry args={[0.1, roomHeight, 0.48]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.8} />
        </mesh>
        {/* Wainscoting tường ngăn trái */}
        <mesh position={[-8.5, 0.6, 3.0 - 0.212]}>
          <boxGeometry args={[7.0, 1.2, 0.02]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.5} />
        </mesh>
        <mesh position={[-8.5, 1.2, 3.0 - 0.224]}>
          <boxGeometry args={[7.0, 0.06, 0.04]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.4} />
        </mesh>
        <mesh position={[-8.5, 0.6, 3.0 + 0.212]}>
          <boxGeometry args={[7.0, 1.2, 0.02]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.5} />
        </mesh>
        <mesh position={[-8.5, 1.2, 3.0 + 0.224]}>
          <boxGeometry args={[7.0, 0.06, 0.04]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.4} />
        </mesh>

        {/* Mảnh tường phải (rộng 14m, từ X = -2 đến X = 12) */}
        <mesh position={[5.0, roomHeight / 2, 3.0]}>
          <boxGeometry args={[14.0, roomHeight, 0.4]} />
          <meshStandardMaterial color={wallColor} roughness={0.7} />
        </mesh>
        <mesh position={[-2.0 + 0.05, roomHeight / 2, 3.0]}>
          <boxGeometry args={[0.1, roomHeight, 0.48]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.8} />
        </mesh>
        <mesh position={[12.0 - 0.05, roomHeight / 2, 3.0]}>
          <boxGeometry args={[0.1, roomHeight, 0.48]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.8} />
        </mesh>
        {/* Wainscoting tường ngăn phải */}
        <mesh position={[5.0, 0.6, 3.0 - 0.212]}>
          <boxGeometry args={[14.0, 1.2, 0.02]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.5} />
        </mesh>
        <mesh position={[5.0, 1.2, 3.0 - 0.224]}>
          <boxGeometry args={[14.0, 0.06, 0.04]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.4} />
        </mesh>
        <mesh position={[5.0, 0.6, 3.0 + 0.212]}>
          <boxGeometry args={[14.0, 1.2, 0.02]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.5} />
        </mesh>
        <mesh position={[5.0, 1.2, 3.0 + 0.224]}>
          <boxGeometry args={[14.0, 0.06, 0.04]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.4} />
        </mesh>

        {/* Mảnh tường phía trên cổng (từ X = -5.0 đến X = -2.0) */}
        <mesh position={[-3.5, (roomHeight + 3.5) / 2, 3.0]}>
          <boxGeometry args={[3.0, roomHeight - 3.5, 0.4]} />
          <meshStandardMaterial color={wallColor} roughness={0.7} />
        </mesh>
      </group>

      {/* 5. KHU VỰC PHÒNG TRANH (Paintings Room - Z > 3) */}
      <group>
        {/* Vách ngăn trung tâm khu vực tranh tại Z = 13.0 (rộng 12m) */}
        <mesh position={[0, 2.0, 13.0]}>
          <boxGeometry args={[12.0, 4.0, 0.4]} />
          <meshStandardMaterial color={wallColor} roughness={0.7} />
        </mesh>

        {/* Cột trang trí ở rìa vách ngăn trung tâm */}
        <mesh position={[-6.0, 2.0, 13.0]}>
          <boxGeometry args={[0.1, 4.0, 0.48]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.8} />
        </mesh>
        <mesh position={[6.0, 2.0, 13.0]}>
          <boxGeometry args={[0.1, 4.0, 0.48]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.8} />
        </mesh>

        {/* Ốp chân tường wainscoting cho vách ngăn */}
        <mesh position={[0, 0.6, 13.0 - 0.212]}>
          <boxGeometry args={[12.0, 1.2, 0.02]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.5} />
        </mesh>
        <mesh position={[0, 1.2, 13.0 - 0.224]}>
          <boxGeometry args={[12.0, 0.06, 0.04]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.6, 13.0 + 0.212]}>
          <boxGeometry args={[12.0, 1.2, 0.02]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.5} />
        </mesh>
        <mesh position={[0, 1.2, 13.0 + 0.224]}>
          <boxGeometry args={[12.0, 0.06, 0.04]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.4} />
        </mesh>

        {/* Bàn Console gỗ cổ điển bên dưới vách ngăn */}
        <group position={[0, 0, 13.0 - 0.45]}>
          <mesh position={[0, 0.75, 0]}>
            <boxGeometry args={[2.0, 0.1, 0.5]} />
            <meshStandardMaterial color="#3e2723" roughness={0.2} />
          </mesh>
          <mesh position={[-0.8, 0.35, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.7, 8]} />
            <meshStandardMaterial color="#2d1d19" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.35, 0.15]}>
            <cylinderGeometry args={[0.04, 0.04, 0.7, 8]} />
            <meshStandardMaterial color="#2d1d19" roughness={0.4} />
          </mesh>
          <mesh position={[0.8, 0.35, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.7, 8]} />
            <meshStandardMaterial color="#2d1d19" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.9, 0]}>
            <torusKnotGeometry args={[0.1, 0.03, 64, 8]} />
            <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.1} />
          </mesh>
        </group>
        <group position={[0, 0, 13.0 + 0.45]}>
          <mesh position={[0, 0.75, 0]}>
            <boxGeometry args={[2.0, 0.1, 0.5]} />
            <meshStandardMaterial color="#3e2723" roughness={0.2} />
          </mesh>
          <mesh position={[-0.8, 0.35, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.7, 8]} />
            <meshStandardMaterial color="#2d1d19" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.35, -0.15]}>
            <cylinderGeometry args={[0.04, 0.04, 0.7, 8]} />
            <meshStandardMaterial color="#2d1d19" roughness={0.4} />
          </mesh>
          <mesh position={[0.8, 0.35, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.7, 8]} />
            <meshStandardMaterial color="#2d1d19" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.9, 0]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.1} />
          </mesh>
        </group>

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
      </group>
    </BaseRoom>
  );
};

export default RoomOne;
