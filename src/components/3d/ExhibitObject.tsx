import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { Exhibit } from '@/lib/db';
import { useMuseum } from '@/context/MuseumContext';

interface ExhibitObjectProps {
  exhibit: Exhibit;
  isVisible?: boolean;
  onClick?: (exhibit: Exhibit) => void;
}

// Hàm tự động vẽ tranh thủ công giả lập thời bao cấp khi gặp lỗi CORS tải ảnh từ Unsplash
function createProceduralTexture(title: string, id: string): string {
  if (typeof window === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // 1. Phông nền giấy cũ ố vàng cổ xưa
  const grad = ctx.createRadialGradient(256, 256, 20, 256, 256, 360);
  grad.addColorStop(0, '#fdfcf7');
  grad.addColorStop(0.7, '#f4ecd8');
  grad.addColorStop(1, '#dfceab');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // 2. Khung viền vẽ tay mỹ thuật
  ctx.strokeStyle = '#5c4033';
  ctx.lineWidth = 14;
  ctx.strokeRect(25, 25, 462, 462);
  ctx.strokeStyle = '#8b5a2b';
  ctx.lineWidth = 4;
  ctx.strokeRect(40, 40, 432, 432);

  // 3. Vẽ hình vẽ phác thảo mô phỏng hiện vật dựa trên ID
  ctx.fillStyle = '#2b1a08';
  ctx.strokeStyle = '#2b1a08';
  ctx.lineWidth = 4;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const drawStamp = (x: number, y: number, text: string) => {
    ctx.strokeRect(x - 50, y - 35, 100, 70);
    ctx.font = '10px Courier New';
    ctx.fillText('TEM PHIẾU', x, y - 15);
    ctx.font = 'bold 12px Courier New';
    ctx.fillText(text, x, y + 10);
  };

  if (id.includes('coupon')) {
    drawStamp(160, 180, 'GAO');
    drawStamp(352, 180, 'THIT');
    drawStamp(160, 330, 'DUONG');
    drawStamp(352, 330, 'VAI');
    ctx.beginPath();
    ctx.moveTo(60, 256); ctx.lineTo(452, 256);
    ctx.moveTo(256, 60); ctx.lineTo(256, 452);
    ctx.strokeStyle = '#8b5a2b';
    ctx.lineWidth = 2;
    ctx.stroke();
  } else if (id.includes('ricebook')) {
    ctx.strokeRect(170, 130, 172, 252);
    ctx.beginPath();
    ctx.moveTo(195, 130); ctx.lineTo(195, 382);
    ctx.stroke();
    ctx.font = 'bold 20px Georgia';
    ctx.fillText('SO GAO', 260, 180);
    ctx.font = '12px Courier New';
    ctx.fillText('HO GIA DINH', 260, 220);
    ctx.fillText('Dinh muc: 13kg', 260, 265);
    ctx.fillText('So: 1042-HN', 260, 310);
  } else if (id.includes('priceboard')) {
    ctx.strokeRect(130, 120, 252, 272);
    ctx.font = 'bold 18px Georgia';
    ctx.fillText('BANG GIA MAU DICH', 256, 160);
    ctx.beginPath();
    ctx.moveTo(150, 190); ctx.lineTo(362, 190);
    ctx.stroke();
    ctx.font = '13px Courier New';
    ctx.fillText('Gao te: 0.40d/kg', 256, 225);
    ctx.fillText('Thit heo: 2.20d/kg', 256, 265);
    ctx.fillText('Duong cat: 1.80d/kg', 256, 305);
    ctx.fillText('Xe phuong hoang: 80d', 256, 345);
  } else if (id.includes('factory')) {
    ctx.beginPath();
    ctx.moveTo(130, 340);
    ctx.lineTo(130, 220);
    ctx.lineTo(190, 260);
    ctx.lineTo(190, 220);
    ctx.lineTo(250, 260);
    ctx.lineTo(250, 220);
    ctx.lineTo(310, 260);
    ctx.lineTo(310, 340);
    ctx.closePath();
    ctx.stroke();
    ctx.strokeRect(325, 170, 25, 170);
    ctx.font = 'bold 16px Georgia';
    ctx.fillText('KE HOACH NHA MAY', 256, 375);
  } else if (id.includes('shop')) {
    ctx.strokeRect(120, 160, 272, 192);
    ctx.strokeRect(145, 220, 95, 132);
    ctx.strokeRect(272, 220, 95, 132);
    ctx.font = 'bold 15px Georgia';
    ctx.fillText('MAU DICH QUOC DOANH', 256, 190);
  } else {
    ctx.font = 'bold 24px Georgia';
    ctx.fillText('NHAN CHUNG', 256, 210);
    ctx.font = 'italic 16px Georgia';
    ctx.fillText('Ky uc bao cap', 256, 250);
    ctx.font = '12px Courier New';
    ctx.fillText('Viet Nam 1976 - 1985', 256, 300);
  }

  return canvas.toDataURL();
}

const PaintingComponent: React.FC<{
  exhibit: Exhibit;
  isSelected: boolean;
  hovered: boolean;
  setHovered: (h: boolean) => void;
  setSelectedExhibit: (e: Exhibit | null) => void;
  setExhibitModalMode: (mode: 'game' | 'info') => void;
  language: 'vi' | 'en';
  isVisible?: boolean;
  isNear: boolean;
  groupRef: React.RefObject<THREE.Group | null>;
  onClick?: (exhibit: Exhibit) => void;
}> = ({ exhibit, isSelected, hovered, setHovered, setSelectedExhibit, setExhibitModalMode, language, isVisible = true, isNear, groupRef, onClick }) => {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [textureError, setTextureError] = useState(false);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);
  const hotspotRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!matRef.current) return;
    if (texture && !textureError) {
      matRef.current.map = texture;
      matRef.current.color.set('#ffffff');
    } else {
      matRef.current.map = null;
      matRef.current.color.set('#1a1a1a');
    }
    matRef.current.needsUpdate = true;
  }, [texture, textureError]);

  useFrame((state) => {
    if (!hotspotRef.current) return;
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 4.5) * 0.18;
    hotspotRef.current.scale.set(pulse, pulse, 1);
  });

  useEffect(() => {
    if (!exhibit.thumbnail_url) return;
    setTextureError(false);
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    const fallbackUrl = createProceduralTexture(language === 'vi' ? exhibit.title.vi : exhibit.title.en, exhibit.id);
    
    loader.load(exhibit.thumbnail_url, (t) => { t.colorSpace = THREE.SRGBColorSpace; setTexture(t); }, undefined, () => {
      if (fallbackUrl) {
        loader.load(fallbackUrl, (t) => { t.colorSpace = THREE.SRGBColorSpace; setTexture(t); }, undefined, () => setTextureError(true));
      } else {
        setTextureError(true);
      }
    });
  }, [exhibit.thumbnail_url, exhibit.id, language]);

  return (
    <group>
      <group 
        ref={groupRef}
        position={[exhibit.coordinate_x, exhibit.coordinate_y + 0.35, exhibit.coordinate_z]}
        rotation={[exhibit.rotation_x, exhibit.rotation_y, exhibit.rotation_z]}
      >
        <mesh
          onPointerDown={(e) => {
            if (!isVisible || !isNear) return;
            e.stopPropagation();
            if (onClick) onClick(exhibit);
            else { setExhibitModalMode('game'); setSelectedExhibit(exhibit); }
          }}
          onPointerOver={(e) => { if (!isVisible || !isNear) return; e.stopPropagation(); setHovered(true); }}
          onPointerOut={() => setHovered(false)}
        >
          <boxGeometry args={[exhibit.scale_x + 0.2, exhibit.scale_y + 0.2, 0.15]} />
          <meshStandardMaterial color={isSelected ? '#d4af37' : '#100f0d'} roughness={0.2} metalness={0.8} />
        </mesh>

        <mesh
          position={[0, 0, 0.08]}
          onPointerDown={(e) => {
            if (!isVisible || !isNear) return;
            e.stopPropagation();
            if (onClick) onClick(exhibit);
            else { setExhibitModalMode('game'); setSelectedExhibit(exhibit); }
          }}
        >
          <planeGeometry args={[exhibit.scale_x, exhibit.scale_y]} />
          <meshBasicMaterial ref={matRef} color="#1a1a1a" side={THREE.DoubleSide} />
        </mesh>

        {isNear && (
          <group position={[0, -(exhibit.scale_y / 2) - 0.45, 0.08]}>
            <mesh>
              <planeGeometry args={[1.8, 0.65]} />
              <meshStandardMaterial color="#fff" roughness={0.1} />
            </mesh>
            <Html position={[0, 0, 0.01]} center distanceFactor={6.5} className="pointer-events-none select-none text-center">
              <div className="w-[160px] bg-white text-black p-2 rounded border border-gray-400 font-sans shadow-lg flex flex-col items-center gap-0.5">
                <p className="text-[12px] font-bold truncate leading-tight w-full text-center">
                  {language === 'vi' ? exhibit.title.vi : exhibit.title.en}
                </p>
                <p className="text-[10px] text-gray-500 truncate leading-tight w-full text-center">
                  {language === 'vi' ? exhibit.author.vi : exhibit.author.en}
                </p>
                <div className="mt-1.5 w-full bg-amber-500 text-slate-950 font-extrabold text-[10px] py-1 rounded text-center uppercase tracking-wider">
                  {language === 'vi' ? 'Xem chi tiết' : 'View Details'}
                </div>
              </div>
            </Html>
          </group>
        )}

        <group
          position={[0, -exhibit.scale_y / 2 - 0.55, 1.42]}
          rotation={[-Math.PI / 10, 0, 0]}
          onPointerDown={(e) => {
            if (!isVisible) return;
            e.stopPropagation();
            if (onClick) onClick(exhibit);
            else { setExhibitModalMode('info'); setSelectedExhibit(exhibit); }
          }}
        >
          <mesh position={[0, 0, 0.14]}>
            <planeGeometry args={[2.25, 1.05]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[-0.34, -0.24, -0.12]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 0.72, 12]} />
            <meshStandardMaterial color="#15100c" roughness={0.35} metalness={0.72} />
          </mesh>
          <mesh position={[0.34, -0.24, -0.12]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 0.72, 12]} />
            <meshStandardMaterial color="#15100c" roughness={0.35} metalness={0.72} />
          </mesh>
          <mesh position={[0, -0.62, -0.28]}>
            <boxGeometry args={[1.25, 0.08, 0.34]} />
            <meshStandardMaterial color="#16100b" roughness={0.42} metalness={0.55} />
          </mesh>
          <mesh position={[0, 0, -0.015]}>
            <boxGeometry args={[1.9, 0.72, 0.05]} />
            <meshStandardMaterial color="#17120d" roughness={0.5} metalness={0.18} />
          </mesh>
          <mesh position={[0, 0, 0.02]}>
            <boxGeometry args={[1.74, 0.56, 0.035]} />
            <meshStandardMaterial color="#f1e3c7" roughness={0.82} metalness={0.02} />
          </mesh>
          <group ref={hotspotRef} position={[0, 0.02, 0.065]}>
            <mesh>
              <circleGeometry args={[0.075, 28]} />
              <meshBasicMaterial color="#ef4444" transparent opacity={0.9} side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[0, 0, 0.005]} scale={[1.55, 1.55, 1]}>
              <ringGeometry args={[0.095, 0.125, 28]} />
              <meshBasicMaterial color="#f87171" transparent opacity={0.32} side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[0, 0, 0.01]} scale={[2.05, 2.05, 1]}>
              <ringGeometry args={[0.13, 0.15, 28]} />
              <meshBasicMaterial color="#fecaca" transparent opacity={0.16} side={THREE.DoubleSide} />
            </mesh>
          </group>
        </group>
      </group>

      <group 
        position={[exhibit.coordinate_x, exhibit.coordinate_y, exhibit.coordinate_z]}
        rotation={[exhibit.rotation_x, exhibit.rotation_y, exhibit.rotation_z]}
      >
        <spotLight
          position={[0, 3, 2]}
          target-position={[0, 0, 0]}
          intensity={isVisible ? 5 : 0}
          distance={8}
          angle={Math.PI / 6}
          penumbra={0.5}
        />
      </group>
    </group>
  );
};

