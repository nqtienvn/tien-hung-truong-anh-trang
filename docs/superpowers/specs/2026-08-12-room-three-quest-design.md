# Phòng 3 – Paris 1919: Khôi phục Bản Yêu sách

## Mục tiêu

Chuyển riêng Phòng 3 (`gallery-ceramics`) thành trải nghiệm “Paris 1919 – Khôi phục Bản Yêu sách của nhân dân An Nam”: người chơi xem tư liệu tại TV giữa phòng, tìm 8 mảnh yêu sách ở các hiện vật, ghép đúng tại bàn làm việc của Nguyễn Ái Quốc, sau đó đánh dấu nhiệm vụ hoàn thành và mở Cửa số 04 cho tất cả người chơi.

Phạm vi chỉ gồm Phòng 3 và sự kiện mở khóa Cửa số 04. Các phòng, mini-game, dữ liệu nhiệm vụ và quyền admin khác giữ nguyên.

## Kiến trúc được chọn

Sử dụng một lớp nhiệm vụ riêng cho Phòng 3, kết hợp trạng thái cá nhân ở client với sự kiện mở cửa tập trung ở WebSocket server:

- Dữ liệu nội dung, vị trí, mô tả và thứ tự đúng nằm trong một file config riêng.
- `MuseumContext` giữ tiến độ của người chơi hiện tại: đã xem video, các mảnh đã thu thập và đã hoàn thành puzzle. Tiến độ được lưu theo nickname trong `localStorage`.
- `RoomThree` dựng TV hiện có, bàn làm việc mới và tám điểm hiện vật bằng hình học 3D/procedural hiện có. Không tạo hệ thống phòng mới.
- `LobbyPlayer` dùng hệ thống khoảng cách và phím E hiện tại để xác định điểm tương tác trong Phòng 3. Khi modal/puzzle đang mở, người chơi không di chuyển.
- Overlay/HUD và modal puzzle của Phòng 3 là component riêng, không dùng chung `MiniGameModal` của phòng khác.
- Khi người chơi hoàn thành puzzle, client gửi `room3:quest-completed`. Server đặt `door-room4` thành mở và phát `door-opened`/ `door-states` tới mọi client. Tiến độ hoàn thành là của từng người chơi; trạng thái cửa là dùng chung.

## Nội dung và dữ liệu nhiệm vụ

Tạo `src/lib/roomThreeQuest.ts` với kiểu dữ liệu:

```ts
export interface RoomThreeFragment {
  id: string;
  title: string;
  description: string;
  sourceLocation: string;
  correctOrder: number;
  position: readonly [number, number, number];
  collected: boolean;
}
```

Config chứa tám mảnh theo thứ tự đúng:

1. Bình đẳng trước pháp luật
2. Tự do báo chí, ngôn luận
3. Tự do lập hội, hội họp
4. Tự do cư trú, đi lại
5. Cải cách pháp lý ở Đông Dương
6. Thả tù chính trị
7. Đại diện trong nghị viện Pháp
8. Thay sắc lệnh bằng luật pháp

Mỗi mảnh được gắn với vị trí:

| ID | Vị trí hiện vật | Mảnh nhận được |
| --- | --- | --- |
| `versailles-representation` | Khung ảnh Hội nghị Versailles | Đại diện trong nghị viện Pháp |
| `press-freedom` | Khung ảnh báo chí | Tự do báo chí, ngôn luận |
| `legal-equality` | Khung ảnh người dân thuộc địa | Bình đẳng trước pháp luật |
| `assembly-freedom` | Khung ảnh phong trào đấu tranh | Tự do lập hội, hội họp |
| `legal-code` | Máy đánh chữ trên bàn | Thay sắc lệnh bằng luật pháp |
| `indochina-reform` | Phong thư trên bục | Cải cách pháp lý ở Đông Dương |
| `movement-freedom` | Bản đồ Paris/Đông Dương | Tự do cư trú, đi lại |
| `political-prisoners` | Hồ sơ nhà tù/chứng tích | Thả tù chính trị |

Config cũng chứa chính xác tám đoạn mô tả hiện vật do người dùng cung cấp, tên tương tác, thông báo video, thông báo thiếu mảnh, phản hồi puzzle và thông báo hoàn thành. Dữ liệu hiển thị không được rải rác trong component.

## Trải nghiệm 3D

### TV giữa phòng

