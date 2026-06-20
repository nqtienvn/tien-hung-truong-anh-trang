# Giải pháp: Tải sẵn phòng, ẩn đi, hiện khi admin mở cửa

## 1. Ý tưởng

Thay vì mount/unmount `DynamicRoom` mỗi khi admin mở/đóng cửa (cách đang làm hiện tại), tải sẵn toàn bộ phòng ngay từ đầu, ẩn đi (`visible={false}`), và chỉ hiện lên khi admin thực sự mở cửa — tránh phải dựng lại hình học/material đúng lúc cần, vốn là nguyên nhân gây giật.

## 2. Cái bẫy: `visible={false}` không "trả tiền" trước phần tốn nhất

Phần gây giật nặng nhất khi mở phòng **không phải** việc React tạo component, mà là:

1. **GPU upload buffer hình học** (178 mesh × dữ liệu vertex/phòng)
2. **Compile/link shader program** cho vật liệu (89 material/phòng)

Cả hai việc này trong three.js đều được làm **lazy (lười)** — chỉ xảy ra lần đầu tiên object đó *thực sự được render* (tức `visible=true` và nằm trong render list của camera). Nếu chỉ mount phòng với `visible={false}`, three.js sẽ **bỏ qua nó hoàn toàn khỏi render list** → chưa upload buffer, chưa compile shader.

> Hậu quả: tưởng đã "tải trước" nhưng GPU thực ra chưa làm gì cả. Đến lúc admin bật `visible=true`, three.js mới bắt đầu upload + compile lần đầu → **giật y như cũ**, chỉ là đổi thời điểm giật từ "lúc mount" sang "lúc bật visible".

## 3. Cách làm đúng: ép compile trước bằng `renderer.compile()`

Three.js có API riêng cho đúng tình huống này — ép GPU upload + compile shader **mà không vẽ ra màn hình**:

```tsx
const { gl, scene, camera } = useThree();

useEffect(() => {
  // Sau khi DynamicRoom đã mount (dù visible=false), ép GPU compile/upload ngay
  gl.compile(scene, camera);
}, [loadedRooms]);
```

Sau khi gọi `gl.compile()`, lúc admin mở cửa, việc bật `visible=true` chỉ là đổi 1 flag JS — gần như miễn phí, không còn giật.

## 4. Đánh đổi cần cân nhắc: máy yếu sẽ tệ hơn

Đây là điểm quan trọng nhất. Nếu tải + compile **toàn bộ** sảnh + 2 phòng (166 + 178 + 178 ≈ 520 mesh, ~180+ material) **ngay lúc vào app**, thì:

- Máy yếu — vốn đã có thể không chạy nổi chỉ riêng cái sảnh (166 mesh) — giờ phải nuốt gấp ~3 lần khối lượng đó **ngay từ giây đầu tiên**, trước khi người dùng kịp làm gì.
- Điều này đi ngược lại hướng sửa cho vấn đề "máy yếu không chạy được" (xem `may-yeu-khong-chay-duoc.md`).

→ Preload-tất-cả-lúc-vào sẽ giải quyết được việc giật khi mở phòng, nhưng **làm nặng thêm** vấn đề máy yếu không vào được.

## 5. Giải pháp đề xuất: preload ngầm, có điều kiện, không chặn lúc vào

Kết hợp cả 2 mục tiêu bằng cách: **không preload ngay lúc vào**, mà preload **sau khi sảnh đã chạy ổn**, và **chỉ trên máy đủ mạnh**.

### 5.1. Preload ngầm lúc rảnh, bỏ qua nếu preset thấp

```tsx
// MuseumContext.tsx
useEffect(() => {
  if (settings.preset === 'low') return; // máy yếu: giữ hành vi cũ, lazy-load khi cần

  // Đợi sảnh render ổn rồi mới preload ngầm lúc rảnh, không chặn UI
  const idleId = requestIdleCallback(() => {
    loadRoom('gallery-paintings');
    loadRoom('gallery-sculptures');
  }, { timeout: 5000 });

  return () => cancelIdleCallback(idleId);
}, [settings.preset]);
```

