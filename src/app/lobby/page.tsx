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
import { RoomTwoDocumentModal } from '@/components/ui/RoomTwoDocumentModal';
import { CeramicsCollection } from '@/components/ui/CeramicsCollection';
import { MarketEconomyQuest } from '@/components/ui/MarketEconomyQuest';

// ── Summary Minigame data (mirrored from RoomFour constants) ──
const MG_SITUATIONS = [
  { text: 'Được mùa nhưng thu nhập lại giảm.', category: 'market' },
  { text: 'Ít người sử dụng nhưng vẫn được đầu tư.', category: 'state' },
  { text: 'Cùng một sản phẩm nhưng có rất nhiều đơn vị cùng cung cấp.', category: 'multi_sector' },
  { text: 'Khó khăn về tài chính nhưng vẫn được tiếp cận dịch vụ.', category: 'social' },
  { text: 'Một sản phẩm hoàn thành sau nhiều công đoạn ở nhiều quốc gia.', category: 'integration' },
  { text: 'Nhu cầu tăng làm giá tăng.', category: 'market' },
  { text: 'Không đạt tiêu chuẩn nên không được phép tiếp tục hoạt động.', category: 'state' },
  { text: 'Nhiều mô hình cùng tồn tại trong một lĩnh vực.', category: 'multi_sector' },
  { text: 'Điều kiện sống khác nhau nhưng cơ hội tiếp cận gần như giống nhau.', category: 'social' },
  { text: 'Một đơn hàng phải đi qua nhiều quốc gia mới hoàn thành.', category: 'integration' },
  { text: 'Bán chậm nên giá giảm.', category: 'market' },
  { text: 'Phải thay đổi để đáp ứng quy định mới.', category: 'state' },
  { text: 'Nhiều chủ sở hữu cùng tham gia một lĩnh vực.', category: 'multi_sector' },
  { text: 'Không đủ khả năng chi trả nhưng vẫn được hỗ trợ.', category: 'social' },
  { text: 'Một sản phẩm được tạo ra bởi nhiều quốc gia.', category: 'integration' },
  { text: 'Nguồn cung giảm làm giá tăng.', category: 'market' },
  { text: 'Chưa đáp ứng yêu cầu nên phải tạm dừng.', category: 'state' },
  { text: 'Nhiều hình thức kinh doanh cùng cạnh tranh.', category: 'multi_sector' },
  { text: 'Khoảng cách giữa các nhóm được thu hẹp.', category: 'social' },
  { text: 'Một chuỗi sản xuất trải dài qua nhiều quốc gia.', category: 'integration' },
];

const MG_CATEGORIES = [
  { id: 'market', nameVi: 'Cơ chế thị trường', nameEn: 'Market Mechanism', icon: '💹' },
  { id: 'state', nameVi: 'Vai trò Nhà nước', nameEn: 'State Regulation', icon: '🏛️' },
  { id: 'multi_sector', nameVi: 'Nhiều thành phần kinh tế', nameEn: 'Multi-sector Economy', icon: '🏭' },
  { id: 'social', nameVi: 'Công bằng xã hội', nameEn: 'Social Welfare', icon: '❤️' },
  { id: 'integration', nameVi: 'Hội nhập quốc tế', nameEn: 'Global Integration', icon: '🌍' },
];

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
    label: 'Phòng 01: Phòng Bao Cấp',
  },
  {
    doorId: 'door-room2',
    targetRoom: 'gallery-paintings',
    // Cửa đặt ở cuối phòng 1 (Y=3, Z=54) nối sang phòng 2
    position: [0, 3.0, 54.0] as [number, number, number],
    rotation: [0, Math.PI, 0] as [number, number, number],
    label: 'Phòng 02: Phòng Đổi Mới',
  },
  {
    doorId: 'door-room3',
    targetRoom: 'gallery-ceramics',
    position: [0, 3.0, 100.0] as [number, number, number],
    rotation: [0, Math.PI, 0] as [number, number, number],
    label: 'Phòng 03: Phòng Hội Nhập',
  },
  {
    doorId: 'door-room4',
    targetRoom: 'gallery-market-economy',
    position: [0, 3.0, 130.0] as [number, number, number],
    rotation: [0, Math.PI, 0] as [number, number, number],
    label: 'Phòng 04: Phòng Thị Trường',
  },
  {
    doorId: 'door-room5',
    targetRoom: 'gallery-three',
    position: [0, 3.0, 280.0] as [number, number, number],
    rotation: [0, Math.PI, 0] as [number, number, number],
    label: 'Phòng 05: Phòng Thành Quả',
  },
];

