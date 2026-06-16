'use client';

import React, { useEffect, useState, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { useMuseum } from '@/context/MuseumContext';
import { Gallery, Exhibit } from '@/lib/db';
import GalleryCanvas from '@/components/3d/GalleryCanvas';
import ExhibitModal from '@/components/ui/ExhibitModal';
import { Compass, Users, MessageSquare, Send, Volume2, ArrowLeft, SendHorizontal, LayoutGrid } from 'lucide-react';

interface ChatMessage {
  userId: string;
  nickname: string;
  text: string;
  timestamp: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function GalleryPage({ params }: PageProps) {
  const router = useRouter();
  const { id: galleryId } = use(params);
  
  const { 
    nickname, 
    activeGallery, 
    setActiveGallery, 
    socket,
    otherUsers,
    language
  } = useMuseum();

  const [exhibits, setExhibits] = useState<Exhibit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Trạng thái Chatbox
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Điều hướng về sảnh nếu chưa đăng ký Nickname
  useEffect(() => {
    if (!nickname) {
      router.push('/');
    }
  }, [nickname, router]);

  // Load thông tin phòng trưng bày & hiện vật
  useEffect(() => {
    setLoading(true);
    
    // Fetch chi tiết Gallery trước
    fetch('/api/galleries')
      .then((res) => res.json())
      .then((galleries: Gallery[]) => {
        const current = galleries.find(g => g.id === galleryId);
        if (current) {
          setActiveGallery(current);
          
          // Sau đó fetch danh sách hiện vật
          return fetch(`/api/exhibits?galleryId=${galleryId}`);
        } else {
          throw new Error('Không tìm thấy phòng trưng bày');
        }
      })
      .then((res) => res.json())
      .then((exhibitsData: Exhibit[]) => {
        setExhibits(exhibitsData);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(language === 'vi' ? 'Không thể tải phòng triển lãm.' : 'Failed to load gallery.');
        setLoading(false);
      });
  }, [galleryId, setActiveGallery, language]);

  // Listen các sự kiện Chat từ Socket.io
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg: ChatMessage) => {
      setChatMessages((prev) => [...prev, msg]);
      // Tự động mở chatbox khi có tin nhắn mới nếu đang đóng
      if (!chatOpen) setChatOpen(true);
    };

    socket.on('receive-message', handleNewMessage);

    return () => {
      socket.off('receive-message', handleNewMessage);
    };
  }, [socket, chatOpen]);

  // Tự động cuộn xuống cuối chatbox
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  // Gửi tin nhắn chat
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !socket) return;

    const msgData = {
      text: chatInput.trim()
    };

    // Gửi lên Socket server
    socket.emit('send-message', msgData);
    
    // Tự thêm vào danh sách tin nhắn cục bộ của mình
    setChatMessages((prev) => [
      ...prev,
      {
        userId: 'me',
        nickname: nickname,
        text: chatInput.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    
    setChatInput('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07070a] flex flex-col justify-center items-center gap-4 text-slate-200">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold tracking-wider animate-pulse uppercase">
          {language === 'vi' ? 'Đang chuẩn bị không gian 3D...' : 'Preparing 3D Space...'}
        </p>
      </div>
    );
  }

  if (error || !activeGallery) {
    return (
      <div className="min-h-screen bg-[#07070a] flex flex-col justify-center items-center gap-4 text-slate-200 p-6 text-center">
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-6 rounded-2xl max-w-md shadow-2xl">
          <h2 className="text-lg font-bold mb-2">⚠️ Lỗi không gian</h2>
          <p className="text-sm text-slate-400 mb-4">{error || 'Không tìm thấy phòng trưng bày này.'}</p>
          <button 
            onClick={() => router.push('/')}
            className="bg-amber-500 text-slate-950 font-bold px-5 py-2 rounded-xl text-xs hover:scale-105 active:scale-95 transition-transform cursor-pointer"
          >
            Quay về sảnh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0a0a0d] flex flex-col">
      
      {/* 1. LỚP CANVAS 3D TRẢI RỘNG TOÀN DIỆN TÍCH (Z-INDEX: 0) */}
      <div className="absolute inset-0 z-0">
        <GalleryCanvas exhibits={exhibits} galleryId={activeGallery.id} />
      </div>

      {/* 2. THANH ĐIỀU KHIỂN TRÊN CÙNG (HEADER OVERLAY) */}
      <header className="absolute top-0 left-0 right-0 z-40 bg-gradient-to-b from-slate-950/80 to-transparent p-4 pointer-events-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between pointer-events-auto">
          {/* Nút quay lại */}
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 bg-slate-950/60 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white px-4 py-2.5 rounded-xl backdrop-blur-md transition-all cursor-pointer text-xs font-bold"
          >
            <ArrowLeft size={14} />
            {language === 'vi' ? 'Sảnh chính' : 'Lobby'}
          </button>

          {/* Tên phòng triển lãm */}
          <div className="hidden sm:flex items-center gap-2 bg-slate-950/40 border border-slate-900/50 py-1.5 px-4 rounded-full backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <h1 className="text-xs font-bold text-slate-200 tracking-wider uppercase">
              {activeGallery.name}
            </h1>
          </div>

          {/* Số lượng du khách trực tuyến */}
          <div className="flex items-center gap-3 bg-slate-950/60 border border-slate-800 py-2.5 px-4 rounded-xl backdrop-blur-md">
            <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-bold">
              <Users size={14} />
              <span>{otherUsers.length + 1} {language === 'vi' ? 'Online' : 'Users'}</span>
            </div>
            <div className="w-px h-3 bg-slate-800" />
            <span className="text-[11px] text-slate-300 font-bold max-w-[80px] sm:max-w-[120px] truncate">
              {nickname}
            </span>
          </div>
        </div>
      </header>

      {/* 3. CHATBOX THỜI GIAN THỰC (MULTIPLAYER CHAT - Z-INDEX: 50) */}
      <div className="absolute left-4 bottom-16 sm:bottom-20 z-40 flex flex-col pointer-events-auto max-w-[320px] sm:max-w-[350px]">
        {chatOpen ? (
          <div className="w-[300px] sm:w-[330px] h-[320px] bg-slate-950/80 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-200">
            {/* Header chatbox */}
            <div className="p-3 bg-slate-900/50 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5 uppercase tracking-wide">
                <MessageSquare size={14} className="text-cyan-400" />
                {language === 'vi' ? 'Trò chuyện phòng' : 'Gallery Chat'}
              </span>
              <button 
                onClick={() => setChatOpen(false)}
                className="text-[10px] text-slate-500 hover:text-slate-300 font-bold cursor-pointer"
              >
                [Ẩn]
              </button>
            </div>

            {/* Danh sách tin nhắn */}
            <div className="flex-1 p-3 overflow-y-auto space-y-2.5 custom-scrollbar text-xs">
              {chatMessages.length === 0 ? (
                <p className="text-slate-600 text-center py-8 italic">
                  {language === 'vi' ? 'Chưa có tin nhắn nào. Hãy gửi lời chào!' : 'No messages yet. Say hello!'}
                </p>
              ) : (
                chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex flex-col ${msg.userId === 'me' ? 'items-end' : 'items-start'}`}>
                    <span className="text-[9px] text-slate-500 font-semibold mb-0.5 px-0.5">
                      {msg.nickname} <span className="text-[8px] font-normal font-mono opacity-80">{msg.timestamp}</span>
                    </span>
                    <div className={`px-3 py-1.8 rounded-2xl max-w-[85%] leading-relaxed ${msg.userId === 'me' ? 'bg-cyan-500 text-slate-950 font-medium rounded-tr-none' : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input gửi tin */}
            <form onSubmit={handleSendChat} className="p-2 bg-slate-900/30 border-t border-slate-850 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={language === 'vi' ? 'Nhập tin nhắn...' : 'Type message...'}
                maxLength={80}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 placeholder-slate-650 focus:outline-none focus:border-cyan-500/50 text-xs"
              />
              <button
                type="submit"
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 p-2 rounded-xl transition-colors cursor-pointer"
              >
                <SendHorizontal size={14} />
              </button>
            </form>
          </div>
        ) : (
          <button
            onClick={() => setChatOpen(true)}
            className="flex items-center gap-2 bg-slate-950/80 hover:bg-slate-900 border border-slate-800 text-slate-200 hover:text-white px-4 py-3 rounded-2xl shadow-xl backdrop-blur-md transition-all cursor-pointer text-xs font-bold"
          >
            <MessageSquare size={16} className="text-cyan-400" />
            {language === 'vi' ? 'Trò chuyện' : 'Chat'}
            {chatMessages.length > 0 && (
              <span className="bg-cyan-500 text-slate-950 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center animate-pulse">
                {chatMessages.length}
              </span>
            )}
          </button>
        )}
      </div>

      {/* 4. MODAL THUYẾT MINH HIỆN VẬT (Z-INDEX: 50) */}
      <ExhibitModal />
    </div>
  );
}
