import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useMuseum } from '@/context/MuseumContext';

export const PlayerCharacter: React.FC = () => {
  const { selectedExhibit, socket, activeGallery } = useMuseum();
  const playerRef = useRef<THREE.Group>(null);
  
  // Trạng thái phím điều khiển
  const keysPressed = useRef({
    w: false,
    a: false,
    s: false,
    d: false
  });

  const lastUpdate = useRef(0);
  const isSculptures = activeGallery?.id === 'gallery-sculptures';

  // Thiết lập vị trí ban đầu
  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.position.set(0, 0.9, 12); // Đứng ở gần lối vào (Z = 12)
    }
  }, []);

  // Lắng nghe bàn phím di chuyển
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const code = e.code;
      if (code === 'KeyW' || code === 'ArrowUp') keysPressed.current.w = true;
      if (code === 'KeyS' || code === 'ArrowDown') keysPressed.current.s = true;
      if (code === 'KeyA' || code === 'ArrowLeft') keysPressed.current.a = true;
      if (code === 'KeyD' || code === 'ArrowRight') keysPressed.current.d = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const code = e.code;
      if (code === 'KeyW' || code === 'ArrowUp') keysPressed.current.w = false;
      if (code === 'KeyS' || code === 'ArrowDown') keysPressed.current.s = false;
      if (code === 'KeyA' || code === 'ArrowLeft') keysPressed.current.a = false;
      if (code === 'KeyD' || code === 'ArrowRight') keysPressed.current.d = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Kiểm tra va chạm với các vật thể trong phòng
  const checkCollision = (x: number, z: number): boolean => {
    // 1. Va chạm với bệ tượng (Chỉ cho phòng Điêu khắc)
    if (isSculptures) {
      const pedestals = [
        { x: 0, z: -8.0 },
        { x: 0, z: 8.0 },
        { x: 0, z: 0.0 }
      ];
      const collisionRadius = 1.0; // Bán kính bệ (0.6) + Bán kính người (0.4)
      for (const ped of pedestals) {
        const dx = x - ped.x;
        const dz = z - ped.z;
        if (Math.sqrt(dx * dx + dz * dz) < collisionRadius) return true;
      }
    } else {
      // 2. Va chạm với Vách ngăn trưng bày trung tâm (Chỉ phòng Tranh)
      // Vách ngăn tại z = 0, rộng 6m (x từ -3 đến 3), dày 0.4m (z từ -0.2 đến 0.2)
      const buffer = 0.5; // Khoảng cách an toàn
      if (x > -3.3 && x < 3.3 && z > -0.5 && z < 0.5) {
        return true;
      }

      // 3. Va chạm với ghế ngồi (Benches) tại z = 7 và z = -7
      // Ghế rộng 4m (x từ -2 đến 2), sâu 1.2m (z từ -0.6 đến 0.6)
      if (x > -2.3 && x < 2.3 && z > 6.3 && z < 7.7) return true;
      if (x > -2.3 && x < 2.3 && z > -7.7 && z < -6.3) return true;
    }

    return false;
  };

  useFrame((state, delta) => {
    if (!playerRef.current) return;

    // Khóa di chuyển khi đang ở chế độ xem chi tiết tác phẩm (Inspect Mode)
    if (selectedExhibit) return;

    const { w, a, s, d } = keysPressed.current;
    
    if (w || a || s || d) {
      // Tính toán hướng đi dựa theo góc nhìn camera
      const frontVec = new THREE.Vector3();
      state.camera.getWorldDirection(frontVec);
      frontVec.y = 0;
      frontVec.normalize();

      const rightVec = new THREE.Vector3(-frontVec.z, 0, frontVec.x).normalize();
      const moveDirection = new THREE.Vector3(0, 0, 0);

      if (w) moveDirection.add(frontVec);
      if (s) moveDirection.sub(frontVec);
      if (d) moveDirection.add(rightVec);
      if (a) moveDirection.sub(rightVec);

      moveDirection.normalize();

      const moveSpeed = 4.0; // Tăng tốc độ đi một chút cho phòng rộng
      const stepX = moveDirection.x * moveSpeed * delta;
      const stepZ = moveDirection.z * moveSpeed * delta;

      const currentPos = playerRef.current.position;
      let nextX = currentPos.x + stepX;
      let nextZ = currentPos.z + stepZ;

      // Giới hạn phòng trưng bày dài mới (Rộng 12m => X từ -6 đến 6; Dài 30m => Z từ -15 đến 15)
      const limitX = 5.4;
      const limitZ = 14.4;

      nextX = Math.max(-limitX, Math.min(limitX, nextX));
      nextZ = Math.max(-limitZ, Math.min(limitZ, nextZ));

      // Thực hiện di chuyển nếu không có va chạm
      if (!checkCollision(nextX, currentPos.z)) {
        currentPos.x = nextX;
      }
      if (!checkCollision(currentPos.x, nextZ)) {
        currentPos.z = nextZ;
      }

      // Xoay nhân vật mượt mà
      const targetRotation = Math.atan2(moveDirection.x, moveDirection.z);
      const rotationSpeed = 12;
      let diff = targetRotation - playerRef.current.rotation.y;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      playerRef.current.rotation.y += diff * rotationSpeed * delta;
    }

    // Hiệu ứng lơ lửng nhịp nhàng
    playerRef.current.position.y = 0.9 + Math.sin(state.clock.getElapsedTime() * 2) * 0.05;

    // GỬI TỌA ĐỘ TRỰC TIẾP QUA SOCKET (20Hz - BỎ QUA REACT STATE)
    const now = state.clock.getElapsedTime() * 1000;
    if (now - lastUpdate.current > 50) {
      if (socket && socket.connected) {
        socket.emit('move', {
          x: playerRef.current.position.x,
          y: playerRef.current.position.y,
          z: playerRef.current.position.z,
          yaw: playerRef.current.rotation.y,
        });
      }
      lastUpdate.current = now;
    }
  });

  return (
    <group ref={playerRef} name="player-character">
      {/* Đầu robot phát sáng */}
      <mesh position={[0, 0.7, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial 
          color="#f97316"
          emissive="#ea580c"
          emissiveIntensity={0.6}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>

      {/* Kính bảo hộ */}
      <mesh position={[0, 0.72, 0.16]}>
        <boxGeometry args={[0.22, 0.08, 0.1]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Thân robot */}
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.1, 0.2, 0.7, 16]} />
        <meshStandardMaterial 
          color="#1e293b" 
          roughness={0.3} 
          metalness={0.85} 
        />
      </mesh>

      {/* Vòng đệm sáng */}
      <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.18, 0.22, 16]} />
        <meshBasicMaterial color="#f97316" />
      </mesh>
    </group>
  );
};
export default PlayerCharacter;
