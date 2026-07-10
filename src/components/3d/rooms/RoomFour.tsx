'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useMuseum } from '@/context/MuseumContext';
import { BaseRoomPlain, BaseRoomProps } from './BaseRoomPlain';

const PaintingMesh: React.FC<{ url: string }> = ({ url }) => {
  const texture = useTexture(url);
  return (
    <mesh position={[0, 0, 0.06]}>
      <planeGeometry args={[3.0, 2.0]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const SLIDESHOW_IMAGES = [
  { url: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&auto=format&fit=crop&q=80', label: 'VinFast - Doanh nghiệp tư nhân' },
  { url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80', label: 'Samsung - FDI đầu tư nước ngoài' },
  { url: 'https://images.unsplash.com/photo-1562408590-e32931084e23?w=800&auto=format&fit=crop&q=80', label: 'Viettel - Tập đoàn kinh tế Nhà nước' },
  { url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=80', label: 'EVN - An ninh năng lượng' },
  { url: 'https://images.unsplash.com/photo-1544984243-ec57ea16fe25?w=800&auto=format&fit=crop&q=80', label: 'Cao tốc Bắc – Nam - Đầu tư công' },
  { url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80', label: 'Bảo hiểm y tế - An sinh xã hội' },
  { url: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800&auto=format&fit=crop&q=80', label: 'Chợ truyền thống - Cơ chế cung cầu' },
  { url: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&auto=format&fit=crop&q=80', label: 'Siêu thị hiện đại - Nhiều thành phần' },
  { url: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&auto=format&fit=crop&q=80', label: 'Cảng biển quốc tế - Mở cửa giao thương' },
  { url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80', label: 'Container xuất khẩu - Hội nhập toàn cầu' },
];

const GAME_SITUATIONS = [
  { id: 1, text: 'Được mùa nhưng thu nhập lại giảm.', category: 'market_mechanism', label: 'Cơ chế thị trường' },
  { id: 2, text: 'Ít người sử dụng nhưng vẫn được đầu tư.', category: 'state_role', label: 'Vai trò Nhà nước' },
  { id: 3, text: 'Cùng một sản phẩm nhưng có rất nhiều đơn vị cùng cung cấp.', category: 'multi_sector', label: 'Nhiều thành phần kinh tế' },
  { id: 4, text: 'Khó khăn về tài chính nhưng vẫn được tiếp cận dịch vụ.', category: 'social_justice', label: 'Công bằng xã hội' },
  { id: 5, text: 'Một sản phẩm hoàn thành sau nhiều công đoạn ở nhiều quốc gia.', category: 'integration', label: 'Hội nhập quốc tế' },
  { id: 6, text: 'Nhu cầu tăng làm giá tăng.', category: 'market_mechanism', label: 'Cơ chế thị trường' },
  { id: 7, text: 'Không đạt tiêu chuẩn nên không được phép tiếp tục hoạt động.', category: 'state_role', label: 'Vai trò Nhà nước' },
  { id: 8, text: 'Nhiều mô hình cùng tồn tại trong một lĩnh vực.', category: 'multi_sector', label: 'Nhiều thành phần kinh tế' },
  { id: 9, text: 'Điều kiện sống khác nhau nhưng cơ hội tiếp cận gần như giống nhau.', category: 'social_justice', label: 'Công bằng xã hội' },
  { id: 10, text: 'Một đơn hàng phải đi qua nhiều quốc gia mới hoàn thành.', category: 'integration', label: 'Hội nhập quốc tế' },
  { id: 11, text: 'Bán chậm nên giá giảm.', category: 'market_mechanism', label: 'Cơ chế thị trường' },
  { id: 12, text: 'Phải thay đổi để đáp ứng quy định mới.', category: 'state_role', label: 'Vai trò Nhà nước' },
  { id: 13, text: 'Nhiều chủ sở hữu cùng tham gia một lĩnh vực.', category: 'multi_sector', label: 'Nhiều thành phần kinh tế' },
  { id: 14, text: 'Không đủ khả năng chi trả nhưng vẫn được hỗ trợ.', category: 'social_justice', label: 'Công bằng xã hội' },
  { id: 15, text: 'Một sản phẩm được tạo ra bởi nhiều quốc gia.', category: 'integration', label: 'Hội nhập quốc tế' },
  { id: 16, text: 'Nguồn quan trọng bị giảm làm giá tăng đột biến.', category: 'market_mechanism', label: 'Cơ chế thị trường' },
  { id: 17, text: 'Chưa đáp ứng yêu cầu an toàn nên phải tạm dừng hoạt động.', category: 'state_role', label: 'Vai trò Nhà nước' },
  { id: 18, text: 'Nhiều hình thức kinh doanh cùng cạnh tranh trực tiếp.', category: 'multi_sector', label: 'Nhiều thành phần kinh tế' },
  { id: 19, text: 'Khoảng cách giàu nghèo giữa các nhóm dần được thu hẹp.', category: 'social_justice', label: 'Công bằng xã hội' },
  { id: 20, text: 'Một chuỗi sản xuất, cung ứng trải dài qua nhiều quốc gia.', category: 'integration', label: 'Hội nhập quốc tế' },
];

const CATEGORIES = [
  { id: 'market_mechanism', name: 'Cơ chế thị trường', icon: '💹' },
  { id: 'state_role', name: 'Vai trò Nhà nước', icon: '🏛️' },
  { id: 'multi_sector', name: 'Nhiều thành phần kinh tế', icon: '🏭' },
  { id: 'social_justice', name: 'Công bằng xã hội', icon: '❤️' },
  { id: 'integration', name: 'Hội nhập quốc tế', icon: '🌍' },
];

// Room 4 absolute Z offset from origin
const ZONE_ABS_OFFSET = 233.0;

// ═══════════════════════════════════════════════════════════════════════════


// ═══════════════════════════════════════════════════════════════════════════
interface ZoneProps {
  onZoneClick: (zoneId: number) => void;
  isActive: boolean;
  language: 'vi' | 'en';
  intensity: number;
}

const ZONE1_EXHIBITS = [
  {
    id: "zone1-painting-1",
    side: "left",
    x: -8.9,
    z: -5.5, // Absolute Z = -43.0
    rotation: [0, Math.PI / 2, 0],
    titleVi: "Kinh tế cá thể, tiểu chủ",
    titleEn: "Individual & Household Economy",
    descVi: "Kinh tế cá thể, tiểu chủ. Bên cạnh các tập đoàn lớn, hàng triệu hộ kinh doanh cá thể, tiểu thương tại các chợ truyền thống và cửa hàng bán lẻ vẫn đóng vai trò là \"mạch máu\" phân phối hàng hóa len lỏi đến từng khu dân cư, giải quyết việc làm cho lượng lớn lao động tự do.",
    descEn: "Individual and small household businesses. Alongside large enterprises, millions of business households and small merchants in traditional markets and retail stores serve as vital distribution veins, providing livelihood for a vast number of workers.",
    imageUrl: "/images/room4/zone1/tro-tt-vs-sieu-thi.jpg"
  },
  {
    id: "zone1-painting-2",
    side: "left",
    x: -8.9,
    z: 5.5, // Absolute Z = -32.0
    rotation: [0, Math.PI / 2, 0],
    titleVi: "Kinh tế tập thể (Hợp tác xã)",
    titleEn: "Collective Economy (Cooperatives)",
    descVi: "Kinh tế tập thể (Hợp tác xã). Mô hình hợp tác xã kiểu mới không còn gò bó như thời bao cấp. Các hộ nông dân hiện nay liên kết lại để ứng dụng công nghệ cao, đạt chuẩn VietGAP/GlobalGAP, tạo ra sản lượng lớn và tăng sức mạnh đàm phán với các hệ thống siêu thị.",
    descEn: "Collective economy (Cooperatives). Modern cooperative models have evolved past the rigid subsidies era. Farming households now unite to deploy high-tech cultivation, meeting VietGAP/GlobalGAP standards, yielding mass volume, and boosting bargaining power with major supermarket chains.",
    imageUrl: "/images/room4/zone1/rau.jpg"
  },
  {
    id: "zone1-painting-3",
    side: "right",
    x: 8.9,
    z: -5.5, // Absolute Z = -43.0
    rotation: [0, -Math.PI / 2, 0],
    titleVi: "Khởi nghiệp (Startups)",
    titleEn: "Innovative Startups (Startups)",
    descVi: "Khởi nghiệp đổi mới sáng tạo (Startups). Sự vươn lên của các \"kỳ lân\" công nghệ (như MoMo, VNG) minh chứng cho một môi trường kinh tế năng động, nơi trí tuệ và sự sáng tạo của khối kinh tế tư nhân được khuyến khích phát triển mạnh mẽ.",
    descEn: "Innovative Startups. The rise of home-grown technology unicorns (such as MoMo, VNG) exemplifies a dynamic economic climate where intellectual property and private sector creativity are highly fostered and motivated to flourish.",
    imageUrl: "/images/room4/zone1/coworking.png"
  },
  {
    id: "zone1-painting-4",
    side: "right",
    x: 8.9,
    z: 5.5, // Absolute Z = -32.0
    rotation: [0, -Math.PI / 2, 0],
    titleVi: "Sự liên kết chuỗi cung ứng",
    titleEn: "Supply Chain Linkage",
    descVi: "Sự liên kết chuỗi cung ứng. Các thành phần kinh tế không hoạt động độc lập mà đan xen lẫn nhau. Các doanh nghiệp tư nhân vừa và nhỏ của Việt Nam đang ngày càng tham gia sâu hơn vào chuỗi cung ứng phụ trợ cho các tập đoàn FDI (như sản xuất linh kiện cho Samsung, Toyota).",
    descEn: "Supply chain linkage. Economic sectors do not function in isolation but are deeply interwoven. Vietnam's small and medium private enterprises are increasingly integrating into the supporting supply chains of multinational FDI corporations (such as component manufacturing for Samsung, Toyota).",
    imageUrl: "/images/room4/zone1/fdi-lao-dong.jpg"
  }
];

const Zone1MultiSector: React.FC<ZoneProps> = ({ onZoneClick, isActive, language, intensity }) => {
  const { setSelectedExhibit } = useMuseum();
  const logo1Ref = useRef<THREE.Group>(null);
  const logo2Ref = useRef<THREE.Group>(null);
  const logo3Ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const bounce = Math.sin(time * 2) * 0.08;

    if (logo1Ref.current) {
      logo1Ref.current.position.y = 1.25 + bounce;
      logo1Ref.current.rotation.y = time * 0.6;
    }
    if (logo2Ref.current) {
      logo2Ref.current.position.y = 1.25 + bounce;
      logo2Ref.current.rotation.y = time * 0.6;
    }
    if (logo3Ref.current) {
      logo3Ref.current.position.y = 1.25 + bounce;
      logo3Ref.current.rotation.y = time * 0.6;
    }
  });

  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    document.body.style.cursor = 'auto';
  };

  const handlePaintingClick = (e: any, item: typeof ZONE1_EXHIBITS[0]) => {
    e.stopPropagation();
    onZoneClick(1);
    setSelectedExhibit({
      id: item.id,
      gallery_id: "gallery-market-economy",
      title: { vi: item.titleVi, en: item.titleEn },
      author: { vi: "Tranh trưng bày", en: "Exhibit Painting" },
      description: { vi: item.descVi, en: item.descEn },
      model_3d_url: "",
      thumbnail_url: item.imageUrl,
      coordinate_x: item.x,
      coordinate_y: 2.3,
      coordinate_z: -37.5 + item.z,
      rotation_x: 0,
      rotation_y: item.rotation[1],
      rotation_z: 0,
      scale_x: 1,
      scale_y: 1,
      scale_z: 1
    });
  };

  const isVi = language === 'vi';

  return (
    <group position={[0, 0, -37.5]}>
      {/* ── Pedestal 1: Viettel (State-owned) ── */}
      <group
        position={[-2.2, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onZoneClick(1);
          setSelectedExhibit({
            id: 'zone1-viettel',
            gallery_id: 'gallery-market-economy',
            title: { vi: "Kinh tế Nhà nước (Viettel)", en: "State Sector (Viettel)" },
            author: { vi: "Mô hình 3D", en: "3D Model" },
            description: {
              vi: "Đại diện cho Kinh tế Nhà nước, giữ vai trò chủ đạo, dẫn dắt phát triển hạ tầng số và công nghệ cao thương mại hóa.",
              en: "Represents the State-owned Economy Sector, playing a leading role in driving high-tech and digital infrastructure."
            },
            model_3d_url: "",
            thumbnail_url: "/images/room4/viettel.jpg",
            coordinate_x: -2.2,
            coordinate_y: 1.0,
            coordinate_z: -37.5,
            rotation_x: 0,
            rotation_y: 0,
            rotation_z: 0,
            scale_x: 1,
            scale_y: 1,
            scale_z: 1
          });
        }}
      >
        {/* Glow ring */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <ringGeometry args={[0.5, 0.6, 32]} />
          <meshBasicMaterial color="#ef4444" transparent opacity={0.2 + intensity * 0.8} />
        </mesh>
        {/* Base Cylinder */}
        <mesh
          position={[0, 0.5, 0]}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          <cylinderGeometry args={[0.4, 0.45, 1.0, 16]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, 1.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.35, 0.4, 16]} />
          <meshBasicMaterial color="#ef4444" transparent opacity={intensity} />
        </mesh>

        {/* Logo Viettel (Orange globe inside green torus ring) */}
        <group ref={logo1Ref} position={[0, 1.25, 0]}>
          {/* Inner Globe */}
          <mesh>
            <sphereGeometry args={[0.16, 16, 16]} />
            <meshStandardMaterial color="#ea580c" emissive="#ea580c" emissiveIntensity={0.5 * intensity} roughness={0.1} />
          </mesh>
          {/* Outer Torus Ring */}
          <mesh rotation={[Math.PI / 4, Math.PI / 4, 0]}>
            <torusGeometry args={[0.22, 0.02, 8, 24]} />
            <meshStandardMaterial color="#16a34a" emissive="#16a34a" emissiveIntensity={0.5 * intensity} roughness={0.1} />
          </mesh>
        </group>

        {/* HTML Label */}
        <Html position={[0, 1.7, 0]} center distanceFactor={6} className="pointer-events-none select-none">
          <div className="bg-slate-950/85 border border-red-500/30 px-2 py-1 rounded text-center whitespace-nowrap shadow-md backdrop-blur-sm">
            <p className="text-[8px] font-black text-red-400 uppercase tracking-wider">Viettel</p>
            <p className="text-[6.5px] text-slate-300 font-bold">{isVi ? 'Kinh tế Nhà nước' : 'State Sector'}</p>
          </div>
        </Html>
      </group>

      {/* ── Pedestal 2: VinFast (Private) ── */}
      <group
        position={[0, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onZoneClick(1);
          setSelectedExhibit({
            id: 'zone1-vinfast',
            gallery_id: 'gallery-market-economy',
            title: { vi: "Kinh tế Tư nhân (VinFast)", en: "Private Sector (VinFast)" },
            author: { vi: "Mô hình 3D", en: "3D Model" },
            description: {
              vi: "Đại diện cho Kinh tế Tư nhân, động lực quan trọng của nền kinh tế, tiên phong sản xuất xe điện thông minh toàn cầu.",
              en: "Represents the Private Sector, a key engine of growth, pioneering smart electric vehicles globally."
            },
            model_3d_url: "",
            thumbnail_url: "/images/room4/vinfast.jpg",
            coordinate_x: 0,
            coordinate_y: 1.0,
            coordinate_z: -37.5,
            rotation_x: 0,
            rotation_y: 0,
            rotation_z: 0,
            scale_x: 1,
            scale_y: 1,
            scale_z: 1
          });
        }}
      >
        {/* Glow ring */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <ringGeometry args={[0.5, 0.6, 32]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.2 + intensity * 0.8} />
        </mesh>
        {/* Base Cylinder */}
        <mesh
          position={[0, 0.5, 0]}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          <cylinderGeometry args={[0.4, 0.45, 1.0, 16]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, 1.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.35, 0.4, 16]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={intensity} />
        </mesh>

        {/* Logo VinFast (Glowing V shape) */}
        <group ref={logo2Ref} position={[0, 1.25, 0]}>
          {/* Left Wing */}
          <mesh position={[-0.08, 0.05, 0]} rotation={[0, 0, -Math.PI / 6]}>
            <cylinderGeometry args={[0.025, 0.025, 0.24, 8]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8 * intensity} roughness={0.1} />
          </mesh>
          {/* Right Wing */}
          <mesh position={[0.08, 0.05, 0]} rotation={[0, 0, Math.PI / 6]}>
            <cylinderGeometry args={[0.025, 0.025, 0.24, 8]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8 * intensity} roughness={0.1} />
          </mesh>
        </group>

        {/* HTML Label */}
        <Html position={[0, 1.7, 0]} center distanceFactor={6} className="pointer-events-none select-none">
          <div className="bg-slate-950/85 border border-sky-500/30 px-2 py-1 rounded text-center whitespace-nowrap shadow-md backdrop-blur-sm">
            <p className="text-[8px] font-black text-sky-400 uppercase tracking-wider">VinFast</p>
            <p className="text-[6.5px] text-slate-300 font-bold">{isVi ? 'Kinh tế Tư nhân' : 'Private Sector'}</p>
          </div>
        </Html>
      </group>

      {/* ── Pedestal 3: Samsung (FDI) ── */}
      <group
        position={[2.2, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onZoneClick(1);
          setSelectedExhibit({
            id: 'zone1-samsung',
            gallery_id: 'gallery-market-economy',
            title: { vi: "Kinh tế có vốn FDI (Samsung)", en: "Foreign FDI Sector (Samsung)" },
            author: { vi: "Mô hình 3D", en: "3D Model" },
            description: {
              vi: "Đại diện cho Kinh tế có vốn đầu tư nước ngoài (FDI), đóng vai trò quan trọng trong sản xuất, xuất khẩu và tạo việc làm công nghệ cao.",
              en: "Represents the Foreign-Invested Sector (FDI), playing a major role in manufacturing, exports, and high-tech jobs."
            },
            model_3d_url: "",
            thumbnail_url: "/images/room4/samsung.jpg",
            coordinate_x: 2.2,
            coordinate_y: 1.0,
            coordinate_z: -37.5,
            rotation_x: 0,
            rotation_y: 0,
            rotation_z: 0,
            scale_x: 1,
            scale_y: 1,
            scale_z: 1
          });
        }}
      >
        {/* Glow ring */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <ringGeometry args={[0.5, 0.6, 32]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.2 + intensity * 0.8} />
        </mesh>
        {/* Base Cylinder */}
        <mesh
          position={[0, 0.5, 0]}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          <cylinderGeometry args={[0.4, 0.45, 1.0, 16]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, 1.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.35, 0.4, 16]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={intensity} />
        </mesh>

        {/* Logo Samsung (Glowing blue oval) */}
        <group ref={logo3Ref} position={[0, 1.25, 0]} scale={[1.3, 0.7, 0.4]} rotation={[Math.PI / 8, 0, -Math.PI / 12]}>
          <mesh>
            <sphereGeometry args={[0.18, 24, 24]} />
            <meshStandardMaterial color="#1d4ed8" emissive="#1d4ed8" emissiveIntensity={0.6 * intensity} roughness={0.1} />
          </mesh>
        </group>

        {/* HTML Label */}
        <Html position={[0, 1.7, 0]} center distanceFactor={6} className="pointer-events-none select-none">
          <div className="bg-slate-950/85 border border-blue-500/30 px-2 py-1 rounded text-center whitespace-nowrap shadow-md backdrop-blur-sm">
            <p className="text-[8px] font-black text-blue-400 uppercase tracking-wider">Samsung</p>
            <p className="text-[6.5px] text-slate-300 font-bold">{isVi ? 'Kinh tế FDI' : 'FDI Sector'}</p>
          </div>
        </Html>
      </group>

      {/* ── Wall Paintings for Zone 1 ── */}
      {ZONE1_EXHIBITS.map((item, idx) => (
        <group
          key={item.id}
          position={[item.x, 2.3, item.z]}
          rotation={item.rotation as any}
          onClick={(e) => handlePaintingClick(e, item)}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          {/* Wood Frame */}
          <mesh>
            <boxGeometry args={[3.2, 2.2, 0.1]} />
            <meshStandardMaterial color="#b45309" metalness={0.6} roughness={0.3} />
          </mesh>
          <PaintingMesh url={item.imageUrl} />

          {/* Description Plate */}
          <mesh position={[0, -1.4, 0.02]}>
            <planeGeometry args={[1.8, 0.75]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.4} metalness={0.1} />
          </mesh>
          <Html position={[0, -1.4, 0.03]} center distanceFactor={8}>
            <div className="w-[160px] bg-slate-50/90 border border-slate-300 p-2 rounded shadow-md select-none text-center">
              <h4 className="text-[9px] font-extrabold text-slate-800 uppercase tracking-wide mb-1 leading-tight">
                {language === 'vi' ? item.titleVi : item.titleEn}
              </h4>
              <p className="text-[6.5px] leading-normal text-slate-600 font-medium">
                {language === 'vi' ? item.descVi : item.descEn}
              </p>
            </div>
          </Html>
        </group>
      ))}
    </group>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// ZONE 2 — Cơ Chế Thị Trường (Balance Scale + Click-to-tilt items)
// ═══════════════════════════════════════════════════════════════════════════

const ZONE2_EXHIBITS = [
  {
    id: "zone2-painting-1",
    side: "left",
    x: -8.9,
    z: -5.5, // Absolute Z = -18.0
    rotation: [0, Math.PI / 2, 0],
    titleVi: "Thị trường vốn minh bạch",
    titleEn: "Transparent Capital Market",
    descVi: "Thị trường vốn minh bạch. Sự hình thành và phát triển của Thị trường Chứng khoán Việt Nam (VN-Index) là minh chứng rõ nét cho việc huy động vốn theo nguyên tắc thị trường, nơi các nhà đầu tư tự do mua bán cổ phần dựa trên kỳ vọng và năng lực của doanh nghiệp.",
    descEn: "Transparent capital market. The establishment and development of the Vietnam Stock Market (VN-Index) is a clear demonstration of market-based capital mobilization, where investors trade shares freely based on corporate performance and expectations.",
    imageUrl: "/images/room4/zone2/zone2-1.jpg"
  },
  {
    id: "zone2-painting-2",
    side: "left",
    x: -8.9,
    z: 5.5, // Absolute Z = -7.0
    rotation: [0, Math.PI / 2, 0],
    titleVi: "Cạnh tranh lành mạnh",
    titleEn: "Fair Market Competition",
    descVi: "Cạnh tranh mang lại lợi ích cho người tiêu dùng. Trên thị trường tự do, các doanh nghiệp phải liên tục tung ra các chương trình khuyến mãi, cải thiện dịch vụ giao hàng và chăm sóc khách hàng để giành thị phần. Sự cạnh tranh khốc liệt này giúp người tiêu dùng được hưởng lợi về giá và chất lượng.",
    descEn: "Competition benefits consumers. In a free market, businesses constantly launch promotions, improve deliveries, and elevate customer care to win market share. This fierce rivalry ensures consumers receive better prices and higher quality.",
    imageUrl: "/images/room4/zone2/zone2-2.png"
  },
  {
    id: "zone2-painting-3",
    side: "right",
    x: 8.9,
    z: -5.5, // Absolute Z = -18.0
    rotation: [0, -Math.PI / 2, 0],
    titleVi: "Liên thông giá trị toàn cầu",
    titleEn: "Global Value Integration",
    descVi: "Sự liên thông với thị trường thế giới. Giá xăng dầu tại Việt Nam được điều chỉnh định kỳ dựa trên biến động của giá dầu thô toàn cầu. Điều này phản ánh rõ sự tôn trọng quy luật giá trị và quy luật cung cầu, thay vì Nhà nước bao cấp bù lỗ như trước đây.",
    descEn: "Integration with global markets. Gasoline prices in Vietnam are adjusted periodically based on global crude oil fluctuations. This reflects clear respect for the law of value and supply/demand, replacing historical state subsidy systems.",
    imageUrl: "/images/room4/zone2/zone2-3.jpg"
  },
  {
    id: "zone2-painting-4",
    side: "right",
    x: 8.9,
    z: 5.5, // Absolute Z = -7.0
    rotation: [0, -Math.PI / 2, 0],
    titleVi: "Phá vỡ thế độc quyền",
    titleEn: "Breaking Telecom Monopoly",
    descVi: "Phá vỡ thế độc quyền. Lĩnh vực viễn thông là ví dụ điển hình về việc mở cửa thị trường. Sự cạnh tranh giữa Viettel, VNPT, MobiFone... đã làm giá cước viễn thông và Internet tại Việt Nam giảm sâu, trở thành một trong những quốc gia có chi phí tiếp cận Internet rẻ nhất thế giới.",
    descEn: "Breaking monopoly. Telecommunications is a prime example of market opening. Competition among Viettel, VNPT, MobiFone, etc., has driven telecom and internet fees down, making Vietnam one of the cheapest countries globally for internet access.",
    imageUrl: "/images/room4/zone2/zone2-4.jpg"
  }
];

const Zone2BalanceScale: React.FC<ZoneProps> = ({ onZoneClick, isActive, language, intensity }) => {
  const { setSelectedExhibit } = useMuseum();
  const scaleRef = useRef<THREE.Group>(null);
  const leftPanRef = useRef<THREE.Group>(null);
  const rightPanRef = useRef<THREE.Group>(null);
  const crossbarRef = useRef<THREE.Mesh>(null);

  const goldRef = useRef<THREE.Mesh>(null);
  const coffeeRef = useRef<THREE.Mesh>(null);
  const durianRef = useRef<THREE.Mesh>(null);

  const [prices, setPrices] = useState({ coffee: 70, gold: 85, durian: 120 });

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Tilt oscillates when player is close (intensity > 0)
    const maxTilt = 0.28; // radians (about 16 degrees)
    const tilt = Math.sin(time * 1.8) * maxTilt * intensity;

    if (crossbarRef.current) {
      crossbarRef.current.rotation.z = tilt;
    }

    const halfLength = 1.3;
    const cosT = Math.cos(tilt);
    const sinT = Math.sin(tilt);

    // Left pan position (X negative, Y moves down when tilt is positive)
    const leftX = -halfLength * cosT;
    const leftY = 1.5 - halfLength * sinT;
    if (leftPanRef.current) {
      leftPanRef.current.position.set(leftX, leftY - 0.5, 0);
    }

    // Right pan position (X positive, Y moves up when tilt is positive)
    const rightX = halfLength * cosT;
    const rightY = 1.5 + halfLength * sinT;
    if (rightPanRef.current) {
      rightPanRef.current.position.set(rightX, rightY - 0.5, 0);
    }

    // Rotate and float items
    if (coffeeRef.current) {
      coffeeRef.current.rotation.y = time * 0.8;
      coffeeRef.current.position.y = 1.7 + Math.sin(time * 2.5) * 0.1 * intensity;
    }
    if (goldRef.current) {
      goldRef.current.rotation.y = time * 0.5;
      goldRef.current.rotation.x = time * 0.3;
      goldRef.current.position.y = 2.15 + Math.sin(time * 2.1) * 0.1 * intensity;
    }
    if (durianRef.current) {
      durianRef.current.rotation.y = time * 0.7;
      durianRef.current.position.y = 1.7 + Math.sin(time * 2.7) * 0.1 * intensity;
    }

    // Dynamic prices
    if (intensity > 0.05) {
      const pCoffee = Math.round(70 + Math.sin(time * 2.5) * 15 * intensity);
      const pGold = (85.2 + Math.sin(time * 2.1) * 4.8 * intensity).toFixed(1);
      const pDurian = Math.round(120 + Math.sin(time * 2.7) * 35 * intensity);

      // Update state less frequently
      if (Math.round(time * 10) % 5 === 0) {
        setPrices({
          coffee: pCoffee,
          gold: parseFloat(pGold),
          durian: pDurian
        });
      }
    }
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    onZoneClick(2);
    setSelectedExhibit({
      id: 'zone2-balance-scale',
      gallery_id: 'gallery-market-economy',
      title: { vi: "Cơ chế Thị trường tự do", en: "Free Market Mechanism" },
      author: { vi: "Mô hình 3D", en: "3D Model" },
      description: {
        vi: "Giá cả hàng hóa và dịch vụ vận hành linh hoạt theo quan hệ cung - cầu và cạnh tranh lành mạnh trên thị trường dưới sự điều tiết vĩ mô.",
        en: "Prices of goods and services dynamically fluctuate based on market supply, demand, and fair competition."
      },
      model_3d_url: "",
      thumbnail_url: "/images/room4/cho-truyen-thong.jpg",
      coordinate_x: 0,
      coordinate_y: 1.0,
      coordinate_z: -12.5,
      rotation_x: 0,
      rotation_y: 0,
      rotation_z: 0,
      scale_x: 1,
      scale_y: 1,
      scale_z: 1
    });
  };

  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    document.body.style.cursor = 'auto';
  };

  const handlePaintingClick = (e: any, item: typeof ZONE2_EXHIBITS[0]) => {
    e.stopPropagation();
    onZoneClick(2);
    setSelectedExhibit({
      id: item.id,
      gallery_id: "gallery-market-economy",
      title: { vi: item.titleVi, en: item.titleEn },
      author: { vi: "Tranh trưng bày", en: "Exhibit Painting" },
      description: { vi: item.descVi, en: item.descEn },
      model_3d_url: "",
      thumbnail_url: item.imageUrl,
      coordinate_x: item.x,
      coordinate_y: 2.3,
      coordinate_z: -12.5 + item.z,
      rotation_x: 0,
      rotation_y: item.rotation[1],
      rotation_z: 0,
      scale_x: 1,
      scale_y: 1,
      scale_z: 1
    });
  };

  const isVi = language === 'vi';

  return (
    <group position={[0, 0, -12.5]} onClick={handleClick}>
      {/* Glow ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[1.5, 1.7, 32]} />
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.15 + intensity * 0.65} />
      </mesh>

      {/* ── Balance Scale 3D ── */}
      <group position={[0, 0, 0]}>
        {/* Scale Base */}
        <mesh position={[0, 0.05, 0]}>
          <boxGeometry args={[1.2, 0.1, 0.6]} />
          <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Scale Pillar */}
        <mesh position={[0, 0.8, 0]}>
          <cylinderGeometry args={[0.07, 0.09, 1.5, 16]} />
          <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Pivot Cap */}
        <mesh position={[0, 1.55, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.22, 16]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Tilting Crossbar */}
        <mesh ref={crossbarRef} position={[0, 1.55, 0]}>
          <boxGeometry args={[2.7, 0.06, 0.06]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Left Pan (Hanging) */}
        <group ref={leftPanRef}>
          {/* Hanger wires */}
          <mesh position={[0, 0.28, 0]} rotation={[0, 0, 0.25]}>
            <cylinderGeometry args={[0.008, 0.008, 0.55, 8]} />
            <meshStandardMaterial color="#94a3b8" />
          </mesh>
          {/* Pan Plate */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.36, 0.36, 0.02, 16]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.85} roughness={0.15} />
          </mesh>
        </group>

        {/* Right Pan (Hanging) */}
        <group ref={rightPanRef}>
          {/* Hanger wires */}
          <mesh position={[0, 0.28, 0]} rotation={[0, 0, -0.25]}>
            <cylinderGeometry args={[0.008, 0.008, 0.55, 8]} />
            <meshStandardMaterial color="#94a3b8" />
          </mesh>
          {/* Pan Plate */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.36, 0.36, 0.02, 16]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.85} roughness={0.15} />
          </mesh>
        </group>
      </group>

      {/* ── Floating items with Price Tags ── */}
      {/* 1. Coffee Bean (Left Side) */}
      <group position={[-2.2, 0, 0]}>
        <mesh
          ref={coffeeRef}
          scale={[1.3, 0.8, 0.8]}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshStandardMaterial color="#7c2d12" roughness={0.6} />
        </mesh>
        <Html position={[0, 2.1, 0]} center distanceFactor={6} className="pointer-events-none select-none">
          <div className="bg-slate-950/85 border border-amber-600/30 px-2 py-1 rounded text-center whitespace-nowrap shadow-md backdrop-blur-sm">
            <p className="text-[8px] font-black text-amber-500 uppercase tracking-wider">{isVi ? 'Cà phê' : 'Coffee'}</p>
            <p className="text-[7px] text-slate-200 font-bold">{prices.coffee.toLocaleString()}k {isVi ? 'đ/kg' : 'VND/kg'}</p>
          </div>
        </Html>
      </group>

      {/* 2. Gold Bar (Center Top) */}
      <group position={[0, 0, -0.5]}>
        <mesh
          ref={goldRef}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          <boxGeometry args={[0.3, 0.12, 0.15]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.9} roughness={0.1} />
        </mesh>
        <Html position={[0, 2.55, 0]} center distanceFactor={6} className="pointer-events-none select-none">
          <div className="bg-slate-950/85 border border-yellow-500/30 px-2 py-1 rounded text-center whitespace-nowrap shadow-md backdrop-blur-sm">
            <p className="text-[8px] font-black text-yellow-400 uppercase tracking-wider">{isVi ? 'Thỏi vàng' : 'Gold Bar'}</p>
            <p className="text-[7px] text-slate-200 font-bold">{prices.gold} {isVi ? 'tr/lượng' : 'M VND/tael'}</p>
          </div>
        </Html>
      </group>

      {/* 3. Durian (Right Side) */}
      <group position={[2.2, 0, 0]}>
        <mesh
          ref={durianRef}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          <dodecahedronGeometry args={[0.18, 1]} />
          <meshStandardMaterial color="#84cc16" roughness={0.7} bumpScale={0.1} />
        </mesh>
        <Html position={[0, 2.1, 0]} center distanceFactor={6} className="pointer-events-none select-none">
          <div className="bg-slate-950/85 border border-lime-500/30 px-2 py-1 rounded text-center whitespace-nowrap shadow-md backdrop-blur-sm">
            <p className="text-[8px] font-black text-lime-400 uppercase tracking-wider">{isVi ? 'Sầu riêng' : 'Durian'}</p>
            <p className="text-[7px] text-slate-200 font-bold">{prices.durian.toLocaleString()}k {isVi ? 'đ/kg' : 'VND/kg'}</p>
          </div>
        </Html>
      </group>

      {/* ── Wall Paintings for Zone 2 ── */}
      {ZONE2_EXHIBITS.map((item, idx) => (
        <group
          key={item.id}
          position={[item.x, 2.3, item.z]}
          rotation={item.rotation as any}
          onClick={(e) => handlePaintingClick(e, item)}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          {/* Wood Frame */}
          <mesh>
            <boxGeometry args={[3.2, 2.2, 0.1]} />
            <meshStandardMaterial color="#b45309" metalness={0.6} roughness={0.3} />
          </mesh>
          <PaintingMesh url={item.imageUrl} />

          {/* Description Plate */}
          <mesh position={[0, -1.4, 0.02]}>
            <planeGeometry args={[1.8, 0.75]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.4} metalness={0.1} />
          </mesh>
          <Html position={[0, -1.4, 0.03]} center distanceFactor={8}>
            <div className="w-[160px] bg-slate-50/90 border border-slate-300 p-2 rounded shadow-md select-none text-center">
              <h4 className="text-[9px] font-extrabold text-slate-800 uppercase tracking-wide mb-1 leading-tight">
                {language === 'vi' ? item.titleVi : item.titleEn}
              </h4>
              <p className="text-[6.5px] leading-normal text-slate-600 font-medium">
                {language === 'vi' ? item.descVi : item.descEn}
              </p>
            </div>
          </Html>
        </group>
      ))}
    </group>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// ZONE 3 — Nhà Nước Quản Lý (Diorama + Force Field Dome)
// ═══════════════════════════════════════════════════════════════════════════
const ZONE3_EXHIBITS = [
  {
    id: "zone3-painting-1",
    side: "left",
    x: -8.9,
    z: -5.5, // Absolute Z = 7.0
    rotation: [0, Math.PI / 2, 0],
    titleVi: "Ổn định kinh tế vĩ mô",
    titleEn: "Macroeconomic Stability",
    descVi: "Ổn định kinh tế vĩ mô. Bằng các công cụ chính sách tiền tệ (điều chỉnh lãi suất, tỷ giá), Ngân hàng Nhà nước đóng vai trò \"nhạc trưởng\" trong việc kiểm soát lạm phát, giữ giá trị đồng tiền và bảo đảm an toàn cho toàn bộ hệ thống ngân hàng thương mại.",
    descEn: "Monetary policy tools. The State Bank of Vietnam controls inflation, maintains currency value, and secures the commercial banking system.",
    imageUrl: "/images/room4/zone3/zone3-1.jpg"
  },
  {
    id: "zone3-painting-2",
    side: "left",
    x: -8.9,
    z: 5.5, // Absolute Z = 18.0
    rotation: [0, Math.PI / 2, 0],
    titleVi: "Dự trữ quốc gia & Bình ổn giá",
    titleEn: "National Reserves & Price Stabilization",
    descVi: "Dự trữ quốc gia và Bình ổn giá. Khi thị trường gặp cú sốc (do thiên tai, dịch bệnh, đứt gãy chuỗi cung ứng), Nhà nước sẽ tung hàng hóa từ các kho dự trữ (như gạo, xăng dầu, vật tư y tế) để bình ổn giá cả, không để xảy ra tình trạng đầu cơ, găm hàng.",
    descEn: "Stabilizing commodities. During market shocks, the State releases goods from reserves (rice, fuel, medical supplies) to prevent speculation.",
    imageUrl: "/images/room4/zone3/zone3-2.jpg"
  },
  {
    id: "zone3-painting-3",
    side: "right",
    x: 8.9,
    z: -5.5, // Absolute Z = 7.0
    rotation: [0, -Math.PI / 2, 0],
    titleVi: "Chính phủ kiến tạo",
    titleEn: "Enabling Government",
    descVi: "Hội nghị đối thoại giữa Chính phủ và cộng đồng doanh nghiệp. Thay vì can thiệp trực tiếp vào kinh doanh, Nhà nước liên tục cải cách thủ tục hành chính, cắt giảm giấy phép con, hỗ trợ miễn giảm thuế và khoanh nợ trong những giai đoạn khó khăn (như đại dịch COVID-19) để tạo môi trường kinh doanh thuận lợi nhất.",
    descEn: "Dialogue and reforms. The State simplifies procedures, cuts sub-licenses, and reschedules debt to foster a supportive business climate.",
    imageUrl: "/images/room4/zone3/zone3-3.jpg"
  },
  {
    id: "zone3-painting-4",
    side: "right",
    x: 8.9,
    z: 5.5, // Absolute Z = 18.0
    rotation: [0, -Math.PI / 2, 0],
    titleVi: "Quy hoạch chiến lược dài hạn",
    titleEn: "Long-term Strategic Planning",
    descVi: "Bản đồ quy hoạch vùng Đồng bằng sông Cửu Long thích ứng với biến đổi khí hậu. Thị trường thường chỉ nhìn vào lợi nhuận ngắn hạn. Vì vậy, Nhà nước phải đóng vai trò lập quy hoạch dài hạn, phân bổ nguồn lực quốc gia cho các vùng kinh tế trọng điểm, đồng thời đầu tư vào các dự án chống biến đổi khí hậu để bảo đảm phát triển bền vững.",
    descEn: "Long-term planning. The State guides national resources and climate adaptation investments for sustainable future development.",
    imageUrl: "/images/room4/zone3/zone3-4.jpg"
  }
];

const Zone3StateRegulation: React.FC<ZoneProps> = ({ onZoneClick, isActive, language, intensity }) => {
  const { setSelectedExhibit } = useMuseum();
  const car1Ref = useRef<THREE.Mesh>(null);
  const car2Ref = useRef<THREE.Mesh>(null);

  const turbine1Ref = useRef<THREE.Group>(null);
  const turbine2Ref = useRef<THREE.Group>(null);

  const book1Ref = useRef<THREE.Group>(null);
  const book2Ref = useRef<THREE.Group>(null);
  const book3Ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Animate cars on the expressway
    const carSpeed1 = 0.5;
    const carSpeed2 = 0.35;

    if (car1Ref.current) {
      car1Ref.current.position.x = -1.1 + ((time * carSpeed1) % 2.2);
    }
    if (car2Ref.current) {
      car2Ref.current.position.x = 1.1 - ((time * carSpeed2) % 2.2);
    }

    // Spin wind turbine blades
    if (turbine1Ref.current) {
      turbine1Ref.current.rotation.z = time * 3.5;
    }
    if (turbine2Ref.current) {
      turbine2Ref.current.rotation.z = time * 2.8;
    }

    // Law books floating/swaying
    const floatOffset1 = Math.sin(time * 1.5) * 0.05;
    const floatOffset2 = Math.sin(time * 1.2 + 1) * 0.05;
    const floatOffset3 = Math.sin(time * 1.7 + 2) * 0.06;

    if (book1Ref.current) {
      book1Ref.current.position.y = 1.75 + floatOffset1;
      book1Ref.current.rotation.y = time * 0.3;
    }
    if (book2Ref.current) {
      book2Ref.current.position.y = 1.75 + floatOffset2;
      book2Ref.current.rotation.y = -time * 0.25;
    }
    if (book3Ref.current) {
      book3Ref.current.position.y = 2.1 + floatOffset3;
      book3Ref.current.rotation.x = Math.sin(time) * 0.1;
    }
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    onZoneClick(3);
    setSelectedExhibit({
      id: 'zone3-state-regulation',
      gallery_id: 'gallery-market-economy',
      title: { vi: "Vai trò quản lý vĩ mô của Nhà nước", en: "Macro-regulatory Role of the State" },
      author: { vi: "Mô hình 3D", en: "3D Model" },
      description: {
        vi: "Nhà nước kiến tạo, ban hành luật pháp (Luật Doanh nghiệp, Luật Thuế) và đầu tư hạ tầng thiết yếu (EVN, Cao tốc) để định hướng nền kinh tế.",
        en: "The State regulates the economy via legal frameworks and invests in essential infrastructure (electricity, highways) to guide development."
      },
      model_3d_url: "",
      thumbnail_url: "/images/room4/cao-toc-bac-nam.jpg",
      coordinate_x: 0,
      coordinate_y: 1.0,
      coordinate_z: 12.5,
      rotation_x: 0,
      rotation_y: 0,
      rotation_z: 0,
      scale_x: 1,
      scale_y: 1,
      scale_z: 1
    });
  };

  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    document.body.style.cursor = 'auto';
  };

  const handlePaintingClick = (e: any, item: typeof ZONE3_EXHIBITS[0]) => {
    e.stopPropagation();
    onZoneClick(3);
    setSelectedExhibit({
      id: item.id,
      gallery_id: "gallery-market-economy",
      title: { vi: item.titleVi, en: item.titleEn },
      author: { vi: "Tranh trưng bày", en: "Exhibit Painting" },
      description: { vi: item.descVi, en: item.descEn },
      model_3d_url: "",
      thumbnail_url: item.imageUrl,
      coordinate_x: item.x,
      coordinate_y: 2.3,
      coordinate_z: 12.5 + item.z,
      rotation_x: 0,
      rotation_y: item.rotation[1],
      rotation_z: 0,
      scale_x: 1,
      scale_y: 1,
      scale_z: 1
    });
  };

  const isVi = language === 'vi';

  return (
    <group position={[0, 0, 12.5]} onClick={handleClick}>
      {/* Glow ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[1.5, 1.7, 32]} />
        <meshBasicMaterial color="#06b6d4" transparent opacity={0.15 + intensity * 0.65} />
      </mesh>

      {/* ── Diorama Base Table ── */}
      <mesh position={[0, 0.45, 0]} onPointerOver={handlePointerOver} onPointerOut={handlePointerOut}>
        <cylinderGeometry args={[1.2, 1.25, 0.9, 32]} />
        <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.5} />
      </mesh>

      {/* ── Sa Bàn (Diorama Elements) ── */}
      <group position={[0, 0.9, 0]}>
        {/* Terrain Base (Green grass field) */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
          <planeGeometry args={[2.2, 2.2]} />
          <meshStandardMaterial color="#15803d" roughness={0.9} />
        </mesh>

        {/* Expressway (Cao tốc Bắc - Nam) */}
        <group position={[0, 0.01, 0]}>
          {/* Roadbed */}
          <mesh>
            <boxGeometry args={[2.2, 0.01, 0.3]} />
            <meshStandardMaterial color="#1e293b" roughness={0.8} />
          </mesh>
          {/* Central Divider (Yellow line) */}
          <mesh position={[0, 0.008, 0]}>
            <boxGeometry args={[2.2, 0.008, 0.015]} />
            <meshBasicMaterial color="#eab308" />
          </mesh>

          {/* Moving Cars */}
          <mesh ref={car1Ref} position={[0, 0.02, -0.07]}>
            <boxGeometry args={[0.07, 0.04, 0.04]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
          <mesh ref={car2Ref} position={[0, 0.02, 0.07]}>
            <boxGeometry args={[0.07, 0.04, 0.04]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
        </group>

        {/* Wind Turbine 1 (EVN Power / Renewable energy) */}
        <group position={[-0.5, 0, -0.5]}>
          {/* Pylon */}
          <mesh position={[0, 0.25, 0]}>
            <cylinderGeometry args={[0.01, 0.025, 0.5, 8]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.5} />
          </mesh>
          {/* Generator hub */}
          <mesh position={[0, 0.5, 0]} rotation={[0, Math.PI / 4, 0]}>
            <boxGeometry args={[0.04, 0.04, 0.07]} />
            <meshStandardMaterial color="#cbd5e1" />
          </mesh>
          {/* Rotating blades */}
          <group ref={turbine1Ref} position={[0, 0.5, 0.04]}>
            {/* Blade 1 */}
            <mesh position={[0, 0.12, 0]}>
              <boxGeometry args={[0.015, 0.24, 0.005]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            {/* Blade 2 */}
            <mesh position={[-0.104, -0.06, 0]} rotation={[0, 0, Math.PI * 2 / 3]}>
              <boxGeometry args={[0.015, 0.24, 0.005]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            {/* Blade 3 */}
            <mesh position={[0.104, -0.06, 0]} rotation={[0, 0, -Math.PI * 2 / 3]}>
              <boxGeometry args={[0.015, 0.24, 0.005]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          </group>
        </group>

        {/* Wind Turbine 2 */}
        <group position={[-0.7, 0, 0.4]}>
          {/* Pylon */}
          <mesh position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.01, 0.02, 0.4, 8]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.5} />
          </mesh>
          {/* Generator hub */}
          <mesh position={[0, 0.4, 0]} rotation={[0, Math.PI / 6, 0]}>
            <boxGeometry args={[0.04, 0.04, 0.06]} />
            <meshStandardMaterial color="#cbd5e1" />
          </mesh>
          {/* Rotating blades */}
          <group ref={turbine2Ref} position={[0, 0.4, 0.035]}>
            <mesh position={[0, 0.1, 0]}>
              <boxGeometry args={[0.012, 0.2, 0.005]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            <mesh position={[-0.086, -0.05, 0]} rotation={[0, 0, Math.PI * 2 / 3]}>
              <boxGeometry args={[0.012, 0.2, 0.005]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            <mesh position={[0.086, -0.05, 0]} rotation={[0, 0, -Math.PI * 2 / 3]}>
              <boxGeometry args={[0.012, 0.2, 0.005]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          </group>
        </group>

        {/* Small Transmission Tower (EVN grid) */}
        <group position={[0.6, 0, -0.4]}>
          <mesh position={[0, 0.25, 0]}>
            <boxGeometry args={[0.1, 0.5, 0.1]} />
            <meshStandardMaterial color="#475569" wireframe />
          </mesh>
          <mesh position={[0, 0.4, 0]}>
            <boxGeometry args={[0.3, 0.02, 0.05]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
        </group>
      </group>

      {/* ── Force Field Dome ── */}
      <mesh position={[0, 0.9, 0]}>
        <sphereGeometry args={[1.25, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshBasicMaterial
          color="#06b6d4"
          transparent
          opacity={0.06 + intensity * 0.14}
          wireframe={intensity > 0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ── Law Books Floating (Mái vòm bảo vệ pháp lý) ── */}
      {/* Book 1: Luật Doanh nghiệp */}
      <group ref={book1Ref} position={[-0.8, 1.75, 0.5]}>
        {/* Book Spine/Cover */}
        <mesh>
          <boxGeometry args={[0.26, 0.35, 0.06]} />
          <meshStandardMaterial color="#1e3a8a" roughness={0.3} />
        </mesh>
        {/* Inner Pages */}
        <mesh position={[0.01, 0, 0]}>
          <boxGeometry args={[0.24, 0.33, 0.05]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.6} />
        </mesh>
        {/* Label */}
        <Html position={[0, 0.3, 0]} center distanceFactor={6} className="pointer-events-none select-none">
          <div className="bg-slate-950/85 border border-blue-500/30 px-2 py-0.5 rounded text-[6.5px] font-black text-blue-300 uppercase tracking-wider whitespace-nowrap shadow backdrop-blur-sm">
            {isVi ? 'Luật Doanh nghiệp' : 'Enterprise Law'}
          </div>
        </Html>
      </group>

      {/* Book 2: Luật Thuế */}
      <group ref={book2Ref} position={[0.8, 1.75, -0.5]}>
        <mesh>
          <boxGeometry args={[0.26, 0.35, 0.06]} />
          <meshStandardMaterial color="#b91c1c" roughness={0.3} />
        </mesh>
        <mesh position={[-0.01, 0, 0]}>
          <boxGeometry args={[0.24, 0.33, 0.05]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.6} />
        </mesh>
        <Html position={[0, 0.3, 0]} center distanceFactor={6} className="pointer-events-none select-none">
          <div className="bg-slate-950/85 border border-red-500/30 px-2 py-0.5 rounded text-[6.5px] font-black text-red-300 uppercase tracking-wider whitespace-nowrap shadow backdrop-blur-sm">
            {isVi ? 'Luật Thuế' : 'Tax Law'}
          </div>
        </Html>
      </group>

      {/* Book 3: Hiến pháp */}
      <group ref={book3Ref} position={[0, 2.1, 0]}>
        <mesh>
          <boxGeometry args={[0.3, 0.22, 0.05]} />
          <meshStandardMaterial color="#7c2d12" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0, 0.005]}>
          <boxGeometry args={[0.28, 0.2, 0.04]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.6} />
        </mesh>
        <Html position={[0, 0.25, 0]} center distanceFactor={6} className="pointer-events-none select-none">
          <div className="bg-slate-950/85 border border-amber-600/30 px-2 py-0.5 rounded text-[6.5px] font-black text-amber-300 uppercase tracking-wider whitespace-nowrap shadow backdrop-blur-sm">
            {isVi ? 'Hiến pháp' : 'Constitution'}
          </div>
        </Html>
      </group>

      {/* ── Wall Paintings for Zone 3 ── */}
      {ZONE3_EXHIBITS.map((item, idx) => (
        <group
          key={item.id}
          position={[item.x, 2.3, item.z]}
          rotation={item.rotation as any}
          onClick={(e) => handlePaintingClick(e, item)}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          {/* Wood Frame */}
          <mesh>
            <boxGeometry args={[3.2, 2.2, 0.1]} />
            <meshStandardMaterial color="#b45309" metalness={0.6} roughness={0.3} />
          </mesh>
          <PaintingMesh url={item.imageUrl} />

          {/* Description Plate */}
          <mesh position={[0, -1.4, 0.02]}>
            <planeGeometry args={[1.8, 0.75]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.4} metalness={0.1} />
          </mesh>
          <Html position={[0, -1.4, 0.03]} center distanceFactor={8}>
            <div className="w-[160px] bg-slate-50/90 border border-slate-300 p-2 rounded shadow-md select-none text-center">
              <h4 className="text-[9px] font-extrabold text-slate-800 uppercase tracking-wide mb-1 leading-tight">
                {language === 'vi' ? item.titleVi : item.titleEn}
              </h4>
              <p className="text-[6.5px] leading-normal text-slate-600 font-medium">
                {language === 'vi' ? item.descVi : item.descEn}
              </p>
            </div>
          </Html>
        </group>
      ))}
    </group>
  );
};


// ═══════════════════════════════════════════════════════════════════════════
// ZONE 4 — Công Bằng Xã Hội (Light Tree + Picture Frames)
// ═══════════════════════════════════════════════════════════════════════════
const ZONE4_EXHIBITS = [
  {
    id: "zone4-painting-1",
    side: "left",
    x: -8.9,
    z: -5.5, // Absolute Z = 32.0
    rotation: [0, Math.PI / 2, 0],
    titleVi: "Chương trình Nông thôn mới",
    titleEn: "National New Rural Program",
    descVi: "Chương trình Mục tiêu quốc gia Nông thôn mới. Nguồn lực từ tăng trưởng kinh tế được phân bổ để hiện đại hóa bộ mặt nông thôn: xây dựng điện, đường, trường, trạm. Kéo gần khoảng cách phát triển và mức sống giữa khu vực thành thị và nông thôn.",
    descEn: "Resources from economic growth are allocated to modernize rural areas: building electricity, roads, schools, and medical stations.",
    imageUrl: "/images/room4/zone4/zone4-1.jpg"
  },
  {
    id: "zone4-painting-2",
    side: "left",
    x: -8.9,
    z: 5.5, // Absolute Z = 43.0
    rotation: [0, Math.PI / 2, 0],
    titleVi: "Nhà ở xã hội",
    titleEn: "Social Housing Policy",
    descVi: "Chính sách an cư cho người lao động. Để người công nhân tạo ra của cải không bị bỏ lại phía sau, Nhà nước đưa ra các gói tín dụng ưu đãi và quy hoạch quỹ đất để phát triển nhà ở xã hội, giúp người thu nhập thấp có cơ hội sở hữu nhà ở an toàn.",
    descEn: "Preferential credit packages and land planning for social housing help low-income earners own safe houses.",
    imageUrl: "/images/room4/zone4/zone4-2.png"
  },
  {
    id: "zone4-painting-3",
    side: "right",
    x: 8.9,
    z: -5.5, // Absolute Z = 32.0
    rotation: [0, -Math.PI / 2, 0],
    titleVi: "Phổ cập giáo dục & công nghệ",
    titleEn: "Universal Education & Tech",
    descVi: "Trẻ em vùng miền núi, hải đảo đang sử dụng máy tính bảng để học tập. Công bằng xã hội không chỉ là chia đều của cải, mà quan trọng hơn là \"bình đẳng về cơ hội\". Việc đầu tư cáp quang internet đến vùng sâu vùng xa và các chính sách miễn giảm học phí giúp mọi trẻ em đều có cơ hội tiếp cận tri thức.",
    descEn: "Universal Education and Technology. Investing in fiber optics to remote areas and tuition exemptions ensures every child has access to knowledge.",
    imageUrl: "/images/room4/zone4/zone4-3.jpg"
  },
  {
    id: "zone4-painting-4",
    side: "right",
    x: 8.9,
    z: 5.5, // Absolute Z = 43.0
    rotation: [0, -Math.PI / 2, 0],
    titleVi: "Chăm lo người yếu thế & có công",
    titleEn: "Caring for the Disadvantaged",
    descVi: "Cán bộ y tế thăm khám cho Mẹ Việt Nam Anh hùng và người khuyết tật. Một nền kinh tế thị trường nhân văn là nền kinh tế có mạng lưới an sinh xã hội vững chắc. Hàng năm, ngân sách quốc gia luôn dành một phần lớn để chi trả trợ cấp, chăm sóc y tế cho người có công, người cao tuổi neo đơn và người khuyết tật.",
    descEn: "A humane market economy has a solid social safety net, allocating national budget for subsidies and medical care.",
    imageUrl: "/images/room4/zone4/zone4-4.jpg"
  }
];

const Zone4SocialEquity: React.FC<ZoneProps> = ({ onZoneClick, isActive, language, intensity }) => {
  const { setSelectedExhibit } = useMuseum();
  const leaf1Ref = useRef<THREE.Mesh>(null);
  const leaf2Ref = useRef<THREE.Mesh>(null);
  const leaf3Ref = useRef<THREE.Mesh>(null);
  const leaf4Ref = useRef<THREE.Mesh>(null);
  const leaf5Ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Pulsate the tree canopy spheres (leaves)
    if (leaf1Ref.current) {
      const s = 1.0 + Math.sin(time * 2.0) * 0.05;
      leaf1Ref.current.scale.set(s, s, s);
    }
    if (leaf2Ref.current) {
      const s = 1.0 + Math.sin(time * 1.7 + 1) * 0.06;
      leaf2Ref.current.scale.set(s, s, s);
    }
    if (leaf3Ref.current) {
      const s = 1.0 + Math.sin(time * 2.2 + 2) * 0.05;
      leaf3Ref.current.scale.set(s, s, s);
    }
    if (leaf4Ref.current) {
      const s = 1.0 + Math.sin(time * 1.5 + 3) * 0.07;
      leaf4Ref.current.scale.set(s, s, s);
    }
    if (leaf5Ref.current) {
      const s = 1.0 + Math.sin(time * 2.5 + 4) * 0.06;
      leaf5Ref.current.scale.set(s, s, s);
    }
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    onZoneClick(4);
    setSelectedExhibit({
      id: 'zone4-social-equity',
      gallery_id: 'gallery-market-economy',
      title: { vi: "Tiến bộ và Công bằng Xã hội", en: "Social Progress & Equity" },
      author: { vi: "Mô hình 3D", en: "3D Model" },
      description: {
        vi: "Gắn tăng trưởng kinh tế với tiến bộ xã hội. Triển khai các gói bảo hiểm y tế toàn dân, học bổng vùng cao và cứu trợ khẩn cấp.",
        en: "Tying economic growth with social equity, providing universal health insurance, educational support, and disaster relief."
      },
      model_3d_url: "",
      thumbnail_url: "/images/room4/bao-hiem-y-te.jpg",
      coordinate_x: 0,
      coordinate_y: 1.0,
      coordinate_z: 37.5,
      rotation_x: 0,
      rotation_y: 0,
      rotation_z: 0,
      scale_x: 1,
      scale_y: 1,
      scale_z: 1
    });
  };

  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    document.body.style.cursor = 'auto';
  };

  const handlePaintingClick = (e: any, item: typeof ZONE4_EXHIBITS[0]) => {
    e.stopPropagation();
    onZoneClick(4);
    setSelectedExhibit({
      id: item.id,
      gallery_id: "gallery-market-economy",
      title: { vi: item.titleVi, en: item.titleEn },
      author: { vi: "Tranh trưng bày", en: "Exhibit Painting" },
      description: { vi: item.descVi, en: item.descEn },
      model_3d_url: "",
      thumbnail_url: item.imageUrl,
      coordinate_x: item.x,
      coordinate_y: 2.3,
      coordinate_z: 37.5 + item.z,
      rotation_x: 0,
      rotation_y: item.rotation[1],
      rotation_z: 0,
      scale_x: 1,
      scale_y: 1,
      scale_z: 1
    });
  };

  const isVi = language === 'vi';

  return (
    <group position={[0, 0, 37.5]} onClick={handleClick}>
      {/* Warm Glow ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[1.5, 1.7, 32]} />
        <meshBasicMaterial color="#f97316" transparent opacity={0.15 + intensity * 0.65} />
      </mesh>

      {/* ── Light Tree (Cây Ánh Sáng) ── */}
      <group position={[0, 0, 0]}>
        {/* Trunk */}
        <mesh position={[0, 0.6, 0]}>
          <cylinderGeometry args={[0.08, 0.16, 1.2, 12]} />
          <meshStandardMaterial color="#451a03" roughness={0.9} />
        </mesh>

        {/* Glowing canopy spheres */}
        <mesh ref={leaf1Ref} position={[0, 1.35, 0]}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.6 * intensity} roughness={0.1} />
        </mesh>
        <mesh ref={leaf2Ref} position={[-0.22, 1.5, 0.12]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color="#f97316" emissive="#f97316" emissiveIntensity={0.5 * intensity} roughness={0.1} />
        </mesh>
        <mesh ref={leaf3Ref} position={[0.22, 1.5, -0.12]}>
          <sphereGeometry args={[0.22, 16, 16]} />
          <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.5 * intensity} roughness={0.1} />
        </mesh>
        <mesh ref={leaf4Ref} position={[0.12, 1.6, 0.18]}>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshStandardMaterial color="#f97316" emissive="#f97316" emissiveIntensity={0.5 * intensity} roughness={0.1} />
        </mesh>
        <mesh ref={leaf5Ref} position={[-0.18, 1.6, -0.18]}>
          <sphereGeometry args={[0.16, 16, 16]} />
          <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.5 * intensity} roughness={0.1} />
        </mesh>

        {/* Tree Base / Pedestal */}
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.45, 0.5, 0.1, 16]} />
          <meshStandardMaterial color="#2d3748" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>

      {/* ── Digital Frames ── */}
      {/* Frame 1: Thẻ BHYT (Left) */}
      <group position={[-2.0, 1.1, 0.2]} rotation={[0, Math.PI - Math.PI / 6, 0]}>
        {/* Pedestal */}
        <mesh position={[0, -0.55, 0]}>
          <cylinderGeometry args={[0.15, 0.2, 1.1, 12]} />
          <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Frame border */}
        <mesh
          position={[0, 0.05, 0]}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          <boxGeometry args={[0.7, 0.5, 0.04]} />
          <meshStandardMaterial color="#1e1b4b" roughness={0.3} />
        </mesh>

        {/* Chip card graphic */}
        <Html transform distanceFactor={2.4} position={[0, 0.05, 0.021]} center>
          <div className="w-[145px] h-[95px] rounded-lg bg-gradient-to-br from-indigo-900 via-blue-900 to-indigo-950 p-2 border border-blue-500/20 text-white flex flex-col justify-between font-sans shadow-inner select-none">
            <div className="flex justify-between items-start">
              <span className="text-[14px]">🏥</span>
              <span className="text-[6.5px] bg-red-500/20 text-red-300 border border-red-500/30 px-1 rounded font-bold uppercase tracking-wider">
                {isVi ? 'Bảo hiểm y tế' : 'Social Health'}
              </span>
            </div>
            <div className="space-y-0.5">
              <h5 className="text-[7.5px] font-black uppercase text-indigo-200">
                {isVi ? 'BẢO HIỂM Y TẾ TOÀN DÂN' : 'UNIVERSAL HEALTH CARE'}
              </h5>
              <p className="text-[5.5px] leading-relaxed text-indigo-300">
                {isVi ? 'Hỗ trợ 100% chi phí khám chữa bệnh cho người nghèo' : '100% medical expense support for poor households.'}
              </p>
            </div>
          </div>
        </Html>
      </group>

      {/* Frame 2: Cứu trợ thiên tai (Right) */}
      <group position={[2.0, 1.1, 0.2]} rotation={[0, Math.PI + Math.PI / 6, 0]}>
        {/* Pedestal */}
        <mesh position={[0, -0.55, 0]}>
          <cylinderGeometry args={[0.15, 0.2, 1.1, 12]} />
          <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Frame border */}
        <mesh
          position={[0, 0.05, 0]}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          <boxGeometry args={[0.7, 0.5, 0.04]} />
          <meshStandardMaterial color="#1e1b4b" roughness={0.3} />
        </mesh>

        {/* Disaster relief graphic */}
        <Html transform distanceFactor={2.4} position={[0, 0.05, 0.021]} center>
          <div className="w-[145px] h-[95px] rounded-lg bg-gradient-to-br from-amber-900 via-orange-900 to-amber-950 p-2 border border-orange-500/20 text-white flex flex-col justify-between font-sans shadow-inner select-none">
            <div className="flex justify-between items-start">
              <span className="text-[14px]">🤝</span>
              <span className="text-[6.5px] bg-orange-500/20 text-orange-300 border border-orange-500/30 px-1 rounded font-bold uppercase tracking-wider">
                {isVi ? 'Cứu trợ thiên tai' : 'Disaster Relief'}
              </span>
            </div>
            <div className="space-y-0.5">
              <h5 className="text-[7.5px] font-black uppercase text-orange-200">
                {isVi ? 'ẤM ÁP TÌNH ĐỒNG BÀO' : 'COMMUNITY SOLIDARITY'}
              </h5>
              <p className="text-[5.5px] leading-relaxed text-orange-300">
                {isVi ? 'Ứng phó bão lũ, hỗ trợ dựng lại nhà cửa sau thiên tai' : 'Disaster response and housing rebuild reconstruction assistance.'}
              </p>
            </div>
          </div>
        </Html>
      </group>

      {/* Frame 3: Học sinh vùng cao (Center Behind Tree) */}
      <group position={[0, 1.25, -1.0]} rotation={[0, Math.PI, 0]}>
        {/* Pedestal */}
        <mesh position={[0, -0.7, 0]}>
          <cylinderGeometry args={[0.15, 0.2, 1.4, 12]} />
          <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Frame border */}
        <mesh
          position={[0, 0.05, 0]}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          <boxGeometry args={[0.7, 0.5, 0.04]} />
          <meshStandardMaterial color="#1e1b4b" roughness={0.3} />
        </mesh>

        {/* Education support graphic */}
        <Html transform distanceFactor={2.4} position={[0, 0.05, 0.021]} center>
          <div className="w-[145px] h-[95px] rounded-lg bg-gradient-to-br from-yellow-900 via-amber-800 to-yellow-950 p-2 border border-yellow-500/20 text-white flex flex-col justify-between font-sans shadow-inner select-none">
            <div className="flex justify-between items-start">
              <span className="text-[14px]">☀️</span>
              <span className="text-[6.5px] bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 px-1 rounded font-bold uppercase tracking-wider">
                {isVi ? 'Phát triển bền vững' : 'Equity Development'}
              </span>
            </div>
            <div className="space-y-0.5">
              <h5 className="text-[7.5px] font-black uppercase text-yellow-200">
                {isVi ? 'HỌC BỔNG VÙNG CAO' : 'HIGHLAND SCHOLARSHIPS'}
              </h5>
              <p className="text-[5.5px] leading-relaxed text-yellow-300">
                {isVi ? 'Bảo đảm cơ hội học tập bình đẳng cho mọi trẻ em Việt Nam' : 'Ensuring equal learning opportunities for every Vietnamese child.'}
              </p>
            </div>
          </div>
        </Html>
      </group>

      {/* ── Wall Paintings for Zone 4 ── */}
      {ZONE4_EXHIBITS.map((item, idx) => (
        <group
          key={item.id}
          position={[item.x, 2.3, item.z]}
          rotation={item.rotation as any}
          onClick={(e) => handlePaintingClick(e, item)}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          {/* Wood Frame */}
          <mesh>
            <boxGeometry args={[3.2, 2.2, 0.1]} />
            <meshStandardMaterial color="#b45309" metalness={0.6} roughness={0.3} />
          </mesh>
          <PaintingMesh url={item.imageUrl} />

          {/* Description Plate */}
          <mesh position={[0, -1.4, 0.02]}>
            <planeGeometry args={[1.8, 0.75]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.4} metalness={0.1} />
          </mesh>
          <Html position={[0, -1.4, 0.03]} center distanceFactor={8}>
            <div className="w-[160px] bg-slate-50/90 border border-slate-300 p-2 rounded shadow-md select-none text-center">
              <h4 className="text-[9px] font-extrabold text-slate-800 uppercase tracking-wide mb-1 leading-tight">
                {language === 'vi' ? item.titleVi : item.titleEn}
              </h4>
              <p className="text-[6.5px] leading-normal text-slate-600 font-medium">
                {language === 'vi' ? item.descVi : item.descEn}
              </p>
            </div>
          </Html>
        </group>
      ))}
    </group>
  );
};


// ═══════════════════════════════════════════════════════════════════════════
// ZONE 5 — Hội Nhập Quốc Tế (Holographic Globe + Orbit Lines + Mini Port)
// ═══════════════════════════════════════════════════════════════════════════
const ZONE5_EXHIBITS = [
  {
    id: "zone5-painting-1",
    side: "left",
    x: -8.9,
    z: -5.5, // Absolute Z = 57.0
    rotation: [0, Math.PI / 2, 0],
    titleVi: "Mạng lưới FTA toàn cầu",
    titleEn: "Global FTA Network",
    descVi: "Mạng lưới FTA phủ rộng toàn cầu. Việt Nam đã ký kết 16 hiệp định thương mại tự do (bao gồm các hiệp định thế hệ mới như EVFTA, CPTPP), mở toang cánh cửa đưa hàng hóa Việt Nam tiến vào các thị trường khó tính nhất với mức thuế suất ưu đãi, tạo lợi thế cạnh tranh khổng lồ.",
    descEn: "Vietnam signed 16 FTAs (including new-generation ones like EVFTA, CPTPP), opening gates for exports with preferential tariffs.",
    imageUrl: "/images/room4/zone5/zone5-1.jpg"
  },
  {
    id: "zone5-painting-2",
    side: "left",
    x: -8.9,
    z: 5.5, // Absolute Z = 68.0
    rotation: [0, Math.PI / 2, 0],
    titleVi: "Nông sản chinh phục thế giới",
    titleEn: "Agriculture Conquers Markets",
    descVi: "Nông nghiệp chinh phục thế giới. Hội nhập giúp nông sản Việt Nam không chỉ quẩn quanh trong \"ao làng\". Từ gạo, cà phê, hồ tiêu cho đến thủy sản, các sản phẩm nông nghiệp Việt Nam nay đã đáp ứng các tiêu chuẩn khắt khe nhất (FDA, EU) và xuất khẩu thu về hàng chục tỷ USD mỗi năm.",
    descEn: "Vietnamese rice, coffee, pepper, and seafood meet international standards (FDA, EU) for exports, generating billions USD annually.",
    imageUrl: "/images/room4/zone5/zone5-2.jpg"
  },
  {
    id: "zone5-painting-3",
    side: "right",
    x: 8.9,
    z: -5.5, // Absolute Z = 57.0
    rotation: [0, -Math.PI / 2, 0],
    titleVi: "Giao lưu văn hóa & Du lịch",
    titleEn: "Tourism & Cultural Exchange",
    descVi: "Mở cửa biên giới, giao lưu văn hóa. Du khách quốc tế tấp nập đi thuyền tại Vịnh Hạ Long, Phố cổ Hội An. Việc miễn thị thực và quảng bá văn hóa giúp Việt Nam trở thành điểm đến hấp dẫn trên bản đồ du lịch thế giới, mang lại nguồn thu ngoại tệ lớn.",
    descEn: "International tourism at Ha Long and Hoi An. Visa exemptions and cultural promotion draw foreign travelers and currencies.",
    imageUrl: "/images/room4/zone5/zone5-3.jpg"
  },
  {
    id: "zone5-painting-4",
    side: "right",
    x: 8.9,
    z: 5.5, // Absolute Z = 68.0
    rotation: [0, -Math.PI / 2, 0],
    titleVi: "Xuất khẩu dịch vụ số",
    titleEn: "Digital Services Export",
    descVi: "Xuất khẩu dịch vụ số và nguồn nhân lực. Hội nhập không chỉ dừng lại ở xuất khẩu hàng hóa vật lý. Lực lượng lao động Việt Nam (đặc biệt là ngành IT, lập trình phần mềm) đang trực tiếp tham gia vào các dự án công nghệ toàn cầu, đưa trí tuệ Việt vươn ra thế giới.",
    descEn: "Domestic IT talent and developers participating directly in global tech projects, bringing digital service exports to the world.",
    imageUrl: "/images/room4/zone5/zone5-4.jpg"
  }
];

const Zone5InternationalIntegration: React.FC<ZoneProps> = ({ onZoneClick, isActive, language, intensity }) => {
  const { setSelectedExhibit } = useMuseum();
  const globeRef = useRef<THREE.Mesh>(null);
  const orbitGroupRef = useRef<THREE.Group>(null);

  const truckRef = useRef<THREE.Group>(null);

  const logoAseanRef = useRef<THREE.Group>(null);
  const logoWtoRef = useRef<THREE.Group>(null);
  const logoIntelRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Rotate Globe and Orbit lines
    if (globeRef.current) {
      globeRef.current.rotation.y = time * 0.35;
    }
    if (orbitGroupRef.current) {
      orbitGroupRef.current.rotation.y = -time * 0.2;
      orbitGroupRef.current.rotation.z = time * 0.15;
    }

    // Move Container Truck at Port
    if (truckRef.current) {
      const cycle = (time * 0.3) % 2;
      const x = cycle < 1 ? -0.8 + cycle * 1.6 : 0.8 - (cycle - 1) * 1.6;
      truckRef.current.position.x = x;
      // Flip rotation based on direction
      truckRef.current.rotation.y = cycle < 1 ? 0 : Math.PI;
    }

    // Organization badges floating
    const floatOffset1 = Math.sin(time * 1.4) * 0.05;
    const floatOffset2 = Math.sin(time * 1.1 + 1) * 0.05;
    const floatOffset3 = Math.sin(time * 1.6 + 2) * 0.06;

    if (logoAseanRef.current) {
      logoAseanRef.current.position.y = 1.75 + floatOffset1;
      logoAseanRef.current.rotation.y = time * 0.25;
    }
    if (logoWtoRef.current) {
      logoWtoRef.current.position.y = 1.75 + floatOffset2;
      logoWtoRef.current.rotation.y = -time * 0.22;
    }
    if (logoIntelRef.current) {
      logoIntelRef.current.position.y = 2.1 + floatOffset3;
      logoIntelRef.current.rotation.x = Math.sin(time * 0.8) * 0.08;
    }
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    onZoneClick(5);
    setSelectedExhibit({
      id: 'zone5-international-integration',
      gallery_id: 'gallery-market-economy',
      title: { vi: "Hội nhập Kinh tế Quốc tế", en: "International Economic Integration" },
      author: { vi: "Mô hình 3D", en: "3D Model" },
      description: {
        vi: "Việt Nam chủ động tham gia WTO, ASEAN, ký các hiệp định FTA để mở rộng thị trường xuất khẩu và thu hút dòng vốn FDI lớn từ Intel, Samsung.",
        en: "Vietnam actively integrates through WTO, ASEAN, and FTAs, expanding export markets and attracting high-quality foreign investments."
      },
      model_3d_url: "",
      thumbnail_url: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800",
      coordinate_x: 0,
      coordinate_y: 1.0,
      coordinate_z: 62.5,
      rotation_x: 0,
      rotation_y: 0,
      rotation_z: 0,
      scale_x: 1,
      scale_y: 1,
      scale_z: 1
    });
  };

  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    document.body.style.cursor = 'auto';
  };

  const handlePaintingClick = (e: any, item: typeof ZONE5_EXHIBITS[0]) => {
    e.stopPropagation();
    onZoneClick(5);
    setSelectedExhibit({
      id: item.id,
      gallery_id: "gallery-market-economy",
      title: { vi: item.titleVi, en: item.titleEn },
      author: { vi: "Tranh trưng bày", en: "Exhibit Painting" },
      description: { vi: item.descVi, en: item.descEn },
      model_3d_url: "",
      thumbnail_url: item.imageUrl,
      coordinate_x: item.x,
      coordinate_y: 2.3,
      coordinate_z: 62.5 + item.z,
      rotation_x: 0,
      rotation_y: item.rotation[1],
      rotation_z: 0,
      scale_x: 1,
      scale_y: 1,
      scale_z: 1
    });
  };

  const isVi = language === 'vi';

  return (
    <group position={[0, 0, 62.5]} onClick={handleClick}>
      {/* Blue Glow ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[1.6, 1.8, 32]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.15 + intensity * 0.65} />
      </mesh>

      {/* ── Holographic Globe (Quả Địa Cầu Tương Tác) ── */}
      <group position={[0, 0.95, 0]}>
        {/* Globe wireframe */}
        <mesh ref={globeRef} onPointerOver={handlePointerOver} onPointerOut={handlePointerOut}>
          <sphereGeometry args={[0.55, 24, 24]} />
          <meshBasicMaterial
            color="#60a5fa"
            wireframe
            transparent
            opacity={0.15 + intensity * 0.35}
          />
        </mesh>

        {/* Inner Glowing Core */}
        <mesh>
          <sphereGeometry args={[0.32, 16, 16]} />
          <meshStandardMaterial
            color="#2563eb"
            emissive="#3b82f6"
            emissiveIntensity={0.6 * intensity}
            roughness={0.2}
          />
        </mesh>

        {/* Orbit flight lines */}
        <group ref={orbitGroupRef}>
          <mesh rotation={[Math.PI / 4, Math.PI / 6, 0]}>
            <torusGeometry args={[0.68, 0.008, 6, 48]} />
            <meshBasicMaterial color="#60a5fa" transparent opacity={0.3 * intensity} />
          </mesh>
          <mesh rotation={[-Math.PI / 3, Math.PI / 5, 0.5]}>
            <torusGeometry args={[0.72, 0.006, 6, 48]} />
            <meshBasicMaterial color="#93c5fd" transparent opacity={0.3 * intensity} />
          </mesh>
        </group>

        {/* Pedestal */}
        <mesh position={[0, -0.48, 0]}>
          <cylinderGeometry args={[0.3, 0.36, 0.9, 16]} />
          <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.26, 0.32, 16]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={intensity} />
        </mesh>
      </group>

      {/* ── Miniature Port (Cảng Biển & Xe Container) ── */}
      {/* Port Platform */}
      <group position={[0, 0, -1.0]}>
        {/* Concrete Platform */}
        <mesh position={[0, 0.025, 0]}>
          <boxGeometry args={[1.8, 0.05, 0.7]} />
          <meshStandardMaterial color="#475569" roughness={0.6} />
        </mesh>

        {/* Sea Water base */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, -0.45]}>
          <planeGeometry args={[2.0, 0.3]} />
          <meshStandardMaterial color="#1d4ed8" emissive="#1e40af" emissiveIntensity={0.2} roughness={0.1} />
        </mesh>

        {/* Small Container Stacks */}
        <group position={[-0.6, 0.08, -0.1]}>
          {/* Blue Container */}
          <mesh position={[0, 0.05, 0]}>
            <boxGeometry args={[0.24, 0.1, 0.12]} />
            <meshStandardMaterial color="#1e3a8a" roughness={0.4} />
          </mesh>
          {/* Red Container */}
          <mesh position={[0.06, 0.15, -0.02]}>
            <boxGeometry args={[0.24, 0.1, 0.12]} />
            <meshStandardMaterial color="#991b1b" roughness={0.4} />
          </mesh>
        </group>

        {/* Moving Container Truck */}
        <group ref={truckRef} position={[0, 0.05, 0.18]}>
          {/* Truck Head */}
          <mesh position={[0.08, 0.04, 0]}>
            <boxGeometry args={[0.05, 0.06, 0.06]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.5} />
          </mesh>
          {/* Truck Bed */}
          <mesh position={[-0.04, 0.05, 0]}>
            <boxGeometry args={[0.18, 0.08, 0.06]} />
            <meshStandardMaterial color="#15803d" roughness={0.5} />
          </mesh>
          {/* Wheels */}
          <mesh position={[-0.08, 0.01, 0.03]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.01, 8]} />
            <meshBasicMaterial color="#000" />
          </mesh>
          <mesh position={[-0.08, 0.01, -0.03]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.01, 8]} />
            <meshBasicMaterial color="#000" />
          </mesh>
          <mesh position={[0.06, 0.01, 0.03]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.01, 8]} />
            <meshBasicMaterial color="#000" />
          </mesh>
          <mesh position={[0.06, 0.01, -0.03]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.01, 8]} />
            <meshBasicMaterial color="#000" />
          </mesh>
        </group>
      </group>

      {/* ── Organization Badges (ASEAN, WTO, Intel) ── */}
      {/* 1. ASEAN Badge (Left) */}
      <group ref={logoAseanRef} position={[-1.2, 1.75, 0.4]}>
        <mesh>
          <boxGeometry args={[0.26, 0.26, 0.05]} />
          <meshStandardMaterial color="#1e3a8a" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0, 0.026]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.005, 16]} />
          <meshBasicMaterial color="#eab308" />
        </mesh>
        <Html position={[0, 0.24, 0]} center distanceFactor={6} className="pointer-events-none select-none">
          <div className="bg-slate-950/85 border border-blue-500/30 px-2 py-0.5 rounded text-[6px] font-black text-blue-400 uppercase tracking-wider whitespace-nowrap shadow backdrop-blur-sm">
            ASEAN
          </div>
        </Html>
      </group>

      {/* 2. WTO Badge (Right) */}
      <group ref={logoWtoRef} position={[1.2, 1.75, -0.4]}>
        <mesh>
          <boxGeometry args={[0.26, 0.26, 0.05]} />
          <meshStandardMaterial color="#0f766e" roughness={0.3} />
        </mesh>
        <Html position={[0, 0.24, 0]} center distanceFactor={6} className="pointer-events-none select-none">
          <div className="bg-slate-950/85 border border-teal-500/30 px-2 py-0.5 rounded text-[6px] font-black text-teal-400 uppercase tracking-wider whitespace-nowrap shadow backdrop-blur-sm">
            WTO
          </div>
        </Html>
      </group>

      {/* 3. Intel Chip Badge (Center Top) */}
      <group ref={logoIntelRef} position={[0, 2.1, 0.3]}>
        {/* Chip Body */}
        <mesh>
          <boxGeometry args={[0.28, 0.28, 0.04]} />
          <meshStandardMaterial color="#1d4ed8" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Pins / Details */}
        <mesh position={[0, 0, 0.022]}>
          <boxGeometry args={[0.2, 0.2, 0.005]} />
          <meshStandardMaterial color="#3b82f6" metalness={0.9} />
        </mesh>
        <Html position={[0, 0.24, 0]} center distanceFactor={6} className="pointer-events-none select-none">
          <div className="bg-slate-950/85 border border-blue-500/30 px-2 py-0.5 rounded text-[6px] font-black text-blue-300 uppercase tracking-wider whitespace-nowrap shadow backdrop-blur-sm">
            INTEL (FDI)
          </div>
        </Html>
      </group>

      {/* ── Wall Paintings for Zone 5 ── */}
      {ZONE5_EXHIBITS.map((item, idx) => (
        <group
          key={item.id}
          position={[item.x, 2.3, item.z]}
          rotation={item.rotation as any}
          onClick={(e) => handlePaintingClick(e, item)}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          {/* Wood Frame */}
          <mesh>
            <boxGeometry args={[3.2, 2.2, 0.1]} />
            <meshStandardMaterial color="#b45309" metalness={0.6} roughness={0.3} />
          </mesh>
          <PaintingMesh url={item.imageUrl} />

          {/* Description Plate */}
          <mesh position={[0, -1.4, 0.02]}>
            <planeGeometry args={[1.8, 0.75]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.4} metalness={0.1} />
          </mesh>
          <Html position={[0, -1.4, 0.03]} center distanceFactor={8}>
            <div className="w-[160px] bg-slate-50/90 border border-slate-300 p-2 rounded shadow-md select-none text-center">
              <h4 className="text-[9px] font-extrabold text-slate-800 uppercase tracking-wide mb-1 leading-tight">
                {language === 'vi' ? item.titleVi : item.titleEn}
              </h4>
              <p className="text-[6.5px] leading-normal text-slate-600 font-medium">
                {language === 'vi' ? item.descVi : item.descEn}
              </p>
            </div>
          </Html>
        </group>
      ))}
    </group>
  );
};





