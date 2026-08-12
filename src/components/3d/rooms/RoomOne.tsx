import React, { useCallback, useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Edges, Html, RoundedBox, useTexture } from '@react-three/drei';
import { useMuseum } from '@/context/MuseumContext';
import { BaseRoom, BaseRoomProps } from './BaseRoom';
import type { Exhibit } from '@/lib/db';

const REQUIRED_CLUES_FOR_CENTRAL_ARCHIVE = [
  'exhibit-coupon',
  'exhibit-world-1911-1917',
  'exhibit-versailles-1919',
  'exhibit-lenin-theses-1920',
  'exhibit-tours-1920',
  'exhibit-guangzhou-1925-1927',
];

const CentralArchiveShowcase: React.FC<{
  exhibit: Exhibit;
  unlocked: boolean;
  collectedCount: number;
  onOpen: () => void;
}> = ({ exhibit, unlocked, collectedCount, onOpen }) => {
  const texture = useTexture(exhibit.thumbnail_url);

  const openExhibit = (event: { stopPropagation: () => void }) => {
    event.stopPropagation();
    if (!unlocked) return;
    onOpen();
  };

  return (
    <group
      position={[0, 0, 0]}
      onClick={openExhibit}
      onPointerOver={() => { if (unlocked) document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = 'default'; }}
    >
      {/* Bóng đổ mềm và chân đế bo góc nhiều lớp */}
      <mesh position={[0, 0.035, 0]} receiveShadow>
        <boxGeometry args={[4.85, 0.07, 2.95]} />
        <meshStandardMaterial color="#100d0b" roughness={0.9} />
      </mesh>
      <RoundedBox args={[4.65, 0.72, 2.75]} radius={0.14} smoothness={5} position={[0, 0.42, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#241712" roughness={0.36} metalness={0.08} />
        <Edges color="#0f0907" threshold={20} />
      </RoundedBox>
      <RoundedBox args={[4.45, 0.13, 2.57]} radius={0.055} smoothness={4} position={[0, 0.81, 0]} castShadow>
        <meshStandardMaterial color="#9a7139" roughness={0.24} metalness={0.72} />
      </RoundedBox>
      <RoundedBox args={[4.22, 0.17, 2.34]} radius={0.06} smoothness={4} position={[0, 0.94, 0]} castShadow>
        <meshStandardMaterial color="#d7c39c" roughness={0.5} metalness={0.08} />
      </RoundedBox>

      {/* Khung tài liệu và ảnh đặt đúng chiều, hơi nâng khỏi mặt bệ */}
      <RoundedBox args={[3.25, 0.075, 2.2]} radius={0.045} smoothness={4} position={[0, 1.055, 0]} castShadow>
        <meshStandardMaterial color="#33241b" roughness={0.3} metalness={0.42} />
      </RoundedBox>
      <mesh
        position={[0, 1.15, 0]}
        rotation={[-Math.PI / 2, 0, Math.PI]}
        renderOrder={2}
      >
        <planeGeometry args={[3.05, 2.0]} />
        <meshBasicMaterial
          map={texture}
          toneMapped={false}
          side={THREE.DoubleSide}
          polygonOffset
          polygonOffsetFactor={-4}
          polygonOffsetUnits={-4}
        />
      </mesh>

      {/* Bốn mặt kính riêng biệt giúp tủ trong và nhẹ hơn khối kính đặc */}
      {[-2.08, 2.08].map((x) => (
        <mesh key={`glass-side-${x}`} position={[x, 1.54, 0]}>
          <boxGeometry args={[0.025, 1.02, 2.3]} />
          <meshPhysicalMaterial color="#d9ffff" transparent opacity={0.18} roughness={0.04} transmission={0.9} thickness={0.04} depthWrite={false} />
        </mesh>
      ))}
      {[-1.14, 1.14].map((z) => (
        <mesh key={`glass-front-${z}`} position={[0, 1.54, z]}>
          <boxGeometry args={[4.18, 1.02, 0.025]} />
          <meshPhysicalMaterial color="#d9ffff" transparent opacity={0.16} roughness={0.04} transmission={0.9} thickness={0.04} depthWrite={false} />
        </mesh>
      ))}
      <mesh position={[0, 2.055, 0]}>
        <boxGeometry args={[4.18, 0.03, 2.3]} />
        <meshPhysicalMaterial color="#efffff" transparent opacity={0.14} roughness={0.03} transmission={0.94} thickness={0.035} depthWrite={false} />
      </mesh>

      {/* Khung đồng mảnh ở các góc và viền mái kính */}
      {[[-2.1, -1.16], [-2.1, 1.16], [2.1, -1.16], [2.1, 1.16]].map(([x, z], index) => (
        <mesh key={`corner-${index}`} position={[x, 1.55, z]} castShadow>
          <cylinderGeometry args={[0.035, 0.035, 1.08, 8]} />
          <meshStandardMaterial color="#6f5738" metalness={0.82} roughness={0.2} />
        </mesh>
      ))}
      {[-1.16, 1.16].map((z) => (
        <mesh key={`top-rail-z-${z}`} position={[0, 2.07, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.03, 0.03, 4.22, 8]} />
          <meshStandardMaterial color="#806440" metalness={0.82} roughness={0.2} />
        </mesh>
      ))}
      {[-2.1, 2.1].map((x) => (
        <mesh key={`top-rail-x-${x}`} position={[x, 2.07, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 2.34, 8]} />
          <meshStandardMaterial color="#806440" metalness={0.82} roughness={0.2} />
        </mesh>
      ))}

      {/* Ánh sáng bảo tàng dịu bên trong tủ */}
      <pointLight position={[-1.45, 1.82, 0.68]} color="#ffd98a" intensity={0.34} distance={3.4} decay={2} />
      <pointLight position={[1.45, 1.82, -0.68]} color="#ffd98a" intensity={0.34} distance={3.4} decay={2} />

      {/* Bảng khóa đồng ở mặt trước, màu trạng thái thay đổi khi đủ bằng chứng */}
      <RoundedBox args={[0.72, 0.42, 0.15]} radius={0.065} smoothness={4} position={[0, 1.3, 1.22]} castShadow>
        <meshStandardMaterial color="#3a2b20" roughness={0.28} metalness={0.66} />
      </RoundedBox>
      <mesh position={[0, 1.31, 1.305]}>
        <circleGeometry args={[0.105, 24]} />
        <meshStandardMaterial
          color={unlocked ? '#22c55e' : '#dc2626'}
          emissive={unlocked ? '#16a34a' : '#b91c1c'}
          emissiveIntensity={unlocked ? 1.2 : 0.72}
        />
      </mesh>
      <pointLight position={[0, 1.31, 1.46]} color={unlocked ? '#4ade80' : '#ef4444'} intensity={0.22} distance={1.2} />

      <Html center position={[0, 2.36, 0]} distanceFactor={9} style={{ pointerEvents: 'none' }}>
        <div style={{
          minWidth: 250,
          padding: '10px 16px',
          borderRadius: 999,
          border: `1px solid ${unlocked ? '#4ade80' : '#f59e0b'}`,
          background: 'linear-gradient(135deg, rgba(15,23,42,.96), rgba(36,23,18,.95))',
          color: unlocked ? '#86efac' : '#fde68a',
          fontSize: 12,
          fontWeight: 700,
          textAlign: 'center',
          whiteSpace: 'nowrap',
          boxShadow: `0 8px 28px ${unlocked ? 'rgba(34,197,94,.2)' : 'rgba(245,158,11,.18)'}`,
        }}>
          {unlocked ? '🔓 Đã mở khóa · Nhấp để khám phá HỘI TỤ' : `🔒 Tư liệu trung tâm · Đã thu thập ${collectedCount}/6`}
        </div>
      </Html>
    </group>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// ĐỊNH NGHĨA GEOMETRIES & MATERIALS DÙNG CHUNG ĐỂ TRÁNH GIẬT LAG WEBGL
// ═══════════════════════════════════════════════════════════════════════════
const postCylinderGeom = new THREE.CylinderGeometry(0.055, 0.07, 0.96, 8);
const postSphereGeom   = new THREE.SphereGeometry(0.13, 8, 8);
const postBaseGeom     = new THREE.CylinderGeometry(0.22, 0.28, 0.08, 10);
const ropeMainGeom     = new THREE.CylinderGeometry(0.045, 0.045, 1.0, 8);
const ropeThinGeom     = new THREE.CylinderGeometry(0.028, 0.028, 1.0, 8);

const benchBoxGeom        = new THREE.BoxGeometry(3.2, 0.08, 0.8);
const benchLegGeom        = new THREE.BoxGeometry(0.15, 0.4, 0.7);
const centralBenchTopGeom  = new THREE.BoxGeometry(4.0, 0.12, 0.82);
const centralBenchBackGeom = new THREE.BoxGeometry(4.0, 0.12, 0.72);
const centralBenchLegGeom  = new THREE.BoxGeometry(0.16, 0.5, 0.16);

const tableTopGeom   = new THREE.CylinderGeometry(0.42, 0.46, 0.08, 10);
const tableLegGeom   = new THREE.CylinderGeometry(0.055, 0.075, 0.64, 8);
const tableBaseGeom  = new THREE.CylinderGeometry(0.28, 0.34, 0.06, 8);
const vaseBodyGeom   = new THREE.CylinderGeometry(0.09, 0.13, 0.26, 8);
const vaseMouthGeom  = new THREE.SphereGeometry(0.11, 8, 8);
const flowerStemGeom = new THREE.CylinderGeometry(0.008, 0.009, 0.3, 8);
const flowerBudGeom  = new THREE.SphereGeometry(0.045, 8, 8);
const pedestalBaseGeom = new THREE.CylinderGeometry(1.35, 1.6, 0.78, 32);
const pedestalTopGeom = new THREE.CylinderGeometry(1.5, 1.35, 0.2, 32);
const videoScreenGeom = new THREE.PlaneGeometry(3.6, 2.03);

const postMat     = new THREE.MeshStandardMaterial({ color: '#2a2119', roughness: 0.28, metalness: 0.65 });
const metalMat    = new THREE.MeshStandardMaterial({ color: '#c59b45', roughness: 0.22, metalness: 0.85 });
const ropeMat     = new THREE.MeshStandardMaterial({ color: '#9f1239', roughness: 0.55, metalness: 0.05 });
const ropeThinMat = new THREE.MeshStandardMaterial({ color: '#7f1d1d', roughness: 0.62, metalness: 0.03 });

const benchMat            = new THREE.MeshStandardMaterial({ color: '#4e2e1e', roughness: 0.3 });
const benchLegMat         = new THREE.MeshStandardMaterial({ color: '#361f14', roughness: 0.5 });
const centralBenchTopMat  = new THREE.MeshStandardMaterial({ color: '#5a3421', roughness: 0.38 });
const centralBenchBackMat = new THREE.MeshStandardMaterial({ color: '#4a2b1b', roughness: 0.42 });
const centralBenchLegMat  = new THREE.MeshStandardMaterial({ color: '#2d1a11', roughness: 0.55 });

const tableTopMat      = new THREE.MeshStandardMaterial({ color: '#4b2a19', roughness: 0.42 });
const tableLegMat      = new THREE.MeshStandardMaterial({ color: '#2f1a10', roughness: 0.55 });
const vaseBodyMat      = new THREE.MeshStandardMaterial({ color: '#8d6e63', roughness: 0.5 });
const vaseMouthMat     = new THREE.MeshStandardMaterial({ color: '#a1887f', roughness: 0.55 });
const flowerStemMat    = new THREE.MeshStandardMaterial({ color: '#2f5d3a', roughness: 0.7 });
const flowerBudRedMat  = new THREE.MeshStandardMaterial({ color: '#ef4444', roughness: 0.6 });
const flowerBudPinkMat = new THREE.MeshStandardMaterial({ color: '#f8b4c4', roughness: 0.6 });
const pedestalBaseMat = new THREE.MeshStandardMaterial({ color: '#4a2b1b', roughness: 0.55, metalness: 0.05 });
const pedestalTopMat = new THREE.MeshStandardMaterial({ color: '#c59b45', roughness: 0.32, metalness: 0.45 });

const videoControlButtonStyle: React.CSSProperties = {
  width: 30,
  height: 30,
  padding: 0,
  borderRadius: 999,
  border: '1px solid rgba(250,204,21,0.45)',
  background: 'rgba(30,41,59,0.92)',
  color: '#fde68a',
  fontSize: 14,
  fontWeight: 800,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  lineHeight: 1,
};

const RoomOneVideoPedestal: React.FC<{ isVisible: boolean }> = ({ isVisible }) => {
  const [videoFailed, setVideoFailed] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(20);
  const posterTexture = useTexture('/videos/room1-preview-5s.jpg');

  useEffect(() => {
    posterTexture.colorSpace = THREE.SRGBColorSpace;
  }, [posterTexture]);

  const video = useMemo(() => {
    if (typeof document === 'undefined' || !isVisible || videoFailed) return null;
    const el = document.createElement('video');
    el.src = '/videos/room1-pedestal-video.mp4?v=room1-remix-20s-720p30-20260811';
    el.crossOrigin = 'anonymous';
    el.loop = true;
    el.muted = true;
    el.volume = 1;
    el.playsInline = true;
    el.preload = 'auto';
    return el;
  }, [isVisible, videoFailed]);

  const videoTexture = useMemo(() => {
    if (!video) return null;
    const texture = new THREE.VideoTexture(video);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    return texture;
  }, [video]);

  const toggleAudioAndPlay = useCallback(() => {
    if (!video || !isVisible) return;
    const nextAudioEnabled = !audioEnabled;
    setAudioEnabled(nextAudioEnabled);
    video.muted = !nextAudioEnabled;
    video.volume = 1;
    void video.play().catch(() => undefined);
  }, [video, isVisible, audioEnabled]);

  const togglePlay = useCallback(() => {
    if (!video) return;
    if (video.paused) {
      void video.play().catch(() => undefined);
    } else {
      video.pause();
    }
  }, [video]);

  const seekBy = useCallback((seconds: number) => {
    if (!video) return;
    const safeDuration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : duration;
    video.currentTime = THREE.MathUtils.clamp(video.currentTime + seconds, 0, safeDuration);
    setCurrentTime(video.currentTime);
  }, [video, duration]);

  const seekTo = useCallback((seconds: number) => {
    if (!video) return;
    const safeDuration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : duration;
    video.currentTime = THREE.MathUtils.clamp(seconds, 0, safeDuration);
    setCurrentTime(video.currentTime);
  }, [video, duration]);

  useEffect(() => {
    if (!video) return;
    setVideoReady(false);

    const handleVideoError = () => {
      video.pause();
      setVideoFailed(true);
    };
    const markVideoReady = () => {
      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        setVideoReady(true);
      }
    };
    const syncVideoState = () => {
      setIsPlaying(!video.paused);
      setCurrentTime(video.currentTime || 0);
      if (Number.isFinite(video.duration) && video.duration > 0) {
        setDuration(video.duration);
      }
    };
    const playVideo = () => {
      if (!isVisible) return;
      video.muted = !audioEnabled;
      void video.play().catch(() => undefined);
    };

    video.addEventListener('error', handleVideoError);
    video.addEventListener('loadeddata', playVideo);
    video.addEventListener('canplay', playVideo);
    video.addEventListener('playing', markVideoReady);
    video.addEventListener('timeupdate', markVideoReady);
    video.addEventListener('loadedmetadata', syncVideoState);
    video.addEventListener('play', syncVideoState);
    video.addEventListener('pause', syncVideoState);
    video.addEventListener('timeupdate', syncVideoState);

    if (isVisible) {
      video.load();
      playVideo();
    } else {
      video.pause();
    }
    return () => {
      video.removeEventListener('error', handleVideoError);
      video.removeEventListener('loadeddata', playVideo);
      video.removeEventListener('canplay', playVideo);
      video.removeEventListener('playing', markVideoReady);
      video.removeEventListener('timeupdate', markVideoReady);
      video.removeEventListener('loadedmetadata', syncVideoState);
      video.removeEventListener('play', syncVideoState);
      video.removeEventListener('pause', syncVideoState);
      video.removeEventListener('timeupdate', syncVideoState);
    };
  }, [video, isVisible, audioEnabled]);

  useFrame(() => {
    if (videoTexture && video?.readyState && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      videoTexture.needsUpdate = true;
    }
  });

  useEffect(() => {
    return () => {
      video?.pause();
      videoTexture?.dispose();
    };
  }, [video, videoTexture]);

  return (
    <group position={[0, 0, 0]}>
      <mesh geometry={pedestalBaseGeom} material={pedestalBaseMat} position={[0, 0.39, 0]} />
      <mesh geometry={pedestalTopGeom} material={pedestalTopMat} position={[0, 0.88, 0]} />
      <mesh position={[0, 1.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.72, 1.18, 48]} />
        <meshBasicMaterial color="#facc15" transparent opacity={0.38} side={THREE.DoubleSide} />
      </mesh>
      <group position={[0, 2.85, -0.24]} rotation={[-0.06, 0, 0]}>
        <mesh geometry={videoScreenGeom} position={[0, 0, 0.035]}>
          {videoReady && videoTexture ? (
            <meshBasicMaterial map={videoTexture} toneMapped={false} side={THREE.DoubleSide} />
        ) : (
          <meshBasicMaterial map={posterTexture} toneMapped={false} side={THREE.DoubleSide} />
        )}
      </mesh>
        {false && !audioEnabled && (
          <Html position={[0, -1.25, 0.12]} center transform distanceFactor={8} occlude={false}>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                toggleAudioAndPlay();
              }}
              style={{
                padding: '8px 14px',
                borderRadius: '999px',
                border: '1px solid rgba(250,204,21,0.55)',
                background: 'rgba(15,23,42,0.88)',
                color: '#fde68a',
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: '0.04em',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                boxShadow: '0 10px 24px rgba(0,0,0,0.35)',
              }}
            >
              🔊 Bật tiếng video
            </button>
          </Html>
        )}
        <Html position={[0, -1.65, 0.12]} center distanceFactor={8} occlude={false}>
          <div
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => event.stopPropagation()}
            style={{
              width: 210,
              padding: '7px 9px',
              borderRadius: 999,
              border: '1px solid rgba(250,204,21,0.5)',
              background: 'rgba(15,23,42,0.72)',
              color: '#fde68a',
              boxShadow: '0 8px 18px rgba(0,0,0,0.28)',
              userSelect: 'none',
              backdropFilter: 'blur(8px)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button type="button" onClick={() => seekBy(-5)} style={videoControlButtonStyle} title="Tua lùi 5 giây">⏪</button>
              <button type="button" onClick={togglePlay} style={videoControlButtonStyle}>
                {isPlaying ? '⏸' : '▶'}
              </button>
              <button type="button" onClick={() => seekBy(5)} style={videoControlButtonStyle} title="Tua tới 5 giây">⏩</button>
              <button
                type="button"
                onClick={toggleAudioAndPlay}
                style={videoControlButtonStyle}
                title={audioEnabled ? 'Tắt tiếng' : 'Bật tiếng'}
              >
                {audioEnabled ? '🔊' : '🔇'}
              </button>
              <input
                type="range"
                min={0}
                max={duration || 20}
                step={0.1}
                value={Math.min(currentTime, duration || 20)}
                onChange={(event) => seekTo(Number(event.currentTarget.value))}
                style={{ width: 64, accentColor: '#facc15', cursor: 'pointer' }}
                title={`${Math.floor(currentTime)}s / ${Math.floor(duration || 20)}s`}
              />
            </div>
          </div>
        </Html>
      </group>
      <pointLight position={[0, 1.24, -0.25]} intensity={isVisible ? 0.85 : 0} distance={3.8} color="#fef3c7" />
      <pointLight position={[0, 2.75, -0.6]} intensity={isVisible ? 0.55 : 0} distance={5.2} color="#fff7d6" />
    </group>
  );
};

const VelvetRopeBarrier: React.FC<{
  side: 'left' | 'right';
  zPoints: number[];
  xOffset?: number;
  zOffset?: number;
  onClick?: () => void;
}> = ({ side, zPoints, xOffset = 0, zOffset = 0, onClick }) => {
  const x = (side === 'left' ? -10.55 : 10.55) + xOffset;
  const adjustedZPoints = zPoints.map(z => z + zOffset);

  return (
    <group onClick={(e) => { e.stopPropagation(); onClick?.(); }}>
      {adjustedZPoints.map((z) => (
        <group key={`${side}-post-${z}`} position={[x, 0, z]}>
          <mesh geometry={postCylinderGeom} material={postMat} position={[0, 0.48, 0]} />
          <mesh geometry={postSphereGeom} material={metalMat} position={[0, 0.98, 0]} />
          <mesh geometry={postBaseGeom} material={postMat} position={[0, 0.06, 0]} />
        </group>
      ))}

      {adjustedZPoints.slice(0, -1).map((z, index) => {
        const nextZ = adjustedZPoints[index + 1];
        const midZ = (z + nextZ) / 2;
        const length = Math.abs(nextZ - z);

        return (
          <group key={`${side}-rope-${z}-${nextZ}`}>
            <mesh 
              geometry={ropeMainGeom} 
              material={ropeMat} 
              position={[x, 0.94, midZ]} 
              rotation={[Math.PI / 2, 0, 0]} 
              scale={[1, length, 1]} 
            />
            {/* Dây phụ thấp hơn tạo cảm giác dây nhung có độ dày */}
            <mesh 
              geometry={ropeThinGeom} 
              material={ropeThinMat} 
              position={[x, 0.82, midZ]} 
              rotation={[Math.PI / 2, 0, 0]} 
              scale={[1, length * 0.96, 1]} 
            />
          </group>
        );
      })}
    </group>
  );
};

type RoomOneProps = BaseRoomProps & {
  ropeBarriersConfig?: string;
  centralExhibit?: Exhibit;
};

export const RoomOne: React.FC<RoomOneProps> = ({ 
  galleryId, 
  customSettings, 
  isVisible = true,
  onRopeClick,
  ropeBarriersConfig,
  centralExhibit,
}) => {
  const {
    activeGallery,
    cluesCollected,
    setSelectedExhibit,
    setExhibitModalMode,
  } = useMuseum();
  const collectedRequiredClues = REQUIRED_CLUES_FOR_CENTRAL_ARCHIVE.filter((id) => cluesCollected.includes(id)).length;
  const isCentralArchiveUnlocked = collectedRequiredClues === REQUIRED_CLUES_FOR_CENTRAL_ARCHIVE.length;

  // Parse config riêng từng dây từ customSettings hoặc DB
  // Thứ tự: [0]=trái-18, [1]=trái-8, [2]=trái+2, [3]=phải-18, [4]=phải-8, [5]=phải+2
  const DEFAULT_ROPE = { xOffset: 0, zOffset: 0 };
  let ropeConfigs: Array<{ xOffset: number; zOffset: number }> = Array(6).fill(DEFAULT_ROPE);
  const settingsWithRopes = customSettings as (typeof customSettings & { rope_barriers_config?: string });
  try {
    const raw = ropeBarriersConfig ?? settingsWithRopes?.rope_barriers_config ?? activeGallery?.rope_barriers_config;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length === 6) ropeConfigs = parsed;
    }
  } catch { /* dùng mặc định */ }

  const roomHeight = customSettings?.room_height ?? activeGallery?.room_height ?? 6;
  const wallColor = customSettings?.wall_color ?? activeGallery?.wall_color ?? '#8a1923';
  const wainscotingColor = customSettings?.wainscoting_color ?? activeGallery?.wainscoting_color ?? '#eae5dc';

  const overriddenSettings = {
    room_width: customSettings?.room_width ?? activeGallery?.room_width ?? 24,
    room_length: customSettings?.room_length ?? activeGallery?.room_length ?? 46,
    room_height: roomHeight,
    floor_color: customSettings?.floor_color ?? '#3d2516', // Sàn gỗ tối mộc mạc
    wall_color: wallColor,
    wainscoting_color: wainscotingColor,
    floor_type: (customSettings?.floor_type ?? 'wood') as 'wood' | 'marble' | 'carpet',
  };

  return (
    <BaseRoom galleryId={galleryId} customSettings={overriddenSettings} isVisible={isVisible}>
      <RoomOneVideoPedestal isVisible={isVisible} />

      {/* 3. GHẾ GỖ DÀI CHO KHÁCH NGHỈ (Z = -12.0 & Z = 12.0) */}
      {[-12.0, 12.0].map((z) => (
        <group key={z} position={[0, 0, z]}>
          <mesh geometry={benchBoxGeom} material={benchMat} position={[0, 0.45, 0]} />
          {[-1.4, 1.4].map((x, i) => (
            <mesh key={i} geometry={benchLegGeom} material={benchLegMat} position={[x, 0.2, 0]} />
          ))}
        </group>
      ))}

      {/* 4. CỤM GHẾ NGỒI GIỮA PHÒNG (phân bố đều tại Z = -4.0, Z = 4.0) */}
      {[-4.0, 4.0].map((z, index) => (
        <group key={`central-bench-${z}`} position={[0, 0, z]} rotation={[0, index % 2 === 0 ? 0 : Math.PI, 0]}>
          <mesh geometry={centralBenchTopGeom} material={centralBenchTopMat} position={[0, 0.52, 0]} />
          <mesh geometry={centralBenchBackGeom} material={centralBenchBackMat} position={[0, 0.9, -0.36]} rotation={[0.08, 0, 0]} />
          {[-1.65, 1.65].map((x) => (
            <group key={x}>
              <mesh geometry={centralBenchLegGeom} material={centralBenchLegMat} position={[x, 0.25, -0.26]} />
              <mesh geometry={centralBenchLegGeom} material={centralBenchLegMat} position={[x, 0.25, 0.26]} />
            </group>
          ))}
        </group>
      ))}

      {/* 5. BÀN TRANG TRÍ GỌN VỚI LỌ HOA (mỗi bên 3 bàn phân bố đều tại Z = -16.0, Z = 0.0, Z = 16.0) */}
      {[
        { x: -7.2, z: -16.0 },
        { x: -7.2, z: 0.0 },
        { x: -7.2, z: 16.0 },
        { x: 7.2, z: -16.0 },
        { x: 7.2, z: 0.0 },
        { x: 7.2, z: 16.0 },
      ].map((item, index) => (
        <group key={`decor-table-${index}`} position={[item.x, 0, item.z]}>
          <mesh geometry={tableTopGeom} material={tableTopMat} position={[0, 0.64, 0]} />
          <mesh geometry={tableLegGeom} material={tableLegMat} position={[0, 0.32, 0]} />
          <mesh geometry={tableBaseGeom} material={tableLegMat} position={[0, 0.05, 0]} />
 
          <mesh geometry={vaseBodyGeom} material={vaseBodyMat} position={[0, 0.82, 0]} />
          <mesh geometry={vaseMouthGeom} material={vaseMouthMat} position={[0, 0.98, 0]} />
          {[-0.09, 0.09].map((x, flowerIndex) => (
            <group key={flowerIndex} position={[x, 1.05, 0]} rotation={[0, 0, x * 2.4]}>
              <mesh geometry={flowerStemGeom} material={flowerStemMat} position={[0, 0.09, 0]} />
              <mesh geometry={flowerBudGeom} material={flowerIndex === 0 ? flowerBudRedMat : flowerBudPinkMat} position={[0, 0.25, 0]} />
            </group>
          ))}
        </group>
      ))}

      {/* 6. HÀNG RÀO DÂY NHUNG ĐỎ TRƯỚC DÃY TRANH - từng dây có offset riêng */}
      <VelvetRopeBarrier side="left" zPoints={[-19, -13]} xOffset={ropeConfigs[0].xOffset} zOffset={ropeConfigs[0].zOffset} onClick={() => onRopeClick?.(0)} />
      <VelvetRopeBarrier side="left" zPoints={[-3, 3]} xOffset={ropeConfigs[1].xOffset} zOffset={ropeConfigs[1].zOffset} onClick={() => onRopeClick?.(1)} />
      <VelvetRopeBarrier side="left" zPoints={[13, 19]} xOffset={ropeConfigs[2].xOffset} zOffset={ropeConfigs[2].zOffset} onClick={() => onRopeClick?.(2)} />
      <VelvetRopeBarrier side="right" zPoints={[-19, -13]} xOffset={-ropeConfigs[3].xOffset} zOffset={ropeConfigs[3].zOffset} onClick={() => onRopeClick?.(3)} />
      <VelvetRopeBarrier side="right" zPoints={[-3, 3]} xOffset={-ropeConfigs[4].xOffset} zOffset={ropeConfigs[4].zOffset} onClick={() => onRopeClick?.(4)} />
      <VelvetRopeBarrier side="right" zPoints={[13, 19]} xOffset={-ropeConfigs[5].xOffset} zOffset={ropeConfigs[5].zOffset} onClick={() => onRopeClick?.(5)} />

      {centralExhibit && (
        <CentralArchiveShowcase
          exhibit={centralExhibit}
          unlocked={isCentralArchiveUnlocked}
          collectedCount={collectedRequiredClues}
          onOpen={() => {
            setExhibitModalMode('game');
            setSelectedExhibit(centralExhibit);
          }}
        />
      )}
    </BaseRoom>
  );
};

export default RoomOne;