### 5.2. Đổi `DynamicRoom` từ mount/unmount theo cửa → chỉ đổi `visible`

```tsx
// lobby/page.tsx
<DynamicRoom
  key={room.galleryId}
  room={room}
  offsetZ={offset.z}
  offsetY={offset.y}
  visible={!!doorStates[doorIdOf(room.galleryId)]?.isOpen}  // chỉ đổi visible, không unmount
/>
```

```tsx
// DynamicRoom.tsx
interface DynamicRoomProps {
  room: LoadedRoom;
  offsetZ: number;
  offsetY?: number;
  visible: boolean;
}

export const DynamicRoom: React.FC<DynamicRoomProps> = ({ room, offsetZ, offsetY = 0, visible }) => {
  const { galleryId, exhibits, gallery } = room;
  const customSettings = gallery ? { /* ... */ } : undefined;

  return (
    <group position={[0, offsetY, offsetZ]} visible={visible}>
      <Suspense fallback={null}>
        <ExhibitionRoom galleryId={galleryId} customSettings={customSettings} />
        {exhibits.map((exhibit) => (
          <ExhibitObject key={exhibit.id} exhibit={exhibit} />
        ))}
      </Suspense>
    </group>
  );
};
```

### 5.3. Ép compile ngay sau khi preload xong (không vẽ ra màn hình)

```tsx
// Đặt trong 1 component con bên trong <Canvas>, ví dụ ngay cạnh LobbyCameraController
const RoomPrecompiler: React.FC = () => {
  const { gl, scene, camera } = useThree();
  const { loadedRooms } = useMuseum();

  useEffect(() => {
    if (loadedRooms.length === 0) return;
    gl.compile(scene, camera);
  }, [loadedRooms, gl, scene, camera]);

  return null;
};
```

### 5.4. Lưu ý về va chạm — không cần sửa gì thêm

Logic va chạm (`checkCollision` trong `LobbyPlayer`) hiện đã đúng với cách này: người chơi chỉ đi qua được ngưỡng cửa khi cửa đang mở (kiểm tra `doorStates['door-room1']?.isOpen` trong điều kiện `passingDoor1`/`passingDoor2`). Đổi sang "luôn preload, chỉ ẩn/hiện" **không phá vỡ** phần chặn người chơi vào phòng chưa mở cửa — phòng vẫn `visible=false` nên dù có lỡ đi xuyên qua (về mặt collision) thì cũng không thấy gì, và logic chặn vẫn dựa vào `doorStates`, không dựa vào `loadedRooms`.

## 6. Tóm tắt

| Bước | Mục đích |
|---|---|
| Preload `loadRoom()` ngầm bằng `requestIdleCallback`, chỉ khi `preset !== 'low'` | Tránh làm nặng máy yếu ngay lúc vào app |
| Đổi `DynamicRoom` từ mount/unmount theo cửa → giữ mount, chỉ đổi `visible` | Tránh phải dựng lại hình học mỗi lần mở cửa |
| Gọi `gl.compile(scene, camera)` sau khi phòng được tải | Ép GPU upload buffer + compile shader trước, lúc còn ẩn — đây là bước **bắt buộc**, nếu thiếu thì `visible={false}` không có tác dụng tránh giật |
| Giữ nguyên logic `checkCollision` dựa trên `doorStates` | Không cần sửa, vẫn chặn đúng người chơi khi cửa chưa mở |

**Kết quả mong đợi:** máy đủ mạnh sẽ không còn giật khi admin mở cửa (vì GPU đã compile sẵn từ trước, lúc rảnh); máy yếu vẫn giữ hành vi tải-khi-cần như cũ, không bị preload đè thêm tải ngay từ đầu.