- Giữ `VideoPillar` bốn mặt và video hiện tại `/videos/room-three-pillar.mp4`.
- Bỏ hành vi tự phát ngay khi bước vào vùng; thay bằng gợi ý phím E: `Xem tư liệu: Bản Yêu sách 1919`.
- Nhấn E phát video trong modal có tiếng trước. Nếu `play()` có tiếng bị trình duyệt từ chối thì phát tắt tiếng và hiện nút `Bật tiếng`.
- Khi video kết thúc hoặc đóng modal, ghi nhận `roomThreeVideoViewed = true` và hiện:

  “Bạn đã nắm được bối cảnh lịch sử. Hãy tìm 8 mảnh yêu sách đang thất lạc trong phòng và mang chúng đến bàn làm việc để khôi phục văn kiện.”

- Video có thể xem lại; xem lại không làm mất mảnh đã thu thập.

### Bàn làm việc của Nguyễn Ái Quốc

- Thay model/máy hồng tại khu vực đối diện TV bằng bàn gỗ procedural.
- Bàn gồm mặt và chân gỗ, bản văn kiện giấy cũ bị rách, máy đánh chữ, bút mực, phong thư, con dấu đỏ, báo cũ, đèn bàn vàng và các mảnh giấy trang trí.
- Khi gần bàn hiện: `Bàn làm việc – Khôi phục Bản Yêu sách`.
- Nhấn E khi chưa đủ mảnh hiện: “Bạn chưa tìm đủ 8 mảnh yêu sách. Hãy tiếp tục tìm trong phòng triển lãm.”
- Nhấn E khi đủ tám mảnh mở puzzle.

### Tám điểm hiện vật

Mỗi điểm có khung/biển hiện vật phù hợp với vị trí quanh tường hoặc bàn. Khi người chơi nằm trong bán kính tương tác, HUD hiện `Nhấn E để xem hiện vật`. Nhấn E mở mô tả ngắn và hành động nhặt mảnh.

- Mảnh đã thu thập không thể nhặt lại.
- Khi nhặt thành công, cập nhật HUD `Mảnh yêu sách: X/8` và thông báo tên mảnh vừa nhận.
- Nếu chưa xem video, người chơi vẫn có thể xem mô tả nhưng HUD hướng quay lại TV trước khi tiếp tục nhiệm vụ.
- Sau khi xem video, khi đủ 8 mảnh HUD đổi thành: “Hãy đến bàn làm việc để ghép lại Bản Yêu sách.”

## Trạng thái và luồng dữ liệu

Thêm vào `MuseumContext` trạng thái riêng, không tái sử dụng `collectedCeramics` của logic cũ:

- `roomThreeVideoViewed: boolean`
- `roomThreeCollectedFragments: string[]`
- `roomThreeCompleted: boolean`
- `markRoomThreeVideoViewed()`
- `collectRoomThreeFragment(id: string)` — idempotent, không thêm trùng
- `completeRoomThreeQuest()` — idempotent, lưu trạng thái và gửi socket event một lần

Tiến độ lưu trong key `roomThreeQuestProgress:<normalizedNickname>`, gồm `videoViewed`, `collectedFragments` và `completed`. Khi reset phiên chỉ xóa đúng key nhiệm vụ này, không xóa dữ liệu phòng khác.

Các hàm thuần để kiểm thử:

- `getCollectedFragmentCount(collectedIds)`
- `isFragmentCollected(collectedIds, id)`
- `isCorrectFragmentOrder(idsInSlots)`
- `getRoomThreeMissionText(videoViewed, collectedCount, completed)`

## Puzzle

Tạo `src/components/ui/RoomThreeQuestModal.tsx`:

- Tiêu đề: `BẢN YÊU SÁCH CỦA NHÂN DÂN AN NAM – 1919`.
- Có tám ô trống đánh số 1–8.
- Chỉ hiển thị tám mảnh đã thu thập, cho phép kéo-thả và click hai mảnh để đổi vị trí.
- Đặt đúng hiện: “Chính xác! Một phần của Bản Yêu sách đã được khôi phục.”
- Đặt sai hiện: “Mảnh này chưa đúng vị trí. Hãy đọc kỹ nội dung và thử lại.”
- Khi đúng cả tám: văn kiện sáng lên, con dấu đỏ `ĐÃ KHÔI PHỤC`, rồi hiện:

  “Khôi phục thành công! Bạn đã khôi phục Bản Yêu sách của nhân dân An Nam. Dù chưa được Hội nghị Versailles chấp nhận, văn kiện này đã đưa tiếng nói của nhân dân Việt Nam ra trước dư luận quốc tế và đánh dấu bước chuyển quan trọng trong hành trình tìm đường cứu nước của Nguyễn Ái Quốc.”

