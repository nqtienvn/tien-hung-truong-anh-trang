'use client';

import React from 'react';
import { Html } from '@react-three/drei';
import {
  ROOM_FOUR_JOURNEY_CONTENT,
  ROOM_FOUR_JOURNEY_ORDER,
  ROOM_FOUR_SEALS,
  getNextRoomFourStation,
  getRoomFourStationProgress,
  roomFourCompletionToken,
  roomFourSealToken,
  roomFourStepToken,
  type RoomFourLanguage,
  type RoomFourSealId,
  type RoomFourStationId,
} from '@/lib/roomFourJourney';
import { ROOM_FOUR_PHASE_ELEVEN_TYPE_SCALE } from '@/lib/roomFourHistoricalMarkers';

interface RoomFourJourneyOverlayProps {
  language: RoomFourLanguage;
  progress: readonly string[];
  activeStationId: RoomFourStationId | null;
  notice: string | null;
  reducedEffects: boolean;
  journeyFinaleReady: boolean;
  journeyFinaleComplete: boolean;
  finalePlaying: boolean;
  activeJourneyLink: {
    sealId: RoomFourSealId;
    sourceStationId: RoomFourStationId;
    targetStationId: RoomFourStationId;
  } | null;
  onClose: () => void;
  onOpenCard: () => void;
  onPerformStep: (stationId: RoomFourStationId, stepIndex: number) => void;
  onSelectSeal: (sealId: RoomFourSealId) => void;
  onReplayFinale: () => void;
}

const FONT_STACK = '"Hanken Grotesk", "Manrope", sans-serif';
const DISPLAY_STACK = '"EB Garamond", Georgia, serif';
const LABEL_STACK = '"Space Grotesk", ui-monospace, monospace';
const COMPLETION_COLOR = '#4ade80';

