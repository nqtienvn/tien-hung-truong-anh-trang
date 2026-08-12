'use client';

import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useMuseum } from '@/context/MuseumContext';
import {
  ROOM_FOUR_JOURNEY_CONTENT,
  ROOM_FOUR_FINALE_SEAL_IDS,
  ROOM_FOUR_SEAL_LINKS,
  ROOM_FOUR_SEALS,
  getNextRoomFourStation,
  getRoomFourStationProgress,
  isRoomFourFinaleReady,
  isRoomFourJourneyToken,
  roomFourCompletionToken,
  roomFourFinaleToken,
  roomFourSealToken,
  roomFourStepToken,
  type RoomFourSealId,
  type RoomFourStationId,
} from '@/lib/roomFourJourney';
import type { BaseRoomProps } from './BaseRoomPlain';
import { RoomFourJourneyOverlay } from './room-four/RoomFourJourneyOverlay';
import {
  ROOM_FOUR_CENTERLINE,
  ROOM_FOUR_PORTALS,
  ROOM_FOUR_SPATIAL,
  ROOM_FOUR_STATIONS,
  type RoomFourStationKind,
  type RoomFourStationLayout,
} from '@/lib/roomFourLayout';
import { RoomFourHistoricalFlags } from './room-four/RoomFourHistoricalFlags';
import { RoomFourHistoricalQuotes } from './room-four/RoomFourHistoricalQuotes';
import { ROOM_FOUR_FOOT_PLAQUES } from '@/lib/roomFourFootPlaques';

const COLD = {
  floor: '#111a24',
  wall: '#1c2934',
  frame: '#2b3a46',
  paper: '#d8d0bf',
  line: '#afc9d3',
  accent: '#8e3437',
};

const WARM = {
  floor: '#172326',
  wall: '#29302c',
  frame: '#182326',
  wood: '#5a3828',
  paper: '#d8b878',
  line: '#d39a55',
  accent: '#a44333',
};

const GOLD = {
  frame: '#9a6e24',
  glow: '#ffd778',
  highlight: '#ffe6aa',
  button: '#b27a25',
  face: '#2a1b08',
  text: '#fff7df',
  buttonText: '#1e1608',
};

// Green is reserved for the circular completion guides. The historical red
// accents remain on the 3D artifacts as part of the room's art direction.
const COMPLETION = {
  line: '#4ade80',
};

const SHARED_MATERIALS = {
  coldFloor: new THREE.MeshStandardMaterial({ color: COLD.floor, roughness: 0.92, metalness: 0.04 }),
  coldWall: new THREE.MeshStandardMaterial({ color: COLD.wall, roughness: 0.88, metalness: 0.08 }),
  coldFrame: new THREE.MeshStandardMaterial({ color: COLD.frame, roughness: 0.7, metalness: 0.38 }),
  coldPaper: new THREE.MeshStandardMaterial({ color: COLD.paper, roughness: 0.94, metalness: 0 }),
  warmFloor: new THREE.MeshStandardMaterial({ color: WARM.floor, roughness: 0.92, metalness: 0.03 }),
  warmWall: new THREE.MeshStandardMaterial({ color: WARM.wall, roughness: 0.9, metalness: 0.02 }),
  warmFrame: new THREE.MeshStandardMaterial({ color: WARM.frame, roughness: 0.72, metalness: 0.3 }),
  warmWood: new THREE.MeshStandardMaterial({ color: WARM.wood, roughness: 0.82, metalness: 0.02 }),
  warmPaper: new THREE.MeshStandardMaterial({ color: WARM.paper, roughness: 0.96, metalness: 0 }),
  coldAccent: new THREE.MeshStandardMaterial({
    color: COLD.accent,
    emissive: COLD.accent,
    emissiveIntensity: 0.28,
    roughness: 0.68,
  }),
  warmAccent: new THREE.MeshStandardMaterial({
    color: WARM.accent,
    emissive: WARM.accent,
    emissiveIntensity: 0.35,
    roughness: 0.64,
  }),
  darkInk: new THREE.MeshStandardMaterial({ color: '#11191d', roughness: 0.86, metalness: 0.14 }),
  coldLine: new THREE.MeshBasicMaterial({ color: COLD.line, toneMapped: false }),
  warmLine: new THREE.MeshBasicMaterial({ color: WARM.line, toneMapped: false }),
  coldAccentLine: new THREE.MeshBasicMaterial({ color: COLD.accent, toneMapped: false }),
  warmAccentLine: new THREE.MeshBasicMaterial({ color: WARM.accent, toneMapped: false }),
  goldPlaqueGlow: new THREE.MeshBasicMaterial({
    color: GOLD.glow,
    transparent: true,
    opacity: 0.44,
    depthWrite: false,
    toneMapped: false,
  }),
  goldPlaqueFrame: new THREE.MeshStandardMaterial({
    color: GOLD.frame,
    emissive: '#5c3c0c',
    emissiveIntensity: 0.32,
    roughness: 0.28,
    metalness: 0.78,
  }),
  goldPlaqueFace: new THREE.MeshStandardMaterial({
    color: GOLD.face,
    roughness: 0.7,
    metalness: 0.08,
  }),
  goldPlaqueLine: new THREE.MeshBasicMaterial({
    color: GOLD.highlight,
    toneMapped: false,
  }),
  goldPlaqueButton: new THREE.MeshStandardMaterial({
    color: GOLD.button,
    emissive: '#d99624',
    emissiveIntensity: 0.58,
    roughness: 0.3,
    metalness: 0.68,
  }),
  coldDisplayGlow: new THREE.MeshBasicMaterial({
    color: '#84c4dc',
    transparent: true,
    opacity: 0.2,
    depthWrite: false,
    toneMapped: false,
  }),
  warmDisplayGlow: new THREE.MeshBasicMaterial({
    color: '#f2ba6a',
    transparent: true,
    opacity: 0.22,
    depthWrite: false,
    toneMapped: false,
  }),
  completionLine: new THREE.MeshBasicMaterial({ color: COMPLETION.line, toneMapped: false }),
  inactiveLine: new THREE.MeshBasicMaterial({ color: '#3b474d', toneMapped: false }),
  route: new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false }),
  routeGlow: new THREE.MeshBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.14,
    depthWrite: false,
    toneMapped: false,
  }),
  journeyLink: new THREE.MeshBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.94,
    depthWrite: false,
    toneMapped: false,
  }),
  transitionFloor: new THREE.MeshStandardMaterial({
    color: '#ffffff',
    vertexColors: true,
    roughness: 0.92,
    metalness: 0.04,
  }),
  transitionWall: new THREE.MeshStandardMaterial({
    color: '#ffffff',
    vertexColors: true,
    roughness: 0.88,
    metalness: 0.06,
  }),
  transitionCeiling: new THREE.MeshStandardMaterial({
    color: '#ffffff',
    vertexColors: true,
    roughness: 0.8,
    metalness: 0.12,
  }),
};

const TRANSITION_STEPS = Array.from({ length: 8 }, (_, index) => {
  const t = index / 7;
  const color = new THREE.Color(COLD.floor).lerp(new THREE.Color(WARM.floor), t);
  const wall = new THREE.Color(COLD.wall).lerp(new THREE.Color(WARM.wall), t);
  return {
    z: -42 + (index + 0.5),
    color: `#${color.getHexString()}`,
    wall: `#${wall.getHexString()}`,
  };
});

const CEILING_RIBS = Array.from({ length: 21 }, (_, index) => -73 + index * 3.8);

interface BoxInstance {
  position: readonly [number, number, number];
  scale: readonly [number, number, number];
  color?: string;
}

const InstancedBoxes: React.FC<{
  instances: readonly BoxInstance[];
  material: THREE.Material;
}> = ({ instances, material }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const transform = new THREE.Object3D();
    const instanceColor = new THREE.Color();

    instances.forEach((instance, index) => {
      transform.position.set(...instance.position);
      transform.scale.set(...instance.scale);
      transform.updateMatrix();
      mesh.setMatrixAt(index, transform.matrix);
      if (instance.color) {
        mesh.setColorAt(index, instanceColor.set(instance.color));
      }
    });

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [instances]);

  if (instances.length === 0) return null;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, instances.length]} material={material}>
      <boxGeometry args={[1, 1, 1]} />
    </instancedMesh>
  );
};

function createRouteGeometry(
  radius: number,
  tubularSegments: number,
  radialSegments: number,
): THREE.TubeGeometry {
  const points = ROOM_FOUR_CENTERLINE.map(([x, z]) => new THREE.Vector3(x, 0.1, z));
  const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.36);
  const geometry = new THREE.TubeGeometry(
    curve,
    tubularSegments,
    radius,
    radialSegments,
    false,
  );
  const position = geometry.getAttribute('position');
  const colors = new Float32Array(position.count * 3);
  const cold = new THREE.Color(COLD.line);
  const warm = new THREE.Color(WARM.line);
  const mixed = new THREE.Color();

  for (let index = 0; index < position.count; index += 1) {
    const z = position.getZ(index);
    const blend = THREE.MathUtils.clamp((z + 42) / 8, 0, 1);
    mixed.copy(cold).lerp(warm, blend);
    colors[index * 3] = mixed.r;
    colors[index * 3 + 1] = mixed.g;
    colors[index * 3 + 2] = mixed.b;
  }

  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  return geometry;
}

const RouteSpine: React.FC<{ reducedDetail: boolean }> = ({ reducedDetail }) => {
  const routeGeometry = useMemo(
    () => createRouteGeometry(0.065, reducedDetail ? 96 : 180, reducedDetail ? 4 : 6),
    [reducedDetail],
  );
  const glowGeometry = useMemo(
    () => createRouteGeometry(0.15, reducedDetail ? 72 : 132, reducedDetail ? 4 : 6),
    [reducedDetail],
  );

  useEffect(
    () => () => {
      routeGeometry.dispose();
      glowGeometry.dispose();
    },
    [glowGeometry, routeGeometry],
  );

  return (
    <group>
      <mesh geometry={glowGeometry} material={SHARED_MATERIALS.routeGlow} renderOrder={1} />
      <mesh geometry={routeGeometry} material={SHARED_MATERIALS.route} renderOrder={2} />
    </group>
  );
};

const IGNORE_RAYCAST: THREE.Object3D['raycast'] = () => undefined;

const RETURN_MAP_MARKERS = [
  [-1.18, 2.68, 0.26],
  [-1.2, 1.2, 0.26],
  [0.92, 2.4, 0.26],
  [1.08, 1.04, 0.26],
  [0.16, 3.08, 0.26],
] as const satisfies ReadonlyArray<readonly [number, number, number]>;

