'use client';

import React, { useState } from 'react';
import { useMuseum } from '@/context/MuseumContext';
import { 
  FileText, Award, AlertTriangle, TrendingUp, DollarSign, 
  ShoppingCart, Loader2, X, ChevronRight, CheckCircle2, AlertCircle, Play, Shield
} from 'lucide-react';
import { ROOM_THREE_DISPLAY_NAME } from '@/lib/roomThreeNarrative';

interface CauseCard {
  id: string;
  title: string;
  correct: boolean;
}

interface PolicyCard {
  id: string;
  title: string;
  correct: boolean;
}

export const RoomTwoDocumentModal: React.FC = () => {
  const {
    roomTwoSessionState,
    roomTwoDocOpen,
    setRoomTwoDocOpen,
    roomTwoScore,
    roomTwoScore2,
    roomTwoScore3,
    roomTwoScore4,
    nickname,
    socket
  } = useMuseum();

  const [submitting, setSubmitting] = useState<boolean>(false);

  // --- Session 1 State ---
  const [sliderValue, setSliderValue] = useState<number>(50);

  // --- Session 2 State ---
  const [selectedCauses, setSelectedCauses] = useState<string[]>([]);
  const causesList: CauseCard[] = [
    { id: 'machinery', title: '⚙️ Máy móc lạc hậu', correct: true },
    { id: 'materials', title: '📦 Thiếu nguyên liệu sản xuất', correct: true },
    { id: 'incentives', title: '👥 Không có động lực thúc đẩy sản xuất', correct: true },
    { id: 'market_demand', title: '📉 Nhu cầu thị trường thay đổi', correct: true },
    { id: 'responsibility', title: '😡 Người lao động thiếu trách nhiệm', correct: false },
    { id: 'surplus', title: '💰 Sản phẩm quá nhiều, không thể tiêu thụ', correct: false },
    { id: 'ad_cost', title: '📢 Chi phí quảng cáo tăng cao', correct: false },
  ];

  // --- Session 3 State ---
  const [selectedModel, setSelectedModel] = useState<'A' | 'B' | 'C' | null>(null);
  const [selectedPolicies3, setSelectedPolicies3] = useState<string[]>([]);
  const policiesList3: PolicyCard[] = [
    { id: 'policy1', title: '🏗️ Đầu tư cơ sở hạ tầng nông nghiệp', correct: true },
    { id: 'policy2', title: '📚 Hỗ trợ kỹ thuật, giống cây trồng', correct: true },
    { id: 'policy3', title: '📈 Cho phép người dân chủ động tổ chức sản xuất', correct: true },
    { id: 'policy4', title: '📋 Nhà nước quyết định toàn bộ sản lượng từng hộ', correct: false },
    { id: 'policy5', title: '🚫 Hạn chế người dân thay đổi phương án sản xuất', correct: false },
  ];

  // --- Session 4 State ---
  const [selectedPath, setSelectedPath] = useState<'1' | '2' | '3' | null>(null);
  const [selectedPolicies4, setSelectedPolicies4] = useState<string[]>([]);
  const policiesList4: PolicyCard[] = [
    { id: 'A', title: '🟢 A. Trao quyền tự chủ cho các đơn vị sản xuất, kinh doanh', correct: true },
    { id: 'B', title: '🟢 B. Phát triển nền kinh tế với sự tham gia của nhiều thành phần kinh tế', correct: true },
    { id: 'C', title: '🟢 C. Nhà nước quản lý nền kinh tế bằng pháp luật, chính sách và định hướng phát triển', correct: true },
    { id: 'D', title: '🔴 D. Nhà nước tiếp tục giao chỉ tiêu sản xuất chủ yếu, doanh nghiệp tự chủ trong phạm vi được cho phép', correct: false },
    { id: 'E', title: '🔴 E. Phát triển kinh tế thị trường, giảm tối đa sự can thiệp của Nhà nước để doanh nghiệp tự cạnh tranh', correct: false },
    { id: 'F', title: '🔴 F. Ưu tiên phát triển kinh tế Nhà nước, các thành phần kinh tế khác chỉ giữ vai trò hỗ trợ', correct: false },
  ];

  if (!roomTwoDocOpen) return null;

  // --- Submit Handlers ---
  const handleS1Submit = () => {
    if (!socket) return;
    setSubmitting(true);
    socket.emit('room2:submit-score', { session: 1, value: sliderValue });
    setTimeout(() => setSubmitting(false), 800);
  };

  const handleS2Submit = () => {
    if (!socket) return;
    setSubmitting(true);
    socket.emit('room2:submit-score', { session: 2, value: selectedCauses });
    setTimeout(() => setSubmitting(false), 800);
  };

  const handleS3Submit = () => {
    if (!socket) return;
    if (!selectedModel) {
      alert('Vui lòng chọn mô hình trước khi nộp!');
      return;
    }
    setSubmitting(true);
    socket.emit('room2:submit-score', { session: 3, value: selectedModel, selectedPolicies: selectedPolicies3 });
    setTimeout(() => setSubmitting(false), 800);
  };

  const handleS4Submit = () => {
    if (!socket) return;
    if (!selectedPath) {
      alert('Vui lòng chọn phương án đường lối trước khi nộp!');
      return;
    }
    setSubmitting(true);
    socket.emit('room2:submit-score', { session: 4, value: selectedPath, selectedPolicies: selectedPolicies4 });
    setTimeout(() => setSubmitting(false), 800);
  };

  // --- Toggle Helpers ---
  const handleToggleCause = (causeId: string) => {
    setSelectedCauses(prev => 
      prev.includes(causeId) ? prev.filter(id => id !== causeId) : [...prev, causeId]
    );
  };

  const handleTogglePolicy3 = (policyId: string) => {
    setSelectedPolicies3(prev => {
      if (prev.includes(policyId)) {
        return prev.filter(id => id !== policyId);
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), policyId]; // Giới hạn chọn tối đa 3 chính sách
      }
      return [...prev, policyId];
    });
  };

  const handleTogglePolicy4 = (policyId: string) => {
    setSelectedPolicies4(prev => {
      if (prev.includes(policyId)) {
        return prev.filter(id => id !== policyId);
      }
      if (prev.length >= 4) {
        return [...prev.slice(1), policyId]; // Giới hạn chọn tối đa 4 chính sách
      }
      return [...prev, policyId];
    });
  };

  // --- Labels/Styles Helpers ---
  const getSliderLabel = (val: number) => {
    if (val <= 30) return { text: 'Bình thường / Ổn định', color: 'text-emerald-600 font-bold' };
    if (val <= 50) return { text: 'Dấu hiệu khó khăn', color: 'text-amber-500 font-bold' };
    if (val <= 70) return { text: 'Khủng hoảng nhẹ', color: 'text-amber-600 font-bold' };
    if (val <= 80) return { text: 'Khủng hoảng trung bình', color: 'text-orange-600 font-black' };
    if (val <= 90) return { text: 'Khủng hoảng nghiêm trọng', color: 'text-red-600 font-black animate-pulse' };
    return { text: 'Khủng hoảng tột độ / Siêu lạm phát', color: 'text-rose-700 font-black animate-pulse' };
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-auto select-none">
      {/* Background backdrop overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md" 
        onClick={() => setRoomTwoDocOpen(false)}
      />

      {/* Main Leather/Gold Folder Layout — wider for session 1, 2, & 3 infographics */}
      <div className={`relative ${(roomTwoSessionState === 'session1' && roomTwoScore === null) || (roomTwoSessionState === 'session2' && roomTwoScore2 === null) || (roomTwoSessionState === 'session3' && roomTwoScore3 === null) ? 'w-[min(96vw,1280px)] h-[min(92vh,820px)]' : 'w-[min(94vw,680px)] h-[620px]'} max-h-[92vh] bg-[#fdfaf2] border-4 border-[#8c2525] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-scale-up font-sans transition-all duration-500`}>
        
        {/* Decorative Corner Borders */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-amber-500 rounded-tl-xl pointer-events-none" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-amber-500 rounded-tr-xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-amber-500 rounded-bl-xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-amber-500 rounded-br-xl pointer-events-none" />

        {/* Folder Header */}
        <div className="bg-[#8c2525] text-[#fdfaf2] px-6 py-4 flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-500/20 border border-amber-400/30 rounded-lg flex items-center justify-center">
              <FileText size={18} className="text-amber-300" />
            </div>
            <div>
              <p className="text-[10px] tracking-widest text-amber-300 uppercase font-black">
                Đại Hội Đại Biểu Toàn Quốc Lần Thứ VI (12/1986)
              </p>
              <h2 className="text-base font-bold leading-tight uppercase font-serif mt-0.5 tracking-wide text-white">
                Tài liệu nghiên cứu Đại biểu
              </h2>
            </div>
          </div>
          <button 
            onClick={() => setRoomTwoDocOpen(false)}
            className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Folder Content Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* ========================================== */}
          {/* STATE 1: WAITING                           */}
          {/* ========================================== */}
          {roomTwoSessionState === 'waiting' && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-5 py-8">
              {/* Badge icon */}
              <div className="relative">
                <div className="w-20 h-20 bg-amber-50 border-2 border-amber-300/60 rounded-full flex items-center justify-center shadow-md">
                  <Shield size={36} className="text-amber-600" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-pulse">
                  <span className="text-white text-[10px] font-black">!</span>
                </div>
              </div>

              <div className="space-y-3 max-w-md">
                <h3 className="text-lg font-bold text-[#8c2525] uppercase font-serif tracking-wider">
                  Hội trường chưa đủ đại biểu
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Phiên họp Đại hội Đại biểu Toàn quốc lần thứ VI chưa thể bắt đầu do chưa đủ số lượng đại biểu theo quy định.
                </p>

                {/* Delegate info card */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-4 shadow-inner space-y-3">
                  <div className="flex items-center justify-center gap-3">
                    <div className="flex -space-x-2">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="w-8 h-8 bg-amber-200 border-2 border-white rounded-full flex items-center justify-center shadow-sm">
                          <span className="text-amber-700 text-[10px] font-bold">👤</span>
                        </div>
                      ))}
                      <div className="w-8 h-8 bg-slate-200 border-2 border-white rounded-full flex items-center justify-center shadow-sm">
                        <span className="text-slate-400 text-[10px]">?</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Đại biểu đã đăng ký:</p>
                    <p className="text-base font-black text-amber-800 font-mono mt-0.5">
                      🪪 {nickname || 'Chưa đăng ký'}
                    </p>
                  </div>

                  <div className="bg-white/60 rounded-xl p-2.5 border border-amber-200/50">
                    <p className="text-[10px] text-amber-700 font-bold flex items-center justify-center gap-1.5">
                      <Loader2 size={12} className="animate-spin" />
                      Đang chờ Ban Chủ tịch khai mạc phiên họp...
                    </p>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 leading-relaxed font-sans pt-1 italic">
                  Vui lòng giữ nguyên vị trí ngồi. Các phiên thảo luận sẽ tự động được kích hoạt bởi Ban Chủ tịch Đại hội.
                </p>
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* SESSION 1: CRISIS INFOGRAPHIC + SLIDER    */}
          {/* ========================================== */}
          {roomTwoSessionState === 'session1' && (
            roomTwoScore === null ? (
              <div className="animate-fade-in -mx-6 -my-5">
                {/* Dark infographic wrapper */}
                <div className="bg-gradient-to-br from-[#0a1628] via-[#0f1d35] to-[#0a1628] text-white min-h-full">

                  {/* Title Banner */}
                  <div className="text-center py-4 border-b border-cyan-500/20">
                    <h2 className="text-xl sm:text-2xl font-black uppercase tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-cyan-300">
                      1. Biến động thị trường tự do
                    </h2>
                    <p className="text-[10px] text-cyan-400/60 mt-1 tracking-widest uppercase">Phân tích dữ liệu kinh tế giai đoạn 1976 – 1985</p>
                  </div>

                  {/* Two-column layout */}
                  <div className="flex flex-col lg:flex-row gap-4 p-4 sm:p-5">
                    {/* ═══ LEFT COLUMN: DATA PANELS ═══ */}
                    <div className="flex-1 space-y-4 min-w-0">

                      {/* Row 1: CPI Chart + Commodity Prices */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* 1. CHỈ SỐ GIÁ TIÊU DÙNG (CPI) */}
                        <div className="bg-[#111d33]/80 border border-cyan-500/15 rounded-xl p-3.5 space-y-2">
                          <h4 className="text-[10px] font-black text-cyan-300 uppercase tracking-wider">1. Chỉ số giá tiêu dùng (CPI)</h4>
                          <p className="text-[9px] text-slate-500">(Chỉ số, tháng 6/2024 = 100)</p>
                          {/* SVG Line Chart */}
                          <div className="relative h-[130px] w-full">
                            <svg viewBox="0 0 280 120" className="w-full h-full">
                              {/* Grid lines */}
                              <line x1="40" y1="10" x2="40" y2="100" stroke="#1e3a5f" strokeWidth="0.5"/>
                              <line x1="40" y1="100" x2="270" y2="100" stroke="#1e3a5f" strokeWidth="0.5"/>
                              {[100, 110, 120, 130, 140].map((v, i) => (
                                <g key={v}>
                                  <line x1="40" y1={100 - (v - 100) * 2.2} x2="270" y2={100 - (v - 100) * 2.2} stroke="#1e3a5f" strokeWidth="0.3" strokeDasharray="2,2"/>
                                  <text x="36" y={104 - (v - 100) * 2.2} textAnchor="end" fill="#64748b" fontSize="7">{v}</text>
                                </g>
                              ))}
                              {/* Data points & line */}
                              <polyline 
                                points="60,100 106,90.5 152,80.5 198,69.4 244,52.5 270,30" 
                                fill="none" stroke="#22d3ee" strokeWidth="2" strokeLinejoin="round"
                              />
                              {/* Glow effect */}
                              <polyline 
                                points="60,100 106,90.5 152,80.5 198,69.4 244,52.5 270,30" 
                                fill="none" stroke="#22d3ee" strokeWidth="4" strokeLinejoin="round" opacity="0.2"
                              />
                              {/* Area fill */}
                              <polygon
                                points="60,100 106,90.5 152,80.5 198,69.4 244,52.5 270,30 270,100 60,100"
                                fill="url(#cpiGrad)" opacity="0.3"
                              />
                              <defs>
                                <linearGradient id="cpiGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.4"/>
                                  <stop offset="100%" stopColor="#22d3ee" stopOpacity="0"/>
                                </linearGradient>
                              </defs>
                              {/* Data labels */}
                              {[
                                {x: 60, y: 100, v: '100', label: 'T1/2024'},
                                {x: 106, y: 90.5, v: '104.3', label: 'T2/2024'},
                                {x: 152, y: 80.5, v: '108.7', label: 'T3/2024'},
                                {x: 198, y: 69.4, v: '113.9', label: 'T4/2024'},
                                {x: 244, y: 52.5, v: '121.6', label: 'T5/2024'},
                                {x: 270, y: 30, v: '131.8', label: 'T6/2024'},
                              ].map((p, i) => (
                                <g key={i}>
                                  <circle cx={p.x} cy={p.y} r="3" fill="#22d3ee" stroke="#0a1628" strokeWidth="1.5"/>
                                  <text x={p.x} y={p.y - 8} textAnchor="middle" fill="#94a3b8" fontSize="6.5" fontWeight="bold">{p.v}</text>
                                  <text x={p.x} y="112" textAnchor="middle" fill="#475569" fontSize="5.5">{p.label}</text>
                                </g>
                              ))}
                            </svg>
                            {/* Highlight value */}
                            <div className="absolute top-1 right-1 text-right">
                              <span className="text-lg font-black text-cyan-300 font-mono">131.8</span>
                              <span className="block text-[9px] text-red-400 font-bold">↑ 31.8% <span className="text-slate-500">(so với T1/2024)</span></span>
                            </div>
                          </div>
                        </div>

                        {/* 2. GIÁ MỘT SỐ MẶT HÀNG THIẾT YẾU */}
                        <div className="bg-[#111d33]/80 border border-cyan-500/15 rounded-xl p-3.5 space-y-2">
                          <h4 className="text-[10px] font-black text-cyan-300 uppercase tracking-wider">2. Giá một số mặt hàng thiết yếu</h4>
                          <p className="text-[9px] text-slate-500">(Đơn vị: VND)</p>
                          <table className="w-full text-[10px] border-collapse">
                            <thead>
                              <tr className="border-b border-cyan-500/20 text-slate-400">
                                <th className="text-left py-1.5 pr-1">Mặt hàng</th>
                                <th className="text-right py-1.5 px-1">T1/2024</th>
                                <th className="text-right py-1.5 px-1 text-cyan-300">T6/2024</th>
                                <th className="text-right py-1.5 pl-1">% Tăng</th>
                              </tr>
                            </thead>
                            <tbody className="text-slate-300">
                              {[
                                {icon: '🍚', name: 'Gạo (kg)', t1: '15.000', t6: '22.500', pct: '50.0%'},
                                {icon: '🫗', name: 'Dầu ăn (lít)', t1: '30.000', t6: '45.000', pct: '50.0%'},
                                {icon: '🥩', name: 'Thịt lợn (kg)', t1: '120.000', t6: '168.000', pct: '40.0%'},
                                {icon: '🥚', name: 'Trứng gà (10 trứng)', t1: '20.000', t6: '28.000', pct: '40.0%'},
                                {icon: '🍜', name: 'Mì gói (1 gói)', t1: '4.000', t6: '6.000', pct: '50.0%'},
                              ].map((item, i) => (
                                <tr key={i} className="border-b border-white/5">
                                  <td className="py-1.5 pr-1 flex items-center gap-1"><span className="text-xs">{item.icon}</span> {item.name}</td>
                                  <td className="text-right py-1.5 px-1 font-mono text-slate-400">{item.t1}</td>
                                  <td className="text-right py-1.5 px-1 font-mono font-bold text-cyan-300">{item.t6}</td>
                                  <td className="text-right py-1.5 pl-1 font-bold text-red-400">↑ {item.pct}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Row 2: Living Cost + Black Market Comparison */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* 3. CHI PHÍ SINH HOẠT BÌNH QUÂN */}
                        <div className="bg-[#111d33]/80 border border-cyan-500/15 rounded-xl p-3.5 space-y-3">
                          <h4 className="text-[10px] font-black text-cyan-300 uppercase tracking-wider">3. Chi phí sinh hoạt bình quân / 1 hộ gia đình / tháng</h4>
                          <p className="text-[9px] text-slate-500">(Đơn vị: VND)</p>
                          <div className="flex items-end justify-center gap-6 py-2">
                            {/* Bar T1 */}
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-xs font-bold text-slate-300 font-mono">8.450.000</span>
                              <div className="w-14 bg-gradient-to-t from-slate-600 to-slate-500 rounded-t-lg" style={{height: '60px'}}/>
                              <span className="text-[9px] text-slate-500">T1/2024</span>
                            </div>
                            {/* Bar T6 */}
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-xs font-bold text-red-400 font-mono">12.980.000</span>
                              <div className="w-14 bg-gradient-to-t from-red-700 to-red-500 rounded-t-lg" style={{height: '92px'}}/>
                              <span className="text-[9px] text-slate-500">T6/2024</span>
                            </div>
                            {/* Percentage */}
                            <div className="flex flex-col items-center justify-center pb-6">
                              <span className="text-2xl font-black text-red-400 font-mono">↑ 53.6%</span>
                              <span className="text-[9px] text-slate-500">(so với T1/2024)</span>
                            </div>
                          </div>
                        </div>

                        {/* 4. CHÊNH LỆCH GIÁ CHỢ ĐEN SO VỚI GIÁ NHÀ NƯỚC */}
                        <div className="bg-[#111d33]/80 border border-cyan-500/15 rounded-xl p-3.5 space-y-2">
                          <h4 className="text-[10px] font-black text-cyan-300 uppercase tracking-wider">4. Chênh lệch giá chợ đen so với giá Nhà nước</h4>
                          <p className="text-[9px] text-slate-500">(Đơn vị: VND)</p>
                          <table className="w-full text-[10px] border-collapse">
                            <thead>
                              <tr className="border-b border-cyan-500/20 text-slate-400">
                                <th className="text-left py-1.5 pr-1">Mặt hàng</th>
                                <th className="text-right py-1.5">Giá Nhà nước</th>
                                <th className="text-right py-1.5 text-amber-400">Giá chợ đen</th>
                                <th className="text-right py-1.5">Chênh lệch</th>
                              </tr>
                            </thead>
                            <tbody className="text-slate-300">
                              {[
                                {icon: '🍚', name: 'Gạo (kg)', gov: '15.000', black: '24.000', diff: '+60.0%'},
                                {icon: '⛽', name: 'Xăng RON 95 (lít)', gov: '24.000', black: '32.000', diff: '+33.3%'},
                                {icon: '🫗', name: 'Dầu ăn (lít)', gov: '30.000', black: '48.000', diff: '+60.0%'},
                                {icon: '💊', name: 'Thuốc cảm (hộp)', gov: '25.000', black: '40.000', diff: '+60.0%'},
                              ].map((item, i) => (
                                <tr key={i} className="border-b border-white/5">
                                  <td className="py-1.5 pr-1 flex items-center gap-1"><span className="text-xs">{item.icon}</span> {item.name}</td>
                                  <td className="text-right py-1.5 font-mono text-slate-400">{item.gov}</td>
                                  <td className="text-right py-1.5 font-mono font-bold text-amber-400">{item.black}</td>
                                  <td className="text-right py-1.5 font-bold text-emerald-400">{item.diff}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Row 3: Goods Circulation Status */}
                      <div className="bg-[#111d33]/80 border border-cyan-500/15 rounded-xl p-3.5 space-y-2">
                        <h4 className="text-[10px] font-black text-cyan-300 uppercase tracking-wider">5. Tình trạng lưu thông hàng hóa <span className="text-slate-500 font-normal">(Khảo sát tại 10 chợ lớn)</span></h4>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { label: 'Tỷ lệ hàng hóa khan hiếm', value: '67%', color: 'text-red-400', bar: 'bg-red-500/30', w: 'w-[67%]', barColor: 'bg-red-500' },
                            { label: 'Tỷ lệ mua được hàng qua tem phiếu', value: '42%', color: 'text-amber-400', bar: 'bg-amber-500/30', w: 'w-[42%]', barColor: 'bg-amber-500' },
                            { label: 'Tỷ lệ người dân mua chợ đen', value: '78%', color: 'text-cyan-300', bar: 'bg-cyan-500/30', w: 'w-[78%]', barColor: 'bg-cyan-500' },
                          ].map((stat, i) => (
                            <div key={i} className="space-y-1">
                              <p className="text-[9px] text-slate-400">{stat.label}</p>
                              <span className={`text-lg font-black font-mono ${stat.color}`}>{stat.value}</span>
                              <div className={`h-1.5 rounded-full ${stat.bar}`}>
                                <div className={`h-full rounded-full ${stat.barColor} ${stat.w}`}/>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* ═══ RIGHT COLUMN: MISSION / TASK ═══ */}
                    <div className="lg:w-[340px] shrink-0 space-y-4">
                      {/* Context briefing */}
                      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3.5">
                        <p className="text-[11px] text-amber-200/90 leading-relaxed">
                          <span className="font-bold text-amber-300">📋 Báo cáo tình hình: </span>
                          Trong những năm gần đây, giá nhiều mặt hàng thiết yếu liên tục tăng. Chi phí sinh hoạt của người dân ngày càng cao, trong khi thu nhập không tăng tương ứng.
                        </p>
                      </div>

                      {/* Mission Card */}
                      <div className="bg-gradient-to-br from-[#1a1208] to-[#2a1a0a] border-2 border-amber-500/30 rounded-2xl p-5 space-y-5 shadow-lg shadow-amber-500/5">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-amber-500/20 border border-amber-500/30 rounded-lg flex items-center justify-center">
                            <AlertTriangle size={16} className="text-amber-400 animate-pulse" />
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-amber-300 uppercase tracking-wider">Nhiệm vụ</h4>
                            <p className="text-[10px] text-amber-200/60">Đánh giá mức độ nghiêm trọng</p>
                          </div>
                        </div>

                        <p className="text-[11px] text-amber-100/70 leading-relaxed">
                          Dựa trên các số liệu về giá cả, chi phí sinh hoạt và tình trạng lưu thông hàng hóa, hãy đánh giá <span className="text-amber-300 font-bold">mức độ nghiêm trọng</span> của cuộc khủng hoảng kinh tế này.
                        </p>

                        {/* Slider */}
                        <div className="space-y-3">
                          <div className="relative py-1">
                            <input 
                              type="range" min="0" max="100" value={sliderValue} 
                              onChange={(e) => setSliderValue(parseInt(e.target.value))}
                              className="w-full h-2.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                              style={{background: `linear-gradient(to right, #22c55e 0%, #eab308 50%, #ef4444 100%)`}}
                            />
                            <div className="flex justify-between text-[9px] font-bold text-slate-500 mt-1">
                              <span>0 (Bình thường)</span>
                              <span>50</span>
                              <span>100 (Khủng hoảng)</span>
                            </div>
                          </div>

                          {/* Current Value Display */}
                          <div className="flex flex-col items-center p-4 bg-[#0a1628] border border-amber-500/20 rounded-xl text-center">
                            <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">Mức đánh giá hiện tại</span>
                            <span className="text-4xl font-mono font-black text-amber-400 mt-1">{sliderValue}%</span>
                            <span className={`text-xs mt-1 ${getSliderLabel(sliderValue).color}`}>{getSliderLabel(sliderValue).text}</span>
                          </div>

                          {/* Submit button */}
                          <button 
                            onClick={handleS1Submit} disabled={submitting}
                            className="w-full px-8 py-3.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-amber-500/20 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                          >
                            {submitting ? <Loader2 size={14} className="animate-spin" /> : '📝 Nộp kết quả đánh giá'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-12 animate-scale-up">
                <CheckCircle2 size={48} className="text-emerald-600 animate-pulse" />
                <h3 className="text-lg font-bold text-[#5c3d1a] uppercase font-serif">Đã nộp báo cáo phiên thứ nhất</h3>
                <div className="bg-[#f0fdf4] border-2 border-emerald-200 rounded-2xl p-5 shadow-md max-w-xs mx-auto">
                  <span className="text-[10px] text-emerald-800 uppercase tracking-widest font-black block">ĐIỂM NHẬN DIỆN KHỦNG HOẢNG</span>
                  <span className="text-4xl font-black text-emerald-700 font-mono block mt-1">+{roomTwoScore}đ</span>
                </div>
                <p className="text-xs text-slate-500 max-w-sm">Vui lòng chờ ban tổ chức kích hoạt phiên họp tiếp theo.</p>
              </div>
            )
          )}

          {/* ========================================== */}
          {/* SESSION 2: PLAN VS ACTUAL COMPARISON TABLE */}
          {/* ========================================== */}
          {roomTwoSessionState === 'session2' && (
            roomTwoScore2 === null ? (
              <div className="animate-fade-in -mx-6 -my-5 flex flex-col lg:flex-row gap-4 p-4 sm:p-5 bg-slate-50 min-h-full">
                
                {/* ═══ LEFT COLUMN: INTERACTIVE DRAG & DROP MISSION ═══ */}
                <div className="lg:w-[380px] shrink-0 space-y-4 flex flex-col justify-between">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="bg-[#8c2525] text-white p-4 rounded-2xl shadow-md border border-[#701c1c]">
                      <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-2 text-amber-300">
                        <AlertTriangle size={16} className="animate-pulse" />
                        Nhiệm vụ: Phân tích nguyên nhân
                      </h4>
                      <p className="text-[10px] text-amber-100/80 mt-1 leading-relaxed">
                        Hãy kéo thả hoặc click chọn các thẻ nguyên nhân dưới đây để phân loại vào hai bảng tương ứng. Tìm ra các nguyên nhân thực sự khiến sản xuất kém hiệu quả.
                      </p>
                    </div>

                    {/* Drag-and-Drop Area / Two Boards */}
                    <div className="space-y-4">
                      
                      {/* BOARD A: NGUYÊN NHÂN CHÍNH */}
                      <div 
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          const id = e.dataTransfer.getData('text/plain');
                          if (id && !selectedCauses.includes(id)) {
                            setSelectedCauses(prev => [...prev, id]);
                          }
                        }}
                        className="border-2 border-dashed border-red-300 bg-red-50/50 rounded-2xl p-3 min-h-[160px] transition-all hover:bg-red-50/80 shadow-inner"
                      >
                        <p className="text-[10px] text-red-800 font-black uppercase tracking-wider border-b border-red-200 pb-1 mb-2 flex items-center justify-between">
                          <span>📌 Nguyên nhân chính (Kém hiệu quả):</span>
                          <span className="text-[9px] text-slate-450 font-normal normal-case">Thả thẻ vào đây</span>
                        </p>
                        {selectedCauses.length === 0 ? (
                          <div className="text-slate-400 italic text-[10px] text-center py-10">Kéo thẻ vào đây hoặc click thẻ phía dưới...</div>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {selectedCauses.map(id => {
                              const item = causesList.find(c => c.id === id);
                              return (
                                <div 
                                  key={id} 
                                  draggable
                                  onDragStart={(e) => e.dataTransfer.setData('text/plain', id)}
                                  onClick={() => handleToggleCause(id)}
                                  className="bg-red-100 border border-red-200 text-red-800 px-2.5 py-1.5 rounded-xl text-[10px] font-bold cursor-pointer hover:bg-red-200 transition-all flex items-center gap-1 shadow-sm active:scale-95"
                                >
                                  <span>{item?.title}</span>
                                  <span className="text-red-500 font-bold ml-1">✕</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* BOARD B: KHÔNG PHẢI NGUYÊN NHÂN CHÍNH */}
                      <div 
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          const id = e.dataTransfer.getData('text/plain');
                          if (id && selectedCauses.includes(id)) {
                            setSelectedCauses(prev => prev.filter(x => x !== id));
                          }
                        }}
                        className="border-2 border-dashed border-slate-350 bg-slate-100/50 rounded-2xl p-3 min-h-[160px] transition-all hover:bg-slate-100/80 shadow-inner"
                      >
                        <p className="text-[10px] text-slate-700 font-black uppercase tracking-wider border-b border-slate-200 pb-1 mb-2 flex items-center justify-between">
                          <span>💡 Thẻ chưa phân loại / Không phải nguyên nhân:</span>
                          <span className="text-[9px] text-slate-450 font-normal normal-case">Kéo thẻ thả vào đây</span>
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {causesList.filter(c => !selectedCauses.includes(c.id)).map(c => (
                            <div 
                              key={c.id} 
                              draggable
                              onDragStart={(e) => e.dataTransfer.setData('text/plain', c.id)}
                              onClick={() => handleToggleCause(c.id)}
                              className="bg-white border border-slate-200 text-slate-700 px-2.5 py-1.5 rounded-xl text-[10px] font-bold cursor-pointer hover:border-slate-300 hover:shadow-sm transition-all flex items-center gap-1 shadow-sm active:scale-95"
                            >
                              <span>{c.title}</span>
                              <span className="text-emerald-500 font-bold ml-1">➔</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4 border-t border-slate-200">
                    <button 
                      onClick={handleS2Submit} disabled={submitting}
                      className="w-full px-8 py-3.5 bg-gradient-to-r from-[#8c2525] to-[#701c1c] hover:from-[#701c1c] hover:to-[#5a1616] text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {submitting ? <Loader2 size={14} className="animate-spin" /> : '📝 Nộp kết quả phân tích'}
                    </button>
                  </div>
                </div>

                {/* ═══ RIGHT COLUMN: DETAILED PLAN VS ACTUAL CHART TABLE ═══ */}
                <div className="flex-1 bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-md flex flex-col justify-between overflow-x-auto min-w-0">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                      <span className="text-2xl">📊</span>
                      <h3 className="text-base font-black text-slate-800 uppercase tracking-wider font-serif">
                        Bảng đối chiếu kế hoạch - thực hiện (Năm 1985)
                      </h3>
                    </div>

                    {/* Table */}
                    <div className="w-full min-w-[700px]">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="text-[10px] font-bold uppercase tracking-wider text-white">
                            <th className="bg-[#0f4c81] p-3 rounded-tl-xl border-r border-[#155a96] w-[20%] text-center">Chỉ tiêu</th>
                            <th className="bg-[#1f75fe] p-3 border-r border-[#3a85ff] w-[30%] text-center">Kế hoạch được giao</th>
                            <th className="bg-[#2e7d32] p-3 border-r border-[#388e3c] w-[30%] text-center">Kết quả thực tế</th>
                            <th className="bg-[#0f4c81] p-3 rounded-tr-xl w-[20%] text-center">Đánh giá</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
                          
                          {/* Row 1: Sản lượng sản xuất */}
                          <tr className="hover:bg-slate-50/50">
                            <td className="p-3 border-r border-slate-100 font-bold flex items-center gap-2">
                              <span className="text-xl">🏭</span>
                              <div className="leading-tight">
                                <p className="font-black text-slate-850">Sản lượng</p>
                                <p className="font-black text-slate-850">sản xuất</p>
                              </div>
                            </td>
                            <td className="p-3 border-r border-slate-100 text-center space-y-2">
                              <p className="font-black text-[#1f75fe] text-xs">10.000 <span className="text-[10px] text-slate-500 font-normal">sản phẩm/năm</span></p>
                              <div className="w-full bg-slate-100 h-2.5 rounded-full relative overflow-hidden">
                                <div className="bg-[#1f75fe] h-full rounded-full w-full" />
                              </div>
                              <div className="flex justify-between text-[8px] text-slate-400 font-bold px-0.5">
                                <span>0</span>
                                <span>5.000</span>
                                <span>10.000</span>
                              </div>
                            </td>
                            <td className="p-3 border-r border-slate-100 text-center space-y-2">
                              <p className="font-black text-[#2e7d32] text-xs">6.000 <span className="text-[10px] text-slate-500 font-normal">sản phẩm/năm</span></p>
                              <div className="w-full bg-slate-100 h-2.5 rounded-full relative overflow-hidden">
                                <div className="bg-[#2e7d32] h-full rounded-full w-[60%]" />
                              </div>
                              <div className="flex justify-between text-[8px] text-slate-400 font-bold px-0.5">
                                <span>0</span>
                                <span>5.000</span>
                                <span>10.000</span>
                              </div>
                            </td>
                            <td className="p-3 text-center flex flex-col items-center justify-center gap-1 min-h-[90px]">
                              {/* Radial Progress Ring */}
                              <svg className="w-10 h-10 transform -rotate-90">
                                <circle cx="20" cy="20" r="16" stroke="#f1f5f9" strokeWidth="4" fill="transparent" />
                                <circle cx="20" cy="20" r="16" stroke="#1f75fe" strokeWidth="4" fill="transparent" strokeDasharray={2 * Math.PI * 16} strokeDashoffset={2 * Math.PI * 16 * (1 - 0.6)} />
                              </svg>
                              <p className="text-[10px] font-black text-slate-800">Hoàn thành 60%</p>
                            </td>
                          </tr>

                          {/* Row 2: Tỷ lệ hoàn thành */}
                          <tr className="hover:bg-slate-50/50">
                            <td className="p-3 border-r border-slate-100 font-bold flex items-center gap-2">
                              <span className="text-xl">🎯</span>
                              <div className="leading-tight">
                                <p className="font-black text-slate-850">Tỷ lệ</p>
                                <p className="font-black text-slate-850">hoàn thành</p>
                              </div>
                            </td>
                            <td className="p-3 border-r border-slate-100 text-center space-y-2">
                              <p className="font-black text-[#1f75fe] text-xs">100%</p>
                              <div className="w-full bg-slate-100 h-2.5 rounded-full relative overflow-hidden">
                                <div className="bg-[#1f75fe] h-full rounded-full w-full" />
                              </div>
                              <div className="flex justify-between text-[8px] text-slate-400 font-bold px-0.5">
                                <span>0%</span>
                                <span>50%</span>
                                <span>100%</span>
                              </div>
                            </td>
                            <td className="p-3 border-r border-slate-100 text-center space-y-2">
                              <p className="font-black text-[#2e7d32] text-xs">60%</p>
                              <div className="w-full bg-slate-100 h-2.5 rounded-full relative overflow-hidden">
                                <div className="bg-[#2e7d32] h-full rounded-full w-[60%]" />
                              </div>
                              <div className="flex justify-between text-[8px] text-slate-400 font-bold px-0.5">
                                <span>0%</span>
                                <span>50%</span>
                                <span>100%</span>
                              </div>
                            </td>
                            <td className="p-3 text-center flex flex-col items-center justify-center gap-1 min-h-[90px]">
                              <svg className="w-10 h-10 transform -rotate-90">
                                <circle cx="20" cy="20" r="16" stroke="#f1f5f9" strokeWidth="4" fill="transparent" />
                                <circle cx="20" cy="20" r="16" stroke="#2e7d32" strokeWidth="4" fill="transparent" strokeDasharray={2 * Math.PI * 16} strokeDashoffset={2 * Math.PI * 16 * (1 - 0.6)} />
                              </svg>
                              <p className="text-[10px] font-black text-slate-800">Hoàn thành 60%</p>
                            </td>
                          </tr>

                          {/* Row 3: Năng lực máy móc */}
                          <tr className="hover:bg-slate-50/50">
                            <td className="p-3 border-r border-slate-100 font-bold flex items-center gap-2">
                              <span className="text-xl">⚙️</span>
                              <div className="leading-tight">
                                <p className="font-black text-slate-850">Năng lực</p>
                                <p className="font-black text-slate-850">máy móc</p>
                              </div>
                            </td>
                            <td className="p-3 border-r border-slate-100 text-center space-y-1">
                              <p className="font-black text-slate-700 text-[11px] mb-1">Đáp ứng đủ theo kế hoạch</p>
                              {/* Semicircle Gauge Dial Pointing Right (High) */}
                              <div className="relative w-20 h-10 mx-auto overflow-hidden">
                                <div className="absolute top-0 left-0 w-20 h-20 border-8 border-slate-200 rounded-full" />
                                <div className="absolute top-0 left-0 w-20 h-20 border-8 border-[#1f75fe] rounded-full border-b-transparent border-l-transparent" />
                                <div className="absolute bottom-0 left-[36px] w-2 h-8 bg-slate-800 origin-bottom transform rotate-45 rounded-t-full" />
                              </div>
                              <p className="text-[8px] font-bold text-slate-500 uppercase mt-0.5">Tốt</p>
                            </td>
                            <td className="p-3 border-r border-slate-100 text-center space-y-1">
                              <p className="font-black text-amber-600 text-[11px] mb-1">Hoạt động không ổn định</p>
                              {/* Semicircle Gauge Dial Pointing Center (Middle) */}
                              <div className="relative w-20 h-10 mx-auto overflow-hidden">
                                <div className="absolute top-0 left-0 w-20 h-20 border-8 border-slate-200 rounded-full" />
                                <div className="absolute top-0 left-0 w-20 h-20 border-8 border-amber-400 rounded-full border-b-transparent border-l-transparent border-r-transparent" />
                                <div className="absolute bottom-0 left-[36px] w-2 h-8 bg-slate-800 origin-bottom transform rotate-0 rounded-t-full" />
                              </div>
                              <p className="text-[8px] font-bold text-slate-500 uppercase mt-0.5">Trung bình</p>
                            </td>
                            <td className="p-3 text-center flex flex-col items-center justify-center gap-1.5 min-h-[90px]">
                              <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white text-sm shadow-sm">
                                👤
                              </div>
                              <p className="text-[10px] font-black text-amber-700 leading-tight">Không ổn định</p>
                            </td>
                          </tr>

                          {/* Row 4: Nguyên liệu đầu vào */}
                          <tr className="hover:bg-slate-50/50">
                            <td className="p-3 border-r border-slate-100 font-bold flex items-center gap-2">
                              <span className="text-xl">📦</span>
                              <div className="leading-tight">
                                <p className="font-black text-slate-850">Nguyên liệu</p>
                                <p className="font-black text-slate-850">đầu vào</p>
                              </div>
                            </td>
                            <td className="p-3 border-r border-slate-100 text-center space-y-1.5">
                              <p className="font-black text-slate-700 text-[11px]">Được dự kiến cung cấp đầy đủ</p>
                              <div className="flex justify-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <span key={i} className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 font-bold text-[10px] flex items-center justify-center border border-blue-200 shadow-sm">✓</span>
                                ))}
                              </div>
                              <p className="text-[9px] font-bold text-slate-400">Đầy đủ</p>
                            </td>
                            <td className="p-3 border-r border-slate-100 text-center space-y-1.5">
                              <p className="font-black text-red-500 text-[11px]">Thường xuyên thiếu hụt</p>
                              <div className="flex justify-center gap-1">
                                <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 font-bold text-[10px] flex items-center justify-center border border-green-250 shadow-sm">✓</span>
                                <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 font-bold text-[10px] flex items-center justify-center border border-green-250 shadow-sm">✓</span>
                                <span className="w-5 h-5 rounded-full bg-red-100 text-red-650 font-bold text-[10px] flex items-center justify-center border border-red-200 shadow-sm">✗</span>
                                <span className="w-5 h-5 rounded-full bg-red-100 text-red-655 font-bold text-[10px] flex items-center justify-center border border-red-200 shadow-sm">✗</span>
                                <span className="w-5 h-5 rounded-full bg-red-100 text-red-655 font-bold text-[10px] flex items-center justify-center border border-red-200 shadow-sm">✗</span>
                              </div>
                              <p className="text-[9px] font-bold text-slate-400">Thiếu hụt</p>
                            </td>
                            <td className="p-3 text-center flex flex-col items-center justify-center gap-1.5 min-h-[90px]">
                              <div className="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                                ✕
                              </div>
                              <p className="text-[9px] font-black text-red-650 leading-tight">Thiếu hụt thường xuyên</p>
                            </td>
                          </tr>

                          {/* Row 5: Năng suất lao động */}
                          <tr className="hover:bg-slate-50/50">
                            <td className="p-3 border-r border-slate-100 font-bold flex items-center gap-2 rounded-bl-xl">
                              <span className="text-xl">📈</span>
                              <div className="leading-tight">
                                <p className="font-black text-slate-850">Năng suất</p>
                                <p className="font-black text-slate-850">lao động</p>
                              </div>
                            </td>
                            <td className="p-3 border-r border-slate-100 text-center space-y-1">
                              <p className="font-black text-slate-700 text-[11px] mb-1">Theo mục tiêu đề ra</p>
                              <div className="relative w-20 h-10 mx-auto overflow-hidden">
                                <div className="absolute top-0 left-0 w-20 h-20 border-8 border-slate-200 rounded-full" />
                                <div className="absolute top-0 left-0 w-20 h-20 border-8 border-[#1f75fe] rounded-full border-b-transparent border-l-transparent" />
                                <div className="absolute bottom-0 left-[36px] w-2 h-8 bg-slate-800 origin-bottom transform rotate-45 rounded-t-full" />
                              </div>
                              <p className="text-[8px] font-bold text-slate-500 uppercase mt-0.5">Đạt mục tiêu</p>
                            </td>
                            <td className="p-3 border-r border-slate-100 text-center space-y-1">
                              <p className="font-black text-orange-550 text-[11px] mb-1">Thấp hơn dự kiến</p>
                              <div className="relative w-20 h-10 mx-auto overflow-hidden">
                                <div className="absolute top-0 left-0 w-20 h-20 border-8 border-slate-200 rounded-full" />
                                <div className="absolute top-0 left-0 w-20 h-20 border-8 border-orange-500 rounded-full border-b-transparent border-r-transparent" />
                                <div className="absolute bottom-0 left-[36px] w-2 h-8 bg-slate-800 origin-bottom transform rotate-[-45deg] rounded-t-full" />
                              </div>
                              <p className="text-[8px] font-bold text-slate-500 uppercase mt-0.5">Thấp</p>
                            </td>
                            <td className="p-3 text-center flex flex-col items-center justify-center gap-1.5 min-h-[90px] rounded-br-xl">
                              <span className="text-2xl">🙁</span>
                              <p className="text-[10px] font-black text-orange-600 leading-tight">Thấp hơn dự kiến</p>
                            </td>
                          </tr>

                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-12 animate-scale-up">
                <CheckCircle2 size={48} className="text-emerald-600 animate-pulse" />
                <h3 className="text-lg font-bold text-[#5c3d1a] uppercase font-serif">Nộp kết quả phân tích thành công</h3>
                <div className="bg-[#f0fdf4] border-2 border-emerald-200 rounded-2xl p-5 shadow-md max-w-sm mx-auto">
                  <span className="text-[10px] text-emerald-800 uppercase tracking-widest font-black block">ĐIỂM NHẬN DIỆN NGUYÊN NHÂN</span>
                  <span className="text-4xl font-black text-emerald-700 font-mono block mt-1">+{roomTwoScore2}đ</span>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm text-left text-[10px] text-slate-500 max-w-sm space-y-1">
                  <p className="font-bold text-slate-700 border-b pb-0.5 mb-1">Đáp án đúng & Giải thích:</p>
                  <div>• <strong>Máy móc lạc hậu (2.5đ):</strong> Công nghệ cũ làm năng suất thấp.</div>
                  <div>• <strong>Thiếu nguyên liệu (2.5đ):</strong> Sản xuất bị gián đoạn.</div>
                  <div>• <strong>Không có động lực (2.5đ):</strong> Cơ chế bao cấp làm giảm tính chủ động.</div>
                  <div>• <strong>Nhu cầu thay đổi (2.5đ):</strong> Sản xuất chưa gắn với nhu cầu thực tế.</div>
                </div>
                <p className="text-xs text-slate-500">Vui lòng chờ ban tổ chức kích hoạt phiên tiếp theo.</p>
              </div>
            )
          )}

          {/* ========================================== */}
          {/* SESSION 3: AGRICULTURAL POLICY REFORM      */}
          {/* ========================================== */}
          {roomTwoSessionState === 'session3' && (
            roomTwoScore3 === null ? (
              <div className="animate-fade-in -mx-6 -my-5 flex flex-col lg:flex-row gap-4 p-4 sm:p-5 bg-[#f0f4f1] min-h-full">
                
                {/* ═══ LEFT COLUMN: INTERACTIVE SELECTION MISSION ═══ */}
                <div className="lg:w-[380px] shrink-0 space-y-4 flex flex-col justify-between">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="bg-[#1b4332] text-white p-4 rounded-2xl shadow-md border border-[#143225]">
                      <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-2 text-amber-300">
                        <Award size={16} className="animate-bounce" />
                        Nhiệm vụ: Cải cách nông nghiệp
                      </h4>
                      <p className="text-[10px] text-amber-100/90 mt-1 leading-relaxed">
                        Hãy lựa chọn mô hình quản lý sản xuất tối ưu nhất và 3 chính sách hỗ trợ đi kèm để giải phóng sức lao động của người nông dân.
                      </p>
                    </div>

                    {/* Step 1: Select Model */}
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-slate-700">Bước 1: Chọn mô hình quản lý sản xuất</p>
                      <div className="grid grid-cols-1 gap-2.5">
                        {[
                          {
                            id: 'A',
                            title: '🟥 Mô hình A: Quản lý tập trung hoàn toàn',
                            desc: 'Nhà nước quyết định hoàn toàn việc sản xuất gì, bao nhiêu, phân phối ra sao. Người dân rất ít quyền tự chủ.'
                          },
                          {
                            id: 'B',
                            title: '🟦 Mô hình B: Tự chủ hoàn toàn',
                            desc: 'Người dân tự quyết định trồng gì, số lượng bao nhiêu và tự tìm nơi tiêu thụ không cần sự can thiệp hay hướng dẫn của Nhà nước.'
                          },
                          {
                            id: 'C',
                            title: '🟩 Mô hình C: Kết hợp quản lý và tự chủ',
                            desc: 'Nhà nước định hướng, hỗ trợ kỹ thuật, an ninh lương thực. Người sản xuất chủ động chọn phương án gieo trồng và tự chịu trách nhiệm.'
                          }
                        ].map((model) => {
                          const isSelected = selectedModel === model.id;
                          return (
                            <button
                              key={model.id}
                              onClick={() => setSelectedModel(model.id as 'A' | 'B' | 'C')}
                              className={`w-full text-left p-3 rounded-2xl border text-xs transition-all flex flex-col gap-1 cursor-pointer ${
                                isSelected 
                                  ? 'bg-[#1b4332] border-transparent text-[#fdfaf2] shadow-md scale-[0.99]' 
                                  : 'bg-white border-slate-200 hover:border-slate-350 text-slate-700 shadow-sm'
                              }`}
                            >
                              <span className="font-bold flex items-center gap-1">{model.title}</span>
                              <span className={`text-[10px] pl-4 ${isSelected ? 'text-emerald-100/90' : 'text-slate-500'}`}>{model.desc}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Step 2: Select 3 policies */}
                    <div className="space-y-2 pt-2 border-t border-slate-200">
                      <div className="flex justify-between text-xs font-bold text-slate-700">
                        <span>Bước 2: Chọn 3 chính sách hỗ trợ đi kèm</span>
                        <span className="text-[10px] text-slate-400 font-normal">Đã chọn: {selectedPolicies3.length}/3</span>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {policiesList3.map((p) => {
                          const isChecked = selectedPolicies3.includes(p.id);
                          return (
                            <button
                              key={p.id}
                              onClick={() => handleTogglePolicy3(p.id)}
                              className={`w-full text-left p-2.5 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                                isChecked 
                                  ? 'bg-[#1b4332] border-transparent text-white font-medium shadow-sm' 
                                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-350 shadow-sm'
                              }`}
                            >
                              <span>{p.title}</span>
                              <span className={`text-[10px] ${isChecked ? 'text-emerald-100' : 'text-slate-400'}`}>
                                {isChecked ? '✓ Đã chọn' : '+ Chọn'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Submit button */}
                  <div className="pt-4 border-t border-slate-200">
                    <button 
                      onClick={handleS3Submit} disabled={submitting}
                      className="w-full px-8 py-3.5 bg-gradient-to-r from-[#1b4332] to-[#2d6a4f] hover:from-[#143225] hover:to-[#1b4332] text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {submitting ? <Loader2 size={14} className="animate-spin" /> : '📝 Đệ trình phương án cải tổ'}
                    </button>
                  </div>
                </div>

                {/* ═══ RIGHT COLUMN: AGRICULUTURE INFOGRAPHIC & PLAN ═══ */}
                <div className="flex-1 bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-md flex flex-col justify-between min-w-0">
                  <div className="space-y-4">
                    {/* Header Banner */}
                    <div className="bg-gradient-to-r from-[#1b4332] via-[#2d6a4f] to-[#40916c] rounded-2xl p-4 flex items-center justify-between text-white shadow-md">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-xl">
                          🌾
                        </div>
                        <div>
                          <h3 className="text-sm font-black uppercase tracking-wider font-serif">
                            Hồ sơ nông nghiệp – Năm 1985
                          </h3>
                          <p className="text-[10px] text-emerald-100/70">Dữ liệu phân tích thực trạng & động lực phát triển</p>
                        </div>
                      </div>
                      <div className="hidden sm:block text-2xl opacity-80">🌾</div>
                    </div>

                    {/* Content split */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* TÌNH HÌNH SẢN XUẤT */}
                      <div className="border border-slate-150 rounded-2xl p-3 space-y-3 bg-slate-50/50">
                        <h4 className="text-[11px] font-black text-[#1b4332] uppercase tracking-wider border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                          <span>🌱</span> Tình hình sản xuất
                        </h4>
                        
                        <div className="space-y-2.5">
                          {/* Item 1: Lao động nông nghiệp */}
                          <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm text-xs">
                            <div className="flex items-center gap-2 w-[45%]">
                              <span className="w-7 h-7 bg-emerald-50 rounded-full flex items-center justify-center text-sm">👥</span>
                              <div className="leading-tight">
                                <p className="font-bold text-slate-800">Lao động</p>
                                <p className="font-bold text-slate-850">nông nghiệp</p>
                              </div>
                            </div>
                            <div className="w-[30%] text-[10px] text-slate-500">Chiếm tỷ lệ lớn trong xã hội</div>
                            <div className="w-[25%] flex items-center justify-end gap-1.5">
                              <div className="flex -space-x-1.5 scale-90">
                                {[...Array(7)].map((_, i) => (
                                  <span key={i} className="text-emerald-600 text-[10px]">👤</span>
                                ))}
                                {[...Array(3)].map((_, i) => (
                                  <span key={i} className="text-slate-350 text-[10px]">👤</span>
                                ))}
                              </div>
                              <span className="font-bold text-[#1b4332] font-mono text-[10px]">70%</span>
                            </div>
                          </div>

                          {/* Item 2: Năng suất cây trồng */}
                          <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm text-xs">
                            <div className="flex items-center gap-2 w-[45%]">
                              <span className="w-7 h-7 bg-emerald-50 rounded-full flex items-center justify-center text-sm">🌾</span>
                              <div className="leading-tight">
                                <p className="font-bold text-slate-800">Năng suất</p>
                                <p className="font-bold text-slate-850">cây trồng</p>
                              </div>
                            </div>
                            <div className="w-[30%] text-[10px] text-slate-500">Chưa cao</div>
                            <div className="w-[25%] flex items-center justify-end gap-1 font-bold text-amber-500 text-[10px]">
                              <span>⭐⭐</span>
                              <span className="text-slate-300">⭐⭐⭐</span>
                              <span className="font-mono text-slate-600 ml-0.5">2/5</span>
                            </div>
                          </div>

                          {/* Item 3: Sản lượng lương thực */}
                          <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm text-xs">
                            <div className="flex items-center gap-2 w-[45%]">
                              <span className="w-7 h-7 bg-emerald-50 rounded-full flex items-center justify-center text-sm">🥡</span>
                              <div className="leading-tight">
                                <p className="font-bold text-slate-800">Sản lượng</p>
                                <p className="font-bold text-slate-850">lương thực</p>
                              </div>
                            </div>
                            <div className="w-[30%] text-[10px] text-slate-500">Chưa ổn định</div>
                            <div className="w-[25%] flex items-center justify-end gap-1 text-[10px]">
                              <div className="flex items-end gap-0.5 h-3.5 pt-0.5">
                                <div className="w-1.5 h-1.5 bg-emerald-600 rounded-t-sm" />
                                <div className="w-1.5 h-2.5 bg-emerald-600 rounded-t-sm" />
                                <div className="w-1.5 h-3.5 bg-emerald-600 rounded-t-sm" />
                                <div className="w-1.5 h-3.5 bg-slate-200 rounded-t-sm" />
                                <div className="w-1.5 h-3.5 bg-slate-200 rounded-t-sm" />
                              </div>
                              <span className="font-bold text-slate-600 font-mono ml-0.5">3/5</span>
                            </div>
                          </div>

                          {/* Item 4: Đời sống nông dân */}
                          <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm text-xs">
                            <div className="flex items-center gap-2 w-[45%]">
                              <span className="w-7 h-7 bg-emerald-50 rounded-full flex items-center justify-center text-sm">🧑‍🌾</span>
                              <div className="leading-tight">
                                <p className="font-bold text-slate-800">Đời sống</p>
                                <p className="font-bold text-slate-850">nông dân</p>
                              </div>
                            </div>
                            <div className="w-[30%] text-[10px] text-slate-500">Còn nhiều khó khăn</div>
                            <div className="w-[25%] flex flex-col items-center justify-center">
                              {/* Small dial */}
                              <div className="relative w-12 h-6 overflow-hidden">
                                <div className="absolute top-0 left-0 w-12 h-12 border-4 border-slate-150 rounded-full" />
                                <div className="absolute top-0 left-0 w-12 h-12 border-4 border-orange-500 rounded-full border-b-transparent border-r-transparent border-l-transparent" />
                                <div className="absolute bottom-0 left-[22px] w-1 h-5 bg-slate-800 origin-bottom transform rotate-[-40deg] rounded-t-full" />
                              </div>
                              <span className="text-[8px] font-bold text-orange-650 uppercase">Thấp</span>
                            </div>
                          </div>

                          {/* Item 5: Động lực sản xuất */}
                          <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm text-xs">
                            <div className="flex items-center gap-2 w-[45%]">
                              <span className="w-7 h-7 bg-emerald-50 rounded-full flex items-center justify-center text-sm">🚜</span>
                              <div className="leading-tight">
                                <p className="font-bold text-slate-800">Động lực</p>
                                <p className="font-bold text-slate-850">sản xuất</p>
                              </div>
                            </div>
                            <div className="w-[30%] text-[10px] text-slate-500">Chưa được phát huy</div>
                            <div className="w-[25%] flex items-center justify-end gap-1 text-[10px]">
                              {/* Battery representation */}
                              <div className="w-10 h-5 border-2 border-red-500 rounded-md p-0.5 relative flex items-center">
                                <div className="bg-red-500 h-full w-[20%] rounded-sm" />
                                <div className="absolute right-[-4px] top-[4px] w-[2px] h-[6px] bg-red-500 rounded-r-sm" />
                              </div>
                              <span className="font-bold text-red-650 font-mono">20%</span>
                            </div>
                          </div>

                        </div>
                      </div>

                      {/* PHÂN TÍCH NGUYÊN NHÂN */}
                      <div className="border border-slate-150 rounded-2xl p-3 space-y-2 bg-slate-50/50 flex flex-col justify-between">
                        <h4 className="text-[11px] font-black text-[#1b4332] uppercase tracking-wider border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                          <span>🔍</span> Phân tích nguyên nhân
                        </h4>
                        
                        <p className="text-[9px] text-slate-450 font-bold uppercase tracking-wider">Hiện trạng:</p>

                        <div className="flex-1 flex flex-col justify-around items-center py-2 space-y-1">
                          
                          {/* Step 1 */}
                          <div className="w-full flex items-center gap-3 bg-white border border-slate-150 rounded-xl p-2 shadow-sm">
                            <div className="w-8 h-8 rounded-full bg-[#1b4332] text-white flex items-center justify-center text-sm shadow-sm shrink-0">
                              ⛏️
                            </div>
                            <span className="text-[10px] font-bold text-slate-700">Người dân lao động nhiều</span>
                          </div>

                          <div className="text-[#1b4332] font-black text-[10px] animate-bounce">↓</div>

                          {/* Step 2 */}
                          <div className="w-full flex items-center gap-3 bg-white border border-slate-150 rounded-xl p-2 shadow-sm">
                            <div className="w-8 h-8 rounded-full bg-[#1b4332] text-white flex items-center justify-center text-sm shadow-sm shrink-0">
                              📊
                            </div>
                            <span className="text-[10px] font-bold text-slate-700">Năng suất chưa tăng tương ứng</span>
                          </div>

                          <div className="text-[#1b4332] font-black text-[10px] animate-bounce">↓</div>

                          {/* Step 3 */}
                          <div className="w-full flex items-center gap-3 bg-white border border-slate-150 rounded-xl p-2 shadow-sm">
                            <div className="w-8 h-8 rounded-full bg-[#1b4332] text-white flex items-center justify-center text-sm shadow-sm shrink-0">
                              🌾
                            </div>
                            <span className="text-[10px] font-bold text-slate-700">Sản lượng thấp</span>
                          </div>

                          <div className="text-[#1b4332] font-black text-[10px] animate-bounce">↓</div>

                          {/* Step 4 */}
                          <div className="w-full flex items-center gap-3 bg-white border border-slate-150 rounded-xl p-2 shadow-sm">
                            <div className="w-8 h-8 rounded-full bg-red-650 text-white flex items-center justify-center text-sm shadow-sm shrink-0">
                              🪙
                            </div>
                            <span className="text-[10px] font-bold text-slate-700">Thu nhập khó cải thiện</span>
                          </div>

                        </div>
                      </div>

                    </div>

                  </div>
                </div>

              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-12 animate-scale-up">
                {roomTwoScore3 >= 7 ? (
                  <CheckCircle2 size={48} className="text-emerald-600 animate-pulse" />
                ) : (
                  <AlertCircle size={48} className="text-amber-600" />
                )}
                <h3 className="text-lg font-bold text-[#5c3d1a] uppercase font-serif">Nộp phương án nông nghiệp thành công</h3>
                <div className="bg-[#f0fdf4] border-2 border-emerald-200 rounded-2xl p-5 shadow-md max-w-sm mx-auto">
                  <span className="text-[10px] text-emerald-800 uppercase tracking-widest font-black block">ĐIỂM THIẾT KẾ CHÍNH SÁCH</span>
                  <span className="text-4xl font-black text-emerald-700 font-mono block mt-1">+{roomTwoScore3}đ</span>
                </div>
                
                <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm text-xs text-left max-w-sm space-y-2">
                  <p className="font-bold text-slate-700 border-b pb-0.5">Phản hồi của Ban Kinh tế:</p>
                  <p className="text-slate-600 italic">
                    {roomTwoScore3 >= 7 
                      ? '"Mô hình kết hợp giữa định hướng của Nhà nước và quyền chủ động của người sản xuất giúp giải phóng sức sản xuất, tạo động lực phát triển nông nghiệp."' 
                      : '"Mô hình này chưa giải quyết được vấn đề cốt lõi: người sản xuất cần có động lực và quyền chủ động hơn trong quá trình sản xuất."'
                    }
                  </p>
                </div>
                <p className="text-xs text-slate-500">Vui lòng chờ ban tổ chức kích hoạt phiên họp tiếp theo.</p>
              </div>
            )
          )}

          {/* ========================================== */}
          {/* SESSION 4: PATHWAYS & REFORM VOTING        */}
          {/* ========================================== */}
          {roomTwoSessionState === 'session4' && (
            roomTwoScore4 === null ? (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-amber-50/80 border border-amber-200/60 rounded-2xl p-4 shadow-sm text-xs text-[#5c3d1a] leading-relaxed">
                  <p className="font-bold text-amber-900 mb-1">HỒ SƠ KHỦNG HOẢNG KINH TẾ QUỐC GIA - Năm 1986:</p>
                  <p className="mb-2 italic">&ldquo;Qua các phiên họp trước, chúng ta đã xác định nền kinh tế đang gặp nhiều khó khăn: giá cả tăng cao, sản xuất kém hiệu quả, nông nghiệp chưa phát huy được tiềm năng, đời sống nhân dân còn nhiều hạn chế.&rdquo;</p>
                  
                  <div className="grid grid-cols-2 gap-2 text-[10px] mt-2">
                    <div className="bg-white p-2 border border-amber-200/40 rounded-lg"><strong>Giá cả:</strong> Tăng nhanh, sức mua giảm sâu</div>
                    <div className="bg-white p-2 border border-amber-200/40 rounded-lg"><strong>Sản xuất:</strong> Kém hiệu quả, hụt kế hoạch</div>
                    <div className="bg-white p-2 border border-amber-200/40 rounded-lg"><strong>Nông nghiệp:</strong> Thiếu động lực sản xuất</div>
                    <div className="bg-white p-2 border border-amber-200/40 rounded-lg"><strong>Quản lý:</strong> Cơ chế cũ quan liêu bao cấp</div>
                  </div>
                </div>

                <div className="space-y-4 bg-amber-50 border-2 border-amber-200 rounded-2xl p-5 shadow-md space-y-5">
                  <h4 className="text-sm font-black text-[#5c3d1a] uppercase tracking-wider flex items-center gap-1.5">
                    🗳️ NHIỆM VỤ: Bỏ phiếu quyết định đường lối đổi mới tương lai
                  </h4>

                  {/* Step 1: Select reform option */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-700">Bước 1: Chọn một Phương án đường lối phát triển</p>
                    <div className="grid grid-cols-1 gap-2.5">
                      <button
                        onClick={() => setSelectedPath('1')}
                        className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex flex-col gap-1 cursor-pointer ${
                          selectedPath === '1' 
                            ? 'bg-[#8c2525] border-transparent text-[#fdfaf2] shadow-md' 
                            : 'bg-white border-slate-200 hover:border-slate-350 text-slate-700'
                        }`}
                      >
                        <span className="font-bold flex items-center gap-1">🟥 PHƯƠNG ÁN 1: Tiếp tục duy trì cơ chế cũ</span>
                        <span className="text-[10px] opacity-90 pl-4">Đặc điểm: Nhà nước quyết định phần lớn hoạt động kinh tế, sản xuất theo chỉ tiêu kế hoạch hành chính, phân phối chủ yếu theo kế hoạch Nhà nước.</span>
                      </button>

                      <button
                        onClick={() => setSelectedPath('2')}
                        className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex flex-col gap-1 cursor-pointer ${
                          selectedPath === '2' 
                            ? 'bg-[#8c2525] border-transparent text-[#fdfaf2] shadow-md' 
                            : 'bg-white border-slate-200 hover:border-slate-350 text-slate-700'
                        }`}
                      >
                        <span className="font-bold flex items-center gap-1">🟦 PHƯƠNG ÁN 2: Thả nổi hoàn toàn theo thị trường</span>
                        <span className="text-[10px] opacity-90 pl-4">Đặc điểm: Doanh nghiệp tự quyết định mọi hoạt động sản xuất kinh doanh, Nhà nước hạn chế tối đa sự can thiệp. Giá cả hoàn toàn do thị trường tự do định đoạt.</span>
                      </button>

                      <button
                        onClick={() => setSelectedPath('3')}
                        className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex flex-col gap-1 cursor-pointer ${
                          selectedPath === '3' 
                            ? 'bg-[#8c2525] border-transparent text-[#fdfaf2] shadow-md' 
                            : 'bg-white border-slate-200 hover:border-slate-350 text-slate-700'
                        }`}
                      >
                        <span className="font-bold flex items-center gap-1">🟩 PHƯƠNG ÁN 3: ĐỔI MỚI CƠ CHẾ KINH TẾ (Đại hội VI)</span>
                        <span className="text-[10px] opacity-95 pl-4">Đặc điểm: Phát triển nhiều thành phần kinh tế. Vận hành nền kinh tế theo cơ chế thị trường có sự quản lý, điều tiết và định hướng phát triển của Nhà nước.</span>
                      </button>
                    </div>
                  </div>

                  {/* Step 2: Select 4 supporting policies */}
                  <div className="space-y-2 pt-2 border-t border-amber-200/50">
                    <p className="text-xs font-bold text-slate-700 flex justify-between">
                      <span>Bước 2: Xây dựng bộ chính sách đi kèm (Chọn 4 chính sách cần triển khai)</span>
                      <span className="text-[10px] text-slate-400 font-normal">Đã chọn: {selectedPolicies4.length}/4</span>
                    </p>
                    <div className="space-y-2">
                      {policiesList4.map((p) => {
                        const isChecked = selectedPolicies4.includes(p.id);
                        return (
                          <button
                            key={p.id}
                            onClick={() => handleTogglePolicy4(p.id)}
                            className={`w-full text-left p-2.5 rounded-xl border text-[11px] flex items-center justify-between cursor-pointer transition-all ${
                              isChecked 
                                ? 'bg-amber-100 border-amber-400 text-amber-900 font-medium' 
                                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-350'
                            }`}
                          >
                            <span className="max-w-[85%] leading-snug">{p.title}</span>
                            <span className="text-[10px] text-amber-800 font-mono shrink-0 ml-2">
                              {isChecked ? '✓ Đã chọn' : '+ Thêm'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-end pt-2 border-t border-amber-200/50">
                    <button 
                      onClick={handleS4Submit} disabled={submitting}
                      className="px-8 py-3 bg-[#8c2525] hover:bg-[#701c1c] text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer"
                    >
                      {submitting ? <Loader2 size={14} className="animate-spin" /> : 'Bỏ phiếu biểu quyết đổi mới'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-12 animate-scale-up font-sans">
                <CheckCircle2 size={48} className="text-emerald-600 animate-pulse" />
                <h3 className="text-lg font-bold text-[#5c3d1a] uppercase font-serif">Biểu quyết đổi mới thành công</h3>
                <div className="bg-[#f0fdf4] border-2 border-emerald-200 rounded-2xl p-5 shadow-md max-w-sm mx-auto">
                  <span className="text-[10px] text-emerald-800 uppercase tracking-widest font-black block">ĐIỂM NGHỊ QUYẾT ĐẠI HỘI</span>
                  <span className="text-4xl font-black text-emerald-700 font-mono block mt-1">+{roomTwoScore4}đ</span>
                </div>
                
                <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm text-xs text-left max-w-sm space-y-2">
                  <p className="font-bold text-slate-700 border-b pb-0.5">Nghị quyết đại hội đã ban hành:</p>
                  <p className="text-slate-650 leading-relaxed">
                    &ldquo;Đại hội thống nhất lựa chọn đường lối Đổi mới: phát triển nền kinh tế nhiều thành phần, vận hành theo cơ chế thị trường có sự quản lý của Nhà nước. Đây là bước chuyển quan trọng nhằm giải phóng sức sản xuất và khắc phục những hạn chế của cơ chế cũ.&rdquo;
                  </p>
                </div>
                <p className="text-xs text-slate-500">Vui lòng đóng bảng tài liệu. Hãy đứng dậy (phím F) và sẵn sàng đi tiếp sang {ROOM_THREE_DISPLAY_NAME}!</p>
              </div>
            )
          )}

          {/* ========================================== */}
          {/* STATE 5: COMPLETED SESSION ROOM SUMMARY    */}
          {/* ========================================== */}
          {roomTwoSessionState === 'completed' && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-8 py-10 animate-fade-in font-sans">
              <div className="w-16 h-16 bg-amber-500/10 border-2 border-amber-400 rounded-full flex items-center justify-center text-amber-600 shadow-md">
                <Shield size={32} className="animate-pulse" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-[#8c2525] uppercase font-serif tracking-wider">
                  Nghị Quyết Đổi Mới Đã Chốt
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  Đại hội đại biểu VI đã thành công tốt đẹp. Chúng ta đã hoàn thành tất cả các báo cáo và đưa ra quyết định đổi mới mang tính lịch sử.
                </p>
              </div>

              {/* Animated flowchart grid mirroring the PDF */}
              <div className="bg-white border-2 border-[#e2d5c0] rounded-2xl p-5 shadow-inner w-full max-w-md mx-auto space-y-3">
                <p className="text-[10px] text-amber-800 uppercase font-black tracking-widest text-center border-b pb-1">
                  Đường lối hành trình lịch sử Room 2
                </p>
                
                <div className="flex flex-col items-center gap-1.5 py-1">
                  <div className="bg-red-500 text-white font-bold text-xs px-4 py-1.5 rounded-lg w-full max-w-[280px]">
                    ⚠️ KHỦNG HOẢNG KINH TẾ
                  </div>
                  <div className="text-slate-400 font-bold text-[10px]">▼</div>
                  <div className="bg-orange-500 text-white font-bold text-xs px-4 py-1.5 rounded-lg w-full max-w-[280px]">
                    🔎 NHẬN DIỆN HẠN CHẾ
                  </div>
                  <div className="text-slate-400 font-bold text-[10px]">▼</div>
                  <div className="bg-amber-500 text-slate-950 font-bold text-xs px-4 py-1.5 rounded-lg w-full max-w-[280px]">
                    💡 TÌM KIẾM GIẢI PHÁP
                  </div>
                  <div className="text-slate-400 font-bold text-[10px]">▼</div>
                  <div className="bg-emerald-600 text-white font-bold text-xs px-4 py-1.5 rounded-lg w-full max-w-[280px] animate-pulse">
                    ✅ QUYẾT ĐỊNH ĐỔI MỚI (ĐẠI HỘI VI)
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="bg-[#fcf8f2] border border-amber-200/50 rounded-xl px-4 py-2 text-[11px] text-amber-900 inline-block font-bold">
                  🚪 Cửa {ROOM_THREE_DISPLAY_NAME} đã được mở!
                </div>
                <p className="text-[10px] text-slate-450 italic">
                  Đại biểu có thể đóng cửa sổ này và di chuyển qua cửa tiếp theo phía sau khán đài để sang {ROOM_THREE_DISPLAY_NAME}.
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
