'use client';

import React, { useState, useEffect } from 'react';
import { useMuseum } from '@/context/MuseumContext';
import { BookOpen, Search, FileCheck, DoorOpen, X, ChevronRight, Sparkles, Gamepad2 } from 'lucide-react';

const GALLERY_CONFIGS: Record<string, {
  headerTitle: string;
  welcomeTitle: string;
  introText: React.ReactNode;
  steps: {
    icon: React.ReactNode;
    title: string;
    desc: string;
  }[];
  summary: React.ReactNode;
}> = {
  'gallery-subsidy': {
    headerTitle: 'PHÒNG 01 • DẤU CHÂN TÌM ĐƯỜNG',
    welcomeTitle: 'Chào mừng đến Phòng “Dấu chân tìm đường”!',
    introText: (
      <>
        <span className="italic">Chủ đề: </span>
        <strong>Hành trình tìm đường cứu nước của Nguyễn Ái Quốc, 1911–1930</strong>
        <span className="block italic mt-2">Đọc kỹ hướng dẫn bên dưới trước khi bắt đầu!</span>
      </>
    ),
    steps: [
      {
        icon: <Search size={28} className="text-amber-600" />,
        title: '① Khám phá hiện vật',
        desc: 'Đi vòng quanh phòng, nhấp vào các hiện vật trên tường để quan sát, ghi nhớ thông tin lịch sử của chúng.',
      },
      {
        icon: <FileCheck size={28} className="text-amber-600" />,
        title: '② Trả lời câu hỏi lịch sử',
        desc: 'Trả lời các câu hỏi ngắn tương ứng với hiện vật. Trả lời chính xác để thu thập mảnh manh mối ghép vào sổ tay.',
      },
      {
        icon: <BookOpen size={28} className="text-amber-600" />,
        title: '③ Hoàn thiện Sổ điều tra',
        desc: 'Khi có đủ manh mối, hãy mở Sổ điều tra (nút góc dưới phải) để ghép các bằng chứng và bản đúc kết trên Bảng điều khiển hành trình.',
      },
      {
        icon: <DoorOpen size={28} className="text-amber-600" />,
        title: '④ Mở cửa sang phòng tiếp theo',
        desc: 'Kết nối chính xác dòng chảy lịch sử và đóng dấu phê duyệt báo cáo để mở khóa cửa sang Phòng 02.',
      },
    ],
    summary: (
      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700">
        <div className="flex items-start gap-1.5">
          <span className="text-amber-600 font-bold shrink-0">🔍</span>
          <span>6 hiện vật + 1 tư liệu trung tâm</span>
        </div>
        <div className="flex items-start gap-1.5">
          <span className="text-amber-600 font-bold shrink-0">🧩</span>
          <span>Lắp bánh răng & đúc kết</span>
        </div>
        <div className="flex items-start gap-1.5">
          <span className="text-amber-600 font-bold shrink-0">📒</span>
          <span>Sổ điều tra → góc dưới phải</span>
        </div>
        <div className="flex items-start gap-1.5">
          <span className="text-amber-600 font-bold shrink-0">🏆</span>
          <span>Đóng dấu phê duyệt để qua cửa</span>
        </div>
      </div>
    ),
  },
  'gallery-paintings': {
    headerTitle: 'PHÒNG 02 • PHÒNG ĐỔI MỚI',
    welcomeTitle: 'Chào mừng đến Phòng Đổi Mới!',
    introText: (
      <>
        <span className="italic">Chủ đề: </span>
        <strong>Đại hội Đảng lần thứ VI.</strong>
        <span className="italic"> Tháng 12 năm 1986. Đất nước đang đứng trước nhiều khó khăn về kinh tế và đời sống. Bạn là thành viên của một nhóm đại biểu tham dự Đại hội VI. Trước khi đưa ra quyết định quan trọng, nhiệm vụ của các bạn là phân tích tình hình đất nước và đưa ra đề xuất phát triển kinh tế.</span>
      </>
    ),
    steps: [
      {
        icon: <Search size={28} className="text-amber-600" />,
        title: '① Chọn ghế đại biểu',
        desc: 'Di chuyển đến khu vực bàn ghế đại biểu họp trong hội trường và chọn một ghế trống bất kỳ.',
      },
      {
        icon: <FileCheck size={28} className="text-amber-600" />,
        title: '② Ngồi vào vị trí',
        desc: 'Khi đứng gần ghế đại biểu, nhấn phím F để ngồi xuống chuẩn bị tham dự phiên họp.',
      },
      {
        icon: <BookOpen size={28} className="text-amber-600" />,
        title: '③ Mở tài liệu phiên họp',
        desc: 'Nhấn phím E khi đang ngồi để mở màn hình báo cáo tài liệu họp trước mặt bạn.',
      },
      {
        icon: <Sparkles size={28} className="text-amber-600" />,
        title: '④ Đánh giá & Kiến nghị',
        desc: 'Khi admin bắt đầu phiên thứ nhất, nghiên cứu báo cáo và kéo thanh đánh giá mức độ nghiêm trọng từ 0 đến 100 để gửi biểu quyết.',
      },
    ],
    summary: (
      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700">
        <div className="flex items-start gap-1.5">
          <span className="text-amber-600 font-bold shrink-0">📝</span>
          <span>Phân tích tình hình kinh tế</span>
        </div>
        <div className="flex items-start gap-1.5">
          <span className="text-amber-600 font-bold shrink-0">🪑</span>
          <span>Ấn F để ngồi, ấn E mở tài liệu</span>
        </div>
        <div className="flex items-start gap-1.5">
          <span className="text-amber-600 font-bold shrink-0">📊</span>
          <span>Đánh giá khủng hoảng 0 - 100</span>
        </div>
        <div className="flex items-start gap-1.5">
          <span className="text-amber-600 font-bold shrink-0">🏆</span>
          <span>Gửi biểu quyết để nhận điểm</span>
        </div>
      </div>
    ),
  },
  'gallery-ceramics': {
    headerTitle: 'PHÒNG 03 • PHÒNG HỘI NHẬP',
    welcomeTitle: 'Chào mừng đến Phòng Hội Nhập!',
    introText: (
      <>
        <span className="italic">Chủ đề: </span>
        <strong>Việt Nam mở cửa với thế giới.</strong>
        <span className="italic"> Bạn sẽ tìm hiểu về chặng đường hội nhập kinh tế quốc tế của nước nhà qua các bức tranh tư liệu lịch sử. Đọc kỹ thông tin để chuẩn bị cho mini game!</span>
      </>
    ),
    steps: [
      {
        icon: <Search size={28} className="text-amber-600" />,
        title: '① Khám phá tác phẩm',
        desc: 'Đi xung quanh phòng triển lãm, nhấp vào các bức tranh trên tường để đọc chi tiết thông tin lịch sử về từng sự kiện mở cửa.',
      },
      {
        icon: <BookOpen size={28} className="text-amber-600" />,
        title: '② Thu thập dữ kiện',
        desc: 'Mỗi bức tranh sau khi đọc sẽ được ghi nhận vào "Bộ sưu tập" ở góc dưới bên phải màn hình. Hãy thu thập đủ 9 dữ kiện.',
      },
      {
        icon: <Gamepad2 size={28} className="text-amber-600" />,
        title: '③ Tham gia Mini Game',
        desc: 'Đến khu vực máy chơi game "Game dòng chảy lịch sử" ở cuối phòng để bắt đầu trò chơi sắp xếp 9 sự kiện theo đúng trình tự thời gian.',
      },
      {
        icon: <FileCheck size={28} className="text-amber-600" />,
        title: '④ Hoàn thành thử thách',
        desc: 'Sắp xếp chính xác các sự kiện để đạt điểm số cao nhất. Bạn có 3 phút thực hiện và chỉ được nộp kết quả duy nhất một lần!',
      },
    ],
    summary: (
      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700">
        <div className="flex items-start gap-1.5">
          <span className="text-amber-600 font-bold shrink-0">🖼️</span>
          <span>9 bức tranh cần đọc</span>
        </div>
        <div className="flex items-start gap-1.5">
          <span className="text-amber-600 font-bold shrink-0">📁</span>
          <span>Bộ sưu tập → góc dưới phải</span>
        </div>
        <div className="flex items-start gap-1.5">
          <span className="text-amber-600 font-bold shrink-0">⏱️</span>
          <span>Giới hạn 3 phút chơi game</span>
        </div>
        <div className="flex items-start gap-1.5">
          <span className="text-amber-600 font-bold shrink-0">🎯</span>
          <span>Chỉ nộp bài duy nhất 1 lần</span>
        </div>
      </div>
    ),
  },
};

