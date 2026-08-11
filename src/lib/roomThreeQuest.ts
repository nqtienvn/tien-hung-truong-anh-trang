export interface RoomThreeFragment {
  id: string;
  title: string;
  description: string;
  sourceLocation: string;
  correctOrder: number;
  collected: boolean;
  position: readonly [number, number, number];
}

export const ROOM_THREE_VIDEO_URL = '/videos/room-three-pillar.mp4';
export const ROOM_THREE_WELCOME_QUOTE = '“Một dân tộc muốn cất lên tiếng nói của mình.”';
export const ROOM_THREE_VIDEO_PROMPT = 'Xem tư liệu: Bản Yêu sách 1919';
export const ROOM_THREE_VIDEO_FOLLOW_UP =
  'Bạn đã nắm được bối cảnh lịch sử. Hãy tìm 8 mảnh yêu sách đang thất lạc trong phòng và mang chúng đến bàn làm việc để khôi phục văn kiện.';
export const ROOM_THREE_DESK_PROMPT = 'Bàn làm việc – Khôi phục Bản Yêu sách';
export const ROOM_THREE_MISSING_FRAGMENT_MESSAGE =
  'Bạn chưa tìm đủ 8 mảnh yêu sách. Hãy tiếp tục tìm trong phòng triển lãm.';
export const ROOM_THREE_PUZZLE_CORRECT_MESSAGE =
  'Chính xác! Một phần của Bản Yêu sách đã được khôi phục.';
export const ROOM_THREE_PUZZLE_INCORRECT_MESSAGE =
  'Mảnh này chưa đúng vị trí. Hãy đọc kỹ nội dung và thử lại.';
export const ROOM_THREE_SUCCESS_MESSAGE =
  'Khôi phục thành công! Bạn đã khôi phục Bản Yêu sách của nhân dân An Nam. Dù chưa được Hội nghị Versailles chấp nhận, văn kiện này đã đưa tiếng nói của nhân dân Việt Nam ra trước dư luận quốc tế và đánh dấu bước chuyển quan trọng trong hành trình tìm đường cứu nước của Nguyễn Ái Quốc.';

export const ROOM_THREE_FRAGMENTS: readonly RoomThreeFragment[] = [
  {
    id: 'legal-equality',
    title: 'Bình đẳng trước pháp luật',
    description: 'Người dân An Nam dưới chế độ thuộc địa bị phân biệt đối xử và không có đầy đủ quyền bình đẳng.',
    sourceLocation: 'Khung ảnh người dân thuộc địa',
    correctOrder: 1,
    collected: false,
    position: [-14.25, 2.7, -8],
  },
  {
    id: 'press-freedom',
    title: 'Tự do báo chí, ngôn luận',
    description: 'Nguyễn Ái Quốc sử dụng báo chí và diễn đàn công khai để đưa tiếng nói của người dân thuộc địa tới dư luận Pháp.',
    sourceLocation: 'Khung ảnh báo chí',
    correctOrder: 2,
    collected: false,
    position: [-14.25, 2.7, 0],
  },
  {
    id: 'assembly-freedom',
    title: 'Tự do lập hội, hội họp',
    description: 'Các phong trào yêu nước cho thấy khát vọng được tổ chức, hội họp và bày tỏ tiếng nói của nhân dân.',
    sourceLocation: 'Khung ảnh phong trào đấu tranh',
    correctOrder: 3,
    collected: false,
    position: [14.25, 2.7, 0],
  },
  {
    id: 'movement-freedom',
    title: 'Tự do cư trú, đi lại',
    description: 'Hành trình từ Đông Dương tới Paris cho thấy khát vọng đi lại, cư trú và tìm kiếm con đường cứu nước.',
    sourceLocation: 'Bản đồ Paris/Đông Dương',
    correctOrder: 4,
    collected: false,
    position: [-7, 2.1, 12.8],
  },
  {
    id: 'indochina-reform',
    title: 'Cải cách pháp lý ở Đông Dương',
    description: 'Bản Yêu sách được gửi tới Hội nghị Versailles, thể hiện mong muốn cải cách pháp lý cho Đông Dương.',
    sourceLocation: 'Phong thư trên bục',
    correctOrder: 5,
    collected: false,
    position: [5.7, 1.25, 10.9],
  },
  {
    id: 'political-prisoners',
    title: 'Thả tù chính trị',
    description: 'Nhiều người yêu nước bị bắt giữ vì hoạt động chính trị trong thời kỳ thuộc địa.',
    sourceLocation: 'Hồ sơ nhà tù/chứng tích',
    correctOrder: 6,
    collected: false,
    position: [7.4, 2.15, 12.4],
  },
  {
    id: 'versailles-representation',
    title: 'Đại diện trong nghị viện Pháp',
    description: 'Sau Chiến tranh thế giới thứ nhất, Hội nghị Versailles được tổ chức để bàn về trật tự thế giới mới.',
    sourceLocation: 'Khung ảnh Hội nghị Versailles',
    correctOrder: 7,
    collected: false,
    position: [14.25, 2.7, -8],
  },
  {
    id: 'legal-code',
    title: 'Thay sắc lệnh bằng luật pháp',
    description: 'Những văn kiện chính trị được soạn thảo và truyền đi bằng chữ viết, báo chí và các bản yêu sách.',
    sourceLocation: 'Bàn máy đánh chữ',
    correctOrder: 8,
    collected: false,
    position: [7.1, 1.3, 10.9],
  },
] as const;

export const ROOM_THREE_INTERACTION_RADIUS = 2.6;
export const ROOM_THREE_DESK_POSITION = [7.1, 0, 10.9] as const;
export const ROOM_THREE_VIDEO_POSITION = [0, 0, 0] as const;
