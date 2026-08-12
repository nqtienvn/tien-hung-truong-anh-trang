import type { RoomFourStationLayout } from './roomFourLayout';

export type RoomFourStationId = RoomFourStationLayout['id'];
export type RoomFourLanguage = 'vi' | 'en';

export interface RoomFourJourneyStep {
  id: string;
  titleVi: string;
  titleEn: string;
  detailVi: string;
  detailEn: string;
}

export interface RoomFourJourneyNarrative {
  vi: string;
  en: string;
}

/** A fixed, contextual illustration shown above the primary station text. */
export interface RoomFourJourneyIllustration {
  src: string;
  altVi: string;
  altEn: string;
  captionVi: string;
  captionEn: string;
}

export interface RoomFourJourneyContent {
  id: RoomFourStationId;
  eyebrowVi: string;
  eyebrowEn: string;
  leadVi: string;
  leadEn: string;
  illustration?: RoomFourJourneyIllustration;
  historyVi: readonly string[];
  historyEn: readonly string[];
  /** The fixed exhibition rhythm: see → act → witness → understand. */
  before: RoomFourJourneyNarrative;
  action: RoomFourJourneyNarrative;
  after: RoomFourJourneyNarrative;
  meaning: RoomFourJourneyNarrative;
  steps: readonly RoomFourJourneyStep[];
  sealIds: readonly RoomFourSealId[];
}

export type RoomFourSealId =
  | 'theory'
  | 'relations'
  | 'method'
  | 'organisation'
  | 'press'
  | 'cadres'
  | 'network';

export interface RoomFourSeal {
  id: RoomFourSealId;
  labelVi: string;
  labelEn: string;
}

/**
 * The Soviet imprints are deliberately mapped here, rather than inside the
 * scene components, so the causal links remain part of Room Four's journey
 * data. The route always follows the existing floor spine from source to
 * destination; it does not introduce another historical zone.
 */
export interface RoomFourSealLink {
  sourceStationId: RoomFourStationId;
  targetStationIds: readonly RoomFourStationId[];
}

export const ROOM_FOUR_PROGRESS_PREFIX = 'room4:v2:';

export const ROOM_FOUR_SEALS: readonly RoomFourSeal[] = [
  { id: 'theory', labelVi: 'Lý luận', labelEn: 'Theory' },
  { id: 'relations', labelVi: 'Quan hệ', labelEn: 'Relations' },
  { id: 'method', labelVi: 'Phương pháp', labelEn: 'Method' },
  { id: 'organisation', labelVi: 'Tổ chức', labelEn: 'Organisation' },
  { id: 'press', labelVi: 'Báo chí', labelEn: 'Press' },
  { id: 'cadres', labelVi: 'Cán bộ', labelEn: 'Cadres' },
  { id: 'network', labelVi: 'Mạng lưới', labelEn: 'Network' },
] as const;

/**
 * Moscow → Guangzhou cause-and-effect links used by Phase 8.
 *
 * Theory becomes cadre training and the press; international relations become
 * reception and communications; method becomes the Ly Thuy base, clandestine
 * organisation, training, and routes home.
 */
export const ROOM_FOUR_SEAL_LINKS: Readonly<
  Partial<Record<RoomFourSealId, RoomFourSealLink>>
> = {
  theory: {
    sourceStationId: 's1',
    targetStationIds: ['s6', 's7'],
  },
  relations: {
    sourceStationId: 's2',
    targetStationIds: ['s4', 's8'],
  },
  method: {
    sourceStationId: 's2',
    targetStationIds: ['s4', 's5', 's7', 's8'],
  },
} as const;

export const ROOM_FOUR_JOURNEY_ORDER: readonly RoomFourStationId[] = [
  'card',
  's1',
  's2',
  's3',
  's4',
  's5',
  's6',
  's7',
  's8',
] as const;

/** The entrance card begins the experience but is not one of the eight stations. */
export const ROOM_FOUR_STATION_IDS = ROOM_FOUR_JOURNEY_ORDER.slice(1) as readonly RoomFourStationId[];

