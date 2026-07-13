'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { io, Socket } from 'socket.io-client';
import { Gallery, Exhibit } from '@/lib/db';

export interface GraphicsSettings {
  preset: 'ultra-low' | 'low' | 'medium';
  shadows: boolean;
  animations: boolean;
  maxAvatars: number;
  reducedLights: boolean;
}

export interface MultiplayerUser {
  id: string;
  nickname: string;
  x: number;
  y: number;
  z: number;
  yaw: number;
  galleryId: string;
  status?: string;
  score?: number;
  timeSpent?: number;
}

// Vị trí spawn của các phòng trưng bày
const SPAWN_POINTS: Record<string, { x: number; y: number; z: number }> = {
  'lobby': { x: 0, y: 0, z: -5.0 },
  'gallery-subsidy': { x: 0, y: 3.0, z: 10.0 },
  'gallery-paintings': { x: 0, y: 3.0, z: 56.0 },
  'gallery-ceramics': { x: 0, y: 3.0, z: 102.0 },
  'gallery-market-economy': { x: 0, y: 3.0, z: 133.0 },
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

export interface RoomClosingAlert {
  roomId: string;
  teleportTo: string;
  countdownMs: number;
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
  exhibitModalMode: 'game' | 'info';
  setExhibitModalMode: (mode: 'game' | 'info') => void;
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
  roomClosingAlert: RoomClosingAlert | null;
  teleportTarget: { x: number; y: number; z: number } | null;
  clearTeleport: () => void;
  miniGameOpen: boolean;
  setMiniGameOpen: (open: boolean) => void;
  leaderboard: Array<{ nickname: string; score: number; time: string }>;
  hasPlayed: boolean;
  setHasPlayed: (played: boolean) => void;
  gameState: 'idle' | 'playing' | 'won' | 'lost';
  orderedEvents: GameEvent[];
  score: number;
  timeLeft: number;
  lastCheckResults: boolean[] | null;
  initializeGame: () => void;
  swapEvents: (idx1: number, idx2: number) => void;
  checkOrder: () => void;

  // --- Gameplay ---
  cluesCollected: string[];
  roomOneCompleted: boolean;
  addClue: (clueId: string) => void;
  setRoomOneCompleted: (completed: boolean) => void;
  resetRoomOne: () => void;

  sittingPosition: { x: number; y: number; z: number; rotationY?: number } | null;
  setSittingPosition: (pos: { x: number; y: number; z: number; rotationY?: number } | null) => void;
  sittingPrompt: 'sit' | 'stand' | null;
  setSittingPrompt: (prompt: 'sit' | 'stand' | null) => void;
}

export interface GameEvent {
  id: string;
  year: string;
  sortOrder: number;
  titleVi: string;
  titleEn: string;
  iconId: number;
  color: string;
}

const MuseumContext = createContext<MuseumContextType | undefined>(undefined);

export const MuseumProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<'vi' | 'en'>('vi');
  const [nickname, setNickname] = useState<string>('');
  const [selectedExhibit, setSelectedExhibit] = useState<Exhibit | null>(null);
  const [exhibitModalMode, setExhibitModalMode] = useState<'game' | 'info'>('game');
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
    'gallery-subsidy': { isOpen: true },
    'gallery-paintings': { isOpen: true },
    'gallery-sculptures': { isOpen: true },
    'gallery-ceramics': { isOpen: true },
    'gallery-market-economy': { isOpen: true }
  });
  const [loadedRooms, setLoadedRooms] = useState<LoadedRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState<string>('lobby');
  const [doorClosingAlert, setDoorClosingAlert] = useState<{ doorId: string; teleportTo: string; countdownMs: number } | null>(null);
  const [roomClosingAlert, setRoomClosingAlert] = useState<RoomClosingAlert | null>(null);
  const [teleportTarget, setTeleportTarget] = useState<{ x: number; y: number; z: number } | null>(null);
  const [miniGameOpen, setMiniGameOpen] = useState<boolean>(false);
  const [leaderboard, setLeaderboard] = useState<Array<{ nickname: string; score: number; time: string }>>([]);
  const [hasPlayed, setHasPlayedState] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const played = localStorage.getItem('museum_has_played_game');
      if (played === 'true') {
        setHasPlayedState(true);
      }
    }
  }, []);

  const setHasPlayed = useCallback((val: boolean) => {
    setHasPlayedState(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem('museum_has_played_game', val ? 'true' : 'false');
    }
  }, []);

  // --- Gameplay States ---
  const [cluesCollected, setCluesCollected] = useState<string[]>([]);
  const [roomOneCompleted, setRoomOneCompleted] = useState<boolean>(false);
  const [sittingPosition, setSittingPosition] = useState<{ x: number; y: number; z: number; rotationY?: number } | null>(null);
  const [sittingPrompt, setSittingPrompt] = useState<'sit' | 'stand' | null>(null);

  // Sync gameplay progress theo từng người chơi (nickname)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!nickname) {
      setCluesCollected([]);
      setRoomOneCompleted(false);
      return;
    }

    const progressKey = `roomOneProgress:${nickname.trim().toLowerCase()}`;
    const savedProgress = localStorage.getItem(progressKey);

    if (!savedProgress) {
      setCluesCollected([]);
      setRoomOneCompleted(false);
      return;
    }

    try {
      const parsed = JSON.parse(savedProgress) as {
        cluesCollected?: string[];
        roomOneCompleted?: boolean;
      };
      setCluesCollected(Array.isArray(parsed.cluesCollected) ? parsed.cluesCollected : []);
      setRoomOneCompleted(Boolean(parsed.roomOneCompleted));
    } catch (e) {
      console.error('Lỗi phân tích tiến trình Sổ điều tra:', e);
      setCluesCollected([]);
      setRoomOneCompleted(false);
    }
  }, [nickname]);

  const addClue = useCallback((clueId: string) => {
    setCluesCollected((prev) => {
      if (prev.includes(clueId)) return prev;
      const updated = [...prev, clueId];
      if (typeof window !== 'undefined' && nickname) {
        const progressKey = `roomOneProgress:${nickname.trim().toLowerCase()}`;
        localStorage.setItem(progressKey, JSON.stringify({
          cluesCollected: updated,
          roomOneCompleted,
        }));
      }
      return updated;
    });
  }, [nickname, roomOneCompleted]);

  const handleSetRoomOneCompleted = useCallback((completed: boolean) => {
    setRoomOneCompleted(completed);
    if (typeof window !== 'undefined' && nickname) {
      const progressKey = `roomOneProgress:${nickname.trim().toLowerCase()}`;
      localStorage.setItem(progressKey, JSON.stringify({
        cluesCollected,
        roomOneCompleted: completed,
      }));
    }
  }, [cluesCollected, nickname]);

  const resetRoomOne = useCallback(() => {
    setCluesCollected([]);
    setRoomOneCompleted(false);
    if (typeof window !== 'undefined') {
      if (nickname) {
        localStorage.removeItem(`roomOneProgress:${nickname.trim().toLowerCase()}`);
      }
      // Dọn key cũ để tránh người chơi mới bị kế thừa tiến trình global.
      localStorage.removeItem('cluesCollected');
      localStorage.removeItem('roomOneCompleted');
    }
  }, [nickname]);

  const clearTeleport = useCallback(() => setTeleportTarget(null), []);

  // --- Game State ---
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'won' | 'lost'>('idle');
  const [orderedEvents, setOrderedEvents] = useState<GameEvent[]>([]);
  const [score, setScore] = useState(1000);
  const [timeLeft, setTimeLeft] = useState(60);
  const [lastCheckResults, setLastCheckResults] = useState<boolean[] | null>(null);

  const HISTORY_EVENTS = useMemo(() => [
    { id: 'vn-left-1', year: '1986', sortOrder: 0, titleVi: 'Đại hội VI - Đổi mới', titleEn: '6th Party Congress - Doi Moi', iconId: 1, color: '#fbbf24' },
    { id: 'vn-left-2', year: '1988', sortOrder: 1, titleVi: 'Khoán 10', titleEn: 'Resolution 10 (Khoan 10)', iconId: 2, color: '#ec4899' },
    { id: 'vn-left-3', year: '1989', sortOrder: 2, titleVi: 'Việt Nam rút quân khỏi Campuchia', titleEn: 'Withdrawal from Cambodia', iconId: 4, color: '#3b82f6' },
    { id: 'vn-right-1', year: '1989', sortOrder: 3, titleVi: 'Việt Nam trở thành nước xuất khẩu gạo', titleEn: 'VN becomes a major rice exporter', iconId: 3, color: '#10b981' },
    { id: 'vn-back-left', year: '1991', sortOrder: 4, titleVi: 'Liên Xô tan rã', titleEn: 'Soviet Union dissolution', iconId: 5, color: '#a855f7' },
    { id: 'vn-right-2', year: '03/02/1994', sortOrder: 5, titleVi: 'Hoa Kỳ bãi bỏ cấm vận', titleEn: 'US lifts trade embargo', iconId: 6, color: '#06b6d4' },
    { id: 'vn-right-3', year: '11/07/1995', sortOrder: 6, titleVi: 'Bình thường hóa quan hệ Việt Nam – Hoa Kỳ', titleEn: 'Normalization of US-VN relations', iconId: 1, color: '#f59e0b' },
    { id: 'vn-door-left', year: '28/07/1995', sortOrder: 7, titleVi: 'Việt Nam gia nhập ASEAN', titleEn: 'VN joins ASEAN', iconId: 3, color: '#ef4444' },
    { id: 'vn-door-right', year: '24/10/1995', sortOrder: 8, titleVi: 'Nhật thực toàn phần tại Việt Nam', titleEn: 'Total solar eclipse in Vietnam', iconId: 6, color: '#6366f1' }
  ], []);

  const orderedEventsRef = React.useRef(orderedEvents);
  useEffect(() => {
    orderedEventsRef.current = orderedEvents;
  }, [orderedEvents]);

  // Khởi tạo game mới và trộn 9 ô ngẫu nhiên
  const initializeGame = useCallback(() => {
    let shuffled = [...HISTORY_EVENTS];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    setOrderedEvents(shuffled);
    setScore(0); // Bắt đầu từ 0 điểm
    setTimeLeft(180); // 3 phút = 180 giây
    setGameState('playing');
    setLastCheckResults(null);
    socket?.emit('update-status', 'playing-game');
  }, [socket, HISTORY_EVENTS]);

  // Bộ đếm thời gian chạy nền
  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Tính điểm dựa trên số ô đúng khi hết giờ
          const currentEvents = orderedEventsRef.current;
          const correctCount = currentEvents.filter((event, idx) => event.sortOrder === idx).length;
          const finalScore = correctCount * 10;
          
          setScore(finalScore);
          setGameState('lost');
          socket?.emit('submit-score', { score: finalScore });
          socket?.emit('update-status', '');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, socket]);

  // Tráo đổi vị trí giữa 2 ô sự kiện
  const swapEvents = useCallback((idx1: number, idx2: number) => {
    setOrderedEvents((prev) => {
      const copy = [...prev];
      const temp = copy[idx1];
      copy[idx1] = copy[idx2];
      copy[idx2] = temp;
      return copy;
    });
    setLastCheckResults(null); // Reset kết quả check trước đó khi người chơi thay đổi vị trí
  }, []);

  // Xác nhận kiểm tra thứ tự
  const checkOrder = useCallback(() => {
    const results = orderedEvents.map((event, idx) => event.sortOrder === idx);
    setLastCheckResults(results);

    const correctCount = results.filter(r => r === true).length;
    
    if (correctCount === 9) {
      // Đúng hết cả 9 câu -> 100 điểm
      setScore(100);
      setGameState('won');
      socket?.emit('submit-score', { score: 100 });
      socket?.emit('update-status', '');
    } else {
      // Không đúng hết -> mỗi câu đúng được 10 điểm
      const currentScore = correctCount * 10;
      setScore(currentScore);
      // Phạt trừ 5 giây cho mỗi lần check sai thứ tự
      setTimeLeft((prev) => Math.max(0, prev - 5));
    }
  }, [orderedEvents, socket]);

  const [settings, setSettings] = useState<GraphicsSettings>({
    preset: 'ultra-low',
    shadows: false,
    animations: false,
    maxAvatars: 0,
    reducedLights: true,
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
      case 'ultra-low':
        return { shadows: false, animations: false, maxAvatars: 0, reducedLights: true };
      case 'low':
        return { shadows: false, animations: false, maxAvatars: 10, reducedLights: false };
      case 'medium':
      default:
        return { shadows: false, animations: true, maxAvatars: 99, reducedLights: false };
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

    newSocket.on('door-closed', (data: { doorId: string }) => {
      setDoorStates(prev => ({
        ...prev,
        [data.doorId]: { isOpen: false, targetRoom: '' },
      }));
      setDoorClosingAlert(null);
      console.log(`[DOOR] Cửa "${data.doorId}" đã đóng.`);
    });

    // ── Room Events ──
    newSocket.on('room-states', (states: Record<string, RoomState>) => {
      setRoomStates(states);
    });

    newSocket.on('room-closing', (data: RoomClosingAlert) => {
      setRoomClosingAlert(data);
      // Tự động clear alert sau countdown
      setTimeout(() => setRoomClosingAlert(null), data.countdownMs + 500);
    });

    newSocket.on('room-closed', (data: { roomId: string; teleportTo: string }) => {
      setRoomClosingAlert(null);
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

    newSocket.on('user-status-updated', (data: { id: string; status: string }) => {
      setOtherUsers(prev => prev.map(u => u.id === data.id ? { ...u, status: data.status } : u));
      if (otherUsersPositions.current[data.id]) {
        otherUsersPositions.current[data.id].status = data.status;
      }
    });

    newSocket.on('leaderboard-updated', (board: Array<{ nickname: string; score: number; time: string }>) => {
      setLeaderboard(board);
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

    const spawn = SPAWN_POINTS[activeGallery.id] || { x: 0, y: 3.0, z: -5.0 };

    socket.emit('join-room', {
      nickname,
      galleryId: activeGallery.id,
      x: spawn.x,
      y: 0,
      z: spawn.z,
      yaw: localUserYaw,
    });
  }, [socket, nickname, activeGallery]);

  // Pre-load all rooms ngầm lúc rảnh rỗi nếu cấu hình là 'medium' và phòng đó đang bật
  useEffect(() => {
    if (settings.preset !== 'medium') return;

    const idleCallback = typeof window !== 'undefined'
      ? (window.requestIdleCallback || ((cb: any) => setTimeout(cb, 2000)))
      : null;

    if (!idleCallback) return;

    const idleId = idleCallback(() => {
      if (roomStates['gallery-subsidy']?.isOpen) loadRoom('gallery-subsidy');
      if (roomStates['gallery-paintings']?.isOpen) loadRoom('gallery-paintings');
      if (roomStates['gallery-ceramics']?.isOpen) loadRoom('gallery-ceramics');
      if (roomStates['gallery-market-economy']?.isOpen) loadRoom('gallery-market-economy');
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

  // Nếu chuyển đổi cấu hình sang 'low' / 'ultra-low', dỡ bỏ ngay những phòng đang tắt hoặc đóng để giải phóng bộ nhớ GPU (giữ lại phòng hiện tại)
  useEffect(() => {
    if (settings.preset === 'low' || settings.preset === 'ultra-low') {
      const allOpenTargets = Object.values(doorStates)
        .filter(s => s.isOpen)
        .map(s => s.targetRoom);

      setLoadedRooms(prev => {
        const filtered = prev.filter(room => 
          room.galleryId === activeGallery?.id ||
          (roomStates[room.galleryId]?.isOpen && allOpenTargets.includes(room.galleryId))
        );
        if (filtered.length !== prev.length) {
          console.log('[ROOM-UNLOADED] [PRESET-SWITCH] Đã dỡ các phòng đóng/tắt để tiết kiệm tài nguyên ở Preset Thấp.');
        }
        return filtered;
      });
    }
  }, [settings.preset, doorStates, roomStates, activeGallery]);

  // ═══════════════════════════════════════════════════════════════════════════
  // TỰ ĐỘNG TẢI/DỠ PHÒNG KHI PHÒNG BẬT/TẮT VÀ CỬA MỞ/ĐÓNG
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    // 1. Tải phòng động theo trạng thái Bật/Tắt của phòng
    for (const [galleryId, rState] of Object.entries(roomStates)) {
      if (rState.isOpen) {
        // Tải phòng khi bật (hoặc nếu là phòng hiện tại của người chơi)
        const isDoorOpenOrPreloaded = 
          galleryId === activeGallery?.id ||
          (settings.preset !== 'low' && settings.preset !== 'ultra-low') || 
          Object.values(doorStates).some(
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

    // 2. Tải/Dỡ phòng khi cửa mở/đóng đối với preset 'low' / 'ultra-low'
    for (const [doorId, dState] of Object.entries(doorStates)) {
      if (dState.isOpen && dState.targetRoom) {
        if (roomStates[dState.targetRoom]?.isOpen) {
          loadRoom(dState.targetRoom);
        }
      }

      if (!dState.isOpen && dState.targetRoom === '' && (settings.preset === 'low' || settings.preset === 'ultra-low')) {
        const allOpenTargets = Object.values(doorStates)
          .filter(s => s.isOpen)
          .map(s => s.targetRoom);

        setLoadedRooms(prev => prev.filter(room => {
          if (room.galleryId === activeGallery?.id) return true; // Giữ lại phòng hiện tại
          if (!roomStates[room.galleryId]?.isOpen || !allOpenTargets.includes(room.galleryId)) {
            console.log(`[ROOM-UNLOADED] [LOW-PRESET] Phòng "${room.galleryId}" đã được dỡ bỏ khi đóng cửa.`);
            return false;
          }
          return true;
        }));
      }
    }
  }, [doorStates, roomStates, loadRoom, unloadRoom, settings.preset, activeGallery]);

  return (
    <MuseumContext.Provider
      value={{
        language,
        setLanguage,
        nickname,
        setNickname,
        selectedExhibit,
        setSelectedExhibit,
        exhibitModalMode,
        setExhibitModalMode,
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
        roomClosingAlert,
        teleportTarget,
        clearTeleport,
        miniGameOpen,
        setMiniGameOpen,
        leaderboard,
        hasPlayed,
        setHasPlayed,
        gameState,
        orderedEvents,
        score,
        timeLeft,
        lastCheckResults,
        initializeGame,
        swapEvents,
        checkOrder,

        // --- Gameplay ---
        cluesCollected,
        roomOneCompleted,
        addClue,
        setRoomOneCompleted: handleSetRoomOneCompleted,
        resetRoomOne,

        sittingPosition,
        setSittingPosition,
        sittingPrompt,
        setSittingPrompt,
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
