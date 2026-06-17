'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
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

  const [settings, setSettings] = useState<GraphicsSettings>({
    preset: 'medium',
    shadows: true,
    animations: true,
    maxAvatars: 99,
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('museum_graphics_settings');
      if (saved) {
        try {
          setSettings(JSON.parse(saved));
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
        return { shadows: true, animations: true, maxAvatars: 99 };
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

  // Khởi tạo Socket.io Connection khi đã vào phòng (kết nối ngay cả khi chưa nhập nickname để hiển thị người chơi khác ở nền)
  useEffect(() => {
    if (!activeGallery) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      setOtherUsers([]);
      setInQueue(false);
      setQueuePosition(0);
      setIsAdmitted(false);
      return;
    }

    // Kết nối tới WebSocket server chạy trên cổng 3001
    const socketUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';
    const newSocket = io(socketUrl, {
      transports: ['websocket'],
      autoConnect: true,
    });

    newSocket.on('connect', () => {
      console.log('Đã kết nối Socket.io server:', newSocket.id);
      // Tham gia phòng triển lãm (server sẽ kiểm tra giới hạn 30 người)
      newSocket.emit('join-room', {
        nickname,
        galleryId: activeGallery.id,
        x: localUserPos[0],
        y: 0, // Chiều cao logic mặt đất
        z: localUserPos[2],
        yaw: localUserYaw,
      });
    });

    // Nhận thông báo đang ở hàng xếp hàng chờ
    newSocket.on('queue-status', (data: { inQueue: boolean; position: number }) => {
      setInQueue(data.inQueue);
      setQueuePosition(data.position);
      setIsAdmitted(false);
    });

    // Nhận thông báo đã tham gia phòng thành công trực tiếp (không bị xếp hàng)
    newSocket.on('join-success', () => {
      setInQueue(false);
      setQueuePosition(0);
      setIsAdmitted(true);
    });

    // Nhận thông báo được duyệt vào phòng (sau khi xếp hàng chờ)
    newSocket.on('admitted', () => {
      setInQueue(false);
      setQueuePosition(0);
      setIsAdmitted(true);
      // Gửi ngay tọa độ hiện tại lên server để người khác thấy
      newSocket.emit('move', {
        x: localUserPos[0],
        y: 0, // Chiều cao logic mặt đất
        z: localUserPos[2],
        yaw: localUserYaw,
      });
    });

    // Nhận danh sách người chơi hiện tại trong phòng
    newSocket.on('users-list', (users: MultiplayerUser[]) => {
      // Loại bỏ chính mình ra khỏi danh sách
      const filtered = users.filter(u => u.id !== newSocket.id);
      setOtherUsers(filtered);
      
      // Đồng thời cập nhật vào ref positions
      otherUsersPositions.current = {};
      filtered.forEach(u => {
        otherUsersPositions.current[u.id] = u;
      });
    });

    // Nhận sự kiện có người chơi mới tham gia
    newSocket.on('user-joined', (user: MultiplayerUser) => {
      setOtherUsers(prev => {
        if (prev.some(u => u.id === user.id)) return prev;
        return [...prev, user];
      });
      otherUsersPositions.current[user.id] = user;
    });

    // Nhận sự kiện có người chơi di chuyển
    newSocket.on('user-moved', (user: MultiplayerUser) => {
      // Chỉ cập nhật trực tiếp vào ref để tránh re-render React liên tục!
      otherUsersPositions.current[user.id] = user;
    });

    // Nhận sự kiện người chơi rời phòng
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
      otherUsersPositions.current = {}; // Clear positions on disconnect
    };
  }, [activeGallery, nickname]);

  // Gửi vị trí của chính mình lên server khi thay đổi (chỉ gửi khi đã được phê duyệt vào phòng)
  useEffect(() => {
    if (socket && socket.connected && isAdmitted) {
      socket.emit('move', {
        x: localUserPos[0],
        y: 0, // Chiều cao logic mặt đất
        z: localUserPos[2],
        yaw: localUserYaw,
      });
    }
  }, [localUserPos, localUserYaw, socket, isAdmitted]);

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
