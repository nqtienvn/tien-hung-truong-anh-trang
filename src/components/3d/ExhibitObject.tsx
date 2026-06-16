import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { Exhibit } from '@/lib/db';
import { useMuseum } from '@/context/MuseumContext';

interface ExhibitObjectProps {
  exhibit: Exhibit;
}

// 1. Tách biệt PaintingComponent ra ngoài để tránh định nghĩa lồng nhau và tránh treo Suspense
const PaintingComponent: React.FC<{
  exhibit: Exhibit;
  isSelected: boolean;
  hovered: boolean;
  setHovered: (h: boolean) => void;
  setSelectedExhibit: (e: Exhibit | null) => void;
  language: 'vi' | 'en';
}> = ({ exhibit, isSelected, hovered, setHovered, setSelectedExhibit, language }) => {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [textureError, setTextureError] = useState(false);

  useEffect(() => {
    if (!exhibit.thumbnail_url) return;
    
    const loader = new THREE.TextureLoader();
    loader.load(
      exhibit.thumbnail_url,
      (loadedTexture) => {
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
    <group 
      position={[exhibit.coordinate_x, exhibit.coordinate_y, exhibit.coordinate_z]}
      rotation={[exhibit.rotation_x, exhibit.rotation_y, exhibit.rotation_z]}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedExhibit(exhibit);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      {/* 1. Khung tranh gỗ màu vàng đồng */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[exhibit.scale_x + 0.2, exhibit.scale_y + 0.2, 0.15]} />
        <meshStandardMaterial 
          color={isSelected ? '#d4af37' : '#100f0d'} // Khung sáng vàng nếu đang chọn
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* 2. Mặt tranh */}
      <mesh position={[0, 0, 0.08]} castShadow>
        <planeGeometry args={[exhibit.scale_x, exhibit.scale_y]} />
        {texture && !textureError ? (
          <meshStandardMaterial 
            map={texture} 
            roughness={0.5}
          />
        ) : (
          <meshStandardMaterial 
            color="#2a2e33" 
            roughness={0.8}
          />
        )}
      </mesh>

      {/* Đèn rọi tranh đặt phía trên trần chiếu xuống */}
      <spotLight
        position={[0, 3, 2]}
        target-position={[0, 0, 0]}
        intensity={5}
        distance={8}
        angle={Math.PI / 6}
        penumbra={0.5}
        castShadow
      />

      {/* 3. Tấm nhãn tên tác phẩm nhỏ bên dưới */}
      <group position={[0, -(exhibit.scale_y / 2) - 0.3, 0.08]}>
        <mesh>
          <planeGeometry args={[1.2, 0.4]} />
          <meshStandardMaterial color="#fff" roughness={0.1} />
        </mesh>
        <Html 
          position={[0, 0, 0.01]} 
          center 
          distanceFactor={8}
          className="pointer-events-none select-none text-center"
        >
          <div className="w-[120px] bg-white text-black p-1 rounded border border-gray-400 font-sans shadow-lg">
            <p className="text-[10px] font-bold truncate leading-tight">
              {language === 'vi' ? exhibit.title.vi : exhibit.title.en}
            </p>
            <p className="text-[8px] text-gray-500 truncate leading-tight">
              {language === 'vi' ? exhibit.author.vi : exhibit.author.en}
            </p>
          </div>
        </Html>
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
}> = ({ exhibit, isSelected, hovered, setHovered, setSelectedExhibit, language, meshRef }) => {
  return (
    <group 
      position={[exhibit.coordinate_x, exhibit.coordinate_y, exhibit.coordinate_z]}
      rotation={[exhibit.rotation_x, exhibit.rotation_y, exhibit.rotation_z]}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedExhibit(exhibit);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      <group ref={meshRef}>
        {exhibit.model_3d_url === 'procedural-torusknot' && (
          /* Vòng xoắn hoàng kim */
          <mesh castShadow receiveShadow>
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
          <mesh castShadow receiveShadow>
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
            <mesh castShadow>
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
                  <mesh position={[x1, y, z1]} castShadow>
                    <sphereGeometry args={[0.08, 16, 16]} />
                    <meshStandardMaterial 
                      color={hovered || isSelected ? '#fb7185' : '#e11d48'} 
                      roughness={0.1}
                      metalness={0.5}
                    />
                  </mesh>
                  <mesh position={[x2, y, z2]} castShadow>
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

      {/* SpotLight rọi riêng lên bệ tượng từ trên xuống */}
      <spotLight
        position={[0, 4, 0]}
        target-position={[0, 0, 0]}
        intensity={6}
        distance={6}
        angle={Math.PI / 6}
        penumbra={0.3}
        castShadow
      />

      {/* Nhãn tên hiện vật */}
      <Html 
        position={[0, -0.65, 0]} 
        center 
        distanceFactor={6}
        className="pointer-events-none select-none text-center"
      >
        <div className="w-[120px] bg-slate-900/90 text-white p-1 rounded border border-slate-700 font-sans shadow-2xl backdrop-blur-sm">
          <p className="text-[10px] font-bold truncate leading-tight text-amber-400">
            {language === 'vi' ? exhibit.title.vi : exhibit.title.en}
          </p>
          <p className="text-[8px] text-slate-400 truncate leading-tight">
            {language === 'vi' ? exhibit.author.vi : exhibit.author.en}
          </p>
        </div>
      </Html>
    </group>
  );
};

export const ExhibitObject: React.FC<ExhibitObjectProps> = ({ exhibit }) => {
  const { selectedExhibit, setSelectedExhibit, language } = useMuseum();
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Group>(null);
  const isSelected = selectedExhibit?.id === exhibit.id;

  // Xoay các tượng điêu khắc 3D tự động để tạo chuyển động sinh động
  useFrame((state) => {
    if (meshRef.current && exhibit.model_3d_url) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.4;
      // Thêm chuyển động nhấp nhô nhẹ cho tượng
      if (exhibit.id === 'sculpture-octahedron') {
        meshRef.current.position.y = exhibit.coordinate_y + Math.sin(state.clock.getElapsedTime() * 1.5) * 0.1;
      }
    }
  });

  // Thay đổi con trỏ chuột khi hover vào vật thể tương tác
  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'auto';
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, [hovered]);

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
      />
    );
  }
};

