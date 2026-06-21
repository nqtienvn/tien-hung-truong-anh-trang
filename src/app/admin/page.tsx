'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { Exhibit, Gallery } from '@/lib/db';
import { Shield, Plus, Trash2, Sliders, ArrowLeft, Save, Edit3, Compass, Sparkles, DoorOpen, DoorClosed, Loader2, Zap, Power } from 'lucide-react';

// Cấu hình cửa phòng
const DOOR_CONFIGS = [
  { doorId: 'door-room1', targetRoom: 'gallery-paintings', label: 'Phòng 01: Khởi nguồn', color: 'amber' },
  { doorId: 'door-room2', targetRoom: 'gallery-sculptures', label: 'Phòng 02: Thị trường', color: 'cyan' },
  { doorId: 'door-room3', targetRoom: 'gallery-paintings', label: 'Phòng 03: Giới hạn', color: 'emerald' },
];

interface DoorState {
  isOpen: boolean;
  targetRoom: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [exhibits, setExhibits] = useState<Exhibit[]>([]);
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingExhibit, setEditingExhibit] = useState<Partial<Exhibit> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // ═══ Door Control State ═══
  const [adminSocket, setAdminSocket] = useState<Socket | null>(null);
  const [doorStates, setDoorStates] = useState<Record<string, DoorState>>({});
  const [doorLoading, setDoorLoading] = useState<string | null>(null);

  // ═══ Room Control State ═══
  const [roomStates, setRoomStates] = useState<Record<string, { isOpen: boolean }>>({
    'gallery-paintings': { isOpen: true },
    'gallery-sculptures': { isOpen: true }
  });
  const [roomLoading, setRoomLoading] = useState<string | null>(null);

  // Kết nối Socket.io cho admin
  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';
    const sock = io(socketUrl, {
      transports: ['websocket'],
      autoConnect: true,
    });

    sock.on('connect', () => {
      console.log('[ADMIN] Connected to WS:', sock.id);
      sock.emit('admin:get-door-status');
    });

    sock.on('door-states', (states: Record<string, DoorState>) => {
      const clean: Record<string, DoorState> = {};
      for (const [key, val] of Object.entries(states)) {
        clean[key] = { isOpen: (val as any).isOpen, targetRoom: (val as any).targetRoom };
      }
      setDoorStates(clean);
      setDoorLoading(null);
    });

    sock.on('room-states', (states: Record<string, { isOpen: boolean }>) => {
      setRoomStates(states);
      setRoomLoading(null);
    });

    sock.on('admin:error', (data: { message: string }) => {
      alert(data.message);
      setDoorLoading(null);
      setRoomLoading(null);
    });

    sock.on('door-opened', (data: { doorId: string; targetRoom: string }) => {
      setDoorStates(prev => ({
        ...prev,
        [data.doorId]: { isOpen: true, targetRoom: data.targetRoom },
      }));
      setDoorLoading(null);
    });

    sock.on('door-closed', (data: { doorId: string }) => {
      setDoorStates(prev => ({
        ...prev,
        [data.doorId]: { isOpen: false, targetRoom: '' },
      }));
      setDoorLoading(null);
    });

    setAdminSocket(sock);

    return () => {
      sock.disconnect();
    };
  }, []);

  const handleOpenDoor = (doorId: string, targetRoom: string) => {
    if (!adminSocket) return;

    // Ràng buộc kiểm tra trước khi mở cửa
    let canOpen = true;
    if (doorId === 'door-room1') {
      canOpen = roomStates['gallery-paintings']?.isOpen;
    } else if (doorId === 'door-room2') {
      canOpen = roomStates['gallery-paintings']?.isOpen && roomStates['gallery-sculptures']?.isOpen;
    } else if (doorId === 'door-room3') {
      canOpen = roomStates['gallery-sculptures']?.isOpen && roomStates['gallery-paintings']?.isOpen;
    }

    if (!canOpen) {
      alert('Không thể mở cửa khi các phòng liên quan chưa được bật!');
      return;
    }

    setDoorLoading(doorId);
    adminSocket.emit('admin:open-door', { doorId, targetRoom });
  };

  const handleCloseDoor = (doorId: string) => {
    if (!adminSocket) return;
    setDoorLoading(doorId);

    // Xác định phòng giữ lại để teleport người chơi khi đóng cửa phòng cũ
    let teleportTo = 'lobby';
    if (doorId === 'door-room2') {
      teleportTo = 'gallery-paintings';
    } else if (doorId === 'door-room3') {
      teleportTo = 'gallery-sculptures';
    }

    adminSocket.emit('admin:close-door', { doorId, teleportTo });
  };

  const handleToggleRoom = (roomId: string, currentOpen: boolean) => {
    if (!adminSocket) return;

    // Ràng buộc kiểm tra trước khi tắt phòng: Các cửa liên quan phải đóng
    if (currentOpen) {
      const relatedDoors = [];
      if (roomId === 'gallery-paintings') {
        relatedDoors.push('door-room1', 'door-room2', 'door-room3');
      } else if (roomId === 'gallery-sculptures') {
        relatedDoors.push('door-room2', 'door-room3');
      }

      const isAnyDoorOpen = relatedDoors.some(doorId => doorStates[doorId]?.isOpen);
      if (isAnyDoorOpen) {
        alert('Vui lòng đóng tất cả các cửa liên quan đến phòng này trước khi tắt!');
        return;
      }
    }

    setRoomLoading(roomId);
    adminSocket.emit('admin:toggle-room', { roomId, isOpen: !currentOpen });
  };

  useEffect(() => {
    // Tải toàn bộ galleries và exhibits
    Promise.all([
      fetch('/api/galleries').then(res => res.json()),
      fetch('/api/exhibits').then(res => res.json())
    ])
      .then(([galleriesData, exhibitsData]) => {
        setGalleries(galleriesData);
        setExhibits(exhibitsData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Lỗi tải dữ liệu admin:', err);
        setError('Không thể kết nối đến máy chủ.');
        setLoading(false);
      });
  }, []);

  const handleEdit = (exhibit: Exhibit) => {
    setEditingExhibit({ ...exhibit });
    setIsNew(false);
    setMessage('');
    setError('');
  };

  const handleAddNew = () => {
    setEditingExhibit({
      id: `exhibit-${Date.now()}`,
      gallery_id: galleries[0]?.id || '',
      title: { vi: '', en: '' },
      author: { vi: '', en: '' },
      description: { vi: '', en: '' },
      model_3d_url: '',
      thumbnail_url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80',
      coordinate_x: 0,
      coordinate_y: 2,
      coordinate_z: 0,
      rotation_x: 0,
      rotation_y: 0,
      rotation_z: 0,
      scale_x: 1,
      scale_y: 1,
      scale_z: 1
    });
    setIsNew(true);
    setMessage('');
    setError('');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa hiện vật này không?')) return;
    
    try {
      const res = await fetch(`/api/exhibits/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setExhibits(prev => prev.filter(e => e.id !== id));
        setMessage('Xóa hiện vật thành công!');
        if (editingExhibit?.id === id) setEditingExhibit(null);
      } else {
        setError('Xóa thất bại.');
      }
    } catch (err) {
      setError('Lỗi khi xóa hiện vật.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExhibit) return;

    // Validate dữ liệu
    if (
      !editingExhibit.id || 
      !editingExhibit.gallery_id || 
      !editingExhibit.title?.vi || 
      !editingExhibit.title?.en ||
      !editingExhibit.author?.vi ||
      !editingExhibit.author?.en
    ) {
      setError('Vui lòng nhập đầy đủ thông tin tiêu đề, tác giả bằng 2 ngôn ngữ.');
      return;
    }

    try {
      const res = await fetch('/api/exhibits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingExhibit)
      });

      if (res.ok) {
        const data = await res.json();
        if (isNew) {
          setExhibits(prev => [...prev, data.exhibit]);
          setMessage('Tạo hiện vật mới thành công!');
        } else {
          setExhibits(prev => prev.map(e => e.id === editingExhibit.id ? data.exhibit : e));
          setMessage('Cập nhật hiện vật thành công!');
        }
        setEditingExhibit(null);
      } else {
        const data = await res.json();
        setError(data.error || 'Lỗi khi lưu hiện vật.');
      }
    } catch (err) {
      setError('Lỗi kết nối máy chủ.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07070a] flex flex-col justify-center items-center gap-4 text-slate-200">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold tracking-wider uppercase">Đang tải CMS Quản trị...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07070a] text-slate-100 flex flex-col relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-amber-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-cyan-500/10 blur-[120px]" />
      </div>

      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 border-b border-slate-900 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push('/')}
            className="text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white px-3 py-2 rounded-xl border border-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft size={14} />
            Lobby
          </button>
          <div className="w-px h-4 bg-slate-800" />
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-amber-500" />
            <h1 className="font-sans font-bold tracking-wider text-base uppercase">CMS QUẢN TRỊ BẢO TÀNG</h1>
          </div>
        </div>

        <button
          onClick={handleAddNew}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer"
        >
          <Plus size={14} />
          Thêm Hiện Vật Mới
        </button>
      </header>

      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* ═══ PANEL ĐIỀU KHIỂN PHÒNG & CỬA (Real-time) ═══ */}
        <div className="bg-slate-950/40 border border-slate-900 rounded-2xl overflow-hidden shadow-xl grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-900">
          
          {/* CỘT TRÁI: QUẢN LÝ PHÒNG (Room Management) */}
          <div className="p-4 flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wide flex items-center gap-2">
                <Power size={14} />
                Quản Lý Phòng Triển Lãm (Bật/Tắt)
              </h3>
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${adminSocket?.connected ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/15 text-red-400 border border-red-500/20'}`}>
                {adminSocket?.connected ? '🟢 Trực tuyến' : '🔴 Ngoại tuyến'}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {[
                { id: 'gallery-paintings', name: 'Phòng 01: Khởi nguồn', desc: 'Trưng bày bộ sưu tập tranh hội họa 2D' },
                { id: 'gallery-sculptures', name: 'Phòng 02: Thị trường', desc: 'Trưng bày các mô hình tượng điêu khắc 3D' },
              ].map((room) => {
                const isRoomOpen = roomStates[room.id]?.isOpen ?? true;
                const isLoading = roomLoading === room.id;
                
                // Ràng buộc tắt phòng: Cửa liên quan phải đóng
                const relatedDoors = room.id === 'gallery-paintings' 
                  ? ['door-room1', 'door-room2', 'door-room3']
                  : ['door-room2', 'door-room3'];
                const hasOpenDoor = relatedDoors.some(doorId => doorStates[doorId]?.isOpen);

                return (
                  <div
                    key={room.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isRoomOpen
                        ? 'bg-cyan-500/5 border-cyan-500/20'
                        : 'bg-slate-900/10 border-slate-800/80 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h4 className="text-xs font-bold text-white flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${isRoomOpen ? 'bg-cyan-400 shadow-lg shadow-cyan-500/50' : 'bg-slate-600'}`} />
                          {room.name}
                        </h4>
                        <p className="text-[10px] text-slate-500 mt-1">{room.desc}</p>
                      </div>

                      <button
                        onClick={() => handleToggleRoom(room.id, isRoomOpen)}
                        disabled={isLoading || (isRoomOpen && hasOpenDoor)}
                        className={`px-4 py-2 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          isRoomOpen
                            ? 'bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/20 text-rose-400 disabled:opacity-50 disabled:cursor-not-allowed'
                            : 'bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-cyan-400'
                        }`}
                        title={isRoomOpen && hasOpenDoor ? 'Vui lòng đóng các cửa liên quan trước khi tắt phòng' : ''}
                      >
                        {isLoading ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <Power size={12} />
                        )}
                        {isRoomOpen ? 'Tắt phòng' : 'Bật phòng'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CỘT PHẢI: QUẢN LÝ CỬA (Door Management) */}
          <div className="p-4 flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wide flex items-center gap-2">
                <Zap size={14} />
                Điều Khiển Cửa Nối Phòng (Mở/Đóng)
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {DOOR_CONFIGS.map((config) => {
                const state = doorStates[config.doorId];
                const isOpen = state?.isOpen || false;
                const isLoading = doorLoading === config.doorId;

                // Ràng buộc mở cửa: các phòng liên quan phải bật
                let isPrereqMet = true;
                if (config.doorId === 'door-room1') {
                  isPrereqMet = roomStates['gallery-paintings']?.isOpen;
                } else if (config.doorId === 'door-room2') {
                  isPrereqMet = roomStates['gallery-paintings']?.isOpen && roomStates['gallery-sculptures']?.isOpen;
                } else if (config.doorId === 'door-room3') {
                  isPrereqMet = roomStates['gallery-sculptures']?.isOpen && roomStates['gallery-paintings']?.isOpen;
                }

                return (
                  <div
                    key={config.doorId}
                    className={`p-3 rounded-xl border transition-all ${
                      isOpen
                        ? 'bg-emerald-500/5 border-emerald-500/20'
                        : 'bg-slate-900/30 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        {isOpen ? (
                          <DoorOpen size={16} className="text-emerald-400" />
                        ) : (
                          <DoorClosed size={16} className="text-slate-500" />
                        )}
                        <div>
                          <h4 className="text-xs font-bold text-white">{config.label}</h4>
                          {!isPrereqMet && !isOpen && (
                            <p className="text-[9px] text-amber-500 font-semibold mt-0.5">
                              ⚠️ Yêu cầu các phòng liên quan phải bật
                            </p>
                          )}
                        </div>
                      </div>

                      {isOpen ? (
                        <button
                          onClick={() => handleCloseDoor(config.doorId)}
                          disabled={isLoading}
                          className="py-1.5 px-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 disabled:opacity-50"
                        >
                          {isLoading ? (
                            <Loader2 size={10} className="animate-spin" />
                          ) : (
                            <DoorClosed size={10} />
                          )}
                          Đóng cửa
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenDoor(config.doorId, config.targetRoom)}
                          disabled={isLoading || !isPrereqMet}
                          className={`py-1.5 px-3 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                            isPrereqMet
                              ? 'bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400'
                              : 'bg-slate-900 border-slate-850 text-slate-600 cursor-not-allowed'
                          }`}
                        >
                          {isLoading ? (
                            <Loader2 size={10} className="animate-spin" />
                          ) : (
                            <DoorOpen size={10} />
                          )}
                          Mở cửa
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* BẢNG DANH SÁCH HIỆN VẬT (2 CỘT RỘNG LÊN TOÀN MÀN HÌNH LỚN) */}
        <div className="lg:col-span-2 space-y-6">
          {message && (
            <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl text-xs font-semibold animate-pulse">
              🎉 {message}
            </div>
          )}
          {error && (
            <div className="bg-rose-500/15 border border-rose-500/30 text-rose-400 p-4 rounded-xl text-xs font-semibold">
              ⚠️ {error}
            </div>
          )}

          {galleries.map((gallery) => {
            const galleryExhibits = exhibits.filter(e => e.gallery_id === gallery.id);
            return (
              <div key={gallery.id} className="bg-slate-950/40 border border-slate-900 rounded-2xl overflow-hidden shadow-xl">
                <div className="p-4 bg-slate-900/40 border-b border-slate-900 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wide flex items-center gap-2">
                    <Compass size={14} />
                    {gallery.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => router.push(`/admin/map-builder?galleryId=${gallery.id}`)}
                      className="py-1 px-3 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-cyan-400 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <Sliders size={10} />
                      Thiết kế Bản đồ 3D
                    </button>
                    <span className="text-[10px] bg-slate-850 px-2 py-0.5 rounded text-slate-400 font-bold">
                      {galleryExhibits.length} hiện vật
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-slate-900/60">
                  {galleryExhibits.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-xs italic">
                      Chưa có hiện vật nào trong phòng này.
                    </div>
                  ) : (
                    galleryExhibits.map((exhibit) => (
                      <div key={exhibit.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-900/20 transition-colors">
                        <div className="flex items-center gap-3">
                          <img 
                            src={exhibit.thumbnail_url} 
                            alt={exhibit.title.vi} 
                            className="w-12 h-12 object-cover rounded-lg border border-slate-800"
                          />
                          <div className="max-w-[200px] sm:max-w-[320px]">
                            <h4 className="text-xs font-bold text-white truncate">{exhibit.title.vi}</h4>
                            <p className="text-[10px] text-slate-500 truncate mt-0.5">{exhibit.author.vi}</p>
                            <span className="text-[8px] bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded border border-slate-800 mt-1 inline-block font-mono">
                              ID: {exhibit.id}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => router.push(`/admin/builder?exhibitId=${exhibit.id}`)}
                            className="p-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 rounded-lg border border-indigo-550/20 transition-all flex items-center gap-1 text-[10px] font-bold cursor-pointer"
                            title="Chỉnh sửa tọa độ 3D"
                          >
                            <Sliders size={12} />
                            Định vị 3D
                          </button>
                          
                          <button
                            onClick={() => handleEdit(exhibit)}
                            className="p-2 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white rounded-lg border border-slate-800 transition-colors cursor-pointer"
                            title="Sửa chi tiết"
                          >
                            <Edit3 size={12} />
                          </button>

                          <button
                            onClick={() => handleDelete(exhibit.id)}
                            className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 rounded-lg border border-rose-550/20 transition-colors cursor-pointer"
                            title="Xóa hiện vật"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* CỘT PHẢI: FORM THÊM / CHỈNH SỬA CHI TIẾT (1 CỘT) */}
        <div className="lg:col-span-1">
          {editingExhibit ? (
            <form onSubmit={handleSave} className="bg-slate-950/40 border border-slate-900 rounded-2xl p-6 space-y-4 shadow-xl sticky top-8">
              <div className="flex items-center justify-between pb-2 border-b border-slate-900">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5 uppercase">
                  <Sparkles size={14} className="text-amber-500" />
                  {isNew ? 'Thêm Hiện Vật' : 'Sửa Hiện Vật'}
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingExhibit(null)}
                  className="text-[10px] text-slate-500 hover:text-slate-300 font-bold"
                >
                  Đóng
                </button>
              </div>

              {/* ID */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mã hiện vật (ID)</label>
                <input
                  type="text"
                  value={editingExhibit.id}
                  onChange={(e) => setEditingExhibit(prev => prev ? { ...prev, id: e.target.value } : null)}
                  disabled={!isNew}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 disabled:opacity-50"
                />
              </div>

              {/* Gallery ID */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Chọn phòng trưng bày</label>
                <select
                  value={editingExhibit.gallery_id}
                  onChange={(e) => setEditingExhibit(prev => prev ? { ...prev, gallery_id: e.target.value } : null)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  {galleries.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>

              {/* Tiêu đề VI & EN */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tên tác phẩm (VI)</label>
                  <input
                    type="text"
                    value={editingExhibit.title?.vi || ''}
                    onChange={(e) => setEditingExhibit(prev => prev ? {
                      ...prev,
                      title: { vi: e.target.value, en: prev.title?.en || '' }
                    } : null)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tên tác phẩm (EN)</label>
                  <input
                    type="text"
                    value={editingExhibit.title?.en || ''}
                    onChange={(e) => setEditingExhibit(prev => prev ? {
                      ...prev,
                      title: { vi: prev.title?.vi || '', en: e.target.value }
                    } : null)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Tác giả VI & EN */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tác giả (VI)</label>
                  <input
                    type="text"
                    value={editingExhibit.author?.vi || ''}
                    onChange={(e) => setEditingExhibit(prev => prev ? {
                      ...prev,
                      author: { vi: e.target.value, en: prev.author?.en || '' }
                    } : null)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tác giả (EN)</label>
                  <input
                    type="text"
                    value={editingExhibit.author?.en || ''}
                    onChange={(e) => setEditingExhibit(prev => prev ? {
                      ...prev,
                      author: { vi: prev.author?.vi || '', en: e.target.value }
                    } : null)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Ảnh Thumbnail */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Đường dẫn ảnh preview</label>
                <input
                  type="text"
                  value={editingExhibit.thumbnail_url || ''}
                  onChange={(e) => setEditingExhibit(prev => prev ? { ...prev, thumbnail_url: e.target.value } : null)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                />
              </div>

              {/* Loại / Link 3D */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mã 3D (Bỏ trống nếu là tranh 2D)</label>
                <select
                  value={editingExhibit.model_3d_url || ''}
                  onChange={(e) => setEditingExhibit(prev => prev ? { ...prev, model_3d_url: e.target.value } : null)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="">Tranh vẽ 2D (Không có mô hình 3D)</option>
                  <option value="procedural-torusknot">Tượng: Vòng Xoắn Hoàng Kim</option>
                  <option value="procedural-octahedron">Tượng: Tinh Thể Đa Diện</option>
                  <option value="procedural-helix">Tượng: Mầm Sống Sinh Học</option>
                </select>
              </div>

              {/* Thuyết minh VI */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nội dung thuyết minh (VI)</label>
                <textarea
                  value={editingExhibit.description?.vi || ''}
                  onChange={(e) => setEditingExhibit(prev => prev ? {
                    ...prev,
                    description: { vi: e.target.value, en: prev.description?.en || '' }
                  } : null)}
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Thuyết minh EN */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nội dung thuyết minh (EN)</label>
                <textarea
                  value={editingExhibit.description?.en || ''}
                  onChange={(e) => setEditingExhibit(prev => prev ? {
                    ...prev,
                    description: { vi: prev.description?.vi || '', en: e.target.value }
                  } : null)}
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Save size={14} />
                Lưu Dữ Liệu
              </button>
            </form>
          ) : (
            <div className="bg-slate-950/20 border border-slate-900/50 border-dashed rounded-2xl p-8 text-center text-slate-500 text-xs italic sticky top-8">
              Chọn nút sửa [✏️] hoặc thêm mới để bắt đầu nhập dữ liệu hiện vật.
            </div>
          )}
        </div>

        </div>
      </main>
    </div>
  );
}
