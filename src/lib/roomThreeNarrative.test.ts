import { describe, expect, it } from 'vitest';
import {
  ROOM_THREE_DISPLAY_NAME,
  ROOM_THREE_TRANSITION,
  ROOM_THREE_WELCOME,
} from './roomThreeNarrative';

describe('Room Three narrative', () => {
  it('uses the approved display name and transition copy', () => {
    expect(ROOM_THREE_DISPLAY_NAME).toBe('PHÒNG 3: TIẾNG NÓI DÂN TỘC');
    expect(ROOM_THREE_TRANSITION).toEqual({
      roomName: 'PHÒNG 3: TIẾNG NÓI DÂN TỘC',
      period: 'PARIS · 1919',
      description: 'Khôi phục Bản Yêu sách của nhân dân An Nam',
    });
  });

  it('contains the approved quote, mission and exactly four steps', () => {
    expect(ROOM_THREE_WELCOME.quote).toBe('“Một dân tộc muốn cất lên tiếng nói của mình.”');
    expect(ROOM_THREE_WELCOME.mission).toBe(
      'Hãy tìm lại những mảnh nội dung đã thất lạc và khôi phục Bản Yêu sách của nhân dân An Nam.',
    );
    expect(ROOM_THREE_WELCOME.steps).toHaveLength(4);
    expect(ROOM_THREE_WELCOME.flow).toBe(
      'Vào Paris 1919 → Xem video → Tìm mảnh văn kiện → Ghép yêu sách → Đóng dấu gửi tới Hội nghị Versailles → Mở khóa trạm tiếp theo',
    );
  });
});
