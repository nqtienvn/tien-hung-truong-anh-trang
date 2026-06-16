'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { Gallery, Exhibit } from '@/lib/db';

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
  socket: Socket | null;
  localUserPos: [number, number, number];
  setLocalUserPos: (pos: [number, number, number]) => void;
  localUserYaw: number;
  setLocalUserYaw: (yaw: number) => void;
}

const MuseumContext = createContext<MuseumContextType | undefined>(undefined);

export const MuseumProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<'vi' | 'en'>('vi');
  const [nickname, setNickname] = useState<string>('');
  const [selectedExhibit, setSelectedExhibit] = useState<Exhibit | null>(null);
  const [activeGallery, setActiveGallery] = useState<Gallery | null>(null);
  const [audioPlaying, setAudioPlaying] = useState<boolean>(false);
  const [otherUsers, setOtherUsers] = useState<MultiplayerUser[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [localUserPos, setLocalUserPos] = useState<[number, number, number]>([0, 1.7, 5]);
  const [localUserYaw, setLocalUserYaw] = useState<number>(0);

  // Khởi tạo Socket.io Connection khi đã vào phòng và có nickname
  useEffect(() => {
    if (!activeGallery || !nickname) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      setOtherUsers([]);
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
      // Tham gia phòng triển lãm
      newSocket.emit('join-room', {
        nickname,
        galleryId: activeGallery.id,
        x: localUserPos[0],
        y: localUserPos[1],
        z: localUserPos[2],
        yaw: localUserYaw,
      });
    });

    // Nhận danh sách người chơi hiện tại trong phòng
    newSocket.on('users-list', (users: MultiplayerUser[]) => {
      // Loại bỏ chính mình ra khỏi danh sách
      const filtered = users.filter(u => u.id !== newSocket.id);
      setOtherUsers(filtered);
    });

    // Nhận sự kiện có người chơi mới tham gia
    newSocket.on('user-joined', (user: MultiplayerUser) => {
      setOtherUsers(prev => {
        if (prev.some(u => u.id === user.id)) return prev;
        return [...prev, user];
      });
    });

    // Nhận sự kiện có người chơi di chuyển
    newSocket.on('user-moved', (user: MultiplayerUser) => {
      setOtherUsers(prev => prev.map(u => (u.id === user.id ? user : u)));
    });

    // Nhận sự kiện người chơi rời phòng
    newSocket.on('user-left', (userId: string) => {
      setOtherUsers(prev => prev.filter(u => u.id !== userId));
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [activeGallery, nickname]);

  // Gửi vị trí của chính mình lên server khi thay đổi
  useEffect(() => {
    if (socket && socket.connected) {
      socket.emit('move', {
        x: localUserPos[0],
        y: localUserPos[1],
        z: localUserPos[2],
        yaw: localUserYaw,
      });
    }
  }, [localUserPos, localUserYaw, socket]);

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
        otherUsers,
        socket,
        localUserPos,
        setLocalUserPos,
        localUserYaw,
        setLocalUserYaw,
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
