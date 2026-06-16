import React from 'react';
import { Html } from '@react-three/drei';
import { useMuseum } from '@/context/MuseumContext';

export const MultiplayerAvatars: React.FC = () => {
  const { otherUsers } = useMuseum();

  return (
    <group>
      {otherUsers.map((user) => (
        <group 
          key={user.id} 
          position={[user.x, user.y - 0.9, user.z]} // Điều chỉnh độ cao thân khớp với mắt nhìn (y=1.7)
          rotation={[0, user.yaw, 0]}
        >
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
      ))}
    </group>
  );
};