export const RoomWelcomeModal: React.FC = () => {
  const { 
    activeGallery, 
    nickname, 
    socket, 
    roomOneState, 
    roomOneWaitingPlayers, 
    roomOneTotalPlayers, 
    roomOneCountdownTime,
    setWelcomeModalOpen,
    setTeleportTarget
  } = useMuseum();
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [hasDismissed, setHasDismissed] = useState(false);
  const [currentGalleryId, setCurrentGalleryId] = useState<string | null>(null);
  const [isWaitingRoomOne, setIsWaitingRoomOne] = useState(false);

  const handleLeaveWaitingRoom = () => {
    setIsWaitingRoomOne(false);
    setHasDismissed(true);
    setVisible(false);
    setTeleportTarget({ x: 0, y: 0.5, z: -5.0 }); // Dịch chuyển người chơi quay lại vị trí Sảnh chờ
  };

  const config = activeGallery?.id ? GALLERY_CONFIGS[activeGallery.id] : null;

  // Cập nhật trạng thái mở của welcome modal lên global context để khóa di chuyển
  useEffect(() => {
    setWelcomeModalOpen(visible);
    return () => {
      setWelcomeModalOpen(false);
    };
  }, [visible, setWelcomeModalOpen]);

  // Reset trạng thái khi đổi phòng
  useEffect(() => {
    if (activeGallery?.id !== currentGalleryId) {
      setCurrentGalleryId(activeGallery?.id || null);
      setHasDismissed(false);
      setVisible(false);
      setIsWaitingRoomOne(false);
      setStep(0);
    }
  }, [activeGallery?.id, currentGalleryId]);

  // Khi game ở phòng 1 chính thức bắt đầu (countdown xong), đóng modal và tắt màn hình chờ
  useEffect(() => {
    if (activeGallery?.id === 'gallery-subsidy' && roomOneState === 'started' && isWaitingRoomOne) {
      setIsWaitingRoomOne(false);
      handleDismiss();
    }
  }, [roomOneState, activeGallery?.id, isWaitingRoomOne]);

  // Hiện popup khi bước vào phòng có cấu hình và có nickname
  useEffect(() => {
    if (config && nickname) {
      if (!hasDismissed) {
        const timer = setTimeout(() => setVisible(true), 800);
        return () => clearTimeout(timer);
      }
    } else {
      setVisible(false);
    }
  }, [config, nickname, hasDismissed]);

  const handleDismiss = () => {
    setHasDismissed(true);
    setVisible(false);
  };

  const handleNext = () => {
    if (config && step < config.steps.length - 1) {
      setStep(s => s + 1);
    } else {
      if (activeGallery?.id === 'gallery-subsidy') {
        if (roomOneState === 'started') {
          // Nếu phòng 1 đã bắt đầu rồi (ví dụ người chơi vào muộn), cho vào chơi luôn
          handleDismiss();
        } else {
          // Ngược lại, vào trạng thái chờ đồng bộ
          setIsWaitingRoomOne(true);
          socket?.emit('room1:ready');
        }
      } else {
        handleDismiss();
      }
    }
  };

  if (!visible || !config || activeGallery?.id !== currentGalleryId) return null;

  if (isWaitingRoomOne) {
    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-auto select-none">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
        
        <div className="relative w-[min(92vw,480px)] bg-[#fbf6ef] border-2 border-[#e0d0b4] rounded-3xl shadow-2xl p-8 flex flex-col items-center justify-center text-center space-y-6 animate-fade-in">
          {roomOneState === 'countdown' ? (
            <>
              {/* Vòng đếm ngược động */}
              <div className="w-24 h-24 bg-amber-600/10 border-2 border-amber-600 text-amber-700 rounded-full flex items-center justify-center shadow-lg relative animate-pulse">
                <span className="font-mono text-5xl font-black">{roomOneCountdownTime}</span>
                <div className="absolute inset-[-4px] rounded-full border border-amber-500/35 animate-ping" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-[#5c3d1a] uppercase tracking-wider font-sans">
                  Chuẩn bị khởi hành!
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed font-sans max-w-sm">
                  Tất cả mọi người đã sẵn sàng. Trò chơi sẽ bắt đầu sau ít giây. Hãy chuẩn bị tinh thần khám phá!
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Trạng thái đang chờ */}
              <div className="w-20 h-20 bg-amber-600/5 text-amber-600 border border-[#e0d0b4] rounded-full flex items-center justify-center relative">
                {/* SVG spinner */}
                <svg className="animate-spin h-10 w-10 text-amber-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <div className="space-y-2 w-full">
                <h3 className="text-lg font-bold text-[#5c3d1a] uppercase tracking-wider font-sans">
                  Đang chờ người chơi khác...
                </h3>
                <div className="bg-[#f5efe3] border border-[#e2d5c0] rounded-xl p-3 max-w-xs mx-auto">
                  <span className="text-sm font-black text-amber-700 font-mono">
                    {roomOneWaitingPlayers} / {roomOneTotalPlayers}
                  </span>
                  <span className="text-xs text-slate-500 block font-sans mt-0.5">người chơi sẵn sàng</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed font-sans max-w-xs mx-auto pt-2">
                  Trò chơi sẽ đồng loạt bắt đầu đếm ngược khi tất cả người chơi trong phòng nhấn nút sẵn sàng.
                </p>
                <button
                  onClick={handleLeaveWaitingRoom}
                  className="mt-4 px-6 py-2.5 bg-[#e2d5c0] hover:bg-[#d5c5ad] text-[#5c3d1a] font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer font-sans"
                >
                  Quay lại Sảnh
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  const currentStep = config.steps[step];
  const isLast = step === config.steps.length - 1;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-auto">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Card popup */}
      <div className="relative w-[min(92vw,520px)] h-[560px] max-h-[88vh] bg-[#fbf6ef] border border-[#e0d0b4] rounded-3xl shadow-2xl overflow-hidden animate-fade-in flex flex-col">

        {/* Header */}
        <div className="relative bg-amber-700 px-6 py-5 text-white shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                <Sparkles size={20} className="text-amber-200" />
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-widest text-amber-200 font-bold">
                  {config.headerTitle}
                </p>
                <h2 className="text-base font-bold leading-snug mt-0.5">
                  {config.welcomeTitle}
                </h2>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer shrink-0 mt-0.5"
            >
              <X size={18} />
            </button>
          </div>

          {/* Progress dots */}
          <div className="flex gap-1.5 mt-4">
            {config.steps.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i === step ? 'bg-white w-6' : i < step ? 'bg-amber-300 w-3' : 'bg-white/30 w-3'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="relative px-6 py-6 space-y-4 flex-1 overflow-y-auto">

          {/* Intro text – chỉ hiện ở step 0 */}
          {step === 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-900 leading-relaxed">
              {config.introText}
            </div>
          )}

          {/* Step card */}
          <div className="bg-white border border-[#e8dcc8] rounded-2xl p-5 shadow-sm space-y-3 min-h-[150px]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-center shrink-0">
                {currentStep.icon}
              </div>
              <h3 className="text-base font-bold text-[#5c3d1a] leading-tight">
                {currentStep.title}
              </h3>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              {currentStep.desc}
            </p>
          </div>

          {/* Tóm tắt ở bước cuối */}
          {isLast && (
            <div className="bg-[#f5efe3] border border-[#e2d5c0] rounded-2xl p-4 space-y-2">
              <p className="text-[10px] font-bold text-amber-800 uppercase tracking-widest mb-3">
                TÓM TẮT LUẬT CHƠI
              </p>
              {config.summary}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="relative px-6 py-5 flex items-center justify-between gap-3 shrink-0 border-t border-[#eadcc7] bg-[#fbf6ef]">
          {step > 0 ? (
            <button
              onClick={() => setStep(s => s - 1)}
              className="text-slate-500 hover:text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              ← Trước
            </button>
          ) : (
            <span className="w-12" aria-hidden="true" />
          )}

          <button
            onClick={handleNext}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-md ${
              isLast
                ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-200'
                : 'bg-[#5c3d1a] hover:bg-amber-800 text-white shadow-amber-900/20'
            }`}
          >
            {isLast ? (
              <>
                <Sparkles size={14} />
                Bắt đầu khám phá!
              </>
            ) : (
              <>
                Tiếp theo
                <ChevronRight size={14} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomWelcomeModal;
