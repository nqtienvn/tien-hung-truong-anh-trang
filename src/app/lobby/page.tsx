'use client';

import React, { Suspense, useRef, useEffect, useState, useCallback } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useRouter } from 'next/navigation';
import { useMuseum } from '@/context/MuseumContext';
import { MuseumLobby } from '@/components/3d/MuseumLobby';
import { ArrowLeft } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// CÁC HẰNG SỐ CỦA SẢNH
// ═══════════════════════════════════════════════════════════════════════════
const LOBBY_W = 30;
const LOBBY_L = 20;
const LOBBY_H = 12;

// ═══════════════════════════════════════════════════════════════════════════
// BỘ ĐIỀU KHIỂN CAMERA CHO SẢNH (Lobby Camera Controller)
// ═══════════════════════════════════════════════════════════════════════════
const LobbyCameraController: React.FC = () => {
  const { camera, gl } = useThree();
  const theta = useRef(Math.PI);
  const phi = useRef(Math.PI / 2.3);
  const isMouseDown = useRef(false);

  useEffect(() => {
    const canvas = gl.domElement;
    const handleMouseDown = () => { isMouseDown.current = true; };
    const handleMouseUp = () => { isMouseDown.current = false; };
    const handleMouseMove = (e: MouseEvent) => {
      if (!isMouseDown.current) return;
      const sensitivity = 0.003;
      theta.current -= e.movementX * sensitivity;
      phi.current -= e.movementY * sensitivity;
      phi.current = Math.max(0.3, Math.min(Math.PI / 2 + 0.5, phi.current));
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [gl]);

  useFrame((state) => {
    const player = state.scene.getObjectByName('lobby-player');
    if (!player) return;

    const px = player.position.x;
    const py = player.position.y;
    const pz = player.position.z;
    const targetHeight = py + 0.6;

    const idealDist = 5.5;

    // Tính offset camera theo hệ tọa độ cầu
    const xOff = idealDist * Math.sin(theta.current) * Math.sin(phi.current);
    const yOff = idealDist * Math.cos(phi.current);
    const zOff = idealDist * Math.cos(theta.current) * Math.sin(phi.current);

    // Giới hạn camera trong phạm vi sảnh
    const camX = Math.max(-LOBBY_W / 2 + 0.5, Math.min(LOBBY_W / 2 - 0.5, px + xOff));
    const camY = Math.max(0.5, Math.min(LOBBY_H - 0.5, targetHeight + yOff));
    const camZ = Math.max(-LOBBY_L / 2 + 0.5, Math.min(LOBBY_L / 2 - 0.5, pz + zOff));

    const targetCamPos = new THREE.Vector3(camX, camY, camZ);
    const targetLookAt = new THREE.Vector3(px, targetHeight, pz);

    camera.position.lerp(targetCamPos, 0.12);
    camera.lookAt(targetLookAt);
  });

  return null;
};

// ═══════════════════════════════════════════════════════════════════════════
// NHÂN VẬT NGƯỜI CHƠI TRONG SẢNH (Lobby Player Character)
// ═══════════════════════════════════════════════════════════════════════════
const LobbyPlayer: React.FC = () => {
  const playerRef = useRef<THREE.Group>(null);
  const keys = useRef({ w: false, a: false, s: false, d: false });
  const bodyBob = useRef(0);
  const isMoving = useRef(false);

  /**
   * Tính Y mặt đất tại tọa độ (x, z).
   * Cầu thang: Z=2→7, X=-4→4, Y tăng tuyến tính từ 0→3m
   * Mezzanine: Z>7, Y=3m
   */
  const getGroundY = useCallback((x: number, z: number): number => {
    if (x > -4.0 && x < 4.0 && z > 2.0 && z <= 7.0) {
      return ((z - 2.0) / 5.0) * 3.0;
    }
    if (x > -4.0 && x < 4.0 && z > 7.0) return 3.0;
    return 0;
  }, []);

  /**
   * Kiểm tra va chạm cho sảnh
   */
  const checkCollision = useCallback(
    (x: number, z: number, currentY: number): boolean => {
      // 1. Biên giới phòng (tường sau dịch lên Z = 8.0, chặn ở Z > 7.4)
      if (x < -14.4 || x > 14.4 || z < -9.4 || z > 7.4) return true;

      // 2. Quầy lễ tân bên phải (X: 12.0 → 15.0, Z: -6.7 → 0.7)
      if (x > 12.0 && x < 15.0 && z > -6.7 && z < 0.7) return true;

      // 4. Thành cầu thang hai bên (X: ±4.0→±4.5, Z: 1.5→8.0)
      if (z > 1.5 && z <= 8.0) {
        const onStairX = x > -4.0 && x < 4.0;
        if (!onStairX) {
          // Ngoài vùng cầu thang, chặn không cho đi qua thành bậc
          if (x > -4.5 && x < 4.5) return true;
        }
      }

      // 5. Chặn rơi tự do từ bệ nghỉ trên tầng 2 (Y > 2.0, không cho đi lệch ra 2 bên X < -4.0 hoặc X > 4.0)
      if (currentY > 2.0 && (x < -4.0 || x > 4.0)) return true;

      // 6. Ghế băng bên trái
      if (x > -12.0 && x < -8.5 && z > -4.7 && z < -3.3) return true;

      // 7. Chậu cây cạnh cầu thang
      if ((Math.abs(x - 5.5) < 0.7 || Math.abs(x + 5.5) < 0.7) && Math.abs(z - 1.5) < 0.7) return true;

      return false;
    },
    []
  );

  // Bắt phím WASD
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'w' || k === 'a' || k === 's' || k === 'd') {
        keys.current[k as 'w' | 'a' | 's' | 'd'] = true;
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'w' || k === 'a' || k === 's' || k === 'd') {
        keys.current[k as 'w' | 'a' | 's' | 'd'] = false;
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  useFrame((state, delta) => {
    if (!playerRef.current) return;

    const { w, a, s, d } = keys.current;
    const moving = w || a || s || d;
    isMoving.current = moving;

    if (!moving) return;

    // Hướng di chuyển tương đối với camera
    const frontVec = new THREE.Vector3();
    state.camera.getWorldDirection(frontVec);
    frontVec.y = 0;
    frontVec.normalize();
    const rightVec = new THREE.Vector3(-frontVec.z, 0, frontVec.x);

    const moveDir = new THREE.Vector3();
    if (w) moveDir.add(frontVec);
    if (s) moveDir.sub(frontVec);
    if (d) moveDir.add(rightVec);
    if (a) moveDir.sub(rightVec);
    moveDir.normalize();

    const speed = 4.5;
    const curPos = playerRef.current.position;
    const curGroundY = getGroundY(curPos.x, curPos.z);

    const nextX = curPos.x + moveDir.x * speed * delta;
    const nextZ = curPos.z + moveDir.z * speed * delta;

    // Kiểm tra va chạm X và Z riêng biệt (wall sliding)
    if (!checkCollision(nextX, curPos.z, curGroundY)) {
      curPos.x = nextX;
    }
    if (!checkCollision(curPos.x, nextZ, curGroundY)) {
      curPos.z = nextZ;
    }

    // Cập nhật Y dựa trên vị trí mặt đất (cầu thang, mezzanine)
    const targetGroundY = getGroundY(curPos.x, curPos.z);
    curPos.y = THREE.MathUtils.lerp(curPos.y, targetGroundY, 0.2);

    // Xoay nhân vật theo hướng di chuyển
    const targetRot = Math.atan2(moveDir.x, moveDir.z);
    let diff = targetRot - playerRef.current.rotation.y;
    diff = Math.atan2(Math.sin(diff), Math.cos(diff));
    playerRef.current.rotation.y += diff * 12 * delta;

    // Animation nhún nhẹ khi đi bộ
    bodyBob.current += delta * 8;
  });

  return (
    <group ref={playerRef} name="lobby-player" position={[0, 0, -5]}>
      <group scale={1.6}>
        {/* Đầu quân cờ */}
        <mesh position={[0, 0.7, 0]} castShadow>
          <sphereGeometry args={[0.18, 20, 20]} />
          <meshStandardMaterial color="#e8e0d5" roughness={0.6} />
        </mesh>
        {/* Cổ */}
        <mesh position={[0, 0.48, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.06, 16]} />
          <meshStandardMaterial color="#e8e0d5" roughness={0.6} />
        </mesh>
        {/* Thân */}
        <mesh position={[0, 0.2, 0]} castShadow>
          <cylinderGeometry args={[0.07, 0.18, 0.5, 16]} />
          <meshStandardMaterial color="#e8e0d5" roughness={0.6} />
        </mesh>
        {/* Đế */}
        <mesh position={[0, -0.1, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.1, 16]} />
          <meshStandardMaterial color="#d6cfc5" roughness={0.5} />
        </mesh>
      </group>
    </group>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// CỬA VÀO PHÒNG TRIỂN LÃM (Gallery Entrance Portals on Mezzanine)
// ═══════════════════════════════════════════════════════════════════════════
interface PortalProps {
  position: [number, number, number];
  label: string;
  galleryId: string;
}

const GalleryPortal: React.FC<PortalProps> = ({ position, label, galleryId }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const router = useRouter();

  useFrame((_state, delta) => {
    if (!meshRef.current) return;
    // Hiệu ứng phát sáng nhẹ
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    const targetEmissive = hovered ? 0.8 : 0.3;
    mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, targetEmissive, 5 * delta);
  });

  return (
    <group position={position}>
      {/* Khung cổng */}
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[2.4, 3.2, 0.15]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.3} />
      </mesh>
      {/* Mặt cổng phát sáng */}
      <mesh
        ref={meshRef}
        position={[0, 1.5, 0.09]}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onClick={() => router.push(`/gallery/${galleryId}`)}
      >
        <planeGeometry args={[2.0, 2.8]} />
        <meshStandardMaterial
          color="#d4af37"
          emissive="#d4af37"
          emissiveIntensity={0.3}
          transparent
          opacity={0.7}
          roughness={0.1}
        />
      </mesh>
      {/* Biển tên phòng */}
      <mesh position={[0, 3.3, 0]}>
        <boxGeometry args={[2.6, 0.5, 0.12]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.3} />
      </mesh>
      {/* Text nền sáng trên biển */}
      <mesh position={[0, 3.3, 0.07]}>
        <planeGeometry args={[2.4, 0.35]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.4}
          roughness={0.1}
        />
      </mesh>
      {/* Đèn spotlight chiếu cổng */}
      <pointLight position={[0, 4.0, 1.0]} intensity={3} distance={6} color="#ffd54f" />
    </group>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// TRANG SẢN CHÍNH (Lobby Page)
// ═══════════════════════════════════════════════════════════════════════════
export default function LobbyPage() {
  const router = useRouter();
  const { nickname, setNickname, language, settings, setActiveGallery } = useMuseum();
  const [inputNickname, setInputNickname] = useState('');
  const [inputError, setInputError] = useState('');
  const [entered, setEntered] = useState(false);

  // Cleanup khi rời trang
  useEffect(() => {
    return () => {
      setActiveGallery(null);
    };
  }, [setActiveGallery]);

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputNickname.trim()) {
      setInputError(language === 'vi' ? 'Vui lòng nhập biệt danh!' : 'Please enter a nickname!');
      return;
    }
    setInputError('');
    setNickname(inputNickname.trim());
    setEntered(true);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0a0a0d] flex flex-col">
      {/* ═══ LỚP CANVAS 3D TOÀN MÀN HÌNH ═══ */}
      <div className="absolute inset-0 z-0">
        {entered && nickname ? (
          <div className="w-full h-full">
            <Canvas
              shadows={settings.shadows}
              camera={{ position: [0, 3, -2], fov: 65 }}
            >
              <color attach="background" args={['#0d0d12']} />
              <fog attach="fog" args={['#0d0d12', 15, 45]} />

              <Suspense fallback={null}>
                <MuseumLobby />
                <LobbyPlayer />

                {/* Cổng vào phòng triển lãm (Phòng 1 & 3 dưới tầng 1, Phòng 2 trên tầng 2) */}
                <GalleryPortal
                  position={[-9.0, 0.0, 8.0]}
                  label="Phòng 01: Khởi nguồn"
                  galleryId="gallery-paintings"
                />
                <GalleryPortal
                  position={[0, 3.15, 8.0]}
                  label="Phòng 02: Thị trường"
                  galleryId="gallery-sculptures"
                />
                <GalleryPortal
                  position={[9.0, 0.0, 8.0]}
                  label="Phòng 03: Giới hạn"
                  galleryId="gallery-paintings"
                />
              </Suspense>

              <LobbyCameraController />
            </Canvas>
          </div>
        ) : (
          <div className="w-full h-full bg-[#0a0a0d] flex items-center justify-center" />
        )}
      </div>

      {/* ═══ HEADER OVERLAY ═══ */}
      {entered && nickname && (
        <header className="absolute top-0 left-0 right-0 z-40 bg-gradient-to-b from-slate-950/80 to-transparent p-4 pointer-events-none">
          <div className="max-w-7xl mx-auto flex items-center justify-between pointer-events-auto">
            <button
              onClick={() => {
                setNickname('');
                setEntered(false);
                router.push('/');
              }}
              className="flex items-center gap-2 bg-slate-950/60 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white px-4 py-2.5 rounded-xl backdrop-blur-md transition-all cursor-pointer text-xs font-bold"
            >
              <ArrowLeft size={14} />
              {language === 'vi' ? 'Trang chủ' : 'Home'}
            </button>

            <div className="hidden sm:flex items-center gap-2 bg-slate-950/40 border border-slate-900/50 py-1.5 px-4 rounded-full backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <h1 className="text-xs font-bold text-slate-200 tracking-wider uppercase">
                {language === 'vi' ? 'Sảnh Bảo Tàng' : 'Museum Lobby'}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-slate-950/60 border border-slate-800 py-2.5 px-4 rounded-xl backdrop-blur-md text-xs font-bold text-amber-400">
                <span>👤</span>
                <span className="max-w-[120px] truncate text-slate-300">{nickname}</span>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* ═══ HƯỚNG DẪN TƯƠNG TÁC DƯỚI CÙNG ═══ */}
      {entered && nickname && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-40 bg-black/60 backdrop-blur-md text-white text-[10px] sm:text-xs py-1.5 px-4 rounded-full pointer-events-none select-none border border-white/10 text-center flex items-center gap-3">
          <span>🏃 <b>W-A-S-D</b> di chuyển</span>
          <div className="w-px h-3 bg-white/20" />
          <span>🖱️ <b>Nhấn giữ &amp; Rê chuột</b> xoay camera</span>
          <div className="w-px h-3 bg-white/20" />
          <span>🚪 <b>Leo cầu thang</b> → Click cổng vào phòng</span>
        </div>
      )}

      {/* ═══ MÀN HÌNH ĐĂNG KÝ BIỆT DANH ═══ */}
      {!entered && (
        <div className="absolute inset-0 z-50 bg-[#07070a]/60 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center select-none animate-fade-in">
          {/* Vòng sáng trang trí */}
          <div className="absolute top-1/4 left-1/3 w-80 h-80 rounded-full bg-amber-500/5 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-1/3 right-1/4 w-72 h-72 rounded-full bg-cyan-500/5 blur-[100px] pointer-events-none" />

          <div className="w-full max-w-md bg-slate-950/80 border border-slate-850 p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-6 relative z-10">
            {/* Biểu tượng sảnh */}
            <div className="w-20 h-20 bg-amber-500/10 text-amber-400 rounded-full flex items-center justify-center border border-amber-500/20 relative">
              <span className="material-symbols-outlined text-4xl">account_balance</span>
              <div className="absolute inset-0 rounded-full border border-amber-500/15 animate-ping opacity-30" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/25 px-3 py-1 rounded-full font-bold uppercase tracking-widest">
                {language === 'vi' ? 'Sảnh bảo tàng 3D' : '3D Museum Lobby'}
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight mt-2">
                {language === 'vi' ? 'Bảo tàng Tiến hóa Kinh tế' : 'Museum of Economic Evolution'}
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-xs mx-auto">
                {language === 'vi'
                  ? 'Nhập biệt danh để bước vào sảnh bảo tàng 3D tương tác. Khám phá kiến trúc hoành tráng và tham quan các phòng triển lãm.'
                  : 'Enter your nickname to explore the interactive 3D museum lobby and visit exhibition rooms.'}
              </p>
            </div>

            <form onSubmit={handleJoinSubmit} className="w-full space-y-4">
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  {language === 'vi' ? 'Biệt danh của bạn' : 'Your Nickname'}
                </label>
                <input
                  type="text"
                  value={inputNickname}
                  onChange={(e) => setInputNickname(e.target.value)}
                  placeholder={language === 'vi' ? 'Ví dụ: Nhà khám phá...' : 'E.g., Explorer...'}
                  maxLength={20}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors text-sm font-semibold"
                />
              </div>

              {inputError && (
                <p className="text-xs text-rose-400 font-semibold bg-rose-500/10 py-1.5 px-3 rounded-lg border border-rose-500/20">
                  ⚠️ {inputError}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => router.push('/')}
                  className="flex-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white font-bold py-3 px-4 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft size={12} />
                  {language === 'vi' ? 'Quay về' : 'Back'}
                </button>
                <button
                  type="submit"
                  className="flex-[2] bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold py-3 px-4 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/10"
                >
                  <span>{language === 'vi' ? 'Bước vào Sảnh' : 'Enter Lobby'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