/**
 * The five outcomes that must remain visible at the Return Map after the
 * finale: learning becomes organisation, press, cadres and a network home.
 */
export const ROOM_FOUR_FINALE_SEAL_IDS = [
  'theory',
  'organisation',
  'press',
  'cadres',
  'network',
] as const satisfies readonly RoomFourSealId[];

export const ROOM_FOUR_JOURNEY_CONTENT: Readonly<Record<RoomFourStationId, RoomFourJourneyContent>> = {
  card: {
    id: 'card',
    eyebrowVi: 'Ngưỡng vào · 1923–1927',
    eyebrowEn: 'Entrance threshold · 1923–1927',
    leadVi: 'Nhận một Thẻ hành trình để mang các dấu ấn từ Moscow đến Quảng Châu.',
    leadEn: 'Collect a Journey Card and carry its imprints from Moscow to Guangzhou.',
    historyVi: [
      'Thẻ không chấm điểm và không đặt câu hỏi đúng–sai. Mỗi trạm mở ra bằng một thao tác khám phá.',
      'Bảy dấu hành trang sẽ cho thấy cách lý luận và quan hệ quốc tế trở thành tổ chức, báo chí, cán bộ và mạng lưới trở về Việt Nam.',
    ],
    historyEn: [
      'The card has no score and no right-or-wrong quiz. Each station opens through an act of discovery.',
      'Seven imprints reveal how theory and international relations became organisation, press, cadres and a network returning to Vietnam.',
    ],
    before: {
      vi: 'Một Thẻ hành trình còn trống đang chờ nhận ở ngưỡng vào.',
      en: 'A blank Journey Card waits at the entrance threshold.',
    },
    action: {
      vi: 'Nhận Thẻ hành trình 1923–1927',
      en: 'Collect the 1923–1927 Journey Card',
    },
    after: {
      vi: 'Đường sáng trên Thẻ trùng với đường dẫn dưới sàn.',
      en: 'The line on the card now matches the illuminated route on the floor.',
    },
    meaning: {
      vi: 'Hành trình bắt đầu: học hỏi để chuẩn bị trở về.',
      en: 'The journey begins: learning in preparation for the return.',
    },
    steps: [
      {
        id: 'collect-card',
        titleVi: 'Nhận Thẻ',
        titleEn: 'Collect the card',
        detailVi: 'Đường sáng trên Thẻ trùng với đường dẫn dưới sàn.',
        detailEn: 'The line on the card now matches the illuminated route on the floor.',
      },
    ],
    sealIds: [],
  },
  s1: {
    id: 's1',
    eyebrowVi: 'Trạm 01 · Moscow · 1923',
    eyebrowEn: 'Station 01 · Moscow · 1923',
    leadVi: 'Một lớp học ngắn hạn ở Moscow mở đầu cho hành trình chuẩn bị trở về.',
    leadEn: 'A short course in Moscow begins the preparation for the journey home.',
    illustration: {
      src: '/images/room4/station1/communist-university-toilers-east-archive.png',
      altVi: 'Ảnh tư liệu mặt tiền Trường Đại học Cộng sản của những người lao động Phương Đông tại Moscow.',
      altEn: 'Historical image of the facade of the Communist University of the Toilers of the East in Moscow.',
      captionVi: 'Ảnh tư liệu Trường Đại học Cộng sản của những người lao động Phương Đông tại Moscow.',
      captionEn: 'Historical image of the Communist University of the Toilers of the East in Moscow.',
    },
    historyVi: [
      'Cuối năm 1923, Nguyễn Ái Quốc vào học lớp ngắn hạn tại Trường Đại học Cộng sản của những người lao động Phương Đông ở Moscow.',
      'Thành lập ngày 21/4/1921, trường đào tạo cán bộ cách mạng cho các nước thuộc địa và phụ thuộc.',
    ],
    historyEn: [
      'In late 1923, Nguyen Ai Quoc took a short course at the Communist University of the Toilers of the East in Moscow.',
      'Founded on 21 April 1921, the school trained revolutionary cadres from colonial and dependent countries.',
    ],
    before: {
      vi: 'Ba quyển sách khép trong không gian học tập ở Moscow.',
      en: 'Three closed books wait in the Moscow learning space.',
    },
    action: {
      vi: 'Mở lần lượt ba quyển sách',
      en: 'Open the three books in sequence',
    },
    after: {
      vi: 'Sách mở, trang ghi chú và ba dấu ánh sáng cùng xuất hiện.',
      en: 'Open pages, note sheets and three light marks appear together.',
    },
    meaning: {
      vi: 'Học để mở đường.',
      en: 'Learning opens the road.',
    },
    steps: [
      {
        id: 'theory',
        titleVi: 'Học lý luận',
        titleEn: 'Study theory',
        detailVi: 'Hệ thống hóa các nguyên lý cách mạng thành một phương pháp nhận thức.',
        detailEn: 'Systematise revolutionary principles into a method of understanding.',
      },
      {
        id: 'soviet-practice',
        titleVi: 'Nghiên cứu thực tiễn',
        titleEn: 'Study Soviet practice',
        detailVi: 'Đối chiếu lý luận với cách một nhà nước Xô-viết vận hành trong thực tế.',
        detailEn: 'Compare theory with the practical operation of a Soviet state.',
      },
      {
        id: 'colonial-peoples',
        titleVi: 'Kết nối các dân tộc thuộc địa',
        titleEn: 'Connect colonised peoples',
        detailVi: 'Đặt vấn đề Việt Nam trong mối liên hệ với phong trào giải phóng thuộc địa.',
        detailEn: 'Place Vietnam within the wider movement for colonial liberation.',
      },
    ],
    sealIds: ['theory'],
  },
  s2: {
    id: 's2',
    eyebrowVi: 'Trạm 02 · Diễn đàn Quốc tế · 1923–1924',
    eyebrowEn: 'Station 02 · International forum · 1923–1924',
    leadVi: 'Tư liệu hình ảnh tại Đại hội lần thứ V của Quốc tế Cộng sản, tổ chức ở Moskva năm 1924.',
    leadEn: 'A photographic document from the Fifth Congress of the Communist International in Moscow, 1924.',
    illustration: {
      src: '/images/room4/station2/nguyen-ai-quoc-comintern-v-modal.png',
      altVi: 'Ảnh tư liệu Nguyễn Ái Quốc cùng các đại biểu tại Đại hội lần thứ V của Quốc tế Cộng sản ở Moskva năm 1924.',
      altEn: 'Historical image of Nguyen Ai Quoc with delegates at the Fifth Congress of the Communist International in Moscow, 1924.',
      captionVi: 'Ảnh tư liệu tại Đại hội lần thứ V của Quốc tế Cộng sản, Moskva, năm 1924.',
      captionEn: 'Historical image from the Fifth Congress of the Communist International, Moscow, 1924.',
    },
    historyVi: [
      'Tại diễn đàn này, Người đã dũng cảm, thẳng thắn phê phán một số đảng cộng sản ở các nước chính quốc chưa quan tâm đúng mức đến vấn đề thuộc địa, đồng thời khẳng định mạnh mẽ vai trò của cách mạng giải phóng dân tộc ở các nước bị áp bức.',
    ],
    historyEn: [
      'At this forum, he courageously and candidly criticised some communist parties in the metropoles for failing to give due attention to the colonial question, while strongly affirming the role of national liberation revolutions in oppressed countries.',
    ],
    before: {
      vi: 'Hình ảnh lãnh tụ Nguyễn Ái Quốc (Chủ tịch Hồ Chí Minh) tham dự và phát biểu tại Đại hội lần thứ V của Quốc tế Cộng sản tổ chức ở Moskva năm 1924.',
      en: 'Nguyen Ai Quoc (President Ho Chi Minh) attending and speaking at the Fifth Congress of the Communist International in Moscow, 1924.',
    },
    action: {
      vi: 'Mở lần lượt ba mốc tư liệu trên màn hình',
      en: 'Open the three documentary entries on the screen in sequence',
    },
    after: {
      vi: 'Ba đèn tín hiệu dưới màn hình sáng lên, làm rõ mối liên hệ giữa chính quốc và các dân tộc thuộc địa.',
      en: 'Three status lights beneath the screen illuminate, clarifying the link between the metropole and colonised peoples.',
    },
    meaning: {
      vi: 'Quan hệ và phương pháp mở rộng con đường thuộc địa.',
      en: 'Relations and method broaden the colonial road.',
    },
    steps: [
      {
        id: 'peasant-international',
        titleVi: 'Quốc tế Nông dân · 17/10/1923',
        titleEn: 'Peasant International · 17 Oct 1923',
        detailVi: 'Một vị trí trong Đoàn Chủ tịch tạo thêm kênh kết nối với phong trào nông dân quốc tế.',
        detailEn: 'A place on the Presidium opened another channel to the international peasant movement.',
      },
      {
        id: 'comintern-v',
        titleVi: 'Đại hội V Quốc tế Cộng sản · 23/6/1924',
        titleEn: 'Fifth Comintern Congress · 23 Jun 1924',
        detailVi: 'Vấn đề thuộc địa được đặt trong chiến lược chung của cách mạng thế giới.',
        detailEn: 'The colonial question was placed within the shared strategy of world revolution.',
      },
      {
        id: 'red-labour-unions',
        titleVi: 'Quốc tế Công hội Đỏ · 21/7/1924',
        titleEn: 'Red International of Labour Unions · 21 Jul 1924',
        detailVi: 'Tình hình công nhân Đông Dương được đưa ra một diễn đàn quốc tế.',
        detailEn: 'The condition of Indochinese workers entered an international forum.',
      },
    ],
    sealIds: ['relations', 'method'],
  },
  s3: {
    id: 's3',
    eyebrowVi: 'Trạm 03 · Vé đi Quảng Châu · 11/1924',
    eyebrowEn: 'Station 03 · Ticket to Guangzhou · Nov 1924',
    leadVi: 'Một con dấu biến hành trang lý luận thành nhiệm vụ tổ chức cách mạng Việt Nam.',
    leadEn: 'A single stamp turns theoretical preparation into a mission to organise the Vietnamese revolution.',
    historyVi: [
      'Tháng 11/1924, Nguyễn Ái Quốc được cử đến Quảng Châu với tư cách Ủy viên Ban Phương Đông Quốc tế Cộng sản và Ủy viên Đoàn Chủ tịch Quốc tế Nông dân.',
    ],
    historyEn: [
      'In November 1924, Nguyen Ai Quoc was sent to Guangzhou as a member of the Eastern Bureau of the Communist International and of the Presidium of the Peasant International.',
    ],
    before: {
      vi: 'Tấm vé Quảng Châu chưa có dấu khởi hành.',
      en: 'The Guangzhou ticket has not yet received its departure stamp.',
    },
    action: {
      vi: 'Đóng dấu lên vé Quảng Châu',
      en: 'Stamp the Guangzhou ticket',
    },
    after: {
      vi: 'Vé dịch về phía đường sáng và hiện mốc 11/1924.',
      en: 'The ticket shifts toward the light route and reveals Nov 1924.',
    },
    meaning: {
      vi: 'Lý luận trở thành nhiệm vụ.',
      en: 'Theory becomes a mission.',
    },
    steps: [
      {
        id: 'stamp-ticket',
        titleVi: 'Đóng dấu · Quảng Châu — 11/1924',
        titleEn: 'Stamp · Guangzhou — Nov 1924',
        detailVi: 'Vé hành trình kích hoạt đường sáng xuyên qua vùng chuyển cảnh.',
        detailEn: 'The journey ticket activates the illuminated route through the transition.',
      },
    ],
    sealIds: [],
  },
  s4: {
    id: 's4',
    eyebrowVi: 'Trạm 04 · Lý Thụy · 11/11/1924',
    eyebrowEn: 'Station 04 · Ly Thuy · 11 Nov 1924',
    leadVi: 'Bàn làm việc mở ba nhiệm vụ cùng hướng về việc xây dựng lực lượng cách mạng.',
    leadEn: 'The command desk opens three missions, all directed toward building a revolutionary force.',
    historyVi: [
      'Nguyễn Ái Quốc đến Quảng Châu ngày 11/11/1924 với bí danh Lý Thụy.',
      'Danh nghĩa công khai của Người là cán bộ phiên dịch trong phái bộ Bôrôđin của Liên Xô.',
    ],
    historyEn: [
      'Nguyen Ai Quoc arrived in Guangzhou on 11 November 1924 under the alias Ly Thuy.',
      'His public role was as an interpreter in Borodin’s Soviet mission.',
    ],
    before: {
      vi: 'Ba phong bì niêm phong nằm trên bàn làm việc của Lý Thụy.',
      en: 'Three sealed envelopes lie on Ly Thuy’s work desk.',
    },
    action: {
      vi: 'Mở ba phong bì niêm phong',
      en: 'Open the three sealed envelopes',
    },
    after: {
      vi: 'Ba tia dẫn mở ra ba nhiệm vụ từ cùng một bàn làm việc.',
      en: 'Three guiding rays open three missions from one work desk.',
    },
    meaning: {
      vi: 'Đào tạo, tổ chức, theo dõi phong trào.',
      en: 'Train, organise and observe the movement.',
    },
    steps: [
      {
        id: 'train-youth',
        titleVi: 'Đào tạo thanh niên',
        titleEn: 'Train young people',
        detailVi: 'Chuẩn bị một lực lượng có lý luận, phương pháp và khả năng hoạt động.',
        detailEn: 'Prepare a force with theory, method and the capacity to act.',
      },
      {
        id: 'build-organisation',
        titleVi: 'Xây dựng tổ chức',
        titleEn: 'Build an organisation',
        detailVi: 'Tạo hạt nhân để tập hợp, phân công và duy trì hoạt động lâu dài.',
        detailEn: 'Create a nucleus capable of gathering, assigning and sustaining long-term work.',
      },
      {
        id: 'observe-report',
        titleVi: 'Theo dõi và báo cáo',
        titleEn: 'Observe and report',
        detailVi: 'Theo dõi phong trào Trung Quốc và Đông Nam Á, báo cáo Quốc tế Cộng sản.',
        detailEn: 'Observe movements in China and Southeast Asia and report to the Communist International.',
      },
    ],
    sealIds: [],
  },
  s5: {
    id: 's5',
    eyebrowVi: 'Trạm 05 · Hạt nhân tổ chức · 1925',
    eyebrowEn: 'Station 05 · Organisational nucleus · 1925',
    leadVi: 'Những điểm sáng rời rạc được nối theo thứ tự để hình thành một mạng lưới.',
    leadEn: 'Separate points of light connect in sequence to form an organisation and a network.',
    historyVi: [
      'Đầu năm 1925, từ các thành viên tích cực của Tâm Tâm xã hình thành nhóm bí mật, tức Cộng sản đoàn.',
      'Tháng 6/1925, Nguyễn Ái Quốc thành lập Hội Việt Nam Cách mạng Thanh niên.',
    ],
    historyEn: [
      'In early 1925, active members of Tam Tam Xa formed a secret group, the Communist Youth Group.',
      'In June 1925, Nguyen Ai Quoc founded the Vietnamese Revolutionary Youth League.',
    ],
    before: {
      vi: 'Những điểm sáng rời rạc chưa tạo thành một tổ chức.',
      en: 'Separate points of light have not yet formed an organisation.',
    },
    action: {
      vi: 'Kết nối ba điểm tổ chức theo thứ tự',
      en: 'Connect the three organisational points in sequence',
    },
    after: {
      vi: 'Các điểm nối thành một mạng từ hạt nhân tới cơ sở trong nước.',
      en: 'The points connect into a network from its nucleus to domestic bases.',
    },
    meaning: {
      vi: 'Tổ chức biến lý tưởng thành lực lượng.',
      en: 'Organisation turns an ideal into a force.',
    },
    steps: [
      {
        id: 'communist-group',
        titleVi: 'Cộng sản đoàn',
        titleEn: 'Communist Youth Group',
        detailVi: 'Một nhóm bí mật được tạo từ các thành viên tích cực của Tâm Tâm xã.',
        detailEn: 'A secret group formed from active members of Tam Tam Xa.',
      },
      {
        id: 'youth-league',
        titleVi: 'Hội Việt Nam Cách mạng Thanh niên',
        titleEn: 'Vietnamese Revolutionary Youth League',
        detailVi: 'Tháng 6/1925, hạt nhân được phát triển thành một tổ chức cách mạng.',
        detailEn: 'In June 1925, the nucleus developed into a revolutionary organisation.',
      },
      {
        id: 'domestic-bases',
        titleVi: 'Cơ sở trong nước',
        titleEn: 'Domestic bases',
        detailVi: 'Mạng lưới mở rộng về Việt Nam, nối tổ chức ở Quảng Châu với thực tiễn trong nước.',
        detailEn: 'The network extended into Vietnam, linking the Guangzhou organisation with work at home.',
      },
    ],
    sealIds: ['organisation'],
  },
  s6: {
    id: 's6',
    eyebrowVi: 'Trạm 06 · Báo Thanh Niên · 21/6/1925',
    eyebrowEn: 'Station 06 · Thanh Nien newspaper · 21 Jun 1925',
    leadVi: 'Máy in biến lý luận thành những tờ báo có thể bí mật vượt biên giới.',
    leadEn: 'The press turns theory into printed sheets that can secretly cross borders.',
    historyVi: [
      'Ngày 21/6/1925, số đầu tiên của báo Thanh Niên ra đời tại Quảng Châu.',
      'Báo viết bằng tiếng Việt, truyền bá chủ nghĩa Mác–Lênin, giải thích đường lối cách mạng và được bí mật đưa về nước.',
    ],
    historyEn: [
      'On 21 June 1925, the first issue of Thanh Nien was published in Guangzhou.',
      'Written in Vietnamese, it spread Marxism–Leninism, explained the revolutionary path and was secretly carried back into Vietnam.',
    ],
    before: {
      vi: 'Một tờ giấy trắng nằm trong máy in Thanh Niên.',
      en: 'A blank sheet rests inside the Thanh Nien press.',
    },
    action: {
      vi: 'Kéo cần in số báo đầu tiên',
      en: 'Pull the lever and print the first issue',
    },
    after: {
      vi: 'Số báo Thanh Niên xuất hiện, cùng một tuyến sáng hướng về Việt Nam.',
      en: 'A Thanh Nien issue appears with a light route pointing toward Vietnam.',
    },
    meaning: {
      vi: 'Báo chí đưa tư tưởng về nước.',
      en: 'The press carries ideas home.',
    },
    steps: [
      {
        id: 'print-first-issue',
        titleVi: 'In số báo · 21/6/1925',
        titleEn: 'Print the issue · 21 Jun 1925',
        detailVi: 'Tờ báo ảo rời bàn in, mang ba ý chính theo tuyến liên lạc về Việt Nam.',
        detailEn: 'A virtual newspaper leaves the press, carrying three core ideas along the route to Vietnam.',
      },
    ],
    sealIds: ['press'],
  },
  s7: {
    id: 's7',
    eyebrowVi: 'Trạm 07 · Lớp học bí mật · 1925–1927',
    eyebrowEn: 'Station 07 · Clandestine classroom · 1925–1927',
    leadVi: 'Bốn thẻ bài giảng cho thấy tri thức được chuyển thành năng lực hoạt động của cán bộ.',
    leadEn: 'Four lesson cards show knowledge being transformed into the working capacity of cadres.',
    historyVi: [
      'Từ giữa năm 1925 đến trước tháng 4/1927, Hội tổ chức hơn 10 lớp huấn luyện tại Quảng Châu, đào tạo khoảng 75 hội viên.',
      'Các bài giảng sau này được tập hợp thành Đường Kách mệnh, xuất bản năm 1927.',
    ],
    historyEn: [
      'From mid-1925 until before April 1927, the League organised more than ten training courses in Guangzhou for about seventy-five members.',
      'The lectures were later compiled as The Revolutionary Path, published in 1927.',
    ],
    before: {
      vi: 'Bốn thẻ bài giảng còn chờ bên dưới bản đồ.',
      en: 'Four lesson cards wait beneath the map.',
    },
    action: {
      vi: 'Đặt bốn thẻ bài giảng lên bản đồ',
      en: 'Place four lesson cards on the map',
    },
    after: {
      vi: 'Các tuyến Bắc–Trung–Nam Kỳ và Xiêm sáng lên từ những thẻ bài giảng.',
      en: 'Routes to Tonkin, Annam, Cochinchina and Siam light up from the lesson cards.',
    },
    meaning: {
      vi: 'Cán bộ mang tri thức về nước.',
      en: 'Cadres carry knowledge home.',
    },
    steps: [
      {
        id: 'lesson-theory',
        titleVi: 'Lý luận',
        titleEn: 'Theory',
        detailVi: 'Hiểu mục tiêu, lực lượng và con đường của cách mạng.',
        detailEn: 'Understand the aims, forces and path of revolution.',
      },
      {
        id: 'lesson-secrecy',
        titleVi: 'Tổ chức bí mật',
        titleEn: 'Clandestine organisation',
        detailVi: 'Bảo vệ cơ sở, liên lạc và phân công trong điều kiện bí mật.',
        detailEn: 'Protect bases, communications and assignments under clandestine conditions.',
      },
      {
        id: 'lesson-propaganda',
        titleVi: 'Tuyên truyền',
        titleEn: 'Propaganda',
        detailVi: 'Chuyển lý luận thành ngôn ngữ có thể truyền đạt và thuyết phục.',
        detailEn: 'Turn theory into language that can be communicated and understood.',
      },
      {
        id: 'lesson-masses',
        titleVi: 'Vận động quần chúng',
        titleEn: 'Mass mobilisation',
        detailVi: 'Gắn tổ chức với công nhân, nông dân và phong trào trong nước.',
        detailEn: 'Connect the organisation with workers, peasants and movements at home.',
      },
    ],
    sealIds: ['cadres'],
  },
  s8: {
    id: 's8',
    eyebrowVi: 'Trạm 08 · Mạng lưới trở về Tổ quốc',
    eyebrowEn: 'Station 08 · The network homeward',
    leadVi: 'Bốn tuyến liên lạc tổng hợp hành trang thành một mạng lưới trở về Việt Nam.',
    leadEn: 'Four communication routes gather the journey’s preparation into a network returning to Vietnam.',
    historyVi: [
      'Quảng Châu là đầu mối tiếp nhận thanh niên, huấn luyện, đưa cán bộ về nước, chuyển báo chí và liên lạc với Quốc tế Cộng sản.',
      'Các tuyến tiêu biểu đi qua Móng Cái, Lạng Sơn, đường biển qua Hồng Kông và tuyến qua Xiêm.',
    ],
    historyEn: [
      'Guangzhou became a hub for receiving young people, training cadres, sending them home, carrying newspapers and maintaining contact with the Communist International.',
      'Representative routes ran through Mong Cai, Lang Son, by sea through Hong Kong, and through Siam.',
    ],
    before: {
      vi: 'Bốn tuyến liên lạc trên bản đồ vẫn chưa được nối thành mạng.',
      en: 'The four communication routes on the map have not yet joined into a network.',
    },
    action: {
      vi: 'Kích hoạt bốn tuyến liên lạc',
      en: 'Activate the four communication routes',
    },
    after: {
      vi: 'Bản đồ trở thành một mạng kết nối hoàn chỉnh hướng về Tổ quốc.',
      en: 'The map becomes a complete network directed homeward.',
    },
    meaning: {
      vi: 'Mạng lưới đưa hành trang trở về Tổ quốc.',
      en: 'The network brings the journey kit home.',
    },
    steps: [
      {
        id: 'route-mong-cai',
        titleVi: 'Tuyến Móng Cái',
        titleEn: 'Mong Cai route',
        detailVi: 'Một tuyến biên giới đưa người và tài liệu vào miền Bắc Việt Nam.',
        detailEn: 'A border route carried people and documents into northern Vietnam.',
      },
      {
        id: 'route-lang-son',
        titleVi: 'Tuyến Lạng Sơn',
        titleEn: 'Lang Son route',
        detailVi: 'Một hành lang liên lạc khác nối Quảng Châu với cơ sở trong nước.',
        detailEn: 'Another communication corridor linked Guangzhou with domestic bases.',
      },
      {
        id: 'route-hong-kong',
        titleVi: 'Đường biển qua Hồng Kông',
        titleEn: 'Sea route through Hong Kong',
        detailVi: 'Đường biển mở thêm phương thức chuyển báo chí và cán bộ.',
        detailEn: 'The sea route offered another way to move newspapers and cadres.',
      },
      {
        id: 'route-siam',
        titleVi: 'Tuyến qua Xiêm',
        titleEn: 'Route through Siam',
        detailVi: 'Mạng lưới khu vực nối hoạt động ở Quảng Châu với cộng đồng người Việt tại Xiêm.',
        detailEn: 'A regional network linked Guangzhou with Vietnamese communities in Siam.',
      },
    ],
    sealIds: ['network'],
  },
} as const;