if (false) {
const JOURNEY_LINK_DURATION_SECONDS = 1.75;
const JOURNEY_FINALE_DURATION_SECONDS = 1.65;

interface ActiveJourneyLink {
  sealId: RoomFourSealId;
  sourceStationId: RoomFourStationId;
  targetStationId: RoomFourStationId;
  requestId: number;
}

/**
 * These lightweight marker positions settle into the Return Map during the
 * Station 8 finale. Their text lives on the Journey Card, keeping the model
 * itself free of floating labels.
 */
const RETURN_MAP_HUB: readonly [number, number, number] = [0.15, 1.85, 0.24];
const RETURN_MAP_FINALE_SEALS = [
  { sealId: 'theory', mapPosition: [-1.18, 2.68, 0.26], entryPosition: [-2.4, 4.25, 0.65] },
  { sealId: 'organisation', mapPosition: [-1.2, 1.2, 0.26], entryPosition: [-2.0, 0.8, 0.65] },
  { sealId: 'press', mapPosition: [0.92, 2.4, 0.26], entryPosition: [2.25, 4.0, 0.65] },
  { sealId: 'cadres', mapPosition: [1.08, 1.04, 0.26], entryPosition: [2.3, 0.82, 0.65] },
  { sealId: 'network', mapPosition: [0.16, 3.08, 0.26], entryPosition: [0.16, 4.7, 0.65] },
] as const satisfies ReadonlyArray<{
  sealId: (typeof ROOM_FOUR_FINALE_SEAL_IDS)[number];
  mapPosition: readonly [number, number, number];
  entryPosition: readonly [number, number, number];
}>;

function createJourneyLinkGeometry(
  sourceStationId: RoomFourStationId,
  targetStationId: RoomFourStationId,
): THREE.TubeGeometry {
  const sourceStation = ROOM_FOUR_STATIONS.find((station) => station.id === sourceStationId);
  const targetStation = ROOM_FOUR_STATIONS.find((station) => station.id === targetStationId);
  if (!sourceStation || !targetStation) {
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3([]), 1, 0.01, 3, false);
  }

  const closestRouteIndex = (stop: readonly [number, number]) =>
    ROOM_FOUR_CENTERLINE.reduce(
      (closestIndex, point, index) => {
        const currentDistance = (point[0] - stop[0]) ** 2 + (point[1] - stop[1]) ** 2;
        const closestPoint = ROOM_FOUR_CENTERLINE[closestIndex];
        const closestDistance = (closestPoint[0] - stop[0]) ** 2 + (closestPoint[1] - stop[1]) ** 2;
        return currentDistance < closestDistance ? index : closestIndex;
      },
      0,
    );

  const sourceIndex = closestRouteIndex(sourceStation.stop);
  const targetIndex = closestRouteIndex(targetStation.stop);
  const isForward = sourceIndex <= targetIndex;
  const spinePoints = ROOM_FOUR_CENTERLINE.slice(
    Math.min(sourceIndex, targetIndex),
    Math.max(sourceIndex, targetIndex) + 1,
  );
  const orderedPoints = isForward ? spinePoints : [...spinePoints].reverse();
  const points = orderedPoints.map(([x, z]) => new THREE.Vector3(x, 0.17, z));
  points[0] = new THREE.Vector3(sourceStation.stop[0], 0.17, sourceStation.stop[1]);
  points[points.length - 1] = new THREE.Vector3(targetStation.stop[0], 0.17, targetStation.stop[1]);

  const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.22);
  const geometry = new THREE.TubeGeometry(curve, Math.max(36, points.length * 20), 0.043, 6, false);
  const position = geometry.getAttribute('position');
  const colors = new Float32Array(position.count * 3);
  const sourceColor = new THREE.Color(COLD.line);
  const targetColor = new THREE.Color(WARM.line);
  const color = new THREE.Color();

  for (let index = 0; index < position.count; index += 1) {
    const blend = position.count === 1 ? 1 : index / (position.count - 1);
    color.copy(sourceColor).lerp(targetColor, blend);
    colors[index * 3] = color.r;
    colors[index * 3 + 1] = color.g;
    colors[index * 3 + 2] = color.b;
  }

  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  return geometry;
}

/** A single, non-interactive flash that reuses the approved floor-route geometry. */
const JourneyLinkEffect: React.FC<{ link: ActiveJourneyLink }> = ({ link }) => {
  const geometry = useMemo(
    () => createJourneyLinkGeometry(link.sourceStationId, link.targetStationId),
    [link.sourceStationId, link.targetStationId],
  );
  const elapsed = useRef(0);
  const drawCount = useMemo(
    () => geometry.index?.count ?? geometry.getAttribute('position').count,
    [geometry],
  );

  useEffect(() => {
    geometry.setDrawRange(0, 0);
    SHARED_MATERIALS.journeyLink.opacity = 0.94;
    return () => {
      geometry.dispose();
      SHARED_MATERIALS.journeyLink.opacity = 0.94;
    };
  }, [geometry]);

  useFrame((_, delta) => {
    elapsed.current = Math.min(elapsed.current + delta, JOURNEY_LINK_DURATION_SECONDS);
    const progress = elapsed.current / JOURNEY_LINK_DURATION_SECONDS;
    const reveal = THREE.MathUtils.smoothstep(progress * 1.45, 0, 1);
    geometry.setDrawRange(0, Math.max(3, Math.floor(drawCount * reveal)));
    SHARED_MATERIALS.journeyLink.opacity =
      progress > 0.78 ? THREE.MathUtils.mapLinear(progress, 0.78, 1, 0.94, 0) : 0.94;
  });

  return <mesh geometry={geometry} material={SHARED_MATERIALS.journeyLink} raycast={IGNORE_RAYCAST} renderOrder={4} />;
};

/**
 * Phase 9 uses five HTML seal labels instead of per-frame geometry creation.
 * Animation mutates only group refs; the completion transition is timer-driven
 * so React state is never updated from useFrame.
 */
const JourneyFinaleEffect: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const sealRefs = useRef<Array<THREE.Group | null>>([]);
  const elapsed = useRef(0);
  const onCompleteRef = useRef(onComplete);
  const returnMap = ROOM_FOUR_STATIONS.find((station) => station.id === 's8');
  const mapX = returnMap?.object[0] ?? -4.9;
  const mapZ = returnMap?.object[1] ?? -1.3;

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const timer = window.setTimeout(() => onCompleteRef.current(), JOURNEY_FINALE_DURATION_SECONDS * 1000);
    return () => window.clearTimeout(timer);
  }, []);

  useFrame((_, delta) => {
    elapsed.current = Math.min(elapsed.current + delta, JOURNEY_FINALE_DURATION_SECONDS);
    const progress = elapsed.current / JOURNEY_FINALE_DURATION_SECONDS;
    const eased = THREE.MathUtils.smoothstep(progress, 0, 1);
    const lift = Math.sin(Math.PI * eased) * 0.42;

    RETURN_MAP_FINALE_SEALS.forEach((seal, index) => {
      const group = sealRefs.current[index];
      if (!group) return;
      group.position.set(
        mapX + THREE.MathUtils.lerp(seal.entryPosition[0], RETURN_MAP_HUB[0], eased),
        THREE.MathUtils.lerp(seal.entryPosition[1], RETURN_MAP_HUB[1], eased) + lift,
        mapZ + THREE.MathUtils.lerp(seal.entryPosition[2], RETURN_MAP_HUB[2], eased),
      );
      group.scale.setScalar(THREE.MathUtils.lerp(1, 0.74, eased));
    });
  });

  return (
    <group name="room-four-journey-finale" raycast={IGNORE_RAYCAST} renderOrder={6}>
      {RETURN_MAP_FINALE_SEALS.map((seal, index) => (
          <group
            key={seal.sealId}
            ref={(node) => {
              sealRefs.current[index] = node;
            }}
            position={[
              mapX + seal.entryPosition[0],
              seal.entryPosition[1],
              mapZ + seal.entryPosition[2],
            ]}
          >
            <mesh material={SHARED_MATERIALS.warmAccent} raycast={IGNORE_RAYCAST}>
              <sphereGeometry args={[0.1, 10, 8]} />
            </mesh>
          </group>
        ))}
    </group>
  );
};

}
const PortalFrame: React.FC<{
  z: number;
  roomHeight: number;
  material: THREE.Material;
  halfSpan: number;
}> = ({ z, roomHeight, material, halfSpan }) => {
  const columnHeight = roomHeight - 0.32;
  return (
    <group position={[0, 0, z]}>
      <mesh position={[-halfSpan, columnHeight / 2, 0]} material={material}>
        <boxGeometry args={[0.18, columnHeight, 0.3]} />
      </mesh>
      <mesh position={[halfSpan, columnHeight / 2, 0]} material={material}>
        <boxGeometry args={[0.18, columnHeight, 0.3]} />
      </mesh>
      <mesh position={[0, roomHeight - 0.16, 0]} material={material}>
        <boxGeometry args={[halfSpan * 2 + 0.2, 0.18, 0.3]} />
      </mesh>
    </group>
  );
};

