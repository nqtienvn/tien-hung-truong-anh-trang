import React, { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { useMuseum, MultiplayerUser } from "@/context/MuseumContext";

// ─── Kích thước dùng chung (giống PlayerCharacter) ───────────────────────────
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

interface MultiplayerAvatarItemProps {
  user: MultiplayerUser;
}

const MultiplayerAvatarItem: React.FC<MultiplayerAvatarItemProps> = ({
  user,
}) => {
  const { otherUsersPositions, settings } = useMuseum();
  const groupRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);

  const isPawn = settings.preset === 'low';
  const baseY = isPawn ? 0.24 : 0.472; // Phóng to 1.6x (0.15 * 1.6 và 0.295 * 1.6)

  const lastPos = useRef(new THREE.Vector3(user.x, user.y + baseY, user.z));
  const isMoving = useRef(false);
  const targetPos = useRef(new THREE.Vector3(user.x, user.y + baseY, user.z));
  const targetYaw = useRef(user.yaw);

  useEffect(() => {
    targetPos.current.set(user.x, user.y + baseY, user.z);
    targetYaw.current = user.yaw;
  }, [user.x, user.y, user.z, user.yaw, baseY]);

  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.set(user.x, user.y + baseY, user.z);
      groupRef.current.rotation.set(0, user.yaw, 0);
    }
  }, [baseY]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Đọc dữ liệu tọa độ thời gian thực trực tiếp từ ref
    const realTimeData = otherUsersPositions.current[user.id];
    if (realTimeData) {
      targetPos.current.set(realTimeData.x, realTimeData.y + baseY, realTimeData.z);
      targetYaw.current = realTimeData.yaw;
    }

    const lf = Math.min(1, 12 * delta);
    groupRef.current.position.lerp(targetPos.current, lf);

    let diff = targetYaw.current - groupRef.current.rotation.y;
    diff = Math.atan2(Math.sin(diff), Math.cos(diff));
    groupRef.current.rotation.y += diff * lf;

    const dist = groupRef.current.position.distanceTo(lastPos.current);
    isMoving.current = dist > 0.002;
    lastPos.current.copy(groupRef.current.position);

    const t = state.clock.getElapsedTime();
    const amp = 0.45,
      spd = 10;

    if (isMoving.current && settings.animations) {
      leftLegRef.current &&
        (leftLegRef.current.rotation.x = Math.sin(t * spd) * amp);
      rightLegRef.current &&
        (rightLegRef.current.rotation.x = -Math.sin(t * spd) * amp);
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = -Math.sin(t * spd) * amp * 0.75;
        leftArmRef.current.rotation.z = 0.2;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = Math.sin(t * spd) * amp * 0.75;
        rightArmRef.current.rotation.z = -0.2;
      }
    } else {
      leftLegRef.current && (leftLegRef.current.rotation.x *= 0.85);
      rightLegRef.current && (rightLegRef.current.rotation.x *= 0.85);
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x *= 0.85;
        leftArmRef.current.rotation.z +=
          (0.2 - leftArmRef.current.rotation.z) * 0.15;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x *= 0.85;
        rightArmRef.current.rotation.z +=
          (-0.2 - rightArmRef.current.rotation.z) * 0.15;
      }
    }
  });

  const mat = (
    <meshStandardMaterial color="#d4c5b0" roughness={0.6} metalness={0} />
  );

  return (
    <group ref={groupRef}>
      {isPawn ? (
        <group scale={1.6}>
          {/* MÔ HÌNH CON CỜ (CHESS PAWN) - Tối ưu hiệu năng tối đa cho cấu hình Thấp */}
          <mesh position={[0, 0.7, 0]}>
            <sphereGeometry args={[0.18, 20, 20]} />
            {mat}
          </mesh>
          <mesh position={[0, 0.48, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.06, 16]} />
            {mat}
          </mesh>
          <mesh position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.07, 0.18, 0.5, 16]} />
            {mat}
          </mesh>
          <mesh position={[0, -0.1, 0]}>
            <cylinderGeometry args={[0.22, 0.22, 0.1, 16]} />
            {mat}
          </mesh>
        </group>
      ) : (
        <group scale={1.6}>
          {/* MÔ HÌNH CON NGƯỜI (HUMANOID MANNEQUIN) - Cấu hình Trung bình / Cao */}
          {/* ĐẦU */}
          <mesh position={[0, 0.7, 0]}>
            <sphereGeometry args={[HEAD_R, 28, 28]} />
            {mat}
          </mesh>

          {/* THÂN */}
          <mesh position={[0, 0.28, 0]}>
            <capsuleGeometry args={[TORSO_R, TORSO_H, 10, 20]} />
            {mat}
          </mesh>

          {/* TAY TRÁI */}
          <group ref={leftArmRef} position={[-ARM_PIVOT_X, ARM_PIVOT_Y, 0]}>
            <mesh position={[0, ARM_MESH_Y, 0]}>
              <capsuleGeometry args={[ARM_R, ARM_LEN, 8, 16]} />
              {mat}
            </mesh>
          </group>

          {/* TAY PHẢI */}
          <group ref={rightArmRef} position={[ARM_PIVOT_X, ARM_PIVOT_Y, 0]}>
            <mesh position={[0, ARM_MESH_Y, 0]}>
              <capsuleGeometry args={[ARM_R, ARM_LEN, 8, 16]} />
              {mat}
            </mesh>
          </group>

          {/* CHÂN TRÁI */}
          <group ref={leftLegRef} position={[-LEG_PIVOT_X, LEG_PIVOT_Y, 0]}>
            <mesh position={[0, LEG_MESH_Y, 0]}>
              <capsuleGeometry args={[LEG_R, LEG_LEN, 8, 16]} />
              {mat}
            </mesh>
          </group>

          {/* CHÂN PHẢI */}
          <group ref={rightLegRef} position={[LEG_PIVOT_X, LEG_PIVOT_Y, 0]}>
            <mesh position={[0, LEG_MESH_Y, 0]}>
              <capsuleGeometry args={[LEG_R, LEG_LEN, 8, 16]} />
              {mat}
            </mesh>
          </group>
        </group>
      )}

      {/* Nhãn tên người chơi */}
      <Html
        position={[0, 1.8, 0]}
        center
        distanceFactor={8}
        className="pointer-events-none select-none text-center"
      >
        <div className="bg-cyan-500/90 text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded shadow-lg whitespace-nowrap border border-cyan-300">
          {user.nickname}
        </div>
      </Html>
    </group>
  );
};

export const MultiplayerAvatars: React.FC = () => {
  const { otherUsers, settings } = useMuseum();
  
  // Lọc hiển thị giới hạn tối đa N người chơi khác gần nhất/đầu tiên để tránh quá tải card đồ họa
  const visibleUsers = otherUsers
    .filter((u) => u.nickname !== "")
    .slice(0, settings.maxAvatars);

  return (
    <group>
      {visibleUsers.map((u) => (
        <MultiplayerAvatarItem key={u.id} user={u} />
      ))}
    </group>
  );
};
