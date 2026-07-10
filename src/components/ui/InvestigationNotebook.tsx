'use client';

import React, { useState, useEffect } from 'react';
import { useMuseum } from '@/context/MuseumContext';
import { BookOpen, HelpCircle, CheckCircle, ChevronRight, X, AlertCircle, Sparkles, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

interface DeductionQuestion {
  id: number;
  question: string;
  correctEvidence: string[]; // List of exhibit IDs
  correctConclusion: string;
}

const DEDUCTION_QUESTIONS: DeductionQuestion[] = [
  {
    id: 1,
    question: 'Hàng hóa được phân phối như thế nào?',
    correctEvidence: ['exhibit-coupon', 'exhibit-ricebook'],
    correctConclusion: 'Hàng hóa thiết yếu được phân phối theo tem phiếu và định mức do Nhà nước quy định, người dân không thể tự do mua theo nhu cầu.',
  },
  {
    id: 2,
    question: 'Hoạt động sản xuất được quyết định bởi yếu tố nào?',
    correctEvidence: ['exhibit-factory'],
    correctConclusion: 'Sản xuất chủ yếu dựa trên kế hoạch và chỉ tiêu được giao, chưa hoàn toàn dựa vào nhu cầu thị trường.',
  },
  {
    id: 3,
    question: 'Giá cả hàng hóa được xác định ra sao?',
    correctEvidence: ['exhibit-priceboard'],
    correctConclusion: 'Giá nhiều mặt hàng do Nhà nước quy định, chưa hình thành chủ yếu từ quan hệ cung – cầu trên thị trường.',
  },
  {
    id: 4,
    question: 'Vì sao người dân có tiền nhưng vẫn khó mua hàng?',
    correctEvidence: ['exhibit-coupon', 'exhibit-ricebook', 'exhibit-shop'],
    correctConclusion: 'Tiền không phải yếu tố duy nhất quyết định khả năng mua hàng; người dân còn phụ thuộc vào tem phiếu, định mức và lượng hàng được phân phối.',
  },
  {
    id: 5,
    question: 'Nguyên nhân nào dẫn đến tình trạng khan hiếm hàng hóa?',
    correctEvidence: ['exhibit-factory', 'exhibit-shop'],
    correctConclusion: 'Sản xuất chưa đáp ứng nhu cầu, hàng hóa được phân phối theo kế hoạch nên nguồn cung hạn chế, dẫn đến thiếu hụt thường xuyên.',
  },
];

const EXHIBIT_LABELS: Record<string, string> = {
  'exhibit-coupon': '🧾 Tem phiếu',
  'exhibit-ricebook': '📒 Sổ gạo',
  'exhibit-factory': '🏭 Nhà máy',
  'exhibit-priceboard': '📋 Bảng giá',
  'exhibit-shop': '🏪 Cửa hàng mậu dịch',
  'exhibit-witness': '👴 Góc nhân chứng',
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
    language 
  } = useMuseum();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'clues' | 'deduction'>('clues');
  
  // States for Deduction Game
  const [selectedEvidences, setSelectedEvidences] = useState<Record<number, string[]>>({
    1: [], 2: [], 3: [], 4: [], 5: []
  });
  const [selectedConclusions, setSelectedConclusions] = useState<Record<number, string>>({
    1: '', 2: '', 3: '', 4: '', 5: ''
  });
  const [score, setScore] = useState<number | null>(null);
  const [incorrectQuestions, setIncorrectQuestions] = useState<number[]>([]);
  const [finalQuestionOpen, setFinalQuestionOpen] = useState(false);
  const [finalAnswer, setFinalAnswer] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);

  // Open notebook automatically when all clues are collected
  useEffect(() => {
    if (cluesCollected.length === 6 && !roomOneCompleted) {
      setIsOpen(true);
      setActiveTab('deduction');
    }
  }, [cluesCollected.length, roomOneCompleted]);

  if (!activeGallery || activeGallery.id !== 'gallery-subsidy' || !nickname) return null;

  const toggleEvidence = (qId: number, exhId: string) => {
    setSelectedEvidences(prev => {
      const current = prev[qId];
      const updated = current.includes(exhId) 
        ? current.filter(id => id !== exhId)
        : [...current, exhId];
      return { ...prev, [qId]: updated };
    });
  };

  const handleConclusionChange = (qId: number, val: string) => {
    setSelectedConclusions(prev => ({ ...prev, [qId]: val }));
  };

  const handleCheckDeduction = () => {
    let currentScore = 0;
    const incorrects: number[] = [];

    DEDUCTION_QUESTIONS.forEach(q => {
      // Check Evidence matches (sort array to check equality)
      const userEv = [...selectedEvidences[q.id]].sort();
      const correctEv = [...q.correctEvidence].sort();
      
      const evMatches = userEv.length === correctEv.length && userEv.every((v, i) => v === correctEv[i]);
      const conclMatches = selectedConclusions[q.id] === q.correctConclusion;

      if (evMatches && conclMatches) {
        currentScore += 4;
      } else {
        incorrects.push(q.id);
      }
    });

    setScore(currentScore);
    setIncorrectQuestions(incorrects);

    if (currentScore === 20) {
      setFinalQuestionOpen(true);
      setShowError(false);
      confetti({ particleCount: 80, spread: 60 });
    } else {
      setShowError(true);
    }
  };

  const handleFinalSubmit = () => {
    if (finalAnswer === 'no') {
      setRoomOneCompleted(true);
      confetti({ particleCount: 150, spread: 80, scalar: 1.2 });
      
      // Auto-unlock door for everyone in the room
      if (socket && socket.connected) {
        socket.emit('admin:open-door', { 
          doorId: 'door-room2', 
          targetRoom: 'gallery-paintings' 
        });
      }
    } else {
      alert(language === 'vi' ? 'Hãy suy nghĩ lại dựa trên các manh mối đã thu thập!' : 'Think again based on the clues collected!');
    }
  };

  const handleResetProgress = () => {
    if (confirm(language === 'vi' ? 'Bạn có muốn làm lại từ đầu không?' : 'Do you want to reset and start over?')) {
      resetRoomOne();
      setSelectedEvidences({ 1: [], 2: [], 3: [], 4: [], 5: [] });
      setSelectedConclusions({ 1: '', 2: '', 3: '', 4: '', 5: '' });
      setScore(null);
      setIncorrectQuestions([]);
      setFinalQuestionOpen(false);
      setFinalAnswer(null);
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* FLOATING ACTION BUTTON */}
      <div className="absolute right-4 bottom-4 z-40 pointer-events-auto">
        <button
          onClick={() => setIsOpen(true)}
          className={`flex items-center gap-2 px-5 py-3 rounded-full border shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer ${
            cluesCollected.length === 6 && !roomOneCompleted
              ? 'bg-amber-500 hover:bg-amber-400 border-amber-400 text-slate-950 font-bold animate-pulse'
              : roomOneCompleted
              ? 'bg-emerald-600 hover:bg-emerald-505 border-emerald-500 text-white font-semibold'
              : 'bg-slate-900/90 hover:bg-slate-850 border-slate-800 text-slate-100'
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
        <div className="absolute inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 pointer-events-auto">
          <div className="w-full max-w-4xl h-[85vh] bg-[#fbf9f5] border border-[#d8d3c5] rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-800 relative select-none animate-fade-in font-serif">
            
            {/* Lớp vân giấy cũ cổ điển */}
            <div className="absolute inset-0 bg-[radial-gradient(#ebe5d8_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

            {/* Header thanh tiêu đề */}
            <div className="bg-[#ebd9bd] border-b border-[#d2bba0] px-6 py-4 flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">📒</span>
                <div>
                  <h2 className="text-lg font-bold font-serif text-[#4e3629]">
                    {language === 'vi' ? 'SỔ TAY ĐIỀU TRA LỊCH SỬ' : 'HISTORICAL INVESTIGATION NOTEBOOK'}
                  </h2>
                  <p className="text-[10px] uppercase tracking-widest text-[#725b29] font-mono leading-none mt-1">
                    {language === 'vi' ? 'Chủ đề: Việt Nam trước Đổi Mới' : 'Subject: Vietnam Before Doi Moi'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="bg-black/5 hover:bg-black/10 text-slate-700 hover:text-black p-1.5 rounded-full border border-black/10 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Tabs chọn trang */}
            <div className="flex bg-[#f2ebd9] border-b border-[#e2d5c0] relative z-10">
              <button
                onClick={() => setActiveTab('clues')}
                className={`flex-1 py-3 text-xs font-mono font-bold uppercase tracking-wider border-r border-[#e2d5c0] transition-colors cursor-pointer ${
                  activeTab === 'clues' ? 'bg-[#fbf9f5] text-[#725b29] border-b-2 border-b-amber-600' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                1. Manh mối hiện vật ({cluesCollected.length}/6)
              </button>
              <button
                onClick={() => {
                  if (cluesCollected.length < 6) {
                    alert(language === 'vi' ? 'Hãy thu thập đủ 6 manh mối để mở khóa Bảng suy luận!' : 'Collect all 6 clues to unlock the Deduction page!');
                    return;
                  }
                  setActiveTab('deduction');
                }}
                className={`flex-1 py-3 text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer relative ${
                  activeTab === 'deduction' ? 'bg-[#fbf9f5] text-[#725b29] border-b-2 border-b-amber-600' : 'text-slate-500 hover:text-slate-800'
                } ${cluesCollected.length < 6 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                2. Bảng suy luận cuối phòng
                {cluesCollected.length < 6 && <span className="absolute right-4 text-[10px]">🔒</span>}
              </button>
            </div>

            {/* Nội dung Trang sổ */}
            <div className="flex-1 overflow-y-auto p-6 relative z-10 custom-scrollbar">
              
              {/* TAB 1: MANH MỐI HIỆN VẬT */}
              {activeTab === 'clues' && (
                <div className="space-y-6">
                  <div className="bg-[#ebd9bd]/20 border border-[#e5d5be] p-4 rounded-2xl">
                    <p className="text-sm italic text-slate-700 leading-relaxed">
                      "Hãy đi xung quanh phòng trưng bày, nhấp vào các hiện vật để quan sát, trả lời câu hỏi và thu thập các thông tin quan trọng đưa vào sổ tay. Các manh mối này là bằng chứng duy nhất giúp bạn suy luận ra cơ chế vận hành kinh tế thời kỳ bao cấp."
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {EXHIBITS_LIST.map((item) => {
                      const collected = cluesCollected.includes(item.id);
                      return (
                        <div 
                          key={item.id}
                          className={`border p-4 rounded-2xl transition-all relative ${
                            collected 
                              ? 'bg-white border-[#ebd9bd] shadow-sm' 
                              : 'bg-slate-200/40 border-dashed border-slate-300 opacity-60'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-mono text-xs font-bold text-slate-500 uppercase">
                              {EXHIBIT_LABELS[item.id]}
                            </span>
                            {collected ? (
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                <CheckCircle size={10} /> ĐÃ THU THẬP
                              </span>
                            ) : (
                              <span className="text-[10px] bg-slate-200 text-slate-500 font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                <HelpCircle size={10} /> CHƯA PHÁT HIỆN
                              </span>
                            )}
                          </div>
                          
                          <div className="mt-3">
                            {collected ? (
                              <div className="space-y-2">
                                <p className="text-sm font-bold text-[#725b29] font-serif">
                                  🔍 Manh mối: {item.clue}
                                </p>
                                <p className="text-xs text-slate-600 leading-relaxed font-sans text-justify">
                                  {item.desc}
                                </p>
                              </div>
                            ) : (
                              <div className="py-4 text-center">
                                <p className="text-xs text-slate-400 italic">
                                  Khám phá hiện vật trong phòng 3D để ghi nhận manh mối.
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {cluesCollected.length === 6 && !roomOneCompleted && (
                    <div className="pt-4 flex justify-center">
                      <button
                        onClick={() => setActiveTab('deduction')}
                        className="bg-amber-600 hover:bg-amber-700 text-white font-serif font-bold text-sm py-3 px-8 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2"
                      >
                        Tiến hành Bảng suy luận ngay
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: BẢNG SUY LUẬN CUỐI PHÒNG */}
              {activeTab === 'deduction' && (
                <div className="space-y-6">
                  {roomOneCompleted ? (
                    /* TRẠNG THÁI ĐÃ HOÀN THÀNH PHÒNG */
                    <div className="bg-emerald-50/70 border border-emerald-200 rounded-3xl p-8 text-center space-y-6 max-w-xl mx-auto my-6">
                      <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center border border-emerald-200 mx-auto animate-pulse">
                        <Award size={44} />
                      </div>
                      <div className="space-y-2">
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full font-bold uppercase tracking-widest font-mono">
                          HỒ SƠ ĐÃ HOÀN THÀNH (20/20 ĐIỂM)
                        </span>
                        <h3 className="text-2xl font-bold font-serif text-[#1e4620] mt-2">
                          Đã giải mã Phòng 01 thành công!
                        </h3>
                        <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed font-sans max-w-md mx-auto">
                          Bạn đã xuất sắc thu thập đủ bằng chứng và lập luận chính xác cơ chế hoạt động của nền kinh tế Việt Nam trước Đổi mới. Cửa phòng trưng bày kế tiếp (`Phòng 02: Hội họa`) hiện đã được mở!
                        </p>
                      </div>

                      <div className="bg-white/80 border border-emerald-100 p-5 rounded-2xl text-left space-y-3 font-serif">
                        <h4 className="text-sm font-bold text-emerald-950 uppercase border-b border-emerald-100 pb-1 font-mono">
                          KẾT LUẬN CỦA ĐIỀU TRA VIÊN
                        </h4>
                        <p className="text-xs text-slate-700 leading-relaxed text-justify">
                          Nền kinh tế Việt Nam giai đoạn 1976–1985 vận hành theo cơ chế **kế hoạch hóa tập trung bao cấp**. Trong cơ chế này, Nhà nước nắm quyền quyết định hầu hết các hoạt động kinh tế: sản xuất cái gì, sản xuất bao nhiêu, mức giá cố định là gì và phân phối cho ai bằng tem phiếu. Người dân và doanh nghiệp đóng vai trò thực thi chỉ tiêu, có rất ít quyền tự chủ thương mại.
                        </p>
                        <p className="text-[11px] text-amber-800 italic leading-relaxed pt-1">
                          "Có một câu nói kinh điển thời bao cấp: 'Có tiền chưa chắc đã mua được hàng'. Điều quyết định không phải là tiền, mà là tem phiếu và định mức. Điều này phản ánh cốt lõi của nền kinh tế chỉ huy."
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                          onClick={() => setIsOpen(false)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3.5 px-8 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer uppercase tracking-wider font-mono"
                        >
                          Tiếp tục tham quan
                        </button>
                        <button
                          onClick={handleResetProgress}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs py-3.5 px-6 rounded-full border border-slate-300 transition-colors cursor-pointer uppercase tracking-wider font-mono"
                        >
                          Làm lại từ đầu
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* TRẠNG THÁI ĐANG THỰC HIỆN SUY LUẬN */
                    <div className="space-y-6">
                      <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3">
                        <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={18} />
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-amber-900 uppercase font-mono tracking-wider">
                            Nhiệm vụ cuối phòng: Hoàn thành hồ sơ điều tra
                          </h4>
                          <p className="text-xs text-slate-700 leading-relaxed text-justify font-sans">
                            Ghép nối từng <b>Vấn đề cần điều tra</b> bên dưới với các <b>Bằng chứng (Hiện vật)</b> tương ứng trong phòng trưng bày và đưa ra <b>Kết luận nhóm</b> chính xác nhất. Mỗi câu trả lời đúng giúp đạt 4 điểm. Cần đạt 20 điểm tuyệt đối để mở câu hỏi kết luận.
                          </p>
                        </div>
                      </div>

                      {/* Danh sách 5 câu hỏi ghép nối */}
                      <div className="space-y-6">
                        {DEDUCTION_QUESTIONS.map((q, idx) => (
                          <div key={q.id} className="border border-slate-200 bg-white p-5 rounded-2xl space-y-4 shadow-sm relative">
                            {score !== null && (
                              <div className="absolute top-4 right-4">
                                {incorrectQuestions.includes(q.id) ? (
                                  <span className="text-rose-600 text-xs font-bold font-mono bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">❌ SAI</span>
                                ) : (
                                  <span className="text-emerald-600 text-xs font-bold font-mono bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">✅ ĐÚNG (+4đ)</span>
                                )}
                              </div>
                            )}
                            
                            <h4 className="text-sm font-bold text-[#725b29] font-serif pr-16 leading-relaxed">
                              Câu hỏi {q.id}: {q.question}
                            </h4>

                            {/* Chọn bằng chứng (Checkbox hiện vật) */}
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-mono">
                                Chọn bằng chứng đúng (Chọn các hiện vật liên quan):
                              </label>
                              <div className="flex flex-wrap gap-2">
                                {Object.entries(EXHIBIT_LABELS).map(([exhId, label]) => {
                                  const isSelected = selectedEvidences[q.id].includes(exhId);
                                  return (
                                    <button
                                      key={exhId}
                                      onClick={() => toggleEvidence(q.id, exhId)}
                                      className={`text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer font-serif ${
                                        isSelected 
                                          ? 'bg-amber-600 border-amber-600 text-white font-bold' 
                                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                                      }`}
                                    >
                                      {label}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Chọn kết luận */}
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-mono">
                                Kết luận đúc kết được:
                              </label>
                              <select
                                value={selectedConclusions[q.id]}
                                onChange={(e) => handleConclusionChange(q.id, e.target.value)}
                                className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-350 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-amber-600 font-serif leading-relaxed"
                              >
                                <option value="">-- Chọn kết luận tương ứng --</option>
                                {CONCLUSION_OPTIONS.map((opt, oIdx) => (
                                  <option key={oIdx} value={opt}>{opt}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Báo lỗi hoặc điểm */}
                      {score !== null && score < 20 && (
                        <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex items-center gap-2.5 text-rose-800">
                          <AlertCircle size={18} />
                          <span className="text-xs font-mono font-bold">
                            Lập luận chưa chính xác (Điểm: {score}/20). Vui lòng kiểm tra lại những câu đánh dấu ❌.
                          </span>
                        </div>
                      )}

                      {/* NÚT KIỂM TRA ĐIỂM */}
                      {!finalQuestionOpen && (
                        <div className="pt-2 flex justify-center">
                          <button
                            onClick={handleCheckDeduction}
                            className="bg-amber-600 hover:bg-amber-700 text-white font-serif font-bold text-sm py-4 px-10 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2"
                          >
                            Kiểm tra kết quả suy luận
                          </button>
                        </div>
                      )}

                      {/* CÂU HỎI CHỐT KHÓA CỔNG */}
                      {finalQuestionOpen && (
                        <div className="border-2 border-amber-500 bg-amber-500/5 p-6 rounded-3xl space-y-5 animate-fade-in relative">
                          <div className="absolute -top-3 left-6 bg-amber-500 text-slate-950 font-mono font-bold text-[9px] uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1">
                            <Sparkles size={10} /> ĐÃ ĐẠT 20/20 ĐIỂM
                          </div>
                          
                          <div className="space-y-2">
                            <h3 className="text-base font-bold font-serif text-[#725b29] leading-relaxed">
                              CÂU HỎI KẾT LUẬN PHÒNG:
                            </h3>
                            <p className="text-sm font-bold text-slate-900 font-serif leading-relaxed">
                              Dựa trên toàn bộ các chứng cứ lịch sử đã thu thập, theo bạn: Nền kinh tế Việt Nam giai đoạn 1976–1985 có vận hành theo cơ chế thị trường hay không?
                            </p>
                          </div>

                          <div className="space-y-2">
                            <button
                              onClick={() => setFinalAnswer('yes')}
                              className={`w-full text-left p-3.5 rounded-xl border text-xs leading-relaxed font-serif transition-all cursor-pointer ${
                                finalAnswer === 'yes'
                                  ? 'bg-rose-50 border-rose-300 text-rose-900 font-bold'
                                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              ○ Có, nền kinh tế lúc này tự do trao đổi và vận hành hoàn toàn theo quy luật cung - cầu thị trường.
                            </button>
                            <button
                              onClick={() => setFinalAnswer('no')}
                              className={`w-full text-left p-3.5 rounded-xl border text-xs leading-relaxed font-serif transition-all cursor-pointer ${
                                finalAnswer === 'no'
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              ○ Không, nền kinh tế vận hành theo cơ chế kế hoạch hóa tập trung, phân phối định mức và Nhà nước quyết định hoàn toàn.
                            </button>
                          </div>

                          <div className="flex justify-center pt-2">
                            <button
                              onClick={handleFinalSubmit}
                              className="bg-slate-900 hover:bg-slate-800 text-white font-serif font-bold text-xs py-3 px-8 rounded-full transition-transform hover:scale-105 active:scale-95 cursor-pointer uppercase tracking-wider font-mono"
                            >
                              Nộp kết luận điều tra
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Footer quyển sổ */}
            <div className="bg-[#f0e8d8] border-t border-[#e2d5c0] px-6 py-3 flex items-center justify-between text-[10px] font-mono text-slate-500 relative z-10">
              <span>Đại học FPT - MLN122 Project</span>
              <button 
                onClick={handleResetProgress}
                className="hover:underline hover:text-rose-600 font-bold cursor-pointer"
              >
                [Xóa tiến trình điều tra]
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InvestigationNotebook;