const RoomShell: React.FC<{ roomHeight: number; ribStride: number }> = ({
  roomHeight,
  ribStride,
}) => {
  const wallY = roomHeight / 2;
  const ceilingY = roomHeight + 0.02;
  const transitionFloorInstances = useMemo<readonly BoxInstance[]>(
    () =>
      TRANSITION_STEPS.map((step) => ({
        position: [0, -0.08, step.z],
        scale: [ROOM_FOUR_SPATIAL.roomWidth, 0.16, 1.01],
        color: step.color,
      })),
    [],
  );
  const transitionWallInstances = useMemo<readonly BoxInstance[]>(
    () =>
      TRANSITION_STEPS.flatMap((step) => [
        {
          position: [-8.9, wallY, step.z] as const,
          scale: [0.2, roomHeight, 1.01] as const,
          color: step.wall,
        },
        {
          position: [8.9, wallY, step.z] as const,
          scale: [0.2, roomHeight, 1.01] as const,
          color: step.wall,
        },
      ]),
    [roomHeight, wallY],
  );
  const transitionCeilingInstances = useMemo<readonly BoxInstance[]>(
    () =>
      TRANSITION_STEPS.map((step) => ({
        position: [0, ceilingY, step.z],
        scale: [18, 0.18, 1.01],
        color: step.wall,
      })),
    [ceilingY],
  );
  const coldRibInstances = useMemo<readonly BoxInstance[]>(
    () =>
      CEILING_RIBS.filter((z, index) => z < -38 && index % ribStride === 0).map((z) => ({
        position: [0, roomHeight - 0.12, z],
        scale: [17.6, 0.12, 0.12],
      })),
    [ribStride, roomHeight],
  );
  const warmRibInstances = useMemo<readonly BoxInstance[]>(
    () =>
      CEILING_RIBS.filter((z, index) => z >= -38 && index % ribStride === 0).map((z) => ({
        position: [0, roomHeight - 0.12, z],
        scale: [17.6, 0.12, 0.12],
      })),
    [ribStride, roomHeight],
  );

  return (
    <group>
      {/* The five plan zones preserve the approved -75 → +5 room boundary. */}
      <mesh position={[0, -0.08, -71]} material={SHARED_MATERIALS.coldFloor}>
        <boxGeometry args={[ROOM_FOUR_SPATIAL.roomWidth, 0.16, 8]} />
      </mesh>
      <mesh position={[0, -0.08, -54.5]} material={SHARED_MATERIALS.coldFloor}>
        <boxGeometry args={[ROOM_FOUR_SPATIAL.roomWidth, 0.16, 25]} />
      </mesh>
      <InstancedBoxes
        instances={transitionFloorInstances}
        material={SHARED_MATERIALS.transitionFloor}
      />
      <mesh position={[0, -0.08, -16]} material={SHARED_MATERIALS.warmFloor}>
        <boxGeometry args={[ROOM_FOUR_SPATIAL.roomWidth, 0.16, 36]} />
      </mesh>
      <mesh position={[0, -0.08, 3.5]} material={SHARED_MATERIALS.warmFloor}>
        <boxGeometry args={[ROOM_FOUR_SPATIAL.roomWidth, 0.16, 3]} />
      </mesh>

      {/* Side-wall skins change temperature without introducing a third historical section. */}
      {[
        { z: -58.5, length: 33, material: SHARED_MATERIALS.coldWall },
        { z: -16, length: 36, material: SHARED_MATERIALS.warmWall },
        { z: 3.5, length: 3, material: SHARED_MATERIALS.warmWall },
      ].map((section) => (
        <React.Fragment key={`walls-${section.z}`}>
          <mesh position={[-8.9, wallY, section.z]} material={section.material}>
            <boxGeometry args={[0.2, roomHeight, section.length]} />
          </mesh>
          <mesh position={[8.9, wallY, section.z]} material={section.material}>
            <boxGeometry args={[0.2, roomHeight, section.length]} />
          </mesh>
        </React.Fragment>
      ))}
      <InstancedBoxes
        instances={transitionWallInstances}
        material={SHARED_MATERIALS.transitionWall}
      />

      {/* Front and rear walls retain the original centered 4 × 4 metre door apertures. */}
      {[ROOM_FOUR_SPATIAL.localStartZ, ROOM_FOUR_SPATIAL.localEndZ].map((z, wallIndex) => {
        const material = wallIndex === 0 ? SHARED_MATERIALS.coldWall : SHARED_MATERIALS.warmWall;
        return (
          <group key={`end-wall-${z}`}>
            <mesh position={[-5.5, wallY, z]} material={material}>
              <boxGeometry args={[7, roomHeight, 0.22]} />
            </mesh>
            <mesh position={[5.5, wallY, z]} material={material}>
              <boxGeometry args={[7, roomHeight, 0.22]} />
            </mesh>
            <mesh position={[0, 5.5, z]} material={material}>
              <boxGeometry args={[4, Math.max(0.2, roomHeight - 4), 0.22]} />
            </mesh>
          </group>
        );
      })}

      {/* A dark, ribbed ceiling creates a controlled contemporary exhibition volume. */}
      <mesh position={[0, ceilingY, -58.5]} material={SHARED_MATERIALS.darkInk}>
        <boxGeometry args={[18, 0.18, 33]} />
      </mesh>
      <InstancedBoxes
        instances={transitionCeilingInstances}
        material={SHARED_MATERIALS.transitionCeiling}
      />
      <mesh position={[0, ceilingY, -14.5]} material={SHARED_MATERIALS.darkInk}>
        <boxGeometry args={[18, 0.18, 39]} />
      </mesh>
      <InstancedBoxes instances={coldRibInstances} material={SHARED_MATERIALS.coldFrame} />
      <InstancedBoxes instances={warmRibInstances} material={SHARED_MATERIALS.warmWood} />

      {ROOM_FOUR_PORTALS.map((portal) => {
        const material =
          portal.skin === 'cold-frame'
            ? SHARED_MATERIALS.coldFrame
            : portal.skin === 'warm-wood'
              ? SHARED_MATERIALS.warmWood
              : SHARED_MATERIALS.warmFrame;
        return (
          <PortalFrame
            key={portal.id}
            z={portal.z}
            roomHeight={roomHeight}
            halfSpan={portal.halfSpan}
            material={material}
          />
        );
      })}
    </group>
  );
};

const Connector: React.FC<{
  start: readonly [number, number, number];
  end: readonly [number, number, number];
  material: THREE.Material;
  radius?: number;
}> = ({ start, end, material, radius = 0.035 }) => {
  const transform = useMemo(() => {
    const from = new THREE.Vector3(...start);
    const to = new THREE.Vector3(...end);
    const direction = to.clone().sub(from);
    const midpoint = from.clone().add(to).multiplyScalar(0.5);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      direction.clone().normalize(),
    );
    return { midpoint, quaternion, length: direction.length() };
  }, [end, start]);

  return (
    <mesh position={transform.midpoint} quaternion={transform.quaternion} material={material}>
      <cylinderGeometry args={[radius, radius, transform.length, 8]} />
    </mesh>
  );
};

const StudyDesk: React.FC<{
  warm?: boolean;
  ticket?: boolean;
  mission?: boolean;
  progressCount?: number;
}> = ({
  warm = false,
  ticket = false,
  mission = false,
  progressCount = 0,
}) => {
  const frame = warm ? SHARED_MATERIALS.warmFrame : SHARED_MATERIALS.coldFrame;
  const surface = warm ? SHARED_MATERIALS.warmWood : SHARED_MATERIALS.darkInk;
  const paper = warm ? SHARED_MATERIALS.warmPaper : SHARED_MATERIALS.coldPaper;
  const accent = warm ? SHARED_MATERIALS.warmAccent : SHARED_MATERIALS.coldAccent;
  const line = warm ? SHARED_MATERIALS.warmLine : SHARED_MATERIALS.coldLine;
  const openBookCount = Math.min(progressCount, 3);

  return (
    <group>
      <mesh position={[0, 1, 0]} material={surface}>
        <boxGeometry args={[2.65, 0.16, 1.25]} />
      </mesh>
      {[-1.05, 1.05].map((x) => (
        <mesh key={`desk-leg-${x}`} position={[x, 0.5, 0]} material={frame}>
          <boxGeometry args={[0.12, 0.95, 0.92]} />
        </mesh>
      ))}

      {!ticket && !mission && [-0.72, 0, 0.72].map((x, index) => {
        const opened = index < openBookCount;
        return (
          <group
            key={`moscow-book-${x}`}
            position={[x, opened ? 1.28 + index * 0.025 : 1.17 + index * 0.02, -0.05]}
            rotation={[0, -0.08 + index * 0.08, opened ? -0.08 : 0]}
          >
            <mesh material={frame}>
              <boxGeometry args={[0.58, 0.1, 0.78]} />
            </mesh>
            {opened ? (
              <>
                <mesh position={[-0.145, 0.07, -0.05]} rotation={[0, 0.28, -0.08]} material={paper}>
                  <boxGeometry args={[0.3, 0.022, 0.62]} />
                </mesh>
                <mesh position={[0.145, 0.07, -0.05]} rotation={[0, -0.28, 0.08]} material={paper}>
                  <boxGeometry args={[0.3, 0.022, 0.62]} />
                </mesh>
                <mesh position={[0, 0.105, -0.05]} material={accent}>
                  <boxGeometry args={[0.035, 0.018, 0.54]} />
                </mesh>
                <mesh position={[0, 0.21, 0.26]} material={line}>
                  <sphereGeometry args={[0.07, 12, 8]} />
                </mesh>
              </>
            ) : (
              <mesh position={[0, 0.06, 0]} material={paper}>
                <boxGeometry args={[0.45, 0.018, 0.63]} />
              </mesh>
            )}
          </group>
        );
      })}

      {ticket && (
        <group
          position={[0, progressCount > 0 ? 1.31 : 1.17, progressCount > 0 ? 0.66 : -0.05]}
          rotation={[progressCount > 0 ? -0.1 : 0, 0.06, progressCount > 0 ? -0.05 : 0]}
        >
          <mesh material={paper}>
            <boxGeometry args={[1.45, 0.055, 0.8]} />
          </mesh>
          <mesh position={[0.42, 0.04, 0]} material={accent}>
            <cylinderGeometry args={[0.14, 0.14, 0.025, 20]} />
          </mesh>
        </group>
      )}

      {mission && [-0.72, 0, 0.72].map((x, index) => {
        const opened = index < progressCount;
        return (
          <group key={`mission-envelope-${x}`} position={[x, opened ? 1.32 : 1.17, opened ? 0.18 + index * 0.14 : -0.05]}>
            <mesh material={paper}>
              <boxGeometry args={[0.58, 0.045, 0.72]} />
            </mesh>
            <mesh
              position={[0, opened ? 0.12 : 0.05, opened ? -0.12 : 0.02]}
              rotation={[opened ? -0.64 : -0.06, 0, 0]}
              material={paper}
            >
              <boxGeometry args={[0.56, 0.025, 0.31]} />
            </mesh>
            <mesh position={[0, 0.055, 0.08]} material={accent}>
              <cylinderGeometry args={[0.08, 0.08, 0.025, 12]} />
            </mesh>
          </group>
        );
      })}

      {!ticket && !mission && (
        <group position={[0.9, 1.12, -0.25]}>
          <mesh position={[0, 0.48, 0]} material={frame}>
            <cylinderGeometry args={[0.035, 0.035, 0.9, 10]} />
          </mesh>
          <mesh position={[-0.22, 0.88, 0]} rotation={[0, 0, Math.PI / 2]} material={accent}>
            <coneGeometry args={[0.26, 0.48, 16, 1, true]} />
          </mesh>
        </group>
      )}
      {mission &&
        [-0.72, 0, 0.72].map((x, index) => (
          <Connector
            key={`mission-ray-${x}`}
            start={[x, 1.25, 0]}
            end={[x * 1.4, 2.35, 1.25 + index * 0.25]}
            material={index < progressCount ? SHARED_MATERIALS.warmLine : SHARED_MATERIALS.inactiveLine}
            radius={0.024}
          />
        ))}
    </group>
  );
};

/**
 * S1 is a static architectural maquette inspired by the winter, neoclassical
 * Moscow university facade in the approved reference. It occupies the former
 * study-desk volume only; no route, collider, raycast, or interaction changes.
 */
