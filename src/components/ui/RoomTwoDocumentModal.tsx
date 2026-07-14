'use client';

import React, { useState } from 'react';
import { useMuseum } from '@/context/MuseumContext';
import { 
  FileText, Award, AlertTriangle, TrendingUp, DollarSign, 
  ShoppingCart, Loader2, X, ChevronRight, CheckCircle2, AlertCircle, Play, Shield
} from 'lucide-react';

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
    return { text: 'Khủng hoảng tột độ / Siêu lạm phát', color: 'text-rose-700 font-black animate-ping' };
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-auto select-none">
      {/* Background backdrop overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md" 
        onClick={() => setRoomTwoDocOpen(false)}
      />

      {/* Main Leather/Gold Folder Layout */}
      <div className="relative w-[min(94vw,680px)] h-[620px] max-h-[90vh] bg-[#fdfaf2] border-4 border-[#8c2525] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-scale-up font-sans">
        
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
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-12">
              <div className="w-20 h-20 bg-amber-600/5 text-amber-700 border border-amber-200 rounded-full flex items-center justify-center relative shadow-sm">
                <Loader2 size={36} className="animate-spin text-amber-700" />
              </div>
              <div className="space-y-3 max-w-sm">
                <h3 className="text-lg font-bold text-[#5c3d1a] uppercase font-serif">
                  Đang chờ ban tổ chức
                </h3>
                <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 shadow-inner">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                    Đại biểu:
                  </p>
                  <p className="text-base font-black text-amber-800 font-mono mt-0.5">
                    {nickname || 'Chưa đăng ký'}
                  </p>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed font-sans pt-2">
                  Vui lòng giữ nguyên vị trí ngồi. Các phiên thảo luận tiếp theo sẽ tự động được kích hoạt bởi Ban Chủ tịch.
                </p>
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* SESSION 1: CRISIS VALUE SLIDER             */}
          {/* ========================================== */}
          {roomTwoSessionState === 'session1' && (
            roomTwoScore === null ? (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-amber-50/80 border border-amber-200/60 rounded-2xl p-4 shadow-sm text-sm text-[#5c3d1a] leading-relaxed relative overflow-hidden">
                  <span className="font-bold text-amber-900">Báo cáo tình hình: </span>
                  Trong những năm gần đây, giá nhiều mặt hàng thiết yếu liên tục tăng. Chi phí sinh hoạt của người dân ngày càng cao, trong khi thu nhập không tăng tương ứng.
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-[#8c2525] uppercase tracking-wider flex items-center gap-2 border-b border-[#e2d5c0] pb-1">
                    <TrendingUp size={16} /> 1. Biến động thị trường tự do
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-1 shadow-sm text-xs text-slate-600">
                      <p className="font-bold text-slate-700 mb-1">Dữ liệu quan sát thực tế:</p>
                      <li>Giá lương thực, thực phẩm tăng nhanh.</li>
                      <li>Giá hàng tiêu dùng thiết yếu biến động mạnh.</li>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-1 shadow-sm text-xs text-slate-600">
                      <p className="font-bold text-slate-700 mb-1">Tình trạng lưu thông hàng hóa:</p>
                      <li>Hàng hóa lưu thông khan hiếm nghiêm trọng.</li>
                      <li>Giá chợ đen cao hơn nhiều giá Nhà nước quy định.</li>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-[#8c2525] uppercase tracking-wider flex items-center gap-2 border-b border-[#e2d5c0] pb-1">
                    <DollarSign size={16} /> 2. Tiền lương không theo kịp tốc độ tăng giá
                  </h3>
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                          <th className="p-2.5">Thời điểm khảo sát</th>
                          <th className="p-2.5 text-center">Mức thu nhập</th>
                          <th className="p-2.5 text-right">Khả năng mua thực tế</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-slate-600 bg-white">
                        <tr>
                          <td className="p-2.5">Trước khi giá tăng mạnh</td>
                          <td className="p-2.5 text-center font-mono">100%</td>
                          <td className="p-2.5 text-right text-emerald-600">Đáp ứng tương đối đầy đủ nhu cầu</td>
                        </tr>
                        <tr>
                          <td className="p-2.5">Khi giá tăng phi mã</td>
                          <td className="p-2.5 text-center font-mono text-red-600 font-bold">100%</td>
                          <td className="p-2.5 text-right text-red-600 font-bold">Chỉ còn khoảng 60% – 70% sức mua</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-8 bg-amber-50 border-2 border-amber-200 rounded-2xl p-5 space-y-4 shadow-md">
                  <h4 className="text-sm font-black text-[#5c3d1a] uppercase tracking-wider flex items-center gap-2">
                    <AlertTriangle size={18} className="text-amber-600 animate-bounce" />
                    NHIỆM VỤ: Đánh giá mức độ nghiêm trọng (0 - 100)
                  </h4>
                  <div className="relative py-2">
                    <input 
                      type="range" min="0" max="100" value={sliderValue} 
                      onChange={(e) => setSliderValue(parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#8c2525]"
                    />
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-1">
                      <span>0 (Bình thường)</span>
                      <span>50</span>
                      <span>100 (Khủng hoảng)</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-white border border-amber-200 rounded-xl shadow-sm text-center">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Mức đánh giá hiện tại</span>
                    <span className="text-2xl font-mono font-black text-[#8c2525]">{sliderValue}%</span>
                    <span className={`text-xs ${getSliderLabel(sliderValue).color}`}>{getSliderLabel(sliderValue).text}</span>
                  </div>
                  <div className="flex justify-end pt-2">
                    <button 
                      onClick={handleS1Submit} disabled={submitting}
                      className="px-8 py-3 bg-[#8c2525] hover:bg-[#701c1c] text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer"
                    >
                      {submitting ? <Loader2 size={14} className="animate-spin" /> : 'Nộp kết quả đánh giá'}
                    </button>
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
          {/* SESSION 2: PRODUCTION REPORT DRAG & DROP   */}
          {/* ========================================== */}
          {roomTwoSessionState === 'session2' && (
            roomTwoScore2 === null ? (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-amber-50/80 border border-amber-200/60 rounded-2xl p-4 shadow-sm text-xs text-[#5c3d1a] leading-relaxed">
                  <p className="font-bold text-amber-900 mb-1">HỒ SƠ NHÀ MÁY - Báo cáo tình hình thực hiện kế hoạch sản xuất năm 1985:</p>
                  &ldquo;Theo kế hoạch được giao, nhà máy phải hoàn thành mục tiêu sản xuất trong năm. Tuy nhiên, kết quả thực tế cho thấy sản lượng đạt thấp hơn nhiều so với yêu cầu, gây ảnh hưởng đến nguồn cung hàng hóa cho thị trường.&rdquo;
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100 text-slate-700 font-bold">
                      <tr className="border-b border-slate-200">
                        <th className="p-2.5">Chỉ tiêu</th>
                        <th className="p-2.5 text-center">Kế hoạch được giao</th>
                        <th className="p-2.5 text-right">Kết quả thực tế</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-600 bg-white">
                      <tr>
                        <td className="p-2.5 font-medium">Sản lượng sản xuất</td>
                        <td className="p-2.5 text-center font-mono">10.000 sản phẩm/năm</td>
                        <td className="p-2.5 text-right text-red-600 font-bold">6.000 sản phẩm/năm (Đạt 60%)</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-medium">Năng lực máy móc</td>
                        <td className="p-2.5 text-center">Đáp ứng đủ theo kế hoạch</td>
                        <td className="p-2.5 text-right text-orange-600">Hoạt động không ổn định</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-medium">Nguyên liệu đầu vào</td>
                        <td className="p-2.5 text-center">Được dự kiến cung cấp đầy đủ</td>
                        <td className="p-2.5 text-right text-orange-600">Thường xuyên thiếu hụt</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Causes selection interface */}
                <div className="space-y-4 bg-amber-50 border-2 border-amber-200 rounded-2xl p-5 shadow-md">
                  <div>
                    <h4 className="text-sm font-black text-[#5c3d1a] uppercase tracking-wider flex items-center gap-2">
                      <AlertTriangle size={18} className="text-amber-600" />
                      NHIỆM VỤ: Tìm các nguyên nhân khiến sản xuất kém hiệu quả
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">Đại biểu hãy nhấp chọn các thẻ để phân loại nguyên nhân chính vào ô bên trái.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Column 1: Causes list (Interactive Selection) */}
                    <div className="space-y-2">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Danh sách thẻ nguyên nhân:</p>
                      <div className="space-y-2">
                        {causesList.map((c) => {
                          const isSelected = selectedCauses.includes(c.id);
                          return (
                            <button
                              key={c.id}
                              onClick={() => handleToggleCause(c.id)}
                              className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all flex items-center justify-between cursor-pointer ${
                                isSelected 
                                  ? 'bg-[#8c2525] border-transparent text-[#fdfaf2] shadow-md scale-98' 
                                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                              }`}
                            >
                              <span>{c.title}</span>
                              <span className="text-[10px] opacity-75 font-bold">
                                {isSelected ? 'ĐÃ KHỚP ➔' : 'Nhấp để chọn'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Column 2: Result bins */}
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-red-300/60 bg-red-50/20 rounded-2xl p-3 min-h-[140px] space-y-2">
                        <p className="text-[10px] text-red-800 font-black uppercase tracking-wider border-b border-red-200 pb-1">
                          📌 Nguyên nhân chính (Kém hiệu quả):
                        </p>
                        {selectedCauses.length === 0 ? (
                          <p className="text-[10px] text-slate-400 italic text-center py-8">Chưa chọn thẻ nào...</p>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {selectedCauses.map(id => {
                              const item = causesList.find(c => c.id === id);
                              return (
                                <span key={id} onClick={() => handleToggleCause(id)} className="bg-red-100 border border-red-200 text-red-800 px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer hover:bg-red-200 transition-colors">
                                  {item?.title.split(' ').slice(1).join(' ')} ✕
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      <div className="border-2 border-dashed border-slate-300/60 bg-slate-50/40 rounded-2xl p-3 min-h-[100px] space-y-2">
                        <p className="text-[10px] text-slate-600 font-black uppercase tracking-wider border-b border-slate-200 pb-1">
                          💤 Không phải nguyên nhân chính:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {causesList.filter(c => !selectedCauses.includes(c.id)).map(c => (
                            <span key={c.id} onClick={() => handleToggleCause(c.id)} className="bg-slate-100 border border-slate-200 text-slate-500 px-2 py-1 rounded-lg text-[10px] cursor-pointer hover:bg-slate-200 transition-colors">
                              {c.title.split(' ').slice(1).join(' ')}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2 border-t border-amber-200/50">
                    <button 
                      onClick={handleS2Submit} disabled={submitting}
                      className="px-8 py-3 bg-[#8c2525] hover:bg-[#701c1c] text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer"
                    >
                      {submitting ? <Loader2 size={14} className="animate-spin" /> : 'Nộp kết quả phân tích'}
                    </button>
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
              <div className="space-y-6 animate-fade-in">
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 shadow-sm text-xs text-[#5c3d1a] leading-relaxed flex flex-col gap-2">
                  <p className="font-black text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                    📢 Phản ánh từ thực tế địa phương:
                  </p>
                  <p className="italic bg-white border border-amber-100 rounded-xl p-3 text-slate-650">
                    &ldquo;Chúng tôi vẫn làm việc chăm chỉ mỗi ngày, nhưng năng suất chưa cao. Sản lượng làm ra chưa đáp ứng đủ nhu cầu, đời sống gia đình còn nhiều khó khăn. Người dân muốn sản xuất tốt hơn nhưng còn nhiều hạn chế.&rdquo; - Một người nông dân chia sẻ.
                  </p>
                  <div className="border border-amber-200/50 rounded-xl overflow-hidden mt-1 text-[11px]">
                    <div className="bg-amber-100/50 px-3 py-1 font-bold flex justify-between border-b border-amber-200/50">
                      <span>Chỉ số nông nghiệp (1985)</span>
                      <span>Thực trạng</span>
                    </div>
                    <div className="bg-white divide-y divide-amber-100 px-3 py-1 space-y-1">
                      <div className="flex justify-between py-1"><span>Lao động nông nghiệp:</span><span className="font-medium text-amber-850">Chiếm tỷ lệ lớn trong xã hội</span></div>
                      <div className="flex justify-between py-1"><span>Năng suất cây trồng:</span><span className="font-medium text-red-700">Chưa cao / Sản lượng chưa ổn định</span></div>
                      <div className="flex justify-between py-1"><span>Động lực sản xuất:</span><span className="font-medium text-red-700">Chưa được phát huy</span></div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 bg-amber-50 border-2 border-amber-200 rounded-2xl p-5 shadow-md space-y-5">
                  <h4 className="text-sm font-black text-[#5c3d1a] uppercase tracking-wider flex items-center gap-1.5">
                    ⚙️ NHIỆM VỤ: Thiết kế chính sách nông nghiệp mới
                  </h4>

                  {/* Step 1: Select Model */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-700">Bước 1: Chọn mô hình quản lý sản xuất phù hợp</p>
                    <div className="grid grid-cols-1 gap-2.5">
                      <button
                        onClick={() => setSelectedModel('A')}
                        className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex flex-col gap-1 cursor-pointer ${
                          selectedModel === 'A' 
                            ? 'bg-[#8c2525] border-transparent text-[#fdfaf2] shadow-md' 
                            : 'bg-white border-slate-200 hover:border-slate-350 text-slate-700'
                        }`}
                      >
                        <span className="font-bold flex items-center gap-1">🟥 Mô hình A: Quản lý tập trung hoàn toàn</span>
                        <span className="text-[10px] opacity-90 pl-4">Đặc điểm: Nhà nước quyết định hoàn toàn việc sản xuất gì, bao nhiêu, phân phối ra sao. Người dân rất ít quyền tự chủ.</span>
                      </button>

                      <button
                        onClick={() => setSelectedModel('B')}
                        className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex flex-col gap-1 cursor-pointer ${
                          selectedModel === 'B' 
                            ? 'bg-[#8c2525] border-transparent text-[#fdfaf2] shadow-md' 
                            : 'bg-white border-slate-200 hover:border-slate-350 text-slate-700'
                        }`}
                      >
                        <span className="font-bold flex items-center gap-1">🟦 Mô hình B: Tự chủ hoàn toàn</span>
                        <span className="text-[10px] opacity-90 pl-4">Đặc điểm: Người dân tự quyết định trồng gì, số lượng bao nhiêu và tự tìm nơi tiêu thụ không cần sự can thiệp hay hướng dẫn của Nhà nước.</span>
                      </button>

                      <button
                        onClick={() => setSelectedModel('C')}
                        className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex flex-col gap-1 cursor-pointer ${
                          selectedModel === 'C' 
                            ? 'bg-[#8c2525] border-transparent text-[#fdfaf2] shadow-md' 
                            : 'bg-white border-slate-200 hover:border-slate-350 text-slate-700'
                        }`}
                      >
                        <span className="font-bold flex items-center gap-1">🟩 Mô hình C: Kết hợp quản lý Nhà nước và quyền chủ động</span>
                        <span className="text-[10px] opacity-95 pl-4">Đặc điểm: Nhà nước định hướng và hỗ trợ kỹ thuật, an ninh lương thực. Người sản xuất chủ động chọn phương án gieo trồng và tự chịu trách nhiệm.</span>
                      </button>
                    </div>
                  </div>

                  {/* Step 2: Select 3 supporting policies */}
                  <div className="space-y-2 pt-2 border-t border-amber-200/50">
                    <p className="text-xs font-bold text-slate-700 flex justify-between">
                      <span>Bước 2: Chọn 3 chính sách hỗ trợ đi kèm</span>
                      <span className="text-[10px] text-slate-400 font-normal">Đã chọn: {selectedPolicies3.length}/3</span>
                    </p>
                    <div className="space-y-2">
                      {policiesList3.map((p) => {
                        const isChecked = selectedPolicies3.includes(p.id);
                        return (
                          <button
                            key={p.id}
                            onClick={() => handleTogglePolicy3(p.id)}
                            className={`w-full text-left p-2.5 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                              isChecked 
                                ? 'bg-amber-100 border-amber-400 text-amber-900 font-medium' 
                                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-350'
                            }`}
                          >
                            <span>{p.title}</span>
                            <span className="text-[10px] text-amber-800 font-mono">
                              {isChecked ? '✓ Đã chọn' : '+ Thêm'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-end pt-2 border-t border-amber-200/50">
                    <button 
                      onClick={handleS3Submit} disabled={submitting}
                      className="px-8 py-3 bg-[#8c2525] hover:bg-[#701c1c] text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer"
                    >
                      {submitting ? <Loader2 size={14} className="animate-spin" /> : 'Đệ trình phương án cải tổ'}
                    </button>
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
                <p className="text-xs text-slate-500">Vui lòng đóng bảng tài liệu. Hãy đứng dậy (phím F) và sẵn sàng đi tiếp sang Phòng 3!</p>
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
                  🚪 Cửa Phòng 3 (gallery-ceramics) đã được mở!
                </div>
                <p className="text-[10px] text-slate-450 italic">
                  Đại biểu có thể đóng cửa sổ này và di chuyển qua cửa tiếp theo phía sau khán đài để sang Phòng 3.
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
