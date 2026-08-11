'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Check, FileText, GripVertical, Stamp, X } from 'lucide-react';
import {
  ROOM_THREE_FRAGMENTS,
  ROOM_THREE_PUZZLE_CORRECT_MESSAGE,
  ROOM_THREE_PUZZLE_INCORRECT_MESSAGE,
  ROOM_THREE_SUCCESS_MESSAGE,
} from '@/lib/roomThreeQuest';
import { evaluateRoomThreePuzzle } from '@/lib/roomThreeQuestState';

interface RoomThreeQuestModalProps {
  open: boolean;
  fragmentIds: string[];
  completed: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const RoomThreeQuestModal: React.FC<RoomThreeQuestModalProps> = ({
  open,
  fragmentIds,
  completed,
  onClose,
  onComplete,
}) => {
  const [orderedIds, setOrderedIds] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);

  const fragmentsById = useMemo(
    () => new Map(ROOM_THREE_FRAGMENTS.map((fragment) => [fragment.id, fragment])),
    [],
  );

  useEffect(() => {
    if (!open) return;
    setOrderedIds(completed ? fragmentIds : [...fragmentIds].reverse());
    setSelectedIndex(null);
    setDraggedIndex(null);
    setFeedback(completed ? 'correct' : null);
  }, [completed, fragmentIds, open]);

  if (!open) return null;

  const swap = (first: number, second: number) => {
    if (first === second) return;
    setOrderedIds((previous) => {
      const next = [...previous];
      [next[first], next[second]] = [next[second], next[first]];
      return next;
    });
    setFeedback(null);
  };

  const handleCardClick = (index: number) => {
    if (completed) return;
    if (selectedIndex === null) {
      setSelectedIndex(index);
      return;
    }
    swap(selectedIndex, index);
    setSelectedIndex(null);
  };

  const handleDrop = (index: number) => {
    if (completed || draggedIndex === null) return;
    swap(draggedIndex, index);
    setDraggedIndex(null);
  };

  const handleCheck = () => {
    if (completed) return;
    const result = evaluateRoomThreePuzzle(orderedIds);
    setFeedback(result.feedback);
    if (result.complete) onComplete();
  };

  return (
    <div className="absolute inset-0 z-[75] flex items-center justify-center bg-[#170d08]/90 p-4 backdrop-blur-md pointer-events-auto">
      <div className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-amber-500/40 bg-[#24150d] text-amber-50 shadow-2xl">
        <div className="flex items-center justify-between border-b border-amber-200/15 px-5 py-4 md:px-7">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-300/10 p-3 text-amber-300"><FileText size={22} /></div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-300">BÀN LÀM VIỆC – KHÔI PHỤC VĂN KIỆN</div>
              <h2 className="mt-1 text-lg font-black md:text-xl">BẢN YÊU SÁCH CỦA NHÂN DÂN AN NAM – 1919</h2>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-amber-100/60 hover:bg-white/10 hover:text-white" aria-label="Đóng puzzle">
            <X size={20} />
          </button>
        </div>

        <div className="grid gap-5 overflow-y-auto p-5 md:grid-cols-[1fr_240px] md:p-7">
          <div className={`rounded-2xl border p-4 md:p-5 ${feedback === 'correct' ? 'border-emerald-400/60 bg-emerald-950/20' : 'border-amber-200/15 bg-[#d8c49b]/10'}`}>
            <div className="mb-4 flex items-center justify-between border-b border-amber-950/30 pb-3">
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-900/80">Mục lục văn kiện</span>
              <span className="text-[10px] font-bold text-amber-100/60">Kéo thả hoặc chọn hai ô để đổi chỗ</span>
            </div>
            <div className="grid gap-2">
              {orderedIds.map((id, index) => {
                const fragment = fragmentsById.get(id);
                if (!fragment) return null;
                const selected = selectedIndex === index;
                return (
                  <div
                    key={id}
                    draggable={!completed}
                    onDragStart={() => setDraggedIndex(index)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => handleDrop(index)}
                    onClick={() => handleCardClick(index)}
                    className={`flex cursor-grab items-center gap-3 rounded-xl border px-3 py-3 transition active:cursor-grabbing ${selected ? 'border-amber-300 bg-amber-300/20 ring-1 ring-amber-300' : 'border-amber-950/30 bg-[#efe2c2]/90 hover:border-amber-400/60'} ${completed ? 'cursor-default' : ''}`}
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#6b3f24] font-mono text-xs font-black text-amber-100">{index + 1}</span>
                    {!completed && <GripVertical size={17} className="shrink-0 text-amber-900/60" />}
                    <span className="text-left text-xs font-black leading-5 text-[#3d2518]">{fragment.title}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col justify-between gap-5 rounded-2xl border border-amber-200/10 bg-black/15 p-5">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-300">Phục dựng tư liệu</div>
              <p className="mt-3 text-xs leading-6 text-amber-100/70">Sắp xếp 8 mảnh theo thứ tự các yêu sách trong văn kiện năm 1919. Đọc kỹ nội dung từng mảnh trước khi xác nhận.</p>
            </div>
            {feedback && (
              <div className={`rounded-xl border p-3 text-xs font-bold leading-5 ${feedback === 'correct' ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200' : 'border-rose-400/30 bg-rose-400/10 text-rose-200'}`}>
                {feedback === 'correct' ? ROOM_THREE_PUZZLE_CORRECT_MESSAGE : ROOM_THREE_PUZZLE_INCORRECT_MESSAGE}
              </div>
            )}
            {feedback === 'correct' && (
              <div className="flex flex-col items-center gap-3 rounded-xl border border-red-400/40 bg-red-950/20 p-4 text-center">
                <Stamp size={38} className="text-red-400" />
                <div className="rotate-[-6deg] border-2 border-red-400 px-3 py-1 text-xs font-black tracking-[0.18em] text-red-300">ĐÃ KHÔI PHỤC</div>
                <p className="text-xs leading-5 text-amber-100/80">{ROOM_THREE_SUCCESS_MESSAGE}</p>
              </div>
            )}
            {!completed && feedback !== 'correct' && (
              <button type="button" onClick={handleCheck} className="flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-3 text-xs font-black text-slate-950 hover:bg-amber-300">
                <Check size={16} strokeWidth={3} /> Kiểm tra văn kiện
              </button>
            )}
            {completed && (
              <button type="button" onClick={onClose} className="rounded-xl bg-emerald-400 px-4 py-3 text-xs font-black text-slate-950 hover:bg-emerald-300">
                Tiếp tục hành trình
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomThreeQuestModal;
