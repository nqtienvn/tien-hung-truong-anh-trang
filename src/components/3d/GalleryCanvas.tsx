import React, { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { AdaptiveDpr, AdaptiveEvents } from '@react-three/drei';
import * as THREE from 'three';
import { ExhibitionRoom } from './ExhibitionRoom';
import { ExhibitObject } from './ExhibitObject';
import { MultiplayerAvatars } from './MultiplayerAvatars';
import { PlayerCharacter } from './PlayerCharacter';
import { useMuseum } from '@/context/MuseumContext';
import { Exhibit } from '@/lib/db';

// ── Summary Minigame data (mirrored from RoomFour constants) ──
const MG_SITUATIONS = [
  { text: 'Được mùa nhưng thu nhập lại giảm.', category: 'market' },
  { text: 'Ít người sử dụng nhưng vẫn được đầu tư.', category: 'state' },
  { text: 'Cùng một sản phẩm nhưng có rất nhiều đơn vị cùng cung cấp.', category: 'multi_sector' },
  { text: 'Khó khăn về tài chính nhưng vẫn được tiếp cận dịch vụ.', category: 'social' },
  { text: 'Một sản phẩm hoàn thành sau nhiều công đoạn ở nhiều quốc gia.', category: 'integration' },
  { text: 'Nhu cầu tăng làm giá tăng.', category: 'market' },
  { text: 'Không đạt tiêu chuẩn nên không được phép tiếp tục hoạt động.', category: 'state' },
  { text: 'Nhiều mô hình cùng tồn tại trong một lĩnh vực.', category: 'multi_sector' },
  { text: 'Điều kiện sống khác nhau nhưng cơ hội tiếp cận gần như giống nhau.', category: 'social' },
  { text: 'Một đơn hàng phải đi qua nhiều quốc gia mới hoàn thành.', category: 'integration' },
  { text: 'Bán chậm nên giá giảm.', category: 'market' },
  { text: 'Phải thay đổi để đáp ứng quy định mới.', category: 'state' },
  { text: 'Nhiều chủ sở hữu cùng tham gia một lĩnh vực.', category: 'multi_sector' },
  { text: 'Không đủ khả năng chi trả nhưng vẫn được hỗ trợ.', category: 'social' },
  { text: 'Một sản phẩm được tạo ra bởi nhiều quốc gia.', category: 'integration' },
  { text: 'Nguồn cung giảm làm giá tăng.', category: 'market' },
  { text: 'Chưa đáp ứng yêu cầu nên phải tạm dừng.', category: 'state' },
  { text: 'Nhiều hình thức kinh doanh cùng cạnh tranh.', category: 'multi_sector' },
  { text: 'Khoảng cách giữa các nhóm được thu hẹp.', category: 'social' },
  { text: 'Một chuỗi sản xuất trải dài qua nhiều quốc gia.', category: 'integration' },
];
const MG_CATEGORIES = [
  { id: 'market', nameVi: 'Cơ chế thị trường', nameEn: 'Market Mechanism', icon: '💹' },
  { id: 'state', nameVi: 'Vai trò Nhà nước', nameEn: 'State Regulation', icon: '🏛️' },
  { id: 'multi_sector', nameVi: 'Nhiều thành phần kinh tế', nameEn: 'Multi-sector Economy', icon: '🏭' },
  { id: 'social', nameVi: 'Công bằng xã hội', nameEn: 'Social Welfare', icon: '❤️' },
  { id: 'integration', nameVi: 'Hội nhập quốc tế', nameEn: 'Global Integration', icon: '🌍' },
];

interface GalleryCanvasProps {
  exhibits: Exhibit[];
  galleryId: string;
}

// Bộ điều khiển camera góc nhìn thứ 3 bằng Pointer Lock (Third-Person Pointer Lock Camera)
const CameraLerpController: React.FC = () => {
  const { 
    selectedExhibit, 
    activeGallery,
    nickname,
    settings,
    miniGameOpen,
  } = useMuseum();
  
  const { camera, gl } = useThree();

  // Góc xoay cầu của camera xung quanh nhân vật (theta: ngang, phi: dọc)
  const theta = useRef(Math.PI); // Azimuthal angle (Xoay ngang, mặc định nhìn về phía trước)
  const phi = useRef(Math.PI / 2.3); // Polar angle (Xoay dọc, hơi nhìn xuống)
  
  const currentLookAt = useRef(new THREE.Vector3(0, 1.2, 12));
  const targetPos = useRef(new THREE.Vector3(0, 1.7, 7));
  const targetLookAt = useRef(new THREE.Vector3(0, 1.7, 0));

  const wasInspecting = useRef(false);
  const isMouseDown = useRef(false);

  // Cache vectors for useFrame to prevent GC pauses
  const dirHelper = useRef(new THREE.Vector3()).current;
  const targetCamPosCache = useRef(new THREE.Vector3()).current;
  const targetLookTargetCache = useRef(new THREE.Vector3()).current;

  // Xử lý sự kiện nhấn giữ chuột trái và kéo để xoay camera (Click & Drag)
  useEffect(() => {
    const canvas = gl.domElement;

    const isInsideCanvas = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      );
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (miniGameOpen) return;
      // Chỉ bắt thao tác chuột trái trong vùng canvas 3D.
      if (e.button !== 0 || selectedExhibit || !isInsideCanvas(e)) return;
      isMouseDown.current = true;
    };

    const handlePointerUp = () => {
      isMouseDown.current = false;
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (miniGameOpen) return;
      // Nếu pointerdown bị object 3D/R3F/overlay nuốt mất, vẫn nhận biết bằng buttons.
      const isLeftButtonHeld = (e.buttons & 1) === 1;

      // Chỉ xoay camera khi đang giữ chuột trái trong canvas và không ở chế độ Inspect.
      if (selectedExhibit || !isLeftButtonHeld || !isInsideCanvas(e)) {
        if (!isLeftButtonHeld) isMouseDown.current = false;
        return;
      }

      isMouseDown.current = true;

      const sensitivity = 0.003; // Tốc độ xoay camera mượt mà
      theta.current -= e.movementX * sensitivity;
      phi.current -= e.movementY * sensitivity;

      // Giới hạn góc nhìn lên xuống (cho phép nhìn lên trên trần nhà)
      const minPhi = 0.35;
      const maxPhi = Math.PI / 2 + 0.4; // Cho phép camera xoay thấp xuống và ngước nhìn lên
      phi.current = Math.max(minPhi, Math.min(maxPhi, phi.current));
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
    window.addEventListener('pointermove', handlePointerMove);

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, [gl, selectedExhibit]);

  // Cập nhật tọa độ camera khi ở chế độ Inspect
  useEffect(() => {
    if (selectedExhibit) {
      const rotY = selectedExhibit.rotation_y;
      const viewDistance = selectedExhibit.model_3d_url ? 2.5 : 2.0;
      
      const offsetX = Math.sin(rotY) * viewDistance;
      const offsetZ = Math.cos(rotY) * viewDistance;
      
      targetPos.current.set(
        selectedExhibit.coordinate_x + offsetX,
        selectedExhibit.coordinate_y - 0.2,
        selectedExhibit.coordinate_z + offsetZ
      );
      
      targetLookAt.current.set(
        selectedExhibit.coordinate_x,
        selectedExhibit.coordinate_y - 0.2,
        selectedExhibit.coordinate_z
      );
      wasInspecting.current = true;
    }
  }, [selectedExhibit]);

  // Hàm tính toán khoảng cách camera an toàn để tránh xuyên tường/trần/vách ngăn
  const getSafeCameraDistance = (
    px: number,
    py: number,
    pz: number,
    targetHeight: number,
    xOffset: number,
    yOffset: number,
    zOffset: number
  ) => {
    const idealDistance = 4.5;
    dirHelper.set(xOffset, yOffset, zOffset);
    const dist = dirHelper.length();
    dirHelper.normalize();

    let minT = dist;

    const roomWidth = activeGallery?.room_width ?? 12;
    const roomLength = activeGallery?.room_length ?? 30;
    const roomHeight = activeGallery?.room_height ?? 6;

    // 1. Kiểm tra va chạm với tường phòng
    const boundaryX = roomWidth / 2 - 0.25;
    const boundaryZ = roomLength / 2 - 0.25;

    // Tường trái và tường phải
    if (dirHelper.x < 0) {
      const t = (-boundaryX - px) / dirHelper.x;
      if (t > 0 && t < minT) minT = t;
    } else if (dirHelper.x > 0) {
      const t = (boundaryX - px) / dirHelper.x;
      if (t > 0 && t < minT) minT = t;
    }

    // Tường trước và sau
    if (dirHelper.z < 0) {
      const t = (-boundaryZ - pz) / dirHelper.z;
      if (t > 0 && t < minT) minT = t;
    } else if (dirHelper.z > 0) {
      const t = (boundaryZ - pz) / dirHelper.z;
      if (t > 0 && t < minT) minT = t;
    }

    // Trần nhà và sàn nhà
    if (dirHelper.y > 0) {
      const t = (roomHeight - 0.5 - targetHeight) / dirHelper.y;
      if (t > 0 && t < minT) minT = t;
    } else if (dirHelper.y < 0) {
      const t = (0.25 - targetHeight) / dirHelper.y;
      if (t > 0 && t < minT) minT = t;
    }

    // 2. Va chạm với tường ngăn tại Z = -3.0 (Sculptures divider wall)
    if (dirHelper.z !== 0) {
      const wallZ = pz > -3.0 ? -2.76 : -3.24;
      const t = (wallZ - pz) / dirHelper.z;
      if (t > 0 && t < minT) {
        const intersectX = px + t * dirHelper.x;
        // Chặn camera nếu giao điểm nằm ngoài khoảng cổng mở phía bên phải (X < 2.0 hoặc X > 5.0)
        if (intersectX < 2.0 || intersectX > 5.0) {
          minT = t;
        }
      }
    }

    // Trả về khoảng cách an toàn, trừ đi một khoảng đệm nhỏ 0.2m để camera không nằm sát sạt tường
    // Giới hạn khoảng cách tối thiểu 0.6m để không chui vào đầu nhân vật
    return Math.max(0.6, minT - 0.2);
  };

  useFrame((state) => {
    const player = state.scene.getObjectByName('player-character');
    if (!player) return;

    const px = player.position.x;
    const py = player.position.y;
    const pz = player.position.z;
    const isPawn = settings.preset === 'low';
    const targetHeight = py + (isPawn ? 0.55 : 0.65); // Nhắm vào đầu/thân trên nhân vật đã phóng to 1.6x

    if (selectedExhibit) {
      // --- CHẾ ĐỘ INSPECT: Khóa góc nhìn vào tác phẩm ---
      camera.position.lerp(targetPos.current, 0.08);
      currentLookAt.current.lerp(targetLookAt.current, 0.08);
      camera.lookAt(currentLookAt.current);
    } else {
      // --- CHẾ ĐỘ FOLLOW: Bám đuôi nhân vật góc nhìn thứ 3 bằng Pointer Lock ---
      const distance = 4.5; // Khoảng cách lý tưởng ban đầu từ camera đến nhân vật
      
      // Tính toán vị trí camera mục tiêu dựa trên tọa độ cầu lý thuyết
      const xOffset = distance * Math.sin(theta.current) * Math.sin(phi.current);
      const yOffset = distance * Math.cos(phi.current);
      const zOffset = distance * Math.cos(theta.current) * Math.sin(phi.current);

      // Tính khoảng cách camera an toàn chống xuyên tường
      const safeDistance = getSafeCameraDistance(px, py, pz, targetHeight, xOffset, yOffset, zOffset);

      // Cập nhật vị trí camera thực tế dựa trên khoảng cách an toàn
      const safeXOffset = safeDistance * Math.sin(theta.current) * Math.sin(phi.current);
      const safeYOffset = safeDistance * Math.cos(phi.current);
      const safeZOffset = safeDistance * Math.cos(theta.current) * Math.sin(phi.current);

      targetCamPosCache.set(px + safeXOffset, targetHeight + safeYOffset, pz + safeZOffset);
      targetLookTargetCache.set(px, targetHeight, pz);

      if (wasInspecting.current) {
        // Mới thoát inspect: Lerp mượt mà cả vị trí và hướng nhìn về phía sau nhân vật
        camera.position.lerp(targetCamPosCache, 0.08);
        currentLookAt.current.lerp(targetLookTargetCache, 0.08);
        camera.lookAt(currentLookAt.current);

        if (camera.position.distanceTo(targetCamPosCache) < 0.2) {
          wasInspecting.current = false;
        }
      } else {
        // Trạng thái bình thường: Lerp vị trí và hướng nhìn mượt mà
        camera.position.lerp(targetCamPosCache, 0.15);
        currentLookAt.current.lerp(targetLookTargetCache, 0.15);
        camera.lookAt(currentLookAt.current);
      }
    }
  });

  return null;
};

export const GalleryCanvas: React.FC<GalleryCanvasProps> = ({ exhibits, galleryId }) => {
  const { selectedExhibit, setSelectedExhibit, nickname, settings, language, socket, otherUsers, setMiniGameOpen } = useMuseum();
  const containerRef = useRef<HTMLDivElement>(null);
 
  // ── Summary Minigame state (lives here in DOM-land, not inside Canvas) ──
  const [mgOpen, setMgOpen] = useState(false);
  const [mgStep, setMgStep] = useState<'rules' | 'game' | 'complete'>('rules');
  const [mgHasProgress, setMgHasProgress] = useState(false);
  const [mgIndex, setMgIndex] = useState(0);
  const [mgScore, setMgScore] = useState(0);
  const [mgDragOver, setMgDragOver] = useState<string | null>(null);
  const [mgFeedback, setMgFeedback] = useState<'correct' | 'incorrect' | 'timeout' | null>(null);
  const [mgQuestions, setMgQuestions] = useState<typeof MG_SITUATIONS>(MG_SITUATIONS);
  const [questionTimeLeft, setQuestionTimeLeft] = useState(15);
  const [mgEarnedPoints, setMgEarnedPoints] = useState<number | null>(null);

  const shuffleQuestions = (array: typeof MG_SITUATIONS) => {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  // Load played status on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const played = localStorage.getItem('minigame_played_gallery_four') === 'true';
      if (played) {
        const savedScore = localStorage.getItem('minigame_score_gallery_four');
        if (savedScore) {
          const parsedScore = parseInt(savedScore, 10);
          setMgScore(parsedScore);
          if (socket && socket.connected) {
            socket.emit('update-score', { score: parsedScore });
          }
        }
      }
    }
  }, [socket]);

  // Đếm ngược 15s cho mỗi câu hỏi
  useEffect(() => {
    if (mgStep !== 'game' || mgFeedback !== null || !mgOpen) {
      return;
    }

    if (questionTimeLeft <= 0) {
      setMgFeedback('timeout');
      return;
    }

    const interval = setTimeout(() => {
      setQuestionTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(interval);
  }, [mgStep, mgFeedback, questionTimeLeft, mgOpen]);

  // Tự động chuyển câu hỏi khi bị hết giờ (timeout)
  useEffect(() => {
    if (mgFeedback !== 'timeout' || mgStep !== 'game' || !mgOpen) {
      return;
    }

    const timerComplete = setTimeout(() => {
      setMgFeedback(null);
      setMgEarnedPoints(null);
      if (mgIndex < mgQuestions.length - 1) {
        setMgIndex(prev => prev + 1);
        setQuestionTimeLeft(15);
      } else {
        setMgStep('complete');
        setMgHasProgress(false);
        if (typeof window !== 'undefined') {
          localStorage.setItem('minigame_played_gallery_four', 'true');
          localStorage.setItem('minigame_score_gallery_four', mgScore.toString());
        }
        if (socket && socket.connected) {
          socket.emit('update-score', { score: mgScore });
        }
      }
    }, 1200);

    return () => clearTimeout(timerComplete);
  }, [mgStep, mgFeedback, mgIndex, mgQuestions.length, mgOpen, mgScore, socket]);

  // Listen for CustomEvent from RoomFour
  useEffect(() => {
    const handler = () => {
      setMgOpen(true);
      setMiniGameOpen(true);
      if (typeof window !== 'undefined' && localStorage.getItem('minigame_played_gallery_four') === 'true') {
        setMgStep('complete');
        const savedScore = localStorage.getItem('minigame_score_gallery_four');
        if (savedScore) {
          const parsedScore = parseInt(savedScore, 10);
          setMgScore(parsedScore);
          if (socket && socket.connected) {
            socket.emit('update-score', { score: parsedScore });
          }
        }
      } else {
        if (mgHasProgress) {
          setMgStep('rules');
        } else {
          setMgStep('rules');
          setMgIndex(0);
          setMgScore(0);
          setMgFeedback(null);
          setQuestionTimeLeft(15);
          setMgEarnedPoints(null);
        }
      }
    };
    window.addEventListener('openSummaryMinigame', handler);
    return () => window.removeEventListener('openSummaryMinigame', handler);
  }, [socket, setMiniGameOpen, mgHasProgress]);

  const handleMgAnswer = (catId: string) => {
    if (mgFeedback !== null || questionTimeLeft <= 0) return;
    const correct = mgQuestions[mgIndex].category;
    let nextScore = mgScore;
    
    // Trả lời trước 10s (thời gian đếm ngược còn >= 5s) được 10 điểm, còn lại được 5 điểm
    const points = questionTimeLeft >= 5 ? 10 : 5;
    
    if (catId === correct) {
      setMgFeedback('correct');
      setMgEarnedPoints(points);
      setMgScore(prev => {
        nextScore = prev + points;
        return nextScore;
      });
    } else {
      setMgFeedback('incorrect');
    }
    
    setTimeout(() => {
      setMgFeedback(null);
      setMgEarnedPoints(null);
      if (mgIndex < mgQuestions.length - 1) {
        setMgIndex(prev => prev + 1);
        setQuestionTimeLeft(15);
      } else {
        setMgStep('complete');
        setMgHasProgress(false);
        if (typeof window !== 'undefined') {
          localStorage.setItem('minigame_played_gallery_four', 'true');
          localStorage.setItem('minigame_score_gallery_four', nextScore.toString());
        }
        if (socket && socket.connected) {
          socket.emit('update-score', { score: nextScore });
        }
      }
    }, 1200);
  };

  const handleCloseMinigame = () => {
    setMgOpen(false);
    setMiniGameOpen(false);
    setMgStep('rules');
    setMgIndex(0);
    setMgScore(0);
    setMgFeedback(null);
    setQuestionTimeLeft(15);
    setMgEarnedPoints(null);
    setMgHasProgress(false);
  };

  const handleCloseMinigameWithoutReset = () => {
    setMgOpen(false);
    setMiniGameOpen(false);
  };

  // Xử lý click ngoài tác phẩm để hủy tiêu điểm phóng to
  const handleMiss = (e: any) => {
    if (e.target === e.currentTarget || e.target.name === 'floor-grid') {
      setSelectedExhibit(null);
    }
  };

  return (
    <div ref={containerRef} className="w-full h-full bg-[#0a0a0d] relative overflow-hidden select-none">
      {/* 3D Canvas */}
      <Canvas
        shadows={false}
        dpr={settings.preset === 'low' ? [0.5, 0.75] : [0.5, 2]}
        gl={{ antialias: settings.preset !== 'low' }}
        camera={{ position: [0, 2.0, 14.5], fov: 60 }}
        onClick={handleMiss}
      >
        <AdaptiveDpr pixelated />
        <AdaptiveEvents />
        <color attach="background" args={['#14141a']} />
        <fog attach="fog" args={['#14141a', 15, 60]} />

        {/* Ánh sáng chung (tăng độ sáng) */}
        <ambientLight intensity={0.8} />
        
        {/* Ánh sáng xéo */}
        <directionalLight 
          position={[5, 12, 5]} 
          intensity={0.7} 
        />

        {/* Ánh sáng tự nhiên từ giếng trời chiếu thẳng xuống */}
        <directionalLight 
          position={[0, 10, 0]} 
          intensity={1.2} 
          color="#f0f9ff"
        />

        <Suspense fallback={null}>
          {/* Phòng triển lãm */}
          <ExhibitionRoom galleryId={galleryId} />

          {/* Các tác phẩm/hiện vật */}
          {exhibits.map((exhibit) => (
            <ExhibitObject key={exhibit.id} exhibit={exhibit} />
          ))}

          {/* Nhân vật của người chơi hiện tại (Góc nhìn thứ 3 - Chỉ hiển thị sau khi đăng ký biệt danh) */}
          {nickname && <PlayerCharacter />}

          {/* Những người chơi khác trực tuyến */}
          <MultiplayerAvatars />
        </Suspense>

        {/* Cầu nối điều khiển camera bám theo nhân vật */}
        <CameraLerpController />
      </Canvas>

      {/* Hướng dẫn tương tác */}
      {!mgOpen && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur-md text-white text-[10px] sm:text-xs py-1.5 px-4 rounded-full pointer-events-none select-none border border-white/10 text-center flex items-center gap-3">
          <span>🏃 <b>W-A-S-D</b> để di chuyển</span>
          <div className="w-px h-3 bg-white/20" />
          <span>🖱️ <b>Nhấn giữ &amp; Rê chuột</b> để xoay camera</span>
          <div className="w-px h-3 bg-white/20" />
          <span>🖼️ <b>Click tranh/tượng</b> để xem thuyết minh</span>
        </div>
      )}

      {/* ── SUMMARY MINIGAME FULLSCREEN OVERLAY (pure DOM, outside Canvas) ── */}
      {mgOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 2147483647, fontFamily: 'Inter, system-ui, sans-serif', display: 'flex', flexDirection: 'column' }}
        >
          {/* Background */}
          <div style={{ position: 'absolute', inset: 0, background: '#020617' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(16,185,129,0.10) 0%, transparent 70%)' }} />

          {/* Content */}
          <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', padding: '24px 32px', boxSizing: 'border-box' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '16px', marginBottom: '24px', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '20px' }}>🏆</span>
                <span style={{ fontWeight: 900, fontSize: '13px', color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.1em' }}>THỬ THÁCH KINH TẾ ĐỊNH HƯỚNG XHCN</span>
              </div>
              <button
                onClick={handleCloseMinigameWithoutReset}
                style={{
                  background: 'transparent',
                  border: '1px solid #334155',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#ef4444';
                  e.currentTarget.style.color = '#ef4444';
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#334155';
                  e.currentTarget.style.color = '#94a3b8';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                ✕ {language === 'vi' ? 'Đóng' : 'Close'}
              </button>
            </div>

            {/* RULES */}
            {mgStep === 'rules' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '28px', maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
                <span style={{ fontSize: '56px' }}>🎮</span>
                <div>
                  <h4 style={{ fontWeight: 900, fontSize: '22px', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>LUẬT CHƠI MINIGAME</h4>
                  <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: 1.7, background: 'rgba(2,6,23,0.6)', padding: '16px 20px', borderRadius: '12px', border: '1px solid #1e293b', textAlign: 'left' }}>
                    Hệ thống sẽ đưa ra <strong style={{ color: '#fff' }}>20 tình huống thực tế</strong> tương ứng với các đặc trưng kinh tế của Việt Nam.<br />
                    • Nhiệm vụ: <strong style={{ color: '#10b981' }}>kéo (drag)</strong> thẻ tình huống thả vào đúng biểu tượng, hoặc <strong style={{ color: '#10b981' }}>click</strong> thẳng vào ô.<br />
                    • Thời gian đếm ngược cho mỗi câu hỏi là <strong style={{ color: '#eab308' }}>15 giây</strong>.<br />
                    • Điểm số: Trả lời đúng <strong style={{ color: '#10b981' }}>trước 10 giây</strong> (đồng hồ còn &gt; 5s) được <strong style={{ color: '#10b981' }}>+10 điểm</strong>. Trả lời đúng <strong style={{ color: '#eab308' }}>sau 10 giây</strong> (đồng hồ còn &le; 5s) được <strong style={{ color: '#eab308' }}>+5 điểm</strong>.
                  </p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', width: '100%' }}>
                  {MG_CATEGORIES.map(cat => (
                    <div key={cat.id} style={{ background: 'rgba(2,6,23,0.5)', border: '1px solid #1e293b', padding: '12px 8px', borderRadius: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '24px' }}>{cat.icon}</span>
                      <span style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textAlign: 'center', lineHeight: 1.3 }}>{language === 'vi' ? cat.nameVi : cat.nameEn}</span>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: '11px', color: '#10b981', fontWeight: 700 }}>Tổng điểm tối đa: <span style={{ fontFamily: 'monospace', fontSize: '14px' }}>200</span> điểm</p>
                {mgHasProgress ? (
                  <button 
                    onClick={() => {
                      setMgStep('game');
                    }} 
                    style={{ background: '#10b981', color: '#020617', fontWeight: 900, padding: '12px 36px', borderRadius: '12px', fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', border: 'none', boxShadow: '0 0 30px rgba(16,185,129,0.3)' }}
                  >
                    ▶️ {language === 'vi' ? `Tiếp tục chơi (Câu ${mgIndex + 1})` : `Continue (Q${mgIndex + 1})`}
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      setMgQuestions(shuffleQuestions(MG_SITUATIONS));
                      setMgStep('game');
                      setQuestionTimeLeft(15);
                      setMgEarnedPoints(null);
                      setMgHasProgress(true);
                    }} 
                    style={{ background: '#10b981', color: '#020617', fontWeight: 900, padding: '12px 36px', borderRadius: '12px', fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', border: 'none', boxShadow: '0 0 30px rgba(16,185,129,0.3)' }}
                  >
                    🚀 {language === 'vi' ? 'Bắt đầu chơi' : 'Start Game'}
                  </button>
                )}
              </div>
            )}

            {/* GAME */}
            {mgStep === 'game' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>📝 Tình huống {mgIndex + 1} / {mgQuestions.length}</span>
                    <div style={{ flex: 1, height: '4px', background: '#1e293b', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${((mgIndex + 1) / mgQuestions.length) * 100}%`, background: 'linear-gradient(to right, #10b981, #34d399)', borderRadius: '99px', transition: 'width 0.3s ease' }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(2,6,23,0.8)', border: '1px solid #1e293b', padding: '6px 16px', borderRadius: '10px', fontSize: '13px', color: '#10b981', fontWeight: 700, marginLeft: '20px', flexShrink: 0 }}>
                    <span style={{ color: questionTimeLeft <= 5 ? '#ef4444' : '#eab308', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      ⏳ Đếm ngược: <span style={{ fontFamily: 'monospace', fontSize: '15px', fontWeight: 900 }}>{questionTimeLeft}</span>s
                    </span>
                    <div style={{ width: '1px', height: '12px', background: '#334155' }} />
                    <span>Điểm: <span style={{ fontFamily: 'monospace', fontSize: '16px', fontWeight: 900 }}>{mgScore}</span> / 200</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
                  <div
                    draggable={mgFeedback === null}
                    onDragStart={(e) => e.dataTransfer.setData('text/plain', mgQuestions[mgIndex].category)}
                    style={{
                      maxWidth: '560px', width: '100%', padding: '28px 32px', borderRadius: '18px', border: '1px solid', textAlign: 'center', position: 'relative',
                      cursor: mgFeedback === null ? 'grab' : 'default', userSelect: 'none', transition: 'all 0.25s ease', boxSizing: 'border-box',
                      background: mgFeedback === 'correct' ? 'rgba(6,78,59,0.4)' : (mgFeedback === 'incorrect' || mgFeedback === 'timeout') ? 'rgba(69,10,10,0.4)' : 'rgba(2,6,23,0.7)',
                      borderColor: mgFeedback === 'correct' ? '#10b981' : (mgFeedback === 'incorrect' || mgFeedback === 'timeout') ? '#ef4444' : '#334155',
                      boxShadow: mgFeedback === 'correct' ? '0 0 40px rgba(16,185,129,0.2)' : (mgFeedback === 'incorrect' || mgFeedback === 'timeout') ? '0 0 40px rgba(239,68,68,0.2)' : '0 8px 40px rgba(0,0,0,0.4)',
                    }}
                  >
                    <span style={{ position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)', fontSize: '9px', background: '#1e293b', color: '#64748b', border: '1px solid #334155', padding: '2px 10px', borderRadius: '99px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Kéo thẻ này thả vào ô tương ứng bên dưới</span>
                    <p style={{ fontSize: '16px', fontWeight: 800, color: mgFeedback === 'correct' ? '#6ee7b7' : (mgFeedback === 'incorrect' || mgFeedback === 'timeout') ? '#fca5a5' : '#f1f5f9', lineHeight: 1.6, marginTop: '8px' }}>
                      &ldquo;{mgQuestions[mgIndex].text}&rdquo;
                    </p>
                    {mgFeedback === 'correct' && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(16,185,129,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '18px' }}>
                        <span style={{ fontWeight: 900, fontSize: '13px', color: '#10b981', background: 'rgba(2,6,23,0.95)', border: '1px solid #10b981', padding: '8px 20px', borderRadius: '99px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>✨ CHÍNH XÁC +{mgEarnedPoints || 10}đ</span>
                      </div>
                    )}
                    {mgFeedback === 'incorrect' && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(239,68,68,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '18px' }}>
                        <span style={{ fontWeight: 900, fontSize: '13px', color: '#ef4444', background: 'rgba(2,6,23,0.95)', border: '1px solid #ef4444', padding: '8px 20px', borderRadius: '99px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>❌ CHƯA CHÍNH XÁC</span>
                      </div>
                    )}
                    {mgFeedback === 'timeout' && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(239,68,68,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '18px' }}>
                        <span style={{ fontWeight: 900, fontSize: '13px', color: '#ef4444', background: 'rgba(2,6,23,0.95)', border: '1px solid #ef4444', padding: '8px 20px', borderRadius: '99px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>⏰ HẾT GIỜ!</span>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: '10px' }}>
                  <p style={{ textAlign: 'center', fontSize: '10px', color: '#475569', fontStyle: 'italic' }}>(Mẹo: Kéo thả hoặc click trực tiếp vào ô bên dưới)</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
                    {MG_CATEGORIES.map(cat => {
                      const isOver = mgDragOver === cat.id;
                      return (
                        <div
                          key={cat.id}
                          onDragOver={(e) => { e.preventDefault(); if (mgFeedback === null) setMgDragOver(cat.id); }}
                          onDragLeave={() => setMgDragOver(null)}
                          onDrop={(e) => { e.preventDefault(); setMgDragOver(null); handleMgAnswer(cat.id); }}
                          onClick={() => handleMgAnswer(cat.id)}
                          style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px 8px',
                            borderRadius: '16px', border: `2px solid ${isOver ? '#10b981' : '#1e293b'}`,
                            background: isOver ? '#0f2a23' : 'rgba(2,6,23,0.6)', cursor: 'pointer', userSelect: 'none',
                            transition: 'all 0.15s ease', transform: isOver ? 'scale(1.05)' : 'scale(1)',
                            boxShadow: isOver ? '0 0 20px rgba(16,185,129,0.3)' : 'none', minHeight: '110px',
                          }}
                        >
                          <span style={{ fontSize: '28px', marginBottom: '8px' }}>{cat.icon}</span>
                          <span style={{ fontSize: '9px', fontWeight: 800, color: isOver ? '#6ee7b7' : '#94a3b8', textAlign: 'center', lineHeight: 1.3, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                            {language === 'vi' ? cat.nameVi : cat.nameEn}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* COMPLETE */}
            {mgStep === 'complete' && (() => {
              const allPlayerScores = [
                { nickname: nickname || (language === 'vi' ? 'Bạn' : 'You'), score: mgScore, isMe: true },
                ...otherUsers.map(u => ({ nickname: u.nickname, score: u.score || 0, isMe: false }))
              ].sort((a, b) => b.score - a.score);

              return (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', maxWidth: '640px', margin: '0 auto', textAlign: 'center', width: '100%' }}>
                  <span style={{ fontSize: '56px' }}>🏆</span>
                  <div>
                    <h4 style={{ fontWeight: 900, fontSize: '22px', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>THỬ THÁCH HOÀN THÀNH!</h4>
                    <p style={{ fontWeight: 850, fontSize: '15px', color: '#10b981' }}>
                      Bạn đạt được: <span style={{ fontFamily: 'monospace', fontSize: '20px' }}>{mgScore}</span> / 200 điểm
                    </p>
                  </div>

                  {/* Leaderboard Table Container */}
                  <div style={{ width: '100%', background: 'rgba(15,23,42,0.4)', border: '1px solid #1e293b', borderRadius: '16px', overflow: 'hidden' }}>
                    <div style={{ background: '#0f172a', padding: '12px 20px', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      <span>Hạng / Người chơi</span>
                      <div style={{ display: 'flex', gap: '40px' }}>
                        <span style={{ width: '80px', textAlign: 'right' }}>Điểm số</span>
                      </div>
                    </div>
                    <div style={{ maxHeight: '180px', overflowY: 'auto', padding: '4px 0' }}>
                      {allPlayerScores.map((p, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px',
                            background: p.isMe ? 'rgba(16,185,129,0.1)' : 'transparent',
                            borderBottom: idx < allPlayerScores.length - 1 ? '1px solid rgba(30,41,59,0.5)' : 'none',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', borderRadius: '99px',
                                fontSize: '10px', fontWeight: 900,
                                background: idx === 0 ? '#eab308' : idx === 1 ? '#cbd5e1' : idx === 2 ? '#cd7f32' : 'transparent',
                                color: idx < 3 ? '#020617' : '#475569',
                                border: idx >= 3 ? '1px solid #334155' : 'none'
                              }}>
                              {idx + 1}
                            </span>
                            <span style={{ fontSize: '12px', fontWeight: p.isMe ? 900 : 600, color: p.isMe ? '#10b981' : '#cbd5e1' }}>
                              {p.nickname} {p.isMe && <span style={{ fontSize: '9px', background: '#10b981', color: '#020617', padding: '1px 5px', borderRadius: '4px', marginLeft: '6px', fontWeight: 900 }}>BẠN</span>}
                            </span>
                          </div>
                          <div style={{ display: 'flex', gap: '40px', fontFamily: 'monospace', fontSize: '13px', fontWeight: 800 }}>
                            <span style={{ width: '80px', textAlign: 'right', color: p.isMe ? '#10b981' : '#cbd5e1' }}>
                              {p.score}đ
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <p style={{ fontSize: '11px', color: '#94a3b8', lineHeight: 1.6, margin: 0, fontStyle: 'italic', maxWidth: '500px' }}>
                    &ldquo;Qua chuyến tham quan, chúng ta đã chứng kiến đầy đủ 5 đặc trưng của nền Kinh tế Thị trường định hướng XHCN Việt Nam.&rdquo;
                  </p>

                  <div style={{ display: 'flex', gap: '16px' }}>
                    <button onClick={handleCloseMinigame} style={{ background: '#10b981', color: '#020617', fontWeight: 900, padding: '12px 36px', borderRadius: '12px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.06em', cursor: 'pointer', border: 'none', boxShadow: '0 0 20px rgba(16,185,129,0.3)' }}>🚪 Thoát</button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
export default GalleryCanvas;
