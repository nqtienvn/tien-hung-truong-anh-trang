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
    nickname,
    settings,
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
  const isMouseDown = useRef(false);

  // Xử lý sự kiện nhấn giữ chuột và kéo để xoay camera (Click & Drag)
  useEffect(() => {
    const canvas = gl.domElement;

    const handleMouseDown = () => {
      isMouseDown.current = true;
    };

    const handleMouseUp = () => {
      isMouseDown.current = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Chỉ xoay camera khi đang giữ chuột trái và không ở chế độ Inspect
      if (!isMouseDown.current || selectedExhibit) return;

      const sensitivity = 0.003; // Tốc độ xoay camera mượt mà
      theta.current -= e.movementX * sensitivity;
      phi.current -= e.movementY * sensitivity;

      // Giới hạn góc nhìn lên xuống (cho phép nhìn lên trên trần nhà)
      const minPhi = 0.35;
      const maxPhi = Math.PI / 2 + 0.4; // Cho phép camera xoay thấp xuống và ngước nhìn lên
      phi.current = Math.max(minPhi, Math.min(maxPhi, phi.current));
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [gl, selectedExhibit]);

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
    const idealDistance = 4.5;
    const dir = new THREE.Vector3(xOffset, yOffset, zOffset);
    const dist = dir.length();
    dir.normalize();

    let minT = dist;

    const roomWidth = activeGallery?.room_width ?? 12;
    const roomLength = activeGallery?.room_length ?? 30;
    const roomHeight = activeGallery?.room_height ?? 6;

    // 1. Kiểm tra va chạm với tường phòng
    const boundaryX = roomWidth / 2 - 0.25;
    const boundaryZ = roomLength / 2 - 0.25;

    // Tường trái và tường phải
    if (dir.x < 0) {
      const t = (-boundaryX - px) / dir.x;
      if (t > 0 && t < minT) minT = t;
    } else if (dir.x > 0) {
      const t = (boundaryX - px) / dir.x;
      if (t > 0 && t < minT) minT = t;
    }

    // Tường trước và sau
    if (dir.z < 0) {
      const t = (-boundaryZ - pz) / dir.z;
      if (t > 0 && t < minT) minT = t;
    } else if (dir.z > 0) {
      const t = (boundaryZ - pz) / dir.z;
      if (t > 0 && t < minT) minT = t;
    }

    // Trần nhà và sàn nhà
    if (dir.y > 0) {
      const t = (roomHeight - 0.5 - targetHeight) / dir.y;
      if (t > 0 && t < minT) minT = t;
    } else if (dir.y < 0) {
      const t = (0.25 - targetHeight) / dir.y;
      if (t > 0 && t < minT) minT = t;
    }

    // 2. Va chạm với tường ngăn tại Z = 3.0 (Paintings divider wall)
    if (dir.z !== 0) {
      const wallZ = pz > 3.0 ? 3.24 : 2.76;
      const t = (wallZ - pz) / dir.z;
      if (t > 0 && t < minT) {
        const intersectX = px + t * dir.x;
        // Chặn camera nếu giao điểm nằm ngoài khoảng cổng mở phía bên trái (X < -5.0 hoặc X > -2.0)
        if (intersectX < -5.0 || intersectX > -2.0) {
          minT = t;
        }
      }
    }

    // 3. Va chạm với tường ngăn tại Z = -3.0 (Sculptures divider wall)
    if (dir.z !== 0) {
      const wallZ = pz > -3.0 ? -2.76 : -3.24;
      const t = (wallZ - pz) / dir.z;
      if (t > 0 && t < minT) {
        const intersectX = px + t * dir.x;
        // Chặn camera nếu giao điểm nằm ngoài khoảng cổng mở phía bên phải (X < 2.0 hoặc X > 5.0)
        if (intersectX < 2.0 || intersectX > 5.0) {
          minT = t;
        }
      }
    }

    // 4. Va chạm với vách ngăn phụ tại Z = 13.0 (Sub-divider wall)
    if (dir.z !== 0) {
      const wallZ = pz > 13.0 ? 13.224 : 12.776;
      const t = (wallZ - pz) / dir.z;
      if (t > 0 && t < minT) {
        const intersectX = px + t * dir.x;
        // Chặn camera nếu giao điểm nằm trong chiều rộng vách ngăn (X từ -6.2 đến 6.2)
        if (intersectX > -6.2 && intersectX < 6.2) {
          minT = t;
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
    const isPawn = settings.preset === 'low';
    const targetHeight = py + (isPawn ? 0.55 : 0.65); // Nhắm vào đầu/thân trên nhân vật đã phóng to 1.6x

    if (selectedExhibit) {
      // --- CHẾ ĐỘ INSPECT: Khóa góc nhìn vào tác phẩm ---
      camera.position.lerp(targetPos.current, 0.08);
      currentLookAt.current.lerp(targetLookAt.current, 0.08);
      camera.lookAt(currentLookAt.current);
    } else {
      // --- CHẾ ĐỘ FOLLOW: Bám đuôi nhân vật góc nhìn thứ 3 bằng Pointer Lock ---
      const distance = 4.5; // Khoảng cách lý tưởng ban đầu từ camera đến nhân vật
      
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
  const { selectedExhibit, setSelectedExhibit, nickname, settings } = useMuseum();
  const containerRef = useRef<HTMLDivElement>(null);

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
        shadows={settings.shadows}
        camera={{ position: [0, 2.0, 14.5], fov: 60 }}
        onClick={handleMiss}
      >
        <color attach="background" args={['#14141a']} />
        <fog attach="fog" args={['#14141a', 8, 25]} />

        {/* Ánh sáng chung (tăng độ sáng) */}
        <ambientLight intensity={0.8} />
        
        {/* Ánh sáng đổ bóng xéo */}
        <directionalLight 
          position={[5, 12, 5]} 
          intensity={0.7} 
          castShadow={settings.shadows} 
          shadow-mapSize-width={1024} 
          shadow-mapSize-height={1024} 
        />

        {/* Ánh sáng tự nhiên từ giếng trời chiếu thẳng xuống */}
        <directionalLight 
          position={[0, 10, 0]} 
          intensity={1.2} 
          color="#f0f9ff"
        />

        <Suspense fallback={null}>
          {/* Phòng triển lãm */}
          <ExhibitionRoom galleryId={galleryId} />

          {/* Các tác phẩm/hiện vật */}
          {exhibits.map((exhibit) => (
            <ExhibitObject key={exhibit.id} exhibit={exhibit} />
          ))}

          {/* Nhân vật của người chơi hiện tại (Góc nhìn thứ 3 - Chỉ hiển thị sau khi đăng ký biệt danh) */}
          {nickname && <PlayerCharacter />}

          {/* Những người chơi khác trực tuyến */}
          <MultiplayerAvatars />
        </Suspense>

        {/* Cầu nối điều khiển camera bám theo nhân vật */}
        <CameraLerpController />
      </Canvas>

      {/* Hướng dẫn tương tác */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur-md text-white text-[10px] sm:text-xs py-1.5 px-4 rounded-full pointer-events-none select-none border border-white/10 text-center flex items-center gap-3">
        <span>🏃 <b>W-A-S-D</b> để di chuyển</span>
        <div className="w-px h-3 bg-white/20" />
        <span>🖱️ <b>Nhấn giữ &amp; Rê chuột</b> để xoay camera</span>
        <div className="w-px h-3 bg-white/20" />
        <span>🖼️ <b>Click tranh/tượng</b> để xem thuyết minh</span>
      </div>
    </div>
  );
};
export default GalleryCanvas;
