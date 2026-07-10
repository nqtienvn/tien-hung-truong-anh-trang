import React, { useState, useEffect } from 'react';
import { X, Play, Pause, Globe, User, BookOpen, Volume2, Gamepad2 } from 'lucide-react';
import { useMuseum } from '@/context/MuseumContext';

export const ExhibitModal: React.FC = () => {
  const { 
    selectedExhibit, 
    setSelectedExhibit, 
    language, 
    setLanguage, 
    audioPlaying, 
    setAudioPlaying,
    setMiniGameOpen,
    hasPlayed,
    gameState,
    initializeGame
  } = useMuseum();
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(150); // 2 phút 30 giây mặc định

  // Xử lý mô phỏng trình phát audio thuyết minh chạy tăng dần khi bật
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (audioPlaying) {
      timer = setInterval(() => {
        setAudioProgress((prev) => {
          if (prev >= audioDuration) {
            setAudioPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [audioPlaying, audioDuration, setAudioPlaying]);

  // Reset tiến trình khi đổi hiện vật
  useEffect(() => {
    setAudioProgress(0);
    setAudioPlaying(false);
    // Thay đổi độ dài ngẫu nhiên từ 120 - 180s cho sinh động tùy hiện vật
    if (selectedExhibit) {
      const length = selectedExhibit.id.length * 7 + 80;
      setAudioDuration(length);
    }
  }, [selectedExhibit, setAudioPlaying]);

  if (!selectedExhibit) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const titleText = language === 'vi' ? selectedExhibit.title.vi : selectedExhibit.title.en;
  const authorText = language === 'vi' ? selectedExhibit.author.vi : selectedExhibit.author.en;
  const descriptionText = language === 'vi' ? selectedExhibit.description.vi : selectedExhibit.description.en;

  return (
    <div className="absolute right-4 top-20 bottom-20 w-[350px] sm:w-[400px] z-50 flex flex-col pointer-events-auto">
      <div className="flex-1 bg-slate-950/80 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100 transition-all duration-300">
        
        {/* Ảnh xem trước ở đầu Modal */}
        <div className="relative h-48 w-full bg-slate-900 border-b border-slate-800">
          <img 
            src={selectedExhibit.thumbnail_url} 
            alt={titleText}
            className="w-full h-full object-cover opacity-90"
          />
          {/* Lớp phủ dốc (Gradient Overlay) */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
          
          {/* Nút đóng */}
          <button 
            onClick={() => setSelectedExhibit(null)}
            className="absolute top-4 right-4 bg-slate-900/80 hover:bg-slate-800/80 text-slate-300 hover:text-white p-2 rounded-full border border-slate-700/50 backdrop-blur-sm transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>

          {/* Nhãn loại hiện vật */}
          <span className="absolute bottom-4 left-4 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold tracking-widest px-2.5 py-1 rounded-md uppercase">
            {selectedExhibit.model_3d_url ? (language === 'vi' ? 'Điêu Khắc 3D' : '3D Sculpture') : (language === 'vi' ? 'Hội Họa 2D' : '2D Painting')}
          </span>
        </div>

        {/* Nội dung chi tiết */}
        <div className="flex-1 p-6 overflow-y-auto space-y-5 custom-scrollbar">
          
          {/* Tiêu đề & Tác giả */}
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white leading-tight mb-1">
              {titleText}
            </h2>
            <div className="flex items-center gap-1.5 text-amber-400 text-sm">
              <User size={14} />
              <span className="font-medium">{authorText}</span>
            </div>
          </div>

          <hr className="border-slate-800/80" />

          {/* Bộ đổi ngôn ngữ (i18n) */}
          <div className="flex items-center justify-between bg-slate-900/50 p-2.5 rounded-xl border border-slate-800/60">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Globe size={14} />
              {language === 'vi' ? 'Ngôn ngữ thuyết minh' : 'Guide Language'}
            </span>
            <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800">
              <button 
                onClick={() => setLanguage('vi')}
                className={`text-xs px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${language === 'vi' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
              >
                VI
              </button>
              <button 
                onClick={() => setLanguage('en')}
                className={`text-xs px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${language === 'en' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
              >
                EN
              </button>
            </div>
          </div>

          {/* Thuyết minh văn bản */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
              <BookOpen size={14} />
              {selectedExhibit.id === 'vn-back-right'
                ? (language === 'vi' ? 'Luật chơi' : 'Rules of the Game')
                : (language === 'vi' ? 'Thuyết minh tác phẩm' : 'Explanatory Note')}
            </span>
            <p className="text-sm text-slate-300 leading-relaxed font-sans text-justify bg-slate-900/20 p-3 rounded-xl border border-slate-900">
              {descriptionText}
            </p>
          </div>

          {/* Nút chơi game cho hiện vật WTO */}
          {selectedExhibit.id === 'vn-back-right' && (
            <div className="bg-gradient-to-br from-cyan-500/10 to-transparent p-4 rounded-xl border border-cyan-500/25 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-400 tracking-wider uppercase flex items-center gap-1.5">
                  <Gamepad2 size={14} />
                  {language === 'vi' ? 'DÒNG CHẢY LỊCH SỬ' : 'HISTORY FLOW'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                {language === 'vi' 
                  ? 'Kiểm tra trí nhớ của bạn qua trò chơi lật thẻ bài về các dấu mốc hội nhập WTO & thế giới.' 
                  : 'Test your memory with our card matching game about Vietnam\'s integration milestones.'}
              </p>
              <div className="flex justify-center">
                <button
                  onClick={() => {
                    // Chỉ khởi tạo game mới khi game ở trạng thái nhàn rỗi ban đầu
                    if (gameState === 'idle') {
                      initializeGame();
                    }
                    setMiniGameOpen(true);
                    setSelectedExhibit(null); // Đóng modal chi tiết
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 py-2.5 px-6 rounded-xl font-bold text-xs transition-transform hover:scale-[1.02] active:scale-95 cursor-pointer shadow-lg shadow-cyan-500/20"
                >
                  <Gamepad2 size={14} fill="currentColor" />
                  {gameState === 'playing' 
                    ? (language === 'vi' ? 'TIẾP TỤC CHƠI' : 'RESUME GAME')
                    : (gameState === 'won' || gameState === 'lost'
                      ? (language === 'vi' ? 'XEM KẾT QUẢ' : 'VIEW RESULTS')
                      : (language === 'vi' ? 'BẮT ĐẦU CHƠI GAME' : 'START GAME'))}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
export default ExhibitModal;
