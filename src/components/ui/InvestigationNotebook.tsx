'use client';

import React, { useState, useEffect } from 'react';
import { useMuseum } from '@/context/MuseumContext';
import { BookOpen, HelpCircle, CheckCircle, ChevronRight, X, AlertCircle, Sparkles, Award, Lock, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ShaftConfig {
  id: number;
  title: string;
  desc: string;
  requiredGears: string[];
  requiredConclusion: string;
}

const SHAFTS_CONFIG: ShaftConfig[] = [
  {
    id: 1,
    title: 'Trục Phân Phối (Distribution)',
    desc: 'Cơ chế phân phối lương thực thiết yếu cho người dân.',
    requiredGears: ['exhibit-coupon', 'exhibit-ricebook'],
    requiredConclusion: 'Hàng hóa thiết yếu được phân phối theo tem phiếu và định mức do Nhà nước quy định, người dân không thể tự do mua theo nhu cầu.'
  },
  {
    id: 2,
    title: 'Trục Sản Xuất (Production)',
    desc: 'Quyết định chỉ tiêu sản xuất của nền kinh tế.',
    requiredGears: ['exhibit-factory'],
    requiredConclusion: 'Sản xuất chủ yếu dựa trên kế hoạch và chỉ tiêu được giao, chưa hoàn toàn dựa vào nhu cầu thị trường.'
  },
  {
    id: 3,
    title: 'Trục Định Giá (Pricing)',
    desc: 'Quyết định giá cả trao đổi các mặt hàng trên thị trường.',
    requiredGears: ['exhibit-priceboard'],
    requiredConclusion: 'Giá nhiều mặt hàng do Nhà nước quy định, chưa hình thành chủ yếu từ quan hệ cung – cầu trên thị trường.'
  },
  {
    id: 4,
    title: 'Trục Tiêu Dùng (Consumption)',
    desc: 'Giải thích vì sao có tiền vẫn khó mua được hàng.',
    requiredGears: ['exhibit-coupon', 'exhibit-ricebook', 'exhibit-shop'],
    requiredConclusion: 'Tiền không phải yếu tố duy nhất quyết định khả năng mua hàng; người dân còn phụ thuộc vào tem phiếu, định mức và lượng hàng được phân phối.'
  },
  {
    id: 5,
    title: 'Trục Khan Hiếm (Shortage)',
    desc: 'Nguyên nhân sinh ra thiếu hụt hàng hóa mậu dịch thường xuyên.',
    requiredGears: ['exhibit-factory', 'exhibit-shop'],
    requiredConclusion: 'Sản xuất chưa đáp ứng nhu cầu, hàng hóa được phân phối theo kế hoạch nên nguồn cung hạn chế, dẫn đến thiếu hụt thường xuyên.'
  }
];

const EXHIBIT_LABELS: Record<string, string> = {
  'exhibit-coupon': '🧾 Tem phiếu',
  'exhibit-ricebook': '📒 Sổ gạo',
  'exhibit-factory': '🏭 Nhà máy',
  'exhibit-priceboard': '📋 Bảng giá',
  'exhibit-shop': '🏪 Cửa hàng mậu dịch',
  'exhibit-witness': '👴 Góc nhân chứng',
};

const EXHIBIT_THUMBNAILS: Record<string, string> = {
  'exhibit-coupon': 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
  'exhibit-ricebook': 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
  'exhibit-factory': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80',
  'exhibit-priceboard': '/exhibits/priceboard.jpg',
  'exhibit-shop': 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&auto=format&fit=crop&q=80',
  'exhibit-witness': 'https://images.unsplash.com/photo-1473177134435-4eb84fc76076?w=800&auto=format&fit=crop&q=80'
};

const CONCLUSION_OPTIONS = [
  'Hàng hóa thiết yếu được phân phối theo tem phiếu và định mức do Nhà nước quy định, người dân không thể tự do mua theo nhu cầu.',
  'Sản xuất chủ yếu dựa trên kế hoạch và chỉ tiêu được giao, chưa hoàn toàn dựa vào nhu cầu thị trường.',
  'Giá nhiều mặt hàng do Nhà nước quy định, chưa hình thành chủ yếu từ quan hệ cung – cầu trên thị trường.',
  'Tiền không phải yếu tố duy nhất quyết định khả năng mua hàng; người dân còn phụ thuộc vào tem phiếu, định mức và lượng hàng được phân phối.',
  'Sản xuất chưa đáp ứng nhu cầu, hàng hóa được phân phối theo kế hoạch nên nguồn cung hạn chế, dẫn đến thiếu hụt thường xuyên.',
];

const EXHIBITS_LIST = [
  { id: 'exhibit-coupon', label: 'Tem phiếu', clue: 'Hàng hóa được mua theo tem phiếu', desc: 'Người dân muốn mua hàng thiết yếu phải có tem phiếu, không thể mua hoàn toàn theo nhu cầu cá nhân.' },
  { id: 'exhibit-ricebook', label: 'Sổ gạo', clue: 'Lương thực được cấp theo định mức', desc: 'Số lượng gạo mỗi gia đình nhận phụ thuộc vào quy định chung, không do người dân tự quyết định.' },
  { id: 'exhibit-factory', label: 'Nhà máy', clue: 'Sản xuất theo kế hoạch được giao', desc: 'Nhà máy thực hiện chỉ tiêu sản xuất do cơ quan quản lý đề ra, chưa hoạt động hoàn toàn theo nhu cầu thị trường.' },
  { id: 'exhibit-priceboard', label: 'Bảng giá', clue: 'Giá hàng hóa do Nhà nước quy định', desc: 'Giá nhiều mặt hàng được giữ theo mức quy định, không thay đổi linh hoạt theo cung – cầu.' },
  { id: 'exhibit-shop', label: 'Cửa hàng mậu dịch', clue: 'Hàng hóa phân phối hạn chế, thiếu hụt', desc: 'Nguồn hàng được phân phối theo kế hoạch, trong khi sản xuất chưa đáp ứng đủ nhu cầu.' },
  { id: 'exhibit-witness', label: 'Góc nhân chứng', clue: 'Đời sống phụ thuộc vào phân phối', desc: 'Người dân phải tiết kiệm, chờ phân phối và sử dụng hàng hóa theo phần được cấp.' },
];

export const InvestigationNotebook: React.FC = () => {
  const { 
    cluesCollected, 
    roomOneCompleted, 
    setRoomOneCompleted, 
    resetRoomOne,
    activeGallery, 
    nickname,
    socket,
    language,
    roomOneStartTimestamp,
    roomOneSessionResults,
    setRoomOneSessionResults
  } = useMuseum();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'clues' | 'deduction'>('clues');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<'to-deduction' | 'to-clues'>('to-deduction');

  const handleTabChange = (tab: 'clues' | 'deduction') => {
    if (tab === activeTab || isFlipping) return;
    
    setFlipDirection(tab === 'deduction' ? 'to-deduction' : 'to-clues');
    setIsFlipping(true);
    
    setTimeout(() => {
      setActiveTab(tab);
    }, 250);
    
    setTimeout(() => {
      setIsFlipping(false);
    }, 500);
  };

  // States for Clues tab details
  const [selectedClueId, setSelectedClueId] = useState<string>('exhibit-coupon');

  // States for Deduction Game (Cỗ máy Bao cấp)
  const [insertedGears, setInsertedGears] = useState<Record<number, string[]>>({
    1: [], 2: [], 3: [], 4: [], 5: []
  });
  const [insertedConclusions, setInsertedConclusions] = useState<Record<number, string>>({
    1: '', 2: '', 3: '', 4: '', 5: ''
  });
  const [activeToolboxItem, setActiveToolboxItem] = useState<{ type: 'gear' | 'conclusion'; id: string } | null>(null);
  const [correctShafts, setCorrectShafts] = useState<number[]>([]);
  const [hasCheckedMachine, setHasCheckedMachine] = useState(false);

  const [score, setScore] = useState<number | null>(null);
  const [finalQuestionOpen, setFinalQuestionOpen] = useState(false);
  const [finalAnswer, setFinalAnswer] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);

  // States mới cho Báo cáo đúc kết & Đóng dấu phê duyệt
  const [isReportApproved, setIsReportApproved] = useState(false);
  const [isStamped, setIsStamped] = useState(false);

  // Open notebook automatically when all clues are collected
  useEffect(() => {
    if (cluesCollected.length === 6 && !roomOneCompleted) {
      setIsOpen(true);
      setActiveTab('deduction');
    }
  }, [cluesCollected.length, roomOneCompleted]);

  if (!activeGallery || activeGallery.id !== 'gallery-subsidy' || !nickname) return null;

  const handleSnapGear = (shaftId: number, gearId: string) => {
    // If clicking an already inserted gear, we remove it
    if (gearId) {
      setInsertedGears(prev => {
        const current = prev[shaftId] || [];
        const updated = current.filter(g => g !== gearId);
        return { ...prev, [shaftId]: updated };
      });
      return;
    }

    // Snapping logic: if active toolbox gear is selected
    if (activeToolboxItem && activeToolboxItem.type === 'gear') {
      const gId = activeToolboxItem.id;
      setInsertedGears(prev => {
        const current = prev[shaftId] || [];
        if (current.includes(gId)) return prev;
        const shaftLimit = SHAFTS_CONFIG.find(s => s.id === shaftId)?.requiredGears.length || 1;
        if (current.length >= shaftLimit) return prev; // Full
        return { ...prev, [shaftId]: [...current, gId] };
      });
      setActiveToolboxItem(null); // Clear selection
    }
  };

  const handleSnapConclusion = (shaftId: number, currentConcl: string) => {
    // If clicking an already inserted conclusion, we remove it
    if (currentConcl) {
      setInsertedConclusions(prev => ({ ...prev, [shaftId]: '' }));
      return;
    }

    // Snapping logic: if active toolbox conclusion is selected
    if (activeToolboxItem && activeToolboxItem.type === 'conclusion') {
      const conclText = activeToolboxItem.id;
      setInsertedConclusions(prev => ({ ...prev, [shaftId]: conclText }));
      setActiveToolboxItem(null); // Clear selection
    }
  };

  const handleCheckMachine = () => {
    let currentScore = 0;
    const correctIds: number[] = [];

    SHAFTS_CONFIG.forEach(s => {
      const inserted = [...(insertedGears[s.id] || [])].sort();
      const required = [...s.requiredGears].sort();
      
      const gearsMatch = inserted.length === required.length && inserted.every((v, i) => v === required[i]);
      const conclMatch = insertedConclusions[s.id] === s.requiredConclusion;

      if (gearsMatch && conclMatch) {
        currentScore += 10; // 10đ mỗi trục khớp đúng
        correctIds.push(s.id);
      }
    });

    const cluePoints = cluesCollected.length * 5; // 5đ mỗi hiện vật thu thập thực tế
    const totalScore = currentScore + cluePoints; // Max 50 + 30 = 80đ

    setScore(totalScore);
    setCorrectShafts(correctIds);
    setHasCheckedMachine(true);

    if (correctIds.length === 5) {
      setFinalQuestionOpen(true);
      setShowError(false);
      confetti({ particleCount: 80, spread: 60 });
    } else {
      setShowError(true);
    }
  };

  const playStampSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.frequency.setValueAtTime(120, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + 0.18);
      
      gain.gain.setValueAtTime(0.6, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } catch (e) {
      console.warn('Audio Context error:', e);
    }
  };

  const handleStampApproval = () => {
    if (isStamped || isSubmitting) return;
    
    playStampSound();
    setIsStamped(true);
    setIsSubmitting(true);
    
    confetti({ 
      particleCount: 150, 
      spread: 85,
      scalar: 1.2,
      origin: { y: 0.6 }
    });

    const clientElapsedMs = roomOneStartTimestamp ? (Date.now() - roomOneStartTimestamp) : 0;
    const finalBaseScore = (score || 80) + 10; // 80đ máy chạy + 10đ đóng dấu phê duyệt = 90đ tối đa điểm cơ bản

    setTimeout(() => {
      if (socket && socket.connected) {
        socket.emit('room1:submit-results', { baseScore: finalBaseScore, clientElapsedMs });
      } else {
        setRoomOneCompleted(true);
        setIsOpen(false);
      }
    }, 1500);
  };

  const handleFinalSubmit = () => {
    if (finalAnswer === 'no') {
      setIsReportApproved(true);
      confetti({ particleCount: 60, spread: 50 });
    } else {
      alert(language === 'vi' ? 'Hãy suy nghĩ lại dựa trên các manh mối đã thu thập!' : 'Think again based on the clues collected!');
    }
  };

  const handleResetProgress = () => {
    if (confirm(language === 'vi' ? 'Bạn có muốn làm lại từ đầu không?' : 'Do you want to reset and start over?')) {
      resetRoomOne();
      setInsertedGears({ 1: [], 2: [], 3: [], 4: [], 5: [] });
      setInsertedConclusions({ 1: '', 2: '', 3: '', 4: '', 5: '' });
      setActiveToolboxItem(null);
      setCorrectShafts([]);
      setHasCheckedMachine(false);
      setScore(null);
      setFinalQuestionOpen(false);
      setFinalAnswer(null);
      setIsReportApproved(false);
      setIsStamped(false);
      setIsSubmitting(false);
      setRoomOneSessionResults(null);
      setIsOpen(false);
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
        }
        .animate-spin-reverse {
          animation: spin-slow 10s linear infinite reverse;
        }
        @keyframes flip-to-deduction {
          0% {
            transform: perspective(1600px) rotateY(0deg) skewY(0deg) scaleX(1);
            background: linear-gradient(to right, #fdfaf2 90%, #ebd9bd 100%);
            border-radius: 0 8px 8px 0;
            box-shadow: 0 0 15px rgba(0,0,0,0.1);
          }
          40% {
            background: linear-gradient(to right, #ebd9bd 0%, #fffdec 50%, #dcd1be 100%);
            border-radius: 0 16px 16px 0;
            box-shadow: -20px 20px 35px rgba(0,0,0,0.3);
          }
          50% {
            transform: perspective(1600px) rotateY(-90deg) skewY(-3.5deg) scaleY(0.97);
            background: #e2d2ba;
          }
          60% {
            background: linear-gradient(to left, #2b2f36 0%, #444a54 50%, #1c1e22 100%);
            border-radius: 16px 0 0 16px;
            box-shadow: 20px 20px 35px rgba(0,0,0,0.3);
          }
          100% {
            transform: perspective(1600px) rotateY(-180deg) skewY(0deg) scaleX(1);
            background: linear-gradient(to left, #22252a 90%, #15171a 100%);
            border-radius: 8px 0 0 8px;
            box-shadow: 0 0 15px rgba(0,0,0,0.15);
          }
        }
        @keyframes flip-to-clues {
          0% {
            transform: perspective(1600px) rotateY(-180deg) skewY(0deg) scaleX(1);
            background: linear-gradient(to left, #22252a 90%, #15171a 100%);
            border-radius: 8px 0 0 8px;
            box-shadow: 0 0 15px rgba(0,0,0,0.15);
          }
          40% {
            background: linear-gradient(to left, #2b2f36 0%, #444a54 50%, #1c1e22 100%);
            border-radius: 16px 0 0 16px;
            box-shadow: 20px 20px 35px rgba(0,0,0,0.3);
          }
          50% {
            transform: perspective(1600px) rotateY(-90deg) skewY(3.5deg) scaleY(0.97);
            background: #e2d2ba;
          }
          60% {
            background: linear-gradient(to right, #ebd9bd 0%, #fffdec 50%, #dcd1be 100%);
            border-radius: 0 16px 16px 0;
            box-shadow: -20px 20px 35px rgba(0,0,0,0.3);
          }
          100% {
            transform: perspective(1600px) rotateY(0deg) skewY(0deg) scaleX(1);
            background: linear-gradient(to right, #fdfaf2 90%, #ebd9bd 100%);
            border-radius: 0 8px 8px 0;
            box-shadow: 0 0 15px rgba(0,0,0,0.1);
          }
        }
        .animate-flip-to-deduction {
          animation: flip-to-deduction 0.5s cubic-bezier(0.645, 0.045, 0.355, 1) forwards;
          transform-origin: left center;
        }
        .animate-flip-to-clues {
          animation: flip-to-clues 0.5s cubic-bezier(0.645, 0.045, 0.355, 1) forwards;
          transform-origin: left center;
        }
      `}} />

      {/* FLOATING ACTION BUTTON */}
      <div className="absolute right-4 bottom-4 z-40 pointer-events-auto">
        <button
          onClick={() => setIsOpen(true)}
          className={`flex items-center gap-2 px-5 py-3 rounded-full border shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer ${
            cluesCollected.length === 6 && !roomOneCompleted
              ? 'bg-amber-500 hover:bg-amber-400 border-amber-400 text-slate-950 font-bold animate-pulse'
              : roomOneCompleted
              ? 'bg-emerald-600 hover:bg-emerald-500 border-emerald-500 text-white font-semibold'
              : 'bg-slate-900/90 hover:bg-slate-800 border-slate-805 text-slate-100'
          }`}
        >
          <BookOpen size={16} />
          <span className="text-xs uppercase tracking-wider">
            {language === 'vi' ? 'Sổ điều tra' : 'Investigation Log'}
          </span>
          <span className="bg-black/30 px-2 py-0.5 rounded-full text-[10px] font-bold">
            {cluesCollected.length}/6
          </span>
        </button>
      </div>

      {/* NOTEBOOK MODAL SCREEN */}
      {isOpen && (
        <div className="absolute inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 pointer-events-auto">
          
          {/* Leather Book Cover Frame */}
          <div className="relative w-full max-w-6xl h-[88vh] bg-[#3a1f10] border-[10px] border-[#2b170c] rounded-[24px] shadow-[0_30px_70px_-10px_rgba(0,0,0,0.95)] flex overflow-visible p-2.5 select-none animate-fade-in font-sans">
            
            {/* Stitching effect border */}
            <div className="absolute inset-1.5 border border-[#4d2d1b] border-dashed rounded-[16px] pointer-events-none z-30" />
            
            {/* Close Button on the top right cover corner */}
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 z-40 bg-[#1a0a03] hover:bg-[#2b170c] text-amber-500 hover:text-amber-400 p-2 rounded-full border border-amber-900/50 shadow-md transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>

            {/* Metal Spiral Binder in the middle split */}
            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-7 bg-gradient-to-r from-[#1a0a03] via-[#2b170c] to-[#1a0a03] z-20 flex flex-col items-center justify-between py-6 pointer-events-none">
              {Array.from({ length: 15 }).map((_, i) => (
                <div key={i} className="w-9 h-2.5 bg-gradient-to-r from-slate-300 via-slate-100 to-slate-400 rounded-full shadow-md border-y border-slate-500/30 transform -rotate-[5deg]" />
              ))}
            </div>

            {/* The Flipping Page Sheet Overlay */}
            {isFlipping && (
              <div 
                className={`absolute top-2.5 bottom-2.5 left-1/2 w-[calc(50%-2.5px)] z-35 pointer-events-none border border-black/15 shadow-2xl ${
                  flipDirection === 'to-deduction' 
                    ? 'animate-flip-to-deduction' 
                    : 'animate-flip-to-clues'
                }`}
              />
            )}

            {/* Tab Leather Bookmarks Sticking out of the Left Page */}
            <div className="absolute top-16 left-[-38px] z-30 flex flex-col gap-4 pointer-events-auto">
              <button
                onClick={() => handleTabChange('clues')}
                className={`w-10 py-7 text-[10.5px] font-mono font-bold uppercase text-center rounded-l-2xl border-y border-l transition-all shadow-md write-vertical cursor-pointer ${
                  activeTab === 'clues' 
                    ? 'bg-[#fdfaf2] text-[#4e3629] border-[#d8d3c5] scale-110 pl-2 shadow-2xl z-40' 
                    : 'bg-[#b69f7e] hover:bg-[#c7b08f] text-[#3a1f10] border-amber-900/40 shadow-sm'
                }`}
              >
                Manh Mối
              </button>
              <button
                onClick={() => handleTabChange('deduction')}
                className={`w-10 py-7 text-[10.5px] font-mono font-bold uppercase text-center rounded-l-2xl border-y border-l transition-all shadow-md write-vertical cursor-pointer ${
                  activeTab === 'deduction' 
                    ? 'bg-[#fdfaf2] text-[#4e3629] border-[#d8d3c5] scale-110 pl-2 shadow-2xl z-40' 
                    : 'bg-[#b69f7e] hover:bg-[#c7b08f] text-[#3a1f10] border-amber-900/40 shadow-sm'
                }`}
              >
                Cỗ Máy
              </button>
            </div>

            {/* -------------------- PAGE 1: LEFT PAGE -------------------- */}
            <div className="flex-1 bg-[#fdfaf2] rounded-l-[12px] p-6 pr-8 shadow-inner overflow-y-auto custom-scrollbar relative flex flex-col h-full border-r border-[#e2d5c0]/50 z-10">
              {/* Vertical margins lined paper style */}
              <div className="absolute top-0 bottom-0 right-6 w-0.5 bg-red-200/50 pointer-events-none" />

              {/* Title Section inside the page */}
              <div className="border-b border-[#ebd9bd] pb-3 mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-md font-bold font-sans text-[#4e3629] tracking-tight uppercase flex items-center gap-1.5">
                    <span>📒</span>
                    {activeTab === 'clues' ? 'Danh sách Manh mối' : 'Hòm Tư Liệu Lập Luận'}
                  </h3>
                  <p className="text-[10px] text-[#523d14] font-mono font-bold tracking-widest leading-none mt-1">
                    {activeTab === 'clues' ? 'VIETNAM BEFORE DOI MOI' : 'CHỌN THÀNH PHẦN ĐỂ LẮP RÁP'}
                  </p>
                </div>
                <span className="text-[10px] font-mono bg-[#ebd9bd]/30 text-[#4e3629] px-2 py-0.5 rounded-full font-bold">
                  {cluesCollected.length}/6 Manh mối
                </span>
              </div>

              {/* TAB 1 LEFT PAGE: Clues List */}
              {activeTab === 'clues' && (
                <div className="flex-1 space-y-3.5 pr-2">
                  <div className="bg-[#ebd9bd]/20 border border-[#e5d5be] p-3.5 rounded-xl text-[12px] text-slate-900 font-medium italic leading-relaxed">
                    "Hãy di chuyển xung quanh phòng trưng bày 3D, nhấp khám phá 6 vật phẩm để thu thập thông tin quan trọng điền vào sổ tay."
                  </div>

                  <div className="space-y-2">
                    {EXHIBITS_LIST.map((item) => {
                      const collected = cluesCollected.includes(item.id);
                      const isSelected = selectedClueId === item.id;
                      
                      return (
                        <div 
                          key={item.id}
                          onClick={() => setSelectedClueId(item.id)}
                          className={`p-3 rounded-xl transition-all border cursor-pointer flex items-center justify-between ${
                            isSelected 
                              ? 'bg-amber-100/50 border-amber-400/60 shadow-xs' 
                              : 'bg-white/80 hover:bg-white border-slate-200 shadow-xs'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <span className="text-xs">
                              {collected ? EXHIBIT_LABELS[item.id].split(' ')[0] : '❓'}
                            </span>
                            <div className="truncate">
                              <h4 className="text-[13px] font-extrabold text-slate-950">
                                {collected ? item.label : '❓ Manh mối bí ẩn'}
                              </h4>
                              <p className="text-[11px] font-medium text-slate-600 truncate max-w-[210px]">
                                {collected ? item.clue : 'Chưa được thu thập trong phòng 3D'}
                              </p>
                            </div>
                          </div>
                          <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                            collected ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-400 border border-slate-200'
                          }`}>
                            {collected ? 'Đã có' : 'Chưa có'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 2 LEFT PAGE: Toolbox for Gears & Conclusions */}
              {activeTab === 'deduction' && (
                <div className="flex-1 flex flex-col space-y-4 pr-2">
                  <div className="bg-amber-50/50 border border-amber-200/65 p-3 rounded-xl text-[12px] leading-relaxed text-[#5c4314] font-medium">
                    <span className="font-bold">Hướng dẫn:</span> Chọn 1 thẻ Manh mối hoặc 1 Thẻ Kết luận bên dưới, sau đó nhấp vào <b>ổ khuyết bánh răng hoặc ổ kết luận</b> ở trang phải để lắp ghép.
                  </div>

                  {/* Category A: Gears (Polaroids / Blueprints) */}
                  <div className="space-y-2">
                    <h4 className="text-[11px] font-extrabold font-mono text-[#4e3629] uppercase tracking-wider">
                      ⚙️ Bánh răng bằng chứng (Gears)
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      {EXHIBITS_LIST.map((item) => {
                        const collected = cluesCollected.includes(item.id);
                        const isSelected = activeToolboxItem?.type === 'gear' && activeToolboxItem.id === item.id;
                        
                        return (
                          <div
                            key={item.id}
                            onClick={() => setActiveToolboxItem({ type: 'gear', id: item.id })}
                            className={`p-2 rounded-lg border text-center transition-all cursor-pointer relative flex flex-col items-center justify-between aspect-[1/1.05] ${
                              isSelected 
                                ? 'bg-amber-100 border-amber-500 scale-105 shadow-md ring-2 ring-amber-400/50' 
                                : 'bg-white hover:bg-slate-50 border-slate-200 shadow-xs'
                            }`}
                          >
                            {/* Polaroid image or Pencil Blueprint Outline */}
                            <div className="w-full aspect-square rounded-sm overflow-hidden bg-slate-100 border border-slate-200/50 flex items-center justify-center relative">
                              {collected ? (
                                <img src={EXHIBIT_THUMBNAILS[item.id]} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-[#e8e3d7] flex flex-col items-center justify-center p-1 border border-dashed border-slate-400">
                                  <Lock size={12} className="text-slate-500 mb-0.5" />
                                  <span className="text-[7.5px] text-slate-500 uppercase leading-none font-bold">Chưa tìm</span>
                                </div>
                              )}
                              {/* Selection overlay */}
                              {isSelected && <div className="absolute inset-0 bg-amber-500/10 border-2 border-amber-500 pointer-events-none" />}
                            </div>

                            <span className="text-[10px] font-extrabold text-slate-900 truncate w-full mt-1">
                              {collected ? item.label : `Nháp: ${item.label}`}
                            </span>

                            {/* Indicator point values */}
                            <div className="absolute top-1 right-1 bg-black/40 text-[7px] font-mono text-white px-1 rounded-sm leading-none py-0.5 scale-75">
                              {collected ? '+5đ' : '+0đ'}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Category B: Conclusions (Paper yellow notes) */}
                  <div className="space-y-2 flex-1">
                    <h4 className="text-[11px] font-extrabold font-mono text-[#4e3629] uppercase tracking-wider">
                      📌 Bản đúc kết logic (Conclusions)
                    </h4>
                    <div className="space-y-1.5">
                      {CONCLUSION_OPTIONS.map((option, idx) => {
                        const isSelected = activeToolboxItem?.type === 'conclusion' && activeToolboxItem.id === option;
                        
                        // Check if this conclusion is already inserted somewhere to grey it out slightly
                        const isUsed = Object.values(insertedConclusions).includes(option);

                        return (
                          <div
                            key={idx}
                            onClick={() => setActiveToolboxItem({ type: 'conclusion', id: option })}
                            className={`p-3 rounded-lg border text-[11px] leading-relaxed font-semibold transition-all cursor-pointer relative font-sans shadow-xs ${
                              isSelected
                                ? 'bg-amber-100/90 border-amber-500 scale-[1.01] shadow-md ring-2 ring-amber-400/40 text-slate-900 font-medium'
                                : isUsed
                                ? 'bg-slate-100/60 border-slate-200 text-slate-400'
                                : 'bg-[#fffde6]/90 border-yellow-250/70 hover:bg-[#fffdd0] text-slate-700'
                            }`}
                          >
                            <div className="absolute top-1 left-1.5 text-[9px] font-mono text-amber-900 opacity-90 font-extrabold uppercase">
                              Nhãn #{idx + 1}
                            </div>
                            <p className="pl-6 pt-1.5 leading-snug text-slate-900">{option}</p>
                            
                            {/* Tape graphical styling */}
                            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-8 h-2 bg-yellow-200/50 border border-yellow-300/40 opacity-30 transform -rotate-[2deg] pointer-events-none" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* -------------------- PAGE 2: RIGHT PAGE -------------------- */}
            <div className={`flex-1 rounded-r-[12px] p-6 pl-8 shadow-inner overflow-y-auto custom-scrollbar relative flex flex-col h-full z-10 transition-colors duration-350 ${
              activeTab === 'deduction' && !roomOneCompleted && !isSubmitting && !isReportApproved
                ? 'bg-gradient-to-br from-[#2a2d34] to-[#121316] border-l border-black/80 shadow-[inset_10px_0_20px_rgba(0,0,0,0.8)] text-slate-200'
                : 'bg-[#fdfaf2]'
            }`}>
              {/* Vertical margins lined paper style (only on paper mode) */}
              {!(activeTab === 'deduction' && !roomOneCompleted && !isSubmitting && !isReportApproved) && (
                <div className="absolute top-0 bottom-0 left-6 w-0.5 bg-red-200/50 pointer-events-none" />
              )}

              {/* Title Section inside the page */}
              <div className={`pb-3 mb-4 flex items-center justify-between border-b ${
                activeTab === 'deduction' && !roomOneCompleted && !isSubmitting && !isReportApproved
                  ? 'border-slate-800'
                  : 'border-[#ebd9bd]'
              }`}>
                <div>
                  <h3 className={`text-md font-bold font-sans tracking-tight uppercase flex items-center gap-1.5 ${
                    activeTab === 'deduction' && !roomOneCompleted && !isSubmitting && !isReportApproved
                      ? 'text-amber-500'
                      : 'text-[#4e3629]'
                  }`}>
                    <span>{activeTab === 'clues' ? '⚙️' : '🎮'}</span>
                    {activeTab === 'clues' ? 'Dữ liệu điều tra' : 'Bảng Điều Khiển Cỗ Máy'}
                  </h3>
                  <p className={`text-[9px] font-mono tracking-widest leading-none mt-1 ${
                    activeTab === 'deduction' && !roomOneCompleted && !isSubmitting && !isReportApproved
                      ? 'text-slate-500'
                      : 'text-[#725b29]'
                  }`}>
                    {activeTab === 'clues' ? 'DETAILED INVESTIGATION DOSSIER' : 'VẬN HÀNH CỖ MÁY BAO CẤP'}
                  </p>
                </div>
                {activeTab === 'deduction' && score !== null && (
                  <span className="text-[10px] font-mono bg-emerald-50 border border-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                    Điểm hiện tại: {score}/90đ
                  </span>
                )}
              </div>

              {/* TAB 1 RIGHT PAGE: Clue Details */}
              {activeTab === 'clues' && (() => {
                const item = EXHIBITS_LIST.find(i => i.id === selectedClueId);
                const collected = cluesCollected.includes(selectedClueId);
                
                return (
                  <div className="flex-1 flex flex-col justify-between h-full pl-2">
                    {collected ? (
                      <div className="space-y-4">
                        {/* Polaroid mockup photo frame */}
                        <div className="bg-white border border-[#ebd9bd] p-3 shadow-md rounded-sm w-52 mx-auto rotate-1 hover:rotate-0 transition-transform">
                          <div className="w-full aspect-square overflow-hidden bg-slate-100 border border-slate-150">
                            <img src={EXHIBIT_THUMBNAILS[selectedClueId]} className="w-full h-full object-cover" />
                          </div>
                          <p className="text-[11px] font-mono text-[#725b29] font-bold text-center mt-2.5">
                            {EXHIBIT_LABELS[selectedClueId]}
                          </p>
                        </div>

                        {/* Handwriting lined paper details */}
                        <div className="space-y-2.5 font-sans text-slate-800 leading-relaxed text-justify">
                          <h4 className="text-sm font-bold text-[#4e3629] font-sans uppercase border-b border-dashed border-[#e2d5c0] pb-1">
                            Ý nghĩa lịch sử của hiện vật:
                          </h4>
                          <p className="text-[11px] leading-relaxed">
                            {item?.desc}
                          </p>
                          <div className="bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg font-sans text-[10.5px] text-[#725b29] italic">
                            <span className="font-bold uppercase tracking-wider block mb-0.5 text-[9px]">Ghi chép nhanh:</span>
                            "{item?.clue}"
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3.5 max-w-sm mx-auto">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center border-2 border-dashed border-slate-300 text-slate-400">
                          <Lock size={26} />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-slate-700 uppercase">
                            Tập tin này đang bị khóa
                          </h4>
                          <p className="text-[10px] text-slate-500 leading-relaxed">
                            Bạn chưa trực tiếp tìm thấy manh mối <b>{item?.label}</b> trong phòng triển lãm 3D. Hãy đóng sổ lại, di chuyển thám hiểm và nhấp vào hiện vật để mở khóa tệp tin này!
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="text-[9px] text-slate-400 font-mono text-center pt-4">
                      Hồ sơ mật - Ban quản lý bảo tàng MLN122
                    </div>
                  </div>
                );
              })()}

              {/* TAB 2 RIGHT PAGE: The Subsidy Gear Machine Puzzle */}
              {activeTab === 'deduction' && (
                <div className="flex-1 flex flex-col justify-between h-full pl-2">
                  
                  {roomOneCompleted ? (
                    /* TRẠNG THÁI ĐÃ HOÀN THÀNH PHÒNG */
                    <div className="bg-[#fffde6]/50 border-2 border-[#d9cdb6] rounded-2xl p-5 space-y-4 shadow-sm relative overflow-hidden animate-fade-in text-slate-800">
                      <div className="text-center space-y-1">
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full font-bold uppercase tracking-widest font-mono">
                          HỒ SƠ ĐÃ HOÀN THÀNH & TỔNG KẾT
                        </span>
                        <h3 className="text-md font-bold font-sans text-slate-900 mt-2">
                          Bảng Tổng Sắp Đặc Vụ Phòng 01
                        </h3>
                        <p className="text-[9px] text-slate-500 font-sans">
                          Danh sách đặc vụ giải mật Phòng 01 trong phiên chơi hiện tại
                        </p>
                      </div>

                      {/* Bảng xếp hạng kết quả từ server */}
                      {roomOneSessionResults && roomOneSessionResults.length > 0 ? (
                        <div className="border border-slate-200 bg-white rounded-xl overflow-hidden shadow-xs relative z-10 font-sans">
                          <table className="w-full text-left text-[11px] border-collapse">
                            <thead>
                              <tr className="bg-slate-50 text-slate-500 font-mono text-[9px] uppercase border-b border-slate-200 tracking-wider">
                                <th className="py-2 px-3 text-center">Hạng</th>
                                <th className="py-2 px-3">Đặc vụ</th>
                                <th className="py-2 px-3 text-center">Cơ bản</th>
                                <th className="py-2 px-3 text-center">Thời gian</th>
                                <th className="py-2 px-3 text-center">Thưởng</th>
                                <th className="py-2 px-3 text-center font-bold text-slate-950">Tổng điểm</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                              {roomOneSessionResults.map((p, idx) => {
                                const isSelf = p.nickname === nickname;
                                return (
                                  <tr key={idx} className={`hover:bg-slate-50/50 transition-colors ${isSelf ? 'bg-amber-500/10 font-medium' : ''}`}>
                                    <td className="py-2 px-3 text-center font-mono font-bold text-slate-800">
                                      {idx === 0 ? '🏆 1' : idx === 1 ? '🥈 2' : idx === 2 ? '🥉 3' : idx + 1}
                                    </td>
                                    <td className="py-2 px-3 truncate max-w-[100px] font-sans">
                                      {p.nickname} {isSelf && <span className="text-[8px] bg-amber-500 text-slate-950 px-1 py-0.5 rounded-sm font-bold uppercase ml-1">Tôi</span>}
                                    </td>
                                    <td className="py-2 px-3 text-center font-mono text-slate-600">{p.baseScore}đ</td>
                                    <td className="py-2 px-3 text-center font-mono text-slate-600">{p.timeSpent}s</td>
                                    <td className="py-2 px-3 text-center font-mono text-emerald-600 font-bold">
                                      {p.bonus > 0 ? `+${p.bonus}đ` : '-'}
                                    </td>
                                    <td className="py-2 px-3 text-center font-mono font-bold text-slate-950">{p.finalScore}đ</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="bg-white/80 border border-emerald-100 p-4 rounded-xl text-left space-y-2.5 font-sans relative z-10">
                          <h4 className="text-xs font-bold text-emerald-950 uppercase border-b border-emerald-100 pb-1 font-mono">
                            KẾT LUẬN CỦA ĐIỀU TRA VIÊN
                          </h4>
                          <p className="text-[11px] text-slate-700 leading-relaxed text-justify">
                            Nền kinh tế Việt Nam giai đoạn 1976–1985 vận hành theo cơ chế **kế hoạch hóa tập trung bao cấp**. Trong cơ chế này, Nhà nước nắm quyền quyết định hầu hết các hoạt động kinh tế: sản xuất cái gì, sản xuất bao nhiêu, mức giá cố định là gì và phân phối cho ai bằng tem phiếu. Người dân và doanh nghiệp đóng vai trò thực thi chỉ tiêu, có rất ít quyền tự chủ thương mại.
                          </p>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row gap-2 justify-center relative z-10 pt-2">
                        <button
                          onClick={() => setIsOpen(false)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] py-2.5 px-6 rounded-full shadow-md transition-transform hover:scale-105 active:scale-95 cursor-pointer uppercase tracking-wider font-mono"
                        >
                          Tiếp tục tham quan
                        </button>
                      </div>
                    </div>
                  ) : isSubmitting ? (
                    /* TRẠNG THÁI CHỜ CÁC BẠN CHƠI KHÁC */
                    <div className="bg-[#fffde6]/55 border border-[#d9cdb6] rounded-2xl p-6 text-center space-y-4 my-2 shadow-xs relative overflow-hidden text-slate-800 animate-pulse flex-1 flex flex-col justify-center">
                      <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
                      <div className="space-y-1">
                        <span className="text-[8px] bg-amber-100 text-amber-800 border border-amber-250 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest font-mono">
                          HỒ SƠ ĐÃ NỘP & CHỜ PHÊ DUYỆT
                        </span>
                        <h3 className="text-sm font-bold font-sans text-slate-900 mt-2">
                          Đang chờ các Đặc vụ khác...
                        </h3>
                        <p className="text-[10px] text-slate-600 leading-relaxed font-sans max-w-sm mx-auto text-justify">
                          Hồ sơ điều tra của bạn đã được gửi lên Ban Thanh Tra. Vui lòng chờ tất cả người chơi trong phòng hoàn thành để tổng hợp bảng điểm và thưởng điểm tốc độ Top 5.
                        </p>
                      </div>
                    </div>
                  ) : isReportApproved ? (
                    /* HỒ SƠ PHÊ DUYỆT CHÍNH THỨC CỦA ĐẠI TÁ / BAN THANH TRA */
                    <div className="bg-[#fffdf2] border border-[#d9cdb6] rounded-2xl p-5 space-y-4 shadow-sm relative overflow-hidden animate-fade-in text-slate-850 flex-1 flex flex-col justify-between">
                      {/* CSS Mộc đóng dấu động inline */}
                      <style dangerouslySetInnerHTML={{__html: `
                        @keyframes stamp-scale {
                          0% {
                            transform: scale(3.5) rotate(-35deg);
                            opacity: 0;
                          }
                          100% {
                            transform: scale(1) rotate(-12deg);
                            opacity: 0.9;
                          }
                        }
                        .animate-stamp {
                          animation: stamp-scale 0.28s cubic-bezier(0.18, 0.89, 0.32, 1.28) forwards;
                        }
                      `}} />

                      <div className="space-y-3">
                        <div className="text-center border-b border-double border-slate-300 pb-2">
                          <h4 className="text-xs font-mono font-bold tracking-widest text-[#725b29] uppercase">
                            HỒ SƠ BÁO CÁO CUỐI CÙNG
                          </h4>
                          <span className="text-[8px] font-mono opacity-50 block">Mã số hồ sơ: #MLN122-R01</span>
                        </div>

                        <div className="space-y-1.5 text-[11px] leading-relaxed font-sans text-slate-800 text-justify">
                          <p>
                            Qua quá trình thám thính và giải mã cỗ máy, tôi xin xác nhận: nền kinh tế Việt Nam giai đoạn 1976-1985 hoạt động theo cơ chế <b>Kế hoạch hóa tập trung bao cấp</b>.
                          </p>
                          <p>
                            Nhà nước đóng vai trò quyết định, phân phối hàng hóa thiết yếu dựa trên chỉ tiêu hành chính thông qua tem phiếu và sổ gạo, triệt tiêu quyền tự do giao thương và thị trường tự do.
                          </p>
                        </div>
                      </div>

                      {/* Stamp Seal Area */}
                      <div className="relative h-24 flex items-center justify-center border border-dashed border-slate-300 rounded-xl bg-slate-50/50">
                        {isStamped ? (
                          <div className="absolute flex flex-col items-center justify-center border-4 border-dashed border-red-600 rounded-full w-20 h-20 text-red-600 font-black uppercase tracking-widest font-mono text-[9px] select-none pointer-events-none opacity-90 animate-stamp shadow-sm bg-white/10">
                            <span className="transform -rotate-[5deg]">Đã Duyệt</span>
                            <span className="text-[7px] leading-none mt-1">R01 APPROVED</span>
                          </div>
                        ) : (
                          <button
                            onClick={handleStampApproval}
                            className="bg-red-600/10 hover:bg-red-600/20 text-red-700 text-[10px] font-mono font-bold py-2.5 px-5 rounded-full border border-red-500/30 transition-all cursor-pointer shadow-xs animate-bounce"
                          >
                            🖱️ Bấm để Đóng Dấu Phê Duyệt (+10đ)
                          </button>
                        )}
                        <span className="absolute bottom-1 right-2 text-[8px] font-mono opacity-40">Phê chuẩn bởi Ban thanh tra</span>
                      </div>
                    </div>
                  ) : (
                    /* DEDUCTION MACHINE PUZZLE LAYOUT (RETRO INDUSTRIAL CONTROL PANEL) */
                    <div className="flex-1 flex flex-col justify-between space-y-4">
                      
                      {/* Control Panel Header Gauges */}
                      <div className="flex justify-between items-center bg-[#181a1e] border border-slate-800 rounded-xl p-3 shadow-md relative overflow-hidden">
                        {/* Copper pipes background effect */}
                        <div className="absolute top-1/2 left-0 right-0 h-1 bg-[#8c6b39]/20 -translate-y-1/2 pointer-events-none" />

                        {/* Gauge 1: Machine Pressure Gauge */}
                        <div className="flex items-center gap-2.5 relative z-10">
                          <div className="w-11 h-11 rounded-full bg-[#f4ebd0] border-4 border-[#25282f] relative flex items-center justify-center shadow-[inset_0_2px_5px_rgba(0,0,0,0.4)]">
                            {/* Tick marks */}
                            <div className="absolute inset-1 border border-slate-700/20 rounded-full border-dashed" />
                            {/* Needle */}
                            <div 
                              className="absolute bottom-1/2 left-1/2 w-0.5 h-4.5 bg-red-600 origin-bottom transform -translate-x-1/2 transition-transform duration-700" 
                              style={{ transform: `translateX(-50%) rotate(${-60 + correctShafts.length * 30}deg)` }}
                            />
                            {/* Center pin */}
                            <div className="w-2 h-2 rounded-full bg-[#181a1d] absolute" />
                          </div>
                          <div>
                            <span className="text-[7.5px] font-mono text-slate-400 block leading-none">ÁP SUẤT CỔ MÁY</span>
                            <span className="text-[9px] font-mono text-amber-500 font-bold leading-none mt-1 block">
                              {correctShafts.length * 20}% PSI PRESSURE
                            </span>
                          </div>
                        </div>

                        {/* Gauge 2: LEDs system */}
                        <div className="flex gap-2 relative z-10">
                          <div className="flex flex-col items-center">
                            <div className={`w-3 h-3 rounded-full border border-black transition-all duration-300 ${correctShafts.length === 5 ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-slate-850'}`} />
                            <span className="text-[6px] font-mono text-slate-500 mt-1 uppercase">Online</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className={`w-3 h-3 rounded-full border border-black transition-all duration-300 ${hasCheckedMachine && correctShafts.length < 5 ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e] animate-pulse' : 'bg-slate-850'}`} />
                            <span className="text-[6px] font-mono text-slate-500 mt-1 uppercase">Fault</span>
                          </div>
                        </div>
                      </div>

                      {/* Machine Gear Slots Container */}
                      <div className="flex-1 space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                        
                        {SHAFTS_CONFIG.map((shaft) => {
                          const gears = insertedGears[shaft.id] || [];
                          const concl = insertedConclusions[shaft.id];
                          const isCorrect = correctShafts.includes(shaft.id);
                          const isError = hasCheckedMachine && !isCorrect;

                          return (
                            <div 
                              key={shaft.id}
                              className={`p-3 rounded-xl border transition-all relative ${
                                isCorrect 
                                  ? 'bg-gradient-to-b from-[#1b2f25] to-[#122019] border-emerald-500/40 shadow-xs' 
                                  : isError 
                                  ? 'bg-gradient-to-b from-[#341b1d] to-[#251314] border-rose-500/40 shadow-xs animate-shake'
                                  : 'bg-gradient-to-b from-[#24272e] to-[#181a1f] border-slate-700/50 shadow-md'
                              }`}
                            >
                              {/* LED dome indicator */}
                              <div className={`absolute top-2 right-3 w-2.5 h-2.5 rounded-full border border-black/35 ${
                                isCorrect 
                                  ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' 
                                  : isError 
                                  ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e] animate-ping' 
                                  : 'bg-slate-750 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]'
                              }`} />

                              <h4 className={`text-[11.5px] font-extrabold font-mono leading-none mb-1.5 flex items-center gap-1.5 uppercase ${
                                isCorrect ? 'text-emerald-400' : isError ? 'text-rose-400' : 'text-amber-500'
                              }`}>
                                <span>🕹️</span>
                                {shaft.title}
                              </h4>
                              
                              <p className="text-[10.5px] font-medium text-slate-300 mb-2 leading-relaxed">
                                {shaft.desc}
                              </p>

                              {/* Interactive Mechanical Sockets */}
                              <div className="flex flex-col gap-2.5">
                                
                                {/* Slot A: Brass Gear recess sockets */}
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-bold font-mono text-slate-400 w-16 leading-none">Bánh răng:</span>
                                  <div className="flex items-center gap-2">
                                    {Array.from({ length: shaft.requiredGears.length }).map((_, idx) => {
                                      const insertedGearId = gears[idx];
                                      const collected = insertedGearId ? cluesCollected.includes(insertedGearId) : false;

                                      return (
                                        <div
                                          key={idx}
                                          onClick={() => handleSnapGear(shaft.id, insertedGearId)}
                                          className={`w-11 h-11 rounded-full border-2 transition-all cursor-pointer relative flex items-center justify-center ${
                                            insertedGearId
                                              ? 'border-[#a5804c] bg-[#1e2025] shadow-xs'
                                              : 'border-dashed border-slate-700 bg-black/50 hover:bg-black/70'
                                          }`}
                                          title={insertedGearId ? 'Gỡ bánh răng' : 'Lắp bánh răng'}
                                        >
                                          {insertedGearId ? (
                                            <div className={`w-[90%] h-[90%] rounded-full overflow-hidden p-0.5 relative ${isCorrect ? (idx % 2 === 0 ? 'animate-spin-slow' : 'animate-spin-reverse') : ''}`}>
                                              {collected ? (
                                                <img src={EXHIBIT_THUMBNAILS[insertedGearId]} className="w-full h-full object-cover rounded-full" />
                                              ) : (
                                                <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center">
                                                  <Lock size={10} className="text-slate-500" />
                                                </div>
                                              )}
                                              {/* Cog teeth outlines overlay */}
                                              <div className="absolute inset-0 border-2 border-[#8c6b39] border-dashed rounded-full pointer-events-none scale-105" />
                                            </div>
                                          ) : (
                                            <div className="w-2.5 h-2.5 rounded-full bg-black shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)] border border-slate-800" />
                                          )}

                                          {/* Mini indicator tag for pencil sketch nháp */}
                                          {insertedGearId && !collected && (
                                            <span className="absolute -bottom-1 -right-1 bg-slate-700 border border-slate-600 text-white text-[5.5px] font-mono px-0.5 rounded-xs leading-none">NHÁP</span>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>

                                {/* Slot B: Nixie tube conclusion display screens */}
                                <div className="flex items-start gap-2">
                                  <span className="text-[10px] font-bold font-mono text-slate-400 w-16 pt-1.5 leading-none">Đúc kết:</span>
                                  <div
                                    onClick={() => handleSnapConclusion(shaft.id, concl)}
                                    className={`flex-1 min-h-[42px] p-2.5 rounded-lg border flex items-center justify-center transition-all cursor-pointer relative text-[10.5px] leading-tight font-medium ${
                                      concl
                                        ? 'border-[#2d3035] bg-black text-[#ffa600] drop-shadow-[0_0_3.5px_#ff9000] font-sans italic tracking-wide'
                                        : 'border-dashed border-slate-700 bg-black/40 hover:bg-black/60 text-slate-500 text-center font-mono'
                                    }`}
                                    title={concl ? 'Bấm để gỡ nhãn đúc kết' : 'Chọn nhãn kết luận ở trang trái rồi lắp vào'}
                                  >
                                    {concl ? (
                                      <p className="leading-snug pr-2 text-justify">{concl}</p>
                                    ) : (
                                      <span className="text-[9.5px] tracking-wider font-bold text-slate-500">[ CHƯA CÓ BẢN ĐÚC KẾT ]</span>
                                    )}
                                  </div>
                                </div>

                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Error text if deduction incorrect */}
                      {showError && (
                        <div className="bg-rose-950/40 border border-rose-900 p-2.5 rounded-xl text-rose-300 text-[10px] leading-relaxed flex items-center gap-2 animate-pulse font-mono">
                          <AlertCircle size={13} className="shrink-0 text-rose-400" />
                          <span>ÁP SUẤT CẢNH BÁO: Hệ thống chưa hoạt động! Một vài bánh răng chưa khớp hoặc đúc kết chưa chính xác. Vui lòng tinh chỉnh lại cỗ máy.</span>
                        </div>
                      )}

                      {/* Verify button */}
                      {!finalQuestionOpen && (
                        <div className="pt-0.5 flex justify-center">
                          <button
                            onClick={handleCheckMachine}
                            className="bg-amber-600 hover:bg-amber-700 text-white font-mono font-bold text-[10px] py-2.5 px-6 rounded-full shadow-md transition-transform hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5 uppercase"
                          >
                            ⚙️ Khởi động cỗ máy bao cấp
                          </button>
                        </div>
                      )}

                      {/* CÂU HỎI QUYẾT ĐỊNH KHÓA CỔNG */}
                      {finalQuestionOpen && (
                        <div className="border border-amber-500 bg-[#161a1d] p-3.5 rounded-xl space-y-3.5 animate-fade-in relative shadow-md text-slate-200">
                          <div className="absolute -top-2.5 left-4 bg-amber-500 text-slate-950 font-mono font-bold text-[7.5px] uppercase tracking-widest px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <Sparkles size={8} /> CỖ MÁY ĐÃ VẬN HÀNH ĐỒNG BỘ
                          </div>
                          
                          <div className="space-y-1 pt-1">
                            <h3 className="text-[8.5px] font-bold font-mono text-slate-400 uppercase tracking-widest leading-none">
                              QUYẾT ĐỊNH BAO CẤP:
                            </h3>
                            <p className="text-[10.5px] font-bold text-slate-100 leading-snug">
                              Dựa trên cỗ máy đã vận hành, theo bạn: Nền kinh tế Việt Nam giai đoạn 1976–1985 có vận hành theo cơ chế thị trường tự do hay không?
                            </p>
                          </div>

                          <div className="space-y-1.5 text-[9.5px]">
                            <button
                              onClick={() => setFinalAnswer('yes')}
                              className={`w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer ${
                                finalAnswer === 'yes'
                                  ? 'bg-rose-950/40 border-rose-600 text-rose-300 font-bold'
                                  : 'bg-[#22252a] border-slate-800 text-slate-300 hover:bg-[#2b2f36]'
                              }`}
                            >
                              ○ Có, nền kinh tế lúc này tự do trao đổi và vận hành hoàn toàn theo quy luật cung - cầu thị trường.
                            </button>
                            <button
                              onClick={() => setFinalAnswer('no')}
                              className={`w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer ${
                                finalAnswer === 'no'
                                  ? 'bg-emerald-950/40 border-emerald-600 text-emerald-300 font-bold'
                                  : 'bg-[#22252a] border-slate-800 text-slate-300 hover:bg-[#2b2f36]'
                              }`}
                            >
                              ○ Không, nền kinh tế vận hành theo cơ chế kế hoạch hóa tập trung, phân phối định mức và Nhà nước quyết định hoàn toàn.
                            </button>
                          </div>

                          <div className="flex justify-center">
                            <button
                              onClick={handleFinalSubmit}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-900 font-sans font-bold text-[9px] py-2 px-5 rounded-full transition-transform hover:scale-105 active:scale-95 cursor-pointer uppercase tracking-wider font-mono shadow-xs"
                            >
                              Nộp báo cáo thám tử
                            </button>
                          </div>
                        </div>
                      )}

                    </div>
                  )}

                </div>
              )}

            </div>

            {/* Footer Book binding details */}
            <div className="absolute bottom-2 left-6 right-6 flex items-center justify-between text-[9px] font-mono text-[#a89575]/50 z-20 pointer-events-none">
              <span>Đại học FPT - MLN122 Project</span>
              {!roomOneCompleted && (
                <button 
                  onClick={handleResetProgress}
                  className="hover:underline hover:text-rose-600 font-bold pointer-events-auto cursor-pointer"
                >
                  [Xóa tiến trình điều tra]
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default InvestigationNotebook;
