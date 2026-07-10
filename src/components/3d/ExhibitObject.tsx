import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { Exhibit } from '@/lib/db';
import { useMuseum } from '@/context/MuseumContext';

interface ExhibitObjectProps {
  exhibit: Exhibit;
  isVisible?: boolean;
}

// 1. Tách biệt PaintingComponent ra ngoài để tránh định nghĩa lồng nhau và tránh treo Suspense
const PaintingComponent: React.FC<{
  exhibit: Exhibit;
  isSelected: boolean;
  hovered: boolean;
  setHovered: (h: boolean) => void;
  setSelectedExhibit: (e: Exhibit | null) => void;
  language: 'vi' | 'en';
  isVisible?: boolean;
  isNear: boolean;
  groupRef: React.RefObject<THREE.Group | null>;
}> = ({ exhibit, isSelected, hovered, setHovered, setSelectedExhibit, language, isVisible = true, isNear, groupRef }) => {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [textureError, setTextureError] = useState(false);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);

  // Force material update khi texture load xong
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

  useEffect(() => {
    if (!exhibit.thumbnail_url) return;
    
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    loader.load(
      exhibit.thumbnail_url,
      (loadedTexture) => {
        loadedTexture.colorSpace = THREE.SRGBColorSpace;
        loadedTexture.needsUpdate = true;
        setTexture(loadedTexture);
      },
      undefined,
      (err) => {
        console.warn('Lỗi tải texture tranh:', exhibit.thumbnail_url, err);
        setTextureError(true);
      }
    );
  }, [exhibit.thumbnail_url]);

  return (
    <group>
      {/* Group meshes: hiển thị/ẩn dựa trên isVisible */}
      <group 
        ref={groupRef}
        position={[exhibit.coordinate_x, exhibit.coordinate_y, exhibit.coordinate_z]}
        rotation={[exhibit.rotation_x, exhibit.rotation_y, exhibit.rotation_z]}
        onClick={(e) => {
          if (!isVisible || !isNear) return;
          e.stopPropagation();
          setSelectedExhibit(exhibit);
        }}
        onPointerOver={(e) => {
          if (!isVisible || !isNear) return;
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
        visible={isVisible}
      >
        {/* 1. Khung tranh gỗ màu vàng đồng */}
        <mesh>
          <boxGeometry args={[exhibit.scale_x + 0.2, exhibit.scale_y + 0.2, 0.15]} />
          <meshStandardMaterial 
            color={isSelected ? '#d4af37' : '#100f0d'} // Khung sáng vàng nếu đang chọn
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>

        {/* 2. Mặt tranh */}
        <mesh position={[0, 0, 0.08]}>
          <planeGeometry args={[exhibit.scale_x, exhibit.scale_y]} />
          <meshBasicMaterial ref={matRef} color="#1a1a1a" side={THREE.DoubleSide} />
        </mesh>

        {/* 3. Tấm nhãn tên tác phẩm nhỏ bên dưới */}
        {isNear && (
          <group position={[0, -(exhibit.scale_y / 2) - 0.45, 0.08]}>
            <mesh>
              <planeGeometry args={[1.8, 0.65]} />
              <meshStandardMaterial color="#fff" roughness={0.1} />
            </mesh>
            <Html 
              position={[0, 0, 0.01]} 
              center 
              distanceFactor={6.5}
              className="pointer-events-none select-none text-center"
            >
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
      </group>

      {/* Đèn spotlight: luôn trong scene graph để tránh recompile shader, chỉ đổi cường độ */}
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
}> = ({ exhibit, isSelected, hovered, setHovered, setSelectedExhibit, language, meshRef, isVisible = true, isNear, groupRef }) => {
  return (
    <group>
      {/* Group meshes: hiển thị/ẩn dựa trên isVisible */}
      <group 
        ref={groupRef}
        position={[exhibit.coordinate_x, exhibit.coordinate_y, exhibit.coordinate_z]}
        rotation={[exhibit.rotation_x, exhibit.rotation_y, exhibit.rotation_z]}
        onClick={(e) => {
          if (!isVisible || !isNear) return;
          e.stopPropagation();
          setSelectedExhibit(exhibit);
        }}
        onPointerOver={(e) => {
          if (!isVisible || !isNear) return;
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
        visible={isVisible}
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

        {/* Nhãn tên hiện vật */}
        {isNear && (
          <Html 
            position={[0, -0.8, 0]} 
            center 
            distanceFactor={5.0}
            className="pointer-events-none select-none text-center"
          >
            <div className="w-[160px] bg-slate-900/90 text-white p-2 rounded border border-slate-700 font-sans shadow-2xl backdrop-blur-sm flex flex-col items-center gap-0.5">
              <p className="text-[12px] font-bold truncate leading-tight text-amber-400 w-full text-center">
                {language === 'vi' ? exhibit.title.vi : exhibit.title.en}
              </p>
              <p className="text-[10px] text-slate-400 truncate leading-tight w-full text-center">
                {language === 'vi' ? exhibit.author.vi : exhibit.author.en}
              </p>
              <div className="mt-1.5 w-full bg-amber-500 text-slate-950 font-extrabold text-[10px] py-1 rounded text-center uppercase tracking-wider">
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

export const ExhibitObject: React.FC<ExhibitObjectProps> = ({ exhibit, isVisible = true }) => {
  const { selectedExhibit, setSelectedExhibit, language } = useMuseum();
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
        language={language}
        isVisible={isVisible}
        isNear={isNear}
        groupRef={groupRef}
      />
    );
  }
};

