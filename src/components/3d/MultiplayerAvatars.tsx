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
const ARM_PIVOT_X = TORSO_R + ARM_R * 0.3;
const ARM_PIVOT_Y = TORSO_TOP - 0.1;
const ARM_MESH_Y = -(ARM_R + ARM_LEN / 2);

const LEG_PIVOT_Y = 0.28 - TORSO_H / 2 - TORSO_R + LEG_R * 0.6;
const LEG_PIVOT_X = 0.082;
const LEG_MESH_Y = -(LEG_R + LEG_LEN / 2);
// ─────────────────────────────────────────────────────────────────────────────

interface MultiplayerAvatarItemProps {
  user: MultiplayerUser;
}

const MultiplayerAvatarItem: React.FC<MultiplayerAvatarItemProps> = ({
  user,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);

  const lastPos = useRef(new THREE.Vector3(user.x, user.y - 0.9, user.z));
  const isMoving = useRef(false);
  const targetPos = useRef(new THREE.Vector3(user.x, user.y - 0.9, user.z));
  const targetYaw = useRef(user.yaw);

  useEffect(() => {
    targetPos.current.set(user.x, user.y - 0.9, user.z);
    targetYaw.current = user.yaw;
  }, [user.x, user.y, user.z, user.yaw]);

  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.set(user.x, user.y - 0.9, user.z);
      groupRef.current.rotation.set(0, user.yaw, 0);
    }
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

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

    if (isMoving.current) {
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
      {/* ĐẦU */}
      <mesh position={[0, 0.7, 0]} castShadow>
        <sphereGeometry args={[HEAD_R, 28, 28]} />
        {mat}
      </mesh>

      {/* THÂN */}
      <mesh position={[0, 0.28, 0]} castShadow>
        <capsuleGeometry args={[TORSO_R, TORSO_H, 10, 20]} />
        {mat}
      </mesh>

      {/* TAY TRÁI */}
      <group ref={leftArmRef} position={[-ARM_PIVOT_X, ARM_PIVOT_Y, 0]}>
        <mesh position={[0, ARM_MESH_Y, 0]} castShadow>
          <capsuleGeometry args={[ARM_R, ARM_LEN, 8, 16]} />
          {mat}
        </mesh>
      </group>

      {/* TAY PHẢI */}
      <group ref={rightArmRef} position={[ARM_PIVOT_X, ARM_PIVOT_Y, 0]}>
        <mesh position={[0, ARM_MESH_Y, 0]} castShadow>
          <capsuleGeometry args={[ARM_R, ARM_LEN, 8, 16]} />
          {mat}
        </mesh>
      </group>

      {/* CHÂN TRÁI */}
      <group ref={leftLegRef} position={[-LEG_PIVOT_X, LEG_PIVOT_Y, 0]}>
        <mesh position={[0, LEG_MESH_Y, 0]} castShadow>
          <capsuleGeometry args={[LEG_R, LEG_LEN, 8, 16]} />
          {mat}
        </mesh>
      </group>

      {/* CHÂN PHẢI */}
      <group ref={rightLegRef} position={[LEG_PIVOT_X, LEG_PIVOT_Y, 0]}>
        <mesh position={[0, LEG_MESH_Y, 0]} castShadow>
          <capsuleGeometry args={[LEG_R, LEG_LEN, 8, 16]} />
          {mat}
        </mesh>
      </group>

      {/* Nhãn tên người chơi */}
      <Html
        position={[0, 1.1, 0]}
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
  const { otherUsers } = useMuseum();
  return (
    <group>
      {otherUsers
        .filter((u) => u.nickname !== "")
        .map((u) => (
          <MultiplayerAvatarItem key={u.id} user={u} />
        ))}
    </group>
  );
};
