'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { X, Volume2, PlayCircle } from 'lucide-react';
import {
  ROOM_THREE_VIDEO_FOLLOW_UP,
  ROOM_THREE_VIDEO_URL,
} from '@/lib/roomThreeQuest';

interface RoomThreeVideoModalProps {
  open: boolean;
  onClose: () => void;
  onViewed: () => void;
}

export const RoomThreeVideoModal: React.FC<RoomThreeVideoModalProps> = ({
  open,
  onClose,
  onViewed,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [needsUnmute, setNeedsUnmute] = useState(false);
  const [showFollowUp, setShowFollowUp] = useState(false);

  const markViewed = useCallback(() => {
    onViewed();
    setShowFollowUp(true);
  }, [onViewed]);

  useEffect(() => {
    if (!open) return;
    setNeedsUnmute(false);
    setShowFollowUp(false);
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = 0;
    video.muted = false;
    void video.play().catch(async () => {
      video.muted = true;
      setNeedsUnmute(true);
      await video.play().catch(() => undefined);
    });

    return () => {
      video.pause();
      video.currentTime = 0;
    };
  }, [open]);

  const handleClose = () => {
    if (!showFollowUp) {
      markViewed();
      return;
    }
    onClose();
  };

  const handleUnmute = async () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = false;
    try {
      await video.play();
      setNeedsUnmute(false);
    } catch {
      video.muted = true;
      setNeedsUnmute(true);
    }
  };

  if (!open) return null;

  return (
    <div className="absolute inset-0 z-[70] flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-md pointer-events-auto">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-amber-500/30 bg-slate-950 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400">TƯ LIỆU LỊCH SỬ</p>
            <h2 className="mt-1 text-lg font-black text-white">Xem tư liệu: Bản Yêu sách 1919</h2>
          </div>
          <button type="button" onClick={handleClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white" aria-label="Đóng video">
            <X size={20} />
          </button>
        </div>

        {!showFollowUp ? (
          <div className="relative bg-black">
            <video
              ref={videoRef}
              src={ROOM_THREE_VIDEO_URL}
              className="max-h-[70vh] w-full"
              controls
              playsInline
              onEnded={markViewed}
              onError={() => setNeedsUnmute(false)}
            />
            {needsUnmute && (
              <button type="button" onClick={handleUnmute} className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-amber-400/60 bg-slate-950/95 px-4 py-2 text-xs font-black text-amber-100 shadow-xl">
                <Volume2 size={15} /> Bật tiếng
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-5 px-8 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-amber-400/40 bg-amber-400/10 text-amber-300">
              <PlayCircle size={32} />
            </div>
            <p className="max-w-2xl text-sm leading-7 text-slate-200">{ROOM_THREE_VIDEO_FOLLOW_UP}</p>
            <button type="button" onClick={onClose} className="rounded-xl bg-amber-400 px-5 py-3 text-xs font-black text-slate-950 transition hover:bg-amber-300">
              Tiếp tục tìm mảnh yêu sách
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomThreeVideoModal;
