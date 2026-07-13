'use client';

import React, { Suspense, useRef, useEffect, useState, useCallback, useMemo } from 'react';
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
import MiniGameModal from '@/components/ui/MiniGameModal';
import { InvestigationNotebook } from '@/components/ui/InvestigationNotebook';
import { RoomWelcomeModal } from '@/components/ui/RoomWelcomeModal';

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
    targetRoom: 'gallery-subsidy',
    // Cửa đặt ở tường sau sảnh, tầng 2 (Y=3, Z=8)
    position: [0, 3.0, 8.0] as [number, number, number],
    rotation: [0, Math.PI, 0] as [number, number, number],
    label: 'Phòng 01: Bao cấp',
  },
  {
    doorId: 'door-room2',
    targetRoom: 'gallery-paintings',
    // Cửa đặt ở cuối phòng 1 (Y=3, Z=54) nối sang phòng 2
    position: [0, 3.0, 54.0] as [number, number, number],
    rotation: [0, Math.PI, 0] as [number, number, number],
    label: 'Phòng 02: Hội họa',
  },
  {
    doorId: 'door-room3',
    targetRoom: 'gallery-ceramics',
    position: [0, 3.0, 100.0] as [number, number, number],
    rotation: [0, Math.PI, 0] as [number, number, number],
    label: 'Phòng 03: Gốm sứ',
  },
  {
    doorId: 'door-room4',
    targetRoom: 'gallery-market-economy',
    position: [0, 3.0, 130.0] as [number, number, number],
    rotation: [0, Math.PI, 0] as [number, number, number],
    label: 'Phòng 04: Hội nhập',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// HÀM HỖ TRỢ TÍNH TOÀN ĐỘ CAO MẶT ĐẤT/CẦU THANG CHO SẢNH
// ═══════════════════════════════════════════════════════════════════════════
const getLobbyGroundY = (x: number, z: number, doorStates: Record<string, { isOpen: boolean }>): number => {
  // Sảnh chờ cầu thang
  if (x > -4.0 && x < 4.0) {
    if (z > 2.0 && z <= 7.0) {
      // Nội suy tuyến tính (smooth slope): từ Z=2.0 (Y=0.0) lên Z=7.0 (Y=3.0)
      const ratio = (z - 2.0) / 5.0;
      return ratio * 3.0;
    }
    if (z > 7.0 && z <= 8.5) return 3.0; // Mezzanine
  }

  // Bậc thang và sàn các phòng triển lãm
  if (z > 8.0 && z <= 130.0) {
    // Phòng 2 (Hội trường / Paintings): 54.0 < Z <= 100.0
    if (z > 54.0 && z <= 100.0) {
      // Chỉ áp dụng độ cao bậc thang ở khu vực có các tấm bê tông (Z từ 60.0 đến 94.0)
      if (z >= 60.0 && z <= 94.0) {
        if (x < -3.4) return 3.0;
        if (x < -0.2) return 3.3;
        if (x < 3.0) return 3.6;
        if (x < 6.2) return 3.9;
        return 4.2;
      }
      return 3.0;
    }
    return 3.0;
  }

  // Phòng 4 (gallery-market-economy) — Z từ 130.0 đến 245.0, Y = 3.0
  if (z > 130.0 && z <= 245.0) {
    return 3.0;
  }

  return 0;
};

// ═══════════════════════════════════════════════════════════════════════════
// BỘ ĐIỀU KHIỂN CAMERA CHO SẢNH (Lobby Camera Controller)
// ═══════════════════════════════════════════════════════════════════════════
const LobbyCameraController: React.FC = () => {
  const { camera, gl } = useThree();
  const { doorStates, activeGallery } = useMuseum();
  const theta = useRef(Math.PI);
  const phi = useRef(Math.PI / 2.3);
  const isMouseDown = useRef(false);
  const isZooming = useRef(false);

  const targetCamPos = useRef(new THREE.Vector3()).current;
  const targetLookAt = useRef(new THREE.Vector3()).current;

  useEffect(() => {
    const canvas = gl.domElement;

    // Ngăn chặn menu chuột phải để sử dụng nút RMB làm ống kính Zoom phóng to màn hình
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 2) {
        isZooming.current = true;
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 2) {
        isZooming.current = false;
      }
    };

    // Hỗ trợ phím tắt Z/C cho những máy dùng Touchpad không click chuột phải được dễ dàng
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyZ' || e.code === 'KeyC') {
        isZooming.current = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'KeyZ' || e.code === 'KeyC') {
        isZooming.current = false;
      }
    };

    const isInsideCanvas = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      );
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (e.button !== 0 || !isInsideCanvas(e)) return;
      isMouseDown.current = true;
    };

    const handlePointerUp = () => {
      isMouseDown.current = false;
    };

    const handlePointerMove = (e: PointerEvent) => {
      const isLeftButtonHeld = (e.buttons & 1) === 1;
      if (!isLeftButtonHeld || !isInsideCanvas(e)) {
        if (!isLeftButtonHeld) isMouseDown.current = false;
        return;
      }

      isMouseDown.current = true;
      const sensitivity = 0.003;
      theta.current -= e.movementX * sensitivity;
      phi.current -= e.movementY * sensitivity;
      phi.current = Math.max(0.3, Math.min(Math.PI / 2 + 0.35, phi.current));
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
    window.addEventListener('pointermove', handlePointerMove);
    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);

      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, [gl]);

  useFrame((state) => {
    // Thực hiện hiệu ứng Zoom mềm mại bằng cách thay đổi FOV (ép kiểu PerspectiveCamera)
    const persCam = camera as THREE.PerspectiveCamera;
    const targetFov = isZooming.current ? 20 : 65;
    if (persCam.fov !== undefined && Math.abs(persCam.fov - targetFov) > 0.1) {
      persCam.fov = THREE.MathUtils.lerp(persCam.fov, targetFov, 0.15);
      persCam.updateProjectionMatrix();
    }

    const player = state.scene.getObjectByName('lobby-player');
    if (!player) return;

    const px = player.position.x;
    const py = player.position.y;
    const pz = player.position.z;
    const targetHeight = py + 0.6;

    // Khi zoom, thu nhỏ khoảng cách camera về 0 (góc nhìn thứ nhất) để không bị cản bởi đầu nhân vật
    const idealDist = isZooming.current ? 0.0 : 5.5;

    // Ẩn người chơi nếu camera zoom lại gần (dưới 2 mét) để tránh hiện tượng xuyên mặt/đầu nhân vật
    const camToPlayerDist = camera.position.distanceTo(player.position);
    player.visible = !isZooming.current || (camToPlayerDist > 1.8);

    const xOff = idealDist * Math.sin(theta.current) * Math.sin(phi.current);
    const yOff = idealDist * Math.cos(phi.current);
    const zOff = idealDist * Math.cos(theta.current) * Math.sin(phi.current);

    // Xác định ranh giới camera dựa trên vị trí người chơi để tránh xuyên tường
    let minX = -LOBBY_W / 2 + 0.5; // -14.5
    let maxX = LOBBY_W / 2 - 0.5;  // 14.5
    let minZ = -9.4;
    let maxZ = 7.8;

    // Các phòng triển lãm (Phòng 1, 2): Z từ 8.0 đến 100.0, W = 24 -> X từ -12 đến 12
    if (pz > 8.0 && pz <= 100.0) {
      minX = -11.5;
      maxX = 11.5;
      minZ = 8.2;
      maxZ = 99.8;
    }
    // Phòng 03 (gallery-ceramics): Z từ 100.0 đến 130.0, W = 30 -> X từ -15 đến 15
    else if (pz > 100.0 && pz <= 130.0) {
      minX = -14.5;
      maxX = 14.5;
      minZ = 100.2;
      maxZ = 129.8;
    }
    // Room 4 (gallery-market-economy): Z spans 130.0 to 245.0, W = 18 -> X from -9 to 9
    else if (pz > 130.0 && pz <= 245.0) {
      minX = -8.5;
      maxX = 8.5;
      minZ = 130.2;
      maxZ = 244.8;
    }

    const camX = Math.max(minX, Math.min(maxX, px + xOff));
    const camZ = Math.max(minZ, Math.min(maxZ, pz + zOff));

    // Tính toán độ cao sàn nhà thực tế tại vị trí camera để kẹp độ cao tối thiểu
    const groundYAtCam = getLobbyGroundY(camX, camZ, doorStates);
    const minCamY = groundYAtCam + 0.45;

    // Giới hạn camera không vượt quá trần nhà để chống nhìn xuyên trần
    let maxCamY = LOBBY_H - 0.5; // Sảnh mặc định 11.5m
    if (camZ > 8.0) {
      const activeRoomHeight = activeGallery?.room_height ?? 6.0;
      maxCamY = 3.0 + activeRoomHeight - 0.5;
    }
    const camY = Math.max(minCamY, Math.min(maxCamY, targetHeight + yOff));

    targetCamPos.set(camX, camY, camZ);

    // Khi zoom, hướng nhìn của camera sẽ nhìn thẳng ra phía trước tầm nhìn thay vì nhìn vào đầu nhân vật
    if (isZooming.current) {
      const lookAtX = px - 10 * Math.sin(theta.current) * Math.sin(phi.current);
      const lookAtY = targetHeight - 10 * Math.cos(phi.current);
      const lookAtZ = pz - 10 * Math.cos(theta.current) * Math.sin(phi.current);
      targetLookAt.set(lookAtX, lookAtY, lookAtZ);
    } else {
      targetLookAt.set(px, targetHeight, pz);
    }

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
  const keys = useRef({ w: false, a: false, s: false, d: false, e: false, space: false });
  const isMoving = useRef(false);
  const jumpVelocity = useRef(0);
  const isJumping = useRef(false);

  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);

  const { settings, doorStates, loadedRooms, teleportTarget, clearTeleport, setCurrentRoom, socket, selectedExhibit, sittingPosition, setSittingPosition, sittingPrompt, setSittingPrompt } = useMuseum();
  const isPawn = settings.preset === 'low';
  const baseY = isPawn ? 0.24 : 0.472;
  const lastUpdate = useRef(0);

  const frontVec = useRef(new THREE.Vector3()).current;
  const rightVec = useRef(new THREE.Vector3()).current;
  const moveDir = useRef(new THREE.Vector3()).current;

  // Khởi tạo danh sách 60 ghế ngồi trong Phòng 2 bậc thang để check khoảng cách và tọa độ ngồi
  const ROOM2_CHAIRS = useMemo(() => {
    const chairs: Array<{ x: number; y: number; z: number }> = [];
    const deskXCoords = [-5.0, -1.8, 1.4, 4.6, 7.8];
    const frontChairZs = [-14.5, -12.5, -10.5, -8.5, -6.5, -4.5];
    const backChairZs = [4.5, 6.5, 8.5, 10.5, 12.5, 14.5];

    const getTierY = (xVal: number) => {
      if (xVal < -3.4) return 0.0;
      if (xVal < -0.2) return 0.3;
      if (xVal < 3.0) return 0.6;
      if (xVal < 6.2) return 0.9;
      return 1.2;
    };

    for (const xCol of deskXCoords) {
      const tierY = getTierY(xCol);
      for (const zVal of [...frontChairZs, ...backChairZs]) {
        chairs.push({
          x: xCol - 0.4,
          y: 3.35 + tierY, // Độ cao ngồi = 3.35 (đệm ghế) + độ cao bậc thang
          z: 77.0 + zVal
        });
      }
    }
    return chairs;
  }, []);

  const nearestChairRef = useRef<{ x: number; y: number; z: number } | null>(null);
  const sittingPositionRef = useRef<any>(null);
  const exitPositionRef = useRef<{ x: number; y: number; z: number } | null>(null);
  
  useEffect(() => {
    sittingPositionRef.current = sittingPosition;
  }, [sittingPosition]);

  // Thiết lập vị trí spawn ban đầu khi mount sảnh
  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.position.set(0, baseY, -5);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

      // ── PHÒNG TRIỂN LÃM 1 (gallery-subsidy: Z 8.0 -> 54.0) ──
      if (z > 8.0 && z <= 54.0) {
        const isRoom1Open = doorStates['door-room1']?.isOpen;
        if (!isRoom1Open) return true;

        // Tường chính bên trái/phải
        if (x < -11.7 || x > 11.7) return true;

        // 1. Vách ngăn Z = 3.0 local (Global Z = 34.0, độ dày Z: 33.7 -> 34.3)
        // Khoảng trống đi qua là X từ -5.0 đến -2.0. Chặn các vị trí khác.
        if (z > 33.7 && z < 34.3) {
          const inOpening = x > -5.0 && x < -2.0;
          if (!inOpening) return true;
        }

        // 2. Vách ngăn Z = 13.0 local (Global Z = 44.0, độ dày Z: 43.7 -> 44.3)
        // Chặn nếu đi qua tường X từ -6.0 đến 6.0
        if (z > 43.7 && z < 44.3) {
          const hitWall = x > -6.0 && x < 6.0;
          if (hitWall) return true;
        }

        // 3. Bàn gỗ bày đài Radio cổ (Global Z = 43.55, X: -1.2 -> 1.2, Z: 43.1 -> 44.0)
        if (z > 43.1 && z < 44.0 && x > -1.2 && x < 1.2) {
          return true;
        }

        // 4. Ghế gỗ băng cũ trong phòng (local Z = 8.0 & 18.0 => Global Z = 39.0 & 49.0)
        // Khi đang nhảy cao hơn mặt ghế thì cho vượt qua.
        const canJumpOverBench = currentY > 3.75;
        if (!canJumpOverBench && z > 38.5 && z < 39.5 && x > -1.7 && x < 1.7) {
          return true;
        }
        if (!canJumpOverBench && z > 48.5 && z < 49.5 && x > -1.7 && x < 1.7) {
          return true;
        }

        // 5. Dãy ghế ngồi giữa phòng (local Z = -16.5, -10.5, -4.5 => Global Z = 14.5, 20.5, 26.5)
        const centralBenchZs = [14.5, 20.5, 26.5];
        for (const benchZ of centralBenchZs) {
          if (!canJumpOverBench && z > benchZ - 0.65 && z < benchZ + 0.65 && x > -2.15 && x < 2.15) {
            return true;
          }
        }

        // 6. Bàn lọ hoa trang trí: vẫn chặn để không xuyên qua bàn.
        const decorTables = [
          { x: -7.2, z: 17.8 },
          { x: 7.2, z: 23.8 },
        ];
        for (const table of decorTables) {
          const dx = x - table.x;
          const dz = z - table.z;
          if (Math.sqrt(dx * dx + dz * dz) < 0.75) {
            return true;
          }
        }

        // Cửa cuối phòng nối sang phòng 2
        if (z > 53.3) {
          const passingDoor2 = doorStates['door-room2']?.isOpen && x > -2.2 && x < 2.2;
          if (!passingDoor2) return true;
        }
        return false;
      }

      // ── PHÒNG TRIỂN LÃM 2 (gallery-paintings: Z 54.0 -> 100.0) ──
      if (z > 54.0 && z <= 100.0) {
        const isRoom2Open = doorStates['door-room2']?.isOpen;
        if (!isRoom2Open) return true;

        if (x < -11.7 || x > 11.7) return true;

        // Chặn các bàn đại biểu và ghế trong Phòng 2 (X xoay dọc, 5 dãy bàn bậc thang)
        const localZ = z - 77.0;
        const deskXCoords = [-5.0, -1.8, 1.4, 4.6, 7.8];
        
        // Chặn bục sân khấu bên trái (local X: -12.0 đến -7.6, local Z: -7.5 đến 7.5)
        if (x < -7.6 && localZ > -7.5 && localZ < 7.5) return true;

        // Chặn các dãy bàn dọc
        for (const rowX of deskXCoords) {
          // Kiểm tra xem người chơi có đè lên X của hàng bàn ghế không (đã dịch sang trái 1.0m)
          if (x > rowX - 1.4 && x < rowX - 0.1) {
            // Kiểm tra theo trục dọc Z (Front block & Back block)
            const inFrontBlock = localZ > -15.2 && localZ < -3.8;
            const inBackBlock = localZ > 3.8 && localZ < 15.2;
            if (inFrontBlock || inBackBlock) return true;
          }
        }

        // Chặn va chạm của lan can (Railing Collisions) ngăn nhảy qua các bậc thềm
        const railXCoords = [-3.4, -0.2, 3.0, 6.2];
        const inFrontRailZ = localZ >= -14.5 && localZ <= -4.5;
        const inBackRailZ = localZ >= 4.5 && localZ <= 14.5;
        if (inFrontRailZ || inBackRailZ) {
          for (const railX of railXCoords) {
            if (x > railX - 0.2 && x < railX + 0.2) {
              return true;
            }
          }
        }

        // Chặn va chạm ở 2 đầu lan can biên Z (Z global = 60.0 và 94.0) khi đứng trên các bậc (X > -3.4)
        if (x > -3.4) {
          // Chặn ở đầu Z = 60.0 (giới hạn an toàn từ 59.6 đến 60.4)
          if (z >= 59.6 && z <= 60.4) return true;
          // Chặn ở đầu Z = 94.0 (giới hạn an toàn từ 93.6 đến 94.4)
          if (z >= 93.6 && z <= 94.4) return true;
        }

        if (z > 99.3) {
          const passingDoor3 = doorStates['door-room3']?.isOpen && x > -2.2 && x < 2.2;
          if (!passingDoor3) return true;
        }
        return false;
      }

      // ── PHÒNG TRIỂN LÃM 3 (gallery-ceramics: Z 100.0 -> 130.0) ──
      if (z > 100.0 && z <= 130.0) {
        const isRoom3Open = doorStates['door-room3']?.isOpen;
        if (!isRoom3Open) return true;

        if (x < -14.7 || x > 14.7) return true;

        if (z > 129.3) {
          const passingDoor4 = doorStates['door-room4']?.isOpen && x > -2.2 && x < 2.2;
          if (!passingDoor4) return true;
        }
        return false;
      }

      // ── PHÒNG TRIỂN LÃM 4 (gallery-market-economy: Z 130.0 -> 245.0) ──
      if (z > 130.0 && z <= 245.0) {
        const isRoom4Open = doorStates['door-room4']?.isOpen;
        if (!isRoom4Open) return true;

        // Biên giới tường bên (rộng 18m, X = ±9m)
        if (x < -8.7 || x > 8.7) return true;

        // Tường sau phòng 4 (Z = 245.0)
        if (z > 244.3) return true;
        return false;
      }

      return false;
    },
    [doorStates]
  );

  // Bắt phím WASD
  useEffect(() => {
    const movementKeyMap: Record<string, 'w' | 'a' | 's' | 'd' | 'e' | 'space'> = {
      KeyW: 'w',
      KeyA: 'a',
      KeyS: 's',
      KeyD: 'd',
      KeyE: 'e',
      Space: 'space',
      ArrowUp: 'w',
      ArrowLeft: 'a',
      ArrowDown: 's',
      ArrowRight: 'd',
    };

    const shouldIgnoreKeyboard = (target: EventTarget | null) => {
      const el = target as HTMLElement | null;
      if (!el) return false;
      const tagName = el.tagName.toLowerCase();
      return tagName === 'input' || tagName === 'textarea' || el.isContentEditable;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (shouldIgnoreKeyboard(e.target)) return;

      if (e.code === 'KeyF') {
        e.preventDefault();
        if (sittingPositionRef.current) {
          // Lưu vị trí dịch chuyển để đứng dậy (trục X dịch sang phải +1.2m)
          const exitX = sittingPositionRef.current.x + 1.2;
          const exitZ = sittingPositionRef.current.z;
          // Tính toán độ cao đứng lên dựa trên vị trí bậc thang tại tọa độ exitX
          const exitY = getLobbyGroundY(exitX, exitZ, doorStates) + baseY;
          exitPositionRef.current = { x: exitX, y: exitY, z: exitZ };
          setSittingPosition(null);
        } else if (nearestChairRef.current) {
          // Ngồi xuống ghế: Lấy đúng tọa độ y từ vật thể ghế đã tính độ cao bậc thang
          setSittingPosition({
            x: nearestChairRef.current.x,
            y: nearestChairRef.current.y,
            z: nearestChairRef.current.z,
            rotationY: -Math.PI / 2
          });
          setSittingPrompt('stand');
        }
        return;
      }

      const key = movementKeyMap[e.code];
      if (!key) return;
      e.preventDefault();

      if (key === 'space') {
        if (!isJumping.current) {
          isJumping.current = true;
          jumpVelocity.current = 5.2;
        }
        keys.current.space = true;
        return;
      }

      keys.current[key] = true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      const key = movementKeyMap[e.code];
      if (!key) return;
      e.preventDefault();
      keys.current[key] = false;
    };
    // Reset tất cả phím khi trang bị mất focus (tránh nhân vật tự di chuyển)
    const resetAllKeys = () => {
      keys.current.w = false;
      keys.current.a = false;
      keys.current.s = false;
      keys.current.d = false;
      keys.current.e = false;
      keys.current.space = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', resetAllKeys);
    document.addEventListener('visibilitychange', resetAllKeys);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', resetAllKeys);
      document.removeEventListener('visibilitychange', resetAllKeys);
    };
  }, []);

  useFrame((state, delta) => {
    if (!playerRef.current) return;
    if (selectedExhibit) return;

    // Xử lý dịch chuyển tức thời khi đứng dậy để tránh trễ đồng bộ React state
    if (exitPositionRef.current) {
      playerRef.current.position.set(exitPositionRef.current.x, exitPositionRef.current.y, exitPositionRef.current.z);
      exitPositionRef.current = null;
      return;
    }

    // Check khoảng cách ghế ngồi và cập nhật sittingPrompt
    const pPos = playerRef.current.position;
    if (sittingPosition) {
      if (sittingPrompt !== 'stand') setSittingPrompt('stand');
    } else {
      if (pPos.z > 54.0 && pPos.z <= 100.0) {
        let minDist = Infinity;
        let closest: { x: number; y: number; z: number } | null = null;
        for (const chair of ROOM2_CHAIRS) {
          const dx = pPos.x - chair.x;
          const dz = pPos.z - chair.z;
          const dist = Math.sqrt(dx * dx + dz * dz);
          if (dist < minDist) {
            minDist = dist;
            closest = chair;
          }
        }
        
        if (minDist < 1.3) {
          if (sittingPrompt !== 'sit') setSittingPrompt('sit');
          nearestChairRef.current = closest;
        } else {
          if (sittingPrompt !== null) setSittingPrompt(null);
          nearestChairRef.current = null;
        }
      } else {
        if (sittingPrompt !== null) setSittingPrompt(null);
        nearestChairRef.current = null;
      }
    }

    if (sittingPosition) {
      playerRef.current.position.set(sittingPosition.x, sittingPosition.y, sittingPosition.z);
      if (sittingPosition.rotationY !== undefined) {
        playerRef.current.rotation.y = THREE.MathUtils.lerp(playerRef.current.rotation.y, sittingPosition.rotationY, 0.15);
      }

      // Xoay chân gập vuông góc 90 độ về phía trước và để tay đặt lên đùi
      if (leftLegRef.current) leftLegRef.current.rotation.x = -Math.PI / 2.0;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -Math.PI / 2.0;
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = -Math.PI / 4.0;
        leftArmRef.current.rotation.z = 0.1;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = -Math.PI / 4.0;
        rightArmRef.current.rotation.z = -0.1;
      }

      const now = state.clock.getElapsedTime();
      if (now - lastUpdate.current > 0.05) {
        socket?.emit('move', {
          x: sittingPosition.x,
          y: sittingPosition.y,
          z: sittingPosition.z,
          yaw: playerRef.current.rotation.y,
        });
        lastUpdate.current = now;
      }
      return;
    }

    const { w, a, s, d, e } = keys.current;
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

      const speed = e ? 7.4 : 4.5;
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
    const baseGroundY = curGroundY + baseY;

    if (isJumping.current) {
      jumpVelocity.current -= 13.5 * delta;
      curPos.y += jumpVelocity.current * delta;

      if (curPos.y <= baseGroundY) {
        curPos.y = baseGroundY;
        jumpVelocity.current = 0;
        isJumping.current = false;
      }
    } else {
      const targetY = baseGroundY + bobY;
      // Sử dụng lerp nhanh hơn một chút để giảm trễ nhưng vẫn đảm bảo mượt mà
      curPos.y = THREE.MathUtils.lerp(curPos.y, targetY, 0.3);
    }

    // Chỉ kẹp cứng nếu người chơi bị hẫng chân quá sâu (ví dụ > 0.4 đơn vị) dưới sàn thực tế
    const minAllowedY = curGroundY + baseY - 0.05;
    if (curPos.y < minAllowedY) {
      curPos.y = minAllowedY;
    }

    // Cập nhật phòng hiện tại dựa trên vị trí tuần tự trục Z
    if (curPos.z <= 8.0) {
      setCurrentRoom('lobby');
    } else if (curPos.z > 8.0 && curPos.z <= 54.0) {
      setCurrentRoom('gallery-subsidy');
    } else if (curPos.z > 54.0 && curPos.z <= 100.0) {
      setCurrentRoom('gallery-paintings');
    } else if (curPos.z > 100.0 && curPos.z <= 130.0) {
      setCurrentRoom('gallery-ceramics');
    } else if (curPos.z > 130.0 && curPos.z <= 245.0) {
      setCurrentRoom('gallery-market-economy');
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
    <group ref={playerRef} name="lobby-player">
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
    roomStates,
    loadedRooms,
    roomClosingAlert,
    currentRoom,
    socket,
    updatePreset,
    updateSettings,
    miniGameOpen,
    sittingPrompt,
  } = useMuseum();
  const [inputNickname, setInputNickname] = useState('');
  const [inputError, setInputError] = useState('');
  const [entered, setEntered] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Sync activeGallery với currentRoom trong sảnh + phòng triển lãm 3D liên tục
  useEffect(() => {
    if (!entered || !nickname) {
      setActiveGallery(null);
      return;
    }
    const ROOM_GALLERY_MAP: Record<string, { id: string; name: string }> = {
      'lobby': { id: 'lobby', name: 'Sảnh Bảo Tàng' },
      'gallery-subsidy': { id: 'gallery-subsidy', name: 'Phòng 01: Bao cấp Việt Nam' },
      'gallery-paintings': { id: 'gallery-paintings', name: 'Phòng 02: Hội họa cổ điển' },
      'gallery-ceramics': { id: 'gallery-ceramics', name: 'Phòng 03: Gốm sứ hội nhập' },
    };
    const meta = ROOM_GALLERY_MAP[currentRoom] ?? { id: currentRoom, name: currentRoom };
    setActiveGallery({ id: meta.id, name: meta.name, description: '', scene_asset_url: '', is_active: true });
    return () => { setActiveGallery(null); };
  }, [entered, nickname, currentRoom, setActiveGallery]);

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
              dpr={settings.preset === 'ultra-low' ? [0.3, 0.5] : settings.preset === 'low' ? [0.5, 1.0] : [0.5, 2]}
              gl={{ antialias: settings.preset === 'medium' }}
              camera={{ position: [0, 3, -2], fov: 65 }}
            >
              <AdaptiveDpr pixelated />
              <AdaptiveEvents />
              <color attach="background" args={['#0d0d12']} />
              <fog attach="fog" args={['#0d0d12', settings.preset === 'ultra-low' ? 10 : settings.preset === 'low' ? 20 : 30, settings.preset === 'ultra-low' ? 60 : settings.preset === 'low' ? 80 : 120]} />

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

                  // Xác định xem phòng này có đang mở/visible không dựa trên trạng thái bật/tắt phòng của admin
                  const isVisible = roomStates[room.galleryId]?.isOpen || false;

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

      {/* ═══ CẢNH BÁO TẮT PHÒNG (Room Closing Alert) ═══ */}
      {roomClosingAlert && currentRoom === roomClosingAlert.roomId && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-red-950/95 border-2 border-red-500/80 text-red-200 px-6 py-4 rounded-2xl backdrop-blur-xl shadow-2xl flex items-center gap-3 max-w-sm">
            <AlertTriangle size={24} className="text-red-400 flex-shrink-0 animate-pulse" />
            <div>
              <p className="font-bold text-sm">
                {language === 'vi' ? '⚠️ PHÒNG SẮP TẮT!' : '⚠️ ROOM CLOSING!'}
              </p>
              <p className="text-xs text-red-300 mt-1 leading-relaxed">
                {language === 'vi'
                  ? `Vui lòng di chuyển ra khỏi phòng! Bạn sẽ bị tự động dịch chuyển trong ${Math.ceil(roomClosingAlert.countdownMs / 1000)} giây...`
                  : `Please leave this room! You will be automatically teleported in ${Math.ceil(roomClosingAlert.countdownMs / 1000)} seconds...`}
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
                <div className="grid grid-cols-3 gap-2 text-center">
                  {(['ultra-low', 'low', 'medium'] as const).map((presetName) => (
                    <button
                      key={presetName}
                      type="button"
                      onClick={() => updatePreset(presetName)}
                      className={`text-[10px] font-black py-2.5 px-1 rounded-xl border transition-all cursor-pointer ${settings.preset === presetName ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/10' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-750'}`}
                    >
                      {presetName === 'ultra-low' && (language === 'vi' ? 'Siêu Thấp' : 'Ultra Low')}
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
                  {settings.preset === 'ultra-low' && (
                    language === 'vi' 
                      ? '⚡ Tối ưu tối đa cho máy yếu. 🔦 Tắt toàn bộ đèn điểm (dùng đèn hướng). 📉 Độ phân giải cực thấp. 🚫 Ẩn tất cả người chơi khác. 🌫️ Sương mù gần hơn để giảm tải GPU.'
                      : '⚡ Maximum optimization for weak devices. 🔦 All point lights disabled (directional only). 📉 Ultra-low resolution. 🚫 Hide all other players. 🌫️ Closer fog for GPU relief.'
                  )}
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
      {miniGameOpen && <MiniGameModal />}

      {/* ═══ SỔ NHIỆM VỤ ĐIỀU TRA PHÒNG BAO CẤP ═══ */}
      <InvestigationNotebook />

      {/* ═══ POPUP HƯỚNG DẪN KHI VÀO PHÒNG BAO CẤP ═══ */}
      <RoomWelcomeModal />

      {/* ═══ HUD HƯỚNG DẪN NGỒI GHẾ ĐẠI BIỂU ═══ */}
      {sittingPrompt && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-40 bg-slate-950/95 border-2 border-cyan-500/30 backdrop-blur-md px-6 py-3 rounded-2xl flex items-center gap-3 shadow-2xl animate-bounce">
          <span className="flex h-3.5 w-3.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-cyan-500"></span>
          </span>
          <span className="text-xs font-black tracking-wider text-slate-100 uppercase font-mono">
            {sittingPrompt === 'sit' ? (
              language === 'vi' ? 'Ấn F để ngồi' : 'Press F to Sit'
            ) : (
              language === 'vi' ? 'Ấn F để đứng dậy | Giữ chuột phải hoặc Z/C để Zoom' : 'Press F to Stand Up | Hold Right Click or Z/C to Zoom'
            )}
          </span>
        </div>
      )}
    </div>
  );
}