export const RoomFourJourneyOverlay: React.FC<RoomFourJourneyOverlayProps> = ({
  language,
  progress,
  activeStationId,
  notice,
  reducedEffects,
  journeyFinaleReady,
  journeyFinaleComplete,
  finalePlaying,
  activeJourneyLink,
  onClose,
  onOpenCard,
  onPerformStep,
  onSelectSeal,
  onReplayFinale,
}) => {
  const [documentationStationId, setDocumentationStationId] = React.useState<RoomFourStationId | null>(null);
  const isVietnamese = language === 'vi';
  const cardCollected = progress.includes(roomFourCompletionToken('card'));
  const completedStationCount = ROOM_FOUR_JOURNEY_ORDER.slice(1).filter((stationId) =>
    progress.includes(roomFourCompletionToken(stationId)),
  ).length;
  const journeyCompleted = journeyFinaleComplete;
  const guangzhouTicketStamped = progress.includes(roomFourCompletionToken('s3'));
  const lyThuyMissionsOpened = progress.includes(roomFourCompletionToken('s4'));
  const nextStationId = getNextRoomFourStation(progress);
  const nextContent = nextStationId ? ROOM_FOUR_JOURNEY_CONTENT[nextStationId] : null;
  const activeContent = activeStationId ? ROOM_FOUR_JOURNEY_CONTENT[activeStationId] : null;
  const activeProgress = activeStationId
    ? getRoomFourStationProgress(progress, activeStationId)
    : 0;
  const activeComplete = activeStationId
    ? progress.includes(roomFourCompletionToken(activeStationId))
    : false;
  const activeCanPerformStep = Boolean(
    activeStationId && !activeComplete && activeStationId === nextStationId,
  );
  const activeWarm = activeStationId ? ['s4', 's5', 's6', 's7', 's8'].includes(activeStationId) : false;
  const accent = activeWarm ? '#d39a55' : '#afc9d3';
  const accentStrong = COMPLETION_COLOR;
  const linkTarget = activeJourneyLink
    ? ROOM_FOUR_JOURNEY_CONTENT[activeJourneyLink.targetStationId]
    : null;

  const showDocumentation = documentationStationId === activeStationId;

  return (
    <Html
      fullscreen
      zIndexRange={[20_000_000, 19_000_000]}
      calculatePosition={(_, __, size) => [size.width / 2, size.height / 2]}
      style={{ pointerEvents: 'none', fontFamily: FONT_STACK }}
    >
      <div className="absolute inset-0 select-none text-slate-100">
        <div
          className="absolute left-3 w-[min(310px,calc(100vw-24px))] sm:left-5"
          style={{ top: '4.75rem' }}
        >
          {cardCollected ? (
            <div
              role="button"
              tabIndex={0}
              onClick={onOpenCard}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onOpenCard();
                }
              }}
              className={`pointer-events-auto block w-full border border-slate-600/60 bg-[#10191f]/95 px-4 py-3 text-left shadow-[0_18px_50px_rgba(3,9,13,0.34)] transition-transform duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#afc9d3] active:translate-y-0 ${reducedEffects ? '' : 'backdrop-blur-md'}`}
              aria-label={isVietnamese ? 'Mở Thẻ hành trình' : 'Open the Journey Card'}
            >
              <div className="flex items-start justify-between gap-4 border-b border-slate-600/35 pb-2">
                <div>
                  <div className="text-[9px] tracking-[0.2em] text-[#afc9d3]" style={{ fontFamily: LABEL_STACK }}>1923—1927</div>
                  <div className="mt-1 text-sm font-semibold tracking-tight">
                    {isVietnamese ? 'Thẻ hành trình' : 'Journey Card'}
                  </div>
                </div>
                <div className="text-xs tabular-nums text-slate-300" style={{ fontFamily: LABEL_STACK }}>
                  {completedStationCount}/8
                </div>
              </div>

              <div className="mt-2.5 h-0.5 overflow-hidden bg-slate-700/60">
                <div
                  className={`h-full transition-[width] duration-500 ${
                    completedStationCount > 0 ? 'bg-[#4ade80]' : 'bg-[#afc9d3]'
                  }`}
                  style={{ width: `${(completedStationCount / 8) * 100}%` }}
                />
              </div>

              <div className="mt-3 grid grid-cols-4 gap-x-2 gap-y-1.5">
                {ROOM_FOUR_SEALS.map((seal) => {
                  const received = progress.includes(roomFourSealToken(seal.id));
                  const linkable = received && ['theory', 'relations', 'method'].includes(seal.id);
                  const selected = activeJourneyLink?.sealId === seal.id;
                  const className = `border-l-2 pl-1.5 text-[9px] leading-tight transition-colors ${
                    selected
                      ? 'border-[#d39a55] bg-[#d39a55]/10 text-[#f2dfb6]'
                      : received
                        ? 'border-[#4ade80] text-[#bbf7d0]'
                        : 'border-slate-700 text-slate-600'
                  }`;
                  return (
                    <button
                      key={seal.id}
                      type="button"
                      disabled={!linkable}
                      onClick={(event) => {
                        event.stopPropagation();
                        onSelectSeal(seal.id);
                      }}
                      className={`${className} ${
                        linkable
                          ? 'cursor-pointer text-left hover:bg-[#d39a55]/10 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#d39a55]'
                          : 'cursor-default text-left'
                      }`}
                      aria-label={
                        linkable
                          ? isVietnamese
                            ? `Xem liên kết từ dấu ấn ${seal.labelVi}`
                            : `View the link from the ${seal.labelEn} imprint`
                          : undefined
                      }
                    >
                      {isVietnamese ? seal.labelVi : seal.labelEn}{linkable ? ' ↗' : ''}
                    </button>
                  );
                })}
              </div>

              {linkTarget && (
                <div className="mt-2 border-l-2 border-[#d39a55] bg-[#d39a55]/10 px-2 py-1.5 text-[8.5px] leading-snug text-[#f2dfb6]" role="status">
                  {isVietnamese
                    ? `Liên kết: ${ROOM_FOUR_SEALS.find((seal) => seal.id === activeJourneyLink?.sealId)?.labelVi} → ${linkTarget.eyebrowVi}`
                    : `Link: ${ROOM_FOUR_SEALS.find((seal) => seal.id === activeJourneyLink?.sealId)?.labelEn} → ${linkTarget.eyebrowEn}`}
                </div>
              )}

              <div className="mt-3 grid grid-cols-2 border-t border-slate-700/45 pt-2 text-[8.5px] leading-tight">
                <div className={guangzhouTicketStamped ? 'text-[#4ade80]' : 'text-slate-600'}>
                  {isVietnamese ? 'Vé Quảng Châu · 11/1924' : 'Guangzhou ticket · Nov 1924'}
                </div>
                <div className={`text-right ${lyThuyMissionsOpened ? 'text-[#4ade80]' : 'text-slate-600'}`}>
                  {isVietnamese ? 'Ba nhiệm vụ · Lý Thụy' : 'Three missions · Ly Thuy'}
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between gap-3 text-[9px] leading-snug text-slate-400">
                <span className="line-clamp-2">
                  {journeyCompleted
                    ? isVietnamese
                      ? 'Hành trang đã sẵn sàng'
                      : 'The journey kit is ready'
                    : finalePlaying
                      ? isVietnamese
                        ? 'Năm hành trang đang hội tụ tại Trạm 08'
                        : 'Five imprints are converging at Station 08'
                    : nextContent
                      ? isVietnamese
                        ? `Tiếp theo: ${nextContent.eyebrowVi}`
                        : `Next: ${nextContent.eyebrowEn}`
                      : journeyFinaleReady
                        ? isVietnamese
                          ? 'Trạm 08 đang chuẩn bị cao trào hành trình'
                          : 'Station 08 is preparing the journey finale'
                        : ''}
                </span>
                <span className="shrink-0 text-[#afc9d3]">
                  {isVietnamese ? 'Mở thẻ ↗' : 'Open ↗'}
                </span>
              </div>
            </div>
          ) : (
            <div className={`border-l-2 border-[#afc9d3] bg-[#10191f]/88 px-4 py-3 shadow-xl ${reducedEffects ? '' : 'backdrop-blur-md'}`}>
              <div className="text-[9px] tracking-[0.18em] text-[#afc9d3]" style={{ fontFamily: LABEL_STACK }}>
                {isVietnamese ? 'ĐIỂM BẮT ĐẦU' : 'STARTING POINT'}
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-200">
                {isVietnamese
                  ? 'Đến bàn bên phải và nhấn vào Thẻ hành trình 1923–1927.'
                  : 'Approach the desk on the right and select the 1923–1927 Journey Card.'}
              </p>
            </div>
          )}
        </div>

        {notice && (
          <div
            className={`absolute left-1/2 top-[20.5rem] w-[min(540px,calc(100vw-32px))] -translate-x-1/2 border border-slate-500/50 bg-[#11191d]/95 px-4 py-2.5 text-center text-xs leading-relaxed text-slate-100 shadow-2xl ${reducedEffects ? '' : 'backdrop-blur-md'}`}
            role="status"
            aria-live="polite"
          >
            {notice}
          </div>
        )}

        {finalePlaying && !activeContent && (
          <div
            className={`absolute right-4 hidden w-72 border-r-2 border-[#d39a55] bg-[#1d1916]/92 px-4 py-3 text-right shadow-xl md:block ${reducedEffects ? '' : 'backdrop-blur-md'}`}
            style={{ top: '4.75rem' }}
            role="status"
            aria-live="polite"
          >
            <div className="text-[9px] tracking-[0.16em] text-[#d39a55]" style={{ fontFamily: LABEL_STACK }}>
              {isVietnamese ? 'CAO TRÀO · TRẠM 08' : 'FINALE · STATION 08'}
            </div>
            <p className="mt-1.5 text-sm font-semibold leading-snug text-[#f2dfb6]">
              {isVietnamese
                ? 'Lý luận · Tổ chức · Báo chí · Cán bộ · Mạng lưới'
                : 'Theory · Organisation · Press · Cadres · Network'}
            </p>
          </div>
        )}

        {journeyCompleted && !activeContent && !finalePlaying && (
          <div
            className={`absolute right-4 hidden w-72 border-r-2 border-[#d39a55] bg-[#1d1916]/92 px-4 py-3 text-right shadow-xl md:block ${reducedEffects ? '' : 'backdrop-blur-md'}`}
            style={{ top: '4.75rem' }}
          >
            <div className="text-[9px] tracking-[0.16em] text-[#d39a55]" style={{ fontFamily: LABEL_STACK }}>
              {isVietnamese ? 'CỬA RA PHÒNG 05' : 'EXIT TO ROOM 05'}
            </div>
            <p className="mt-1.5 text-sm font-semibold leading-snug text-[#f2dfb6]">
              {isVietnamese
                ? 'Hành trang đã sẵn sàng — Con đường về Tổ quốc'
                : 'The journey kit is ready — The road home'}
            </p>
            <button
              type="button"
              onClick={onReplayFinale}
              className="pointer-events-auto mt-3 border border-[#d39a55]/60 px-2.5 py-1 text-[9px] tracking-[0.08em] text-[#f2dfb6] transition-colors hover:border-[#f2dfb6] hover:text-white focus:outline-none focus-visible:ring-2"
            >
              {isVietnamese ? 'XEM LẠI HỘI TỤ ↗' : 'REPLAY CONVERGENCE ↗'}
            </button>
          </div>
        )}

        {activeContent && (
          <div
            className={`pointer-events-auto absolute inset-0 flex items-center justify-center overflow-y-auto bg-[#071016]/80 p-3 sm:p-6 ${reducedEffects ? '' : 'backdrop-blur-sm'}`}
            role="dialog"
            aria-modal="true"
            aria-label={isVietnamese ? activeContent.eyebrowVi : activeContent.eyebrowEn}
            onPointerDown={(event) => event.stopPropagation()}
          >
            <section
              className="relative my-auto grid max-h-[calc(100dvh-1.5rem)] w-full max-w-5xl overflow-y-auto border bg-[#11191d]/98 shadow-[0_28px_90px_rgba(2,8,12,0.58)] sm:max-h-[calc(100dvh-3rem)] lg:grid-cols-[1.08fr_0.92fr] lg:overflow-hidden"
              style={{
                borderColor: `${accent}66`,
                backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.012) 0, rgba(255,255,255,0.012) 1px, transparent 1px, transparent 5px)',
              }}
            >
              <button
                type="button"
                onClick={onClose}
                className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center border border-slate-500/50 bg-[#11191d] text-base text-slate-300 transition-colors hover:border-slate-300 hover:text-white focus:outline-none focus-visible:ring-2 active:translate-y-px"
                aria-label={isVietnamese ? 'Đóng' : 'Close'}
              >
                ×
              </button>

              <div className="border-b border-slate-700/55 p-5 sm:p-7 lg:overflow-y-auto lg:border-b-0 lg:border-r">
                <div className="text-[10px] tracking-[0.18em]" style={{ color: accent, fontFamily: LABEL_STACK }}>
                  {isVietnamese ? activeContent.eyebrowVi : activeContent.eyebrowEn}
                </div>
                <h2 className={`mt-3 max-w-[19ch] pr-12 font-semibold leading-[1] tracking-[-0.025em] text-[#eee5d4] ${ROOM_FOUR_PHASE_ELEVEN_TYPE_SCALE.overlayTitleClass}`} style={{ fontFamily: DISPLAY_STACK }}>
                  {activeComplete
                    ? isVietnamese
                      ? activeContent.meaning.vi
                      : activeContent.meaning.en
                    : isVietnamese
                      ? activeContent.before.vi
                      : activeContent.before.en}
                </h2>

                {!activeComplete && (
                  <p className="mt-3 max-w-[48ch] text-[13px] leading-6 text-slate-400">
                    {isVietnamese ? activeContent.leadVi : activeContent.leadEn}
                  </p>
                )}

                {!activeComplete && !activeCanPerformStep && (
                  <div className="mt-5 border-l-2 border-slate-500/80 bg-slate-800/45 px-4 py-3" role="status">
                    <div className="text-[9px] tracking-[0.14em] text-slate-300" style={{ fontFamily: LABEL_STACK }}>
                      {isVietnamese ? 'TRẠM CHƯA ĐẾN LƯỢT' : 'STATION NOT YET AVAILABLE'}
                    </div>
                    <p className="mt-1.5 text-xs leading-5 text-slate-300">
                      {nextContent
                        ? isVietnamese
                          ? `Hãy tiếp tục tại ${nextContent.eyebrowVi}.`
                          : `Continue at ${nextContent.eyebrowEn}.`
                        : isVietnamese
                          ? 'Hành trình đã hoàn thành.'
                          : 'The journey is complete.'}
                    </p>
                  </div>
                )}

                {activeComplete ? (
                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={() => setDocumentationStationId(showDocumentation ? null : activeStationId)}
                      className="border-b border-slate-600/70 pb-1 text-[10px] tracking-[0.12em] text-slate-400 transition-colors hover:border-slate-300 hover:text-slate-100 focus:outline-none focus-visible:ring-2"
                    >
                      {showDocumentation
                        ? isVietnamese
                          ? 'ẨN TƯ LIỆU'
                          : 'HIDE DOCUMENTATION'
                        : isVietnamese
                          ? 'ĐỌC TƯ LIỆU'
                          : 'READ DOCUMENTATION'}
                    </button>
                    {showDocumentation && (
                      <div className="mt-4 space-y-3 border-l border-slate-600/60 pl-4 text-[13px] leading-6 text-slate-300">
                        {(isVietnamese ? activeContent.historyVi : activeContent.historyEn).map((paragraph) => (
                          <p key={paragraph}>{paragraph}</p>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-6 space-y-3 border-l border-slate-600/60 pl-4 text-[13px] leading-6 text-slate-300">
                    {(isVietnamese ? activeContent.historyVi : activeContent.historyEn).map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                )}

                <div className="mt-6 border-t border-slate-700/55 pt-4">
                  <div className="text-[10px] font-medium tracking-[0.12em] text-slate-500">
                    {activeCanPerformStep
                      ? isVietnamese
                        ? 'MỘT HÀNH ĐỘNG'
                        : 'ONE ACTION'
                      : isVietnamese
                        ? 'HÀNH TRÌNH TIẾP THEO'
                        : 'THE NEXT PART OF THE JOURNEY'}
                  </div>
                  <p className="mt-1.5 text-sm font-medium text-slate-100">
                    {activeCanPerformStep
                      ? isVietnamese
                        ? activeContent.action.vi
                        : activeContent.action.en
                      : nextContent
                        ? isVietnamese
                          ? `Tiếp tục tại ${nextContent.eyebrowVi}.`
                          : `Continue at ${nextContent.eyebrowEn}.`
                        : isVietnamese
                          ? 'Hành trình đã hoàn thành.'
                          : 'The journey is complete.'}
                  </p>
                </div>
              </div>

              <div className="flex min-h-0 flex-col bg-[#0d1519] p-5 sm:p-7">
                <div className="pr-12">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="text-sm font-semibold text-[#eee5d4]">
                      {isVietnamese ? 'Khám phá hiện vật' : 'Explore the object'}
                    </h3>
                    <span className="text-[10px] tabular-nums" style={{ color: accent, fontFamily: LABEL_STACK }}>
                      {activeProgress}/{activeContent.steps.length}
                    </span>
                  </div>
                  <div className="mt-2 h-px bg-slate-700/65">
                    <div
                      className="h-px transition-[width] duration-500"
                      style={{
                        width: `${(activeProgress / activeContent.steps.length) * 100}%`,
                        backgroundColor: accent,
                      }}
                    />
                  </div>
                </div>

                <div className="mt-5 max-h-[46vh] space-y-2 overflow-y-auto pr-1 lg:max-h-[50vh]">
                  {activeContent.steps.map((step, index) => {
                    const done = progress.includes(roomFourStepToken(activeContent.id, step.id));
                    const available = activeCanPerformStep && index === activeProgress;
                    return (
                      <button
                        key={step.id}
                        type="button"
                        disabled={!available}
                        onClick={() => onPerformStep(activeContent.id, index)}
                        className={`block w-full border px-4 py-3 text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 active:translate-y-px ${
                          done
                            ? 'border-slate-600/45 bg-slate-800/45 text-slate-200'
                            : available
                              ? 'bg-slate-900/80 text-white hover:-translate-y-0.5'
                              : 'cursor-not-allowed border-slate-800 bg-[#0a1115] text-slate-600'
                        }`}
                        style={available ? { borderColor: `${accent}99` } : undefined}
                      >
                        <span className="flex items-start gap-3">
                          <span
                            className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center border font-mono text-[9px]"
                            style={
                              done
                                ? { borderColor: accentStrong, color: accentStrong }
                                : available
                                  ? { borderColor: accent, color: accent }
                                  : undefined
                            }
                          >
                            {done ? '✓' : index + 1}
                          </span>
                          <span>
                            <span className="block text-xs font-semibold leading-5">
                              {isVietnamese ? step.titleVi : step.titleEn}
                            </span>
                            {(done || available) && (
                              <span className={`mt-1 block text-[10px] leading-4 ${done ? 'text-slate-400' : 'text-slate-500'}`}>
                                {done
                                  ? isVietnamese
                                    ? step.detailVi
                                    : step.detailEn
                                  : isVietnamese
                                    ? 'Nhấn để kích hoạt'
                                    : 'Select to activate'}
                              </span>
                            )}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>

                {activeProgress > 0 && !activeComplete && (
                  <div className="mt-4 border-l-2 border-slate-600/75 bg-slate-800/35 px-4 py-3">
                    <div className="text-[9px] tracking-[0.14em]" style={{ color: accent, fontFamily: LABEL_STACK }}>
                      {isVietnamese ? 'THAY ĐỔI ĐANG HIỆN RA' : 'THE CHANGE IS APPEARING'}
                    </div>
                    <p className="mt-1.5 text-xs leading-5 text-[#e9ddc7]">
                      {isVietnamese ? activeContent.after.vi : activeContent.after.en}
                    </p>
                  </div>
                )}

                {activeComplete ? (
                  <div className="mt-5 border-l-2 px-4 py-3" style={{ borderColor: accentStrong, backgroundColor: `${accentStrong}18` }}>
                    <div className="text-[9px] tracking-[0.14em]" style={{ color: accentStrong, fontFamily: LABEL_STACK }}>
                      {isVietnamese ? 'DẤU ẤN ĐÃ GHI' : 'IMPRINT RECORDED'}
                    </div>
                    <p className="mt-1.5 text-xs leading-5 text-[#e9ddc7]">
                      {isVietnamese ? activeContent.meaning.vi : activeContent.meaning.en}
                    </p>
                    <p className="mt-2 text-[10px] leading-4 text-slate-400">
                      {isVietnamese ? activeContent.after.vi : activeContent.after.en}
                    </p>
                    <button
                      type="button"
                      onClick={onClose}
                      className="mt-3 border border-slate-500/60 px-3 py-1.5 text-[10px] font-medium text-slate-200 transition-colors hover:border-slate-300 hover:text-white focus:outline-none focus-visible:ring-2 active:translate-y-px"
                    >
                      {activeContent.id === 's8'
                        ? isVietnamese
                          ? 'Đến cửa ra Phòng 05'
                          : 'Continue to Room 05'
                        : isVietnamese
                          ? 'Tiếp tục theo đường sáng'
                          : 'Continue along the light path'}
                    </button>
                  </div>
                ) : activeCanPerformStep ? (
                  <p className="mt-5 text-[10px] leading-4 text-slate-500">
                    {isVietnamese
                      ? 'Mỗi thao tác sẽ thay đổi hiện vật, vùng sáng và Thẻ hành trình.'
                      : 'Every action changes the object, its light pool and the Journey Card.'}
                  </p>
                ) : null}
              </div>
            </section>
          </div>
        )}
      </div>
    </Html>
  );
};

export default RoomFourJourneyOverlay;
