import React, { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ExhibitionRoom } from './ExhibitionRoom';
import { ExhibitObject } from './ExhibitObject';
import { MultiplayerAvatars } from './MultiplayerAvatars';
import { PlayerCharacter } from './PlayerCharacter';
import { useMuseum } from '@/context/MuseumContext';
import { Exhibit } from '@/lib/db';

interface GalleryCanvasProps {
  exhibits: Exhibit[];
  galleryId: string;
}

// Bộ điều khiển camera góc nhìn thứ 3 bằng Pointer Lock (Third-Person Pointer Lock Camera)
const CameraLerpController: React.FC = () => {
  const { 
    selectedExhibit, 
    activeGallery,
  } = useMuseum();
  
  const { camera, gl } = useThree();
  const isSculptures = activeGallery?.id === 'gallery-sculptures';

  // Góc xoay cầu của camera xung quanh nhân vật (theta: ngang, phi: dọc)
  const theta = useRef(Math.PI); // Azimuthal angle (Xoay ngang, mặc định nhìn về phía trước)
  const phi = useRef(Math.PI / 2.3); // Polar angle (Xoay dọc, hơi nhìn xuống)
  
  const currentLookAt = useRef(new THREE.Vector3(0, 1.2, 12));
  const targetPos = useRef(new THREE.Vector3(0, 1.7, 7));
  const targetLookAt = useRef(new THREE.Vector3(0, 1.7, 0));

  const wasInspecting = useRef(false);

  // Xử lý sự kiện di chuyển chuột khi đã khóa pointer
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement !== gl.domElement) return;

      const sensitivity = 0.0025; // Tốc độ xoay camera nhạy hơn một chút
      theta.current -= e.movementX * sensitivity;
      phi.current -= e.movementY * sensitivity;

      // Giới hạn góc nhìn lên xuống (tránh lật camera hoặc đi xuyên sàn)
      const minPhi = 0.35; // Góc nhìn từ trên xuống
      const maxPhi = Math.PI / 2 - 0.08; // Góc nhìn ngang sát sàn
      phi.current = Math.max(minPhi, Math.min(maxPhi, phi.current));
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [gl]);

  // Click vào canvas để kích hoạt Pointer Lock
  useEffect(() => {
    const canvas = gl.domElement;
    const handleCanvasClick = () => {
      if (selectedExhibit) return; // Không khóa chuột khi đang xem chi tiết tác phẩm
      if (document.pointerLockElement !== canvas) {
        canvas.requestPointerLock();
      }
    };

    canvas.addEventListener('click', handleCanvasClick);
    return () => {
      canvas.removeEventListener('click', handleCanvasClick);
    };
  }, [gl, selectedExhibit]);

  // Tự động nhả khóa chuột khi xem chi tiết tác phẩm (mở Inspect Modal)
  useEffect(() => {
    if (selectedExhibit && document.pointerLockElement) {
      document.exitPointerLock();
    }
  }, [selectedExhibit]);

  // Cập nhật tọa độ camera khi ở chế độ Inspect
  useEffect(() => {
    if (selectedExhibit) {
      const rotY = selectedExhibit.rotation_y;
      const viewDistance = selectedExhibit.model_3d_url ? 2.5 : 2.0;
      
      const offsetX = Math.sin(rotY) * viewDistance;
      const offsetZ = Math.cos(rotY) * viewDistance;
      
      targetPos.current.set(
        selectedExhibit.coordinate_x + offsetX,
        selectedExhibit.coordinate_y - 0.2,
        selectedExhibit.coordinate_z + offsetZ
      );
      
      targetLookAt.current.set(
        selectedExhibit.coordinate_x,
        selectedExhibit.coordinate_y - 0.2,
        selectedExhibit.coordinate_z
      );
      wasInspecting.current = true;
    }
  }, [selectedExhibit]);

  // Hàm tính toán khoảng cách camera an toàn để tránh xuyên tường/trần/vách ngăn
  const getSafeCameraDistance = (
    px: number,
    py: number,
    pz: number,
    targetHeight: number,
    xOffset: number,
    yOffset: number,
    zOffset: number
  ) => {
    const idealDistance = 3.2;
    const dir = new THREE.Vector3(xOffset, yOffset, zOffset);
    const dist = dir.length();
    dir.normalize();

    let minT = dist;

    // 1. Kiểm tra va chạm với tường phòng (X: -6m -> 6m, Z: -15m -> 15m)
    // Tường trái (X = -5.8) và tường phải (X = 5.8)
    if (dir.x < 0) {
      const t = (-5.75 - px) / dir.x;
      if (t > 0 && t < minT) minT = t;
    } else if (dir.x > 0) {
      const t = (5.75 - px) / dir.x;
      if (t > 0 && t < minT) minT = t;
    }

    // Tường trước (Z = -14.75) và tường sau (Z = 14.75)
    if (dir.z < 0) {
      const t = (-14.75 - pz) / dir.z;
      if (t > 0 && t < minT) minT = t;
    } else if (dir.z > 0) {
      const t = (14.75 - pz) / dir.z;
      if (t > 0 && t < minT) minT = t;
    }

    // Trần nhà (Y = 5.5) và sàn nhà (Y = 0.2)
    if (dir.y > 0) {
      const t = (5.5 - targetHeight) / dir.y;
      if (t > 0 && t < minT) minT = t;
    } else if (dir.y < 0) {
      const t = (0.25 - targetHeight) / dir.y;
      if (t > 0 && t < minT) minT = t;
    }

    // 2. Va chạm với vách ngăn trung tâm tại Z = 0 (chỉ phòng tranh)
    if (!isSculptures) {
      if (dir.z !== 0) {
        // Vách ngăn dày 0.4m => biên giới hạn ở Z = 0.22 hoặc Z = -0.22 dựa theo vị trí người chơi
        const wallZ = pz > 0 ? 0.22 : -0.22;
        const t = (wallZ - pz) / dir.z;
        if (t > 0 && t < minT) {
          const intersectX = px + t * dir.x;
          // Vách ngăn rộng từ X = -3m đến 3m (cộng thêm biên an toàn thành -3.1m đến 3.1m)
          if (intersectX > -3.1 && intersectX < 3.1) {
            minT = t;
          }
        }
      }
    }

    // Trả về khoảng cách an toàn, trừ đi một khoảng đệm nhỏ 0.2m để camera không nằm sát sạt tường
    // Giới hạn khoảng cách tối thiểu 0.6m để không chui vào đầu nhân vật
    return Math.max(0.6, minT - 0.2);
  };

  useFrame((state) => {
    const player = state.scene.getObjectByName('player-character');
    if (!player) return;

    const px = player.position.x;
    const py = player.position.y;
    const pz = player.position.z;
    const targetHeight = py + 0.35; // Nhắm vào đầu nhân vật

    if (selectedExhibit) {
      // --- CHẾ ĐỘ INSPECT: Khóa góc nhìn vào tác phẩm ---
      camera.position.lerp(targetPos.current, 0.08);
      currentLookAt.current.lerp(targetLookAt.current, 0.08);
      camera.lookAt(currentLookAt.current);
    } else {
      // --- CHẾ ĐỘ FOLLOW: Bám đuôi nhân vật góc nhìn thứ 3 bằng Pointer Lock ---
      const distance = 3.2; // Khoảng cách lý tưởng ban đầu từ camera đến nhân vật
      
      // Tính toán vị trí camera mục tiêu dựa trên tọa độ cầu lý thuyết
      const xOffset = distance * Math.sin(theta.current) * Math.sin(phi.current);
      const yOffset = distance * Math.cos(phi.current);
      const zOffset = distance * Math.cos(theta.current) * Math.sin(phi.current);

      // Tính khoảng cách camera an toàn chống xuyên tường
      const safeDistance = getSafeCameraDistance(px, py, pz, targetHeight, xOffset, yOffset, zOffset);

      // Cập nhật vị trí camera thực tế dựa trên khoảng cách an toàn
      const safeXOffset = safeDistance * Math.sin(theta.current) * Math.sin(phi.current);
      const safeYOffset = safeDistance * Math.cos(phi.current);
      const safeZOffset = safeDistance * Math.cos(theta.current) * Math.sin(phi.current);

      const targetCamPos = new THREE.Vector3(px + safeXOffset, targetHeight + safeYOffset, pz + safeZOffset);
      const targetLookTarget = new THREE.Vector3(px, targetHeight, pz);

      if (wasInspecting.current) {
        // Mới thoát inspect: Lerp mượt mà cả vị trí và hướng nhìn về phía sau nhân vật
        camera.position.lerp(targetCamPos, 0.08);
        currentLookAt.current.lerp(targetLookTarget, 0.08);
        camera.lookAt(currentLookAt.current);

        if (camera.position.distanceTo(targetCamPos) < 0.2) {
          wasInspecting.current = false;
        }
      } else {
        // Trạng thái bình thường: Lerp vị trí và hướng nhìn mượt mà
        camera.position.lerp(targetCamPos, 0.15);
        currentLookAt.current.lerp(targetLookTarget, 0.15);
        camera.lookAt(currentLookAt.current);
      }
    }
  });

  return null;
};

