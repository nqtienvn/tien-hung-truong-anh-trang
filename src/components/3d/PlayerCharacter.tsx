import React, { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useMuseum } from "@/context/MuseumContext";
import {
  isPointInsideRoomFourCollider,
  ROOM_FOUR_PLAYER_COLLISION_MARGIN,
  ROOM_FOUR_SPATIAL,
  ROOM_FOUR_WALL_INSET,
} from "@/lib/roomFourLayout";

// ─── Kích thước dùng chung ───────────────────────────────────────────────────
const HEAD_R = 0.22;
const TORSO_R = 0.175;
const TORSO_H = 0.3;

const ARM_R = 0.068;
const ARM_LEN = 0.22;

const LEG_R = 0.075;
const LEG_LEN = 0.22;

const TORSO_TOP = 0.28 + TORSO_R + TORSO_H / 2;
const ARM_PIVOT_X = TORSO_R + ARM_R * 0.95; // Đẩy tay dịch ra ngoài để không dính vào thân
const ARM_PIVOT_Y = TORSO_TOP - 0.1;
const ARM_MESH_Y = -(ARM_R + ARM_LEN / 2);

const LEG_PIVOT_Y = 0.28 - TORSO_H / 2 - TORSO_R + LEG_R * 1.6; // Đẩy chân lên cao để ăn khớp mượt mà với thân
const LEG_PIVOT_X = 0.082;
const LEG_MESH_Y = -(LEG_R + LEG_LEN / 2);

const MU_RED = "#da291c";
const MU_BLACK = "#101114";
const MU_GOLD = "#f5c542";
const MU_BADGE_RED = "#b51922";

// Flat front-panel details keep the kit recognizable without an image texture.
const MU_CHEST_CHEVRON = new THREE.Shape();
MU_CHEST_CHEVRON.moveTo(-0.165, 0.09);
MU_CHEST_CHEVRON.lineTo(0, -0.105);
MU_CHEST_CHEVRON.lineTo(0.165, 0.09);
MU_CHEST_CHEVRON.lineTo(0.165, 0.035);
MU_CHEST_CHEVRON.lineTo(0, -0.16);
MU_CHEST_CHEVRON.lineTo(-0.165, 0.035);
MU_CHEST_CHEVRON.closePath();
// ─────────────────────────────────────────────────────────────────────────────

