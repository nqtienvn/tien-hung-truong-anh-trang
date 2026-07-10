import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
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

// ═══════════════════════════════════════════════════════════════════════════
// FIRST ROOM EXHIBITS (5 MODELS & 10 PAINTINGS DATA)
// ═══════════════════════════════════════════════════════════════════════════
const FIRST_ROOM_EXHIBITS = [
  {
    z: -71,
    titleVi: "Thành phần Kinh tế Nhà nước",
    titleEn: "State-owned Economy Sector",
    descVi: "Giữ vai trò chủ đạo, là công cụ đại diện cho sở hữu toàn dân điều tiết vĩ mô.",
    descEn: "Plays the leading role, representing public ownership to stabilize the macroeconomy.",
    modelType: "torus"
  },
  {
    z: -67,
    titleVi: "Thành phần Kinh tế Tư nhân",
    titleEn: "Private Economy Sector",
    descVi: "Động lực quan trọng của nền kinh tế, năng động, bứt phá và đóng góp lớn cho GDP.",
    descEn: "A key driver of the economy, highly dynamic, and contributing significantly to GDP.",
    modelType: "box"
  },
  {
    z: -63,
    titleVi: "Cơ chế Thị trường Tự do",
    titleEn: "Free Market Mechanism",
    descVi: "Vận hành theo cung - cầu, giá cả quyết định bởi thị trường cạnh tranh lành mạnh.",
    descEn: "Operates based on supply and demand, with prices determined by healthy competition.",
    modelType: "scale"
  },
  {
    z: -59,
    titleVi: "Quản lý và Điều tiết của Nhà nước",
    titleEn: "State Regulation & Management",
    descVi: "Xây dựng khung pháp lý, đầu tư hạ tầng thiết yếu và khắc phục khuyết tật thị trường.",
    descEn: "Enacting legal frameworks, investing in infrastructure, and correcting market failures.",
    modelType: "cylinder"
  },
  {
    z: -55,
    titleVi: "Hội nhập Quốc tế sâu rộng",
    titleEn: "Deep International Integration",
    descVi: "Mở rộng quan hệ song phương và đa phương, tham gia các chuỗi cung ứng toàn cầu.",
    descEn: "Expanding bilateral and multilateral relations, participating in global supply chains.",
    modelType: "globe"
  }
];

const FloatingModel: React.FC<{ 
  type: string; 
  z: number; 
  onClick?: (e: any) => void;
}> = ({ type, z, onClick }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = 1.6 + Math.sin(state.clock.getElapsedTime() * 2 + z) * 0.12;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.8;
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.4;
    }
  });

  return (
    <mesh 
      ref={meshRef} 
      position={[0, 1.6, z]} 
      onClick={onClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
      }}
    >
      {type === 'torus' && <torusGeometry args={[0.25, 0.08, 12, 32]} />}
      {type === 'box' && <boxGeometry args={[0.35, 0.35, 0.35]} />}
      {type === 'scale' && <coneGeometry args={[0.25, 0.5, 4]} />}
      {type === 'cylinder' && <cylinderGeometry args={[0.2, 0.2, 0.4, 16]} />}
      {type === 'globe' && <sphereGeometry args={[0.28, 16, 16]} />}

      <meshStandardMaterial 
        color="#06b6d4" 
        emissive="#06b6d4" 
        emissiveIntensity={1.2} 
        metalness={0.9} 
        roughness={0.1} 
      />
    </mesh>
  );
};

