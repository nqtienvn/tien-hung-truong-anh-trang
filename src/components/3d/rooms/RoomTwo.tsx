"use client";

import React, { useState, useMemo } from "react";
import * as THREE from "three";
import { useMuseum } from "@/context/MuseumContext";
import { BaseRoom, BaseRoomProps } from "./BaseRoom";

interface DelegateChairProps {
  localX: number;
  localZ: number;
  localY?: number;
  rotationY?: number;
}

const DelegateChair: React.FC<DelegateChairProps> = ({
  localX,
  localZ,
  localY = 0,
  rotationY = -Math.PI / 2,
}) => {
  return (
    <group position={[localX, localY, localZ]} rotation={[0, rotationY, 0]}>
      {/* Chân ghế kim loại */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.4, 8]} />
        <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Chân đế sao */}
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.04, 6]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Đệm ngồi màu đỏ */}
      <mesh position={[0, 0.42, 0]}>
        <boxGeometry args={[0.68, 0.08, 0.6]} />
        <meshStandardMaterial color="#7f1d1d" roughness={0.65} />
      </mesh>

      {/* Tựa lưng ghế */}
      <mesh position={[0, 0.78, -0.26]} rotation={[0.05, 0, 0]}>
        <boxGeometry args={[0.65, 0.68, 0.08]} />
        <meshStandardMaterial color="#7f1d1d" roughness={0.65} />
      </mesh>

      {/* Tay vịn hai bên */}
      {[-0.36, 0.36].map((xSide, i) => (
        <group key={i} position={[xSide, 0.58, 0.05]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.04, 0.24, 0.5]} />
            <meshStandardMaterial color="#1e293b" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.12, 0]}>
            <boxGeometry args={[0.06, 0.03, 0.52]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

export const RoomTwo: React.FC<BaseRoomProps> = ({
  galleryId,
  customSettings,
  isVisible = true,
}) => {
  const { activeGallery, settings } = useMuseum();

  // Đọc cấu hình động hoặc fallback về mặc định
  const roomHeight =
    customSettings?.room_height ?? activeGallery?.room_height ?? 6;

  // Tạo texture trình chiếu slide bài học Lịch sử Đảng / Triết học MLN122 bằng Canvas 2D
  const slideTexture = useMemo(() => {
    if (typeof window === "undefined") return null;
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 768;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Phông nền chuyển sắc đỏ đậm và xanh tối cực sang trọng
      const grad = ctx.createLinearGradient(0, 0, 1024, 768);
      grad.addColorStop(0, "#111827");
      grad.addColorStop(0.5, "#7f1d1d");
      grad.addColorStop(1, "#111827");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1024, 768);

      // Viền mạ vàng
      ctx.strokeStyle = "#d4af37";
      ctx.lineWidth = 10;
      ctx.strokeRect(15, 15, 994, 738);

      // Các họa tiết tia sáng mờ chéo nghệ thuật
      ctx.strokeStyle = "rgba(212, 175, 55, 0.08)";
      ctx.lineWidth = 2;
      for (let i = 50; i < 1000; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 20);
        ctx.lineTo(i, 748);
        ctx.stroke();
      }

      // Tiêu đề trường
      ctx.fillStyle = "#fef08a";
      ctx.font = 'bold 24px "Segoe UI", Arial, sans-serif';
      ctx.textAlign = "center";
      ctx.fillText(
        "ĐẠI HỌC QUỐC GIA TP.HCM — TRƯỜNG ĐẠI HỌC CÔNG NGHỆ THÔNG TIN",
        512,
        65,
      );

      // Tiêu đề hội nghị chuyên đề
      ctx.fillStyle = "#ffffff";
      ctx.font = 'black 48px "Segoe UI", Arial, sans-serif';
      ctx.fillText("HỘI NGHỊ HỌC TẬP CHUYÊN ĐỀ LÝ LUẬN CHÍNH TRỊ", 512, 190);

      // Tên đề tài khoa học
      ctx.fillStyle = "#38bdf8";
      ctx.font = 'bold 32px "Segoe UI", Arial, sans-serif';
      ctx.fillText(
        "Chủ đề: Hình thái kinh tế - xã hội và con đường đi lên CNXH ở Việt Nam",
        512,
        280,
      );
      ctx.fillStyle = "#e2e8f0";
      ctx.font = '24px "Segoe UI", Arial, sans-serif';
      ctx.fillText(
        "Môn học: Nguyên lý cơ bản của Chủ nghĩa Mác - Lênin (MLN122)",
        512,
        335,
      );

      // Nội dung cốt lõi của bài trình chiếu
      ctx.textAlign = "left";
      ctx.fillStyle = "#f8fafc";
      ctx.font = 'bold 24px "Segoe UI", Arial, sans-serif';
      ctx.fillText(
        "• 1. Biện chứng giữa Lực lượng sản xuất và Quan hệ sản xuất",
        100,
        430,
      );
      ctx.fillText(
        "• 2. Cơ cấu hạ tầng quyết định kiến trúc thượng tầng xã hội",
        100,
        490,
      );
      ctx.fillText(
        "• 3. Sự phát triển các hình thái KT-XH là quá trình lịch sử - tự nhiên",
        100,
        550,
      );
      ctx.fillText(
        "• 4. Liên hệ thực tiễn phát triển kinh tế thị trường định hướng XHCN",
        100,
        610,
      );

      // Chữ ký chân trang
      ctx.textAlign = "right";
      ctx.fillStyle = "#fef08a";
      ctx.font = 'italic 20px "Segoe UI", Arial, sans-serif';
      ctx.fillText("Hội trường Diên Hồng trực tuyến — 2026", 910, 700);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);

  // Tọa độ X của 5 dãy bàn dọc (xếp từ trái sang phải, tạo thành 5 cột bàn ghế)
  const deskXCoords = [-5.0, -1.8, 1.4, 4.6, 7.8];

  // Vị trí Z của 12 ghế trong mỗi cột bàn (gồm 6 ghế dãy trước và 6 ghế dãy sau)
  const frontChairZs = [-14.5, -12.5, -10.5, -8.5, -6.5, -4.5];
  const backChairZs = [4.5, 6.5, 8.5, 10.5, 12.5, 14.5];

  return (
    <BaseRoom
      galleryId={galleryId}
      customSettings={customSettings}
      isVisible={isVisible}
    >
      {/* ═══ 1. KHU VỰC KHÁN ĐÀI BỤC ĐẠI BIỂU DỌC THEO TƯỜNG TRÁI (Local X: -11.5 -> -8.0) ═══ */}
      <group position={[-9.8, 0, 0]}>
        {/* Sân khấu gỗ nổi cao 0.4m, chạy dọc theo trục Z */}
        <mesh position={[0, 0.2, 0]}>
          <boxGeometry args={[3.2, 0.4, 15.0]} />
          <meshStandardMaterial color="#2d1a11" roughness={0.4} />
        </mesh>
        {/* Thảm đỏ sân khấu */}
        <mesh position={[0, 0.41, 0]}>
          <boxGeometry args={[2.9, 0.02, 14.6]} />
          <meshStandardMaterial color="#991b1b" roughness={0.9} />
        </mesh>

        {/* Tường vách phông gỗ phía sau sân khấu (ốp sát tường trái X = -11.9) */}
        <mesh position={[-1.9, 2.7, 0]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[15.0, 5.0, 0.15]} />
          <meshStandardMaterial color="#311005" roughness={0.6} />
        </mesh>
        {/* Tấm phông đỏ giữa bục sân khấu */}
        <mesh position={[-1.8, 2.9, 0]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[6.5, 3.8, 0.05]} />
          <meshStandardMaterial color="#b91c1c" roughness={0.8} />
        </mesh>

        {/* Quốc huy mạ vàng mô phỏng ở trung tâm phông đỏ */}
        <mesh position={[-1.75, 3.5, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <cylinderGeometry args={[0.6, 0.6, 0.05, 24]} />
          <meshStandardMaterial
            color="#d4af37"
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
        {/* Ngôi sao vàng nhỏ phía trên quốc huy */}
        <mesh position={[-1.7, 3.5, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.2, 0.5, 4]} />
          <meshStandardMaterial
            color="#fef08a"
            emissive="#eab308"
            emissiveIntensity={0.5}
          />
        </mesh>

        {/* Khẩu hiệu vàng: "ĐẠI HỘI ĐẠI BIỂU HỘI NGHỊ DIÊN HỒNG" */}
        <mesh position={[-1.75, 1.8, 0]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[4.5, 0.15, 0.02]} />
          <meshStandardMaterial
            color="#d4af37"
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
        <mesh position={[-1.75, 1.5, 0]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[3.2, 0.12, 0.02]} />
          <meshStandardMaterial
            color="#d4af37"
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>

        {/* Tượng Bác Hồ đặt trang nghiêm phía bên phải sân khấu (Z > 0) */}
        <group position={[0.2, 0.4, 3.5]}>
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[0.6, 1.0, 0.6]} />
            <meshStandardMaterial color="#4a2b1b" roughness={0.5} />
          </mesh>
          <mesh position={[0, 1.02, 0]}>
            <boxGeometry args={[0.7, 0.05, 0.7]} />
            <meshStandardMaterial color="#d4af37" metalness={0.8} />
          </mesh>
          <mesh position={[0, 1.4, 0]}>
            <cylinderGeometry args={[0.13, 0.19, 0.7, 12]} />
            <meshStandardMaterial color="#f1f5f9" roughness={0.9} />
          </mesh>
          <mesh position={[0, 1.8, 0]}>
            <sphereGeometry args={[0.16, 12, 12]} />
            <meshStandardMaterial color="#f1f5f9" roughness={0.9} />
          </mesh>
        </group>

        {/* Cột cờ hai đầu sân khấu */}
        {[-5.8, 5.8].map((zPos, idx) => (
          <group key={`flag-${idx}`} position={[0.2, 0.4, zPos]}>
            <mesh position={[0, 1.8, 0]}>
              <cylinderGeometry args={[0.03, 0.03, 3.6, 8]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
            </mesh>
            <mesh
              position={[0, 3.0, idx === 0 ? -0.5 : 0.5]}
              rotation={[0, Math.PI / 2, 0]}
            >
              <boxGeometry args={[1.0, 0.7, 0.03]} />
              <meshStandardMaterial color="#b91c1c" roughness={0.8} />
            </mesh>
          </group>
        ))}

        {/* Bàn Chủ tọa Đoàn Chủ tịch quay sang phải */}
        <group position={[0.6, 0.4, 0]} rotation={[0, Math.PI / 2, 0]}>
          <mesh position={[0, 0.375, 0]}>
            <boxGeometry args={[5.2, 0.75, 0.8]} />
            <meshStandardMaterial color="#7f1d1d" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.76, 0]}>
            <boxGeometry args={[5.3, 0.05, 0.85]} />
            <meshStandardMaterial color="#3f2314" roughness={0.25} />
          </mesh>
          {/* Micro cổ ngỗng Chủ tọa */}
          {[-1.5, 0, 1.5].map((xMic, i) => (
            <group key={i} position={[xMic, 0.8, -0.2]}>
              <mesh>
                <cylinderGeometry args={[0.02, 0.02, 0.15, 8]} />
                <meshStandardMaterial color="#1e293b" metalness={0.9} />
              </mesh>
              <mesh position={[0, 0.14, 0.05]} rotation={[-Math.PI / 4, 0, 0]}>
                <cylinderGeometry args={[0.008, 0.008, 0.25, 8]} />
                <meshStandardMaterial color="#0f172a" />
              </mesh>
            </group>
          ))}
        </group>

        {/* Màn hình LED phẳng khổng lồ đặt trước cột tường bên cạnh sân khấu (Z local = -11.0m và 11.0m) */}
        {[-11.0, 11.0].map((zPos, idx) => (
          <group
            key={`led-wall-${idx}`}
            position={[-1.64, 3.5, zPos]}
            rotation={[0, Math.PI / 2, 0]}
          >
            {/* Khung viền màn hình */}
            <mesh>
              <boxGeometry args={[6.6, 3.9, 0.03]} />
              <meshStandardMaterial
                color="#1e293b"
                roughness={0.8}
                metalness={0.5}
              />
            </mesh>
            {/* Tấm nền hiển thị slide */}
            <mesh position={[0, 0, 0.02]}>
              <planeGeometry args={[6.5, 3.8]} />
              <meshBasicMaterial
                map={slideTexture || undefined}
                color={slideTexture ? "#ffffff" : "#0284c7"}
              />
            </mesh>
          </group>
        ))}

        {/* Bục phát biểu (Podium) hướng sang bên phải */}
        <group position={[0.6, 0.4, -3.8]} rotation={[0, Math.PI / 2, 0]}>
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[0.5, 1.0, 0.4]} />
            <meshStandardMaterial color="#5c2d18" roughness={0.3} />
          </mesh>
          <mesh position={[0, 1.02, 0.02]} rotation={[Math.PI / 12, 0, 0]}>
            <boxGeometry args={[0.56, 0.05, 0.46]} />
            <meshStandardMaterial color="#3f1a0a" roughness={0.2} />
          </mesh>
          <mesh position={[0, 1.15, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.25, 8]} />
            <meshStandardMaterial color="#000" metalness={0.9} />
          </mesh>
        </group>
      </group>

      {/* BẬC THANG BÊ TÔNG HỘI TRƯỜNG (Stepped Platforms) */}
      <group>
        {/* Bậc 2 (Column 2) */}
        <mesh position={[-1.8, 0.15, 0]}>
          <boxGeometry args={[3.2, 0.3, 34.0]} />
          <meshStandardMaterial color="#1e293b" roughness={0.9} />
        </mesh>
        {/* Bậc 3 (Column 3) */}
        <mesh position={[1.4, 0.3, 0]}>
          <boxGeometry args={[3.2, 0.6, 34.0]} />
          <meshStandardMaterial color="#1e293b" roughness={0.9} />
        </mesh>
        {/* Bậc 4 (Column 4) */}
        <mesh position={[4.6, 0.45, 0]}>
          <boxGeometry args={[3.2, 0.9, 34.0]} />
          <meshStandardMaterial color="#1e293b" roughness={0.9} />
        </mesh>
        {/* Bậc 5 (Column 5) */}
        <mesh position={[9.1, 0.6, 0]}>
          <boxGeometry args={[5.8, 1.2, 34.0]} />
          <meshStandardMaterial color="#1e293b" roughness={0.9} />
        </mesh>
      </group>

      {/* LAN CAN AN TOÀN GIỮA CÁC BẬC THỀM (Glass-Wood Railings) - Để trống lối đi giữa Z: [-4.5, 4.5] */}
      <group>
        {[
          { x: -3.4, tierY: 0.0 },
          { x: -0.2, tierY: 0.3 },
          { x: 3.0, tierY: 0.6 },
          { x: 6.2, tierY: 0.9 },
        ].map((rail, rIdx) => (
          <group key={`railing-${rIdx}`} position={[rail.x, rail.tierY, 0]}>
            {/* Cả 2 phần lan can: Dãy trước (Z: -14.5 -> -4.5) và Dãy sau (Z: 4.5 -> 14.5) */}
            {[-9.5, 9.5].map((zCenter, sIdx) => (
              <group key={`sec-${sIdx}`} position={[0, 0, zCenter]}>
                {/* Tấm kính cường lực bảo vệ trong suốt */}
                <mesh position={[0, 0.4, 0]}>
                  <boxGeometry args={[0.02, 0.65, 10.0]} />
                  <meshStandardMaterial
                    color="#0891b2"
                    transparent
                    opacity={0.25}
                    roughness={0.1}
                    metalness={0.8}
                  />
                </mesh>
                {/* Tay vịn bằng gỗ sồi sang trọng */}
                <mesh position={[0, 0.74, 0]}>
                  <boxGeometry args={[0.06, 0.04, 10.05]} />
                  <meshStandardMaterial color="#2d1708" roughness={0.3} />
                </mesh>
                {/* Trụ kim loại vững chắc nâng đỡ kính */}
                {[-5.0, -2.5, 0, 2.5, 5.0].map((zPost, pIdx) => (
                  <mesh key={`post-${pIdx}`} position={[0, 0.36, zPost]}>
                    <boxGeometry args={[0.04, 0.72, 0.04]} />
                    <meshStandardMaterial
                      color="#475569"
                      roughness={0.3}
                      metalness={0.7}
                    />
                  </mesh>
                ))}
              </group>
            ))}
          </group>
        ))}
      </group>

      {/* LAN CAN BIÊN AN TOÀN 2 ĐẦU TRÁI PHẢI CỦA BỤC BẬC THANG (Platform End Railings at Z = -17.0 and 17.0) */}
      <group>
        {[
          { xCenter: -1.8, width: 3.2, tierY: 0.3 },
          { xCenter: 1.4, width: 3.2, tierY: 0.6 },
          { xCenter: 4.6, width: 3.2, tierY: 0.9 },
          { xCenter: 9.1, width: 5.8, tierY: 1.2 },
        ].map((rail, rIdx) => (
          <group key={`end-rail-${rIdx}`} position={[0, 0, 0]}>
            {[-17.0, 17.0].map((zPos, sIdx) => (
              <group
                key={`end-sec-${sIdx}`}
                position={[rail.xCenter, rail.tierY, zPos]}
              >
                {/* Tấm kính cường lực bảo vệ */}
                <mesh position={[0, 0.4, 0]}>
                  <boxGeometry args={[rail.width, 0.65, 0.02]} />
                  <meshStandardMaterial
                    color="#0891b2"
                    transparent
                    opacity={0.25}
                    roughness={0.1}
                    metalness={0.8}
                  />
                </mesh>
                {/* Tay vịn gỗ sồi sẫm màu */}
                <mesh position={[0, 0.74, 0]}>
                  <boxGeometry args={[rail.width + 0.02, 0.04, 0.06]} />
                  <meshStandardMaterial color="#2d1708" roughness={0.3} />
                </mesh>
                {/* Trụ đỡ kim loại */}
                {rail.width > 4.0
                  ? [-2.4, 0, 2.4].map((xPost, pIdx) => (
                      <mesh key={`post-${pIdx}`} position={[xPost, 0.36, 0]}>
                        <boxGeometry args={[0.04, 0.72, 0.04]} />
                        <meshStandardMaterial
                          color="#475569"
                          roughness={0.3}
                          metalness={0.7}
                        />
                      </mesh>
                    ))
                  : [-1.2, 1.2].map((xPost, pIdx) => (
                      <mesh key={`post-${pIdx}`} position={[xPost, 0.36, 0]}>
                        <boxGeometry args={[0.04, 0.72, 0.04]} />
                        <meshStandardMaterial
                          color="#475569"
                          roughness={0.3}
                          metalness={0.7}
                        />
                      </mesh>
                    ))}
              </group>
            ))}
          </group>
        ))}
      </group>

      {/* ═══ 2. KHU VỰC GHẾ NGỒI ĐẠI BIỂU DỌC PHÒNG (Bố cục bậc thang 60 ghế) ═══ */}
      <group>
        {deskXCoords.map((xCol, colIndex) => {
          // Hàm tính độ cao bậc dựa theo cột X
          const getTierY = (xVal: number) => {
            if (xVal < -3.4) return 0.0;
            if (xVal < -0.2) return 0.3;
            if (xVal < 3.0) return 0.6;
            if (xVal < 6.2) return 0.9;
            return 1.2;
          };
          const tierY = getTierY(xCol);

          return (
            <group key={`col-${colIndex}`}>
              {/* BÀN DÃY TRƯỚC (Front block: Dịch trái 1.0m để sát sạt lan can) */}
              <group position={[xCol - 1.0, tierY, -9.5]}>
                {/* Che chân bàn vải đỏ */}
                <mesh position={[0, 0.35, 0]}>
                  <boxGeometry args={[0.5, 0.7, 11.0]} />
                  <meshStandardMaterial color="#653b1b" roughness={0.4} />
                </mesh>
                {/* Mặt bàn gỗ */}
                <mesh position={[0, 0.725, 0]}>
                  <boxGeometry args={[0.56, 0.05, 11.06]} />
                  <meshStandardMaterial color="#3a1e0b" roughness={0.3} />
                </mesh>
                {/* 6 Terminal điện tử cho đại biểu dãy trước */}
                {frontChairZs.map((zChair, idx) => (
                  <group
                    key={`term-front-${idx}`}
                    position={[0.05, 0.75, zChair - -9.5]}
                    rotation={[0, -Math.PI / 2, -Math.PI / 8]}
                  >
                    <mesh position={[0, 0.08, 0]}>
                      <boxGeometry args={[0.3, 0.2, 0.04]} />
                      <meshStandardMaterial color="#1e293b" metalness={0.8} />
                    </mesh>
                    <mesh position={[0, 0.08, 0.025]}>
                      <planeGeometry args={[0.26, 0.17]} />
                      <meshBasicMaterial color="#0891b2" />
                    </mesh>
                    <mesh position={[0, 0.01, -0.05]}>
                      <cylinderGeometry args={[0.015, 0.015, 0.05, 8]} />
                      <meshStandardMaterial color="#334155" />
                    </mesh>
                  </group>
                ))}
              </group>

              {/* BÀN DÃY SAU (Back block: Dịch trái 1.0m để sát sạt lan can) */}
              <group position={[xCol - 1.0, tierY, 9.5]}>
                {/* Che chân bàn vải đỏ */}
                <mesh position={[0, 0.35, 0]}>
                  <boxGeometry args={[0.5, 0.7, 11.0]} />
                  <meshStandardMaterial color="#653b1b" roughness={0.4} />
                </mesh>
                {/* Mặt bàn gỗ */}
                <mesh position={[0, 0.725, 0]}>
                  <boxGeometry args={[0.56, 0.05, 11.06]} />
                  <meshStandardMaterial color="#3a1e0b" roughness={0.3} />
                </mesh>
                {/* 6 Terminal điện tử cho đại biểu dãy sau */}
                {backChairZs.map((zChair, idx) => (
                  <group
                    key={`term-back-${idx}`}
                    position={[0.05, 0.75, zChair - 9.5]}
                    rotation={[0, -Math.PI / 2, -Math.PI / 8]}
                  >
                    <mesh position={[0, 0.08, 0]}>
                      <boxGeometry args={[0.3, 0.2, 0.04]} />
                      <meshStandardMaterial color="#1e293b" metalness={0.8} />
                    </mesh>
                    <mesh position={[0, 0.08, 0.025]}>
                      <planeGeometry args={[0.26, 0.17]} />
                      <meshBasicMaterial color="#0891b2" />
                    </mesh>
                    <mesh position={[0, 0.01, -0.05]}>
                      <cylinderGeometry args={[0.015, 0.015, 0.05, 8]} />
                      <meshStandardMaterial color="#334155" />
                    </mesh>
                  </group>
                ))}
              </group>

              {/* ═══ ĐẶT GHẾ ĐẠI BIỂU TƯƠNG TÁC (Dịch sang trái localX={xCol - 0.4}) ═══ */}
              {/* Dãy trước */}
              {frontChairZs.map((zChair, idx) => (
                <DelegateChair
                  key={`chair-front-${idx}`}
                  localX={xCol - 0.4}
                  localY={tierY}
                  localZ={zChair}
                  rotationY={-Math.PI / 2}
                />
              ))}
              {/* Dãy sau */}
              {backChairZs.map((zChair, idx) => (
                <DelegateChair
                  key={`chair-back-${idx}`}
                  localX={xCol - 0.4}
                  localY={tierY}
                  localZ={zChair}
                  rotationY={-Math.PI / 2}
                />
              ))}
            </group>
          );
        })}
      </group>
    </BaseRoom>
  );
};

export default RoomTwo;
