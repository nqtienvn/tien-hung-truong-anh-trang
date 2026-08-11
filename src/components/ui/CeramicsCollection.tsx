'use client';

import React, { useState, useEffect } from 'react';
import { useMuseum } from '@/context/MuseumContext';
import { X, Lock, CheckCircle, ShieldAlert, Sparkles, BookOpen, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ROOM_THREE_DISPLAY_NAME } from '@/lib/roomThreeNarrative';

interface CeramicExhibitItem {
  id: string;
  title: { vi: string; en: string };
  year: string;
  thumbnail_url: string;
  description: { vi: string; en: string };
}

const CERAMICS_LIST: CeramicExhibitItem[] = [
  {
    id: 'vn-left-1',
    title: { vi: 'Đại hội VI - Đổi mới', en: '6th Party Congress - Doi Moi' },
    year: '1986',
    thumbnail_url: '/exhibits/sk1.jpg',
    description: {
      vi: 'Đại hội VI được xem là cột mốc mở đầu cho quá trình đổi mới toàn diện của Việt Nam. Những quyết sách được thông qua tại kỳ đại hội này đã tạo nền tảng cho sự chuyển biến về kinh tế, xã hội và đối ngoại trong nhiều năm tiếp theo.',
      en: 'The 6th National Congress of the Communist Party of Vietnam is widely considered the pivotal moment that initiated the country\'s comprehensive Doi Moi (Renovation) reforms.'
    }
  },
  {
    id: 'vn-left-2',
    title: { vi: 'Khoán 10', en: 'Resolution 10 (Khoan 10)' },
    year: '1988',
    thumbnail_url: '/exhibits/sk2.jpg',
    description: {
      vi: 'Việc giao quyền chủ động nhiều hơn cho người nông dân đã tạo nên những thay đổi rõ rệt trong sản xuất nông nghiệp. Ruộng đồng trở nên sôi động hơn, năng suất được cải thiện và đời sống của nhiều hộ gia đình từng bước khởi sắc.',
      en: 'Greater autonomy given to farmers brought noticeable changes to agricultural production. Communal fields became more vibrant, productivity improved, and the lives of many households gradually prospered.'
    }
  },
  {
    id: 'vn-left-3',
    title: { vi: 'Việt Nam rút quân khỏi Campuchia', en: 'Withdrawal from Cambodia' },
    year: '1989',
    thumbnail_url: '/exhibits/sk3.jpg',
    description: {
      vi: 'Sau nhiều năm thực hiện nhiệm vụ quốc tế, Việt Nam quyết định rút toàn bộ lực lượng quân tình nguyện khỏi Campuchia. Quyết định này góp phần tạo dựng môi trường hòa bình, thúc đẩy đối thoại và mở ra nhiều cơ hội hợp tác trong khu vực.',
      en: 'After many years of carrying out international duties, Vietnam decided to withdraw all its volunteer troops from Cambodia. This decision helped create a peaceful environment.'
    }
  },
  {
    id: 'vn-right-1',
    title: { vi: 'Việt Nam trở thành nước xuất khẩu gạo', en: 'VN becomes a major rice exporter' },
    year: '1989',
    thumbnail_url: '/exhibits/sk4.jpg',
    description: {
      vi: 'Ít ai nghĩ rằng một quốc gia từng gặp nhiều khó khăn về lương thực lại có thể vươn lên trở thành một trong những nước xuất khẩu gạo trên thế giới. Thành quả ấy phản ánh sự chuyển biến tích cực của nền nông nghiệp sau nhiều cải cách.',
      en: 'Few would have thought that a country once facing severe food shortages could rise to become one of the world\'s leading rice exporters. This achievement reflects the positive transformation of its agriculture.'
    }
  },
  {
    id: 'vn-back-left',
    title: { vi: 'Liên Xô tan rã', en: 'Soviet Union dissolution' },
    year: '1991',
    thumbnail_url: '/exhibits/sk9.jpg',
    description: {
      vi: 'Sự tan rã của Liên Xô đã tạo nên những biến động lớn trong cục diện chính trị và kinh tế toàn cầu. Đối với Việt Nam, đây là thời điểm đòi hỏi sự thích ứng trong chính sách phát triển.',
      en: 'The dissolution of the Soviet Union created significant upheavals in the global political and economic landscape. For Vietnam, this was a time that required adaptation.'
    }
  },
  {
    id: 'vn-right-2',
    title: { vi: 'Hoa Kỳ bãi bỏ cấm vận', en: 'US lifts trade embargo' },
    year: '03/02/1994',
    thumbnail_url: '/exhibits/sk5.jpg',
    description: {
      vi: 'Một chương mới trong quan hệ kinh tế quốc tế bắt đầu khi nhiều rào cản được dỡ bỏ, tạo điều kiện để Việt Nam mở rộng hợp tác và thu hút đầu tư từ bên ngoài.',
      en: 'A new chapter in international economic relations began as many barriers were removed, creating favorable conditions for Vietnam to expand cooperation and attract foreign investment.'
    }
  },
  {
    id: 'vn-right-3',
    title: { vi: 'Bình thường hóa quan hệ Việt Nam – Hoa Kỳ', en: 'Normalization of US-VN relations' },
    year: '11/07/1995',
    thumbnail_url: '/exhibits/sk6.jpg',
    description: {
      vi: 'Khoảnh khắc đại diện hai quốc gia bắt tay nhau đã trở thành hình ảnh mang tính biểu tượng của sự hòa giải và hợp tác toàn diện.',
      en: 'The handshake between representatives of the two nations has become an iconic image of reconciliation and cooperation.'
    }
  },
  {
    id: 'vn-door-left',
    title: { vi: 'Việt Nam gia nhập ASEAN', en: 'VN joins ASEAN' },
    year: '28/07/1995',
    thumbnail_url: '/exhibits/sk7.jpg',
    description: {
      vi: 'Việc trở thành thành viên của ASEAN đánh dấu bước tiến quan trọng trong quá trình hội nhập khu vực, mở ra một chặng đường mới.',
      en: 'Becoming a member of ASEAN marked a significant step in the regional integration process, opening a new chapter.'
    }
  },
  {
    id: 'vn-door-right',
    title: { vi: 'Nhật thực toàn phần tại Việt Nam', en: 'Total solar eclipse in Vietnam' },
    year: '24/10/1995',
    thumbnail_url: '/exhibits/sk8.jpg',
    description: {
      vi: 'Hàng triệu người dân cùng các nhà khoa học đã hướng mắt lên bầu trời để quan sát nhật thực toàn phần, tạo nên một ký ức khó quên.',
      en: 'Millions of people and scientists looked up to observe a total solar eclipse, creating an unforgettable memory.'
    }
  }
];