export const GalleryCanvas: React.FC<GalleryCanvasProps> = ({ exhibits, galleryId }) => {
  const { selectedExhibit, setSelectedExhibit } = useMuseum();
  const [isLocked, setIsLocked] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Lắng nghe sự kiện thay đổi trạng thái khóa chuột (Pointer Lock)
  useEffect(() => {
    const handleLockChange = () => {
      setIsLocked(document.pointerLockElement !== null);
    };
    document.addEventListener('pointerlockchange', handleLockChange);
    return () => {
      document.removeEventListener('pointerlockchange', handleLockChange);
    };
  }, []);

  // Yêu cầu Pointer Lock từ container chứa canvas
  const handleRequestLock = () => {
    const canvas = containerRef.current?.querySelector('canvas');
    if (canvas && document.pointerLockElement !== canvas) {
      canvas.requestPointerLock();
    }
  };

  // Xử lý click ngoài tác phẩm để hủy tiêu điểm phóng to
  const handleMiss = (e: any) => {
    if (e.target === e.currentTarget || e.target.name === 'floor-grid') {
      setSelectedExhibit(null);
    }
  };

  return (
    <div ref={containerRef} className="w-full h-full bg-[#0a0a0d] relative overflow-hidden select-none">
      {/* 3D Canvas */}
      <Canvas
        shadows
        camera={{ position: [0, 2.0, 14.5], fov: 60 }}
        onClick={handleMiss}
      >
        <color attach="background" args={['#0a0a0d']} />
        <fog attach="fog" args={['#0a0a0d', 5, 18]} />

        {/* Ánh sáng chung (tăng độ sáng) */}
        <ambientLight intensity={0.45} />
        
        {/* Ánh sáng đổ bóng xéo */}
        <directionalLight 
          position={[5, 12, 5]} 
          intensity={0.5} 
          castShadow 
          shadow-mapSize-width={1024} 
          shadow-mapSize-height={1024} 
        />

        {/* Ánh sáng tự nhiên từ giếng trời chiếu thẳng xuống */}
        <directionalLight 
          position={[0, 10, 0]} 
          intensity={0.8} 
          color="#f0f9ff"
        />

        <Suspense fallback={null}>
          {/* Phòng triển lãm */}
          <ExhibitionRoom galleryId={galleryId} />

          {/* Các tác phẩm/hiện vật */}
          {exhibits.map((exhibit) => (
            <ExhibitObject key={exhibit.id} exhibit={exhibit} />
          ))}

          {/* Nhân vật của người chơi hiện tại (Góc nhìn thứ 3) */}
          <PlayerCharacter />

          {/* Những người chơi khác trực tuyến */}
          <MultiplayerAvatars />
        </Suspense>

        {/* Cầu nối điều khiển camera bám theo nhân vật */}
        <CameraLerpController />
      </Canvas>

      {/* Màn hình tối mờ yêu cầu khóa chuột để xoay camera/di chuyển */}
      {!isLocked && !selectedExhibit && (
        <div 
          onClick={handleRequestLock}
          className="absolute inset-0 bg-black/85 backdrop-blur-[4px] z-20 flex flex-col items-center justify-center cursor-pointer transition-all duration-300"
        >
          <div className="bg-slate-950/90 border border-amber-500/30 p-8 rounded-2xl shadow-2xl text-center max-w-xs sm:max-w-sm mx-4 transform transition-all duration-300 hover:border-amber-500/50 hover:scale-105">
            <div className="w-16 h-16 bg-amber-500/10 text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/20 animate-pulse">
              <span className="text-3xl">🖱️</span>
            </div>
            <h3 className="text-white text-base sm:text-lg font-bold mb-3 tracking-wider leading-snug">
              Vui lòng ấn vào màn để di chuyển
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-6">
              Nhấp chuột để khóa tâm, xoay camera bằng cách di chuột và đi lại bằng bàn phím (phím W-A-S-D).
            </p>
            <span className="inline-block bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs sm:text-sm font-bold py-2.5 px-6 rounded-full shadow-lg transition-all tracking-wide">
              Bắt đầu di chuyển
            </span>
          </div>
        </div>
      )}

      {/* Tâm ngắm (Crosshair) nhỏ chính giữa màn hình khi khóa chuột */}
      {isLocked && !selectedExhibit && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-white rounded-full border border-black/40 shadow-lg" />
        </div>
      )}

      {/* Hướng dẫn tương tác nâng cấp động */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur-md text-white text-[10px] sm:text-xs py-1.5 px-4 rounded-full pointer-events-none select-none border border-white/10 text-center flex items-center gap-3">
        {!isLocked && !selectedExhibit ? (
          <span>🖱️ <b>Click vào màn hình</b> để khóa chuột & Xoay camera bằng di chuột</span>
        ) : (
          <>
            <span>🏃 <b>W-A-S-D</b> để di chuyển</span>
            <div className="w-px h-3 bg-white/20" />
            <span>🖱️ <b>Di chuyển chuột</b> để xoay camera</span>
            <div className="w-px h-3 bg-white/20" />
            <span>🖼️ <b>Ngắm tâm & Click</b> để xem thuyết minh</span>
            <div className="w-px h-3 bg-white/20" />
            <span>⌨️ <b>Phím ESC</b> để hiện lại chuột</span>
          </>
        )}
      </div>
    </div>
  );
};
export default GalleryCanvas;
