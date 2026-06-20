import React, { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useMuseum } from "@/context/MuseumContext";

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
// ─────────────────────────────────────────────────────────────────────────────

export const PlayerCharacter: React.FC = () => {
  const { selectedExhibit, socket, activeGallery, nickname, settings } = useMuseum();
  const playerRef = useRef<THREE.Group>(null);

  const isPawn = settings.preset === 'low';
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
  });

  const lastUpdate = useRef(0);
  const isSculptures = activeGallery?.id === "gallery-sculptures";

  // Thiết lập vị trí ban đầu (Spawn Point linh hoạt dựa trên phòng người chơi bấm vào)
  useEffect(() => {
    if (playerRef.current) {
      const spawnZ = activeGallery?.id === "gallery-sculptures" ? -12 : 12;
      playerRef.current.position.set(0, baseY, spawnZ);
    }
  }, [baseY, activeGallery?.id]);

  // Lắng nghe bàn phím di chuyển
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const code = e.code;
      if (code === "KeyW" || code === "ArrowUp") keysPressed.current.w = true;
      if (code === "KeyS" || code === "ArrowDown") keysPressed.current.s = true;
      if (code === "KeyA" || code === "ArrowLeft") keysPressed.current.a = true;
      if (code === "KeyD" || code === "ArrowRight")
        keysPressed.current.d = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const code = e.code;
      if (code === "KeyW" || code === "ArrowUp") keysPressed.current.w = false;
      if (code === "KeyS" || code === "ArrowDown")
        keysPressed.current.s = false;
      if (code === "KeyA" || code === "ArrowLeft")
        keysPressed.current.a = false;
      if (code === "KeyD" || code === "ArrowRight")
        keysPressed.current.d = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Kiểm tra va chạm với các vật thể trong phòng (Hành lang rẽ chữ S)
  const checkCollision = (x: number, z: number): boolean => {
    // 1. Tường ngăn tại Z = 3.0 (phía Paintings): Cổng mở ở bên trái X từ -5.0 đến -2.0
    // Chặn di chuyển nếu Z nằm trong khoảng [2.7, 3.3] và X nằm ngoài khoảng cổng mở
    if (z > 2.7 && z < 3.3) {
      if (x < -5.0 || x > -2.0) {
        return true;
      }
    }

    // 2. Tường ngăn tại Z = -3.0 (phía Sculptures): Cổng mở ở bên phải X từ 2.0 đến 5.0
    // Chặn di chuyển nếu Z nằm trong khoảng [-3.3, -2.7] và X nằm ngoài khoảng cổng mở
    if (z > -3.3 && z < -2.7) {
      if (x < 2.0 || x > 5.0) {
        return true;
      }
    }

    // 3. Vách ngăn phụ phòng tranh tại Z = 13.0 (rộng 12m, X từ -6.0 đến 6.0)
    // Chặn di chuyển nếu X từ -6.3 đến 6.3 và Z từ 12.6 đến 13.4
    if (x > -6.3 && x < 6.3 && z > 12.6 && z < 13.4) {
      return true;
    }

    // 4. Ghế băng trong phòng tranh tại Z = 8.0 và Z = 18.0
    // Với buffer va chạm: X từ -2.3 đến 2.3, Z từ 7.3 đến 8.7 và từ 17.3 đến 18.7
    if (x > -2.3 && x < 2.3 && z > 7.3 && z < 8.7) {
      return true;
    }
    if (x > -2.3 && x < 2.3 && z > 17.3 && z < 18.7) {
      return true;
    }

    // 5. Bệ đỡ tượng trong phòng tượng tại Z = -8.0, -14.0, -20.0
    // Kích thước bệ là 1.0m x 1.0m. Bán kính va chạm là 1.0m
    const pedestalsZ = [-8.0, -14.0, -20.0];
    const collisionRadius = 1.0;
    for (const pZ of pedestalsZ) {
      const dx = x - 0;
      const dz = z - pZ;
      if (Math.sqrt(dx * dx + dz * dz) < collisionRadius) {
        return true;
      }
    }

    return false;
  };

  useFrame((state, delta) => {
    if (!playerRef.current) return;

    if (selectedExhibit || !nickname) return;

    const { w, a, s, d } = keysPressed.current;

    if (w || a || s || d) {
      const frontVec = new THREE.Vector3();
      state.camera.getWorldDirection(frontVec);
      frontVec.y = 0;
      frontVec.normalize();

      const rightVec = new THREE.Vector3(
        -frontVec.z,
        0,
        frontVec.x,
      ).normalize();
      const moveDirection = new THREE.Vector3(0, 0, 0);

      if (w) moveDirection.add(frontVec);
      if (s) moveDirection.sub(frontVec);
      if (d) moveDirection.add(rightVec);
      if (a) moveDirection.sub(rightVec);

      moveDirection.normalize();

      const moveSpeed = 4.0;
      const stepX = moveDirection.x * moveSpeed * delta;
      const stepZ = moveDirection.z * moveSpeed * delta;

      const currentPos = playerRef.current.position;
      let nextX = currentPos.x + stepX;
      let nextZ = currentPos.z + stepZ;

      const limitX = (activeGallery?.room_width ?? 12) / 2 - 0.6;
      const limitZ = (activeGallery?.room_length ?? 30) / 2 - 0.6;

      nextX = Math.max(-limitX, Math.min(limitX, nextX));
      nextZ = Math.max(-limitZ, Math.min(limitZ, nextZ));

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
      playerRef.current.position.y =
        baseY + Math.sin(t * 10) * 0.032; // Phóng to 1.6x nhún nhảy
    } else {
      playerRef.current.position.y = baseY;
    }
    const swingSpeed = 10;
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
            <meshStandardMaterial {...skinProps} />
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
            <meshStandardMaterial {...skinProps} />
          </mesh>

          {/* CÁNH TAY TRÁI - Không để tối ưu năng lực render của GPU */}
          <group ref={leftArmRef} position={[-ARM_PIVOT_X, ARM_PIVOT_Y, 0]}>
            <mesh position={[0, ARM_MESH_Y, 0]}>
              <capsuleGeometry args={[ARM_R, ARM_LEN, 8, 16]} />
              <meshStandardMaterial {...skinProps} />
            </mesh>
          </group>

          {/* CÁNH TAY PHẢI - Không để tối ưu */}
          <group ref={rightArmRef} position={[ARM_PIVOT_X, ARM_PIVOT_Y, 0]}>
            <mesh position={[0, ARM_MESH_Y, 0]}>
              <capsuleGeometry args={[ARM_R, ARM_LEN, 8, 16]} />
              <meshStandardMaterial {...skinProps} />
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
