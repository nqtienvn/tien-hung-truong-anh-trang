export const ROOM_THREE_DISPLAY_NAME = 'PHÒNG 3: TIẾNG NÓI DÂN TỘC';

export const ROOM_THREE_TRANSITION = {
  roomName: ROOM_THREE_DISPLAY_NAME,
  period: 'PARIS · 1919',
  description: 'Khôi phục Bản Yêu sách của nhân dân An Nam',
} as const;

export const ROOM_THREE_WELCOME = {
  quote: '“Một dân tộc muốn cất lên tiếng nói của mình.”',
  mission: 'Hãy tìm lại những mảnh nội dung đã thất lạc và khôi phục Bản Yêu sách của nhân dân An Nam.',
  steps: [
    {
      title: 'Vào phòng Paris 1919, đọc bối cảnh.',
      description: 'Bắt đầu bằng việc đọc kỹ bối cảnh lịch sử và mục tiêu của nhiệm vụ.',
    },
    {
      title: 'Xem video về Bản Yêu sách.',
      description: 'Đến trụ màn hình trung tâm để xem video tư liệu về Bản Yêu sách.',
    },
    {
      title: 'Tìm các mảnh văn kiện trong phòng.',
      description: 'Khám phá các hiện vật và thu thập những mảnh nội dung đã thất lạc.',
    },
    {
      title: 'Ghép đúng mục lục/yêu sách để hoàn thành văn kiện.',
      description: 'Sắp xếp đúng nội dung, đóng dấu gửi tới Hội nghị Versailles và mở khóa trạm tiếp theo.',
    },
  ],
  flow: 'Vào Paris 1919 → Xem video → Tìm mảnh văn kiện → Ghép yêu sách → Đóng dấu gửi tới Hội nghị Versailles → Mở khóa trạm tiếp theo',
} as const;