export function roomFourStepToken(stationId: RoomFourStationId, stepId: string): string {
  return `${ROOM_FOUR_PROGRESS_PREFIX}step:${stationId}:${stepId}`;
}

export function roomFourCompletionToken(stationId: RoomFourStationId): string {
  return `${ROOM_FOUR_PROGRESS_PREFIX}complete:${stationId}`;
}

export function roomFourSealToken(sealId: RoomFourSealId): string {
  return `${ROOM_FOUR_PROGRESS_PREFIX}seal:${sealId}`;
}

/** Persisted only after the one-time Station 8 convergence has finished. */
export function roomFourFinaleToken(): string {
  return `${ROOM_FOUR_PROGRESS_PREFIX}finale:return-map`;
}

export function isRoomFourJourneyToken(token: string): boolean {
  return token.startsWith(ROOM_FOUR_PROGRESS_PREFIX);
}

export function getNextRoomFourStation(progress: readonly string[]): RoomFourStationId | null {
  return (
    ROOM_FOUR_JOURNEY_ORDER.find(
      (stationId) => !progress.includes(roomFourCompletionToken(stationId)),
    ) ?? null
  );
}

export function getRoomFourStationProgress(
  progress: readonly string[],
  stationId: RoomFourStationId,
): number {
  const station = ROOM_FOUR_JOURNEY_CONTENT[stationId];
  return station.steps.filter((step) => progress.includes(roomFourStepToken(stationId, step.id))).length;
}

/**
 * Phase 9 guard. A finale can never be unlocked by merely finishing the four
 * map routes: every one of the eight stations must already be complete.
 */
export function isRoomFourFinaleReady(progress: readonly string[]): boolean {
  return ROOM_FOUR_STATION_IDS.every((stationId) =>
    progress.includes(roomFourCompletionToken(stationId)),
  );
}