const MoscowUniversityBuildingModel: React.FC<{ reducedDetail: boolean }> = ({ reducedDetail }) => {
  const frontWindows = reducedDetail ? [-1.12, -0.56, 0.56, 1.12] : [-1.24, -0.84, -0.42, 0.42, 0.84, 1.24];
  const windowRows = reducedDetail ? [0.84, 1.4] : [0.62, 1.18, 1.74];
  const columnPositions = [-1.06, -0.64, -0.22, 0.22, 0.64, 1.06];

  return (
    <group name="room-four-s1-moscow-university-maquette" raycast={IGNORE_RAYCAST}>
      {/* Raised stone plinth and snow-dusted entrance stair. */}
      <mesh position={[0.12, 0.14, 0]} material={SHARED_MATERIALS.coldFrame} raycast={IGNORE_RAYCAST}>
        <boxGeometry args={[2.28, 0.28, 3.08]} />
      </mesh>
      {[0, 1, 2, 3].map((step) => (
        <mesh
          key={`s1-university-step-${step}`}
          position={[-1.17 - step * 0.13, 0.18 + step * 0.09, 0]}
          material={SHARED_MATERIALS.coldPaper}
          raycast={IGNORE_RAYCAST}
        >
          <boxGeometry args={[0.28, 0.1, 1.78 - step * 0.12]} />
        </mesh>
      ))}

      {/* Main block, lower storey, and a stepped roofline echo the reference. */}
      <mesh position={[0.12, 1.2, 0]} material={SHARED_MATERIALS.coldPaper} raycast={IGNORE_RAYCAST}>
        <boxGeometry args={[2.16, 1.86, 3.05]} />
      </mesh>
      <mesh position={[0.12, 0.52, 0]} material={SHARED_MATERIALS.coldFrame} raycast={IGNORE_RAYCAST}>
        <boxGeometry args={[2.22, 0.5, 3.1]} />
      </mesh>
      <mesh position={[0.12, 2.17, 0]} material={SHARED_MATERIALS.coldFrame} raycast={IGNORE_RAYCAST}>
        <boxGeometry args={[2.34, 0.16, 3.2]} />
      </mesh>
      <mesh position={[0.22, 2.34, 0]} material={SHARED_MATERIALS.coldPaper} raycast={IGNORE_RAYCAST}>
        <boxGeometry args={[1.72, 0.2, 2.54]} />
      </mesh>
      <mesh position={[0.22, 2.48, 0]} material={SHARED_MATERIALS.coldFrame} raycast={IGNORE_RAYCAST}>
        <boxGeometry args={[1.8, 0.11, 2.62]} />
      </mesh>
      {!reducedDetail && (
        <mesh position={[0.22, 2.56, 0]} material={SHARED_MATERIALS.coldDisplayGlow} raycast={IGNORE_RAYCAST}>
          <boxGeometry args={[1.68, 0.022, 2.5]} />
        </mesh>
      )}

      {/* Portico: six fluted-looking columns, capitals, entablature, red banners. */}
      <mesh position={[-1.03, 1.36, 0]} material={SHARED_MATERIALS.darkInk} raycast={IGNORE_RAYCAST}>
        <boxGeometry args={[0.08, 1.64, 1.82]} />
      </mesh>
      {[-0.72, 0.72].map((z) => (
        <mesh key={`s1-university-banner-${z}`} position={[-1.1, 1.42, z]} material={SHARED_MATERIALS.coldAccent} raycast={IGNORE_RAYCAST}>
          <boxGeometry args={[0.035, 1.38, 0.26]} />
        </mesh>
      ))}
      {columnPositions.map((z) => (
        <group key={`s1-university-column-${z}`}>
          <mesh position={[-1.2, 0.52, z]} material={SHARED_MATERIALS.coldFrame} raycast={IGNORE_RAYCAST}>
            <cylinderGeometry args={[0.12, 0.16, 0.14, 10]} />
          </mesh>
          <mesh position={[-1.2, 1.28, z]} material={SHARED_MATERIALS.coldPaper} raycast={IGNORE_RAYCAST}>
            <cylinderGeometry args={[0.075, 0.09, 1.42, 10]} />
          </mesh>
          {!reducedDetail && [-0.032, 0.032].map((offset) => (
            <mesh key={`s1-university-flute-${z}-${offset}`} position={[-1.282, 1.28, z + offset]} material={SHARED_MATERIALS.coldFrame} raycast={IGNORE_RAYCAST}>
              <boxGeometry args={[0.012, 1.1, 0.012]} />
            </mesh>
          ))}
          <mesh position={[-1.2, 2.02, z]} material={SHARED_MATERIALS.coldFrame} raycast={IGNORE_RAYCAST}>
            <cylinderGeometry args={[0.12, 0.12, 0.1, 10]} />
          </mesh>
        </group>
      ))}
      <mesh position={[-1.2, 2.16, 0]} material={SHARED_MATERIALS.coldFrame} raycast={IGNORE_RAYCAST}>
        <boxGeometry args={[0.16, 0.22, 2.72]} />
      </mesh>
      <mesh position={[-1.2, 2.31, 0]} material={SHARED_MATERIALS.coldPaper} raycast={IGNORE_RAYCAST}>
        <boxGeometry args={[0.22, 0.1, 2.84]} />
      </mesh>

      {/* Deep-set front windows retain the dark, wintry contrast of the image. */}
      {windowRows.flatMap((y) => frontWindows.map((z) => [y, z] as const)).map(([y, z]) => (
        <group key={`s1-university-window-${y}-${z}`} position={[-1.01, y, z]}>
          <mesh material={SHARED_MATERIALS.darkInk} raycast={IGNORE_RAYCAST}>
            <boxGeometry args={[0.03, 0.32, 0.23]} />
          </mesh>
          <mesh position={[-0.02, 0, 0]} material={SHARED_MATERIALS.coldFrame} raycast={IGNORE_RAYCAST}>
            <boxGeometry args={[0.02, 0.035, 0.28]} />
          </mesh>
          {!reducedDetail && (
            <mesh position={[-0.021, 0, 0]} material={SHARED_MATERIALS.coldFrame} raycast={IGNORE_RAYCAST}>
              <boxGeometry args={[0.022, 0.27, 0.018]} />
            </mesh>
          )}
        </group>
      ))}

      {/* Side windows provide the long wing seen from the oblique street view. */}
      {!reducedDetail && [0.58, 1.16, 1.74].flatMap((y) => [-0.66, -0.22, 0.22, 0.66].map((x) => [x, y] as const)).map(([x, y]) => (
        <mesh key={`s1-university-side-window-${x}-${y}`} position={[x, y, 1.54]} material={SHARED_MATERIALS.darkInk} raycast={IGNORE_RAYCAST}>
          <boxGeometry args={[0.22, 0.3, 0.03]} />
        </mesh>
      ))}
    </group>
  );
};

/**
 * Phase 12 adds one contextual prop to each station. These are deliberately
 * static and raycast-free: the existing central exhibit and foot-plaque remain
 * the only visual and interaction anchors of the visitor journey.
 */
