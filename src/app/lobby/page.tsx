'use client';

import React, { Suspense, useRef, useEffect, useState, useCallback } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { AdaptiveDpr, AdaptiveEvents } from '@react-three/drei';
import * as THREE from 'three';
import { useRouter } from 'next/navigation';
import { useMuseum } from '@/context/MuseumContext';
import { MuseumLobby } from '@/components/3d/MuseumLobby';
import { DoorPortal } from '@/components/3d/DoorPortal';
import { DynamicRoom, ROOM_OFFSETS } from '@/components/3d/DynamicRoom';
import { MultiplayerAvatars } from '@/components/3d/MultiplayerAvatars';
import { ArrowLeft, AlertTriangle, Settings } from 'lucide-react';
import { ExhibitModal } from '@/components/ui/ExhibitModal';

// ═══════════════════════════════════════════════════════════════════════════
// CÁC HẰNG SỐ CỦA SẢNH
// ═══════════════════════════════════════════════════════════════════════════
const LOBBY_W = 30;
const LOBBY_L = 20;
const LOBBY_H = 12;

// Cấu hình cửa nối phòng dạng chuỗi tuần tự (Lobby -> Room 1 -> Room 2)
const DOOR_CONFIGS = [
  {
    doorId: 'door-room1',
    targetRoom: 'gallery-paintings',
    // Cửa đặt ở tường sau sảnh, tầng 2 (Y=3, Z=8)
    position: [0, 3.0, 8.0] as [number, number, number],
    rotation: [0, Math.PI, 0] as [number, number, number],
    label: 'Phòng 01: Khởi nguồn',
  },
  {
    doorId: 'door-room2',
    targetRoom: 'gallery-sculptures',
    // Cửa đặt ở cuối phòng 1 (Y=3, Z=58) nối sang phòng 2
    position: [0, 3.0, 58.0] as [number, number, number],
    rotation: [0, Math.PI, 0] as [number, number, number],
    label: 'Phòng 02: Thị trường',
  },
  {
    doorId: 'door-room3',
    targetRoom: 'gallery-paintings', // Placeholder cửa cuối phòng 2
    position: [0, 3.0, 108.0] as [number, number, number],
    rotation: [0, Math.PI, 0] as [number, number, number],
    label: 'Phòng 03: Giới hạn',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// HÀM HỖ TRỢ TÍNH TOÀN ĐỘ CAO MẶT ĐẤT/CẦU THANG CHO SẢNH
// ═══════════════════════════════════════════════════════════════════════════
const getLobbyGroundY = (x: number, z: number, doorStates: Record<string, { isOpen: boolean }>): number => {
  // Sảnh chờ cầu thang
  if (x > -4.0 && x < 4.0) {
    if (z > 2.0 && z <= 7.0) {
      const stepIndex = Math.floor((z - 2.0) / 0.5);
      const clampedIndex = Math.max(0, Math.min(9, stepIndex));
      return (clampedIndex + 1) * 0.3;
    }
    if (z > 7.0 && z <= 8.5) return 3.0; // Mezzanine
  }

  // Phòng 1 (gallery-paintings) — Z từ 8.0 đến 58.0, Y = 3.0
  if (z > 8.0 && z <= 58.0) {
    return 3.0;
  }

  // Phòng 2 (gallery-sculptures) — Z từ 58.0 đến 108.0, Y = 3.0
  if (z > 58.0 && z <= 108.0) {
    return 3.0;
  }

  return 0;
};

// ═══════════════════════════════════════════════════════════════════════════
// BỘ ĐIỀU KHIỂN CAMERA CHO SẢNH (Lobby Camera Controller)
// ═══════════════════════════════════════════════════════════════════════════
const LobbyCameraController: React.FC = () => {
  const { camera, gl } = useThree();
  const { doorStates } = useMuseum();
  const theta = useRef(Math.PI);
  const phi = useRef(Math.PI / 2.3);
  const isMouseDown = useRef(false);

  const targetCamPos = useRef(new THREE.Vector3()).current;
  const targetLookAt = useRef(new THREE.Vector3()).current;

  useEffect(() => {
    const canvas = gl.domElement;
    const handleMouseDown = () => { isMouseDown.current = true; };
    const handleMouseUp = () => { isMouseDown.current = false; };
    const handleMouseMove = (e: MouseEvent) => {
      if (!isMouseDown.current) return;
      const sensitivity = 0.003;
      theta.current -= e.movementX * sensitivity;
      phi.current -= e.movementY * sensitivity;
      phi.current = Math.max(0.3, Math.min(Math.PI / 2 + 0.35, phi.current));
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

    const xOff = idealDist * Math.sin(theta.current) * Math.sin(phi.current);
    const yOff = idealDist * Math.cos(phi.current);
    const zOff = idealDist * Math.cos(theta.current) * Math.sin(phi.current);

    // Xác định ranh giới camera dựa trên vị trí người chơi để tránh xuyên tường
    let minX = -LOBBY_W / 2 + 0.5; // -14.5
    let maxX = LOBBY_W / 2 - 0.5;  // 14.5
    let minZ = -9.4;
    let maxZ = 7.8;

    // Room 1 (gallery-paintings): Z spans 8.0 to 58.0, W = 24 -> X from -12 to 12
    if (pz > 8.0 && pz <= 58.0) {
      minX = -11.5;
      maxX = 11.5;
      minZ = 8.2;
      maxZ = 57.8;
    }
    // Room 2 (gallery-sculptures): Z spans 58.0 to 108.0, W = 24 -> X from -12 to 12
    else if (pz > 58.0 && pz <= 108.0) {
      minX = -11.5;
      maxX = 11.5;
      minZ = 58.2;
      maxZ = 107.8;
    }

    const camX = Math.max(minX, Math.min(maxX, px + xOff));
    const camZ = Math.max(minZ, Math.min(maxZ, pz + zOff));

    // Tính toán độ cao sàn nhà thực tế tại vị trí camera để kẹp độ cao tối thiểu
    const groundYAtCam = getLobbyGroundY(camX, camZ, doorStates);
    const minCamY = groundYAtCam + 0.45;
    const camY = Math.max(minCamY, Math.min(LOBBY_H + 5, targetHeight + yOff));

    targetCamPos.set(camX, camY, camZ);
    targetLookAt.set(px, targetHeight, pz);

    camera.position.lerp(targetCamPos, 0.12);
    camera.lookAt(targetLookAt);
  });

  return null;
};

// ═══════════════════════════════════════════════════════════════════════════
// BỘ TIỀN BIÊN DỊCH SHADER PHÒNG (Room Shader Precompiler)
// ═══════════════════════════════════════════════════════════════════════════
const RoomPrecompiler: React.FC = () => {
  const { gl, scene, camera } = useThree();
  const { loadedRooms } = useMuseum();

  useEffect(() => {
    if (loadedRooms.length === 0) return;
    // Ép GPU compile/upload các vật liệu và hình học của phòng trước khi hiển thị
    gl.compile(scene, camera);
    console.log(`[PRECOMPILE] GPU đã biên dịch trước các vật liệu cho ${loadedRooms.length} phòng.`);
  }, [loadedRooms, gl, scene, camera]);

  return null;
};

// ═══════════════════════════════════════════════════════════════════════════
// NHÂN VẬT NGƯỜI CHƠI TRONG SẢNH + PHÒNG (Player Character)
// ═══════════════════════════════════════════════════════════════════════════
const LobbyPlayer: React.FC = () => {
  const playerRef = useRef<THREE.Group>(null);
  const keys = useRef({ w: false, a: false, s: false, d: false });
  const isMoving = useRef(false);

  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);

  const { settings, doorStates, loadedRooms, teleportTarget, clearTeleport, setCurrentRoom, socket, selectedExhibit } = useMuseum();
  const isPawn = settings.preset === 'low';
  const baseY = isPawn ? 0.24 : 0.472;
  const lastUpdate = useRef(0);

  const frontVec = useRef(new THREE.Vector3()).current;
  const rightVec = useRef(new THREE.Vector3()).current;
  const moveDir = useRef(new THREE.Vector3()).current;

  // Xử lý teleport
  useEffect(() => {
    if (teleportTarget && playerRef.current) {
      playerRef.current.position.set(teleportTarget.x, teleportTarget.y + baseY, teleportTarget.z);
      clearTeleport();
    }
  }, [teleportTarget, clearTeleport, baseY]);

  /**
   * Kiểm tra va chạm mở rộng (sảnh + phòng triển lãm)
   */
  const checkCollision = useCallback(
    (x: number, z: number, currentY: number): boolean => {
      // ── VÙNG SẢNH (Lobby) ──
      if (z <= 8.0) {
        // Biên giới sảnh
        if (x < -14.4 || x > 14.4 || z < -9.4) return true;

        // Tường sau sảnh Z = 8.0 — CHỈ chặn nếu cửa 1 ĐÓNG
        if (z > 7.3) {
          // Kiểm tra nếu người chơi đang đi qua cửa mở
          const passingDoor1 = doorStates['door-room1']?.isOpen && x > -2.2 && x < 2.2 && currentY >= 2.5;
          if (!passingDoor1) {
            return true;
          }
        }

        // Quầy lễ tân bên phải
        if (x > 12.0 && x < 15.0 && z > -6.7 && z < 0.7) return true;

        // Cầu thang
        if (x > -4.0 && x < 4.0 && z > 2.0 && z <= 7.0) {
          const stepIndex = Math.floor((z - 2.0) / 0.5);
          const clampedIndex = Math.max(0, Math.min(9, stepIndex));
          const stairY = clampedIndex * 0.3;
          if (currentY < stairY - 0.1) return true;
        }

        // Thành cầu thang
        if (z > 1.5 && z <= 8.0) {
          const onStairX = x > -4.0 && x < 4.0;
          if (!onStairX) {
            if (x > -4.5 && x < 4.5) return true;
          }
        }

        // Rơi từ tầng 2
        if (currentY > 2.0 && (x < -4.0 || x > 4.0)) return true;

        // Ghế băng
        if (x > -12.0 && x < -8.5 && z > -4.7 && z < -3.3) return true;

        // Chậu cây
        if ((Math.abs(x - 5.5) < 0.7 || Math.abs(x + 5.5) < 0.7) && Math.abs(z - 1.5) < 0.7) return true;

        return false;
      }

      // ── PHÒNG TRIỂN LÃM 1 (gallery-paintings: Z 8.0 -> 58.0) ──
      if (z > 8.0 && z <= 58.0) {
        // Kiểm tra xem phòng 1 có đang mở không
        const isRoom1Open = doorStates['door-room1']?.isOpen;
        if (!isRoom1Open) return true;

        // Biên giới tường bên (rộng 24m)
        if (x < -11.7 || x > 11.7) return true;

        // Tường sau phòng 1 (Z = 58.0) — Cửa nối 2 sang Phòng 2
        if (z > 57.3) {
          const passingDoor2 = doorStates['door-room2']?.isOpen && x > -2.2 && x < 2.2;
          if (!passingDoor2) return true;
        }
        return false;
      }

      // ── PHÒNG TRIỂN LÃM 2 (gallery-sculptures: Z 58.0 -> 108.0) ──
      if (z > 58.0 && z <= 108.0) {
        // Kiểm tra xem phòng 2 có đang mở không
        const isRoom2Open = doorStates['door-room2']?.isOpen;
        if (!isRoom2Open) return true;

        // Biên giới tường bên (rộng 24m)
        if (x < -11.7 || x > 11.7) return true;

        // Tường sau phòng 2 (Z = 108.0) — Cửa 3 (Placeholder)
        if (z > 107.3) {
          const passingDoor3 = doorStates['door-room3']?.isOpen && x > -2.2 && x < 2.2;
          if (!passingDoor3) return true;
        }
        return false;
      }

      return false;
    },
    [doorStates]
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
    if (selectedExhibit) return;

    const { w, a, s, d } = keys.current;
    const moving = w || a || s || d;
    isMoving.current = moving;

    if (moving) {
      state.camera.getWorldDirection(frontVec);
      frontVec.y = 0;
      frontVec.normalize();
      
      rightVec.set(-frontVec.z, 0, frontVec.x).normalize();

      moveDir.set(0, 0, 0);
      if (w) moveDir.add(frontVec);
      if (s) moveDir.sub(frontVec);
      if (d) moveDir.add(rightVec);
      if (a) moveDir.sub(rightVec);
      moveDir.normalize();

      const speed = 4.5;
      const curPos = playerRef.current.position;
      const curGroundY = getLobbyGroundY(curPos.x, curPos.z, doorStates);

      const nextX = curPos.x + moveDir.x * speed * delta;
      const nextZ = curPos.z + moveDir.z * speed * delta;

      if (!checkCollision(nextX, curPos.z, curGroundY)) {
        curPos.x = nextX;
      }
      if (!checkCollision(curPos.x, nextZ, curGroundY)) {
        curPos.z = nextZ;
      }

      const targetRot = Math.atan2(moveDir.x, moveDir.z);
      let diff = targetRot - playerRef.current.rotation.y;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      playerRef.current.rotation.y += diff * 12 * delta;
    }

    const curPos = playerRef.current.position;
    const curGroundY = getLobbyGroundY(curPos.x, curPos.z, doorStates);

    let bobY = 0;
    const t = state.clock.getElapsedTime();
    if (moving && settings.animations) {
      bobY = Math.sin(t * 10) * 0.032;
    }
    const targetY = curGroundY + baseY + bobY;
    curPos.y = THREE.MathUtils.lerp(curPos.y, targetY, 0.2);

    // Ngăn chặn chèn chân xuống đất bằng cách kẹp độ cao Y tối thiểu của người chơi
    const minAllowedY = curGroundY + baseY;
    if (curPos.y < minAllowedY) {
      curPos.y = minAllowedY;
    }

    // Cập nhật phòng hiện tại dựa trên vị trí tuần tự trục Z
    if (curPos.z <= 8.0) {
      setCurrentRoom('lobby');
    } else if (curPos.z > 8.0 && curPos.z <= 58.0) {
      setCurrentRoom('gallery-paintings');
    } else if (curPos.z > 58.0 && curPos.z <= 108.0) {
      setCurrentRoom('gallery-sculptures');
    }

    // Arm/Leg swing
    const swingSpeed = 10;
    const swingAmp = 0.45;

    if (moving && settings.animations) {
      if (leftLegRef.current) leftLegRef.current.rotation.x = Math.sin(t * swingSpeed) * swingAmp;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -Math.sin(t * swingSpeed) * swingAmp;
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = -Math.sin(t * swingSpeed) * (swingAmp * 0.75);
        leftArmRef.current.rotation.z = 0.2;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = Math.sin(t * swingSpeed) * (swingAmp * 0.75);
        rightArmRef.current.rotation.z = -0.2;
      }
    } else {
      if (leftLegRef.current) leftLegRef.current.rotation.x += (0 - leftLegRef.current.rotation.x) * 0.15;
      if (rightLegRef.current) rightLegRef.current.rotation.x += (0 - rightLegRef.current.rotation.x) * 0.15;
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x += (0 - leftArmRef.current.rotation.x) * 0.15;
        leftArmRef.current.rotation.z += (0.2 - leftArmRef.current.rotation.z) * 0.15;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x += (0 - rightArmRef.current.rotation.x) * 0.15;
        rightArmRef.current.rotation.z += (-0.2 - rightArmRef.current.rotation.z) * 0.15;
      }
    }

    // Gửi tọa độ qua socket (20Hz)
    const now = state.clock.getElapsedTime() * 1000;
    if (now - lastUpdate.current > 50) {
      if (socket && socket.connected) {
        socket.emit("move", {
          x: playerRef.current.position.x,
          y: playerRef.current.position.y - baseY, // Gửi tọa độ Y logic (bàn chân chạm đất)
          z: playerRef.current.position.z,
          yaw: playerRef.current.rotation.y,
        });
      }
      lastUpdate.current = now;
    }
  });

  // Mannequin dimensions
  const HEAD_R = 0.22;
  const TORSO_R = 0.175;
  const TORSO_H = 0.3;
  const ARM_R = 0.068;
  const ARM_LEN = 0.22;
  const LEG_R = 0.075;
  const LEG_LEN = 0.22;
  const TORSO_TOP = 0.28 + TORSO_R + TORSO_H / 2;
  const ARM_PIVOT_X = TORSO_R + ARM_R * 0.95;
  const ARM_PIVOT_Y = TORSO_TOP - 0.1;
  const ARM_MESH_Y = -(ARM_R + ARM_LEN / 2);
  const LEG_PIVOT_Y = 0.28 - TORSO_H / 2 - TORSO_R + LEG_R * 1.6;
  const LEG_PIVOT_X = 0.082;
  const LEG_MESH_Y = -(LEG_R + LEG_LEN / 2);

  const skinColor = "#e8e0d5";
  const skinProps = { color: skinColor, roughness: 0.6, metalness: 0.0 };

  return (
    <group ref={playerRef} name="lobby-player" position={[0, baseY, -5]}>
      {isPawn ? (
        <group scale={1.6}>
          <mesh position={[0, 0.7, 0]}>
            <sphereGeometry args={[0.18, 20, 20]} />
            <meshStandardMaterial {...skinProps} />
          </mesh>
          <mesh position={[0, 0.48, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.06, 16]} />
            <meshStandardMaterial {...skinProps} />
          </mesh>
          <mesh position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.07, 0.18, 0.5, 16]} />
            <meshStandardMaterial {...skinProps} />
          </mesh>
          <mesh position={[0, -0.1, 0]}>
            <cylinderGeometry args={[0.22, 0.22, 0.1, 16]} />
            <meshStandardMaterial {...skinProps} />
          </mesh>
        </group>
      ) : (
        <group scale={1.6}>
          <mesh position={[0, 0.7, 0]}>
            <sphereGeometry args={[HEAD_R, 28, 28]} />
            <meshStandardMaterial {...skinProps} />
          </mesh>
          <mesh position={[0, 0.28, 0]}>
            <capsuleGeometry args={[TORSO_R, TORSO_H, 10, 20]} />
            <meshStandardMaterial {...skinProps} />
          </mesh>
          <group ref={leftArmRef} position={[-ARM_PIVOT_X, ARM_PIVOT_Y, 0]}>
            <mesh position={[0, ARM_MESH_Y, 0]}>
              <capsuleGeometry args={[ARM_R, ARM_LEN, 8, 16]} />
              <meshStandardMaterial {...skinProps} />
            </mesh>
          </group>
          <group ref={rightArmRef} position={[ARM_PIVOT_X, ARM_PIVOT_Y, 0]}>
            <mesh position={[0, ARM_MESH_Y, 0]}>
              <capsuleGeometry args={[ARM_R, ARM_LEN, 8, 16]} />
              <meshStandardMaterial {...skinProps} />
            </mesh>
          </group>
          <group ref={leftLegRef} position={[-LEG_PIVOT_X, LEG_PIVOT_Y, 0]}>
            <mesh position={[0, LEG_MESH_Y, 0]}>
              <capsuleGeometry args={[LEG_R, LEG_LEN, 8, 16]} />
              <meshStandardMaterial {...skinProps} />
            </mesh>
          </group>
          <group ref={rightLegRef} position={[LEG_PIVOT_X, LEG_PIVOT_Y, 0]}>
            <mesh position={[0, LEG_MESH_Y, 0]}>
              <capsuleGeometry args={[LEG_R, LEG_LEN, 8, 16]} />
              <meshStandardMaterial {...skinProps} />
            </mesh>
          </group>
        </group>
      )}
    </group>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// TRANG SẢN CHÍNH (Lobby Page)
