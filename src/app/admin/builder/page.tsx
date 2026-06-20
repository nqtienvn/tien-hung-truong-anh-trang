'use client';

import React, { useEffect, useState, Suspense, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Exhibit, Gallery } from '@/lib/db';
import { ExhibitionRoom } from '@/components/3d/ExhibitionRoom';
import { ExhibitObject } from '@/components/3d/ExhibitObject';
import { ArrowLeft, Save, Sliders, Move, RotateCw, Maximize } from 'lucide-react';
import confetti from 'canvas-confetti';

function BuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const exhibitId = searchParams.get('exhibitId');

  const [exhibits, setExhibits] = useState<Exhibit[]>([]);
  const [selectedExhibit, setSelectedExhibit] = useState<Exhibit | null>(null);
  const [gallery, setGallery] = useState<Gallery | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Tọa độ đang điều chỉnh
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(0);
  const [posZ, setPosZ] = useState(0);
  const [rotX, setRotX] = useState(0);
  const [rotY, setRotY] = useState(0);
  const [rotZ, setRotZ] = useState(0);
  const [scaleX, setScaleX] = useState(1);
  const [scaleY, setScaleY] = useState(1);
  const [scaleZ, setScaleZ] = useState(1);

  useEffect(() => {
    if (!exhibitId) {
      router.push('/admin');
      return;
    }

    setLoading(true);
    // Tải thông tin hiện vật
    fetch('/api/exhibits')
      .then(res => res.json())
      .then((data: Exhibit[]) => {
        const found = data.find(e => e.id === exhibitId);
        if (found) {
          setSelectedExhibit(found);
          
          // Thiết lập giá trị slider ban đầu
          setPosX(found.coordinate_x);
          setPosY(found.coordinate_y);
          setPosZ(found.coordinate_z);
          setRotX(found.rotation_x);
          setRotY(found.rotation_y);
          setRotZ(found.rotation_z);
          setScaleX(found.scale_x);
          setScaleY(found.scale_y);
          setScaleZ(found.scale_z);

          // Tải toàn bộ các hiện vật trong cùng phòng để xem bối cảnh
          return Promise.all([
            fetch(`/api/exhibits?galleryId=${found.gallery_id}`).then(res => res.json()),
            fetch('/api/galleries').then(res => res.json())
          ]).then(([roomExhibits, galleries]: [Exhibit[], Gallery[]]) => {
            setExhibits(roomExhibits);
            const gal = galleries.find(g => g.id === found.gallery_id);
            if (gal) setGallery(gal);
            setLoading(false);
          });
        } else {
          throw new Error('Không tìm thấy hiện vật cần định vị');
        }
      })
      .catch(err => {
        console.error(err);
        setError('Lỗi tải dữ liệu định vị.');
        setLoading(false);
      });
  }, [exhibitId, router]);

  // Cập nhật tọa độ hiện vật được chỉnh sửa trong danh sách để Canvas re-render
  useEffect(() => {
    if (!selectedExhibit) return;

    setExhibits(prev => 
      prev.map(e => e.id === selectedExhibit.id ? {
        ...e,
        coordinate_x: posX,
        coordinate_y: posY,
        coordinate_z: posZ,
        rotation_x: rotX,
        rotation_y: rotY,
        rotation_z: rotZ,
        scale_x: scaleX,
        scale_y: scaleY,
        scale_z: scaleZ
      } : e)
    );
  }, [posX, posY, posZ, rotX, rotY, rotZ, scaleX, scaleY, scaleZ, selectedExhibit]);

  // Lưu tọa độ vào Database JSON
  const handleSaveCoordinates = async () => {
    if (!selectedExhibit) return;
    setSaving(true);
    setMessage('');
    setError('');

    const updatedCoords = {
      coordinate_x: posX,
      coordinate_y: posY,
      coordinate_z: posZ,
      rotation_x: rotX,
      rotation_y: rotY,
      rotation_z: rotZ,
      scale_x: scaleX,
      scale_y: scaleY,
      scale_z: scaleZ
    };

    try {
      const res = await fetch(`/api/exhibits/${selectedExhibit.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCoords)
      });

      if (res.ok) {
        setMessage('Đã lưu tọa độ không gian thành công!');
        // Phóng hiệu ứng pháo hoa chúc mừng nghệ thuật
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } else {
        const data = await res.json();
        setError(data.error || 'Lưu tọa độ thất bại.');
      }
    } catch (err) {
      setError('Lỗi kết nối máy chủ.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07070a] flex flex-col justify-center items-center gap-4 text-slate-200">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold tracking-wider uppercase">Đang mở không gian thiết kế 3D...</p>
      </div>
    );
  }

  if (error && !selectedExhibit) {
    return (
      <div className="min-h-screen bg-[#07070a] flex flex-col justify-center items-center p-6">
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-6 rounded-2xl max-w-md shadow-2xl text-center">
          <h2 className="text-lg font-bold mb-2">⚠️ Lỗi mở công cụ</h2>
          <p className="text-sm text-slate-400 mb-4">{error}</p>
          <button 
            onClick={() => router.push('/admin')}
            className="bg-amber-500 text-slate-950 font-bold px-5 py-2 rounded-xl text-xs hover:scale-105 active:scale-95 transition-transform"
          >
            Quay về CMS
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#0a0a0d] flex text-slate-200 relative select-none">
      
      {/* CỘT TRÁI: INTERACTIVE 3D CANVAS (BÊN TRÁI CHIẾM 3/4 MÀN HÌNH) */}
      <div className="flex-1 h-full relative">
        <Canvas
          shadows
          camera={{ position: [0, 2.5, 6], fov: 60 }}
        >
          <color attach="background" args={['#0a0a0d']} />
          <fog attach="fog" args={['#0a0a0d', 5, 18]} />
          
          <ambientLight intensity={0.3} />
          <directionalLight position={[5, 10, 5]} intensity={0.5} />

          <Suspense fallback={null}>
            {gallery && <ExhibitionRoom galleryId={gallery.id} />}
            
            {/* Render các tác phẩm, cái nào được chỉnh sẽ được cập nhật tọa độ động bằng React state */}
            {exhibits.map((exhibit) => (
              <ExhibitObject key={exhibit.id} exhibit={exhibit} />
            ))}
          </Suspense>

          <OrbitControls 
            enableDamping 
            maxPolarAngle={Math.PI / 2 - 0.05}
            minDistance={1}
            maxDistance={12}
          />
        </Canvas>

        {/* Thông tin phòng trưng bày góc trên trái */}
        <div className="absolute top-4 left-4 bg-slate-950/80 border border-slate-800/80 p-3 rounded-2xl backdrop-blur-md flex items-center gap-3">
          <div className="bg-amber-500/20 text-amber-400 p-2 rounded-lg">
            <Sliders size={16} />
          </div>
          <div>
            <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest block">3D WYSIWYG Builder</span>
            <span className="text-xs font-bold text-slate-200 block">{gallery?.name}</span>
          </div>
        </div>

        {/* Hướng dẫn di chuyển camera builder */}
        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md text-white text-[10px] py-1 px-3 rounded-full pointer-events-none">
          💡 Click + Kéo chuột trái để xoay camera | Click + Kéo chuột phải để di chuyển góc nhìn
        </div>
      </div>

      {/* CỘT PHẢI: SLIDERS & CONTROLS SIDEBAR (CHIẾM 1/4 MÀN HÌNH - Z-INDEX: 20) */}
      <div className="w-[360px] h-full bg-slate-950 border-l border-slate-900 flex flex-col p-6 overflow-y-auto space-y-6 shadow-2xl relative z-10 pointer-events-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-900">
          <button
            onClick={() => router.push('/admin')}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            CMS Admin
          </button>
          <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
            BUILD MODE
          </span>
        </div>

        {selectedExhibit && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img 
                src={selectedExhibit.thumbnail_url} 
                alt="" 
                className="w-14 h-14 object-cover rounded-xl border border-slate-800 shadow-md"
              />
              <div>
                <h2 className="text-sm font-bold text-white truncate max-w-[200px]">{selectedExhibit.title.vi}</h2>
                <p className="text-[10px] text-slate-500 truncate mt-0.5">{selectedExhibit.author.vi}</p>
                <span className="text-[8px] bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded border border-slate-850 mt-1 inline-block">
                  {selectedExhibit.model_3d_url ? 'Điêu Khắc 3D' : 'Tranh Treo Tường'}
                </span>
              </div>
            </div>

            <hr className="border-slate-900" />

            {/* Cảnh báo lưu / lỗi */}
            {message && (
              <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 p-3 rounded-xl text-xs font-semibold">
                {message}
              </div>
            )}
            {error && (
              <div className="bg-rose-500/15 border border-rose-500/30 text-rose-400 p-3 rounded-xl text-xs font-semibold">
                {error}
              </div>
            )}

            {/* NHÓM SLIDERS VỊ TRÍ (POSITION X, Y, Z) */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
                <Move size={12} />
                Vị trí không gian (XYZ)
              </h3>
              
              {/* X */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Trục X (Trái / Phải)</span>
                  <span className="text-white font-bold">{posX.toFixed(2)}m</span>
                </div>
                <input 
                  type="range" min="-9.5" max="9.5" step="0.05"
                  value={posX} onChange={(e) => setPosX(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Y */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Trục Y (Độ Cao)</span>
                  <span className="text-white font-bold">{posY.toFixed(2)}m</span>
                </div>
                <input 
                  type="range" min="0.0" max="5.0" step="0.05"
                  value={posY} onChange={(e) => setPosY(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Z */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Trục Z (Sâu / Trước)</span>
                  <span className="text-white font-bold">{posZ.toFixed(2)}m</span>
                </div>
                <input 
                  type="range" min="-9.5" max="9.5" step="0.05"
                  value={posZ} onChange={(e) => setPosZ(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* NHÓM SLIDERS GÓC XOAY (ROTATION X, Y, Z) */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <RotateCw size={12} />
                Góc xoay vật lý (Rotation)
              </h3>

              {/* Yaw - Rot Y (Góc xoay quan trọng nhất) */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Xoay quanh trục đứng (Y - Yaw)</span>
                  <span className="text-white font-bold">{((rotY * 180) / Math.PI).toFixed(0)}°</span>
                </div>
                <input 
                  type="range" min="-3.1415" max="3.1415" step="0.05"
                  value={rotY} onChange={(e) => setRotY(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Pitch - Rot X */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Gập trước sau (X)</span>
                  <span className="text-white font-bold">{((rotX * 180) / Math.PI).toFixed(0)}°</span>
                </div>
                <input 
                  type="range" min="-3.1415" max="3.1415" step="0.05"
                  value={rotX} onChange={(e) => setRotX(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Roll - Rot Z */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Nghiêng trái phải (Z)</span>
                  <span className="text-white font-bold">{((rotZ * 180) / Math.PI).toFixed(0)}°</span>
                </div>
                <input 
                  type="range" min="-3.1415" max="3.1415" step="0.05"
                  value={rotZ} onChange={(e) => setRotZ(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* NHÓM SLIDERS TỈ LỆ KÍCH THƯỚC (SCALE X, Y, Z) */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Maximize size={12} />
                Tỉ lệ kích thước (Scale)
              </h3>

              {/* Scale X */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Độ rộng (X)</span>
                  <span className="text-white font-bold">{scaleX.toFixed(2)}x</span>
                </div>
                <input 
                  type="range" min="0.2" max="5.0" step="0.05"
                  value={scaleX} onChange={(e) => setScaleX(parseFloat(e.target.value))}
                  className="w-full accent-cyan-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Scale Y */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Độ cao (Y)</span>
                  <span className="text-white font-bold">{scaleY.toFixed(2)}x</span>
                </div>
                <input 
                  type="range" min="0.2" max="5.0" step="0.05"
                  value={scaleY} onChange={(e) => setScaleY(parseFloat(e.target.value))}
                  className="w-full accent-cyan-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {selectedExhibit.model_3d_url && (
                /* Scale Z chỉ hiển thị cho Tượng 3D */
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>Độ dày (Z)</span>
                    <span className="text-white font-bold">{scaleZ.toFixed(2)}x</span>
                  </div>
                  <input 
                    type="range" min="0.2" max="5.0" step="0.05"
                    value={scaleZ} onChange={(e) => setScaleZ(parseFloat(e.target.value))}
                    className="w-full accent-cyan-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              )}
            </div>

            <hr className="border-slate-900" />

            <button
              onClick={handleSaveCoordinates}
              disabled={saving}
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-amber-600/40 text-slate-950 py-3 rounded-2xl text-xs font-bold transition-all hover:scale-[1.02] active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/10"
            >
              <Save size={14} />
              {saving ? 'Đang Lưu...' : 'Lưu Tọa Độ Không Gian'}
            </button>
          </div>
        )}
      </div>

    </div>
  );
}

export default function CoordinateBuilder() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#07070a] flex flex-col justify-center items-center gap-4 text-slate-200">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold tracking-wider uppercase">Đang mở không gian thiết kế 3D...</p>
      </div>
    }>
      <BuilderContent />
    </Suspense>
  );
}
