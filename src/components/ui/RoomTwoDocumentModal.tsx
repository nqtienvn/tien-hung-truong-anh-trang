'use client';

import React, { useState } from 'react';
import { useMuseum } from '@/context/MuseumContext';
import { FileText, Award, AlertTriangle, TrendingUp, DollarSign, ShoppingCart, Loader2, X } from 'lucide-react';

export const RoomTwoDocumentModal: React.FC = () => {
  const {
    roomTwoSessionState,
    roomTwoDocOpen,
    setRoomTwoDocOpen,
    roomTwoScore,
    nickname,
    socket
  } = useMuseum();

  const [sliderValue, setSliderValue] = useState<number>(50);
  const [submitting, setSubmitting] = useState<boolean>(false);

  if (!roomTwoDocOpen) return null;

  const handleSubmit = () => {
    if (!socket) return;
    setSubmitting(true);
    socket.emit('room2:submit-score', { value: sliderValue });
    // client-side timeout fallback in case of connection drop
    setTimeout(() => {
      setSubmitting(false);
    }, 1000);
  };

  const getSliderLabel = (val: number) => {
    if (val <= 30) return { text: 'Bình thường / Ổn định', color: 'text-emerald-600 font-bold' };
    if (val <= 50) return { text: 'Dấu hiệu khó khăn', color: 'text-amber-500 font-bold' };
    if (val <= 70) return { text: 'Khủng hoảng nhẹ', color: 'text-amber-600 font-bold' };
    if (val <= 80) return { text: 'Khủng hoảng trung bình', color: 'text-orange-600 font-black' };
    if (val <= 90) return { text: 'Khủng hoảng nghiêm trọng', color: 'text-red-600 font-black animate-pulse' };
    return { text: 'Khủng hoảng tột độ / Siêu lạm phát', color: 'text-rose-700 font-black animate-ping' };
  };

  const labelInfo = getSliderLabel(sliderValue);

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

          {/* STATE 1: WAITING SESSION 1 */}
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
                  Vui lòng giữ nguyên vị trí ngồi. Phiên họp thứ nhất sẽ tự động bắt đầu khi Đoàn Chủ tịch khai mạc.
                </p>
              </div>
            </div>
          )}

          {/* STATE 2: SESSION 1 STARTED (and not submitted yet) */}
          {roomTwoSessionState === 'session1' && roomTwoScore === null && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Report Header Card */}
              <div className="bg-amber-50/80 border border-amber-200/60 rounded-2xl p-4 shadow-sm text-sm text-[#5c3d1a] leading-relaxed relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full -mr-8 -mt-8 pointer-events-none" />
                <span className="font-bold text-amber-900">Báo cáo tình hình: </span>
                Trong những năm gần đây, giá nhiều mặt hàng thiết yếu liên tục tăng. Chi phí sinh hoạt của người dân ngày càng cao, trong khi thu nhập không tăng tương ứng.
              </div>

              {/* Section 1: Dữ liệu quan sát */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-[#8c2525] uppercase tracking-wider flex items-center gap-2 border-b border-[#e2d5c0] pb-1">
                  <TrendingUp size={16} /> 1. Biến động thị trường tự do
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-1 shadow-sm">
                    <p className="text-xs font-bold text-slate-700">Dữ liệu quan sát thực tế:</p>
                    <ul className="text-xs text-slate-600 list-disc list-inside space-y-1 pl-1">
                      <li>Giá lương thực, thực phẩm tăng nhanh.</li>
                      <li>Giá hàng tiêu dùng thiết yếu biến động mạnh.</li>
                      <li>Người dân chi nhiều tiền hơn cho cùng một lượng hàng.</li>
                    </ul>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-1 shadow-sm">
                    <p className="text-xs font-bold text-slate-700">Tình trạng lưu thông hàng hóa:</p>
                    <ul className="text-xs text-slate-600 list-disc list-inside space-y-1 pl-1">
                      <li>Hàng hóa lưu thông khan hiếm nghiêm trọng.</li>
                      <li>Giá chợ đen cao hơn nhiều giá Nhà nước quy định.</li>
                      <li>Xuất hiện các giao dịch không chính thức.</li>
                    </ul>
                  </div>
                </div>
                <div className="bg-[#fef2f2] border border-red-200 rounded-xl px-4 py-2.5 flex items-center gap-2.5 text-xs text-red-950 font-medium">
                  <span className="text-base shrink-0">⚠️</span>
                  <span><strong>Tín hiệu cảnh báo:</strong> Giá cả tăng phi mã → Chi phí sinh hoạt đắt đỏ → Đời sống nhân dân khó khăn.</span>
                </div>
              </div>

              {/* Section 2: Tiền lương và thu nhập */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-[#8c2525] uppercase tracking-wider flex items-center gap-2 border-b border-[#e2d5c0] pb-1">
                  <DollarSign size={16} /> 2. Tiền lương không theo kịp tốc độ tăng giá
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  &ldquo;Mức thu nhập của người lao động không tăng tương ứng với tốc độ tăng giá, khiến giá trị thực tế của tiền lương giảm sút nghiêm trọng.&rdquo;
                </p>
                
                {/* Simulation Table */}
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                        <th className="p-2.5">Thời điểm khảo sát</th>
                        <th className="p-2.5 text-center">Mức thu nhập</th>
                        <th className="p-2.5 text-right">Khả năng mua hàng thực tế</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-600 bg-white">
                      <tr>
                        <td className="p-2.5 font-medium">Trước khi giá tăng mạnh</td>
                        <td className="p-2.5 text-center font-mono">100%</td>
                        <td className="p-2.5 text-right text-emerald-600 font-medium">Đáp ứng tương đối đầy đủ nhu cầu</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-medium">Khi giá tăng phi mã</td>
                        <td className="p-2.5 text-center font-mono text-red-600 font-bold">100%</td>
                        <td className="p-2.5 text-right text-red-600 font-bold">Chỉ còn khoảng 60% – 70% sức mua</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="bg-[#fef2f2] border border-red-200 rounded-xl px-4 py-2.5 flex items-center gap-2.5 text-xs text-red-950 font-medium">
                  <span className="text-base shrink-0">⚠️</span>
                  <span><strong>Tín hiệu cảnh báo:</strong> Tiền lương tăng chậm hơn giá → Thu nhập thực tế giảm sâu.</span>
                </div>
              </div>

              {/* Section 3: Sức mua giảm */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-[#8c2525] uppercase tracking-wider flex items-center gap-2 border-b border-[#e2d5c0] pb-1">
                  <ShoppingCart size={16} /> 3. Sức mua của người dân giảm sâu
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Do thu nhập thực tế giảm mạnh, người dân buộc phải cắt giảm tối đa chi tiêu phi thiết yếu, chỉ tập trung vào lương thực thực phẩm qua ngày. Khoảng cách chi trả ngày càng mở rộng.
                </p>

                {/* Flow Diagram (Horizontal chain) */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-inner">
                  <div className="flex flex-col items-center p-2 bg-white border border-slate-200 rounded-lg w-full sm:w-auto text-center shrink-0">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Bước 1</span>
                    <span className="text-xs font-bold text-red-700">Giá cả tăng vọt</span>
                  </div>
                  <div className="text-slate-400 rotate-90 sm:rotate-0 font-black">➔</div>
                  <div className="flex flex-col items-center p-2 bg-white border border-slate-200 rounded-lg w-full sm:w-auto text-center shrink-0">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Bước 2</span>
                    <span className="text-xs font-bold text-amber-700">Chi phí sinh hoạt tăng</span>
                  </div>
                  <div className="text-slate-400 rotate-90 sm:rotate-0 font-black">➔</div>
                  <div className="flex flex-col items-center p-2 bg-white border border-slate-200 rounded-lg w-full sm:w-auto text-center shrink-0">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Bước 3</span>
                    <span className="text-xs font-bold text-orange-700">Thu nhập thực tế giảm</span>
                  </div>
                  <div className="text-slate-400 rotate-90 sm:rotate-0 font-black">➔</div>
                  <div className="flex flex-col items-center p-2 bg-white border border-slate-200 rounded-lg w-full sm:w-auto text-center shrink-0">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Bước 4</span>
                    <span className="text-xs font-bold text-rose-700">Người dân giảm tiêu dùng</span>
                  </div>
                </div>
              </div>

              {/* TASK SECTOR: INTERACTIVE SLIDER */}
              <div className="mt-8 bg-amber-50 border-2 border-amber-200 rounded-2xl p-5 space-y-4 shadow-md">
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-[#5c3d1a] uppercase tracking-wider flex items-center gap-2">
                    <AlertTriangle size={18} className="text-amber-600 animate-bounce" />
                    NHIỆM VỤ: Đánh giá mức độ nghiêm trọng
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Đại biểu hãy trượt thanh đánh giá bên dưới để thể hiện nhận định về mức độ khủng hoảng kinh tế - xã hội của đất nước tại thời điểm Đại hội VI.
                  </p>
                </div>

                {/* Custom Slider */}
                <div className="space-y-5 py-4 px-2">
                  <div className="relative">
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={sliderValue} 
                      onChange={(e) => setSliderValue(parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#8c2525]"
                    />
                    {/* Tick marks */}
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 px-1 mt-1.5">
                      <span>0 (Bình thường)</span>
                      <span>50</span>
                      <span>100 (Khủng hoảng)</span>
                    </div>
                  </div>

                  {/* Dynamic value label */}
                  <div className="flex flex-col items-center justify-center p-3 bg-white border border-amber-200 rounded-xl text-center space-y-1 shadow-sm">
                    <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">Mức đánh giá hiện tại</span>
                    <span className="text-3xl font-mono font-black text-[#8c2525]">{sliderValue}%</span>
                    <span className={`text-xs ${labelInfo.color}`}>{labelInfo.text}</span>
                  </div>
                </div>

                {/* Submitting Actions */}
                <div className="flex justify-end pt-2">
                  <button 
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="px-8 py-3 bg-[#8c2525] hover:bg-[#701c1c] disabled:bg-slate-300 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Đang nộp...
                      </>
                    ) : (
                      'Nộp kết quả đánh giá'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STATE 3: SUBMITTED SUCCESS / SCORE RECEIVED */}
          {roomTwoScore !== null && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-12 animate-scale-up">
              <div className="w-20 h-20 bg-emerald-100 border-2 border-emerald-400 rounded-full flex items-center justify-center text-emerald-600 shadow-lg relative">
                <Award size={40} className="animate-pulse" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
                </span>
              </div>
              <div className="space-y-4 max-w-sm">
                <h3 className="text-xl font-bold text-[#5c3d1a] uppercase font-serif">
                  Nộp báo cáo thành công
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-sans">
                  Ban thư ký đại hội đã nhận được ý kiến đánh giá của đại biểu <strong>{nickname}</strong>.
                </p>
                <div className="bg-[#f0fdf4] border-2 border-emerald-200 rounded-2xl p-5 shadow-md">
                  <span className="text-[10px] text-emerald-800 uppercase tracking-widest font-black block">
                    ĐIỂM NHẬN DIỆN KHỦNG HOẢNG
                  </span>
                  <span className="text-4xl font-black text-emerald-700 font-mono block mt-1">
                    +{roomTwoScore}đ
                  </span>
                </div>
                
                {/* Scoring description table */}
                <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm text-left text-[10px] text-slate-500 space-y-1">
                  <p className="font-bold text-slate-700 mb-1 border-b border-slate-100 pb-0.5">Quy chế chấm điểm của Đại hội:</p>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                    <div>• 0 - 30% (Thấp): <span className="font-bold">2đ</span></div>
                    <div>• 31 - 50% (Chưa đủ): <span className="font-bold">5đ</span></div>
                    <div>• 51 - 70% (Khó khăn): <span className="font-bold">8đ</span></div>
                    <div>• 71 - 80% (Khá đúng): <span className="font-bold">12đ</span></div>
                    <div className="text-emerald-700 font-bold">• 81 - 90% (Sát nhất): 15đ</div>
                    <div>• 91 - 100% (Quá mức): <span className="font-bold">10đ</span></div>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 italic pt-2">
                  Đại biểu có thể đóng cửa sổ này bằng nút góc trên phải để tiếp tục theo dõi phiên thảo luận.
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