// ═══════════════════════════════════════════════════════════════════════════
export default function LobbyPage() {
  const router = useRouter();
  const {
    nickname,
    setNickname,
    language,
    settings,
    setActiveGallery,
    doorStates,
    loadedRooms,
    doorClosingAlert,
    currentRoom,
    socket,
    updatePreset,
    updateSettings,
  } = useMuseum();
  const [inputNickname, setInputNickname] = useState('');
  const [inputError, setInputError] = useState('');
  const [entered, setEntered] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Set activeGallery khi enter lobby để Socket kết nối
  useEffect(() => {
    if (entered && nickname) {
      setActiveGallery({ id: 'lobby', name: 'Sảnh Bảo Tàng', description: '', scene_asset_url: '', is_active: true });
    }
    return () => {
      setActiveGallery(null);
    };
  }, [entered, nickname, setActiveGallery]);

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
              shadows={false}
              dpr={settings.preset === 'low' ? [0.5, 0.75] : [0.5, 2]}
              gl={{ antialias: settings.preset !== 'low' }}
              camera={{ position: [0, 3, -2], fov: 65 }}
            >
              <AdaptiveDpr pixelated />
              <AdaptiveEvents />
              <color attach="background" args={['#0d0d12']} />
              <fog attach="fog" args={['#0d0d12', 30, 120]} />

              <Suspense fallback={null}>
                {/* Sảnh bảo tàng */}
                <MuseumLobby />
                
                {/* Nhân vật người chơi */}
                <LobbyPlayer />

                {/* Multiplayer avatars */}
                <MultiplayerAvatars />

                {/* Bộ precompiler ép GPU tải trước vật liệu */}
                <RoomPrecompiler />

                {/* ═══ CỬA NỐI PHÒNG (Door Portals) ═══ */}
                {DOOR_CONFIGS.map((config) => (
                  <DoorPortal
                    key={config.doorId}
                    doorId={config.doorId}
                    position={config.position}
                    rotation={config.rotation}
                    isOpen={doorStates[config.doorId]?.isOpen || false}
                    label={config.label}
                  />
                ))}

                {/* ═══ PHÒNG TRIỂN LÃM ĐỘNG (Dynamic Rooms) ═══ */}
                {loadedRooms.map((room) => {
                  const offset = ROOM_OFFSETS[room.galleryId];
                  if (!offset) return null;

                  // Xác định xem phòng này có đang mở/visible không dựa trên trạng thái cửa
                  const isVisible = Object.values(doorStates).some(
                    (d) => d.targetRoom === room.galleryId && d.isOpen
                  );

                  return (
                    <DynamicRoom
                      key={room.galleryId}
                      room={room}
                      offsetZ={offset.z}
                      offsetY={offset.y}
                      isVisible={isVisible}
                    />
                  );
                })}
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
                {currentRoom === 'lobby'
                  ? (language === 'vi' ? 'Sảnh Bảo Tàng' : 'Museum Lobby')
                  : (language === 'vi' ? 'Phòng Triển Lãm' : 'Exhibition Room')}
              </h1>
            </div>

            <div className="flex items-center gap-2 pointer-events-auto">
              <div className="flex items-center gap-1.5 bg-slate-950/60 border border-slate-800 py-2.5 px-4 rounded-xl backdrop-blur-md text-xs font-bold text-amber-400">
                <span>👤</span>
                <span className="max-w-[120px] truncate text-slate-300">{nickname}</span>
              </div>

              {/* Nút Cài đặt Đồ họa */}
              <button
                onClick={() => setSettingsOpen(true)}
                className="bg-slate-950/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white p-2.5 rounded-xl backdrop-blur-md transition-all cursor-pointer flex items-center justify-center pointer-events-auto"
                title={language === 'vi' ? 'Cấu hình đồ họa' : 'Graphics Settings'}
              >
                <Settings size={14} />
              </button>
            </div>
          </div>
        </header>
      )}

      {/* ═══ CẢNH BÁO ĐÓNG CỬA (Door Closing Alert) ═══ */}
      {doorClosingAlert && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50 animate-pulse">
          <div className="bg-red-950/90 border-2 border-red-500/60 text-red-200 px-6 py-4 rounded-2xl backdrop-blur-xl shadow-2xl flex items-center gap-3">
            <AlertTriangle size={24} className="text-red-400 flex-shrink-0" />
            <div>
              <p className="font-bold text-sm">
                {language === 'vi' ? '⚠️ Cửa sắp đóng!' : '⚠️ Door closing!'}
              </p>
              <p className="text-xs text-red-300 mt-0.5">
                {language === 'vi'
                  ? `Bạn sẽ được teleport về sảnh trong ${Math.ceil(doorClosingAlert.countdownMs / 1000)} giây...`
                  : `You will be teleported to lobby in ${Math.ceil(doorClosingAlert.countdownMs / 1000)} seconds...`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ═══ HƯỚNG DẪN TƯƠNG TÁC DƯỚI CÙNG ═══ */}
      {entered && nickname && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-40 bg-black/60 backdrop-blur-md text-white text-[10px] sm:text-xs py-1.5 px-4 rounded-full pointer-events-none select-none border border-white/10 text-center flex items-center gap-3">
          <span>🏃 <b>W-A-S-D</b> di chuyển</span>
          <div className="w-px h-3 bg-white/20" />
          <span>🖱️ <b>Nhấn giữ &amp; Rê chuột</b> xoay camera</span>
          <div className="w-px h-3 bg-white/20" />
          <span>🚪 <b>Đi qua cửa mở</b> → vào phòng triển lãm</span>
        </div>
      )}

      {/* ═══ MÀN HÌNH ĐĂNG KÝ BIỆT DANH ═══ */}
      {!entered && (
        <div className="absolute inset-0 z-50 bg-[#07070a]/60 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center select-none animate-fade-in">
          <div className="absolute top-1/4 left-1/3 w-80 h-80 rounded-full bg-amber-500/5 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-1/3 right-1/4 w-72 h-72 rounded-full bg-cyan-500/5 blur-[100px] pointer-events-none" />

          <div className="w-full max-w-md bg-slate-950/80 border border-slate-850 p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-6 relative z-10">
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
      {/* 7. MÀN HÌNH CÀI ĐẶT ĐỒ HỌA (GRAPHICS SETTINGS OVERLAY) */}
      {settingsOpen && (
        <div className="absolute inset-0 z-50 bg-[#07070a]/70 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center select-none animate-fade-in pointer-events-auto">
          <div className="w-full max-w-sm bg-slate-950/90 border border-slate-800/80 p-6 rounded-3xl shadow-2xl flex flex-col gap-6 relative z-10 text-left">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-850 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Settings size={16} className="text-cyan-400" />
                {language === 'vi' ? 'Cài đặt cấu hình' : 'Graphics Settings'}
              </h3>
              <button
                onClick={() => setSettingsOpen(false)}
                className="text-slate-500 hover:text-slate-350 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Options */}
            <div className="space-y-6">
              {/* Presets Selection */}
              <div className="space-y-2.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  {language === 'vi' ? 'Mức cấu hình đề xuất' : 'Graphics Quality Preset'}
                </label>
                <div className="grid grid-cols-2 gap-2 text-center">
                  {(['low', 'medium'] as const).map((presetName) => (
                    <button
                      key={presetName}
                      type="button"
                      onClick={() => updatePreset(presetName)}
                      className={`text-[10px] font-black py-2.5 px-1 rounded-xl border transition-all cursor-pointer ${settings.preset === presetName ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/10' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-750'}`}
                    >
                      {presetName === 'low' && (language === 'vi' ? 'Thấp' : 'Low')}
                      {presetName === 'medium' && (language === 'vi' ? 'Trung Bình' : 'Medium')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preset Description Card */}
              <div className="bg-slate-900/50 border border-slate-800/80 p-4 rounded-2xl space-y-3">
                <span className="text-[9px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  {language === 'vi' ? 'Chi tiết cấu hình' : 'Preset Details'}
                </span>
                
                <p className="text-[11px] text-slate-300 leading-relaxed min-h-[64px]">
                  {settings.preset === 'low' && (
                    language === 'vi' 
                      ? '♟️ Hiển thị hình quân cờ đơn giản. 🔒 Tắt đổ bóng. 🚶 Tắt vung tay chân. 👥 Chỉ hiện tối đa 10 người. Đảm bảo hoạt động mượt mà tuyệt đối trên mọi máy yếu.'
                      : '♟️ Pawn mesh. 🔒 Shadows Off. 🚶 Animations Off. 👥 Max 10 players visible. Guaranteed absolute smoothness for low-end mobile/PC devices.'
                  )}
                  {settings.preset === 'medium' && (
                    language === 'vi' 
                      ? '🚶 Hiển thị hình nhân di chuyển bình thường. ☀️ Bật đổ bóng động sắc nét. 🏃 Bật vung tay chân. 👥 Hiện đầy đủ người chơi. Trải nghiệm đồ họa sống động, mượt mà.'
                      : '🚶 Mannequin mesh. ☀️ Full Dynamic Shadows. 🏃 Limb animations On. 👥 Show all players. Premium and complete 3D interactive experience.'
                  )}
                </p>

                {/* Technical details list */}
                <div className="border-t border-slate-850 pt-2.5 space-y-1.5 text-[10px] text-slate-500">
                  <div className="flex justify-between">
                    <span>{language === 'vi' ? 'Bóng đổ (Shadows):' : 'Shadows:'}</span>
                    <span className={settings.shadows ? 'text-cyan-400 font-bold' : 'text-slate-500'}>
                      {settings.shadows ? (language === 'vi' ? 'Bật' : 'Enabled') : (language === 'vi' ? 'Tắt' : 'Disabled')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{language === 'vi' ? 'Cử động nhân vật (Animations):' : 'Limb Animations:'}</span>
                    <span className={settings.animations ? 'text-cyan-400 font-bold' : 'text-slate-500'}>
                      {settings.animations ? (language === 'vi' ? 'Bật' : 'Enabled') : (language === 'vi' ? 'Tắt' : 'Disabled')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{language === 'vi' ? 'Số người tối đa hiển thị (Max CCU):' : 'Max Displayed Users:'}</span>
                    <span className="text-cyan-400 font-mono font-bold">
                      {settings.maxAvatars === 99 ? (language === 'vi' ? 'Không giới hạn' : 'Unlimited') : `${settings.maxAvatars}`}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-2 pt-4 border-t border-slate-850 flex justify-end">
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs transition-transform hover:scale-102 active:scale-98 cursor-pointer"
              >
                {language === 'vi' ? 'Đóng' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* ═══ MODAL CHI TIẾT HIỆN VẬT (Exhibit Modal) ═══ */}
      <ExhibitModal />
    </div>
  );
}