export const CeramicsCollection: React.FC = () => {
  const { activeGallery, collectedCeramics, nickname, language } = useMuseum();
  const [isOpen, setIsOpen] = useState(false);

  // Check if player is in the Room 3 (ceramics)
  const isCeramicsRoom = activeGallery?.id === 'gallery-ceramics';

  // Sắp xếp danh sách hiện vật gốm sứ theo thứ tự thu thập
  const sortedList = [...CERAMICS_LIST].sort((a, b) => {
    const aIndex = collectedCeramics.indexOf(a.id);
    const bIndex = collectedCeramics.indexOf(b.id);
    const aCollected = aIndex !== -1;
    const bCollected = bIndex !== -1;
    
    if (aCollected && bCollected) {
      return aIndex - bIndex;
    }
    if (aCollected && !bCollected) return -1;
    if (!aCollected && bCollected) return 1;
    return 0;
  });

  // Confetti when all items are collected
  useEffect(() => {
    if (collectedCeramics.length === CERAMICS_LIST.length && isCeramicsRoom) {
      const showSuccessConfetti = () => {
        confetti({ particleCount: 150, spread: 80, scalar: 1.2 });
      };
      // Run once when collection is fully unlocked
      const key = `ceramics_completed_confetti:${nickname}`;
      if (localStorage.getItem(key) !== 'true') {
        showSuccessConfetti();
        localStorage.setItem(key, 'true');
      }
    }
  }, [collectedCeramics.length, isCeramicsRoom, nickname]);

  if (!isCeramicsRoom || !nickname) return null;

  return (
    <>
      {/* FLOATING ACTION BUTTON */}
      <div className="absolute right-4 bottom-4 z-40 pointer-events-auto">
        <button
          onClick={() => setIsOpen(true)}
          className={`flex items-center gap-2 px-5 py-3 rounded-full border shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer ${
            collectedCeramics.length === CERAMICS_LIST.length
              ? 'bg-emerald-600 hover:bg-emerald-500 border-emerald-500 text-white font-semibold'
              : 'bg-amber-600 hover:bg-amber-500 border-amber-500 text-slate-950 font-bold animate-pulse'
          }`}
        >
          <BookOpen size={16} />
          <span className="text-xs uppercase tracking-wider">
            {language === 'vi' ? 'Bộ sưu tập' : 'Collection'}
          </span>
          <span className="bg-black/20 px-2 py-0.5 rounded-full text-[10px] font-bold">
            {collectedCeramics.length}/{CERAMICS_LIST.length}
          </span>
        </button>
      </div>

      {/* MODAL ALBUM BỘ SƯU TẬP */}
      {isOpen && (
        <div className="absolute inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 pointer-events-auto">
          <div className="w-full max-w-5xl h-[85vh] bg-[#0c0d12] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-100 relative select-none animate-fade-in font-sans">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-950 border-b border-slate-850 px-6 py-4 flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">🖼️</span>
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-white">
                    {language === 'vi' ? 'ALBUM BỘ SƯU TẬP LỊCH SỬ' : 'HISTORICAL ART ALBUM'}
                  </h2>
                  <p className="text-[10px] uppercase tracking-widest text-amber-400 font-mono leading-none mt-1">
                    {language === 'vi' ? ROOM_THREE_DISPLAY_NAME : 'Room 03 • Integration Room'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white p-2 rounded-full border border-slate-850 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Collection Progress & Instruction */}
            <div className="bg-slate-900/40 px-6 py-3 border-b border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-amber-400" />
                <span>
                  {language === 'vi' 
                    ? 'Thu thập dữ kiện bằng cách nhấp xem chi tiết từng bức tranh ở trong phòng 3D.' 
                    : 'Collect evidence by clicking details on each artwork in the 3D room.'}
                </span>
              </div>
              <div className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full font-bold uppercase tracking-widest font-mono text-[10px] shrink-0">
                {language === 'vi' ? 'Tiến độ: ' : 'Progress: '}{collectedCeramics.length}/{CERAMICS_LIST.length}
              </div>
            </div>

            {/* Grid list */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-950/20">
              {collectedCeramics.length === CERAMICS_LIST.length && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex items-center justify-center gap-3 text-center text-emerald-400 max-w-xl mx-auto mb-2 animate-bounce">
                  <Award size={20} />
                  <span className="font-semibold text-xs uppercase tracking-wider">
                    {language === 'vi' 
                      ? 'Xin chúc mừng! Bạn đã thu thập đủ toàn bộ 9 dữ kiện.' 
                      : 'Congratulations! You have collected all 9 evidences.'}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {sortedList.map((item) => {
                  const isCollected = collectedCeramics.includes(item.id);
                  const title = language === 'vi' ? item.title.vi : item.title.en;
                  const desc = language === 'vi' ? item.description.vi : item.description.en;

                  return (
                    <div 
                      key={item.id}
                      className={`border rounded-2xl overflow-hidden transition-all duration-300 relative flex flex-col min-h-[340px] ${
                        isCollected 
                          ? 'bg-slate-900/60 border-slate-800 hover:border-amber-500/50 shadow-md' 
                          : 'bg-slate-950/40 border-dashed border-slate-850 opacity-60'
                      }`}
                    >
                      {/* Image Preview */}
                      <div className="relative h-40 bg-slate-950 shrink-0">
                        {isCollected ? (
                          <img
                            src={item.thumbnail_url}
                            alt={title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900/80 gap-2 text-slate-500">
                            <Lock size={26} className="text-slate-600" />
                            <span className="text-[10px] font-bold uppercase tracking-widest font-mono">
                              {language === 'vi' ? 'Chưa mở khóa' : 'Locked'}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Content details */}
                      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                        <div className="space-y-1.5">
                          {isCollected ? (
                            <>
                              <h3 className="text-sm font-bold text-white leading-snug">
                                {title}
                              </h3>
                              <p className="text-xs text-slate-450 leading-relaxed text-justify font-normal">
                                {desc}
                              </p>
                            </>
                          ) : (
                            <>
                              <h3 className="text-sm font-bold text-slate-600 line-clamp-1">
                                {language === 'vi' ? 'Sự kiện bí ẩn' : 'Mystery Event'}
                              </h3>
                              <p className="text-[11px] text-slate-550 italic leading-relaxed text-center py-6 font-sans">
                                {language === 'vi' 
                                  ? 'Hãy tìm và xem chi tiết bức tranh này trong phòng 3D để thu thập dữ kiện.'
                                  : 'Find and view details of this painting in the 3D room to collect evidence.'}
                              </p>
                            </>
                          )}
                        </div>

                        {/* Status Label */}
                        <div className="border-t border-slate-900 pt-3 flex items-center justify-between text-[10px] font-mono">
                          <span className="text-slate-500 uppercase tracking-wider">#{item.id}</span>
                          {isCollected ? (
                            <span className="text-emerald-400 font-bold flex items-center gap-1">
                              <CheckCircle size={10} /> {language === 'vi' ? 'Đã lưu' : 'Saved'}
                            </span>
                          ) : (
                            <span className="text-slate-500 font-bold flex items-center gap-1">
                              🔒 {language === 'vi' ? 'Khóa' : 'Locked'}
                            </span>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-900 border-t border-slate-850 px-6 py-3 flex items-center justify-between text-[10px] font-mono text-slate-500 relative z-10">
              <span>Đại học FPT - MLN122 Project</span>
              <span>{language === 'vi' ? ROOM_THREE_DISPLAY_NAME : 'Room 03: Integration Room'}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CeramicsCollection;
