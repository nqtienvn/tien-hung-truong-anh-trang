'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useMuseum } from '@/context/MuseumContext';
import { BaseRoomPlain, BaseRoomProps } from './BaseRoomPlain';

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const SLIDESHOW_IMAGES = [
  { url: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&auto=format&fit=crop&q=80', label: 'VinFast - Doanh nghiệp tư nhân' },
  { url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80', label: 'Samsung - FDI đầu tư nước ngoài' },
  { url: 'https://images.unsplash.com/photo-1562408590-e32931084e23?w=800&auto=format&fit=crop&q=80', label: 'Viettel - Tập đoàn kinh tế Nhà nước' },
  { url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=80', label: 'EVN - An ninh năng lượng' },
  { url: 'https://images.unsplash.com/photo-1544984243-ec57ea16fe25?w=800&auto=format&fit=crop&q=80', label: 'Cao tốc Bắc – Nam - Đầu tư công' },
  { url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80', label: 'Bảo hiểm y tế - An sinh xã hội' },
  { url: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800&auto=format&fit=crop&q=80', label: 'Chợ truyền thống - Cơ chế cung cầu' },
  { url: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&auto=format&fit=crop&q=80', label: 'Siêu thị hiện đại - Nhiều thành phần' },
  { url: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&auto=format&fit=crop&q=80', label: 'Cảng biển quốc tế - Mở cửa giao thương' },
  { url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80', label: 'Container xuất khẩu - Hội nhập toàn cầu' },
];

const GAME_SITUATIONS = [
  { id: 1, text: 'Được mùa nhưng thu nhập lại giảm.', category: 'market_mechanism', label: 'Cơ chế thị trường' },
  { id: 2, text: 'Ít người sử dụng nhưng vẫn được đầu tư.', category: 'state_role', label: 'Vai trò Nhà nước' },
  { id: 3, text: 'Cùng một sản phẩm nhưng có rất nhiều đơn vị cùng cung cấp.', category: 'multi_sector', label: 'Nhiều thành phần kinh tế' },
  { id: 4, text: 'Khó khăn về tài chính nhưng vẫn được tiếp cận dịch vụ.', category: 'social_justice', label: 'Công bằng xã hội' },
  { id: 5, text: 'Một sản phẩm hoàn thành sau nhiều công đoạn ở nhiều quốc gia.', category: 'integration', label: 'Hội nhập quốc tế' },
  { id: 6, text: 'Nhu cầu tăng làm giá tăng.', category: 'market_mechanism', label: 'Cơ chế thị trường' },
  { id: 7, text: 'Không đạt tiêu chuẩn nên không được phép tiếp tục hoạt động.', category: 'state_role', label: 'Vai trò Nhà nước' },
  { id: 8, text: 'Nhiều mô hình cùng tồn tại trong một lĩnh vực.', category: 'multi_sector', label: 'Nhiều thành phần kinh tế' },
  { id: 9, text: 'Điều kiện sống khác nhau nhưng cơ hội tiếp cận gần như giống nhau.', category: 'social_justice', label: 'Công bằng xã hội' },
  { id: 10, text: 'Một đơn hàng phải đi qua nhiều quốc gia mới hoàn thành.', category: 'integration', label: 'Hội nhập quốc tế' },
  { id: 11, text: 'Bán chậm nên giá giảm.', category: 'market_mechanism', label: 'Cơ chế thị trường' },
  { id: 12, text: 'Phải thay đổi để đáp ứng quy định mới.', category: 'state_role', label: 'Vai trò Nhà nước' },
  { id: 13, text: 'Nhiều chủ sở hữu cùng tham gia một lĩnh vực.', category: 'multi_sector', label: 'Nhiều thành phần kinh tế' },
  { id: 14, text: 'Không đủ khả năng chi trả nhưng vẫn được hỗ trợ.', category: 'social_justice', label: 'Công bằng xã hội' },
  { id: 15, text: 'Một sản phẩm được tạo ra bởi nhiều quốc gia.', category: 'integration', label: 'Hội nhập quốc tế' },
  { id: 16, text: 'Nguồn quan trọng bị giảm làm giá tăng đột biến.', category: 'market_mechanism', label: 'Cơ chế thị trường' },
  { id: 17, text: 'Chưa đáp ứng yêu cầu an toàn nên phải tạm dừng hoạt động.', category: 'state_role', label: 'Vai trò Nhà nước' },
  { id: 18, text: 'Nhiều hình thức kinh doanh cùng cạnh tranh trực tiếp.', category: 'multi_sector', label: 'Nhiều thành phần kinh tế' },
  { id: 19, text: 'Khoảng cách giàu nghèo giữa các nhóm dần được thu hẹp.', category: 'social_justice', label: 'Công bằng xã hội' },
  { id: 20, text: 'Một chuỗi sản xuất, cung ứng trải dài qua nhiều quốc gia.', category: 'integration', label: 'Hội nhập quốc tế' },
];

const CATEGORIES = [
  { id: 'market_mechanism', name: 'Cơ chế thị trường', icon: '💹' },
  { id: 'state_role', name: 'Vai trò Nhà nước', icon: '🏛️' },
  { id: 'multi_sector', name: 'Nhiều thành phần kinh tế', icon: '🏭' },
  { id: 'social_justice', name: 'Công bằng xã hội', icon: '❤️' },
  { id: 'integration', name: 'Hội nhập quốc tế', icon: '🌍' },
];

// Room 4 absolute Z offset from origin
const ZONE_ABS_OFFSET = 233.0;

// ═══════════════════════════════════════════════════════════════════════════


// ═══════════════════════════════════════════════════════════════════════════
// ZONE PROPS SHARED INTERFACE
// ═══════════════════════════════════════════════════════════════════════════
interface ZoneProps {
  onZoneClick: (zoneId: number) => void;
  isActive: boolean;
  language: 'vi' | 'en';
  intensity: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// ZONE 1 — Đa Thành Phần Kinh Tế (3 Cylinder Pedestals + Floating Logos)
// ═══════════════════════════════════════════════════════════════════════════
const Zone1MultiSector: React.FC<ZoneProps> = ({ onZoneClick, isActive, language, intensity }) => {
  const logo1Ref = useRef<THREE.Group>(null);
  const logo2Ref = useRef<THREE.Group>(null);
  const logo3Ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const bounce = Math.sin(time * 2) * 0.08;

    if (logo1Ref.current) {
      logo1Ref.current.position.y = 1.25 + bounce;
      logo1Ref.current.rotation.y = time * 0.6;
    }
    if (logo2Ref.current) {
      logo2Ref.current.position.y = 1.25 + bounce;
      logo2Ref.current.rotation.y = time * 0.6;
    }
    if (logo3Ref.current) {
      logo3Ref.current.position.y = 1.25 + bounce;
      logo3Ref.current.rotation.y = time * 0.6;
    }
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    onZoneClick(1);
  };

  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    document.body.style.cursor = 'auto';
  };

  const isVi = language === 'vi';

  return (
    <group onClick={handleClick}>
      {/* ── Pedestal 1: Viettel (State-owned) ── */}
      <group position={[-2.2, 0, -15]}>
        {/* Glow ring */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <ringGeometry args={[0.5, 0.6, 32]} />
          <meshBasicMaterial color="#ef4444" transparent opacity={0.2 + intensity * 0.8} />
        </mesh>
        {/* Base Cylinder */}
        <mesh 
          position={[0, 0.5, 0]}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          <cylinderGeometry args={[0.4, 0.45, 1.0, 16]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, 1.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.35, 0.4, 16]} />
          <meshBasicMaterial color="#ef4444" transparent opacity={intensity} />
        </mesh>
        
        {/* Logo Viettel (Orange globe inside green torus ring) */}
        <group ref={logo1Ref} position={[0, 1.25, 0]}>
          {/* Inner Globe */}
          <mesh>
            <sphereGeometry args={[0.16, 16, 16]} />
            <meshStandardMaterial color="#ea580c" emissive="#ea580c" emissiveIntensity={0.5 * intensity} roughness={0.1} />
          </mesh>
          {/* Outer Torus Ring */}
          <mesh rotation={[Math.PI / 4, Math.PI / 4, 0]}>
            <torusGeometry args={[0.22, 0.02, 8, 24]} />
            <meshStandardMaterial color="#16a34a" emissive="#16a34a" emissiveIntensity={0.5 * intensity} roughness={0.1} />
          </mesh>
        </group>

        {/* HTML Label */}
        <Html position={[0, 1.7, 0]} center distanceFactor={6} className="pointer-events-none select-none">
          <div className="bg-slate-950/85 border border-red-500/30 px-2 py-1 rounded text-center whitespace-nowrap shadow-md backdrop-blur-sm">
            <p className="text-[8px] font-black text-red-400 uppercase tracking-wider">Viettel</p>
            <p className="text-[6.5px] text-slate-300 font-bold">{isVi ? 'Kinh tế Nhà nước' : 'State Sector'}</p>
          </div>
        </Html>
      </group>

      {/* ── Pedestal 2: VinFast (Private) ── */}
      <group position={[0, 0, -15]}>
        {/* Glow ring */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <ringGeometry args={[0.5, 0.6, 32]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.2 + intensity * 0.8} />
        </mesh>
        {/* Base Cylinder */}
        <mesh 
          position={[0, 0.5, 0]}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          <cylinderGeometry args={[0.4, 0.45, 1.0, 16]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, 1.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.35, 0.4, 16]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={intensity} />
        </mesh>

        {/* Logo VinFast (Glowing V shape) */}
        <group ref={logo2Ref} position={[0, 1.25, 0]}>
          {/* Left Wing */}
          <mesh position={[-0.08, 0.05, 0]} rotation={[0, 0, -Math.PI / 6]}>
            <cylinderGeometry args={[0.025, 0.025, 0.24, 8]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8 * intensity} roughness={0.1} />
          </mesh>
          {/* Right Wing */}
          <mesh position={[0.08, 0.05, 0]} rotation={[0, 0, Math.PI / 6]}>
            <cylinderGeometry args={[0.025, 0.025, 0.24, 8]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8 * intensity} roughness={0.1} />
          </mesh>
        </group>

        {/* HTML Label */}
        <Html position={[0, 1.7, 0]} center distanceFactor={6} className="pointer-events-none select-none">
          <div className="bg-slate-950/85 border border-sky-500/30 px-2 py-1 rounded text-center whitespace-nowrap shadow-md backdrop-blur-sm">
            <p className="text-[8px] font-black text-sky-400 uppercase tracking-wider">VinFast</p>
            <p className="text-[6.5px] text-slate-300 font-bold">{isVi ? 'Kinh tế Tư nhân' : 'Private Sector'}</p>
          </div>
        </Html>
      </group>

      {/* ── Pedestal 3: Samsung (FDI) ── */}
      <group position={[2.2, 0, -15]}>
        {/* Glow ring */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <ringGeometry args={[0.5, 0.6, 32]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.2 + intensity * 0.8} />
        </mesh>
        {/* Base Cylinder */}
        <mesh 
          position={[0, 0.5, 0]}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          <cylinderGeometry args={[0.4, 0.45, 1.0, 16]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, 1.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.35, 0.4, 16]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={intensity} />
        </mesh>

        {/* Logo Samsung (Glowing blue oval) */}
        <group ref={logo3Ref} position={[0, 1.25, 0]} scale={[1.3, 0.7, 0.4]} rotation={[Math.PI / 8, 0, -Math.PI / 12]}>
          <mesh>
            <sphereGeometry args={[0.18, 24, 24]} />
            <meshStandardMaterial color="#1d4ed8" emissive="#1d4ed8" emissiveIntensity={0.6 * intensity} roughness={0.1} />
          </mesh>
        </group>

        {/* HTML Label */}
        <Html position={[0, 1.7, 0]} center distanceFactor={6} className="pointer-events-none select-none">
          <div className="bg-slate-950/85 border border-blue-500/30 px-2 py-1 rounded text-center whitespace-nowrap shadow-md backdrop-blur-sm">
            <p className="text-[8px] font-black text-blue-400 uppercase tracking-wider">Samsung</p>
            <p className="text-[6.5px] text-slate-300 font-bold">{isVi ? 'Kinh tế FDI' : 'FDI Sector'}</p>
          </div>
        </Html>
      </group>
    </group>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// ZONE 2 — Cơ Chế Thị Trường (Balance Scale + Click-to-tilt items)
// ═══════════════════════════════════════════════════════════════════════════
const Zone2BalanceScale: React.FC<ZoneProps> = () => null;

// ═══════════════════════════════════════════════════════════════════════════
// ZONE 3 — Nhà Nước Quản Lý (Diorama + Force Field Dome)
// ═══════════════════════════════════════════════════════════════════════════


// ═══════════════════════════════════════════════════════════════════════════
// ZONE 4 — Công Bằng Xã Hội (Light Tree + Picture Frames)
// ═══════════════════════════════════════════════════════════════════════════


// ═══════════════════════════════════════════════════════════════════════════
// ZONE 5 — Hội Nhập Quốc Tế (Holographic Globe + Orbit Lines + Mini Port)
// ═══════════════════════════════════════════════════════════════════════════




// ═══════════════════════════════════════════════════════════════════════════
// MAIN — RoomFour Component
// ═══════════════════════════════════════════════════════════════════════════
export const RoomFour: React.FC<BaseRoomProps> = ({ galleryId, customSettings, isVisible = true }) => {
  const { activeGallery, language } = useMuseum();
  const roomHeight = (customSettings?.room_height ?? activeGallery?.room_height ?? 6) + 1;

  const modifiedSettings = {
    room_width: customSettings?.room_width ?? activeGallery?.room_width ?? 12,
    room_length: customSettings?.room_length ?? activeGallery?.room_length ?? 72,
    room_height: roomHeight,
    floor_color: customSettings?.floor_color ?? activeGallery?.floor_color ?? '#1e293b',
    wall_color: customSettings?.wall_color ?? activeGallery?.wall_color ?? '#0f172a',
    wainscoting_color: customSettings?.wainscoting_color ?? activeGallery?.wainscoting_color ?? '#1e293b',
    floor_type: (customSettings?.floor_type ?? activeGallery?.floor_type ?? 'wood') as 'wood' | 'marble' | 'carpet',
  };

  // ── Narrative state (step 0→6) ──
  const [step, setStep] = useState<number>(3);

  // ── Zone 2 Intro state ──
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [npcSubtitles, setNpcSubtitles] = useState<string>('');
  const [activePedestal, setActivePedestal] = useState<number | null>(null);

  // ── Minigame state ──
  const [gameIndex, setGameIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [answerStatus, setAnswerStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');

  // ── Zone dynamic lighting ──
  const zoneIntensityRefs = useRef<number[]>([0, 0, 0, 0, 0]);
  const [zoneIntensities, setZoneIntensities] = useState<number[]>([0, 0, 0, 0, 0]);
  const entranceLightRef = useRef<number>(0.05);
  const [entranceLight, setEntranceLight] = useState<number>(0.05);
  const frameCounter = useRef<number>(0);
  const stepRef = useRef<number>(0);
  stepRef.current = step;

  // Zone local-Z centers (room local space, offset from ZONE_ABS_OFFSET)
  const ZONE_LOCAL_Z = [-15, -7, 1, 9, 17];

  useFrame((state) => {
    if (!isVisible) return;
    const player = state.scene.getObjectByName('player-character') || state.scene.getObjectByName('lobby-player');
    if (!player) return;

    const absZ = player.position.z;
    const localZ = absZ - ZONE_ABS_OFFSET;




    // Entrance ambient lerp
    const entranceTarget = stepRef.current >= 1 ? 0.65 : 0.05;
    entranceLightRef.current = THREE.MathUtils.lerp(entranceLightRef.current, entranceTarget, 0.02);

    // Per-zone intensity (light up when nearby AND step >= 3)
    let changed = false;
    ZONE_LOCAL_Z.forEach((zoneZ, i) => {
      const dist = Math.abs(localZ - zoneZ);
      const target = (dist < 13 && stepRef.current >= 3) ? 1.0 : 0.0;
      const newVal = THREE.MathUtils.lerp(zoneIntensityRefs.current[i], target, 0.028);
      if (Math.abs(newVal - zoneIntensityRefs.current[i]) > 0.004) {
        zoneIntensityRefs.current[i] = newVal;
        changed = true;
      }
    });

    // Throttle React state updates to every 5 frames
    frameCounter.current++;
    if (frameCounter.current % 5 === 0) {
      if (changed) setZoneIntensities([...zoneIntensityRefs.current]);
      if (Math.abs(entranceLightRef.current - entranceLight) > 0.008) {
        setEntranceLight(entranceLightRef.current);
      }
    }
  });

  // ── Narrative effects ──
  useEffect(() => {
    if (!isVisible) return;
    if (step === 1) startSlideshow();
    if (step === 2) runNpcIntro();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, isVisible]);

  const startSlideshow = () => {
    let index = 0;
    const interval = setInterval(() => {
      index++;
      if (index < SLIDESHOW_IMAGES.length) {
        setCurrentSlide(index);
      } else {
        clearInterval(interval);
        setStep(2);
      }
    }, 2000);
  };

  const runNpcIntro = async () => {
    const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));
    const vi = language === 'vi';
    setNpcSubtitles(vi ? 'Nhiều người cho rằng Việt Nam là nền kinh tế thị trường tư bản chủ nghĩa.' : 'Many think Vietnam has a capitalist market economy.');
    await sleep(4000);
    setNpcSubtitles(vi ? 'Một số người khác lại nghĩ Việt Nam vẫn là nền kinh tế kế hoạch hóa tập trung.' : 'Others believe Vietnam is still a centrally planned economy.');
    await sleep(4000);
    setNpcSubtitles(vi ? 'Theo bạn, đâu mới là câu trả lời đúng?' : 'What is the correct answer?');
    await sleep(3500);
    setNpcSubtitles(vi ? 'Đáp án là: KINH TẾ THỊ TRƯỜNG ĐỊNH HƯỚNG XHCN.' : 'The answer: SOCIALIST-ORIENTED MARKET ECONOMY.');
    await sleep(4500);
    setStep(4);
    setNpcSubtitles(vi ? 'Hãy tham gia thử thách để chứng minh năng lực hoạch định chính sách!' : 'Take the challenge to prove your policy-making skills!');
  };

  const handleZoneClick = (zoneId: number) => {
    if (step < 3) return;
    setActivePedestal(zoneId);
    const vi = language === 'vi';
    const msgs: Record<number, string> = {
      1: vi ? 'Đặc trưng 1: Nhiều loại hình DN: Nhà nước (Viettel), tư nhân (VinFast) và FDI (Samsung) cùng bình đẳng cạnh tranh.' : 'Char 1: State (Viettel), private (VinFast), and FDI (Samsung) enterprises compete equally.',
      2: vi ? 'Đặc trưng 2: Giá hàng hóa vận hành linh hoạt theo cung – cầu, không bị áp đặt hành chính.' : 'Char 2: Prices fluctuate by supply and demand, not administrative order.',
      3: vi ? 'Đặc trưng 3: Nhà nước quản lý vĩ mô, ban hành Luật DN, Luật Thuế, đầu tư Cao tốc Bắc–Nam và EVN.' : 'Char 3: State provides macro-regulation, legal frameworks, and public infrastructure.',
      4: vi ? 'Đặc trưng 4: Tăng trưởng gắn với công bằng xã hội: bảo hiểm y tế, học bổng vùng cao, cứu trợ thiên tai.' : 'Char 4: Growth paired with social equity: healthcare, highland scholarships, disaster relief.',
      5: vi ? 'Đặc trưng 5: Chủ động hội nhập WTO, ASEAN và thu hút FDI chất lượng cao từ Samsung, Intel.' : 'Char 5: Active integration in WTO, ASEAN and attracting high-quality FDI from Samsung, Intel.',
    };
    setNpcSubtitles(msgs[zoneId] ?? '');
  };

  const handleNextToGameIntro = () => {
    setStep(4);
    setNpcSubtitles(language === 'vi' ? 'Hãy tham gia thử thách để chứng minh năng lực hoạch định chính sách!' : 'Take the challenge to prove your policy-making skills!');
  };

  const handleStartGame = () => {
    setGameIndex(0); setScore(0);
    setSelectedCategory(null); setAnswerStatus('idle');
    setStep(5);
  };

  const handleSelectCategory = (catId: string) => {
    if (answerStatus !== 'idle') return;
    setSelectedCategory(catId);
    const correct = GAME_SITUATIONS[gameIndex].category;
    if (catId === correct) { setAnswerStatus('correct'); setScore(prev => prev + 5); }
    else { setAnswerStatus('incorrect'); }
    setTimeout(() => {
      setSelectedCategory(null); setAnswerStatus('idle');
      if (gameIndex < GAME_SITUATIONS.length - 1) setGameIndex(prev => prev + 1);
      else setStep(6);
    }, 1500);
  };

  // ── Render ──
  return (
    <BaseRoomPlain galleryId={galleryId} customSettings={modifiedSettings} isVisible={isVisible}>

      {/* ── Global Lighting ── */}
      <ambientLight intensity={entranceLight} />
      <directionalLight position={[5, 10, 5]} intensity={0.55} />
      <pointLight position={[0, roomHeight - 1, 0]} intensity={isVisible ? 2.8 : 0} distance={38} color="#ffffff" />

      {/* ── Zone 1 — Đa Thành Phần Kinh Tế ── */}
      {isVisible && (
        <Zone1MultiSector 
          onZoneClick={handleZoneClick}
          isActive={activePedestal === 1}
          language={language}
          intensity={zoneIntensities[0]}
        />
      )}

      {/* ── NPC 2D (Hologram Cố Vấn Triển Lãm) gần vách ngăn thứ nhất ── */}
      {isVisible && (
        <group
          position={[-2.2, 1.2, -51.5]}
          rotation={[0, Math.PI - 0.2, 0]}
        >
          {/* Vòng sáng chân đế */}
          <mesh position={[0, -1.18, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.35, 0.45, 32]} />
            <meshBasicMaterial color="#6366f1" toneMapped={false} />
          </mesh>

          {/* Thân thẻ hologram 2D đứng */}
          <mesh>
            <planeGeometry args={[1.0, 1.6]} />
            <meshStandardMaterial
              color="#1e1b4b"
              emissive="#6366f1"
              emissiveIntensity={0.25}
              transparent
              opacity={0.75}
              roughness={0.1}
            />
          </mesh>

          {/* Khung viền phát sáng */}
          <lineSegments>
            <edgesGeometry args={[new THREE.PlaneGeometry(1.0, 1.6)]} />
            <lineBasicMaterial color="#818cf8" linewidth={2} />
          </lineSegments>

          {/* Nội dung hiển thị HTML dính liền trên tấm hologram */}
          <Html transform distanceFactor={3.2} position={[0, 0, 0.01]} center>
            <div className="w-[180px] h-[280px] flex flex-col items-center justify-between p-3 select-none text-center font-sans text-white">
              <div className="flex flex-col items-center gap-1.5 mt-2">
                <div className="w-14 h-14 rounded-full border-2 border-indigo-400 bg-indigo-950/80 flex items-center justify-center text-3xl shadow-lg shadow-indigo-500/20 animate-pulse">
                  🕵️‍♂️
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-[10px] font-black text-indigo-300 uppercase tracking-wider">
                    Nguyễn Minh Tâm
                  </h4>
                  <p className="text-[7px] text-indigo-400 font-bold uppercase tracking-widest">
                    Thành viên nhóm 7
                  </p>
                </div>
              </div>

              <div className="bg-slate-950/85 border border-indigo-500/30 rounded-xl p-2.5 my-2 shadow-inner">
                <p className="text-[8px] leading-relaxed text-indigo-200 font-semibold">
                  "Sau Đổi mới và hội nhập, Việt Nam phát triển rất nhanh. Nhưng bạn có biết chúng ta đang đi theo mô hình kinh tế nào?"
                </p>
              </div>

            </div>
          </Html>
        </group>
      )}









      {/* ── NPC Expert (step ≥ 2) ── */}
      {step >= 2 && (
        <group position={[0, 0, -12.0]} rotation={[0, 0, 0]}>
          {/* Glow ring on floor */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.47, 0]}>
            <ringGeometry args={[0.62, 0.72, 32]} />
            <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} />
          </mesh>
          {/* Body */}
          <group scale={1.5}>
            <mesh position={[0, 0.7, 0]}>
              <sphereGeometry args={[0.2, 24, 24]} />
              <meshStandardMaterial color="#0284c7" metalness={0.9} roughness={0.1} />
            </mesh>
            <mesh position={[0, 0.74, -0.17]}>
              <boxGeometry args={[0.25, 0.05, 0.08]} />
              <meshBasicMaterial color="#22d3ee" />
            </mesh>
            <mesh position={[0, 0.28, 0]}>
              <capsuleGeometry args={[0.16, 0.28, 8, 16]} />
              <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
            </mesh>
            <mesh position={[-0.2, 0.38, 0]}>
              <sphereGeometry args={[0.06, 12, 12]} />
              <meshStandardMaterial color="#0284c7" metalness={0.9} roughness={0.1} />
            </mesh>
            <mesh position={[0.2, 0.38, 0]}>
              <sphereGeometry args={[0.06, 12, 12]} />
              <meshStandardMaterial color="#0284c7" metalness={0.9} roughness={0.1} />
            </mesh>
            <mesh position={[0, -0.15, 0]}>
              <cylinderGeometry args={[0.1, 0.1, 0.3, 12]} />
              <meshStandardMaterial color="#0f172a" metalness={0.8} />
            </mesh>
          </group>
          {/* NPC speech bubble */}
          <Html position={[0, 1.8, 0]} center distanceFactor={8} className="pointer-events-none select-none">
            <div className="w-[270px] bg-slate-950/95 border border-cyan-500/30 px-4 py-2.5 rounded-2xl shadow-2xl text-slate-100 font-sans backdrop-blur-md">
              <span className="text-[9px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded font-bold tracking-wider block w-max mx-auto mb-1.5 uppercase">
                Chuyên gia kinh tế
              </span>
              <p className="text-xs font-bold leading-normal text-slate-200">
                {npcSubtitles || (language === 'vi' ? 'Xin chào! Hãy tương tác qua các bảng điều khiển.' : 'Hello! Please interact via the control panels.')}
              </p>
            </div>
          </Html>
        </group>
      )}

      {/* ── 2D UI OVERLAYS ── */}
      {(step === 1 || step === 5 || step === 6) && (
        <Html fullscreen className="pointer-events-none z-50">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-4 bg-black/30">
            <div className="w-full max-w-4xl h-[540px] bg-slate-950/90 backdrop-blur-xl border border-slate-800/80 rounded-3xl overflow-hidden flex flex-col items-center justify-center relative shadow-[0_0_80px_rgba(34,211,238,0.12)] pointer-events-auto">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(15,23,42,0.4)_0%,#030712_100%)] z-0" />
              <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-8">

                {/* ── Step 1: LED Slideshow ── */}
                {/* {step === 1 && (
                  <div className="w-full h-full flex flex-col items-center justify-between py-6">
                    <span className="text-xs bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                      Đổi mới &amp; Hội nhập Quốc tế
                    </span>
                    <div className="w-[640px] h-[280px] rounded-2xl overflow-hidden border border-cyan-500/30 relative shadow-2xl">
                      <img src={SLIDESHOW_IMAGES[currentSlide].url} alt="slideshow" className="w-full h-full object-cover transition-opacity duration-500" />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/50 to-transparent p-4 text-center">
                        <p className="text-sm font-bold text-white tracking-wide">{SLIDESHOW_IMAGES[currentSlide].label}</p>
                      </div>
                    </div>
                    <div className="bg-slate-900/60 backdrop-blur border border-white/10 px-6 py-2.5 rounded-full text-xs font-semibold max-w-2xl text-center">
                      {currentSlide <= 4
                        ? <span className="text-slate-200">"Sau Đổi mới và hội nhập quốc tế, Việt Nam phát triển nhanh hơn bao giờ hết."</span>
                        : currentSlide <= 7
                          ? <span className="text-amber-400 font-extrabold text-sm">"Nhưng..."</span>
                          : <span className="text-cyan-400 font-extrabold text-sm">"Việt Nam đang phát triển theo mô hình kinh tế nào?"</span>
                      }
                    </div>
                  </div>
                )} */}



                {/* ── Step 5: Minigame ── */}
                {/* {step === 5 && (
                  <div className="w-full h-full flex flex-col justify-between py-6">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3 px-6">
                      <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5 uppercase tracking-wide">
                        📊 Câu hỏi {gameIndex + 1} / {GAME_SITUATIONS.length}
                      </span>
                      <div className="bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg text-xs font-bold text-amber-500">
                        Điểm: <span className="font-mono font-black">{score} / 100</span>
                      </div>
                    </div>
                    <div className="my-auto max-w-xl mx-auto text-center px-4">
                      <div className="bg-slate-900/80 border border-slate-800/60 p-5 rounded-2xl shadow-xl space-y-3">
                        <span className="text-[9px] bg-slate-850 text-slate-400 border border-slate-800 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                          Tình huống thực tế
                        </span>
                        <p className="text-base font-bold text-slate-100 leading-relaxed">
                          "{GAME_SITUATIONS[gameIndex].text}"
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-5 gap-2 px-6">
                      {CATEGORIES.map((cat) => {
                        const isSelected = selectedCategory === cat.id;
                        const isCorrect = cat.id === GAME_SITUATIONS[gameIndex].category;
                        let btnStyle = "bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white";
                        if (answerStatus !== 'idle') {
                          if (isSelected) btnStyle = isCorrect ? "bg-emerald-500 border-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20" : "bg-rose-500 border-rose-400 text-slate-950";
                          else if (isCorrect) btnStyle = "bg-emerald-500/20 border-emerald-500/40 text-emerald-400";
                        }
                        return (
                          <button
                            key={cat.id}
                            disabled={answerStatus !== 'idle'}
                            onClick={() => handleSelectCategory(cat.id)}
                            className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all text-[9px] font-bold gap-1 cursor-pointer select-none active:scale-95 ${btnStyle}`}
                          >
                            <span className="text-lg">{cat.icon}</span>
                            <span className="text-center leading-tight truncate w-full">{cat.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )} */}

                {/* ── Step 6: Game Complete ── */}
                {/* {step === 6 && (
                  <div className="text-center space-y-4 max-w-2xl px-6">
                    <span className="text-4xl">🏆</span>
                    <div className="space-y-1">
                      <h2 className="text-xl font-extrabold text-white">Thử Thách Hoàn Thành!</h2>
                      <p className="text-xs text-emerald-400 font-bold">Bạn đạt được: {score} / 100 điểm</p>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed text-justify px-4">
                      "Qua bốn phòng của bảo tàng, chúng ta đã chứng kiến hành trình lịch sử rõ nét: từ nền kinh tế kế hoạch hóa tập trung thời bao cấp nghèo nàn, qua Đổi mới mở cửa bứt phá, rồi đến nền kinh tế thị trường định hướng XHCN. Đây là mô hình phát triển độc đáo để Việt Nam vừa giải phóng sức sản xuất thị trường, vừa đảm bảo phát triển vì con người và công bằng xã hội."
                    </p>
                    <button onClick={handleStartGame} className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-500 hover:text-amber-400 font-bold px-5 py-2 rounded-lg text-[10px] cursor-pointer active:scale-95">
                      🔄 Chơi lại game
                    </button>
                  </div>
                )} */}

              </div>
            </div>
          </div>
        </Html>
      )}
    </BaseRoomPlain>
  );
};

export default RoomFour;