// ─────────────────────────────────────────────────────────────────────────────
// ZONE NPC COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
interface ZoneNPCProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  nameVi: string;
  nameEn: string;
  infoVi: string;
  infoEn: string;
  language: 'vi' | 'en';
  color?: string;
  isVisible: boolean;
  activeIntensity: number;
}

const ZoneNPC: React.FC<ZoneNPCProps> = ({
  position,
  rotation = [0, 0, 0],
  nameVi,
  nameEn,
  infoVi,
  infoEn,
  language,
  color = '#22d3ee',
  isVisible,
  activeIntensity
}) => {
  const isVi = language === 'vi';
  const [forceShow, setForceShow] = useState(false);

  const handleNpcClick = (e: any) => {
    e.stopPropagation();
    setForceShow(prev => !prev);
  };

  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    document.body.style.cursor = 'auto';
  };

  useEffect(() => {
    if (forceShow) {
      const timer = setTimeout(() => {
        setForceShow(false);
      }, 30000); // 30 seconds
      return () => clearTimeout(timer);
    }
  }, [forceShow]);

  const showBubble = isVisible && (forceShow || activeIntensity > 0.3);

  return (
    <group
      position={position}
      rotation={rotation}
      onClick={handleNpcClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {/* Glow ring on floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.47, 0]}>
        <ringGeometry args={[0.62, 0.72, 32]} />
        <meshBasicMaterial color={color} side={THREE.DoubleSide} transparent opacity={0.15 + activeIntensity * 0.75} />
      </mesh>

      {/* 3D Body Representation (Matching the exact look & feel of NPC Expert) */}
      <group scale={1.5}>
        {/* Head */}
        <mesh position={[0, 0.7, 0]}>
          <sphereGeometry args={[0.2, 24, 24]} />
          <meshStandardMaterial color={color} metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Visor / Eyes */}
        <mesh position={[0, 0.74, -0.17]}>
          <boxGeometry args={[0.25, 0.05, 0.08]} />
          <meshBasicMaterial color="#22d3ee" />
        </mesh>

        {/* Torso */}
        <mesh position={[0, 0.28, 0]}>
          <capsuleGeometry args={[0.16, 0.28, 8, 16]} />
          <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Left hand */}
        <mesh position={[-0.2, 0.38, 0]}>
          <sphereGeometry args={[0.06, 12, 12]} />
          <meshStandardMaterial color={color} metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Right hand */}
        <mesh position={[0.2, 0.38, 0]}>
          <sphereGeometry args={[0.06, 12, 12]} />
          <meshStandardMaterial color={color} metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Base Cylinder connection */}
        <mesh position={[0, -0.15, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.3, 12]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} />
        </mesh>
      </group>

      {/* NPC speech bubble (HTML overlay) */}
      {showBubble ? (
        <Html position={[0, 1.8, 0]} center distanceFactor={8} zIndexRange={[16777271, 0]} className="pointer-events-none select-none">
          <div
            className="w-[270px] bg-slate-950/95 border px-4 py-2.5 rounded-2xl shadow-2xl text-slate-100 font-sans backdrop-blur-md"
            style={{ borderColor: `${color}40`, zIndex: 9999, position: 'relative' }}
          >
            <span
              className="text-[9px] border px-2 py-0.5 rounded font-bold tracking-wider block w-max mx-auto mb-1.5 uppercase"
              style={{ color, backgroundColor: `${color}10`, borderColor: `${color}20` }}
            >
              {isVi ? nameVi : nameEn}
            </span>
            <p className="text-xs font-bold leading-normal text-slate-200 text-center">
              {isVi ? infoVi : infoEn}
            </p>
          </div>
        </Html>
      ) : (
        <Html position={[0, 1.7, 0]} center distanceFactor={8} className="pointer-events-none select-none">
          <div
            className="w-8 h-8 rounded-full border bg-slate-950/90 flex items-center justify-center font-black text-sm shadow-2xl backdrop-blur-md animate-bounce select-none"
            style={{
              borderColor: color,
              color: color,
              boxShadow: `0 0 12px ${color}30`
            }}
          >
            !
          </div>
        </Html>
      )}
    </group>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN — RoomFour Component