// Cấu hình các cổng cửa dịch chuyển tương tác khi đứng gần và nhấn E (Tách phòng độc lập)
const INTERACTIVE_DOORS = [
  // --- LOBBY <-> ROOM 1 ---
  {
    id: 'lobby-to-room1',
    fromRoom: 'lobby',
    toRoom: 'gallery-subsidy',
    doorId: 'door-room1',
    check: (x: number, z: number) => z >= 6.0 && z <= 8.0 && Math.abs(x) < 2.2,
    spawnPos: [0, 3.0, 10.0] as [number, number, number],
    promptVi: 'vào Phòng 01: Phòng Bao Cấp',
    promptEn: 'enter Room 01: Subsidy Room'
  },
  {
    id: 'room1-to-lobby',
    fromRoom: 'gallery-subsidy',
    toRoom: 'lobby',
    doorId: 'door-room1',
    check: (x: number, z: number) => z >= 8.0 && z <= 10.0 && Math.abs(x) < 2.2,
    spawnPos: [0, 0, 6.5] as [number, number, number],
    promptVi: 'quay lại Sảnh chính',
    promptEn: 'return to Lobby'
  },
  // --- ROOM 1 <-> ROOM 2 ---
  {
    id: 'room1-to-room2',
    fromRoom: 'gallery-subsidy',
    toRoom: 'gallery-paintings',
    doorId: 'door-room2',
    check: (x: number, z: number) => z >= 52.0 && z <= 54.0 && Math.abs(x) < 2.2,
    spawnPos: [0, 3.0, 56.0] as [number, number, number],
    promptVi: 'vào Phòng 02: Phòng Đổi Mới',
    promptEn: 'enter Room 02: Doi Moi Room'
  },
  {
    id: 'room2-to-room1',
    fromRoom: 'gallery-paintings',
    toRoom: 'gallery-subsidy',
    doorId: 'door-room2',
    check: (x: number, z: number) => z >= 54.0 && z <= 56.0 && Math.abs(x) < 2.2,
    spawnPos: [0, 3.0, 52.0] as [number, number, number],
    promptVi: 'quay lại Phòng 01',
    promptEn: 'return to Room 01'
  },
  // --- ROOM 2 <-> ROOM 3 ---
  {
    id: 'room2-to-room3',
    fromRoom: 'gallery-paintings',
    toRoom: 'gallery-ceramics',
    doorId: 'door-room3',
    check: (x: number, z: number) => z >= 98.0 && z <= 100.0 && Math.abs(x) < 2.2,
    spawnPos: [0, 3.0, 102.0] as [number, number, number],
    promptVi: 'vào Phòng 03: Phòng Hội Nhập',
    promptEn: 'enter Room 03: Integration Room'
  },
  {
    id: 'room3-to-room2',
    fromRoom: 'gallery-ceramics',
    toRoom: 'gallery-paintings',
    doorId: 'door-room3',
    check: (x: number, z: number) => z >= 100.0 && z <= 102.0 && Math.abs(x) < 2.2,
    spawnPos: [0, 3.0, 98.0] as [number, number, number],
    promptVi: 'quay lại Phòng 02',
    promptEn: 'return to Room 02'
  },
  // --- ROOM 3 <-> ROOM 4 ---
  {
    id: 'room3-to-room4',
    fromRoom: 'gallery-ceramics',
    toRoom: 'gallery-market-economy',
    doorId: 'door-room4',
    check: (x: number, z: number) => z >= 128.0 && z <= 130.0 && Math.abs(x) < 2.2,
    spawnPos: [0, 3.0, 133.0] as [number, number, number],
    promptVi: 'vào Phòng 04: Phòng Thị Trường',
    promptEn: 'enter Room 04: Market Economy'
  },
  {
    id: 'room4-to-room3',
    fromRoom: 'gallery-market-economy',
    toRoom: 'gallery-ceramics',
    doorId: 'door-room4',
    check: (x: number, z: number) => z >= 130.0 && z <= 132.0 && Math.abs(x) < 2.2,
    spawnPos: [0, 3.0, 128.0] as [number, number, number],
    promptVi: 'quay lại Phòng 03',
    promptEn: 'return to Room 03'
  },
  // --- ROOM 4 <-> ROOM 5 ---
  {
    id: 'room4-to-room5',
    fromRoom: 'gallery-market-economy',
    toRoom: 'gallery-three',
    doorId: 'door-room5',
    check: (x: number, z: number) => z >= 278.0 && z <= 280.0 && Math.abs(x) < 2.2,
    spawnPos: [0, 3.0, 282.0] as [number, number, number],
    promptVi: 'vào Phòng 05: Phòng Thành Quả',
    promptEn: 'enter Room 05: Achievements Room'
  },
  {
    id: 'room5-to-room4',
    fromRoom: 'gallery-three',
    toRoom: 'gallery-market-economy',
    doorId: 'door-room5',
    check: (x: number, z: number) => z >= 280.0 && z <= 282.0 && Math.abs(x) < 2.2,
    spawnPos: [0, 3.0, 278.0] as [number, number, number],
    promptVi: 'quay lại Phòng 04',
    promptEn: 'return to Room 04'
  }
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
  const { doorStates, activeGallery, sittingPosition, roomTwoDocOpen } = useMuseum();
  const theta = useRef(Math.PI);
  const phi = useRef(Math.PI / 2.3);
  const isMouseDown = useRef(false);
  const isZooming = useRef(false);
  const roomTwoDocOpenRef = useRef(false);

  useEffect(() => {
    roomTwoDocOpenRef.current = !!roomTwoDocOpen;
  }, [roomTwoDocOpen]);

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
      if (roomTwoDocOpenRef.current) return;
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

  useFrame((state, delta) => {
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

    let sitOffsetX = 0;
    let sitOffsetZ = 0;
    let sitOffsetY = 0;

    // Giới hạn hướng xoay ngang của đầu tối đa 90 độ sang 2 bên khi ngồi ghế
    if (sittingPosition && sittingPosition.rotationY !== undefined) {
      const bodyYaw = sittingPosition.rotationY;
      const forwardTheta = bodyYaw + Math.PI; // Bù 180 độ vì camera hướng ngược chiều với mặt trước của body mặc định
      
      if (roomTwoDocOpenRef.current) {
        // Khóa hướng nhìn thẳng về phía trước khi đang mở màn hình tài liệu
        theta.current = forwardTheta;
        phi.current = Math.PI / 2;
      } else {
        let diff = theta.current - forwardTheta;
        diff = Math.atan2(Math.sin(diff), Math.cos(diff));
        const clampedDiff = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, diff));
        theta.current = forwardTheta + clampedDiff;
      }

      // Dịch camera ra phía trước mặt 0.35m để tránh che khuất, và nâng cao thêm 0.08m
      sitOffsetX = -0.35 * Math.sin(forwardTheta);
      sitOffsetZ = -0.35 * Math.cos(forwardTheta);
      sitOffsetY = 0.08;
    }

    // Nếu đang Zoom hoặc Ngồi (First Person), đặt camera cao ngang tầm mắt/đầu thật của nhân vật (1.12m)
    // Nếu đi lại bình thường (Third Person), đặt camera nhìn vào vùng lưng/cổ (0.6m)
    const isFirstPerson = !!(isZooming.current || sittingPosition);
    const targetHeight = py + (isFirstPerson ? 1.12 : 0.6);

    // Khi zoom hoặc khi đang ngồi ghế, thu nhỏ khoảng cách camera về 0 (góc nhìn thứ nhất) để không bị cản bởi đầu nhân vật
    const idealDist = isFirstPerson ? 0.0 : 5.5;

    // Khi zoom thì ẩn nhân vật để tránh clipping, nhưng khi ngồi thì vẫn hiện nhân vật (chỉ ẩn đầu) để người chơi nhìn thấy tay chân, thân thể mình
    if (isZooming.current) {
      player.visible = false;
    } else {
      player.visible = true;
    }

    const xOff = idealDist * Math.sin(theta.current) * Math.sin(phi.current);
    const yOff = idealDist * Math.cos(phi.current);
    const zOff = idealDist * Math.cos(theta.current) * Math.sin(phi.current);

    // Xác định ranh giới camera dựa trên vị trí người chơi và trạng thái các cửa để tránh camera nhìn xuyên qua cửa đóng
    const isDoor1Open = doorStates['door-room1']?.isOpen || false;
    const isDoor2Open = doorStates['door-room2']?.isOpen || false;
    const isDoor3Open = doorStates['door-room3']?.isOpen || false;
    const isDoor4Open = doorStates['door-room4']?.isOpen || false;
    const isDoor5Open = doorStates['door-room5']?.isOpen || false;

    let minX = -LOBBY_W / 2 + 0.5; // -14.5
    let maxX = LOBBY_W / 2 - 0.5;  // 14.5
    let minZ = -9.4;
    let maxZ = 7.8;

    if (pz <= 8.0) {
      // Đang ở Sảnh
      minX = -LOBBY_W / 2 + 0.5;
      maxX = LOBBY_W / 2 - 0.5;
      minZ = -9.4;
      maxZ = isDoor1Open ? (isDoor2Open ? (isDoor3Open ? (isDoor4Open ? (isDoor5Open ? 329.8 : 279.8) : 129.8) : 99.8) : 53.8) : 7.8;
    } 
    else if (pz > 8.0 && pz <= 54.0) {
      // Đang ở Phòng 1
      minX = -11.5;
      maxX = 11.5;
      minZ = isDoor1Open ? -9.4 : 8.2;
      maxZ = isDoor2Open ? (isDoor3Open ? (isDoor4Open ? (isDoor5Open ? 329.8 : 279.8) : 129.8) : 99.8) : 53.8;
    } 
    else if (pz > 54.0 && pz <= 100.0) {
      // Đang ở Phòng 2
      minX = -11.5;
      maxX = 11.5;
      minZ = isDoor2Open ? (isDoor1Open ? -9.4 : 8.2) : 54.2;
      maxZ = isDoor3Open ? (isDoor4Open ? (isDoor5Open ? 329.8 : 279.8) : 129.8) : 99.8;
    } 
    else if (pz > 100.0 && pz <= 130.0) {
      // Đang ở Phòng 3 (Gốm sứ)
      minX = -14.5;
      maxX = 14.5;
      minZ = isDoor3Open ? (isDoor2Open ? (isDoor1Open ? -9.4 : 8.2) : 54.2) : 100.2;
      maxZ = isDoor4Open ? (isDoor5Open ? 329.8 : 279.8) : 129.8;
    } 
    else if (pz > 130.0 && pz <= 280.0) {
      // Đang ở Phòng 4 (Kinh tế thị trường)
      minX = -8.5;
      maxX = 8.5;
      minZ = isDoor4Open ? (isDoor3Open ? (isDoor2Open ? (isDoor1Open ? -9.4 : 8.2) : 54.2) : 100.2) : 130.2;
      maxZ = isDoor5Open ? 329.8 : 279.8;
    }
    else if (pz > 280.0 && pz <= 330.0) {
      // Đang ở Phòng 5 (Thành quả)
      minX = -11.5;
      maxX = 11.5;
      minZ = isDoor5Open ? (isDoor4Open ? (isDoor3Open ? (isDoor2Open ? (isDoor1Open ? -9.4 : 8.2) : 54.2) : 100.2) : 130.2) : 280.2;
      maxZ = 329.8;
    }

    const camX = Math.max(minX, Math.min(maxX, px + xOff + sitOffsetX));
    const camZ = Math.max(minZ, Math.min(maxZ, pz + zOff + sitOffsetZ));

    // Tính toán độ cao sàn nhà thực tế tại vị trí camera để kẹp độ cao tối thiểu
    const groundYAtCam = getLobbyGroundY(camX, camZ, doorStates);
    const minCamY = groundYAtCam + 0.45;

    // Giới hạn camera không vượt quá trần nhà để chống nhìn xuyên trần
    let maxCamY = LOBBY_H - 0.5; // Sảnh mặc định 11.5m
    if (camZ > 8.0) {
      const activeRoomHeight = activeGallery?.room_height ?? 6.0;
      maxCamY = 3.0 + activeRoomHeight - 0.5;
    }
    const camY = Math.max(minCamY, Math.min(maxCamY, targetHeight + yOff + sitOffsetY));

    targetCamPos.set(camX, camY, camZ);

    // Khi zoom hoặc đang ngồi ghế, hướng nhìn của camera sẽ nhìn thẳng ra phía trước tầm nhìn thay vì nhìn vào đầu nhân vật
    if (isZooming.current || sittingPosition) {
      const lookAtX = px - 10 * Math.sin(theta.current) * Math.sin(phi.current);
      const lookAtY = targetHeight - 10 * Math.cos(phi.current);
      const lookAtZ = pz - 10 * Math.cos(theta.current) * Math.sin(phi.current);
      targetLookAt.set(lookAtX, lookAtY, lookAtZ);
    } else {
      targetLookAt.set(px, targetHeight, pz);
    }

    const camAlpha = 1.0 - Math.exp(-8.0 * Math.min(0.1, delta));
    camera.position.lerp(targetCamPos, camAlpha);
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
const LobbyPlayer: React.FC<{
  onActiveDoorChange: (door: any) => void;
  activeDoor: any;
  activeDoorRef: React.RefObject<any>;
  transitionLoading: boolean;
  onTransitionLoadingChange: (loading: boolean) => void;
  onTransitionRoomNameChange: (name: string) => void;
}> = ({
  onActiveDoorChange,
  activeDoor,
  activeDoorRef,
  transitionLoading,
  onTransitionLoadingChange,
  onTransitionRoomNameChange,
}) => {
  const playerRef = useRef<THREE.Group>(null);
  const keys = useRef({ w: false, a: false, s: false, d: false, e: false, shift: false, space: false });
  const isMoving = useRef(false);
  const jumpVelocity = useRef(0);
  const isJumping = useRef(false);

  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);

  const { settings, doorStates, loadedRooms, teleportTarget, setTeleportTarget, clearTeleport, currentRoom, setCurrentRoom, socket, selectedExhibit, sittingPosition, setSittingPosition, sittingPrompt, setSittingPrompt, roomOneLocked, currentRoomLocked, welcomeModalOpen, roomOneCompleted, roomTwoDocOpen, setRoomTwoDocOpen, roomTwoScore, language } = useMuseum();
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
      socket?.emit('move', {
        x: teleportTarget.x,
        y: teleportTarget.y,
        z: teleportTarget.z,
        yaw: playerRef.current.rotation.y,
        isSitting: false,
        headYaw: 0,
      });
      clearTeleport();
    }
  }, [teleportTarget, clearTeleport, baseY, socket]);

  /**
   * Kiểm tra va chạm mở rộng (sảnh + phòng triển lãm)
   */
  const checkCollision = useCallback(
    (x: number, z: number, currentY: number): boolean => {
      // Tự động phát hiện phòng hiện tại dựa trên tọa độ Z thực tế của người chơi (khắc phục lỗi khóa di chuyển do trễ state React)
      const playerZ = playerRef.current ? playerRef.current.position.z : 0;
      let activeRoom = 'lobby';
      if (playerZ > 8.0 && playerZ <= 54.0) {
        activeRoom = 'gallery-subsidy';
      } else if (playerZ > 54.0 && playerZ <= 100.0) {
        activeRoom = 'gallery-paintings';
      } else if (playerZ > 100.0 && playerZ <= 130.0) {
        activeRoom = 'gallery-ceramics';
      } else if (playerZ > 130.0 && playerZ <= 280.0) {
        activeRoom = 'gallery-market-economy';
      } else if (playerZ > 280.0) {
        activeRoom = 'gallery-three';
      }

      // Ranh giới vật lý cứng giữa các phòng triển lãm để ngăn người chơi đi bộ xuyên phòng (bắt buộc nhấn E)
      if (activeRoom === 'lobby' && z > 7.7) return true;
      if (activeRoom === 'gallery-subsidy' && (z < 8.3 || z > 53.7)) return true;
      if (activeRoom === 'gallery-paintings' && (z < 54.3 || z > 99.7)) return true;
      if (activeRoom === 'gallery-ceramics' && (z < 100.3 || z > 129.7)) return true;
      if (activeRoom === 'gallery-market-economy' && (z < 130.3 || z > 279.7)) return true;
      if (activeRoom === 'gallery-three' && z < 280.3) return true;

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
        // Chỉ chặn khi đi lùi về sảnh qua cửa 1 đang đóng
        if (z < 8.6) {
          const passingDoor1 = doorStates['door-room1']?.isOpen && x > -2.2 && x < 2.2;
          if (!passingDoor1) return true;
        }

        // Tường chính bên trái/phải
        if (x < -11.7 || x > 11.7) return true;

        // 1. Ghế gỗ băng cũ trong phòng (local Z = -12.0 & 12.0 => Global Z = 19.0 & 43.0)
        // Khi đang nhảy cao hơn mặt ghế thì cho vượt qua.
        const canJumpOverBench = currentY > 3.75;
        if (!canJumpOverBench && z > 18.5 && z < 19.5 && x > -1.7 && x < 1.7) {
          return true;
        }
        if (!canJumpOverBench && z > 42.5 && z < 43.5 && x > -1.7 && x < 1.7) {
          return true;
        }

        // 5. Dãy ghế ngồi giữa phòng (local Z = -4.0, 4.0 => Global Z = 27.0, 35.0)
        const centralBenchZs = [27.0, 35.0];
        for (const benchZ of centralBenchZs) {
          if (!canJumpOverBench && z > benchZ - 0.65 && z < benchZ + 0.65 && x > -2.15 && x < 2.15) {
            return true;
          }
        }

        // 6. Bàn lọ hoa trang trí (mỗi bên 3 bàn => Global Z = 15.0, 31.0, 47.0)
        const dxVideoPedestal = x;
        const dzVideoPedestal = z - 31.0;
        if (Math.sqrt(dxVideoPedestal * dxVideoPedestal + dzVideoPedestal * dzVideoPedestal) < 1.7) {
          return true;
        }

        const decorTables = [
          { x: -7.2, z: 15.0 },
          { x: -7.2, z: 31.0 },
          { x: -7.2, z: 47.0 },
          { x: 7.2, z: 15.0 },
          { x: 7.2, z: 31.0 },
          { x: 7.2, z: 47.0 },
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
        // Chỉ chặn khi đi lùi về phòng 1 qua cửa 2 đang đóng
        if (z < 54.6) {
          const passingDoor2 = doorStates['door-room2']?.isOpen && x > -2.2 && x < 2.2;
          if (!passingDoor2) return true;
        }

        if (x < -11.7 || x > 11.7) return true;

        // Chặn các bàn đại biểu và ghế trong Phòng 2 (X xoay dọc, 5 dãy bàn bậc thang)
        const localZ = z - 77.0;
        const deskXCoords = [-5.0, -1.8, 1.4, 4.6, 7.8];
        // Chặn bục sân khấu bên trái và lan can 2 đầu sân khấu (local X: -12.0 đến -7.6, local Z: -7.6 đến 7.6)
        if (x < -7.6 && localZ > -7.6 && localZ < 7.6) return true;

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
        // Chỉ chặn khi đi lùi về phòng 2 qua cửa 3 đang đóng
        if (z < 100.6) {
          const passingDoor3 = doorStates['door-room3']?.isOpen && x > -2.2 && x < 2.2;
          if (!passingDoor3) return true;
        }

        if (x < -14.7 || x > 14.7) return true;

        // 1. Va chạm với máy chơi game tại X = 8.0, Z = 128.6 (global)
        if (x > 6.6 && x < 9.4 && z > 127.4 && z < 129.5) {
          return true;
        }

        // 2. Va chạm với hàng rào bên trái (X = -13.2)
        if (x < -12.4) {
          if ((z > 104.2 && z < 109.8) || (z > 112.2 && z < 117.8) || (z > 120.2 && z < 125.8)) {
            return true;
          }
        }

        // 3. Va chạm với hàng rào bên phải (X = 13.2)
        if (x > 12.4) {
          if ((z > 104.2 && z < 109.8) || (z > 112.2 && z < 117.8) || (z > 120.2 && z < 125.8)) {
            return true;
          }
        }

        // 4. Va chạm với hàng rào cửa vào trước (Z = 101.8 global)
        if (z < 102.6) {
          if ((x > -10.8 && x < -5.2) || (x > 5.2 && x < 10.8)) {
            return true;
          }
        }

        // 5. Va chạm với hàng rào phía sau bên trái (Z = 128.2 global)
        if (z > 127.4) {
          if (x > -10.8 && x < -5.2) {
            return true;
          }
        }

        if (z > 129.3) {
          const passingDoor4 = doorStates['door-room4']?.isOpen && x > -2.2 && x < 2.2;
          if (!passingDoor4) return true;
        }
        return false;
      }

      // ── PHÒNG TRIỂN LÃM 4 (gallery-market-economy: Z 130.0 -> 280.0) ──
      if (z > 130.0 && z <= 280.0) {
        // Chỉ chặn khi đi lùi về phòng 3 qua cửa 4 đang đóng
        if (z < 130.6) {
          const passingDoor4 = doorStates['door-room4']?.isOpen && x > -2.2 && x < 2.2;
          if (!passingDoor4) return true;
        }

        // Biên giới tường bên (rộng 18m, X = ±9m)
        if (x < -8.7 || x > 8.7) return true;

        // Tường sau phòng 4 (Z = 280.0)
        if (z > 279.3) {
          const passingDoor5 = doorStates['door-room5']?.isOpen && x > -2.2 && x < 2.2;
          if (!passingDoor5) return true;
        }
        return false;
      }

      // ── PHÒNG TRIỂN LÃM 5 (gallery-three: Z 280.0 -> 330.0) ──
      if (z > 280.0 && z <= 330.0) {
        if (z < 280.6) {
          const passingDoor5 = doorStates['door-room5']?.isOpen && x > -2.2 && x < 2.2;
          if (!passingDoor5) return true;
        }
        if (x < -11.7 || x > 11.7) return true;
        return false;
      }

      return false;
    },
    [doorStates]
  );

  // Bắt phím WASD
  useEffect(() => {
    const movementKeyMap: Record<string, 'w' | 'a' | 's' | 'd' | 'e' | 'shift' | 'space'> = {
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
      ShiftLeft: 'shift',
      ShiftRight: 'shift',
    };

    const shouldIgnoreKeyboard = (target: EventTarget | null) => {
      const el = target as HTMLElement | null;
      if (!el) return false;
      const tagName = el.tagName.toLowerCase();
      return tagName === 'input' || tagName === 'textarea' || el.isContentEditable;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (shouldIgnoreKeyboard(e.target)) return;

      if (e.code === 'KeyE') {
        e.preventDefault();
        if (sittingPositionRef.current) {
          // Chỉ cho phép mở tài liệu khi đang ngồi ở phòng 2
          if (playerRef.current && playerRef.current.position.z > 54.0 && playerRef.current.position.z <= 100.0) {
            setRoomTwoDocOpen((prev: boolean) => !prev);
          }
        } else if (activeDoorRef.current) {
          const door = activeDoorRef.current;
          const targetRoomName = language === 'vi' ? door.promptVi : door.promptEn;
          onTransitionRoomNameChange(targetRoomName);
          onTransitionLoadingChange(true);

          setTimeout(() => {
            // Dịch chuyển người chơi tới vị trí spawn của phòng mới
            setTeleportTarget({
              x: door.spawnPos[0],
              y: door.spawnPos[1],
              z: door.spawnPos[2]
            });
            setCurrentRoom(door.toRoom);

            setTimeout(() => {
              onTransitionLoadingChange(false);
            }, 800);
          }, 1200);
        }
        return;
      }

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
          jumpVelocity.current = 7.5;
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
      keys.current.shift = false;
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
    if (selectedExhibit || transitionLoading || roomOneLocked || currentRoomLocked || welcomeModalOpen) return;

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

    // Kiểm tra khoảng cách đến các cửa dịch chuyển tương tác
    let foundDoor = null;
    if (!sittingPosition) {
      for (const door of INTERACTIVE_DOORS) {
        if (door.fromRoom === currentRoom && door.check(pPos.x, pPos.z)) {
          if (doorStates[door.doorId]?.isOpen) {
            foundDoor = door;
            break;
          }
        }
      }
    }

    if (foundDoor) {
      if (activeDoor?.id !== foundDoor.id) {
        onActiveDoorChange(foundDoor);
      }
    } else {
      if (activeDoor !== null) {
        onActiveDoorChange(null);
      }
    }

    if (sittingPosition) {
      playerRef.current.position.set(sittingPosition.x, sittingPosition.y, sittingPosition.z);
      const bodyYaw = sittingPosition.rotationY !== undefined ? sittingPosition.rotationY : -Math.PI / 2;
      playerRef.current.rotation.y = THREE.MathUtils.lerp(playerRef.current.rotation.y, bodyYaw, 0.15);

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

      // Tính góc xoay đầu thực tế của camera so với hướng thẳng của thân
      const camDir = new THREE.Vector3();
      state.camera.getWorldDirection(camDir);
      const camYaw = Math.atan2(-camDir.x, -camDir.z);
      let hDiff = camYaw - (bodyYaw + Math.PI); // Bù 180 độ vì camera hướng ngược chiều với mặt trước của body mặc định
      hDiff = Math.atan2(Math.sin(hDiff), Math.cos(hDiff));

      // Xoay đầu local (mặc dù local head bị ẩn khi ngồi để tránh clip camera, nhưng vẫn quay đúng hướng)
      if (headRef.current) {
        headRef.current.rotation.y = hDiff;
      }

      // Phát tọa độ ngồi cố định góc nhìn thân cho người khác, kèm góc xoay đầu relative
      const now = state.clock.getElapsedTime() * 1000;
      if (now - lastUpdate.current > 80) {
        socket?.emit('move', {
          x: sittingPosition.x,
          y: sittingPosition.y - baseY, // Gửi tọa độ Y tương đối để server đồng bộ đúng độ cao
          z: sittingPosition.z,
          yaw: bodyYaw, // Gửi yaw cố định của ghế
          isSitting: true,
          headYaw: hDiff, // Gửi góc xoay ngang relative của đầu
        });
        lastUpdate.current = now;
      }

      return;
    }

    const { w, a, s, d, shift } = keys.current;
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

      const speed = shift ? 10.0 : 6.0;
      const curPos = playerRef.current.position;
      const curGroundY = getLobbyGroundY(curPos.x, curPos.z, doorStates);

      const movementDelta = Math.min(0.04, delta);
      const nextX = curPos.x + moveDir.x * speed * movementDelta;
      const nextZ = curPos.z + moveDir.z * speed * movementDelta;

      if (!checkCollision(nextX, curPos.z, curGroundY)) {
        curPos.x = nextX;
      }
      if (!checkCollision(curPos.x, nextZ, curGroundY)) {
        curPos.z = nextZ;
      }

      const targetRot = Math.atan2(moveDir.x, moveDir.z);
      let diff = targetRot - playerRef.current.rotation.y;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      playerRef.current.rotation.y += diff * 12 * movementDelta;
    }

    const curPos = playerRef.current.position;
    const curGroundY = getLobbyGroundY(curPos.x, curPos.z, doorStates);

    let bobY = 0;
    const t = state.clock.getElapsedTime();
    if (moving && settings.animations) {
      bobY = Math.sin(t * (shift ? 16 : 11)) * 0.032;
    }
    const baseGroundY = curGroundY + baseY;

    if (isJumping.current) {
      jumpVelocity.current -= 24.0 * delta;
      curPos.y += jumpVelocity.current * delta;

      if (curPos.y <= baseGroundY) {
        curPos.y = baseGroundY;
        jumpVelocity.current = 0;
        isJumping.current = false;
      }
    } else {
      const targetY = baseGroundY + bobY;
      const lerpAlphaY = 1.0 - Math.exp(-15.0 * delta);
      curPos.y = THREE.MathUtils.lerp(curPos.y, targetY, lerpAlphaY);
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
    } else if (curPos.z > 130.0 && curPos.z <= 210.0) {
      setCurrentRoom('gallery-market-economy');
    } else if (curPos.z > 210.0) {
      // Dịch chuyển ngược lại Sảnh chính khi đi qua cửa ra
      curPos.set(0, baseY, -5.0);
      setCurrentRoom('lobby');
      if (playerRef.current) {
        playerRef.current.position.set(0, baseY, -5.0);
        playerRef.current.rotation.set(0, 0, 0);
      }
    }

    // Arm/Leg swing
    const swingSpeed = shift ? 16 : 11;
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

    // Trả đầu về vị trí thẳng khi đứng dậy/đi lại
    if (headRef.current) {
      headRef.current.rotation.y += (0 - headRef.current.rotation.y) * 0.15;
    }

    // Gửi tọa độ qua socket (12.5Hz — tối ưu mượt mà và nhẹ tải cho 65 người)
    const now = state.clock.getElapsedTime() * 1000;
    if (now - lastUpdate.current > 80) {
      if (socket && socket.connected) {
        socket.emit("move", {
          x: playerRef.current.position.x,
          y: playerRef.current.position.y - baseY, // Gửi tọa độ Y logic (bàn chân chạm đất)
          z: playerRef.current.position.z,
          yaw: playerRef.current.rotation.y,
          isSitting: false,
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
          {!sittingPosition && (
            <group ref={headRef} position={[0, 0.7, 0]}>
              <mesh>
                <sphereGeometry args={[0.18, 20, 20]} />
                <meshStandardMaterial {...skinProps} />
              </mesh>
              {/* Mắt trái */}
              <mesh position={[-0.06, 0.04, 0.16]}>
                <sphereGeometry args={[0.025, 12, 12]} />
                <meshBasicMaterial color="#000000" />
              </mesh>
              {/* Mắt phải */}
              <mesh position={[0.06, 0.04, 0.16]}>
                <sphereGeometry args={[0.025, 12, 12]} />
                <meshBasicMaterial color="#000000" />
              </mesh>
            </group>
          )}
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
          {!sittingPosition && (
            <group ref={headRef} position={[0, 0.7, 0]}>
              <mesh>
                <sphereGeometry args={[HEAD_R, 28, 28]} />
                <meshStandardMaterial {...skinProps} />
              </mesh>
              {/* Mắt trái */}
              <mesh position={[-0.07, 0.05, 0.20]}>
                <sphereGeometry args={[0.03, 16, 16]} />
                <meshBasicMaterial color="#000000" />
              </mesh>
              {/* Mắt phải */}
              <mesh position={[0.07, 0.05, 0.20]}>
                <sphereGeometry args={[0.03, 16, 16]} />
                <meshBasicMaterial color="#000000" />
              </mesh>
            </group>
          )}
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
    setCurrentRoom,
    setTeleportTarget,
    clearTeleport,
    socket,
    updatePreset,
    updateSettings,
    miniGameOpen,
    setMiniGameOpen,
    sittingPrompt,
    otherUsers,
  } = useMuseum();
  const [inputNickname, setInputNickname] = useState('');
  const [inputError, setInputError] = useState('');
  const [entered, setEntered] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Trạng thái chuyển phòng mượt mà qua màn hình loading (Tách không gian các phòng độc lập)
  const [transitionLoading, setTransitionLoading] = useState(false);
  const [transitionRoomName, setTransitionRoomName] = useState('');
  const [activeDoorInfo, setActiveDoorInfo] = useState<any | null>(null);
  const activeDoorInfoRef = useRef<any>(null);
  useEffect(() => {
    activeDoorInfoRef.current = activeDoorInfo;
  }, [activeDoorInfo]);

  // ── Summary Minigame state (Room 4) ──
  const [mgOpen, setMgOpen] = useState(false);
  const [mgStep, setMgStep] = useState<'rules' | 'game' | 'complete'>('rules');
  const [mgHasProgress, setMgHasProgress] = useState(false);
  const [mgIndex, setMgIndex] = useState(0);
  const [mgScore, setMgScore] = useState(0);
  const [mgDragOver, setMgDragOver] = useState<string | null>(null);
  const [mgFeedback, setMgFeedback] = useState<'correct' | 'incorrect' | 'timeout' | null>(null);
  const [mgQuestions, setMgQuestions] = useState<typeof MG_SITUATIONS>(MG_SITUATIONS);
  const [questionTimeLeft, setQuestionTimeLeft] = useState(15);
  const [mgEarnedPoints, setMgEarnedPoints] = useState<number | null>(null);

  const shuffleQuestions = (array: typeof MG_SITUATIONS) => {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  // Load played status on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const played = localStorage.getItem('minigame_played_gallery_four') === 'true';
      if (played) {
        const savedScore = localStorage.getItem('minigame_score_gallery_four');
        if (savedScore) {
          const parsedScore = parseInt(savedScore, 10);
          setMgScore(parsedScore);
          if (socket && socket.connected) {
            socket.emit('update-score', { score: parsedScore });
          }
        }
      }
    }
  }, [socket]);

  // Đếm ngược 15s cho mỗi câu hỏi
  useEffect(() => {
    if (mgStep !== 'game' || mgFeedback !== null || !mgOpen) {
      return;
    }

    if (questionTimeLeft <= 0) {
      setMgFeedback('timeout');
      return;
    }

    const interval = setTimeout(() => {
      setQuestionTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(interval);
  }, [mgStep, mgFeedback, questionTimeLeft, mgOpen]);

  // Tự động chuyển câu hỏi khi bị hết giờ (timeout)
  useEffect(() => {
    if (mgFeedback !== 'timeout' || mgStep !== 'game' || !mgOpen) {
      return;
    }

    const timerComplete = setTimeout(() => {
      setMgFeedback(null);
      setMgEarnedPoints(null);
      if (mgIndex < mgQuestions.length - 1) {
        setMgIndex(prev => prev + 1);
        setQuestionTimeLeft(15);
      } else {
        setMgStep('complete');
        setMgHasProgress(false);
        if (typeof window !== 'undefined') {
          localStorage.setItem('minigame_played_gallery_four', 'true');
          localStorage.setItem('minigame_score_gallery_four', mgScore.toString());
        }
        if (socket && socket.connected) {
          socket.emit('update-score', { score: mgScore });
        }
      }
    }, 1200);

    return () => clearTimeout(timerComplete);
  }, [mgStep, mgFeedback, mgIndex, mgQuestions.length, mgOpen, mgScore, socket]);

  // Listen for CustomEvent from RoomFour
  useEffect(() => {
    const handler = () => {
      setMgOpen(true);
      setMiniGameOpen(true);
      if (typeof window !== 'undefined' && localStorage.getItem('minigame_played_gallery_four') === 'true') {
        setMgStep('complete');
        const savedScore = localStorage.getItem('minigame_score_gallery_four');
        if (savedScore) {
          const parsedScore = parseInt(savedScore, 10);
          setMgScore(parsedScore);
          if (socket && socket.connected) {
            socket.emit('update-score', { score: parsedScore });
          }
        }
      } else {
        if (mgHasProgress) {
          setMgStep('rules');
        } else {
          setMgStep('rules');
          setMgIndex(0);
          setMgScore(0);
          setMgFeedback(null);
          setQuestionTimeLeft(15);
          setMgEarnedPoints(null);
        }
      }
    };
    window.addEventListener('openSummaryMinigame', handler);
    return () => window.removeEventListener('openSummaryMinigame', handler);
  }, [socket, setMiniGameOpen, mgHasProgress]);

  const handleCloseMinigame = () => {
    setMgOpen(false);
    setMiniGameOpen(false);
    setMgStep('rules');
    setMgIndex(0);
    setMgScore(0);
    setMgFeedback(null);
    setQuestionTimeLeft(15);
    setMgEarnedPoints(null);
    setMgHasProgress(false);
  };

  const handleCloseMinigameWithoutReset = () => {
    setMgOpen(false);
    setMiniGameOpen(false);
  };

  const handleMgAnswer = (catId: string) => {
    if (mgFeedback !== null || questionTimeLeft <= 0) return;
    const correct = mgQuestions[mgIndex].category;
    let nextScore = mgScore;

    // Trả lời trước 10s (thời gian đếm ngược còn >= 5s) được 10 điểm, còn lại được 5 điểm
    const points = questionTimeLeft >= 5 ? 10 : 5;

    if (catId === correct) {
      setMgFeedback('correct');
      setMgEarnedPoints(points);
      nextScore = mgScore + points;
      setMgScore(nextScore);
    } else {
      setMgFeedback('incorrect');
    }

    const timerAns = setTimeout(() => {
      setMgFeedback(null);
      setMgEarnedPoints(null);
      if (mgIndex < mgQuestions.length - 1) {
        setMgIndex(prev => prev + 1);
        setQuestionTimeLeft(15);
      } else {
        setMgStep('complete');
        setMgHasProgress(false);
        if (typeof window !== 'undefined') {
          localStorage.setItem('minigame_played_gallery_four', 'true');
          localStorage.setItem('minigame_score_gallery_four', nextScore.toString());
        }
        if (socket && socket.connected) {
          socket.emit('update-score', { score: nextScore });
        }
      }
    }, 1200);

    return () => clearTimeout(timerAns);
  };

  // Sync activeGallery với currentRoom trong sảnh + phòng triển lãm 3D liên tục
  useEffect(() => {
    if (!entered || !nickname) {
      setActiveGallery(null);
      return;
    }
    const ROOM_GALLERY_MAP: Record<string, { id: string; name: string }> = {
      'lobby': { id: 'lobby', name: 'Sảnh Bảo Tàng' },
      'gallery-subsidy': { id: 'gallery-subsidy', name: 'Phòng 01: Phòng Bao Cấp' },
      'gallery-paintings': { id: 'gallery-paintings', name: 'Phòng 02: Phòng Đổi Mới' },
      'gallery-ceramics': { id: 'gallery-ceramics', name: 'Phòng 03: Phòng Hội Nhập' },
      'gallery-market-economy': { id: 'gallery-market-economy', name: 'Phòng 04: Phòng Thị Trường' },
      'gallery-three': { id: 'gallery-three', name: 'Phòng 05: Phòng Thành Quả' },
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
              gl={{ antialias: settings.preset === 'medium', powerPreference: 'high-performance' }}
              camera={{ position: [0, 3, -2], fov: 65 }}
            >
              <AdaptiveDpr pixelated />
              <AdaptiveEvents />
              <color attach="background" args={['#0d0d12']} />
              <fog attach="fog" args={['#0d0d12', settings.preset === 'ultra-low' ? 10 : settings.preset === 'low' ? 20 : 30, settings.preset === 'ultra-low' ? 60 : settings.preset === 'low' ? 80 : 120]} />

              <Suspense fallback={null}>
                {/* Sảnh bảo tàng - Chỉ render khi người chơi đang ở Sảnh để tối ưu hóa hiệu năng vẽ */}
                {currentRoom === 'lobby' && <MuseumLobby />}

                {/* Nhân vật người chơi với các prop tương tác chuyển phòng */}
                <LobbyPlayer
                  onActiveDoorChange={setActiveDoorInfo}
                  activeDoor={activeDoorInfo}
                  activeDoorRef={activeDoorInfoRef}
                  transitionLoading={transitionLoading}
                  onTransitionLoadingChange={setTransitionLoading}
                  onTransitionRoomNameChange={setTransitionRoomName}
                />

                {/* Multiplayer avatars */}
                <MultiplayerAvatars />

                {/* Bộ precompiler ép GPU tải trước vật liệu */}
                <RoomPrecompiler />

                {/* ═══ CỬA NỐI PHÒNG (Door Portals) - Chỉ render cửa thuộc phòng hiện tại ═══ */}
                {DOOR_CONFIGS.filter(config => {
                  if (config.doorId === 'door-room1') return currentRoom === 'lobby' || currentRoom === 'gallery-subsidy';
                  if (config.doorId === 'door-room2') return currentRoom === 'gallery-subsidy' || currentRoom === 'gallery-paintings';
                  if (config.doorId === 'door-room3') return currentRoom === 'gallery-paintings' || currentRoom === 'gallery-ceramics';
                  if (config.doorId === 'door-room4') return currentRoom === 'gallery-ceramics' || currentRoom === 'gallery-market-economy';
                  if (config.doorId === 'door-room5') return currentRoom === 'gallery-market-economy' || currentRoom === 'gallery-three';
                  return false;
                }).map((config) => (
                  <DoorPortal
                    key={config.doorId}
                    doorId={config.doorId}
                    position={config.position}
                    rotation={config.rotation}
                    isOpen={doorStates[config.doorId]?.isOpen || false}
                    label={config.label}
                  />
                ))}

                {/* ═══ PHÒNG TRIỂN LÃM ĐỘNG (Dynamic Rooms) - Chỉ render phòng hoạt động hiện tại ═══ */}
                {loadedRooms.map((room) => {
                  const offset = ROOM_OFFSETS[room.galleryId];
                  if (!offset) return null;

                  // Tách biệt hoàn toàn không gian các phòng (chỉ render phòng hiện tại)
                  const isVisible = currentRoom === room.galleryId;
                  if (!isVisible) return null;

                  return (
                    <DynamicRoom
                      key={room.galleryId}
                      room={room}
                      offsetZ={offset.z}
                      offsetY={offset.y}
                      isVisible={true}
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

              {/* Option: Max Visible Players */}
              <div className="space-y-2">
                <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest block">
                  {language === 'vi' ? 'Giới hạn số lượng người chơi hiển thị' : 'Visible Players Limit'}
                </span>
                <div className="grid grid-cols-5 gap-1.5 text-center">
                  {([0, 10, 30, 64, 99] as const).map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => updateSettings({ maxAvatars: count })}
                      className={`text-[10px] font-mono font-bold py-1.5 px-0.5 rounded-lg border transition-all cursor-pointer ${
                        settings.maxAvatars === count 
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-black shadow-sm' 
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-750'
                      }`}
                    >
                      {count === 99 ? (language === 'vi' ? 'Tất cả' : 'All') : count}
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

      {/* ── SUMMARY MINIGAME FULLSCREEN OVERLAY (pure DOM, outside Canvas) ── */}
      {mgOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 2147483647, fontFamily: 'Inter, system-ui, sans-serif', display: 'flex', flexDirection: 'column' }}
        >
          {/* Background */}
          <div style={{ position: 'absolute', inset: 0, background: '#020617' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(16,185,129,0.10) 0%, transparent 70%)' }} />

          {/* Content */}
          <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', padding: '24px 32px', boxSizing: 'border-box' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '16px', marginBottom: '24px', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '20px' }}>🏆</span>
                <span style={{ fontWeight: 900, fontSize: '13px', color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.1em' }}>THỬ THÁCH KINH TẾ ĐỊNH HƯỚNG XHCN</span>
              </div>
              <button
                onClick={handleCloseMinigameWithoutReset}
                style={{
                  background: 'transparent',
                  border: '1px solid #334155',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#ef4444';
                  e.currentTarget.style.color = '#ef4444';
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#334155';
                  e.currentTarget.style.color = '#94a3b8';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                ✕ {language === 'vi' ? 'Đóng' : 'Close'}
              </button>
            </div>

            {/* RULES */}
            {mgStep === 'rules' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '28px', maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
                <span style={{ fontSize: '56px' }}>🎮</span>
                <div>
                  <h4 style={{ fontWeight: 900, fontSize: '22px', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>LUẬT CHƠI MINIGAME</h4>
                  <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: 1.7, background: 'rgba(2,6,23,0.6)', padding: '16px 20px', borderRadius: '12px', border: '1px solid #1e293b', textAlign: 'left' }}>
                    Hệ thống sẽ đưa ra <strong style={{ color: '#fff' }}>20 tình huống thực tế</strong> tương ứng với các đặc trưng kinh tế của Việt Nam.<br />
                    • Nhiệm vụ: <strong style={{ color: '#10b981' }}>kéo (drag)</strong> thẻ tình huống thả vào đúng biểu tượng, hoặc <strong style={{ color: '#10b981' }}>click</strong> thẳng vào ô.<br />
                    • Thời gian đếm ngược cho mỗi câu hỏi là <strong style={{ color: '#eab308' }}>15 giây</strong>.<br />
                    • Điểm số: Trả lời đúng <strong style={{ color: '#10b981' }}>trước 10 giây</strong> (đồng hồ còn &gt; 5s) được <strong style={{ color: '#10b981' }}>+10 điểm</strong>. Trả lời đúng <strong style={{ color: '#eab308' }}>sau 10 giây</strong> (đồng hồ còn &le; 5s) được <strong style={{ color: '#eab308' }}>+5 điểm</strong>.
                  </p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', width: '100%' }}>
                  {MG_CATEGORIES.map(cat => (
                    <div key={cat.id} style={{ background: 'rgba(2,6,23,0.5)', border: '1px solid #1e293b', padding: '12px 8px', borderRadius: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '24px' }}>{cat.icon}</span>
                      <span style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textAlign: 'center', lineHeight: 1.3 }}>{language === 'vi' ? cat.nameVi : cat.nameEn}</span>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: '11px', color: '#10b981', fontWeight: 700 }}>Tổng điểm tối đa: <span style={{ fontFamily: 'monospace', fontSize: '14px' }}>200</span> điểm</p>
                {mgHasProgress ? (
                  <button
                    onClick={() => {
                      setMgStep('game');
                    }}
                    style={{ background: '#10b981', color: '#020617', fontWeight: 900, padding: '12px 36px', borderRadius: '12px', fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', border: 'none', boxShadow: '0 0 30px rgba(16,185,129,0.3)' }}
                  >
                    ▶️ {language === 'vi' ? `Tiếp tục chơi (Câu ${mgIndex + 1})` : `Continue (Q${mgIndex + 1})`}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setMgQuestions(shuffleQuestions(MG_SITUATIONS));
                      setMgStep('game');
                      setQuestionTimeLeft(15);
                      setMgEarnedPoints(null);
                      setMgHasProgress(true);
                    }}
                    style={{ background: '#10b981', color: '#020617', fontWeight: 900, padding: '12px 36px', borderRadius: '12px', fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', border: 'none', boxShadow: '0 0 30px rgba(16,185,129,0.3)' }}
                  >
                    🚀 {language === 'vi' ? 'Bắt đầu chơi' : 'Start Game'}
                  </button>
                )}
              </div>
            )}

            {/* GAME */}
            {mgStep === 'game' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>📝 Tình huống {mgIndex + 1} / {mgQuestions.length}</span>
                    <div style={{ flex: 1, height: '4px', background: '#1e293b', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${((mgIndex + 1) / mgQuestions.length) * 100}%`, background: 'linear-gradient(to right, #10b981, #34d399)', borderRadius: '99px', transition: 'width 0.3s ease' }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(2,6,23,0.8)', border: '1px solid #1e293b', padding: '6px 16px', borderRadius: '10px', fontSize: '13px', color: '#10b981', fontWeight: 700, marginLeft: '20px', flexShrink: 0 }}>
                    <span style={{ color: questionTimeLeft <= 5 ? '#ef4444' : '#eab308', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      ⏳ Đếm ngược: <span style={{ fontFamily: 'monospace', fontSize: '15px', fontWeight: 900 }}>{questionTimeLeft}</span>s
                    </span>
                    <div style={{ width: '1px', height: '12px', background: '#334155' }} />
                    <span>Điểm: <span style={{ fontFamily: 'monospace', fontSize: '16px', fontWeight: 900 }}>{mgScore}</span> / 200</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
                  <div
                    draggable={mgFeedback === null}
                    onDragStart={(e) => e.dataTransfer.setData('text/plain', mgQuestions[mgIndex].category)}
                    style={{
                      maxWidth: '560px', width: '100%', padding: '28px 32px', borderRadius: '18px', border: '1px solid', textAlign: 'center', position: 'relative',
                      cursor: mgFeedback === null ? 'grab' : 'default', userSelect: 'none', transition: 'all 0.25s ease', boxSizing: 'border-box',
                      background: mgFeedback === 'correct' ? 'rgba(6,78,59,0.4)' : (mgFeedback === 'incorrect' || mgFeedback === 'timeout') ? 'rgba(69,10,10,0.4)' : 'rgba(2,6,23,0.7)',
                      borderColor: mgFeedback === 'correct' ? '#10b981' : (mgFeedback === 'incorrect' || mgFeedback === 'timeout') ? '#ef4444' : '#334155',
                      boxShadow: mgFeedback === 'correct' ? '0 0 40px rgba(16,185,129,0.2)' : (mgFeedback === 'incorrect' || mgFeedback === 'timeout') ? '0 0 40px rgba(239,68,68,0.2)' : '0 8px 40px rgba(0,0,0,0.4)',
                    }}
                  >
                    <span style={{ position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)', fontSize: '9px', background: '#1e293b', color: '#64748b', border: '1px solid #334155', padding: '2px 10px', borderRadius: '99px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Kéo thẻ này thả vào ô tương ứng bên dưới</span>
                    <p style={{ fontSize: '16px', fontWeight: 800, color: mgFeedback === 'correct' ? '#6ee7b7' : (mgFeedback === 'incorrect' || mgFeedback === 'timeout') ? '#fca5a5' : '#f1f5f9', lineHeight: 1.6, marginTop: '8px' }}>
                      &ldquo;{mgQuestions[mgIndex].text}&rdquo;
                    </p>
                    {mgFeedback === 'correct' && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(16,185,129,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '18px' }}>
                        <span style={{ fontWeight: 900, fontSize: '13px', color: '#10b981', background: 'rgba(2,6,23,0.95)', border: '1px solid #10b981', padding: '8px 20px', borderRadius: '99px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>✨ CHÍNH XÁC +{mgEarnedPoints || 10}đ</span>
                      </div>
                    )}
                    {mgFeedback === 'incorrect' && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(239,68,68,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '18px' }}>
                        <span style={{ fontWeight: 900, fontSize: '13px', color: '#ef4444', background: 'rgba(2,6,23,0.95)', border: '1px solid #ef4444', padding: '8px 20px', borderRadius: '99px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>❌ CHƯA CHÍNH XÁC</span>
                      </div>
                    )}
                    {mgFeedback === 'timeout' && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(239,68,68,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '18px' }}>
                        <span style={{ fontWeight: 900, fontSize: '13px', color: '#ef4444', background: 'rgba(2,6,23,0.95)', border: '1px solid #ef4444', padding: '8px 20px', borderRadius: '99px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>⏰ HẾT GIỜ!</span>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: '10px' }}>
                  <p style={{ textAlign: 'center', fontSize: '10px', color: '#475569', fontStyle: 'italic' }}>(Mẹo: Kéo thả hoặc click trực tiếp vào ô bên dưới)</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
                    {MG_CATEGORIES.map(cat => {
                      const isOver = mgDragOver === cat.id;
                      return (
                        <div
                          key={cat.id}
                          onDragOver={(e) => { e.preventDefault(); if (mgFeedback === null) setMgDragOver(cat.id); }}
                          onDragLeave={() => setMgDragOver(null)}
                          onDrop={(e) => { e.preventDefault(); setMgDragOver(null); handleMgAnswer(cat.id); }}
                          onClick={() => handleMgAnswer(cat.id)}
                          style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px 8px',
                            borderRadius: '16px', border: `2px solid ${isOver ? '#10b981' : '#1e293b'}`,
                            background: isOver ? '#0f2a23' : 'rgba(2,6,23,0.6)', cursor: 'pointer', userSelect: 'none',
                            transition: 'all 0.15s ease', transform: isOver ? 'scale(1.05)' : 'scale(1)',
                            boxShadow: isOver ? '0 0 20px rgba(16,185,129,0.3)' : 'none', minHeight: '110px',
                          }}
                        >
                          <span style={{ fontSize: '28px', marginBottom: '8px' }}>{cat.icon}</span>
                          <span style={{ fontSize: '9px', fontWeight: 800, color: isOver ? '#6ee7b7' : '#94a3b8', textAlign: 'center', lineHeight: 1.3, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                            {language === 'vi' ? cat.nameVi : cat.nameEn}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* COMPLETE */}
            {mgStep === 'complete' && (() => {
              const allPlayerScores = [
                { nickname: nickname || (language === 'vi' ? 'Bạn' : 'You'), score: mgScore, isMe: true },
                ...otherUsers.map(u => ({ nickname: u.nickname, score: u.score || 0, isMe: false }))
              ].sort((a, b) => b.score - a.score);

              return (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', maxWidth: '640px', margin: '0 auto', textAlign: 'center', width: '100%' }}>
                  <span style={{ fontSize: '56px' }}>🏆</span>
                  <div>
                    <h4 style={{ fontWeight: 900, fontSize: '22px', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>THỬ THÁCH HOÀN THÀNH!</h4>
                    <p style={{ fontWeight: 850, fontSize: '15px', color: '#10b981' }}>
                      Bạn đạt được: <span style={{ fontFamily: 'monospace', fontSize: '20px' }}>{mgScore}</span> / 200 điểm
                    </p>
                  </div>

                  {/* Leaderboard Table Container */}
                  <div style={{ width: '100%', background: 'rgba(15,23,42,0.4)', border: '1px solid #1e293b', borderRadius: '16px', overflow: 'hidden' }}>
                    <div style={{ background: '#0f172a', padding: '12px 20px', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      <span>Hạng / Người chơi</span>
                      <div style={{ display: 'flex', gap: '40px' }}>
                        <span style={{ width: '80px', textAlign: 'right' }}>Điểm số</span>
                      </div>
                    </div>
                    <div style={{ maxHeight: '180px', overflowY: 'auto', padding: '4px 0' }}>
                      {allPlayerScores.map((p, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px',
                            background: p.isMe ? 'rgba(16,185,129,0.1)' : 'transparent',
                            borderBottom: idx < allPlayerScores.length - 1 ? '1px solid rgba(30,41,59,0.5)' : 'none',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', borderRadius: '99px',
                              fontSize: '10px', fontWeight: 900,
                              background: idx === 0 ? '#eab308' : idx === 1 ? '#cbd5e1' : idx === 2 ? '#cd7f32' : 'transparent',
                              color: idx < 3 ? '#020617' : '#475569',
                              border: idx >= 3 ? '1px solid #334155' : 'none'
                            }}>
                              {idx + 1}
                            </span>
                            <span style={{ fontSize: '12px', fontWeight: p.isMe ? 900 : 600, color: p.isMe ? '#10b981' : '#cbd5e1' }}>
                              {p.nickname} {p.isMe && <span style={{ fontSize: '9px', background: '#10b981', color: '#020617', padding: '1px 5px', borderRadius: '4px', marginLeft: '6px', fontWeight: 900 }}>BẠN</span>}
                            </span>
                          </div>
                          <div style={{ display: 'flex', gap: '40px', fontFamily: 'monospace', fontSize: '13px', fontWeight: 800 }}>
                            <span style={{ width: '80px', textAlign: 'right', color: p.isMe ? '#10b981' : '#cbd5e1' }}>
                              {p.score}đ
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <p style={{ fontSize: '11px', color: '#94a3b8', lineHeight: 1.6, margin: 0, fontStyle: 'italic', maxWidth: '500px' }}>
                    &ldquo;Qua chuyến tham quan, chúng ta đã chứng kiến đầy đủ 5 đặc trưng của nền Kinh tế Thị trường định hướng XHCN Việt Nam.&rdquo;
                  </p>

                  <div style={{ display: 'flex', gap: '16px' }}>
                    <button onClick={handleCloseMinigame} style={{ background: '#10b981', color: '#020617', fontWeight: 900, padding: '12px 36px', borderRadius: '12px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.06em', cursor: 'pointer', border: 'none', boxShadow: '0 0 20px rgba(16,185,129,0.3)' }}>🚪 Thoát</button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ═══ SỔ NHIỆM VỤ ĐIỀU TRA PHÒNG BAO CẤP ═══ */}
      <InvestigationNotebook />

      {/* ═══ POPUP HƯỚNG DẪN KHI VÀO PHÒNG BAO CẤP ═══ */}
      <RoomWelcomeModal />

      {/* ═══ MÀN HÌNH TÀI LIỆU HỌP PHÒNG 2 ═══ */}
      <RoomTwoDocumentModal />

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
              currentRoom === 'gallery-paintings' ? (
                language === 'vi' ? 'Ấn F để đứng dậy | Ấn E để mở/đóng tài liệu' : 'Press F to Stand Up | Press E to open/close document'
              ) : (
                language === 'vi' ? 'Ấn F để đứng dậy | Giữ chuột phải hoặc Z/C để Zoom' : 'Press F to Stand Up | Hold Right Click or Z/C to Zoom'
              )
            )}
          </span>
        </div>
      )}

      {/* ═══ HUD HƯỚNG DẪN DỊCH CHUYỂN PHÒNG (E) ═══ */}
      {activeDoorInfo && !transitionLoading && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-40 bg-slate-950/95 border-2 border-amber-500/30 backdrop-blur-md px-6 py-3 rounded-2xl flex items-center gap-3 shadow-2xl animate-bounce">
          <span className="flex h-3.5 w-3.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500"></span>
          </span>
          <span className="text-xs font-black tracking-wider text-slate-100 uppercase font-mono">
            {language === 'vi' ? (
              <>Ấn <span className="bg-amber-500 text-slate-950 px-2 py-0.5 rounded font-black text-xs mx-1">E</span> để {activeDoorInfo.promptVi}</>
            ) : (
              <>Press <span className="bg-amber-500 text-slate-950 px-2 py-0.5 rounded font-black text-xs mx-1">E</span> to {activeDoorInfo.promptEn}</>
            )}
          </span>
        </div>
      )}

      {/* ═══ MÀN HÌNH CHỜ CHUYỂN PHÒNG (Transition Loading Overlay) ═══ */}
      {transitionLoading && (
        <div className="absolute inset-0 z-50 bg-[#07070a] flex flex-col items-center justify-center text-center select-none pointer-events-auto">
          {/* Vòng sáng trang trí nền */}
          <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full bg-amber-500/10 blur-[130px] pointer-events-none" />
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-cyan-500/10 blur-[110px] pointer-events-none" />

          <div className="flex flex-col items-center gap-6 relative z-10">
            {/* Vòng xoay spinner */}
            <div className="w-16 h-16 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin relative">
              <div className="absolute inset-0 rounded-full border border-amber-500/10 animate-ping opacity-30" />
            </div>

            <div className="space-y-3">
              <span className="text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/25 px-3 py-1 rounded-full font-bold uppercase tracking-widest">
                {language === 'vi' ? 'Đang chuyển phòng' : 'Transitioning Room'}
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight mt-2">
                {transitionRoomName}
              </h2>
              <p className="text-slate-400 text-xs font-semibold italic animate-pulse">
                {language === 'vi'
                  ? 'Đang chuẩn bị không gian triển lãm 3D...'
                  : 'Preparing 3D exhibition space...'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ═══ ALBUM BỘ SƯU TẬP PHÒNG GỐM SỨ ═══ */}
      <CeramicsCollection />

      {/* ═══ SỔ TAY NHIỆM VỤ PHÒNG KINH TẾ THỊ TRƯỜNG ═══ */}
      <MarketEconomyQuest />
    </div>
  );
}
