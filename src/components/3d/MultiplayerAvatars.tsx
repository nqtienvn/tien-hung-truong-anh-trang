import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useMuseum, MultiplayerUser } from '@/context/MuseumContext';

interface MultiplayerAvatarItemProps {
  user: MultiplayerUser;
}

const MultiplayerAvatarItem: React.FC<MultiplayerAvatarItemProps> = ({ user }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  // Lưu trữ vị trí mục tiêu nhận được từ Socket (20Hz)
  const targetPos = useRef(new THREE.Vector3(user.x, user.y - 0.9, user.z));
  const targetYaw = useRef(user.yaw);

  // Cập nhật vị trí mục tiêu khi có dữ liệu mới từ Socket
  useEffect(() => {
    targetPos.current.set(user.x, user.y - 0.9, user.z);
    targetYaw.current = user.yaw;
  }, [user.x, user.y, user.z, user.yaw]);

  // Khởi tạo vị trí ban đầu khi người chơi khác vừa kết nối vào phòng
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.set(user.x, user.y - 0.9, user.z);
      groupRef.current.rotation.set(0, user.yaw, 0);
    }
  }, []);

  // Thực hiện nội suy tuyến tính (lerp) ở tần số 60 FPS để di chuyển mượt mà
  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Nội suy vị trí (độc lập với tốc độ khung hình)
    const lerpFactor = Math.min(1, 12 * delta);
    groupRef.current.position.lerp(targetPos.current, lerpFactor);

    // Nội suy góc xoay (quay đầu) tránh giật mình
    let diff = targetYaw.current - groupRef.current.rotation.y;
    diff = Math.atan2(Math.sin(diff), Math.cos(diff)); // Chuẩn hóa hướng xoay tối ưu
    groupRef.current.rotation.y += diff * lerpFactor;
  });

  return (
    <group ref={groupRef}>
      {/* 1. Đầu robot phát sáng */}
      <mesh position={[0, 0.7, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial 
          color="#22d3ee" // Màu xanh ngọc lục bảo phát sáng
          emissive="#0891b2"
          emissiveIntensity={0.5}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>

      {/* 2. Kính bảo hộ/Mắt phát sáng */}
      <mesh position={[0, 0.72, 0.16]}>
        <boxGeometry args={[0.22, 0.08, 0.1]} />
        <meshBasicMaterial color="#fff" />
      </mesh>

      {/* 3. Thân robot (Hình nón cụt tối giản) */}
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.1, 0.2, 0.7, 16]} />
        <meshStandardMaterial 
          color="#334155" 
          roughness={0.5} 
          metalness={0.8} 
        />
      </mesh>

      {/* 4. Đĩa đệm phát sáng ở chân (Hiệu ứng hover bay) */}
      <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.18, 0.22, 16]} />
        <meshBasicMaterial color="#22d3ee" />
      </mesh>

      {/* 5. Nhãn tên người chơi lơ lửng phía trên đầu */}
      <Html 
        position={[0, 1.1, 0]} 
        center 
        distanceFactor={8}
        className="pointer-events-none select-none text-center"
      >
        <div className="bg-cyan-500/90 text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded shadow-lg whitespace-nowrap animate-pulse border border-cyan-300">
          {user.nickname}
        </div>
      </Html>
    </group>
  );
};

export const MultiplayerAvatars: React.FC = () => {
  const { otherUsers } = useMuseum();

  return (
    <group>
      {otherUsers
        .filter((user) => user.nickname !== '')
        .map((user) => (
          <MultiplayerAvatarItem key={user.id} user={user} />
        ))}
    </group>
  );
};
