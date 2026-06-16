'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMuseum } from '@/context/MuseumContext';
import { Gallery } from '@/lib/db';
import { Sparkles, ArrowRight, ShieldAlert, Globe, Compass, Image as ImageIcon, Box } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { 
    language, 
    setLanguage, 
    nickname, 
    setNickname, 
    setActiveGallery,
    setSelectedExhibit
  } = useMuseum();

  const [inputName, setInputName] = useState(nickname);
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch danh sách phòng triển lãm từ API
  useEffect(() => {
    setActiveGallery(null); // Reset phòng khi về sảnh chính
    setSelectedExhibit(null); // Reset hiện vật đang chọn

    fetch('/api/galleries')
      .then((res) => res.json())
      .then((data) => {
        setGalleries(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Lỗi fetch phòng triển lãm:', err);
        setError('Không thể kết nối đến máy chủ.');
        setLoading(false);
      });
  }, [setActiveGallery, setSelectedExhibit]);

  const handleEnterRoom = (gallery: Gallery) => {
    if (!inputName.trim()) {
      setError(language === 'vi' ? 'Vui lòng nhập biệt danh của bạn!' : 'Please enter your nickname!');
      return;
    }
    setError('');
    setNickname(inputName.trim());
    setActiveGallery(gallery);
    router.push(`/gallery/${gallery.id}`);
  };

  return (
    <div className="relative min-h-screen bg-[#07070a] flex flex-col justify-between overflow-hidden">
      
      {/* 1. NỀN BACKGROUND MESH GRADIENT HÚT MẮT */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-tr from-amber-500/15 to-rose-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-br from-cyan-500/10 to-indigo-500/20 blur-[150px]" />
        <div className="absolute top-[30%] right-[20%] w-[30vw] h-[30vw] rounded-full bg-violet-600/10 blur-[100px]" />
        {/* Đường lưới tọa độ ảo tạo chiều sâu công nghệ */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      {/* 2. THANH HEADER LOBBY */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-tr from-amber-500 to-rose-500 p-2 rounded-xl shadow-lg shadow-amber-500/20">
            <Compass className="text-slate-950" size={20} />
          </div>
          <span className="font-sans font-black tracking-widest text-lg bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent uppercase">
            ORTUS MUSEUM
          </span>
        </div>

        {/* Nút đổi ngôn ngữ & Quản trị */}
        <div className="flex items-center gap-3">
          {/* Admin link */}
          <button 
            onClick={() => router.push('/admin')}
            className="text-xs bg-slate-900/60 hover:bg-slate-800/60 text-slate-300 hover:text-white px-3.5 py-1.8 rounded-lg border border-slate-800 transition-all font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <ShieldAlert size={12} className="text-amber-500" />
            CMS Admin
          </button>
          
          <div className="flex bg-slate-900/60 p-0.5 rounded-lg border border-slate-800/80">
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
      </header>

      {/* 3. NỘI DUNG CHÍNH (MAIN CONTENT CARD) */}
      <main className="relative z-10 flex-1 max-w-4xl mx-auto px-6 flex flex-col justify-center items-center py-12">
        <div className="text-center space-y-4 max-w-2xl mb-10">
          <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full text-amber-400 text-xs font-bold uppercase tracking-wider animate-bounce">
            <Sparkles size={12} />
            {language === 'vi' ? 'Nền tảng thực tế ảo thế hệ mới' : 'Next-Gen VR Platform'}
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight font-sans">
            {language === 'vi' ? 'Khám Phá ' : 'Explore '}
            <span className="bg-gradient-to-r from-amber-400 via-rose-400 to-indigo-400 bg-clip-text text-transparent">
              {language === 'vi' ? 'Bảo Tàng Không Gian 3D' : '3D Space Museum'}
            </span>
          </h1>
          
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            {language === 'vi' 
              ? 'Tận hưởng chuyến tham quan trực quan sinh động, lắng nghe thuyết minh nghệ thuật tự động và trò chuyện đồng hành thời gian thực cùng bạn bè ngay trên trình duyệt web.'
              : 'Enjoy interactive spatial visiting, listen to audio guide, and walk together with other online visitors in real-time.'}
          </p>
        </div>

        {/* Khung nhập tên & chọn phòng */}
        <div className="w-full max-w-md bg-slate-950/40 backdrop-blur-xl border border-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 tracking-wider uppercase block">
              {language === 'vi' ? '1. Nhập biệt danh của bạn' : '1. Enter your nickname'}
            </label>
            <input 
              type="text"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              placeholder={language === 'vi' ? 'Ví dụ: Nghệ Sĩ Trẻ...' : 'E.g., John Doe...'}
              maxLength={20}
              className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors font-semibold"
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 tracking-wider uppercase block">
              {language === 'vi' ? '2. Chọn phòng trưng bày' : '2. Select exhibition gallery'}
            </label>

            {loading ? (
              <div className="flex justify-center py-6">
                <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : error ? (
              <div className="text-rose-400 text-xs text-center py-2 bg-rose-500/10 border border-rose-500/20 rounded-lg">
                {error}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {galleries.map((gallery) => (
                  <button
                    key={gallery.id}
                    onClick={() => handleEnterRoom(gallery)}
                    className="group flex items-center justify-between text-left bg-slate-900/40 hover:bg-slate-900 border border-slate-800/80 hover:border-amber-500/40 p-4 rounded-2xl transition-all cursor-pointer shadow-lg hover:shadow-amber-500/5"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-400 group-hover:text-amber-400 transition-colors">
                        {gallery.id === 'gallery-paintings' ? <ImageIcon size={20} /> : <Box size={20} />}
                      </div>
                      <div className="max-w-[200px] sm:max-w-[240px]">
                        <h3 className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">
                          {gallery.name}
                        </h3>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">
                          {gallery.description}
                        </p>
                      </div>
                    </div>
                    <div className="bg-slate-950 p-2 rounded-full border border-slate-800 text-slate-500 group-hover:text-amber-400 group-hover:border-amber-500/30 transition-all">
                      <ArrowRight size={14} />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {error && !loading && (
            <p className="text-xs text-rose-400 text-center font-semibold bg-rose-500/10 py-2 rounded-lg border border-rose-500/20 animate-shake">
              ⚠️ {error}
            </p>
          )}
        </div>
      </main>

      {/* 4. CHÂN TRANG (FOOTER) */}
      <footer className="relative z-10 w-full py-6 text-center text-[10px] text-slate-600 border-t border-slate-950">
        © 2026 Ortus Museum Virtual Platform. Built with Next.js, React Three Fiber and Socket.io.
      </footer>
      
    </div>
  );
}