const SupplementalStationModel: React.FC<{
  stationId: RoomFourStationLayout['id'];
  reducedDetail: boolean;
}> = ({ stationId, reducedDetail }) => {
  switch (stationId) {
    case 's1':
      return null;
    case 's2':
      return null;
    case 's3':
      return (
        <group name="room-four-s3-diplomatic-trunk" position={[1.46, 0.08, 0.56]} raycast={IGNORE_RAYCAST}>
          <mesh position={[0, 0.32, 0]} material={SHARED_MATERIALS.coldFrame} raycast={IGNORE_RAYCAST}>
            <boxGeometry args={[0.82, 0.5, 0.56]} />
          </mesh>
          <mesh position={[0, 0.61, 0]} material={SHARED_MATERIALS.coldPaper} raycast={IGNORE_RAYCAST}>
            <boxGeometry args={[0.86, 0.12, 0.6]} />
          </mesh>
          {[-0.28, 0.28].map((x) => (
            <mesh key={`s3-trunk-strap-${x}`} position={[x, 0.63, 0]} material={SHARED_MATERIALS.coldAccent} raycast={IGNORE_RAYCAST}>
              <boxGeometry args={[0.055, 0.14, 0.62]} />
            </mesh>
          ))}
          {!reducedDetail && (
            <mesh position={[0, 0.74, 0]} rotation={[Math.PI / 2, 0, 0]} material={SHARED_MATERIALS.coldFrame} raycast={IGNORE_RAYCAST}>
              <torusGeometry args={[0.14, 0.026, 6, 12]} />
            </mesh>
          )}
        </group>
      );
    case 's4':
      return (
        <group name="room-four-s4-three-drawer-file-cabinet" position={[-1.12, 0.08, 0.84]} raycast={IGNORE_RAYCAST}>
          <mesh position={[0, 0.76, 0]} material={SHARED_MATERIALS.warmFrame} raycast={IGNORE_RAYCAST}>
            <boxGeometry args={[0.62, 1.5, 0.48]} />
          </mesh>
          {[-0.42, 0, 0.42].map((y, index) => (
            <React.Fragment key={`s4-cabinet-drawer-${index}`}>
              <mesh position={[0, 0.76 + y, -0.255]} material={SHARED_MATERIALS.warmPaper} raycast={IGNORE_RAYCAST}>
                <boxGeometry args={[0.51, 0.33, 0.025]} />
              </mesh>
              <mesh position={[0, 0.76 + y, -0.278]} material={SHARED_MATERIALS.warmAccent} raycast={IGNORE_RAYCAST}>
                <sphereGeometry args={[0.032, 8, 6]} />
              </mesh>
            </React.Fragment>
          ))}
        </group>
      );
    case 's5':
      return (
        <group name="room-four-s5-secret-mailbox" position={[1.72, 0.08, -0.94]} raycast={IGNORE_RAYCAST}>
          <mesh position={[0, 0.37, 0]} material={SHARED_MATERIALS.warmFrame} raycast={IGNORE_RAYCAST}>
            <boxGeometry args={[0.08, 0.72, 0.08]} />
          </mesh>
          <mesh position={[0, 0.88, 0]} material={SHARED_MATERIALS.warmFrame} raycast={IGNORE_RAYCAST}>
            <boxGeometry args={[0.68, 0.43, 0.36]} />
          </mesh>
          <mesh position={[0, 0.99, -0.19]} material={SHARED_MATERIALS.warmPaper} raycast={IGNORE_RAYCAST}>
            <boxGeometry args={[0.38, 0.04, 0.025]} />
          </mesh>
          {!reducedDetail && (
            <mesh position={[0.24, 0.82, -0.2]} material={SHARED_MATERIALS.warmAccent} raycast={IGNORE_RAYCAST}>
              <circleGeometry args={[0.07, 10]} />
            </mesh>
          )}
        </group>
      );
    case 's6':
      return (
        <group name="room-four-s6-lead-type-tray" position={[-1.4, 0.1, 0.72]} raycast={IGNORE_RAYCAST}>
          <mesh position={[0, 0.74, 0]} material={SHARED_MATERIALS.warmWood} raycast={IGNORE_RAYCAST}>
            <boxGeometry args={[0.86, 0.12, 0.6]} />
          </mesh>
          <mesh position={[0, 0.83, 0]} material={SHARED_MATERIALS.warmFrame} raycast={IGNORE_RAYCAST}>
            <boxGeometry args={[0.66, 0.09, 0.42]} />
          </mesh>
          {(reducedDetail ? [-0.18, 0.18] : [-0.24, -0.08, 0.08, 0.24]).map((x, index) => (
            <mesh key={`s6-lead-type-${x}`} position={[x, 0.9, index % 2 === 0 ? -0.1 : 0.1]} material={SHARED_MATERIALS.darkInk} raycast={IGNORE_RAYCAST}>
              <boxGeometry args={[0.08, 0.08, 0.1]} />
            </mesh>
          ))}
        </group>
      );
    case 's7':
      return (
        <group name="room-four-s7-camouflaged-bookshelf" position={[1.48, 0.08, 0.86]} rotation={[0, 0, -0.055]} raycast={IGNORE_RAYCAST}>
          <mesh position={[0, 1.08, 0]} material={SHARED_MATERIALS.warmWood} raycast={IGNORE_RAYCAST}>
            <boxGeometry args={[0.72, 2.16, 0.3]} />
          </mesh>
          {[-0.58, 0, 0.58].map((y) => (
            <mesh key={`s7-shelf-${y}`} position={[0, 1.08 + y, -0.18]} material={SHARED_MATERIALS.warmFrame} raycast={IGNORE_RAYCAST}>
              <boxGeometry args={[0.62, 0.06, 0.08]} />
            </mesh>
          ))}
          {(reducedDetail ? [-0.16, 0.16] : [-0.22, -0.07, 0.08, 0.23]).map((x, index) => (
            <mesh key={`s7-book-${x}`} position={[x, 1.08 + (index % 3 - 1) * 0.58, -0.205]} material={index % 2 === 0 ? SHARED_MATERIALS.warmPaper : SHARED_MATERIALS.darkInk} raycast={IGNORE_RAYCAST}>
              <boxGeometry args={[0.09, 0.34, 0.04]} />
            </mesh>
          ))}
        </group>
      );
    case 's8':
      return (
        <group name="room-four-s8-homeward-journey-trunk" position={[-1.54, 0.08, -0.72]} raycast={IGNORE_RAYCAST}>
          <mesh position={[0, 0.32, 0]} material={SHARED_MATERIALS.warmWood} raycast={IGNORE_RAYCAST}>
            <boxGeometry args={[0.94, 0.5, 0.62]} />
          </mesh>
          <mesh position={[0, 0.62, 0]} material={SHARED_MATERIALS.warmFrame} raycast={IGNORE_RAYCAST}>
            <boxGeometry args={[0.98, 0.13, 0.66]} />
          </mesh>
          {[-0.3, 0.3].map((x) => (
            <mesh key={`s8-trunk-strap-${x}`} position={[x, 0.65, -0.01]} material={SHARED_MATERIALS.warmAccent} raycast={IGNORE_RAYCAST}>
              <boxGeometry args={[0.06, 0.16, 0.68]} />
            </mesh>
          ))}
          {!reducedDetail && (
            <mesh position={[0, 0.71, -0.08]} rotation={[-0.13, 0.1, 0]} material={SHARED_MATERIALS.warmPaper} raycast={IGNORE_RAYCAST}>
              <boxGeometry args={[0.48, 0.025, 0.3]} />
            </mesh>
          )}
        </group>
      );
    default:
      return null;
  }
};

/**
 * The S2 focal object is a static documentary screen. Its image sits within a
 * physical frame; only the existing foot-plaque can open the station modal.
 */
const InternationalForumScreen: React.FC<{
  progressCount: number;
  reducedDetail: boolean;
}> = ({ progressCount, reducedDetail }) => {
  const imageTexture = useTexture('/images/room4/station2/nguyen-ai-quoc-comintern-v-screen.png');
  const screenTexture = useMemo(() => {
    const texture = imageTexture.clone();
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  }, [imageTexture]);

  useEffect(() => () => screenTexture.dispose(), [screenTexture]);

  return (
    <group name="room-four-s2-documentary-screen" raycast={IGNORE_RAYCAST}>
      <mesh position={[-0.4, 0.15, 0]} material={SHARED_MATERIALS.coldFrame} raycast={IGNORE_RAYCAST}>
        <boxGeometry args={[0.9, 0.3, 3.38]} />
      </mesh>
      <mesh position={[-0.4, 0.36, 0]} material={SHARED_MATERIALS.darkInk} raycast={IGNORE_RAYCAST}>
        <boxGeometry args={[0.64, 0.16, 2.92]} />
      </mesh>
      {[-1.12, 1.12].map((z) => (
        <mesh key={`s2-screen-foot-${z}`} position={[0.03, 0.12, z]} material={SHARED_MATERIALS.coldFrame} raycast={IGNORE_RAYCAST}>
          <boxGeometry args={[0.58, 0.17, 0.42]} />
        </mesh>
      ))}

      <mesh position={[-0.34, 1.67, 0]} material={SHARED_MATERIALS.coldFrame} raycast={IGNORE_RAYCAST}>
        <boxGeometry args={[0.18, 2.72, 3.58]} />
      </mesh>
      <mesh position={[-0.23, 1.67, 0]} rotation={[0, Math.PI / 2, 0]} raycast={IGNORE_RAYCAST}>
        <planeGeometry args={[3.26, 2.38]} />
        <meshBasicMaterial map={screenTexture} toneMapped={false} />
      </mesh>
      {[
        { position: [-0.2, 2.94, 0] as const, scale: [0.14, 0.16, 3.58] as const },
        { position: [-0.2, 0.4, 0] as const, scale: [0.14, 0.16, 3.58] as const },
        { position: [-0.2, 1.67, -1.71] as const, scale: [0.14, 2.7, 0.16] as const },
        { position: [-0.2, 1.67, 1.71] as const, scale: [0.14, 2.7, 0.16] as const },
      ].map((framePart, index) => (
        <mesh key={`s2-screen-frame-${index}`} position={framePart.position} material={SHARED_MATERIALS.coldPaper} raycast={IGNORE_RAYCAST}>
          <boxGeometry args={framePart.scale} />
        </mesh>
      ))}

      {!reducedDetail && (
        <mesh position={[-0.18, 3.1, 0]} material={SHARED_MATERIALS.coldAccent} raycast={IGNORE_RAYCAST}>
          <boxGeometry args={[0.05, 0.06, 2.58]} />
        </mesh>
      )}
      {[-0.36, 0, 0.36].map((z, index) => (
        <mesh
          key={`s2-screen-status-${z}`}
          position={[-0.15, 0.48, z]}
          material={index < progressCount ? SHARED_MATERIALS.coldAccent : SHARED_MATERIALS.inactiveLine}
          raycast={IGNORE_RAYCAST}
        >
          <sphereGeometry args={[0.055, 10, 8]} />
        </mesh>
      ))}
    </group>
  );
};

const OrganisationNetwork: React.FC<{ progressCount: number }> = ({ progressCount }) => {
  const nodes: ReadonlyArray<readonly [number, number, number]> = [
    [-1.2, 1.1, 0],
    [0, 2.35, 0],
    [1.2, 1.1, 0],
    [0, 0.55, 0],
  ];
  return (
    <group>
      <mesh position={[0, 1.42, 0]} rotation={[Math.PI / 2, 0, 0]} material={SHARED_MATERIALS.warmFrame}>
        <torusGeometry args={[1.55, 0.09, 10, 48]} />
      </mesh>
      {nodes.map((node, index) => (
        <React.Fragment key={`network-node-${index}`}>
          <mesh
            position={node as [number, number, number]}
            material={
              index === 0 || index <= progressCount
                ? index === 1
                  ? SHARED_MATERIALS.warmAccent
                  : SHARED_MATERIALS.warmPaper
                : SHARED_MATERIALS.darkInk
            }
          >
            <sphereGeometry args={[index === 1 ? 0.24 : 0.18, 16, 12]} />
          </mesh>
          {index > 0 && (
            <Connector
              start={nodes[0]}
              end={node}
              material={index <= progressCount ? SHARED_MATERIALS.warmLine : SHARED_MATERIALS.inactiveLine}
            />
          )}
        </React.Fragment>
      ))}
      <mesh position={[0, 0.2, 0]} material={SHARED_MATERIALS.warmWood}>
        <cylinderGeometry args={[1.2, 1.45, 0.35, 24]} />
      </mesh>
    </group>
  );
};

const PrintingPress: React.FC<{ completed: boolean }> = ({ completed }) => (
  <group>
    {[-0.95, 0.95].map((x) => (
      <mesh key={`press-post-${x}`} position={[x, 1.35, 0]} material={SHARED_MATERIALS.warmFrame}>
        <boxGeometry args={[0.16, 2.45, 1.35]} />
      </mesh>
    ))}
    <mesh position={[0, 2.45, 0]} material={SHARED_MATERIALS.warmFrame}>
      <boxGeometry args={[2.1, 0.18, 1.35]} />
    </mesh>
    {[-0.34, 0.36].map((y) => (
      <mesh key={`press-roller-${y}`} position={[0, 1.65 + y, 0]} rotation={[0, 0, Math.PI / 2]} material={SHARED_MATERIALS.warmAccent}>
        <cylinderGeometry args={[0.24, 0.24, 1.75, 20]} />
      </mesh>
    ))}
    <mesh position={[0, 0.72, 0.05]} material={SHARED_MATERIALS.warmWood}>
      <boxGeometry args={[2.5, 0.18, 1.7]} />
    </mesh>
    <mesh
      position={[0, completed ? 0.92 : 0.84, completed ? 0.78 : 0.05]}
      rotation={[0, completed ? 0.02 : -0.04, 0]}
      material={SHARED_MATERIALS.warmPaper}
    >
      <boxGeometry args={[1.65, 0.035, 1.3]} />
    </mesh>
    {completed && (
      <group position={[0, 0.96, 0.78]} rotation={[0, 0.02, 0]}>
        <mesh position={[0, 0, -0.32]} material={SHARED_MATERIALS.darkInk}>
          <boxGeometry args={[1.12, 0.018, 0.06]} />
        </mesh>
        {[-0.17, 0.03, 0.2].map((z, index) => (
          <mesh key={`newspaper-column-${z}`} position={[index === 1 ? -0.13 : 0.18, 0.015, z]} material={index === 1 ? SHARED_MATERIALS.warmAccent : SHARED_MATERIALS.darkInk}>
            <boxGeometry args={[index === 1 ? 0.72 : 0.92, 0.016, 0.035]} />
          </mesh>
        ))}
      </group>
    )}
    <Connector
      start={[1.02, 2.15, 0.45]}
      end={[1.62, 1.25, 0.7]}
      material={SHARED_MATERIALS.warmLine}
      radius={0.055}
    />
    <mesh position={[1.66, 1.18, 0.72]} material={SHARED_MATERIALS.warmAccent}>
      <sphereGeometry args={[0.13, 14, 10]} />
    </mesh>
    {completed && (
      <>
        <Connector
          start={[0.64, 1.02, 0.78]}
          end={[2.45, 1.38, 1.5]}
          material={SHARED_MATERIALS.warmLine}
          radius={0.035}
        />
        <mesh position={[2.45, 1.38, 1.5]} material={SHARED_MATERIALS.warmAccent}>
          <sphereGeometry args={[0.12, 14, 10]} />
        </mesh>
      </>
    )}
  </group>
);

