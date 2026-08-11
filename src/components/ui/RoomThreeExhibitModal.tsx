'use client';

import React from 'react';
import { Check, FileSearch, X } from 'lucide-react';
import { RoomThreeFragment } from '@/lib/roomThreeQuest';

interface RoomThreeExhibitModalProps {
  fragment: RoomThreeFragment | null;
  videoViewed: boolean;
  collected: boolean;
  onClose: () => void;
  onCollect: () => void;
}

export const RoomThreeExhibitModal: React.FC<RoomThreeExhibitModalProps> = ({
  fragment,
  videoViewed,
  collected,
  onClose,
  onCollect,
}) => {
  if (!fragment) return null;

  return (
    <div className="absolute inset-0 z-[68] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm pointer-events-auto">
      <div className="w-full max-w-lg rounded-3xl border border-amber-400/30 bg-slate-950 p-6 text-slate-100 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-400/10 p-3 text-amber-300"><FileSearch size={22} /></div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-300">Hiện vật lịch sử</div>
              <h2 className="mt-1 text-lg font-black">{fragment.sourceLocation}</h2>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white" aria-label="Đóng hiện vật">
            <X size={18} />
          </button>
        </div>
        <p className="mt-6 text-sm leading-7 text-slate-300">{fragment.description}</p>
        <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">Mảnh yêu sách</div>
          <div className="mt-1 text-base font-black text-amber-200">{fragment.title}</div>
        </div>
        {!videoViewed && !collected && (
          <p className="mt-4 text-xs leading-5 text-amber-200/90">Hãy xem tư liệu tại TV giữa phòng trước khi thu thập các mảnh yêu sách.</p>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-700 px-4 py-3 text-xs font-bold text-slate-300 hover:bg-slate-800">
            Đóng
          </button>
          {collected ? (
            <button type="button" disabled className="flex items-center gap-2 rounded-xl bg-emerald-500/20 px-4 py-3 text-xs font-black text-emerald-300">
              <Check size={15} /> Đã thu thập
            </button>
          ) : (
            <button type="button" onClick={onCollect} disabled={!videoViewed} className="rounded-xl bg-amber-400 px-4 py-3 text-xs font-black text-slate-950 enabled:hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40">
              Nhặt mảnh yêu sách
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomThreeExhibitModal;
