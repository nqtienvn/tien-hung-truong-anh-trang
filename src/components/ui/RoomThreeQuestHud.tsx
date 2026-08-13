'use client';

import React from 'react';
import { RoomThreeInteractionPoint } from '@/lib/roomThreeQuest';

interface RoomThreeQuestHudProps {
  visible: boolean;
  missionText: string;
  fragmentCount: number;
  interaction: RoomThreeInteractionPoint | null;
  notice: string | null;
}

const getInteractionText = (interaction: RoomThreeInteractionPoint | null) => {
  if (!interaction) return null;
  if (interaction.kind === 'video') return 'Nhấn E để Xem tư liệu: Bản Yêu sách 1919';
  if (interaction.kind === 'desk') return 'Nhấn E để Bàn làm việc – Khôi phục Bản Yêu sách';
  return 'Nhấn E để xem hiện vật';
};

export const RoomThreeQuestHud: React.FC<RoomThreeQuestHudProps> = ({
  visible,
  missionText,
  fragmentCount,
  interaction,
  notice,
}) => {
  if (!visible) return null;
  const interactionText = getInteractionText(interaction);

  return (
    <>
      <div className="pointer-events-none absolute left-4 top-24 z-40 w-[min(330px,calc(100vw-2rem))] rounded-2xl border border-amber-400/30 bg-slate-950/85 p-4 text-slate-100 shadow-2xl backdrop-blur-md">
        <div className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-300">Paris · 1919</div>
        <div className="mt-1 text-sm font-black leading-5">Nhiệm vụ Phòng 3</div>
        <div className="mt-2 text-xs leading-5 text-slate-300">{missionText}</div>
        <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3 text-xs font-bold">
          <span className="text-slate-400">Mảnh yêu sách</span>
          <span className="font-mono text-amber-300">{fragmentCount}/8</span>
        </div>
      </div>

      {interactionText && (
        <div className="pointer-events-none absolute bottom-20 left-1/2 z-40 -translate-x-1/2 rounded-2xl border-2 border-amber-500/30 bg-slate-950/95 px-6 py-3 text-center text-xs font-black tracking-wide text-slate-100 shadow-2xl backdrop-blur-md">
          <span className="mr-2 inline-flex rounded bg-amber-500 px-2 py-0.5 text-slate-950">E</span>
          {interactionText.replace(/^Nhấn E để /, '')}
        </div>
      )}

      {notice && (
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-[65] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-amber-400/40 bg-slate-950/95 px-7 py-5 text-center text-sm font-bold leading-6 text-amber-50 shadow-2xl backdrop-blur-md">
          {notice}
        </div>
      )}
    </>
  );
};

export default RoomThreeQuestHud;
