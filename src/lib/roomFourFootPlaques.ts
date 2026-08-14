import type { RoomFourStationId } from './roomFourJourney';

/**
 * Phase 12 keeps the short, at-object reading layer separate from the longer
 * documentation in the station form. Each plaque has one historical moment
 * and a single deliberate way into that form.
 */
export interface RoomFourFootPlaqueContent {
  timeVi: string;
  timeEn: string;
  eventVi: string;
  eventEn: string;
}

export const ROOM_FOUR_FOOT_PLAQUES: Readonly<Record<RoomFourStationId, RoomFourFootPlaqueContent>> = {
  s1: {
    timeVi: 'Moscow · 1923',
    timeEn: 'Moscow · 1923',
    eventVi: 'Củng cố lý luận tại Trường Đại học Cộng sản Phương Đông.',
    eventEn: 'Strengthen revolutionary theory at the Communist University of the Toilers of the East.',
  },
  s2: {
    timeVi: '1923-1924',
    timeEn: '1923-1924',
    eventVi: 'Đưa vấn đề thuộc địa lên diễn đàn quốc tế.',
    eventEn: 'Bring the colonial question to international forums.',
  },
  s3: {
    timeVi: '11/1924',
    timeEn: 'Nov 1924',
    eventVi: 'Chuyển từ học hỏi quốc tế sang nhiệm vụ tổ chức.',
    eventEn: 'Move from international learning to an organisational mission.',
  },
  s4: {
    timeVi: 'Quảng Châu · 11/11/1924',
    timeEn: 'Guangzhou · 11 Nov 1924',
    eventVi: 'Bắt đầu ba nhiệm vụ: đào tạo, tổ chức, theo dõi phong trào.',
    eventEn: 'Begin three missions: training, organisation and observing the movement.',
  },
  s5: {
    timeVi: '1925',
    timeEn: '1925',
    eventVi: 'Hình thành hạt nhân và Hội Việt Nam Cách mạng Thanh niên.',
    eventEn: 'Form the nucleus and the Vietnamese Revolutionary Youth League.',
  },
  s6: {
    timeVi: '21/6/1925',
    timeEn: '21 Jun 1925',
    eventVi: 'Báo Thanh Niên truyền bá tư tưởng cách mạng về nước.',
    eventEn: 'Thanh Nien carries revolutionary ideas back to Vietnam.',
  },
  s7: {
    timeVi: '1925-1927',
    timeEn: '1925-1927',
    eventVi: 'Huấn luyện cán bộ và hệ thống hóa bài giảng.',
    eventEn: 'Train cadres and systematise the lessons.',
  },
  s8: {
    timeVi: '1925-1927',
    timeEn: '1925-1927',
    eventVi: 'Liên kết người, báo chí và tư liệu trở về Việt Nam.',
    eventEn: 'Link people, press and documents returning to Vietnam.',
  },
} as const;