export const BaseRoomPlain: React.FC<BaseRoomProps> = ({ 
  galleryId, 
  customSettings, 
  isVisible = true,
  children 
}) => {
  const { activeGallery, setSelectedExhibit } = useMuseum();

  const handleExhibitClick = (
    e: any, 
    item: typeof FIRST_ROOM_EXHIBITS[0], 
    idx: number, 
    type: 'model' | 'painting', 
    side?: 'left' | 'right'
  ) => {
    e.stopPropagation();
    const coordX = type === 'model' ? 0 : (side === 'left' ? -roomWidth / 2 : roomWidth / 2);
    const rotY = type === 'model' ? 0 : (side === 'left' ? Math.PI / 2 : -Math.PI / 2);

    setSelectedExhibit({
      id: `${type}-${idx}-${side ?? 'center'}`,
      gallery_id: galleryId,
      title: { 
        vi: item.titleVi, 
        en: item.titleEn 
      },
      author: { 
        vi: type === 'model' ? "Mô hình 3D" : "Tranh trưng bày", 
        en: type === 'model' ? "3D Model" : "Exhibit Painting" 
      },
      description: { 
        vi: item.descVi, 
        en: item.descEn 
      },
      model_3d_url: "",
      thumbnail_url: type === 'painting' 
        ? (idx === 0 ? "https://images.unsplash.com/photo-1562408590-e32931084e23?w=800" 
          : idx === 1 ? "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800"
          : idx === 2 ? "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800"
          : idx === 3 ? "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800"
          : "https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800")
        : "",
      coordinate_x: coordX,
      coordinate_y: type === 'model' ? 1.6 : 2.3,
      coordinate_z: item.z,
      rotation_x: 0,
      rotation_y: rotY,
      rotation_z: 0,
      scale_x: 1,
      scale_y: 1,
      scale_z: 1
    });
  };


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

        {/* 5 Vách ngăn phân chia thành 6 phòng (chỉ áp dụng cho gallery-market-economy) */}
        {galleryId === 'gallery-market-economy' && Array.from({ length: 5 }).map((_, i) => {
          const zPos = -roomLength / 2 + (i + 1) * (roomLength / 6);
          return (
            <group key={`partition-${i}`}>
              {/* Vách ngăn bên trái */}
              <mesh position={[-(roomWidth / 4 + 1), roomHeight / 2, zPos]}>
                <boxGeometry args={[roomWidth / 2 - 2, roomHeight, 0.25]} />
                <meshStandardMaterial color={wallColor} roughness={0.7} />
              </mesh>
              {/* Vách ngăn bên phải */}
              <mesh position={[roomWidth / 4 + 1, roomHeight / 2, zPos]}>
                <boxGeometry args={[roomWidth / 2 - 2, roomHeight, 0.25]} />
                <meshStandardMaterial color={wallColor} roughness={0.7} />
              </mesh>
              {/* Vách ngăn phía trên cửa */}
              <mesh position={[0, (roomHeight + 4) / 2, zPos]}>
                <boxGeometry args={[4.0, roomHeight - 4.0, 0.25]} />
                <meshStandardMaterial color={wallColor} roughness={0.7} />
              </mesh>
            </group>
          );
        })}

        {/* Exhibits & Models inside the first room of gallery-market-economy */}
        {galleryId === 'gallery-market-economy' && FIRST_ROOM_EXHIBITS.map((item, idx) => (
          <group key={`first-room-item-${idx}`}>
            {/* Bệ đỡ mô hình 3D */}
            <mesh 
              position={[0, 0.5, item.z]}
              onClick={(e) => handleExhibitClick(e, item, idx, 'model')}
              onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
              onPointerOut={() => { document.body.style.cursor = 'auto'; }}
            >
              <cylinderGeometry args={[0.42, 0.52, 1.0, 16]} />
              <meshStandardMaterial color="#2d3748" metalness={0.8} roughness={0.2} />
            </mesh>
            <FloatingModel 
              type={item.modelType} 
              z={item.z} 
              onClick={(e) => handleExhibitClick(e, item, idx, 'model')}
            />

            {/* Ảnh tường Trái */}
            <group 
              position={[-roomWidth / 2 + 0.1, 2.3, item.z]} 
              rotation={[0, Math.PI / 2, 0]}
              onClick={(e) => handleExhibitClick(e, item, idx, 'painting')}
              onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
              onPointerOut={() => { document.body.style.cursor = 'auto'; }}
            >
              <mesh>
                <boxGeometry args={[3.2, 2.2, 0.1]} />
                <meshStandardMaterial color="#b45309" metalness={0.6} roughness={0.3} />
              </mesh>
              <mesh position={[0, 0, 0.06]}>
                <planeGeometry args={[3.0, 2.0]} />
                <meshStandardMaterial color="#0f172a" roughness={0.9} />
              </mesh>

              {/* Bảng nhãn thông tin dán trên tường dưới khung tranh */}
              <mesh position={[0, -1.4, 0.02]}>
                <planeGeometry args={[1.8, 0.75]} />
                <meshStandardMaterial color="#f8fafc" roughness={0.4} metalness={0.1} />
              </mesh>
              <Html position={[0, -1.4, 0.03]} center distanceFactor={8}>
                <div className="w-[160px] bg-slate-50/90 border border-slate-300 p-2 rounded shadow-md select-none text-center">
                  <h4 className="text-[9px] font-extrabold text-slate-800 uppercase tracking-wide mb-1">
                    {item.titleVi}
                  </h4>
                  <p className="text-[7.5px] leading-normal text-slate-600 font-medium">
                    {item.descVi}
                  </p>
                </div>
              </Html>
            </group>

            {/* Ảnh tường Phải */}
            <group 
              position={[roomWidth / 2 - 0.1, 2.3, item.z]} 
              rotation={[0, -Math.PI / 2, 0]}
              onClick={(e) => handleExhibitClick(e, item, idx, 'painting')}
              onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
              onPointerOut={() => { document.body.style.cursor = 'auto'; }}
            >
              <mesh>
                <boxGeometry args={[3.2, 2.2, 0.1]} />
                <meshStandardMaterial color="#b45309" metalness={0.6} roughness={0.3} />
              </mesh>
              <mesh position={[0, 0, 0.06]}>
                <planeGeometry args={[3.0, 2.0]} />
                <meshStandardMaterial color="#0f172a" roughness={0.9} />
              </mesh>

              {/* Bảng nhãn thông tin dán trên tường dưới khung tranh */}
              <mesh position={[0, -1.4, 0.02]}>
                <planeGeometry args={[1.8, 0.75]} />
                <meshStandardMaterial color="#f8fafc" roughness={0.4} metalness={0.1} />
              </mesh>
              <Html position={[0, -1.4, 0.03]} center distanceFactor={8}>
                <div className="w-[160px] bg-slate-50/90 border border-slate-300 p-2 rounded shadow-md select-none text-center">
                  <h4 className="text-[9px] font-extrabold text-slate-800 uppercase tracking-wide mb-1">
                    {item.titleEn}
                  </h4>
                  <p className="text-[7.5px] leading-normal text-slate-600 font-medium">
                    {item.descEn}
                  </p>
                </div>
              </Html>
            </group>
          </group>
        ))}


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