// ═══════════════════════════════════════════════════════════════════════════
export const RoomFour: React.FC<BaseRoomProps> = ({ galleryId, customSettings, isVisible = true }) => {
  const { activeGallery, language } = useMuseum();
  const roomHeight = (customSettings?.room_height ?? activeGallery?.room_height ?? 6) + 1;

  const modifiedSettings = {
    room_width: customSettings?.room_width ?? activeGallery?.room_width ?? 12,
    room_length: customSettings?.room_length ?? activeGallery?.room_length ?? 72,
    room_height: roomHeight,
    floor_color: customSettings?.floor_color ?? activeGallery?.floor_color ?? '#1e293b',
    wall_color: customSettings?.wall_color ?? activeGallery?.wall_color ?? '#0f172a',
    wainscoting_color: customSettings?.wainscoting_color ?? activeGallery?.wainscoting_color ?? '#1e293b',
    floor_type: (customSettings?.floor_type ?? activeGallery?.floor_type ?? 'wood') as 'wood' | 'marble' | 'carpet',
  };

  // ── Narrative state (step 0→6) ──
  const [step, setStep] = useState<number>(3);

  // ── Zone 2 Intro state ──
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [npcSubtitles, setNpcSubtitles] = useState<string>('');
  const [activePedestal, setActivePedestal] = useState<number | null>(null);

  // ── Minigame state ──
  const [gameIndex, setGameIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [answerStatus, setAnswerStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');

  // ── Zone dynamic lighting ──
  const zoneIntensityRefs = useRef<number[]>([0, 0, 0, 0, 0]);
  const [zoneIntensities, setZoneIntensities] = useState<number[]>([0, 0, 0, 0, 0]);
  const entranceLightRef = useRef<number>(0.05);
  const [entranceLight, setEntranceLight] = useState<number>(0.05);
  const frameCounter = useRef<number>(0);
  const stepRef = useRef<number>(0);
  stepRef.current = step;

  // Zone local-Z centers (room local space, offset from ZONE_ABS_OFFSET)
  const ZONE_LOCAL_Z = [-37.5, -12.5, 12.5, 37.5, 62.5];

  useFrame((state) => {
    if (!isVisible) return;
    const player = state.scene.getObjectByName('player-character') || state.scene.getObjectByName('lobby-player');
    if (!player) return;

    const absZ = player.position.z;
    const localZ = absZ - ZONE_ABS_OFFSET;




    // Entrance ambient lerp
    const entranceTarget = stepRef.current >= 1 ? 0.65 : 0.05;
    entranceLightRef.current = THREE.MathUtils.lerp(entranceLightRef.current, entranceTarget, 0.02);

    // Per-zone intensity (light up when nearby AND step >= 3)
    let changed = false;
    ZONE_LOCAL_Z.forEach((zoneZ, i) => {
      const dist = Math.abs(localZ - zoneZ);
      const target = (dist < 13 && stepRef.current >= 3) ? 1.0 : 0.0;
      const newVal = THREE.MathUtils.lerp(zoneIntensityRefs.current[i], target, 0.028);
      if (Math.abs(newVal - zoneIntensityRefs.current[i]) > 0.004) {
        zoneIntensityRefs.current[i] = newVal;
        changed = true;
      }
    });

    // Throttle React state updates to every 5 frames
    frameCounter.current++;
    if (frameCounter.current % 5 === 0) {
      if (changed) setZoneIntensities([...zoneIntensityRefs.current]);
      if (Math.abs(entranceLightRef.current - entranceLight) > 0.008) {
        setEntranceLight(entranceLightRef.current);
      }
    }
  });

  // ── Narrative effects ──
  useEffect(() => {
    if (!isVisible) return;
    if (step === 1) startSlideshow();
    if (step === 2) runNpcIntro();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, isVisible]);

  const startSlideshow = () => {
    let index = 0;
    const interval = setInterval(() => {
      index++;
      if (index < SLIDESHOW_IMAGES.length) {
        setCurrentSlide(index);
      } else {
        clearInterval(interval);
        setStep(2);
      }
    }, 2000);
  };

  const runNpcIntro = async () => {
    const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));
    const vi = language === 'vi';
    setNpcSubtitles(vi ? 'Nhiều người cho rằng Việt Nam là nền kinh tế thị trường tư bản chủ nghĩa.' : 'Many think Vietnam has a capitalist market economy.');
    await sleep(4000);
    setNpcSubtitles(vi ? 'Một số người khác lại nghĩ Việt Nam vẫn là nền kinh tế kế hoạch hóa tập trung.' : 'Others believe Vietnam is still a centrally planned economy.');
    await sleep(4000);
    setNpcSubtitles(vi ? 'Theo bạn, đâu mới là câu trả lời đúng?' : 'What is the correct answer?');
    await sleep(3500);
    setNpcSubtitles(vi ? 'Đáp án là: KINH TẾ THỊ TRƯỜNG ĐỊNH HƯỚNG XHCN.' : 'The answer: SOCIALIST-ORIENTED MARKET ECONOMY.');
    await sleep(4500);
    setStep(4);
    setNpcSubtitles(vi ? 'Hãy tham gia thử thách để chứng minh năng lực hoạch định chính sách!' : 'Take the challenge to prove your policy-making skills!');
  };

  const handleZoneClick = (zoneId: number) => {
    if (step < 3) return;
    setActivePedestal(zoneId);
    const vi = language === 'vi';
    const msgs: Record<number, string> = {
      1: vi ? 'Đặc trưng 1: Nhiều loại hình DN: Nhà nước (Viettel), tư nhân (VinFast) và FDI (Samsung) cùng bình đẳng cạnh tranh.' : 'Char 1: State (Viettel), private (VinFast), and FDI (Samsung) enterprises compete equally.',
      2: vi ? 'Đặc trưng 2: Giá hàng hóa vận hành linh hoạt theo cung – cầu, không bị áp đặt hành chính.' : 'Char 2: Prices fluctuate by supply and demand, not administrative order.',
      3: vi ? 'Đặc trưng 3: Nhà nước quản lý vĩ mô, ban hành Luật DN, Luật Thuế, đầu tư Cao tốc Bắc–Nam và EVN.' : 'Char 3: State provides macro-regulation, legal frameworks, and public infrastructure.',
      4: vi ? 'Đặc trưng 4: Tăng trưởng gắn với công bằng xã hội: bảo hiểm y tế, học bổng vùng cao, cứu trợ thiên tai.' : 'Char 4: Growth paired with social equity: healthcare, highland scholarships, disaster relief.',
      5: vi ? 'Đặc trưng 5: Chủ động hội nhập WTO, ASEAN và thu hút FDI chất lượng cao từ Samsung, Intel.' : 'Char 5: Active integration in WTO, ASEAN and attracting high-quality FDI from Samsung, Intel.',
    };
    setNpcSubtitles(msgs[zoneId] ?? '');
  };

  const handleNextToGameIntro = () => {
    setStep(4);
    setNpcSubtitles(language === 'vi' ? 'Hãy tham gia thử thách để chứng minh năng lực hoạch định chính sách!' : 'Take the challenge to prove your policy-making skills!');
  };

  const handleStartGame = () => {
    setGameIndex(0); setScore(0);
    setSelectedCategory(null); setAnswerStatus('idle');
    setStep(5);
  };

  const handleSelectCategory = (catId: string) => {
    if (answerStatus !== 'idle') return;
    setSelectedCategory(catId);
    const correct = GAME_SITUATIONS[gameIndex].category;
    if (catId === correct) { setAnswerStatus('correct'); setScore(prev => prev + 5); }
    else { setAnswerStatus('incorrect'); }
    setTimeout(() => {
      setSelectedCategory(null); setAnswerStatus('idle');
      if (gameIndex < GAME_SITUATIONS.length - 1) setGameIndex(prev => prev + 1);
      else setStep(6);
    }, 1500);
  };

  // ── Render ──
  return (
    <BaseRoomPlain galleryId={galleryId} customSettings={modifiedSettings} isVisible={isVisible}>

      {/* ── Global Lighting ── */}
      <ambientLight intensity={entranceLight} />
      <directionalLight position={[5, 10, 5]} intensity={0.55} />
      <pointLight position={[0, roomHeight - 1, 0]} intensity={isVisible ? 2.8 : 0} distance={38} color="#ffffff" />

      {/* ── Zone 1 — Đa Thành Phần Kinh Tế ── */}
      {isVisible && (
        <>
          <Zone1MultiSector
            onZoneClick={handleZoneClick}
            isActive={activePedestal === 1}
            language={language}
            intensity={zoneIntensities[0]}
          />
          <ZoneNPC
            position={[3.5, 0.05, -38]}
            rotation={[0, 0, 0]}
            nameVi="Chuyên gia Kinh tế (Sở hữu)"
            nameEn="Economist (Ownership & Sectors)"
            infoVi="Trong nền kinh tế Việt Nam hiện nay tồn tại nhiều loại hình doanh nghiệp: Doanh nghiệp Nhà nước · Doanh nghiệp tư nhân · Doanh nghiệp có vốn đầu tư nước ngoài. Các doanh nghiệp này cùng cạnh tranh và cùng phát triển."
            infoEn="Vietnam's current economy includes multiple enterprise types: State-owned enterprises · Private enterprises · Foreign-invested enterprises. These entities compete and grow together."
            language={language}
            color="#ef4444"
            isVisible={isVisible}
            activeIntensity={zoneIntensities[0]}
          />
        </>
      )}

      {/* -- Zone 2 - Co Che Thi Truong -- */}
      {isVisible && (
        <>
          <Zone2BalanceScale
            onZoneClick={handleZoneClick}
            isActive={activePedestal === 2}
            language={language}
            intensity={zoneIntensities[1]}
          />
          <ZoneNPC
            position={[2.4, 0.05, -14]}
            rotation={[0, 0, 0]}
            nameVi="Chuyên gia Kinh tế (Thị trường)"
            nameEn="Economist (Market Mechanism)"
            infoVi="Giá cả hàng hóa và dịch vụ được quyết định bởi quy luật cung - cầu khách quan, không còn bị áp đặt hành chính."
            infoEn="Prices of goods and services are dynamically determined by supply and demand, free from administrative controls."
            language={language}
            color="#eab308"
            isVisible={isVisible}
            activeIntensity={zoneIntensities[1]}
          />
        </>
      )}

      {/* -- Zone 3 - Nha Nuoc Quan Ly -- */}
      {isVisible && (
        <>
          <Zone3StateRegulation
            onZoneClick={handleZoneClick}
            isActive={activePedestal === 3}
            language={language}
            intensity={zoneIntensities[2]}
          />
          <ZoneNPC
            position={[2.4, 0.05, 12.5]}
            rotation={[0, 0, 0]}
            nameVi="Chuyên gia Kinh tế (Nhà nước)"
            nameEn="Economist (State Regulation)"
            infoVi="Nhà nước quản lý vĩ mô bằng pháp luật (Luật DN, Thuế), đầu tư hạ tầng thiết yếu (EVN, Cao tốc) để giữ ổn định kinh tế."
            infoEn="The State regulates the macroeconomy via laws (Tax, Enterprise) and invests in public infrastructure (EVN, Highway)."
            language={language}
            color="#06b6d4"
            isVisible={isVisible}
            activeIntensity={zoneIntensities[2]}
          />
        </>
      )}

      {/* -- Zone 4 - Cong Bang Xa Hoi -- */}
      {isVisible && (
        <>
          <Zone4SocialEquity
            onZoneClick={handleZoneClick}
            isActive={activePedestal === 4}
            language={language}
            intensity={zoneIntensities[3]}
          />
          <ZoneNPC
            position={[2.4, 0.05, 37.5]}
            rotation={[0, 0, 0]}
            nameVi="Chuyên gia Kinh tế (An sinh)"
            nameEn="Economist (Social Welfare)"
            infoVi="Mục tiêu của Việt Nam không chỉ là tăng trưởng kinh tế. Mà còn hướng tới nâng cao chất lượng cuộc sống và bảo đảm cơ hội phát triển cho mọi người."
            infoEn="Vietnam's goal is not merely economic growth — it also aims to improve quality of life and ensure equal development opportunities for everyone."
            language={language}
            color="#f97316"
            isVisible={isVisible}
            activeIntensity={zoneIntensities[3]}
          />
        </>
      )}

      {/* -- Zone 5 - Hoi Nhap Quoc Te -- */}
      {isVisible && (
        <>
          <Zone5InternationalIntegration
            onZoneClick={handleZoneClick}
            isActive={activePedestal === 5}
            language={language}
            intensity={zoneIntensities[4]}
          />
          <ZoneNPC
            position={[2.4, 0.05, 62.5]}
            rotation={[0, 0, 0]}
            nameVi="Chuyên gia Kinh tế (Hội nhập)"
            nameEn="Economist (Global Integration)"
            infoVi="Việt Nam chủ động hợp tác với các quốc gia trên thế giới. Thu hút đầu tư. Mở rộng xuất khẩu. Nâng cao năng lực cạnh tranh."
            infoEn="Vietnam proactively cooperates with countries worldwide — attracting investment, expanding exports, and enhancing its competitive capacity."
            language={language}
            color="#3b82f6"
            isVisible={isVisible}
            activeIntensity={zoneIntensities[4]}
          />
        </>
      )}

      {/* ── NPC 2D (Hologram Cố Vấn Triển Lãm) gần vách ngăn thứ nhất ── */}
      {isVisible && (
        <group
          position={[-2.2, 1.2, -51.5]}
          rotation={[0, Math.PI - 0.2, 0]}
        >
          {/* Vòng sáng chân đế */}
          <mesh position={[0, -1.18, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.35, 0.45, 32]} />
            <meshBasicMaterial color="#6366f1" toneMapped={false} />
          </mesh>

          {/* Thân thẻ hologram 2D đứng */}
          <mesh>
            <planeGeometry args={[1.0, 1.6]} />
            <meshStandardMaterial
              color="#1e1b4b"
              emissive="#6366f1"
              emissiveIntensity={0.25}
              transparent
              opacity={0.75}
              roughness={0.1}
            />
          </mesh>

          {/* Khung viền phát sáng */}
          <lineSegments>
            <edgesGeometry args={[new THREE.PlaneGeometry(1.0, 1.6)]} />
            <lineBasicMaterial color="#818cf8" linewidth={2} />
          </lineSegments>

          {/* Nội dung hiển thị HTML dính liền trên tấm hologram */}
          <Html transform distanceFactor={3.2} position={[0, 0, 0.01]} center>
            <div className="w-[180px] h-[280px] flex flex-col items-center justify-between p-3 select-none text-center font-sans text-white">
              <div className="flex flex-col items-center gap-1.5 mt-2">
                <div className="w-14 h-14 rounded-full border-2 border-indigo-400 bg-indigo-950/80 flex items-center justify-center text-3xl shadow-lg shadow-indigo-500/20 animate-pulse">
                  🕵️‍♂️
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-[10px] font-black text-indigo-300 uppercase tracking-wider">
                    Nguyễn Minh Tâm
                  </h4>
                  <p className="text-[7px] text-indigo-400 font-bold uppercase tracking-widest">
                    Thành viên nhóm 7
                  </p>
                </div>
              </div>

              <div className="bg-slate-950/85 border border-indigo-500/30 rounded-xl p-2.5 my-2 shadow-inner">
                <p className="text-[8px] leading-relaxed text-indigo-200 font-semibold">
                  "Sau Đổi mới và hội nhập, Việt Nam phát triển rất nhanh. Nhưng bạn có biết chúng ta đang đi theo mô hình kinh tế nào?"
                </p>
              </div>

            </div>
          </Html>
        </group>
      )}











      {/* ── 2D UI OVERLAYS ── */}
      {(step === 1 || step === 5 || step === 6) && (
        <Html fullscreen className="pointer-events-none z-50">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-4 bg-black/30">
            <div className="w-full max-w-4xl h-[540px] bg-slate-950/90 backdrop-blur-xl border border-slate-800/80 rounded-3xl overflow-hidden flex flex-col items-center justify-center relative shadow-[0_0_80px_rgba(34,211,238,0.12)] pointer-events-auto">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(15,23,42,0.4)_0%,#030712_100%)] z-0" />
              <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-8">

                {/* ── Step 1: LED Slideshow ── */}
                {/* {step === 1 && (
                  <div className="w-full h-full flex flex-col items-center justify-between py-6">
                    <span className="text-xs bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                      Đổi mới &amp; Hội nhập Quốc tế
                    </span>
                    <div className="w-[640px] h-[280px] rounded-2xl overflow-hidden border border-cyan-500/30 relative shadow-2xl">
                      <img src={SLIDESHOW_IMAGES[currentSlide].url} alt="slideshow" className="w-full h-full object-cover transition-opacity duration-500" />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/50 to-transparent p-4 text-center">
                        <p className="text-sm font-bold text-white tracking-wide">{SLIDESHOW_IMAGES[currentSlide].label}</p>
                      </div>
                    </div>
                    <div className="bg-slate-900/60 backdrop-blur border border-white/10 px-6 py-2.5 rounded-full text-xs font-semibold max-w-2xl text-center">
                      {currentSlide <= 4
                        ? <span className="text-slate-200">"Sau Đổi mới và hội nhập quốc tế, Việt Nam phát triển nhanh hơn bao giờ hết."</span>
                        : currentSlide <= 7
                          ? <span className="text-amber-400 font-extrabold text-sm">"Nhưng..."</span>
                          : <span className="text-cyan-400 font-extrabold text-sm">"Việt Nam đang phát triển theo mô hình kinh tế nào?"</span>
                      }
                    </div>
                  </div>
                )} */}



                {/* ── Step 5: Minigame ── */}
                {/* {step === 5 && (
                  <div className="w-full h-full flex flex-col justify-between py-6">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3 px-6">
                      <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5 uppercase tracking-wide">
                        📊 Câu hỏi {gameIndex + 1} / {GAME_SITUATIONS.length}
                      </span>
                      <div className="bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg text-xs font-bold text-amber-500">
                        Điểm: <span className="font-mono font-black">{score} / 100</span>
                      </div>
                    </div>
                    <div className="my-auto max-w-xl mx-auto text-center px-4">
                      <div className="bg-slate-900/80 border border-slate-800/60 p-5 rounded-2xl shadow-xl space-y-3">
                        <span className="text-[9px] bg-slate-850 text-slate-400 border border-slate-800 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                          Tình huống thực tế
                        </span>
                        <p className="text-base font-bold text-slate-100 leading-relaxed">
                          "{GAME_SITUATIONS[gameIndex].text}"
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-5 gap-2 px-6">
                      {CATEGORIES.map((cat) => {
                        const isSelected = selectedCategory === cat.id;
                        const isCorrect = cat.id === GAME_SITUATIONS[gameIndex].category;
                        let btnStyle = "bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white";
                        if (answerStatus !== 'idle') {
                          if (isSelected) btnStyle = isCorrect ? "bg-emerald-500 border-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20" : "bg-rose-500 border-rose-400 text-slate-950";
                          else if (isCorrect) btnStyle = "bg-emerald-500/20 border-emerald-500/40 text-emerald-400";
                        }
                        return (
                          <button
                            key={cat.id}
                            disabled={answerStatus !== 'idle'}
                            onClick={() => handleSelectCategory(cat.id)}
                            className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all text-[9px] font-bold gap-1 cursor-pointer select-none active:scale-95 ${btnStyle}`}
                          >
                            <span className="text-lg">{cat.icon}</span>
                            <span className="text-center leading-tight truncate w-full">{cat.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )} */}

                {/* ── Step 6: Game Complete ── */}
                {/* {step === 6 && (
                  <div className="text-center space-y-4 max-w-2xl px-6">
                    <span className="text-4xl">🏆</span>
                    <div className="space-y-1">
                      <h2 className="text-xl font-extrabold text-white">Thử Thách Hoàn Thành!</h2>
                      <p className="text-xs text-emerald-400 font-bold">Bạn đạt được: {score} / 100 điểm</p>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed text-justify px-4">
                      "Qua bốn phòng của bảo tàng, chúng ta đã chứng kiến hành trình lịch sử rõ nét: từ nền kinh tế kế hoạch hóa tập trung thời bao cấp nghèo nàn, qua Đổi mới mở cửa bứt phá, rồi đến nền kinh tế thị trường định hướng XHCN. Đây là mô hình phát triển độc đáo để Việt Nam vừa giải phóng sức sản xuất thị trường, vừa đảm bảo phát triển vì con người và công bằng xã hội."
                    </p>
                    <button onClick={handleStartGame} className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-500 hover:text-amber-400 font-bold px-5 py-2 rounded-lg text-[10px] cursor-pointer active:scale-95">
                      🔄 Chơi lại game
                    </button>
                  </div>
                )} */}

              </div>
            </div>
          </div>
        </Html>
      )}
    </BaseRoomPlain>
  );
};

export default RoomFour;
