'use client';

import React, { useState, useCallback } from 'react';
import { useMuseum } from '@/context/MuseumContext';
import {
  FileText, Award, Loader2, X, CheckCircle2, GripVertical
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Dữ liệu sự kiện — Game Session 1: Ghép thứ tự thời gian
// ─────────────────────────────────────────────────────────────────────────────
interface HistoryEvent {
  id: string;
  icon: string;
  title: string;
  correctOrder: number; // 1-indexed, thứ tự đúng
}

const HISTORY_EVENTS: HistoryEvent[] = [
  {
    id: 'ev1',
    icon: '🚢',
    title: 'Nguyễn Ái Quốc từ Xiêm La (Thái Lan) sang Hồng Kông chuẩn bị hội nghị',
    correctOrder: 1,
  },
  {
    id: 'ev2',
    icon: '📜',
    title: 'Đông Dương Cộng sản Đảng, An Nam Cộng sản Đảng và Đông Dương Cộng sản Liên đoàn được triệu tập đến họp',
    correctOrder: 2,
  },
  {
    id: 'ev3',
    icon: '🏛️',
    title: 'Hội nghị hợp nhất khai mạc tại Cửu Long, Hồng Kông (3/2/1930)',
    correctOrder: 3,
  },
  {
    id: 'ev4',
    icon: '🔨',
    title: 'Thông qua Cương lĩnh chính trị đầu tiên của Đảng',
    correctOrder: 4,
  },
  {
    id: 'ev5',
    icon: '✍️',
    title: 'Thông qua Điều lệ Đảng và các văn kiện quan trọng',
    correctOrder: 5,
  },
  {
    id: 'ev6',
    icon: '🎉',
    title: 'Đặt tên chính thức: Đảng Cộng sản Việt Nam',
    correctOrder: 6,
  },
  {
    id: 'ev7',
    icon: '📢',
    title: 'Nguyễn Ái Quốc đọc "Lời kêu gọi" nhân dịp thành lập Đảng',
    correctOrder: 7,
  },
  {
    id: 'ev8',
    icon: '🌟',
    title: 'Đảng CSVN trở thành chính đảng duy nhất lãnh đạo cách mạng Việt Nam',
    correctOrder: 8,
  },
];



// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT CHÍNH
// ─────────────────────────────────────────────────────────────────────────────
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
    socket,
  } = useMuseum();

  const [submitting, setSubmitting] = useState<boolean>(false);

  // ── Session 1: Drag & Drop thứ tự sự kiện ────────────────────────────────
  const [orderedIds, setOrderedIds] = useState<string[]>(
    () => [...HISTORY_EVENTS].sort(() => Math.random() - 0.5).map((e) => e.id)
  );
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const handleDragStart = useCallback((id: string) => {
    setDraggedId(id);
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent, id: string) => {
      e.preventDefault();
      if (id !== draggedId) setDragOverId(id);
    },
    [draggedId]
  );

  const handleDrop = useCallback(
    (targetId: string) => {
      if (!draggedId || draggedId === targetId) {
        setDraggedId(null);
        setDragOverId(null);
        return;
      }
      setOrderedIds((prev) => {
        const next = [...prev];
        const fromIdx = next.indexOf(draggedId);
        const toIdx = next.indexOf(targetId);
        next.splice(fromIdx, 1);
        next.splice(toIdx, 0, draggedId);
        return next;
      });
      setDraggedId(null);
      setDragOverId(null);
    },
    [draggedId]
  );

  // Di chuyển lên / xuống bằng nút
  const moveItem = (id: string, dir: -1 | 1) => {
    setOrderedIds((prev) => {
      const next = [...prev];
      const idx = next.indexOf(id);
      const target = idx + dir;
      if (target < 0 || target >= next.length) return next;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  const calcS1Score = () => {
    let correct = 0;
    orderedIds.forEach((id, idx) => {
      const ev = HISTORY_EVENTS.find((e) => e.id === id);
      if (ev && ev.correctOrder === idx + 1) correct++;
    });
    // Thang điểm: mỗi đúng +1.25 → max 10
    return Math.round(correct * 1.25 * 10) / 10;
  };

  const handleS1Submit = () => {
    if (!socket) return;
    setSubmitting(true);
    const score = calcS1Score();
    socket.emit('room2:submit-score', { session: 1, value: score });
    setTimeout(() => setSubmitting(false), 800);
  };

  // ── Session 2: Xác nhận đơn giản ────────────────────────────────────────
  const handleS2Submit = () => {
    if (!socket) return;
    setSubmitting(true);
    socket.emit('room2:submit-score', { session: 2, value: 10 });
    setTimeout(() => setSubmitting(false), 800);
  };

  // ── Sessions 3 & 4: Giữ nguyên socket nhưng nộp score mặc định ──────────
  const handleS3Submit = () => {
    if (!socket) return;
    setSubmitting(true);
    socket.emit('room2:submit-score', { session: 3, value: 'C', selectedPolicies: [] });
    setTimeout(() => setSubmitting(false), 800);
  };
  const handleS4Submit = () => {
    if (!socket) return;
    setSubmitting(true);
    socket.emit('room2:submit-score', { session: 4, value: '3', selectedPolicies: [] });
    setTimeout(() => setSubmitting(false), 800);
  };

  if (!roomTwoDocOpen) return null;

  const isWide =
    roomTwoSessionState === 'session1' && roomTwoScore === null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-auto select-none">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => setRoomTwoDocOpen(false)}
      />

      {/* Panel chính */}
      <div
        className={`relative ${isWide ? 'w-[min(96vw,1080px)]' : 'w-[min(94vw,640px)]'} max-h-[92vh] bg-[#fdfaf2] border-4 border-[#8B0000] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-scale-up font-sans transition-all duration-500`}
      >
        {/* Góc vàng */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-amber-500 rounded-tl-xl pointer-events-none" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-amber-500 rounded-tr-xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-amber-500 rounded-bl-xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-amber-500 rounded-br-xl pointer-events-none" />

        {/* Header */}
        <div className="bg-[#8B0000] text-[#fdfaf2] px-6 py-4 flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-500/20 border border-amber-400/30 rounded-lg flex items-center justify-center">
              <FileText size={18} className="text-amber-300" />
            </div>
            <div>
              <p className="text-[10px] tracking-widest text-amber-300 uppercase font-black">
                Hội nghị thành lập Đảng Cộng sản Việt Nam — 3/2/1930
              </p>
              <h2 className="text-base font-bold leading-tight uppercase font-serif mt-0.5 tracking-wide text-white">
                Tài liệu lịch sử Đại biểu
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* ════════════════════════════════════════════
              WAITING — Chờ khai mạc
          ════════════════════════════════════════════ */}
          {roomTwoSessionState === 'waiting' && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-5 py-8">
              <div className="relative">
                <div className="w-20 h-20 bg-amber-50 border-2 border-amber-300/60 rounded-full flex items-center justify-center shadow-md text-3xl">
                  🏛️
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-pulse">
                  <span className="text-white text-[10px] font-black">!</span>
                </div>
              </div>

              <div className="space-y-3 max-w-md">
                <h3 className="text-lg font-bold text-[#8B0000] uppercase font-serif tracking-wider">
                  Hội nghị chưa khai mạc
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Hội nghị hợp nhất thành lập Đảng Cộng sản Việt Nam tại Cửu Long (Hồng Kông)
                  chưa được khai mạc. Vui lòng chờ Ban Chủ tọa.
                </p>

                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-4 shadow-inner space-y-3">
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Đại biểu đã đăng ký:</p>
                    <p className="text-base font-black text-amber-800 font-mono mt-0.5">
                      🪪 {nickname || 'Chưa đăng ký'}
                    </p>
                  </div>
                  <div className="bg-white/60 rounded-xl p-2.5 border border-amber-200/50">
                    <p className="text-[10px] text-amber-700 font-bold flex items-center justify-center gap-1.5">
                      <Loader2 size={12} className="animate-spin" />
                      Đang chờ Nguyễn Ái Quốc khai mạc hội nghị...
                    </p>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 leading-relaxed italic pt-1">
                  Vui lòng giữ nguyên vị trí ngồi. Các phiên thảo luận sẽ được kích hoạt bởi Ban Chủ tọa.
                </p>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════
              SESSION 1 — Ghép sự kiện theo thứ tự thời gian
          ════════════════════════════════════════════ */}
          {roomTwoSessionState === 'session1' && (
            roomTwoScore === null ? (
              <div className="animate-fade-in flex flex-col lg:flex-row gap-5">

                {/* Cột trái — hướng dẫn + thông tin */}
                <div className="lg:w-[320px] shrink-0 space-y-4">
                  <div className="bg-[#8B0000] text-white p-4 rounded-2xl shadow-md">
                    <h4 className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-2 mb-2">
                      📅 Nhiệm vụ: Sắp xếp thứ tự thời gian
                    </h4>
                    <p className="text-[11px] text-amber-100/90 leading-relaxed">
                      Kéo-thả (hoặc dùng nút ↑ ↓) để sắp xếp 8 sự kiện dưới đây theo <strong>đúng thứ tự thời gian</strong> của Hội nghị thành lập Đảng 3/2/1930.
                    </p>
                  </div>

                  {/* Bảng điểm dự kiến */}
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2">
                    <p className="text-[11px] font-black text-amber-800 uppercase tracking-wider">Thang điểm</p>
                    {[
                      { label: '8/8 đúng thứ tự', pts: '10 điểm', color: 'text-emerald-700' },
                      { label: '6–7 đúng', pts: '7.5–8.75 điểm', color: 'text-blue-700' },
                      { label: '4–5 đúng', pts: '5–6.25 điểm', color: 'text-amber-700' },
                      { label: 'Dưới 4 đúng', pts: '< 5 điểm', color: 'text-red-700' },
                    ].map((r, i) => (
                      <div key={i} className="flex justify-between text-[11px] border-b border-amber-100 pb-1">
                        <span className="text-slate-600">{r.label}</span>
                        <span className={`font-black ${r.color}`}>{r.pts}</span>
                      </div>
                    ))}
                  </div>

                  {/* Nút nộp */}
                  <button
                    onClick={handleS1Submit}
                    disabled={submitting}
                    className="w-full px-6 py-3.5 bg-gradient-to-r from-[#8B0000] to-[#6d1c1c] hover:from-[#6d1c1c] hover:to-[#5a1616] text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {submitting ? <Loader2 size={14} className="animate-spin" /> : '📝 Nộp kết quả sắp xếp'}
                  </button>
                </div>

                {/* Cột phải — danh sách kéo thả */}
                <div className="flex-1 space-y-2">
                  <p className="text-[11px] text-slate-500 text-center mb-3">
                    ← Kéo thả thẻ để sắp xếp, hoặc nhấn ↑ ↓
                  </p>
                  {orderedIds.map((id, idx) => {
                    const ev = HISTORY_EVENTS.find((e) => e.id === id)!;
                    const isDragging = draggedId === id;
                    const isOver = dragOverId === id;
                    return (
                      <div
                        key={id}
                        draggable
                        onDragStart={() => handleDragStart(id)}
                        onDragOver={(e) => handleDragOver(e, id)}
                        onDrop={() => handleDrop(id)}
                        onDragEnd={() => { setDraggedId(null); setDragOverId(null); }}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-grab active:cursor-grabbing select-none ${
                          isDragging
                            ? 'opacity-40 scale-[0.98] border-amber-400 bg-amber-50'
                            : isOver
                            ? 'border-[#8B0000] bg-red-50 scale-[1.01] shadow-md'
                            : 'border-slate-200 bg-white hover:border-amber-300 hover:shadow-sm'
                        }`}
                      >
                        {/* Số thứ tự */}
                        <div className="w-7 h-7 rounded-full bg-[#8B0000] text-white text-xs font-black flex items-center justify-center shrink-0">
                          {idx + 1}
                        </div>

                        {/* Kéo handle */}
                        <GripVertical size={16} className="text-slate-300 shrink-0" />

                        {/* Nội dung sự kiện */}
                        <span className="text-base shrink-0">{ev.icon}</span>
                        <span className="text-[11px] text-slate-700 leading-snug flex-1">
                          {ev.title}
                        </span>

                        {/* Nút di chuyển */}
                        <div className="flex flex-col gap-0.5 shrink-0">
                          <button
                            onClick={() => moveItem(id, -1)}
                            disabled={idx === 0}
                            className="w-6 h-5 rounded bg-slate-100 hover:bg-amber-100 text-slate-500 hover:text-amber-700 text-[10px] disabled:opacity-30 flex items-center justify-center cursor-pointer"
                          >
                            ▲
                          </button>
                          <button
                            onClick={() => moveItem(id, 1)}
                            disabled={idx === orderedIds.length - 1}
                            className="w-6 h-5 rounded bg-slate-100 hover:bg-amber-100 text-slate-500 hover:text-amber-700 text-[10px] disabled:opacity-30 flex items-center justify-center cursor-pointer"
                          >
                            ▼
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Đã nộp session 1 */
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-12 animate-scale-up">
                <CheckCircle2 size={48} className="text-emerald-600 animate-pulse" />
                <h3 className="text-lg font-bold text-[#5c3d1a] uppercase font-serif">Đã nộp kết quả sắp xếp</h3>
                <div className="bg-[#f0fdf4] border-2 border-emerald-200 rounded-2xl p-5 shadow-md max-w-xs mx-auto">
                  <span className="text-[10px] text-emerald-800 uppercase tracking-widest font-black block">ĐIỂM SẮP XẾP SỰ KIỆN</span>
                  <span className="text-4xl font-black text-emerald-700 font-mono block mt-1">+{roomTwoScore}đ</span>
                </div>
                <p className="text-xs text-slate-500 max-w-sm">Vui lòng chờ Ban Chủ tọa kích hoạt phiên tiếp theo.</p>
              </div>
            )
          )}

          {/* ════════════════════════════════════════════
              SESSION 2 — Xác nhận tham dự phiên thảo luận
          ════════════════════════════════════════════ */}
          {roomTwoSessionState === 'session2' && (
            roomTwoScore2 === null ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-12">
                <div className="w-16 h-16 bg-red-50 border-2 border-red-200 rounded-full flex items-center justify-center text-3xl">📜</div>
                <h3 className="text-base font-bold text-[#8B0000] uppercase font-serif">Phiên thông qua Cương lĩnh</h3>
                <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                  Hội nghị đang thông qua <strong>Cương lĩnh chính trị đầu tiên</strong> và <strong>Điều lệ Đảng</strong>.
                  Vui lòng chú ý lắng nghe bài phát biểu của Nguyễn Ái Quốc.
                </p>
                <button
                  onClick={handleS2Submit}
                  disabled={submitting}
                  className="px-8 py-3 bg-[#8B0000] hover:bg-[#6d1c1c] text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  {submitting ? <Loader2 size={14} className="animate-spin" /> : '✅ Xác nhận đã nghe'}
                </button>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-12 animate-scale-up">
                <CheckCircle2 size={48} className="text-emerald-600 animate-pulse" />
                <h3 className="text-lg font-bold text-[#5c3d1a] uppercase font-serif">Hoàn thành phiên 2</h3>
                <div className="bg-[#f0fdf4] border-2 border-emerald-200 rounded-2xl p-5 shadow-md max-w-xs mx-auto">
                  <span className="text-[10px] text-emerald-800 uppercase tracking-widest font-black block">ĐIỂM PHIÊN 2</span>
                  <span className="text-4xl font-black text-emerald-700 font-mono block mt-1">+{roomTwoScore2}đ</span>
                </div>
                <p className="text-xs text-slate-500">Chờ phiên tiếp theo.</p>
              </div>
            )
          )}

          {/* ════════════════════════════════════════════
              SESSION 3 — Tự động (giữ socket hoạt động)
          ════════════════════════════════════════════ */}
          {roomTwoSessionState === 'session3' && (
            roomTwoScore3 === null ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-12">
                <div className="w-16 h-16 bg-amber-50 border-2 border-amber-200 rounded-full flex items-center justify-center text-3xl">🔖</div>
                <h3 className="text-base font-bold text-[#8B0000] uppercase font-serif">Phiên thảo luận 3</h3>
                <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                  Phiên thảo luận về ý nghĩa Cương lĩnh chính trị 1930. Vui lòng chú ý màn hình chiếu.
                </p>
                <button
                  onClick={handleS3Submit}
                  disabled={submitting}
                  className="px-8 py-3 bg-[#8B0000] hover:bg-[#6d1c1c] text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  {submitting ? <Loader2 size={14} className="animate-spin" /> : '✅ Xác nhận đã nghe'}
                </button>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-12 animate-scale-up">
                <CheckCircle2 size={48} className="text-emerald-600 animate-pulse" />
                <h3 className="text-lg font-bold text-[#5c3d1a] uppercase font-serif">Hoàn thành phiên 3</h3>
                <div className="bg-[#f0fdf4] border-2 border-emerald-200 rounded-2xl p-5 shadow-md max-w-xs mx-auto">
                  <span className="text-[10px] text-emerald-800 uppercase tracking-widest font-black block">ĐIỂM PHIÊN 3</span>
                  <span className="text-4xl font-black text-emerald-700 font-mono block mt-1">+{roomTwoScore3}đ</span>
                </div>
                <p className="text-xs text-slate-500">Chờ phiên cuối cùng.</p>
              </div>
            )
          )}

          {/* ════════════════════════════════════════════
              SESSION 4 — Tự động (giữ socket hoạt động)
          ════════════════════════════════════════════ */}
          {roomTwoSessionState === 'session4' && (
            roomTwoScore4 === null ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-12">
                <div className="w-16 h-16 bg-red-50 border-2 border-red-200 rounded-full flex items-center justify-center text-3xl">🗳️</div>
                <h3 className="text-base font-bold text-[#8B0000] uppercase font-serif">Phiên kết thúc Hội nghị</h3>
                <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                  Tuyên bố thành lập Đảng Cộng sản Việt Nam. Nguyễn Ái Quốc đọc "Lời kêu gọi" toàn quốc.
                </p>
                <button
                  onClick={handleS4Submit}
                  disabled={submitting}
                  className="px-8 py-3 bg-[#8B0000] hover:bg-[#6d1c1c] text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  {submitting ? <Loader2 size={14} className="animate-spin" /> : '🎉 Xác nhận tham dự'}
                </button>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-12 animate-scale-up">
                <Award size={48} className="text-amber-500 animate-bounce" />
                <h3 className="text-lg font-bold text-[#5c3d1a] uppercase font-serif">Hoàn thành Hội nghị!</h3>
                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-2xl p-5 shadow-md max-w-xs mx-auto">
                  <span className="text-[10px] text-amber-800 uppercase tracking-widest font-black block">ĐIỂM PHIÊN KẾT THÚC</span>
                  <span className="text-4xl font-black text-amber-700 font-mono block mt-1">+{roomTwoScore4}đ</span>
                </div>
                <p className="text-xs text-slate-500 italic max-w-sm">
                  "Đảng Cộng sản Việt Nam được thành lập — một bước ngoặt vĩ đại trong lịch sử cách mạng Việt Nam."
                </p>
              </div>
            )
          )}

          {/* ════════════════════════════════════════════
              COMPLETED — Hoàn thành toàn bộ
          ════════════════════════════════════════════ */}
          {roomTwoSessionState === 'completed' && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-10 animate-scale-up">
              <div className="text-5xl animate-bounce">🏆</div>
              <h3 className="text-xl font-bold text-[#8B0000] uppercase font-serif tracking-wider">
                Bạn đã hoàn thành Hội nghị!
              </h3>
              <div className="grid grid-cols-2 gap-3 max-w-sm w-full">
                {[
                  { label: 'Sắp xếp sự kiện', score: roomTwoScore },
                  { label: 'Quiz lịch sử', score: roomTwoScore2 },
                  { label: 'Thảo luận', score: roomTwoScore3 },
                  { label: 'Kết thúc HN', score: roomTwoScore4 },
                ].map((s, i) => (
                  <div key={i} className="bg-white border-2 border-amber-200 rounded-2xl p-3 shadow-sm">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">{s.label}</span>
                    <span className="text-2xl font-black text-[#8B0000] font-mono block">+{s.score ?? 0}đ</span>
                  </div>
                ))}
              </div>
              <div className="bg-[#8B0000] text-white rounded-2xl px-6 py-3 shadow-md">
                <span className="text-[11px] uppercase tracking-wider block text-amber-300">Tổng điểm</span>
                <span className="text-3xl font-black font-mono">
                  {((roomTwoScore ?? 0) + (roomTwoScore2 ?? 0) + (roomTwoScore3 ?? 0) + (roomTwoScore4 ?? 0)).toFixed(1)}đ
                </span>
              </div>
              <p className="text-[11px] text-slate-400 italic max-w-xs">
                Cảm ơn bạn đã tham gia tái hiện Hội nghị thành lập Đảng Cộng sản Việt Nam, 3 tháng 2 năm 1930.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
