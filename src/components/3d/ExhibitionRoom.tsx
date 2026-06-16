import React from 'react';
import * as THREE from 'three';

interface ExhibitionRoomProps {
  galleryId: string;
}

export const ExhibitionRoom: React.FC<ExhibitionRoomProps> = ({ galleryId }) => {
  const isSculptures = galleryId === 'gallery-sculptures';

  return (
    <group>
      {/* 1. SÀN NHÀ & THẢM TRẢI SÀN (Floor & Center Carpet) */}
      {/* Sàn gỗ cơ bản (viền ngoài) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 30]} />
        <meshStandardMaterial 
          color="#4e3629" // Gỗ mun/sồi tối cổ kính
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>

      {/* Vân sàn gỗ giả lập chạy dọc hai bên */}
      <gridHelper args={[30, 30, '#312017', '#251811']} position={[0, 0.005, 0]} />

      {/* Tấm thảm dài màu xám-be cổ điển ở trục chính hành lang */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[6, 30]} />
        <meshStandardMaterial 
          color="#a29587" // Màu thảm be cổ điển sang trọng
          roughness={0.95}
          metalness={0.0}
        />
      </mesh>

      {/* 2. TRẦN NHÀ HÌNH VÒM & GIẾNG TRỜI (Vaulted Ceiling & Glass Skylight) */}
      {/* Tấm trần vòm nghiêng bên trái */}
      <mesh position={[-4.25, 5.4, 0]} rotation={[0, 0, -Math.PI / 12]} castShadow receiveShadow>
        <boxGeometry args={[3.6, 0.1, 30]} />
        <meshStandardMaterial 
          color="#eae5dc" // Thạch cao trắng kem
          roughness={0.8}
        />
      </mesh>

      {/* Tấm trần vòm nghiêng bên phải */}
      <mesh position={[4.25, 5.4, 0]} rotation={[0, 0, Math.PI / 12]} castShadow receiveShadow>
        <boxGeometry args={[3.6, 0.1, 30]} />
        <meshStandardMaterial 
          color="#eae5dc"
          roughness={0.8}
        />
      </mesh>

      {/* Trần giếng trời kính (Skylight) ở chính giữa trục dọc hành lang */}
      <mesh position={[0, 5.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[5, 30]} />
        <meshStandardMaterial 
          color="#bae6fd" // Kính đón nắng xanh nhạt tự nhiên
          emissive="#bae6fd"
          emissiveIntensity={0.8} // Tăng mạnh độ sáng giếng trời phát ra
          transparent
          opacity={0.8}
          roughness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Khung sắt giếng trời cổ điển chạy dọc */}
      {Array.from({ length: 11 }).map((_, i) => (
        <mesh key={`skylight-grid-${i}`} position={[0, 5.81, -15 + i * 3]} castShadow>
          <boxGeometry args={[5, 0.05, 0.05]} />
          <meshStandardMaterial color="#1e293b" roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[0, 5.81, 0]}>
        <boxGeometry args={[0.05, 0.05, 30]} />
        <meshStandardMaterial color="#1e293b" roughness={0.9} />
      </mesh>
      <mesh position={[-2.5, 5.81, 0]}>
        <boxGeometry args={[0.05, 0.05, 30]} />
        <meshStandardMaterial color="#1e293b" roughness={0.9} />
      </mesh>
      <mesh position={[2.5, 5.81, 0]}>
        <boxGeometry args={[0.05, 0.05, 30]} />
        <meshStandardMaterial color="#1e293b" roughness={0.9} />
      </mesh>


      {/* 3. BỨC TƯỜNG ĐỎ CỔ ĐIỂN & PHÀO CHÂN TƯỜNG TRẮNG (Classical Crimson Walls & Wainscoting) */}
      {/* Tường trái (Crimson Red) */}
      <mesh position={[-6, 3, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[30, 6, 0.2]} />
        <meshStandardMaterial 
          color="#8a1923" // Màu đỏ thẫm quý tộc
          roughness={0.7}
        />
      </mesh>
      {/* Tường phải (Crimson Red) */}
      <mesh position={[6, 3, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[30, 6, 0.2]} />
        <meshStandardMaterial 
          color="#8a1923"
          roughness={0.7}
        />
      </mesh>
      {/* Tường sau (Crimson Red) */}
      <mesh position={[0, 3, 15]} receiveShadow>
        <boxGeometry args={[12, 6, 0.2]} />
        <meshStandardMaterial 
          color="#8a1923"
          roughness={0.7}
        />
      </mesh>
      {/* Tường trước (Crimson Red) */}
      <mesh position={[0, 3, -15]} receiveShadow>
        <boxGeometry args={[12, 6, 0.2]} />
        <meshStandardMaterial 
          color="#8a1923"
          roughness={0.7}
        />
      </mesh>

      {/* Ốp gỗ chân tường (Wainscoting) màu kem sáng cao 1.2m */}
      {/* Wainscoting tường trái */}
      <mesh position={[-5.89, 0.6, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[30, 1.2, 0.02]} />
        <meshStandardMaterial color="#eae5dc" roughness={0.5} />
      </mesh>
      <mesh position={[-5.87, 1.2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[30, 0.06, 0.04]} />
        <meshStandardMaterial color="#eae5dc" roughness={0.4} />
      </mesh>

      {/* Wainscoting tường phải */}
      <mesh position={[5.89, 0.6, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[30, 1.2, 0.02]} />
        <meshStandardMaterial color="#eae5dc" roughness={0.5} />
      </mesh>
      <mesh position={[5.87, 1.2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <boxGeometry args={[30, 0.06, 0.04]} />
        <meshStandardMaterial color="#eae5dc" roughness={0.4} />
      </mesh>

      {/* Wainscoting tường trước */}
      <mesh position={[0, 0.6, -14.89]} receiveShadow>
        <boxGeometry args={[11.8, 1.2, 0.02]} />
        <meshStandardMaterial color="#eae5dc" roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.2, -14.87]}>
        <boxGeometry args={[11.8, 0.06, 0.04]} />
        <meshStandardMaterial color="#eae5dc" roughness={0.4} />
      </mesh>

      {/* Wainscoting tường sau */}
      <mesh position={[0, 0.6, 14.89]} receiveShadow>
        <boxGeometry args={[11.8, 1.2, 0.02]} />
        <meshStandardMaterial color="#eae5dc" roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.2, 14.87]}>
        <boxGeometry args={[11.8, 0.06, 0.04]} />
        <meshStandardMaterial color="#eae5dc" roughness={0.4} />
      </mesh>

      {/* Các cột trang trí ốp tường (Pilasters) giả lập thạch cao trắng kem dọc hai bên */}
      {Array.from({ length: 6 }).map((_, idx) => {
        const zPos = -12.5 + idx * 5;
        // Bỏ qua cột ở vị trí vách ngăn trung tâm z = 0
        if (Math.abs(zPos) < 1) return null;

        return (
          <group key={`pilasters-${idx}`}>
            {/* Cột trái */}
            <mesh position={[-5.85, 3, zPos]} castShadow receiveShadow>
              <boxGeometry args={[0.1, 6, 0.4]} />
              <meshStandardMaterial color="#eae5dc" roughness={0.8} />
            </mesh>
            {/* Cột phải */}
            <mesh position={[5.85, 3, zPos]} castShadow receiveShadow>
              <boxGeometry args={[0.1, 6, 0.4]} />
              <meshStandardMaterial color="#eae5dc" roughness={0.8} />
            </mesh>
          </group>
        );
      })}


      {/* 4. CHI TIẾT RIÊNG CHO PHÒNG TRANH (Paintings Gallery Specifics: Central Partition & Console) */}
      {!isSculptures && (
        <group>
          {/* Vách ngăn trung tâm đỏ thẫm tại Z = 0 */}
          <mesh position={[0, 2.0, 0]} castShadow receiveShadow>
            <boxGeometry args={[6.0, 4.0, 0.4]} />
            <meshStandardMaterial 
              color="#8a1923"
              roughness={0.7}
            />
          </mesh>

          {/* Cột trang trí ở rìa vách ngăn trung tâm */}
          <mesh position={[-3.0, 2.0, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.1, 4.0, 0.48]} />
            <meshStandardMaterial color="#eae5dc" roughness={0.8} />
          </mesh>
          <mesh position={[3.0, 2.0, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.1, 4.0, 0.48]} />
            <meshStandardMaterial color="#eae5dc" roughness={0.8} />
          </mesh>

          {/* Ốp chân tường wainscoting cho vách ngăn trung tâm (cả 2 mặt Z = -0.2 và Z = 0.2) */}
          <mesh position={[0, 0.6, -0.21]} receiveShadow>
            <boxGeometry args={[6.0, 1.2, 0.02]} />
            <meshStandardMaterial color="#eae5dc" roughness={0.5} />
          </mesh>
          <mesh position={[0, 1.2, -0.22]}>
            <boxGeometry args={[6.0, 0.06, 0.04]} />
            <meshStandardMaterial color="#eae5dc" roughness={0.4} />
          </mesh>

          <mesh position={[0, 0.6, 0.21]} receiveShadow>
            <boxGeometry args={[6.0, 1.2, 0.02]} />
            <meshStandardMaterial color="#eae5dc" roughness={0.5} />
          </mesh>
          <mesh position={[0, 1.2, 0.22]}>
            <boxGeometry args={[6.0, 0.06, 0.04]} />
            <meshStandardMaterial color="#eae5dc" roughness={0.4} />
          </mesh>

          {/* Bàn Console gỗ cổ điển bên dưới vách ngăn (Z = -0.45 và Z = 0.45) */}
          {/* Mặt trước */}
          <group position={[0, 0, -0.45]}>
            {/* Mặt bàn gỗ tối */}
            <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
              <boxGeometry args={[2.0, 0.1, 0.5]} />
              <meshStandardMaterial color="#3e2723" roughness={0.2} />
            </mesh>
            {/* Chân bàn */}
            <mesh position={[-0.8, 0.35, 0]} castShadow>
              <cylinderGeometry args={[0.08, 0.08, 0.7, 8]} />
              <meshStandardMaterial color="#2d1d19" roughness={0.4} />
            </mesh>
            <mesh position={[0, 0.35, 0.15]} castShadow>
              <cylinderGeometry args={[0.04, 0.04, 0.7, 8]} />
              <meshStandardMaterial color="#2d1d19" roughness={0.4} />
            </mesh>
            <mesh position={[0.8, 0.35, 0]} castShadow>
              <cylinderGeometry args={[0.08, 0.08, 0.7, 8]} />
              <meshStandardMaterial color="#2d1d19" roughness={0.4} />
            </mesh>
            {/* Vật trang trí trên bàn (Tượng kim loại nhỏ) */}
            <mesh position={[0, 0.9, 0]} castShadow>
              <torusKnotGeometry args={[0.1, 0.03, 64, 8]} />
              <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.1} />
            </mesh>
          </group>

          {/* Mặt sau */}
          <group position={[0, 0, 0.45]}>
            <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
              <boxGeometry args={[2.0, 0.1, 0.5]} />
              <meshStandardMaterial color="#3e2723" roughness={0.2} />
            </mesh>
            <mesh position={[-0.8, 0.35, 0]} castShadow>
              <cylinderGeometry args={[0.08, 0.08, 0.7, 8]} />
              <meshStandardMaterial color="#2d1d19" roughness={0.4} />
            </mesh>
            <mesh position={[0, 0.35, -0.15]} castShadow>
              <cylinderGeometry args={[0.04, 0.04, 0.7, 8]} />
              <meshStandardMaterial color="#2d1d19" roughness={0.4} />
            </mesh>
            <mesh position={[0.8, 0.35, 0]} castShadow>
              <cylinderGeometry args={[0.08, 0.08, 0.7, 8]} />
              <meshStandardMaterial color="#2d1d19" roughness={0.4} />
            </mesh>
            <mesh position={[0, 0.9, 0]} castShadow>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.1} />
            </mesh>
          </group>

          {/* Ghế băng dài cổ điển ở giữa 2 khoang (Z = -7.0 và Z = 7.0) */}
          {[-7.0, 7.0].map((zPos, idx) => (
            <group key={`bench-${idx}`} position={[0, 0, zPos]}>
              {/* Đệm ngồi da màu nâu sẫm */}
              <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
                <boxGeometry args={[4.0, 0.15, 1.2]} />
                <meshStandardMaterial color="#4e2c1e" roughness={0.5} />
              </mesh>
              {/* Viền đế bàn gỗ nâng */}
              <mesh position={[0, 0.32, 0]} castShadow receiveShadow>
                <boxGeometry args={[4.1, 0.1, 1.3]} />
                <meshStandardMaterial color="#27150c" roughness={0.3} />
              </mesh>
              {/* Chân ghế trái */}
              <mesh position={[-1.7, 0.15, 0]} castShadow>
                <boxGeometry args={[0.2, 0.3, 1.1]} />
                <meshStandardMaterial color="#1b110b" roughness={0.4} />
              </mesh>
              {/* Chân ghế phải */}
              <mesh position={[1.7, 0.15, 0]} castShadow>
                <boxGeometry args={[0.2, 0.3, 1.1]} />
                <meshStandardMaterial color="#1b110b" roughness={0.4} />
              </mesh>
            </group>
          ))}
        </group>
      )}


      {/* 5. CHI TIẾT RIÊNG CHO PHÒNG ĐIÊU KHẮC (Sculptures Gallery Pedestals) */}
      {/* Đặt 3 bệ tượng tại đúng các tọa độ trong database và collision physics: Z = -8.0, 0.0, 8.0 */}
      {isSculptures && (
        <group>
          {[-8.0, 0.0, 8.0].map((zPos, idx) => (
            <group key={`pedestal-${idx}`} position={[0, 0, zPos]}>
              {/* Thân bệ đỡ: Đá cẩm thạch xám-đen mịn */}
              <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
                <boxGeometry args={[1.0, 1.0, 1.0]} />
                <meshStandardMaterial 
                  color="#26262b" 
                  roughness={0.2}
                  metalness={0.15}
                />
              </mesh>
              
              {/* Viền chỉ vàng chân bệ đỡ */}
              <mesh position={[0, 0.05, 0]} castShadow>
                <boxGeometry args={[1.05, 0.1, 1.05]} />
                <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.1} />
              </mesh>

              {/* Viền chỉ vàng cổ bệ đỡ sát đỉnh */}
              <mesh position={[0, 0.95, 0]} castShadow>
                <boxGeometry args={[1.05, 0.08, 1.05]} />
                <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.1} />
              </mesh>
            </group>
          ))}
        </group>
      )}

      {/* 6. HỆ THỐNG ĐÈN CHÙM / ĐÈN RỌI HÀNH LANG (Hallway Lighting Systems) */}
      {/* Treo các nguồn sáng chung ấm áp dọc theo hành lang để không gian không bị tối tăm */}
      {[-12, -6, 0, 6, 12].map((zPos, idx) => (
        <group key={`hall-light-${idx}`} position={[0, 5.0, zPos]}>
          {/* Đèn downlight phát sáng nhỏ */}
          <mesh>
            <cylinderGeometry args={[0.15, 0.15, 0.1, 12]} />
            <meshStandardMaterial color="#334155" metalness={0.8} />
          </mesh>
          <mesh position={[0, -0.06, 0]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshBasicMaterial color="#fff" />
          </mesh>
          {/* Ánh sáng điểm tạo bầu không khí ấm cúng */}
          <pointLight 
            intensity={2.8} // Tăng từ 1.2 lên 2.8 cho phòng sáng sủa
            distance={20} // Tăng khoảng cách chiếu sáng
            color="#fff1e0" // Màu ánh sáng ấm sạch/trắng kem sang trọng thay vì cam đậm
            castShadow
            shadow-mapSize-width={512}
            shadow-mapSize-height={512}
          />
        </group>
      ))}
    </group>
  );
};