export const PlayerCharacter: React.FC = () => {
  const {
    selectedExhibit,
    socket,
    activeGallery,
    nickname,
    settings,
    miniGameOpen,
    roomFourInteractionOpen,
    roomOneLocked,
    roomOneCompleted
  } = useMuseum();
  const playerRef = useRef<THREE.Group>(null);

  const isPawn = settings.preset === "low";
  const baseY = isPawn ? 0.24 : 0.472; // Phóng to 1.6x (0.15 * 1.6 và 0.295 * 1.6)

  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);

  // Trạng thái phím điều khiển
  const keysPressed = useRef({
    w: false,
    a: false,
    s: false,
    d: false,
    shift: false,
  });

  const lastUpdate = useRef(0);
  const lastSent = useRef({ x: Number.NaN, y: Number.NaN, z: Number.NaN, yaw: Number.NaN });
  // Cache vectors for useFrame to prevent GC pauses
  const frontVec = useRef(new THREE.Vector3()).current;
  const rightVec = useRef(new THREE.Vector3()).current;
  const moveDirection = useRef(new THREE.Vector3()).current;

  // Thiết lập vị trí ban đầu (Spawn Point linh hoạt dựa trên phòng người chơi bấm vào)
  useEffect(() => {
    if (playerRef.current) {
      let spawnZ = 12;
      if (activeGallery?.id === "gallery-ceramics") {
        spawnZ = -10;
      } else if (activeGallery?.id === "gallery-market-economy") {
        spawnZ = ROOM_FOUR_SPATIAL.spawnLocalZ;
      }
      playerRef.current.position.set(0, baseY, spawnZ);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeGallery?.id]);

  // Lắng nghe bàn phím di chuyển
  useEffect(() => {
    const movementKeyMap: Record<string, "w" | "a" | "s" | "d" | "shift"> = {
      KeyW: "w",
      KeyA: "a",
      KeyS: "s",
      KeyD: "d",
      ArrowUp: "w",
      ArrowLeft: "a",
      ArrowDown: "s",
      ArrowRight: "d",
      ShiftLeft: "shift",
      ShiftRight: "shift",
    };

    const shouldIgnoreKeyboard = (target: EventTarget | null) => {
      const el = target as HTMLElement | null;
      if (!el) return false;
      const tagName = el.tagName.toLowerCase();
      return (
        tagName === "input" || tagName === "textarea" || el.isContentEditable
      );
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (shouldIgnoreKeyboard(e.target)) return;
      const key = movementKeyMap[e.code];
      if (!key) return;
      e.preventDefault();
      keysPressed.current[key] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = movementKeyMap[e.code];
      if (!key) return;
      e.preventDefault();
      keysPressed.current[key] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Kiểm tra va chạm với các vật thể trong phòng — chỉ áp dụng đúng theo galleryId
  const checkCollision = (x: number, z: number): boolean => {
    const galleryId = activeGallery?.id;

    // ── Phòng 1: gallery-paintings ──────────────────────────────────────────
    if (galleryId === "gallery-paintings") {
      // 1. Tường ngăn tại Z = 3.0: Cổng mở X từ -5.0 đến -2.0
      if (z > 2.7 && z < 3.3) {
        if (x < -5.0 || x > -2.0) return true;
      }

      // 2. Vách ngăn phụ tại Z = 13.0
      if (x > -6.3 && x < 6.3 && z > 12.6 && z < 13.4) return true;

      // 3. Ghế băng tại Z = 8.0 và Z = 18.0
      if (x > -2.3 && x < 2.3 && z > 7.3 && z < 8.7) return true;
      if (x > -2.3 && x < 2.3 && z > 17.3 && z < 18.7) return true;
    }

    // ── Phòng 3: gallery-ceramics ──────────────────────────────────────────
    if (galleryId === "gallery-ceramics") {
      // 1. Va chạm với máy chơi game tại X = 8.0, Z = 13.6 (local)
      if (x > 6.6 && x < 9.4 && z > 12.4 && z < 14.5) {
        return true;
      }

      // 2. Va chạm với hàng rào bên trái (X = -13.2)
      if (x < -12.4) {
        if ((z > -10.8 && z < -5.2) || (z > -2.8 && z < 2.8) || (z > 5.2 && z < 10.8)) {
          return true;
        }
      }

      // 3. Va chạm với hàng rào bên phải (X = 13.2)
      if (x > 12.4) {
        if ((z > -10.8 && z < -5.2) || (z > -2.8 && z < 2.8) || (z > 5.2 && z < 10.8)) {
          return true;
        }
      }

      // 4. Va chạm với hàng rào cửa vào trước (Z = -13.2)
      if (z < -12.4) {
        if ((x > -10.8 && x < -5.2) || (x > 5.2 && x < 10.8)) {
          return true;
        }
      }

      // 5. Va chạm với hàng rào phía sau bên trái (Z = 13.2)
      if (z > 12.4) {
        if (x > -10.8 && x < -5.2) {
          return true;
        }
      }

      return false;
    }

    // ── Phòng 4: gallery-market-economy ──────────────────────────────────────
    if (galleryId === "gallery-market-economy") {
      return isPointInsideRoomFourCollider(x, z, ROOM_FOUR_PLAYER_COLLISION_MARGIN);
    }

    return false;
  };

  useFrame((state, delta) => {
    if (!playerRef.current) return;

    if (selectedExhibit || !nickname || miniGameOpen || roomFourInteractionOpen || roomOneLocked) return;

    const { w, a, s, d, shift } = keysPressed.current;

    if (w || a || s || d) {
      state.camera.getWorldDirection(frontVec);
      frontVec.y = 0;
      frontVec.normalize();

      rightVec.set(-frontVec.z, 0, frontVec.x).normalize();
      moveDirection.set(0, 0, 0);

      if (w) moveDirection.add(frontVec);
      if (s) moveDirection.sub(frontVec);
      if (d) moveDirection.add(rightVec);
      if (a) moveDirection.sub(rightVec);

      moveDirection.normalize();

      const moveSpeed = shift ? 10.0 : 6.0; // Đi bộ (6.0), chạy nhanh khi nhấn shift (10.0)
      const stepX = moveDirection.x * moveSpeed * delta;
      const stepZ = moveDirection.z * moveSpeed * delta;

      const currentPos = playerRef.current.position;
      let nextX = currentPos.x + stepX;
      let nextZ = currentPos.z + stepZ;

      const isRoomFour = activeGallery?.id === "gallery-market-economy";
      const roomFourBoundaryMargin = ROOM_FOUR_WALL_INSET + ROOM_FOUR_PLAYER_COLLISION_MARGIN;
      const limitX = isRoomFour
        ? ROOM_FOUR_SPATIAL.roomWidth / 2 - roomFourBoundaryMargin
        : (activeGallery?.room_width ?? 12) / 2 - 0.6;
      const roomLength = activeGallery?.room_length ?? 30;
      const minZ = isRoomFour
        ? ROOM_FOUR_SPATIAL.localStartZ + roomFourBoundaryMargin
        : -roomLength / 2 + 0.6;
      const maxZ = isRoomFour
        ? ROOM_FOUR_SPATIAL.localEndZ - roomFourBoundaryMargin
        : roomLength / 2 - 0.6;

      nextX = Math.max(-limitX, Math.min(limitX, nextX));
      nextZ = Math.max(minZ, Math.min(maxZ, nextZ));

      if (!checkCollision(nextX, currentPos.z)) {
        currentPos.x = nextX;
      }
      if (!checkCollision(currentPos.x, nextZ)) {
        currentPos.z = nextZ;
      }

      const targetRotation = Math.atan2(moveDirection.x, moveDirection.z);
      const rotationSpeed = 12;
      let diff = targetRotation - playerRef.current.rotation.y;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      playerRef.current.rotation.y += diff * rotationSpeed * delta;
    }

    const isMoving = w || a || s || d;
    const t = state.clock.getElapsedTime();

    // Chỉ nhún nhảy nhẹ khi di chuyển, đứng yên thì đứng thẳng trên mặt đất (tránh say sóng camera)
    if (isMoving && settings.animations) {
      playerRef.current.position.y = baseY + Math.sin(t * 10) * 0.032; // Phóng to 1.6x nhún nhảy
    } else {
      playerRef.current.position.y = baseY;
    }
    const swingSpeed = shift ? 16 : 11; // Chạy nhanh thì tay chân vung nhanh hơn
    const swingAmp = 0.45;

    if (isMoving && settings.animations) {
      if (leftLegRef.current)
        leftLegRef.current.rotation.x = Math.sin(t * swingSpeed) * swingAmp;
      if (rightLegRef.current)
        rightLegRef.current.rotation.x = -Math.sin(t * swingSpeed) * swingAmp;

      if (leftArmRef.current) {
        leftArmRef.current.rotation.x =
          -Math.sin(t * swingSpeed) * (swingAmp * 0.75);
        leftArmRef.current.rotation.z = 0.2;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x =
          Math.sin(t * swingSpeed) * (swingAmp * 0.75);
        rightArmRef.current.rotation.z = -0.2;
      }
    } else {
      if (leftLegRef.current)
        leftLegRef.current.rotation.x +=
          (0 - leftLegRef.current.rotation.x) * 0.15;
      if (rightLegRef.current)
        rightLegRef.current.rotation.x +=
          (0 - rightLegRef.current.rotation.x) * 0.15;

      if (leftArmRef.current) {
        leftArmRef.current.rotation.x +=
          (0 - leftArmRef.current.rotation.x) * 0.15;
        leftArmRef.current.rotation.z +=
          (0.2 - leftArmRef.current.rotation.z) * 0.15;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x +=
          (0 - rightArmRef.current.rotation.x) * 0.15;
        rightArmRef.current.rotation.z +=
          (-0.2 - rightArmRef.current.rotation.z) * 0.15;
      }
    }

    // Gửi tọa độ qua socket (12.5Hz — tối ưu mượt mà và nhẹ tải cho 65 người)
    const now = state.clock.getElapsedTime() * 1000;
    if (now - lastUpdate.current > 80) {
      const sent = lastSent.current;
      const movedEnough =
        Math.abs(playerRef.current.position.x - sent.x) > 0.01 ||
        Math.abs(playerRef.current.position.y - sent.y) > 0.01 ||
        Math.abs(playerRef.current.position.z - sent.z) > 0.01 ||
        Math.abs(playerRef.current.rotation.y - sent.yaw) > 0.01;

      if (movedEnough && socket && socket.connected) {
        socket.emit("move", {
          x: playerRef.current.position.x,
          y: playerRef.current.position.y - baseY, // Gửi tọa độ Y logic (bàn chân chạm đất)
          z: playerRef.current.position.z,
          yaw: playerRef.current.rotation.y,
        });
        sent.x = playerRef.current.position.x;
        sent.y = playerRef.current.position.y;
        sent.z = playerRef.current.position.z;
        sent.yaw = playerRef.current.rotation.y;
      }
      lastUpdate.current = now;
    }
  });

  // Màu kem trắng giống trong ảnh
  const skinColor = "#e8e0d5";
  const skinProps = {
    color: skinColor,
    roughness: 0.6,
    metalness: 0.0,
  };

  return (
    <group ref={playerRef} name="player-character">
      {isPawn ? (
        <group scale={1.6}>
          {/* MÔ HÌNH CON CỜ (CHESS PAWN) - Cấu hình Thấp để tối ưu tối đa */}
          {/* Đầu con cờ */}
          <mesh position={[0, 0.7, 0]}>
            <sphereGeometry args={[0.18, 20, 20]} />
            <meshStandardMaterial {...skinProps} />
          </mesh>
          {/* Cổ con cờ */}
          <mesh position={[0, 0.48, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.06, 16]} />
            <meshStandardMaterial {...skinProps} />
          </mesh>
          {/* Thân con cờ */}
          <mesh position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.07, 0.18, 0.5, 16]} />
            <meshStandardMaterial color={MU_RED} roughness={0.55} metalness={0} />
          </mesh>
          {/* Cổ áo đen cho bản đồ họa nhẹ */}
          <mesh position={[0, 0.47, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.11, 0.022, 8, 16]} />
            <meshStandardMaterial color={MU_BLACK} roughness={0.5} metalness={0} />
          </mesh>
          {/* Đế con cờ */}
          <mesh position={[0, -0.1, 0]}>
            <cylinderGeometry args={[0.22, 0.22, 0.1, 16]} />
            <meshStandardMaterial {...skinProps} />
          </mesh>
        </group>
      ) : (
        <group scale={1.6}>
          {/* MÔ HÌNH CON NGƯỜI (HUMANOID MANNEQUIN) - Cấu hình Trung bình / Cao */}
          {/* ĐẦU - To, tròn */}
          <mesh position={[0, 0.7, 0]}>
            <sphereGeometry args={[HEAD_R, 28, 28]} />
            <meshStandardMaterial {...skinProps} />
          </mesh>

          {/* THÂN - Capsule mập */}
          <mesh position={[0, 0.28, 0]}>
            <capsuleGeometry args={[TORSO_R, TORSO_H, 10, 20]} />
            <meshStandardMaterial color={MU_RED} roughness={0.55} metalness={0} />
          </mesh>

          {/* Áo Manchester United: cổ đen, chữ V đen và huy hiệu nhỏ ở ngực */}
          <mesh position={[0, 0.49, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.115, 0.022, 8, 16]} />
            <meshStandardMaterial color={MU_BLACK} roughness={0.5} metalness={0} />
          </mesh>
          <mesh position={[0, 0.405, TORSO_R + 0.006]}>
            <shapeGeometry args={[MU_CHEST_CHEVRON]} />
            <meshStandardMaterial color={MU_BLACK} roughness={0.5} metalness={0} />
          </mesh>
          <mesh position={[0.092, 0.405, TORSO_R + 0.01]}>
            <circleGeometry args={[0.035, 16]} />
            <meshStandardMaterial color={MU_GOLD} roughness={0.45} metalness={0.05} />
          </mesh>
          <mesh position={[0.092, 0.405, TORSO_R + 0.014]}>
            <circleGeometry args={[0.023, 16]} />
            <meshStandardMaterial color={MU_BADGE_RED} roughness={0.5} metalness={0} />
          </mesh>

          {/* CÁNH TAY TRÁI - Không để tối ưu năng lực render của GPU */}
          <group ref={leftArmRef} position={[-ARM_PIVOT_X, ARM_PIVOT_Y, 0]}>
            <mesh position={[0, ARM_MESH_Y, 0]}>
              <capsuleGeometry args={[ARM_R, ARM_LEN, 8, 16]} />
              <meshStandardMaterial color={MU_RED} roughness={0.55} metalness={0} />
            </mesh>
          </group>

          {/* CÁNH TAY PHẢI - Không để tối ưu */}
          <group ref={rightArmRef} position={[ARM_PIVOT_X, ARM_PIVOT_Y, 0]}>
            <mesh position={[0, ARM_MESH_Y, 0]}>
              <capsuleGeometry args={[ARM_R, ARM_LEN, 8, 16]} />
              <meshStandardMaterial color={MU_RED} roughness={0.55} metalness={0} />
            </mesh>
          </group>

          {/* CHÂN TRÁI - Không để tối ưu */}
          <group ref={leftLegRef} position={[-LEG_PIVOT_X, LEG_PIVOT_Y, 0]}>
            <mesh position={[0, LEG_MESH_Y, 0]}>
              <capsuleGeometry args={[LEG_R, LEG_LEN, 8, 16]} />
              <meshStandardMaterial {...skinProps} />
            </mesh>
          </group>

          {/* CHÂN PHẢI - Không để tối ưu */}
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

export default PlayerCharacter;
