import React from 'react';
import * as THREE from 'three';
import { useMuseum } from '@/context/MuseumContext';
import { BaseRoom, BaseRoomProps } from './BaseRoom';

const VelvetRopeBarrier: React.FC<{
  side: 'left' | 'right';
  zPoints: number[];
  xOffset?: number;
  zOffset?: number;
  onClick?: () => void;
}> = ({ side, zPoints, xOffset = 0, zOffset = 0, onClick }) => {
  const x = (side === 'left' ? -10.55 : 10.55) + xOffset;
  const adjustedZPoints = zPoints.map(z => z + zOffset);
  const postColor = '#2a2119';
  const metalColor = '#c59b45';
  const ropeColor = '#9f1239';

  return (
    <group onClick={(e) => { e.stopPropagation(); onClick?.(); }}>
      {adjustedZPoints.map((z) => (
        <group key={`${side}-post-${z}`} position={[x, 0, z]}>
          <mesh position={[0, 0.48, 0]}>
            <cylinderGeometry args={[0.055, 0.07, 0.96, 18]} />
            <meshStandardMaterial color={postColor} roughness={0.28} metalness={0.65} />
          </mesh>
          <mesh position={[0, 0.98, 0]}>
            <sphereGeometry args={[0.13, 18, 18]} />
            <meshStandardMaterial color={metalColor} roughness={0.22} metalness={0.85} />
          </mesh>
          <mesh position={[0, 0.06, 0]}>
            <cylinderGeometry args={[0.22, 0.28, 0.08, 24]} />
            <meshStandardMaterial color={postColor} roughness={0.35} metalness={0.55} />
          </mesh>
        </group>
      ))}

      {adjustedZPoints.slice(0, -1).map((z, index) => {
        const nextZ = adjustedZPoints[index + 1];
        const midZ = (z + nextZ) / 2;
        const length = Math.abs(nextZ - z);

        return (
          <group key={`${side}-rope-${z}-${nextZ}`}>
            <mesh position={[x, 0.94, midZ]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.045, 0.045, length, 20]} />
              <meshStandardMaterial color={ropeColor} roughness={0.55} metalness={0.05} />
            </mesh>
            {/* Dây phụ thấp hơn tạo cảm giác dây nhung có độ dày */}
            <mesh position={[x, 0.82, midZ]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.028, 0.028, length * 0.96, 16]} />
              <meshStandardMaterial color="#7f1d1d" roughness={0.62} metalness={0.03} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

export const RoomOne: React.FC<BaseRoomProps> = ({ 
  galleryId, 
  customSettings, 
  isVisible = true,
  onRopeClick
}) => {
  const { activeGallery } = useMuseum();

  // Parse config riêng từng dây từ customSettings hoặc DB
  // Thứ tự: [0]=trái-18, [1]=trái-8, [2]=trái+2, [3]=phải-18, [4]=phải-8, [5]=phải+2
  const DEFAULT_ROPE = { xOffset: 0, zOffset: 0 };
  let ropeConfigs: Array<{ xOffset: number; zOffset: number }> = Array(6).fill(DEFAULT_ROPE);
  try {
    const raw = (customSettings as any)?.rope_barriers_config ?? activeGallery?.rope_barriers_config;
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
    room_length: customSettings?.room_length ?? activeGallery?.room_length ?? 50,
    room_height: roomHeight,
    floor_color: customSettings?.floor_color ?? '#3d2516', // Sàn gỗ tối mộc mạc
    wall_color: wallColor,
    wainscoting_color: wainscotingColor,
    floor_type: (customSettings?.floor_type ?? 'wood') as 'wood' | 'marble' | 'carpet',
  };

  return (
    <BaseRoom galleryId={galleryId} customSettings={overriddenSettings} isVisible={isVisible}>
      {/* 1. TƯỜNG NGĂN CHIA PHÒNG CHỮ S - PHÂN ĐOẠN 1 (Z = 3.0) */}
      <group>
        {/* Mảnh tường trái (X: -12 đến -5) */}
        <mesh position={[-8.5, roomHeight / 2, 3.0]}>
          <boxGeometry args={[7.0, roomHeight, 0.4]} />
          <meshStandardMaterial color={wallColor} roughness={0.8} />
        </mesh>
        {/* Trụ ốp góc trái */}
        <mesh position={[-12.0 + 0.05, roomHeight / 2, 3.0]}>
          <boxGeometry args={[0.1, roomHeight, 0.48]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.9} />
        </mesh>
        {/* Trụ ốp cổng trái */}
        <mesh position={[-5.0 - 0.05, roomHeight / 2, 3.0]}>
          <boxGeometry args={[0.1, roomHeight, 0.48]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.9} />
        </mesh>
        
        {/* Wainscoting mặt trước & sau */}
        <mesh position={[-8.5, 0.6, 3.0 - 0.212]}>
          <boxGeometry args={[7.0, 1.2, 0.02]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.7} />
        </mesh>
        <mesh position={[-8.5, 1.2, 3.0 - 0.224]}>
          <boxGeometry args={[7.0, 0.06, 0.04]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.6} />
        </mesh>
        <mesh position={[-8.5, 0.6, 3.0 + 0.212]}>
          <boxGeometry args={[7.0, 1.2, 0.02]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.7} />
        </mesh>
        <mesh position={[-8.5, 1.2, 3.0 + 0.224]}>
          <boxGeometry args={[7.0, 0.06, 0.04]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.6} />
        </mesh>

        {/* Mảnh tường phải (X: -2 đến 12) */}
        <mesh position={[5.0, roomHeight / 2, 3.0]}>
          <boxGeometry args={[14.0, roomHeight, 0.4]} />
          <meshStandardMaterial color={wallColor} roughness={0.8} />
        </mesh>
        <mesh position={[-2.0 + 0.05, roomHeight / 2, 3.0]}>
          <boxGeometry args={[0.1, roomHeight, 0.48]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.9} />
        </mesh>
        <mesh position={[12.0 - 0.05, roomHeight / 2, 3.0]}>
          <boxGeometry args={[0.1, roomHeight, 0.48]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.9} />
        </mesh>

        {/* Wainscoting mặt trước & sau */}
        <mesh position={[5.0, 0.6, 3.0 - 0.212]}>
          <boxGeometry args={[14.0, 1.2, 0.02]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.7} />
        </mesh>
        <mesh position={[5.0, 1.2, 3.0 - 0.224]}>
          <boxGeometry args={[14.0, 0.06, 0.04]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.6} />
        </mesh>
        <mesh position={[5.0, 0.6, 3.0 + 0.212]}>
          <boxGeometry args={[14.0, 1.2, 0.02]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.7} />
        </mesh>
        <mesh position={[5.0, 1.2, 3.0 + 0.224]}>
          <boxGeometry args={[14.0, 0.06, 0.04]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.6} />
        </mesh>

        {/* Tường trên cổng rỗng (X: -5 đến -2) */}
        <mesh position={[-3.5, (roomHeight + 3.5) / 2, 3.0]}>
          <boxGeometry args={[3.0, roomHeight - 3.5, 0.4]} />
          <meshStandardMaterial color={wallColor} roughness={0.8} />
        </mesh>
      </group>

      {/* 2. VÁCH NGĂN TRUNG TÂM PHÒNG (Z = 13.0) */}
      <group>
        <mesh position={[0, 2.0, 13.0]}>
          <boxGeometry args={[12.0, 4.0, 0.4]} />
          <meshStandardMaterial color={wallColor} roughness={0.8} />
        </mesh>
        <mesh position={[-6.0, 2.0, 13.0]}>
          <boxGeometry args={[0.1, 4.0, 0.48]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.9} />
        </mesh>
        <mesh position={[6.0, 2.0, 13.0]}>
          <boxGeometry args={[0.1, 4.0, 0.48]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.9} />
        </mesh>

        {/* Wainscoting */}
        <mesh position={[0, 0.6, 13.0 - 0.212]}>
          <boxGeometry args={[12.0, 1.2, 0.02]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.7} />
        </mesh>
        <mesh position={[0, 1.2, 13.0 - 0.224]}>
          <boxGeometry args={[12.0, 0.06, 0.04]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.6, 13.0 + 0.212]}>
          <boxGeometry args={[12.0, 1.2, 0.02]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.7} />
        </mesh>
        <mesh position={[0, 1.2, 13.0 + 0.224]}>
          <boxGeometry args={[12.0, 0.06, 0.04]} />
          <meshStandardMaterial color={wainscotingColor} roughness={0.6} />
        </mesh>

        {/* Bàn trưng bày bằng gỗ cổ bày chiếc Đài Radio và bình hoa */}
        <group position={[0, 0, 13.0 - 0.45]}>
          <mesh position={[0, 0.75, 0]}>
            <boxGeometry args={[2.2, 0.1, 0.65]} />
            <meshStandardMaterial color="#4e2e1e" roughness={0.3} />
          </mesh>
          {/* Chân bàn */}
          {[-0.9, 0.9].map((x, i) => (
            <mesh key={i} position={[x, 0.35, 0]}>
              <cylinderGeometry args={[0.07, 0.07, 0.7, 8]} />
              <meshStandardMaterial color="#361f14" roughness={0.4} />
            </mesh>
          ))}
          {/* Mô hình Radio cổ mộc mạc làm đồ decor */}
          <group position={[0, 0.9, 0]}>
            <mesh>
              <boxGeometry args={[0.5, 0.24, 0.2]} />
              <meshStandardMaterial color="#8d6e63" roughness={0.5} />
            </mesh>
            <mesh position={[0.15, 0, 0.105]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 0.02, 12]} />
              <meshStandardMaterial color="#cfd8dc" roughness={0.2} />
            </mesh>
            <mesh position={[-0.12, 0, 0.101]}>
              <planeGeometry args={[0.2, 0.15]} />
              <meshStandardMaterial color="#1e1e1e" roughness={0.9} />
            </mesh>
          </group>
        </group>
      </group>

      {/* 3. GHẾ GỖ DÀI CHO KHÁCH NGHỈ (Z = 8.0 & Z = 18.0) */}
      {[8.0, 18.0].map((z) => (
        <group key={z} position={[0, 0, z]}>
          <mesh position={[0, 0.45, 0]}>
            <boxGeometry args={[3.2, 0.08, 0.8]} />
            <meshStandardMaterial color="#4e2e1e" roughness={0.3} />
          </mesh>
          {[-1.4, 1.4].map((x, i) => (
            <mesh key={i} position={[x, 0.2, 0]}>
              <boxGeometry args={[0.15, 0.4, 0.7]} />
              <meshStandardMaterial color="#361f14" roughness={0.5} />
            </mesh>
          ))}
        </group>
      ))}

      {/* 4. CỤM GHẾ NGỒI GIỮA PHÒNG - tạo cảm giác phòng triển lãm có điểm nghỉ chân */}
      {[-16.5, -10.5, -4.5].map((z, index) => (
        <group key={`central-bench-${z}`} position={[0, 0, z]} rotation={[0, index % 2 === 0 ? 0 : Math.PI, 0]}>
          <mesh position={[0, 0.52, 0]}>
            <boxGeometry args={[4.0, 0.12, 0.82]} />
            <meshStandardMaterial color="#5a3421" roughness={0.38} />
          </mesh>
          <mesh position={[0, 0.9, -0.36]} rotation={[0.08, 0, 0]}>
            <boxGeometry args={[4.0, 0.12, 0.72]} />
            <meshStandardMaterial color="#4a2b1b" roughness={0.42} />
          </mesh>
          {[-1.65, 1.65].map((x) => (
            <group key={x}>
              <mesh position={[x, 0.25, -0.26]}>
                <boxGeometry args={[0.16, 0.5, 0.16]} />
                <meshStandardMaterial color="#2d1a11" roughness={0.55} />
              </mesh>
              <mesh position={[x, 0.25, 0.26]}>
                <boxGeometry args={[0.16, 0.5, 0.16]} />
                <meshStandardMaterial color="#2d1a11" roughness={0.55} />
              </mesh>
            </group>
          ))}
        </group>
      ))}

      {/* 5. BÀN TRANG TRÍ GỌN VỚI LỌ HOA - đặt lệch bên để không cản lối */}
      {[
        { x: -7.2, z: -13.2 },
        { x: 7.2, z: -7.2 },
      ].map((item, index) => (
        <group key={`decor-table-${index}`} position={[item.x, 0, item.z]}>
          <mesh position={[0, 0.64, 0]}>
            <cylinderGeometry args={[0.42, 0.46, 0.08, 24]} />
            <meshStandardMaterial color="#4b2a19" roughness={0.42} />
          </mesh>
          <mesh position={[0, 0.32, 0]}>
            <cylinderGeometry args={[0.055, 0.075, 0.64, 12]} />
            <meshStandardMaterial color="#2f1a10" roughness={0.55} />
          </mesh>
          <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.28, 0.34, 0.06, 20]} />
            <meshStandardMaterial color="#2f1a10" roughness={0.55} />
          </mesh>

          <mesh position={[0, 0.82, 0]}>
            <cylinderGeometry args={[0.09, 0.13, 0.26, 16]} />
            <meshStandardMaterial color="#8d6e63" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.98, 0]}>
            <sphereGeometry args={[0.11, 16, 16]} />
            <meshStandardMaterial color="#a1887f" roughness={0.55} />
          </mesh>
          {[-0.09, 0.09].map((x, flowerIndex) => (
            <group key={flowerIndex} position={[x, 1.05, 0]} rotation={[0, 0, x * 2.4]}>
              <mesh position={[0, 0.09, 0]}>
                <cylinderGeometry args={[0.008, 0.009, 0.3, 8]} />
                <meshStandardMaterial color="#2f5d3a" roughness={0.7} />
              </mesh>
              <mesh position={[0, 0.25, 0]}>
                <sphereGeometry args={[0.045, 10, 10]} />
                <meshStandardMaterial color={flowerIndex === 0 ? '#ef4444' : '#f8b4c4'} roughness={0.6} />
              </mesh>
            </group>
          ))}
        </group>
      ))}

      {/* 6. HÀNG RÀO DÂY NHUNG ĐỎ TRƯỚC DÃY TRANH - từng dây có offset riêng */}
      <VelvetRopeBarrier side="left" zPoints={[-18, -12]} xOffset={ropeConfigs[0].xOffset} zOffset={ropeConfigs[0].zOffset} onClick={() => onRopeClick?.(0)} />
      <VelvetRopeBarrier side="left" zPoints={[-8, -2]} xOffset={ropeConfigs[1].xOffset} zOffset={ropeConfigs[1].zOffset} onClick={() => onRopeClick?.(1)} />
      <VelvetRopeBarrier side="left" zPoints={[2, 8]} xOffset={ropeConfigs[2].xOffset} zOffset={ropeConfigs[2].zOffset} onClick={() => onRopeClick?.(2)} />
      <VelvetRopeBarrier side="right" zPoints={[-18, -12]} xOffset={-ropeConfigs[3].xOffset} zOffset={ropeConfigs[3].zOffset} onClick={() => onRopeClick?.(3)} />
      <VelvetRopeBarrier side="right" zPoints={[-8, -2]} xOffset={-ropeConfigs[4].xOffset} zOffset={ropeConfigs[4].zOffset} onClick={() => onRopeClick?.(4)} />
      <VelvetRopeBarrier side="right" zPoints={[2, 8]} xOffset={-ropeConfigs[5].xOffset} zOffset={ropeConfigs[5].zOffset} onClick={() => onRopeClick?.(5)} />
    </BaseRoom>
  );
};

export default RoomOne;