const ClassroomAssembly: React.FC<{ progressCount: number }> = ({ progressCount }) => (
  <group>
    <mesh position={[0, 1.85, 0.36]} material={SHARED_MATERIALS.warmWood}>
      <boxGeometry args={[3.05, 2.3, 0.16]} />
    </mesh>
    <mesh position={[0, 1.85, 0.24]} material={SHARED_MATERIALS.darkInk}>
      <boxGeometry args={[2.72, 1.92, 0.08]} />
    </mesh>
    {[-1.02, -0.34, 0.34, 1.02].map((x, index) => (
      <React.Fragment key={`class-map-card-${x}`}>
        {index < progressCount && (
          <Connector
            start={[x * 0.55, 2.22, 0.16]}
            end={[x * 0.55, 2.55, 0.16]}
            material={index === 1 ? SHARED_MATERIALS.warmAccentLine : SHARED_MATERIALS.warmLine}
            radius={0.022}
          />
        )}
        <mesh
          position={index < progressCount ? [x * 0.55, 2.04, 0.16] : [x, 0.84, -0.18]}
          material={index < progressCount ? SHARED_MATERIALS.warmPaper : SHARED_MATERIALS.darkInk}
        >
          <boxGeometry args={[0.38, 0.5, 0.05]} />
        </mesh>
        {index < progressCount && (
          <mesh position={[x * 0.55, 2.28, 0.19]} material={index === 1 ? SHARED_MATERIALS.warmAccentLine : SHARED_MATERIALS.darkInk}>
            <boxGeometry args={[0.24, 0.018, 0.025]} />
          </mesh>
        )}
        <mesh
          position={[x * 0.55, 2.55, 0.16]}
          material={index < progressCount ? SHARED_MATERIALS.warmAccent : SHARED_MATERIALS.darkInk}
        >
          <sphereGeometry args={[0.09, 12, 8]} />
        </mesh>
      </React.Fragment>
    ))}
    <mesh position={[0, 0.48, -0.85]} material={SHARED_MATERIALS.warmWood}>
      <boxGeometry args={[1.7, 0.13, 0.65]} />
    </mesh>
  </group>
);

const ReturnMap: React.FC<{
  progressCount: number;
  finaleComplete: boolean;
}> = ({ progressCount, finaleComplete }) => {
  const destinations: ReadonlyArray<readonly [number, number, number]> = [
    [-1.12, 2.72, 0.12],
    [-0.82, 1.25, 0.12],
    [0.95, 2.4, 0.12],
    [1.1, 1.08, 0.12],
  ];
  const hub: readonly [number, number, number] = [0.15, 1.85, 0.12];
  return (
    <group>
      <mesh position={[0, 1.85, 0.3]} material={SHARED_MATERIALS.warmFrame}>
        <boxGeometry args={[3.35, 2.75, 0.2]} />
      </mesh>
      <mesh position={[0, 1.85, 0.18]} material={SHARED_MATERIALS.warmPaper}>
        <boxGeometry args={[3.05, 2.45, 0.06]} />
      </mesh>
      <mesh position={hub as [number, number, number]} material={SHARED_MATERIALS.warmAccent}>
        <sphereGeometry args={[0.16, 14, 10]} />
      </mesh>
      {destinations.map((destination, index) => (
        <React.Fragment key={`return-route-${index}`}>
          <Connector
            start={hub}
            end={destination}
            material={
              index < progressCount
                ? index === 3
                  ? SHARED_MATERIALS.warmAccentLine
                  : SHARED_MATERIALS.warmLine
                : SHARED_MATERIALS.inactiveLine
            }
            radius={0.026}
          />
          <mesh
            position={destination as [number, number, number]}
            material={index < progressCount ? SHARED_MATERIALS.warmAccent : SHARED_MATERIALS.darkInk}
          >
            <sphereGeometry args={[0.11, 12, 8]} />
          </mesh>
        </React.Fragment>
      ))}
      {finaleComplete &&
        RETURN_MAP_MARKERS.map((mapPosition, index) => (
          <mesh
            key={`return-map-marker-${index}`}
            position={mapPosition as [number, number, number]}
            material={SHARED_MATERIALS.warmAccent}
            raycast={IGNORE_RAYCAST}
          >
            <sphereGeometry args={[0.08, 10, 8]} />
          </mesh>
        ))}
      <mesh position={[0, 0.2, 0.3]} material={SHARED_MATERIALS.warmWood}>
        <boxGeometry args={[2.25, 0.32, 0.95]} />
      </mesh>
    </group>
  );
};

const JourneyCardDesk: React.FC<{ collected: boolean }> = ({ collected }) => (
  <group>
    <StudyDesk progressCount={collected ? 3 : 0} />
    <mesh
      position={[0, collected ? 1.54 : 1.38, collected ? 0.1 : -0.03]}
      rotation={[-0.18, 0, collected ? -0.05 : 0]}
      material={collected ? SHARED_MATERIALS.coldLine : SHARED_MATERIALS.coldAccent}
    >
      <boxGeometry args={[1.22, 0.04, 0.74]} />
    </mesh>
    <mesh position={[0, 1.42, -0.08]} rotation={[-0.18, 0, 0]} material={SHARED_MATERIALS.coldPaper}>
      <boxGeometry args={[1.04, 0.035, 0.58]} />
    </mesh>
  </group>
);

const ArtifactAssembly: React.FC<{
  kind: RoomFourStationKind;
  reducedDetail: boolean;
}> = ({ kind, reducedDetail }) => {
  switch (kind) {
    case 'journey-card':
      return <JourneyCardDesk collected />;
    case 'study-desk':
      return <MoscowUniversityBuildingModel reducedDetail={reducedDetail} />;
    case 'forum-globe':
      return <InternationalForumScreen progressCount={3} reducedDetail={reducedDetail} />;
    case 'travel-ticket':
      return <StudyDesk ticket progressCount={3} />;
    case 'mission-desk':
      return <StudyDesk warm mission progressCount={3} />;
    case 'organisation-network':
      return <OrganisationNetwork progressCount={3} />;
    case 'printing-press':
      return <PrintingPress completed />;
    case 'secret-classroom':
      return <ClassroomAssembly progressCount={4} />;
    case 'return-map':
      return <ReturnMap progressCount={4} finaleComplete />;
    default:
      return null;
  }
};

const FocalBackdrop: React.FC<{
  station: RoomFourStationLayout;
  warm: boolean;
  lineMaterial: THREE.Material;
}> = ({ station, warm, lineMaterial }) => {
  const approachDirection = station.stop[0] >= station.object[0] ? 1 : -1;
  return (
    <group
      position={[
        station.object[0] - approachDirection * 1.04,
        0,
        station.object[1],
      ]}
      rotation={[0, approachDirection * Math.PI / 2, 0]}
    >
      <mesh position={[0, 2.15, 0]} material={SHARED_MATERIALS.darkInk}>
        <boxGeometry args={[3.55, 4.25, 0.08]} />
      </mesh>
      <mesh position={[0, 4.18, 0.055]} material={lineMaterial}>
        <boxGeometry args={[3.2, 0.055, 0.035]} />
      </mesh>
      <mesh
        position={[0, 0.16, 0.055]}
        material={warm ? SHARED_MATERIALS.warmWood : SHARED_MATERIALS.coldFrame}
      >
        <boxGeometry args={[3.2, 0.16, 0.08]} />
      </mesh>
    </group>
  );
};