- Nút `Tiếp tục hành trình` đóng modal; nhiệm vụ vẫn ở trạng thái completed.
- Puzzle đã hoàn thành khi mở lại chỉ hiển thị trạng thái hoàn thành, không cho ghi đè kết quả.

## HUD và modal video

Tạo các component UI riêng, đặt cạnh `RoomWelcomeModal` trong lobby:

- `RoomThreeQuestHud`: chỉ hiển thị ở `gallery-ceramics`, gồm tên nhiệm vụ và `Mảnh yêu sách: X/8`.
- `RoomThreeVideoModal`: chỉ mở sau tương tác TV, có video, nút đóng, xử lý tự phát tiếng/tắt tiếng và callback hoàn tất.
- `RoomThreeExhibitModal`: hiển thị mô tả hiện vật và hành động nhặt mảnh.

Các overlay phải tôn trọng `miniGameOpen`, `selectedExhibit` và `transitionLoading`, đồng thời chặn phím E/di chuyển khi đang mở.

## Mở khóa chặng tiếp theo

Trong `ws-server.js` thêm handler `room3:quest-completed`:

1. Nếu `door-room4` chưa mở, đặt `{ isOpen: true, targetRoom: 'gallery-market-economy' }`.
2. Phát `door-opened` và `door-states` tới tất cả client.
3. Nếu cửa đã mở, vẫn trả trạng thái cửa hiện tại cho client gửi để xử lý idempotency.

Không thay đổi handler admin mở/đóng cửa và không xóa quyền điều khiển admin.

## Dữ liệu phòng 3 và va chạm

- Xóa danh sách hiện vật cũ của `gallery-ceramics.json` để không render lại máy arcade màu hồng và nội dung Đổi mới cũ.
- Giữ metadata gallery, kích thước phòng, màu sàn/tường và cấu trúc cửa hiện có.
- Cập nhật va chạm trong `LobbyPlayer` để bỏ vùng máy arcade cũ và thêm vùng bàn làm việc; tám điểm hiện vật chỉ cần vùng tương tác, không cần chặn đường đi.
- Giữ nguyên `VideoPillar` tại tâm phòng, hàng rào và camera hiện tại.

## Kiểm thử

Viết test trước implementation cho config và logic thuần:

- Có đúng tám mảnh và `correctOrder` liên tục từ 1 đến 8.
- Không có id trùng; mỗi mảnh có `sourceLocation` và vị trí.
- Thu thập cùng một id hai lần chỉ cho kết quả một lần.
- Bộ đếm trả đúng 0/8, 1/8 và 8/8.
- Thứ tự đúng được chấp nhận; một hoán đổi sai bị từ chối.
- Mission text đổi đúng theo video, số mảnh và completed.

Kiểm thử tích hợp:

- Handler server mở Cửa số 04 một lần và phát trạng thái tới tất cả client.
- Fallback tiếng hoạt động khi autoplay có tiếng bị từ chối.
- Build không lỗi TypeScript.
- Kiểm tra thủ công: TV → video → tám hiện vật → bàn → puzzle → Cửa số 04.

## Tiêu chí nghiệm thu

- Phòng 3 hiển thị đúng tên `PHÒNG 3: TIẾNG NÓI DÂN TỘC` và câu dẫn “Một dân tộc muốn cất lên tiếng nói của mình.” không lỗi ký tự.
- Máy màu hồng không còn; bàn làm việc lịch sử xuất hiện đối diện TV.
- TV bốn mặt vẫn tồn tại và mở video khi tương tác E.
- Người chơi thu thập đủ tám mảnh, không nhặt trùng, xem tiến độ và ghép đúng thứ tự.
- Puzzle hoàn thành hiển thị dấu đỏ, thông báo hoàn thành và trạng thái completed.
- Cửa số 04 tự mở cho tất cả người chơi sau khi một người hoàn thành.
- Không thay đổi hành vi hoặc dữ liệu gameplay của các phòng khác.
