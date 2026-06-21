'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Gallery, Exhibit } from '@/lib/db';

export interface GraphicsSettings {
  preset: 'low' | 'medium';
  shadows: boolean;
  animations: boolean;
  maxAvatars: number;
}

export interface MultiplayerUser {
  id: string;
  nickname: string;
  x: number;
  y: number;
  z: number;
  yaw: number;
  galleryId: string;
}

// Vị trí spawn của các phòng trưng bày
const SPAWN_POINTS: Record<string, { x: number; y: number; z: number }> = {
  'lobby': { x: 0, y: 0, z: -5.0 },
  'gallery-paintings': { x: 0, y: 3.0, z: 10.0 },
  'gallery-sculptures': { x: 0, y: 3.0, z: 60.0 },
};

// ═══════════════════════════════════════════════════════════════════════════
// TRẠNG THÁI CỬA (Door State)
// ═══════════════════════════════════════════════════════════════════════════
export interface DoorState {
  isOpen: boolean;
  targetRoom: string;
}

export interface RoomState {
  isOpen: boolean;
}

// Thông tin phòng đang được tải động
export interface LoadedRoom {
  galleryId: string;
  exhibits: Exhibit[];
  gallery: Gallery | null;
}

interface MuseumContextType {
  language: 'vi' | 'en';
  setLanguage: (lang: 'vi' | 'en') => void;
  nickname: string;
  setNickname: (name: string) => void;
  selectedExhibit: Exhibit | null;
  setSelectedExhibit: (exhibit: Exhibit | null) => void;
  activeGallery: Gallery | null;
  setActiveGallery: (gallery: Gallery | null) => void;
  audioPlaying: boolean;
  setAudioPlaying: (playing: boolean) => void;
  otherUsers: MultiplayerUser[];
  otherUsersPositions: React.MutableRefObject<Record<string, MultiplayerUser>>;
  socket: Socket | null;
  localUserPos: [number, number, number];
  setLocalUserPos: (pos: [number, number, number]) => void;
  localUserYaw: number;
  setLocalUserYaw: (yaw: number) => void;
  inQueue: boolean;
  setInQueue: (inQueue: boolean) => void;
  queuePosition: number;
  setQueuePosition: (pos: number) => void;
  isAdmitted: boolean;
  setIsAdmitted: (admitted: boolean) => void;
  settings: GraphicsSettings;
  updateSettings: (newSettings: Partial<GraphicsSettings>) => void;
  updatePreset: (preset: GraphicsSettings['preset']) => void;

  // ═══ Door & Room State ═══
  doorStates: Record<string, DoorState>;
  roomStates: Record<string, RoomState>;
  loadedRooms: LoadedRoom[];
  currentRoom: string; // 'lobby' hoặc gallery ID
  setCurrentRoom: (room: string) => void;
  doorClosingAlert: { doorId: string; teleportTo: string; countdownMs: number } | null;
  teleportTarget: { x: number; y: number; z: number } | null;
  clearTeleport: () => void;
}

const MuseumContext = createContext<MuseumContextType | undefined>(undefined);

