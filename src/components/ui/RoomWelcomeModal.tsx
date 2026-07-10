'use client';

import React, { useState, useEffect } from 'react';
import { useMuseum } from '@/context/MuseumContext';
import { BookOpen, Search, FileCheck, DoorOpen, X, ChevronRight, Sparkles } from 'lucide-react';

const STEPS = [
  {
    icon: <Search size={28} className="text-amber-600" />,
    title: '① Khám phá hiện vật',
    desc: 'Đi vòng quanh phòng, nhấp vào các hiện vật trên tường để quan sát. Bạn có 20 giây quan sát trước khi trả lời câu hỏi.',
  },
  {
    icon: <FileCheck size={28} className="text-amber-600" />,
    title: '② Trả lời câu hỏi lịch sử',
    desc: 'Sau khi quan sát, trả lời 1–2 câu hỏi ngắn về hiện vật. Trả lời đúng để mở khóa manh mối điều tra.',
  },
  {
    icon: <BookOpen size={28} className="text-amber-600" />,
    title: '③ Hoàn thiện Sổ điều tra',
    desc: 'Sau khi thu thập đủ 6 manh mối, mở Sổ điều tra (góc dưới phải). Ghép bằng chứng và đưa ra kết luận cuối phòng.',
  },
  {
    icon: <DoorOpen size={28} className="text-amber-600" />,
    title: '④ Mở cửa sang phòng tiếp theo',
    desc: 'Hoàn thành Bảng suy luận chính xác (20/20 điểm) để mở cửa sang Phòng 02: Hội họa cổ điển.',
  },
];

const STORAGE_KEY = 'room-subsidy-welcomed';

export const RoomWelcomeModal: React.FC = () => {
  const { activeGallery, nickname } = useMuseum();
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [hasDismissed, setHasDismissed] = useState(false);

  // Hiện popup khi bước vào phòng bao cấp
  useEffect(() => {
    if (activeGallery?.id === 'gallery-subsidy' && nickname) {
      if (!hasDismissed) {
        const timer = setTimeout(() => setVisible(true), 800);
        return () => clearTimeout(timer);
      }
    } else {
      // Khi đi ra khỏi phòng hoặc đăng xuất, reset trạng thái để lần sau vào lại sẽ hiện
      setVisible(false);
      setStep(0);
      setHasDismissed(false);
    }
  }, [activeGallery?.id, nickname, hasDismissed]);

  const handleDismiss = () => {
    setHasDismissed(true);
    setVisible(false);
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      handleDismiss();
    }
  };

  if (!visible) return null;

  const currentStep = STEPS[step];
  const isLast = step === STEPS.length - 1;

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
                  PHÒNG 01 • VIỆT NAM 1976–1985
                </p>
                <h2 className="text-base font-bold leading-snug mt-0.5">
                  Chào mừng đến Phòng Bao Cấp!
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
            {STEPS.map((_, i) => (
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
              <span className="italic">Chủ đề: </span>
              <strong>Một tháng sống trong thời bao cấp.</strong>
              <span className="italic"> Bạn sẽ điều tra cơ chế vận hành kinh tế Việt Nam trước Đổi mới thông qua các hiện vật lịch sử. Đọc kỹ hướng dẫn bên dưới trước khi bắt đầu!</span>
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
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700">
                <div className="flex items-start gap-1.5">
                  <span className="text-amber-600 font-bold shrink-0">🔍</span>
                  <span>6 hiện vật cần khám phá</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="text-amber-600 font-bold shrink-0">⏱️</span>
                  <span>20 giây quan sát mỗi vật</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="text-amber-600 font-bold shrink-0">📒</span>
                  <span>Sổ điều tra → góc dưới phải</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="text-amber-600 font-bold shrink-0">🏆</span>
                  <span>Đạt 20/20 để mở cửa tiếp</span>
                </div>
              </div>
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