/* Legacy active-station pulse removed with the progress interface.
const ActiveStationBeacon: React.FC<{
  position: readonly [number, number];
  radius: number;
  warm: boolean;
  animated: boolean;
}> = ({ position, radius, warm, animated }) => {
  const ringRef = useRef<THREE.Mesh>(null);
  const elapsed = useRef(0);

  useFrame((_, delta) => {
    const ring = ringRef.current;
    if (!animated || !ring) return;
    elapsed.current += delta;
    const pulse = 1 + Math.sin(elapsed.current * 2.2) * 0.1;
    ring.scale.setScalar(pulse);
    ring.position.y = 0.085 + Math.sin(elapsed.current * 1.7) * 0.012;
  });

  return (
    <mesh
      ref={ringRef}
      position={[position[0], 0.085, position[1]]}
      rotation={[-Math.PI / 2, 0, 0]}
      renderOrder={3}
    >
      <ringGeometry args={[radius + 0.12, radius + 0.19, 36]} />
      <meshBasicMaterial
        color={warm ? WARM.line : COLD.line}
        transparent
        opacity={0.52}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
};

*/
const StationFootPlaque: React.FC<{
  station: RoomFourStationLayout;
  language: 'vi' | 'en';
  onExplore: () => void;
}> = ({ station, language, onExplore }) => {
  const content = ROOM_FOUR_FOOT_PLAQUES[station.id];
  const time = language === 'vi' ? content.timeVi : content.timeEn;
  const event = language === 'vi' ? content.eventVi : content.eventEn;
  const [width] = station.footprint;
  const approachDirection = station.stop[0] >= station.object[0] ? 1 : -1;
  // The plaque rises at 45° and its front surface turns into the central
  // walking lane on either side, so a passing visitor can stop and read it.
  const plaquePitch = -Math.PI / 4;
  const plaqueYaw = approachDirection * Math.PI / 2;

  useEffect(
    () => () => {
      document.body.style.cursor = 'auto';
    },
    [],
  );

  return (
    <group
      name={`room-four-${station.id}-foot-plaque`}
      position={[station.object[0] + approachDirection * (width / 2 + 0.14), 0.29, station.object[1]]}
      rotation={[0, plaqueYaw, 0]}
    >
      <group rotation={[plaquePitch, 0, 0]}>
      <mesh position={[0, 0, 0.04]} material={SHARED_MATERIALS.goldPlaqueGlow} raycast={IGNORE_RAYCAST} renderOrder={2}>
        <boxGeometry args={[2.34, 1.02, 0.025]} />
      </mesh>
      <mesh position={[0, 0, 0]} material={SHARED_MATERIALS.goldPlaqueFrame} raycast={IGNORE_RAYCAST} renderOrder={3}>
        <boxGeometry args={[2.22, 0.94, 0.1]} />
      </mesh>
      <mesh position={[0, 0.13, 0.065]} material={SHARED_MATERIALS.goldPlaqueFace} raycast={IGNORE_RAYCAST} renderOrder={4}>
        <boxGeometry args={[2.02, 0.6, 0.025]} />
      </mesh>
      <mesh position={[0, -0.23, 0.075]} material={SHARED_MATERIALS.goldPlaqueLine} raycast={IGNORE_RAYCAST} renderOrder={5}>
        <boxGeometry args={[2.06, 0.024, 0.03]} />
      </mesh>
      <Text
        position={[-0.92, 0.335, 0.085]}
        anchorX="left"
        anchorY="middle"
        color={GOLD.text}
        fontSize={0.135}
        letterSpacing={0.018}
        raycast={IGNORE_RAYCAST}
      >
        {time}
      </Text>
      <Text
        position={[0, 0.065, 0.085]}
        anchorX="center"
        anchorY="middle"
        color={GOLD.text}
        fontSize={0.1}
        maxWidth={1.84}
        lineHeight={1.1}
        textAlign="center"
        overflowWrap="break-word"
        raycast={IGNORE_RAYCAST}
      >
        {event}
      </Text>
      <mesh
        name={`room-four-${station.id}-explore-button`}
        position={[0, -0.355, 0.086]}
        material={SHARED_MATERIALS.goldPlaqueButton}
        onPointerDown={(pointerEvent) => {
          pointerEvent.stopPropagation();
          onExplore();
        }}
        onPointerOver={(pointerEvent) => {
          pointerEvent.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
        renderOrder={5}
      >
        <boxGeometry args={[1.9, 0.16, 0.06]} />
      </mesh>
      <Text
        position={[0, -0.355, 0.12]}
        anchorX="center"
        anchorY="middle"
        color={GOLD.buttonText}
        fontSize={0.105}
        letterSpacing={0.02}
        raycast={IGNORE_RAYCAST}
      >
        {language === 'vi' ? 'THAM QUAN' : 'EXPLORE'}
      </Text>
      </group>
      {[-0.82, 0.82].map((x) => (
        <mesh
          key={`plaque-post-${x}`}
          position={[x, -0.235, 0]}
          material={SHARED_MATERIALS.goldPlaqueFrame}
          raycast={IGNORE_RAYCAST}
        >
          <boxGeometry args={[0.05, 0.11, 0.06]} />
        </mesh>
      ))}
    </group>
  );
};

const StationBay: React.FC<{
  station: RoomFourStationLayout;
  language: 'vi' | 'en';
  showFocalBackdrop: boolean;
  showPlaque: boolean;
  reducedDetail: boolean;
  onOpen: (station: RoomFourStationLayout) => void;
}> = ({
  station,
  language,
  showFocalBackdrop,
  showPlaque,
  reducedDetail,
  onOpen,
}) => {
  const warm = station.section === 'guangzhou';
  const material = warm ? SHARED_MATERIALS.warmFrame : SHARED_MATERIALS.coldFrame;
  const ringMaterial = warm ? SHARED_MATERIALS.warmLine : SHARED_MATERIALS.coldLine;
  const artifactLineMaterial = warm ? SHARED_MATERIALS.warmAccentLine : SHARED_MATERIALS.coldAccentLine;
  const displayGlowMaterial = warm
    ? SHARED_MATERIALS.warmDisplayGlow
    : SHARED_MATERIALS.coldDisplayGlow;
  const [width, depth] = station.footprint;
  const stopRadius = station.focalLevel === 1 ? 0.42 : 0.32;
  const exploreFromPlaque = useCallback(() => onOpen(station), [onOpen, station]);

  return (
    <group name={`room-four-${station.id}`}>
      {showFocalBackdrop && station.focalLevel === 1 && (
        <FocalBackdrop station={station} warm={warm} lineMaterial={artifactLineMaterial} />
      )}
      <group position={[station.object[0], 0, station.object[1]]}>
        <mesh position={[0, 0.03, 0]} material={material}>
          <boxGeometry args={[width, 0.06, depth]} />
        </mesh>
        <mesh
          position={[0, 0.068, 0]}
          material={displayGlowMaterial}
          raycast={IGNORE_RAYCAST}
          renderOrder={1}
        >
          <boxGeometry args={[width * 0.8, 0.012, depth * 0.8]} />
        </mesh>
        <mesh position={[0, 0.07, 0]} rotation={[-Math.PI / 2, 0, 0]} material={ringMaterial}>
          <ringGeometry args={[Math.max(width, depth) * 0.36, Math.max(width, depth) * 0.39, 48]} />
        </mesh>
        <ArtifactAssembly
          kind={station.kind}
          reducedDetail={reducedDetail}
        />
        <SupplementalStationModel stationId={station.id} reducedDetail={reducedDetail} />
      </group>
      <mesh
        position={[station.stop[0], 0.075, station.stop[1]]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={ringMaterial}
      >
        <ringGeometry args={[stopRadius, stopRadius + 0.055, 32]} />
      </mesh>
      {showPlaque && (
        <StationFootPlaque
          station={station}
          language={language}
          onExplore={exploreFromPlaque}
        />
      )}
    </group>
  );
};

const TransitionCorridor: React.FC<{
  detailed: boolean;
  activated: boolean;
}> = ({
  detailed,
  activated,
}) => (
  <group>
    {[
      { x: -6.6, z: -40.1, rotation: -0.16, color: '#30414b' },
      { x: 6.6, z: -38.1, rotation: 0.16, color: '#3d3b35' },
      { x: -6.6, z: -36.1, rotation: -0.14, color: '#4e3b2f' },
    ].map((wing, index) => (
      <group key={`transition-wing-${wing.z}`} position={[wing.x, 2.35, wing.z]} rotation={[0, wing.rotation, 0]}>
        <mesh>
          <boxGeometry args={[2.5, 4.7, 0.18]} />
          <meshStandardMaterial color={wing.color} roughness={0.82} metalness={0.12} />
        </mesh>
        {detailed &&
          [0.72, 1.3, 1.88].map((y, lineIndex) => (
            <Connector
              key={`transition-map-line-${y}`}
              start={[-0.85, y - 2.35, 0.12]}
              end={[0.85, y - 2.1 + lineIndex * 0.12, 0.12]}
              material={index === 0 ? SHARED_MATERIALS.coldLine : SHARED_MATERIALS.warmLine}
              radius={0.018}
            />
          ))}
      </group>
    ))}
    {activated && (
      <group>
        {[-40, -38.5, -37, -35.5].map((z, index) => (
          <mesh
            key={`transition-direction-${z}`}
            position={[index % 2 === 0 ? -0.22 : 0.22, 0.13, z]}
            rotation={[-Math.PI / 2, 0, 0]}
            material={index < 2 ? SHARED_MATERIALS.coldLine : SHARED_MATERIALS.warmLine}
            raycast={IGNORE_RAYCAST}
          >
            <circleGeometry args={[0.07, 16]} />
          </mesh>
        ))}
      </group>
    )}
  </group>
);

/* Legacy completion threshold removed with the progress interface.
const ThresholdSigns: React.FC<{ language: 'vi' | 'en'; journeyCompleted: boolean }> = ({
  language,
  journeyCompleted,
}) => (
  <group>
    <Html position={[0, 3.85, 4.7]} center sprite distanceFactor={8.5} style={{ pointerEvents: 'none', userSelect: 'none' }}>
      <div
        style={{
          color: journeyCompleted ? '#f2dfb6' : '#8d8372',
          background: 'rgba(24, 20, 17, 0.9)',
          borderTop: `2px solid ${journeyCompleted ? WARM.line : '#4d4640'}`,
          padding: '10px 18px',
          textAlign: 'center',
          whiteSpace: 'nowrap',
          fontFamily: 'Georgia, serif',
        }}
      >
        <div style={{ fontSize: ROOM_FOUR_PHASE_ELEVEN_TYPE_SCALE.exitThresholdPx, letterSpacing: '0.05em', lineHeight: 0.98 }}>
          {journeyCompleted
            ? language === 'vi'
              ? 'HÀNH TRANG ĐÃ SẴN SÀNG'
              : 'THE JOURNEY KIT IS READY'
            : language === 'vi'
              ? 'HOÀN THÀNH TÁM TRẠM'
              : 'COMPLETE ALL EIGHT STATIONS'}
        </div>
        <div style={{ marginTop: 3, color: journeyCompleted ? WARM.line : '#6e665d', fontFamily: 'ui-monospace, monospace', fontSize: 9, letterSpacing: '0.15em' }}>
          {journeyCompleted
            ? language === 'vi'
              ? 'CON ĐƯỜNG VỀ TỔ QUỐC'
              : 'THE ROAD HOME'
            : '1923—1927'}
        </div>
      </div>
    </Html>
  </group>
);

*/
export const RoomFour: React.FC<BaseRoomProps> = ({
  customSettings,
  isVisible = true,
  isInteractive = true,
  lightingContext = 'standalone',
  children,
}) => {
  const { language, settings, setRoomFourInteractionOpen } = useMuseum();
  const [activeStationId, setActiveStationId] = useState<RoomFourStationId | null>(null);
  // The data height (6 m) receives the single approved +1 m shell allowance here.
  const roomHeight = (customSettings?.room_height ?? 6) + 1;
  const resolvedLanguage: 'vi' | 'en' = language === 'en' ? 'en' : 'vi';
  const isUltraLow = settings.preset === 'ultra-low';
  const reducedDetail = settings.preset !== 'medium';
  const ribStride = isUltraLow ? 3 : reducedDetail ? 2 : 1;
  // The stronger entry key is only used while the room is previewed through a
  // neighbouring doorway. Once inside, the lobby receives the exact same
  // global rig as the standalone gallery page.
  const isEntryPreview = lightingContext === 'connected' && !isInteractive;
  const showStationOverlay = isVisible && isInteractive;
  const fillIntensity = isEntryPreview
    ? settings.reducedLights ? 0.58 : 0.72
    : settings.reducedLights ? 0.46 : 0.34;
  const coldKeyPosition: [number, number, number] = isEntryPreview ? [0, 5.3, -66.5] : [0, 5.3, -54];
  const coldKeyIntensity = isEntryPreview ? 48 : 34;
  const coldKeyDistance = isEntryPreview ? 40 : 42;

  const closeInteraction = useCallback(() => {
    setActiveStationId(null);
    setRoomFourInteractionOpen(false);
  }, [setRoomFourInteractionOpen]);

  /* Legacy journey completion handlers, tasks, and progress effects removed.
  const completeJourneyFinale = useCallback(() => {
    setFinalePlaying(false);
    if (!journeyFinaleComplete) addTalkedNpc(roomFourFinaleToken());
    setNotice(
      resolvedLanguage === 'vi'
        ? 'Hành trang đã sẵn sàng — Con đường về Tổ quốc.'
        : 'The journey kit is ready — The road home.',
    );
  }, [addTalkedNpc, journeyFinaleComplete, resolvedLanguage]);

  const replayJourneyFinale = useCallback(() => {
    if (!journeyFinaleComplete || finalePlaying) return;
    setFinalePlaying(true);
    setFinaleRequestId((requestId) => requestId + 1);
    setNotice(
      resolvedLanguage === 'vi'
        ? 'Xem lại: năm hành trang hội tụ về Mạng lưới trở về Tổ quốc.'
        : 'Replay: the five imprints converge on the network homeward.',
    );
  }, [finalePlaying, journeyFinaleComplete, resolvedLanguage]);

  */
  const openStation = useCallback(
    (station: RoomFourStationLayout) => {
      setActiveStationId(station.id);
      setRoomFourInteractionOpen(true);
      /*
      if (!isNear) {
        setNotice(
          resolvedLanguage === 'vi'
            ? 'Hãy đến gần vật thể trung tâm của trạm để khám phá.'
            : 'Move closer to the station’s central object to explore it.',
        );
        return;
      }

      const alreadyCompleted = journeyProgress.includes(roomFourCompletionToken(station.id));
      if (!alreadyCompleted && station.id !== nextStationId) {
        const nextContent = nextStationId ? ROOM_FOUR_JOURNEY_CONTENT[nextStationId] : null;
        setNotice(
          nextContent
            ? resolvedLanguage === 'vi'
              ? `Hành trình tiếp tục tại ${nextContent.eyebrowVi}.`
              : `The journey continues at ${nextContent.eyebrowEn}.`
            : resolvedLanguage === 'vi'
              ? 'Hành trình đã hoàn thành.'
              : 'The journey is complete.',
        );
        setActiveStationId(station.id);
        setRoomFourInteractionOpen(true);
        return;
      }

      setNotice(null);
      setActiveStationId(station.id);
      setRoomFourInteractionOpen(true);
      */
    },
    [setRoomFourInteractionOpen],
  );

  /*
  const openJourneyCard = useCallback(() => {
    if (!journeyProgress.includes(roomFourCompletionToken('card'))) return;
    setNotice(null);
    setActiveStationId('card');
    setRoomFourInteractionOpen(true);
  }, [journeyProgress, setRoomFourInteractionOpen]);

  const activateJourneyLink = useCallback(
    (sealId: RoomFourSealId) => {
      const link = ROOM_FOUR_SEAL_LINKS[sealId];
      if (!link || !journeyProgress.includes(roomFourSealToken(sealId))) return;
      const currentTargetIndex =
        activeJourneyLink?.sealId === sealId
          ? link.targetStationIds.indexOf(activeJourneyLink.targetStationId)
          : -1;
      const targetStationId =
        link.targetStationIds[(currentTargetIndex + 1) % link.targetStationIds.length];
      if (!targetStationId) return;

      const requestId = journeyLinkRequestId + 1;
      setJourneyLinkRequestId(requestId);
      setActiveJourneyLink({
        sealId,
        sourceStationId: link.sourceStationId,
        targetStationId,
        requestId,
      });
      setNotice(
        resolvedLanguage === 'vi'
          ? `${ROOM_FOUR_SEALS.find((seal) => seal.id === sealId)?.labelVi} → ${ROOM_FOUR_JOURNEY_CONTENT[targetStationId].eyebrowVi}`
          : `${ROOM_FOUR_SEALS.find((seal) => seal.id === sealId)?.labelEn} → ${ROOM_FOUR_JOURNEY_CONTENT[targetStationId].eyebrowEn}`,
      );
    },
    [activeJourneyLink, journeyLinkRequestId, journeyProgress, resolvedLanguage],
  );

  const performStationStep = useCallback(
    (stationId: RoomFourStationId, stepIndex: number) => {
      const stationContent = ROOM_FOUR_JOURNEY_CONTENT[stationId];
      const completedSteps = getRoomFourStationProgress(journeyProgress, stationId);
      if (
        journeyProgress.includes(roomFourCompletionToken(stationId)) ||
        stationId !== nextStationId ||
        stepIndex !== completedSteps
      ) {
        return;
      }

      const step = stationContent.steps[stepIndex];
      if (!step) return;
      addTalkedNpc(roomFourStepToken(stationId, step.id));

      if (stepIndex === stationContent.steps.length - 1) {
        stationContent.sealIds.forEach((sealId) => addTalkedNpc(roomFourSealToken(sealId)));
        addTalkedNpc(roomFourCompletionToken(stationId));

        const firstLinkedSeal = stationContent.sealIds.find((sealId) => ROOM_FOUR_SEAL_LINKS[sealId]);
        if (firstLinkedSeal) {
          const link = ROOM_FOUR_SEAL_LINKS[firstLinkedSeal];
          const targetStationId = link?.targetStationIds[0];
          if (link && targetStationId) {
            const requestId = journeyLinkRequestId + 1;
            setJourneyLinkRequestId(requestId);
            setActiveJourneyLink({
              sealId: firstLinkedSeal,
              sourceStationId: link.sourceStationId,
              targetStationId,
              requestId,
            });
          }
        }

        const nextProgress = [
          ...journeyProgress,
          roomFourStepToken(stationId, step.id),
          ...stationContent.sealIds.map(roomFourSealToken),
          roomFourCompletionToken(stationId),
        ];
        if (stationId === 's8' && isRoomFourFinaleReady(nextProgress)) {
          closeInteraction();
          if (shouldAnimateFinale) {
            setFinalePlaying(true);
            setFinaleRequestId((requestId) => requestId + 1);
            setNotice(
              resolvedLanguage === 'vi'
                ? 'Năm hành trang đang hội tụ về Mạng lưới trở về Tổ quốc.'
                : 'Five imprints are converging on the network homeward.',
            );
          } else {
            addTalkedNpc(roomFourFinaleToken());
            setNotice(
              resolvedLanguage === 'vi'
                ? 'Hành trang đã sẵn sàng — Con đường về Tổ quốc.'
                : 'The journey kit is ready — The road home.',
            );
          }
        }
      }
    },
    [
      addTalkedNpc,
      closeInteraction,
      journeyLinkRequestId,
      journeyProgress,
      nextStationId,
      resolvedLanguage,
      shouldAnimateFinale,
    ],
  );

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 3200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    if (!activeJourneyLink || useStaticJourneyLinks) return;
    const timer = window.setTimeout(
      () => setActiveJourneyLink((current) =>
        current?.requestId === activeJourneyLink.requestId ? null : current,
      ),
      JOURNEY_LINK_DURATION_SECONDS * 1000,
    );
    return () => window.clearTimeout(timer);
  }, [activeJourneyLink, useStaticJourneyLinks]);

  // Resume an interrupted first finale only when the visitor is back in Room4.
  // The persisted finale token prevents this from replaying after completion.
  useEffect(() => {
    if (!isVisible || !journeyFinaleReady || journeyFinaleComplete || finalePlaying) return;
    const timer = window.setTimeout(() => {
      if (shouldAnimateFinale) {
        setFinalePlaying(true);
        setFinaleRequestId((requestId) => requestId + 1);
        return;
      }
      completeJourneyFinale();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [
    completeJourneyFinale,
    finalePlaying,
    isVisible,
    journeyFinaleComplete,
    journeyFinaleReady,
    shouldAnimateFinale,
  ]);

  useEffect(() => {
    if (!finalePlaying || shouldAnimateFinale) return;
    const timer = window.setTimeout(completeJourneyFinale, 0);
    return () => window.clearTimeout(timer);
  }, [completeJourneyFinale, finalePlaying, shouldAnimateFinale]);

  */
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && activeStationId) closeInteraction();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [activeStationId, closeInteraction]);

  useEffect(
    () => () => {
      setRoomFourInteractionOpen(false);
      document.body.style.cursor = 'auto';
    },
    [setRoomFourInteractionOpen],
  );

  useEffect(() => {
    if (isVisible || !activeStationId) return;
    const timer = window.setTimeout(closeInteraction, 0);
    return () => window.clearTimeout(timer);
  }, [activeStationId, closeInteraction, isVisible]);

  return (
    <group name="room-four-soviet-guangzhou" visible={isVisible}>
      <RoomShell roomHeight={roomHeight} ribStride={ribStride} />
      <RoomFourHistoricalFlags language={resolvedLanguage} visible={!activeStationId} />
      <RoomFourHistoricalQuotes language={resolvedLanguage} visible={!activeStationId} />

      {/* Three-light budget: brighter fill plus two broad keys cover every display bay. */}
      <hemisphereLight
        color="#8da6b2"
        groundColor="#12191b"
        intensity={fillIntensity}
      />
      {!settings.reducedLights && (
        <>
          <pointLight position={coldKeyPosition} color="#b9d8e3" intensity={coldKeyIntensity} distance={coldKeyDistance} decay={2} />
          <pointLight position={[0, 5.3, -14]} color="#e2a65f" intensity={42} distance={56} decay={2} />
        </>
      )}
      {settings.reducedLights && isEntryPreview && (
        <pointLight position={coldKeyPosition} color="#b9d8e3" intensity={24} distance={34} decay={2} />
      )}

      <RouteSpine reducedDetail={reducedDetail} />
      {ROOM_FOUR_STATIONS.map((station) => (
        <StationBay
          key={station.id}
          station={station}
          language={resolvedLanguage}
          showFocalBackdrop={!isUltraLow}
          showPlaque={showStationOverlay && !activeStationId}
          reducedDetail={isUltraLow}
          onOpen={isInteractive ? openStation : () => undefined}
        />
      ))}
      <TransitionCorridor detailed={!reducedDetail} activated />
      {showStationOverlay && (
        <RoomFourJourneyOverlay
          language={resolvedLanguage}
          activeStationId={activeStationId}
          onClose={closeInteraction}
        />
      )}
      {children}
    </group>
  );
};

export default RoomFour;