// 2. Tách biệt SculptureComponent ra ngoài
const SculptureComponent: React.FC<{
  exhibit: Exhibit;
  isSelected: boolean;
  hovered: boolean;
  setHovered: (h: boolean) => void;
  setSelectedExhibit: (e: Exhibit | null) => void;
  language: 'vi' | 'en';
  meshRef: React.RefObject<THREE.Group | null>;
  isVisible?: boolean;
  isNear: boolean;
  groupRef: React.RefObject<THREE.Group | null>;
  onClick?: (exhibit: Exhibit) => void;
}> = ({ exhibit, isSelected, hovered, setHovered, setSelectedExhibit, language, meshRef, isVisible = true, isNear, groupRef, onClick }) => {
  return (
    <group>
      {/* Group meshes: luôn hiển thị để người chơi thấy tượng trong phòng */}
      <group 
        ref={groupRef}
        position={[exhibit.coordinate_x, exhibit.coordinate_y, exhibit.coordinate_z]}
        rotation={[exhibit.rotation_x, exhibit.rotation_y, exhibit.rotation_z]}
        onClick={(e) => {
          if (!isVisible || !isNear) return;
          e.stopPropagation();
          if (onClick) {
            onClick(exhibit);
          } else {
            setSelectedExhibit(exhibit);
          }
        }}
        onPointerOver={(e) => {
          if (!isVisible || !isNear) return;
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        <group ref={meshRef}>
          {exhibit.model_3d_url === 'procedural-torusknot' && (
            /* Vòng xoắn hoàng kim */
            <mesh>
              <torusKnotGeometry args={[0.4, 0.12, 120, 16]} />
              <meshStandardMaterial 
                color={hovered || isSelected ? '#ffd700' : '#c59b27'}
                roughness={0.1}
                metalness={0.95}
              />
            </mesh>
          )}

          {exhibit.model_3d_url === 'procedural-octahedron' && (
            /* Tinh thể đa diện */
            <mesh>
              <octahedronGeometry args={[0.5]} />
              <meshStandardMaterial 
                color={hovered || isSelected ? '#a5f3fc' : '#06b6d4'}
                roughness={0.05}
                metalness={0.9}
                transparent
                opacity={0.85}
              />
            </mesh>
          )}

          {exhibit.model_3d_url === 'procedural-helix' && (
            /* Trụ xoắn sinh học ghép từ các sphere */
            <group>
              <mesh>
                <cylinderGeometry args={[0.08, 0.08, 1.2, 16]} />
                <meshStandardMaterial color="#0f0f12" metalness={0.8} roughness={0.2} />
              </mesh>
              {Array.from({ length: 10 }).map((_, idx) => {
                const angle = (idx / 10) * Math.PI * 4;
                const y = -0.5 + (idx / 9);
                const r = 0.35;
                const x1 = Math.sin(angle) * r;
                const z1 = Math.cos(angle) * r;
                const x2 = Math.sin(angle + Math.PI) * r;
                const z2 = Math.cos(angle + Math.PI) * r;
                
                return (
                  <group key={idx}>
                    <mesh position={[x1, y, z1]}>
                      <sphereGeometry args={[0.08, 16, 16]} />
                      <meshStandardMaterial 
                        color={hovered || isSelected ? '#fb7185' : '#e11d48'} 
                        roughness={0.1}
                        metalness={0.5}
                      />
                    </mesh>
                    <mesh position={[x2, y, z2]}>
                      <sphereGeometry args={[0.08, 16, 16]} />
                      <meshStandardMaterial 
                        color={hovered || isSelected ? '#38bdf8' : '#0284c7'} 
                        roughness={0.1}
                        metalness={0.5}
                      />
                    </mesh>
                  </group>
                );
              })}
            </group>
          )}
        </group>

        {/* Vòng tròn hiệu ứng hào quang phát sáng dưới chân tượng */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.38, 0]}>
          <ringGeometry args={[0.45, 0.5, 32]} />
          <meshBasicMaterial 
            color={isSelected ? '#d4af37' : hovered ? '#fff' : '#475569'} 
            side={THREE.DoubleSide} 
          />
        </mesh>

        {/* Nhãn tên hiện vật: HIỂN THỊ SẴN 3D (Html transform) nghiêng góc 30 độ hướng lên trên như bảng tên đặt tại bệ tượng */}
        {isNear && (
          <Html 
            position={[0, -0.58, 0.46]} 
            center 
            transform
            occlude="blending"
            rotation={[-Math.PI / 6, 0, 0]}
            distanceFactor={3.2}
            className="pointer-events-none select-none text-center"
          >
            <div className="w-[160px] bg-slate-900/95 text-white p-2.5 rounded-lg border border-slate-700 font-sans shadow-2xl backdrop-blur-sm flex flex-col items-center gap-0.5 pointer-events-none select-none">
              <p className="text-[12px] font-bold text-amber-400 leading-tight w-full text-center">
                {language === 'vi' ? exhibit.title.vi : exhibit.title.en}
              </p>
              <p className="text-[10px] text-slate-400 mt-1 leading-none font-sans w-full text-center">
                {language === 'vi' ? exhibit.author.vi : exhibit.author.en}
              </p>
              <div className="mt-1.5 w-full bg-amber-500 text-slate-950 font-extrabold text-[10px] py-1 rounded text-center uppercase tracking-wider font-mono">
                {language === 'vi' ? 'Xem chi tiết' : 'View Details'}
              </div>
            </div>
          </Html>
        )}
      </group>

      {/* Đèn spotlight rọi tượng: luôn trong scene graph để tránh recompilation, chỉ đổi intensity, loại bỏ để tránh lag */}
      <group 
        position={[exhibit.coordinate_x, exhibit.coordinate_y, exhibit.coordinate_z]}
        rotation={[exhibit.rotation_x, exhibit.rotation_y, exhibit.rotation_z]}
      >
        <spotLight
          position={[0, 4, 0]}
          target-position={[0, 0, 0]}
          intensity={isVisible ? 6 : 0}
          distance={6}
          angle={Math.PI / 6}
          penumbra={0.3}
        />
      </group>
    </group>
  );
};

export const ExhibitObject: React.FC<ExhibitObjectProps> = ({ exhibit, isVisible = true, onClick }) => {
  const { selectedExhibit, setSelectedExhibit, setExhibitModalMode, language } = useMuseum();
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Group>(null);
  const isSelected = selectedExhibit?.id === exhibit.id;

  const groupRef = useRef<THREE.Group>(null);
  const [isNear, setIsNear] = useState(false);
  const worldPos = useRef(new THREE.Vector3()).current;
  const playerPos = useRef(new THREE.Vector3()).current;

  // Xoay các tượng điêu khắc 3D tự động để tạo chuyển động sinh động
  useFrame((state) => {
    if (isVisible && meshRef.current && exhibit.model_3d_url) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.4;
      // Thêm chuyển động nhấp nhô nhẹ cho tượng
      if (exhibit.id === 'sculpture-octahedron') {
        meshRef.current.position.y = exhibit.coordinate_y + Math.sin(state.clock.getElapsedTime() * 1.5) * 0.1;
      }
    }

    // Tính khoảng cách đến nhân vật người chơi để hiển thị nút Xem chi tiết
    if (isVisible && groupRef.current) {
      const player = state.scene.getObjectByName('player-character') || state.scene.getObjectByName('lobby-player');
      if (player) {
        groupRef.current.getWorldPosition(worldPos);
        player.getWorldPosition(playerPos);
        const dist = worldPos.distanceTo(playerPos);
        const near = dist < 5.0; // Khoảng cách 5 mét
        if (near !== isNear) {
          setIsNear(near);
        }
      }
    }
  });

  // Thay đổi con trỏ chuột khi hover vào vật thể tương tác
  useEffect(() => {
    document.body.style.cursor = (hovered && isVisible && isNear) ? 'pointer' : 'auto';
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, [hovered, isVisible, isNear]);

  if (exhibit.model_3d_url) {
    return (
      <SculptureComponent
        exhibit={exhibit}
        isSelected={isSelected}
        hovered={hovered}
        setHovered={setHovered}
        setSelectedExhibit={setSelectedExhibit}
        language={language}
        meshRef={meshRef}
        isVisible={isVisible}
        isNear={isNear}
        groupRef={groupRef}
        onClick={onClick}
      />
    );
  } else {
    return (
      <PaintingComponent
        exhibit={exhibit}
        isSelected={isSelected}
        hovered={hovered}
        setHovered={setHovered}
        setSelectedExhibit={setSelectedExhibit}
        setExhibitModalMode={setExhibitModalMode}
        language={language}
        isVisible={isVisible}
        isNear={isNear}
        groupRef={groupRef}
        onClick={onClick}
      />
    );
  }
};