export const MuseumProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<'vi' | 'en'>('vi');
  const [nickname, setNickname] = useState<string>('');
  const [selectedExhibit, setSelectedExhibit] = useState<Exhibit | null>(null);
  const [activeGallery, setActiveGallery] = useState<Gallery | null>(null);
  const [audioPlaying, setAudioPlaying] = useState<boolean>(false);
  const [otherUsers, setOtherUsers] = useState<MultiplayerUser[]>([]);
  const otherUsersPositions = React.useRef<Record<string, MultiplayerUser>>({});
  const [socket, setSocket] = useState<Socket | null>(null);
  const [localUserPos, setLocalUserPos] = useState<[number, number, number]>([0, 1.7, 5]);
  const [localUserYaw, setLocalUserYaw] = useState<number>(0);

  const [inQueue, setInQueue] = useState<boolean>(false);
  const [queuePosition, setQueuePosition] = useState<number>(0);
  const [isAdmitted, setIsAdmitted] = useState<boolean>(false);

  // ═══ Door & Room State ═══
  const [doorStates, setDoorStates] = useState<Record<string, DoorState>>({});
  const [roomStates, setRoomStates] = useState<Record<string, RoomState>>({
    'gallery-paintings': { isOpen: true },
    'gallery-sculptures': { isOpen: true }
  });
  const [loadedRooms, setLoadedRooms] = useState<LoadedRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState<string>('lobby');
  const [doorClosingAlert, setDoorClosingAlert] = useState<{ doorId: string; teleportTo: string; countdownMs: number } | null>(null);
  const [teleportTarget, setTeleportTarget] = useState<{ x: number; y: number; z: number } | null>(null);

  const clearTeleport = useCallback(() => setTeleportTarget(null), []);

  const [settings, setSettings] = useState<GraphicsSettings>({
    preset: 'medium',
    shadows: false,
    animations: true,
    maxAvatars: 99,
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('museum_graphics_settings');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Luôn tắt shadows bất kể giá trị lưu trữ
          parsed.shadows = false;
          setSettings(parsed);
        } catch (e) {
          console.error('Lỗi phân tích settings từ localStorage:', e);
        }
      }
    }
  }, []);

  const getPresetSettings = (preset: GraphicsSettings['preset']) => {
    switch (preset) {
      case 'low':
        return { shadows: false, animations: false, maxAvatars: 10 };
      case 'medium':
      default:
        return { shadows: false, animations: true, maxAvatars: 99 };
    }
  };

  const updatePreset = (preset: GraphicsSettings['preset']) => {
    setSettings(() => {
      const presetSettings = getPresetSettings(preset);
      const updated = {
        preset,
        ...presetSettings
      };
      localStorage.setItem('museum_graphics_settings', JSON.stringify(updated));
      return updated;
    });
  };

  const updateSettings = (newSettings: Partial<GraphicsSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('museum_graphics_settings', JSON.stringify(updated));
      return updated;
    });
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // TẢI PHÒNG ĐỘNG KHI CỬA MỞ (Dynamic Room Loading)
  // ═══════════════════════════════════════════════════════════════════════════
  const loadRoom = useCallback(async (galleryId: string) => {
    try {
      const [galleriesRes, exhibitsRes] = await Promise.all([
        fetch('/api/galleries'),
        fetch(`/api/exhibits?galleryId=${galleryId}`),
      ]);

      const galleries: Gallery[] = await galleriesRes.json();
      const exhibits: Exhibit[] = await exhibitsRes.json();
      const gallery = galleries.find(g => g.id === galleryId) || null;

      setLoadedRooms(prev => {
        // Kiểm tra nếu phòng đã được tải rồi thì bỏ qua
        if (prev.some(r => r.galleryId === galleryId)) return prev;
        console.log(`[ROOM-LOADED] Phòng "${galleryId}" đã được tải thành công (${exhibits.length} hiện vật).`);
        return [...prev, { galleryId, exhibits, gallery }];
      });
    } catch (err) {
      console.error(`[ROOM-LOAD-ERROR] Lỗi tải phòng "${galleryId}":`, err);
    }
  }, []);

  const unloadRoom = useCallback((galleryId: string) => {
    setLoadedRooms(prev => prev.filter(r => r.galleryId !== galleryId));
    console.log(`[ROOM-UNLOADED] Phòng "${galleryId}" đã được dỡ bỏ.`);
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // SOCKET.IO — KẾT NỐI & LẮNG NGHE SỰ KIỆN
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    // Kết nối socket ngay khi provider mount (cho cả lobby và gallery)
    const socketUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';
    const newSocket = io(socketUrl, {
      transports: ['websocket'],
      autoConnect: true,
    });

    newSocket.on('connect', () => {
      console.log('Đã kết nối Socket.io server:', newSocket.id);
    });

    // ── Door Events ──
    newSocket.on('door-states', (states: Record<string, DoorState>) => {
      // Loại bỏ closingTimer từ server (không serialize được)
      const cleanStates: Record<string, DoorState> = {};
      for (const [key, val] of Object.entries(states)) {
        cleanStates[key] = {
          isOpen: (val as any).isOpen,
          targetRoom: (val as any).targetRoom,
        };
      }
      setDoorStates(cleanStates);
    });

    newSocket.on('door-opened', (data: { doorId: string; targetRoom: string }) => {
      setDoorStates(prev => ({
        ...prev,
        [data.doorId]: { isOpen: true, targetRoom: data.targetRoom },
      }));
    });

    newSocket.on('door-closing', (data: { doorId: string; teleportTo: string; countdownMs: number }) => {
      setDoorClosingAlert(data);
      // Tự động clear alert sau countdown
      setTimeout(() => setDoorClosingAlert(null), data.countdownMs + 500);
    });

    newSocket.on('door-closed', (data: { doorId: string; teleportTo: string }) => {
      setDoorStates(prev => ({
        ...prev,
        [data.doorId]: { isOpen: false, targetRoom: '' },
      }));
      setDoorClosingAlert(null);

      // CHỈ teleport nếu người chơi đang ở phòng bị ảnh hưởng bởi cánh cửa đóng đó
      setCurrentRoom((prevRoom) => {
        let shouldTeleport = false;
        if (data.doorId === 'door-room1') {
          shouldTeleport = prevRoom === 'gallery-paintings' || prevRoom === 'gallery-sculptures';
        } else if (data.doorId === 'door-room2') {
          shouldTeleport = prevRoom === 'gallery-sculptures';
        }

        if (shouldTeleport) {
          const target = data.teleportTo || 'lobby';
          const spawn = SPAWN_POINTS[target] || SPAWN_POINTS['lobby'];
          setTeleportTarget(spawn);
          console.log(`[TELEPORT] Cửa "${data.doorId}" đóng. Di chuyển người chơi về phòng "${target}" tại tọa độ Z = ${spawn.z}`);
          return target;
        }
        return prevRoom;
      });
    });

    // ── Room Events ──
    newSocket.on('room-states', (states: Record<string, RoomState>) => {
      setRoomStates(states);
    });

    newSocket.on('room-closed', (data: { roomId: string; teleportTo: string }) => {
      setCurrentRoom((prevRoom) => {
        if (prevRoom === data.roomId) {
          const target = data.teleportTo || 'lobby';
          const spawn = SPAWN_POINTS[target] || SPAWN_POINTS['lobby'];
          setTeleportTarget(spawn);
          console.log(`[TELEPORT] Phòng "${data.roomId}" bị tắt. Di chuyển người chơi về phòng "${target}" tại tọa độ Z = ${spawn.z}`);
          return target;
        }
        return prevRoom;
      });
    });

    // ── Multiplayer Events ──
    newSocket.on('join-success', () => {
      setInQueue(false);
      setQueuePosition(0);
      setIsAdmitted(true);
    });

    newSocket.on('queue-status', (data: { inQueue: boolean; position: number }) => {
      setInQueue(data.inQueue);
      setQueuePosition(data.position);
      setIsAdmitted(false);
    });

    newSocket.on('admitted', () => {
      setInQueue(false);
      setQueuePosition(0);
      setIsAdmitted(true);
    });

    newSocket.on('users-list', (users: MultiplayerUser[]) => {
      const filtered = users.filter(u => u.id !== newSocket.id);
      setOtherUsers(filtered);
      otherUsersPositions.current = {};
      filtered.forEach(u => {
        otherUsersPositions.current[u.id] = u;
      });
    });

    newSocket.on('user-joined', (user: MultiplayerUser) => {
      setOtherUsers(prev => {
        if (prev.some(u => u.id === user.id)) return prev;
        return [...prev, user];
      });
      otherUsersPositions.current[user.id] = user;
    });

    newSocket.on('user-moved', (user: MultiplayerUser) => {
      otherUsersPositions.current[user.id] = user;
    });

    newSocket.on('user-left', (userId: string) => {
      setOtherUsers(prev => prev.filter(u => u.id !== userId));
      delete otherUsersPositions.current[userId];
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      setInQueue(false);
      setQueuePosition(0);
      setIsAdmitted(false);
      otherUsersPositions.current = {};
    };
  }, []);

  // Join room khi có nickname + activeGallery
  useEffect(() => {
    if (!socket || !socket.connected) return;
    if (!nickname || !activeGallery) return;

    socket.emit('join-room', {
      nickname,
      galleryId: activeGallery.id,
      x: localUserPos[0],
      y: 0,
      z: localUserPos[2],
      yaw: localUserYaw,
    });
  }, [socket, nickname, activeGallery]);

  // Pre-load all rooms ngầm lúc rảnh rỗi nếu cấu hình không phải 'low' và phòng đó đang bật
  useEffect(() => {
    if (settings.preset === 'low') return;

    const idleCallback = typeof window !== 'undefined' 
      ? (window.requestIdleCallback || ((cb: any) => setTimeout(cb, 2000))) 
      : null;
    
    if (!idleCallback) return;

    const idleId = idleCallback(() => {
      if (roomStates['gallery-paintings']?.isOpen) loadRoom('gallery-paintings');
      if (roomStates['gallery-sculptures']?.isOpen) loadRoom('gallery-sculptures');
      console.log('[PRELOAD] [MEDIUM-PRESET] Tải trước ngầm các phòng triển lãm đang bật.');
    }, { timeout: 5000 });

    const cancelCallback = typeof window !== 'undefined'
      ? (window.cancelIdleCallback || ((id: any) => clearTimeout(id)))
      : null;

    return () => {
      if (cancelCallback && idleId) {
        cancelCallback(idleId);
      }
    };
  }, [settings.preset, roomStates, loadRoom]);

  // Nếu chuyển đổi cấu hình sang 'low', dỡ bỏ ngay những phòng đang tắt hoặc đóng để giải phóng bộ nhớ GPU
  useEffect(() => {
    if (settings.preset === 'low') {
      const allOpenTargets = Object.values(doorStates)
        .filter(s => s.isOpen)
        .map(s => s.targetRoom);

      setLoadedRooms(prev => {
        const filtered = prev.filter(room => roomStates[room.galleryId]?.isOpen && allOpenTargets.includes(room.galleryId));
        if (filtered.length !== prev.length) {
          console.log('[ROOM-UNLOADED] [PRESET-SWITCH] Đã dỡ các phòng đóng/tắt để tiết kiệm tài nguyên ở Preset Thấp.');
        }
        return filtered;
      });
    }
  }, [settings.preset, doorStates, roomStates]);

  // ═══════════════════════════════════════════════════════════════════════════
  // TỰ ĐỘNG TẢI/DỠ PHÒNG KHI PHÒNG BẬT/TẮT VÀ CỬA MỞ/ĐÓNG
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    // 1. Tải phòng động theo trạng thái Bật/Tắt của phòng
    for (const [galleryId, rState] of Object.entries(roomStates)) {
      if (rState.isOpen) {
        // Tải phòng khi bật
        const isDoorOpenOrPreloaded = settings.preset !== 'low' || Object.values(doorStates).some(
          d => d.targetRoom === galleryId && d.isOpen
        );
        if (isDoorOpenOrPreloaded) {
          loadRoom(galleryId);
        }
      } else {
        // Dỡ phòng khi tắt ngay lập tức
        unloadRoom(galleryId);
      }
    }

    // 2. Tải/Dỡ phòng khi cửa mở/đóng đối với preset 'low'
    for (const [doorId, dState] of Object.entries(doorStates)) {
      if (dState.isOpen && dState.targetRoom) {
        if (roomStates[dState.targetRoom]?.isOpen) {
          loadRoom(dState.targetRoom);
        }
      }

      if (!dState.isOpen && dState.targetRoom === '' && settings.preset === 'low') {
        const allOpenTargets = Object.values(doorStates)
          .filter(s => s.isOpen)
          .map(s => s.targetRoom);

        setLoadedRooms(prev => prev.filter(room => {
          if (!roomStates[room.galleryId]?.isOpen || !allOpenTargets.includes(room.galleryId)) {
            console.log(`[ROOM-UNLOADED] [LOW-PRESET] Phòng "${room.galleryId}" đã được dỡ bỏ khi đóng cửa.`);
            return false;
          }
          return true;
        }));
      }
    }
  }, [doorStates, roomStates, loadRoom, unloadRoom, settings.preset]);

  return (
    <MuseumContext.Provider
      value={{
        language,
        setLanguage,
        nickname,
        setNickname,
        selectedExhibit,
        setSelectedExhibit,
        activeGallery,
        setActiveGallery,
        audioPlaying,
        setAudioPlaying,
        localUserPos,
        setLocalUserPos,
        localUserYaw,
        setLocalUserYaw,
        socket,
        otherUsers,
        otherUsersPositions,
        inQueue,
        setInQueue,
        queuePosition,
        setQueuePosition,
        isAdmitted,
        setIsAdmitted,
        settings,
        updateSettings,
        updatePreset,

        // Door & Room
        doorStates,
        roomStates,
        loadedRooms,
        currentRoom,
        setCurrentRoom,
        doorClosingAlert,
        teleportTarget,
        clearTeleport,
      }}
    >
      {children}
    </MuseumContext.Provider>
  );
};

export const useMuseum = () => {
  const context = useContext(MuseumContext);
  if (!context) {
    throw new Error('useMuseum phải được sử dụng trong MuseumProvider');
  }
  return context;
};
