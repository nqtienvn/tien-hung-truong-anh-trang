import React, { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useMuseum } from "@/context/MuseumContext";

export const PlayerCharacter: React.FC = () => {
  const { selectedExhibit, socket, activeGallery, nickname } = useMuseum();
  const playerRef = useRef<THREE.Group>(null);

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

  // Thiết lập vị trí ban đầu
  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.position.set(0, 0.9, 12);
    }
  }, []);

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

  // Kiểm tra va chạm với các vật thể trong phòng
  const checkCollision = (x: number, z: number): boolean => {
    if (isSculptures) {
      const pedestals = [
        { x: 0, z: -8.0 },
        { x: 0, z: 8.0 },
        { x: 0, z: 0.0 },
      ];
      const collisionRadius = 1.0;
      for (const ped of pedestals) {
        const dx = x - ped.x;
        const dz = z - ped.z;
        if (Math.sqrt(dx * dx + dz * dz) < collisionRadius) return true;
      }
    } else {
      const buffer = 0.5;
      if (x > -3.3 && x < 3.3 && z > -0.5 && z < 0.5) {
        return true;
      }

      if (x > -2.3 && x < 2.3 && z > 6.3 && z < 7.7) return true;
      if (x > -2.3 && x < 2.3 && z > -7.7 && z < -6.3) return true;
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

      const limitX = 5.4;
      const limitZ = 14.4;

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

    // Hiệu ứng lơ lửng nhịp nhàng (idle bobbing)
    playerRef.current.position.y =
      0.9 + Math.sin(state.clock.getElapsedTime() * 2.5) * 0.025;

    // Hiệu ứng vung tay vung chân khi di chuyển
    const isMoving = w || a || s || d;
    const t = state.clock.getElapsedTime();
    const swingSpeed = 10;
    const swingAmp = 0.45;

    if (isMoving) {
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
          y: playerRef.current.position.y,
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
      {/* ĐẦU - To, tròn, chiếm tỉ lệ lớn (giống ảnh) */}
      <mesh position={[0, 0.72, 0]} castShadow>
        <sphereGeometry args={[0.22, 28, 28]} />
        <meshStandardMaterial {...skinProps} />
      </mesh>

      {/* THÂN - Oval mập, không có cổ rõ, liền trực tiếp với đầu */}
      {/* Phần trên thân - vai rộng, tròn */}
      <mesh position={[0, 0.3, 0]} castShadow>
        {/* Capsule mập và ngắn để tạo cảm giác béo đáng yêu */}
        <capsuleGeometry args={[0.175, 0.28, 10, 20]} />
        <meshStandardMaterial {...skinProps} />
      </mesh>

      {/* CÁNH TAY TRÁI - Ngắn, mập, hơi chìa ra */}
      <group ref={leftArmRef} position={[-0.225, 0.38, 0]}>
        {/* Vai tròn */}
        <mesh position={[0, 0, 0]} castShadow>
          <sphereGeometry args={[0.075, 16, 16]} />
          <meshStandardMaterial {...skinProps} />
        </mesh>
        {/* Cánh tay: ngắn, mập */}
        <mesh position={[-0.04, -0.16, 0]} castShadow>
          <capsuleGeometry args={[0.065, 0.18, 6, 12]} />
          <meshStandardMaterial {...skinProps} />
        </mesh>
        {/* Bàn tay tròn mập */}
        <mesh position={[-0.06, -0.3, 0]} castShadow>
          <sphereGeometry args={[0.07, 14, 14]} />
          <meshStandardMaterial {...skinProps} />
        </mesh>
      </group>

      {/* CÁNH TAY PHẢI - Ngắn, mập, hơi chìa ra */}
      <group ref={rightArmRef} position={[0.225, 0.38, 0]}>
        {/* Vai tròn */}
        <mesh position={[0, 0, 0]} castShadow>
          <sphereGeometry args={[0.075, 16, 16]} />
          <meshStandardMaterial {...skinProps} />
        </mesh>
        {/* Cánh tay: ngắn, mập */}
        <mesh position={[0.04, -0.16, 0]} castShadow>
          <capsuleGeometry args={[0.065, 0.18, 6, 12]} />
          <meshStandardMaterial {...skinProps} />
        </mesh>
        {/* Bàn tay tròn mập */}
        <mesh position={[0.06, -0.3, 0]} castShadow>
          <sphereGeometry args={[0.07, 14, 14]} />
          <meshStandardMaterial {...skinProps} />
        </mesh>
      </group>

      {/* CHÂN TRÁI - Ngắn, mập, nằm sát nhau */}
      <group ref={leftLegRef} position={[-0.085, -0.08, 0]}>
        {/* Đùi tròn nối thân */}
        <mesh position={[0, 0, 0]} castShadow>
          <sphereGeometry args={[0.075, 16, 16]} />
          <meshStandardMaterial {...skinProps} />
        </mesh>
        {/* Ống chân ngắn mập */}
        <mesh position={[0, -0.2, 0]} castShadow>
          <capsuleGeometry args={[0.068, 0.16, 6, 12]} />
          <meshStandardMaterial {...skinProps} />
        </mesh>
        {/* Bàn chân tròn */}
        <mesh position={[0, -0.34, 0.025]} castShadow>
          <sphereGeometry args={[0.075, 14, 14]} />
          <meshStandardMaterial {...skinProps} />
        </mesh>
      </group>

      {/* CHÂN PHẢI - Ngắn, mập, nằm sát nhau */}
      <group ref={rightLegRef} position={[0.085, -0.08, 0]}>
        {/* Đùi tròn nối thân */}
        <mesh position={[0, 0, 0]} castShadow>
          <sphereGeometry args={[0.075, 16, 16]} />
          <meshStandardMaterial {...skinProps} />
        </mesh>
        {/* Ống chân ngắn mập */}
        <mesh position={[0, -0.2, 0]} castShadow>
          <capsuleGeometry args={[0.068, 0.16, 6, 12]} />
          <meshStandardMaterial {...skinProps} />
        </mesh>
        {/* Bàn chân tròn */}
        <mesh position={[0, -0.34, 0.025]} castShadow>
          <sphereGeometry args={[0.075, 14, 14]} />
          <meshStandardMaterial {...skinProps} />
        </mesh>
      </group>
    </group>
  );
};

export default PlayerCharacter;
