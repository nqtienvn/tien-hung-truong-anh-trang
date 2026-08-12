import spatial from './roomFourSpatial.json';

export type RoomFourStationKind =
  | 'journey-card'
  | 'study-desk'
  | 'forum-globe'
  | 'travel-ticket'
  | 'mission-desk'
  | 'organisation-network'
  | 'printing-press'
  | 'secret-classroom'
  | 'return-map';

export interface RoomFourStationLayout {
  id: 'card' | 's1' | 's2' | 's3' | 's4' | 's5' | 's6' | 's7' | 's8';
  index: number;
  section: 'threshold' | 'soviet' | 'guangzhou';
  kind: RoomFourStationKind;
  object: readonly [number, number];
  stop: readonly [number, number];
  footprint: readonly [number, number];
  dateVi: string;
  dateEn: string;
  titleVi: string;
  titleEn: string;
  purposeVi: string;
  purposeEn: string;
  focalLevel: 1 | 2 | 3;
}

export interface RoomFourCollider {
  id: string;
  center: readonly [number, number];
  size: readonly [number, number];
}

export interface RoomFourPortalLayout {
  id: string;
  z: number;
  halfSpan: number;
  skin: 'cold-frame' | 'warm-wood' | 'warm-frame';
}

export const ROOM_FOUR_SPATIAL = spatial;

export const ROOM_FOUR_CENTERLINE: ReadonlyArray<readonly [number, number]> = [
  [0, -74],
  [-2.8, -70.2],
  [1.8, -63],
  [-0.3, -54.8],
  [1.8, -46.2],
  [0.5, -42],
  [-0.5, -34.8],
  [-1.8, -30.7],
  [0.5, -23.2],
  [-1.6, -16.2],
  [1.3, -8.8],
  [-1.6, -1.3],
  [0, 4],
];

export const ROOM_FOUR_PORTALS: readonly RoomFourPortalLayout[] = [
  { id: 'soviet-threshold', z: -67, halfSpan: 7.7, skin: 'cold-frame' },
  { id: 'transition-cold', z: -42, halfSpan: 4.6, skin: 'cold-frame' },
  { id: 'transition-warm', z: -34, halfSpan: 4.6, skin: 'warm-wood' },
  { id: 'exit-threshold', z: 2, halfSpan: 7.7, skin: 'warm-frame' },
] as const;

export const ROOM_FOUR_STATIONS: readonly RoomFourStationLayout[] = [
  {
    id: 'card',
    index: 0,
    section: 'threshold',
    kind: 'journey-card',
    object: [-5.8, -70.2],
    stop: [-2.8, -70.2],
    footprint: [2.4, 1.4],
    dateVi: '1923–1927',
    dateEn: '1923–1927',
    titleVi: 'Nhận Thẻ hành trình',
    titleEn: 'Collect the Journey Card',
    purposeVi: 'Mang theo hành trang qua tám trạm',
    purposeEn: 'Carry the journey through eight stations',
    focalLevel: 3,
  },
  {
    id: 's1',
    index: 1,
    section: 'soviet',
    kind: 'study-desk',
    object: [4.9, -63],
    stop: [1.8, -63],
    footprint: [3.6, 3.2],
    dateVi: 'Moscow · 1923',
    dateEn: 'Moscow · 1923',
    titleVi: 'Bàn học Moscow',
    titleEn: 'The Moscow study desk',
    purposeVi: 'Học để mở đường',
    purposeEn: 'Learning opens the road',
    focalLevel: 2,
  },
  {
    id: 's2',
    index: 2,
    section: 'soviet',
    kind: 'forum-globe',
    object: [-3.6, -54.8],
    stop: [-0.3, -54.8],
    footprint: [4.4, 4.4],
    dateVi: '1923–1924',
    dateEn: '1923–1924',
    titleVi: 'Diễn đàn Quốc tế',
    titleEn: 'The International forum',
    purposeVi: 'Lý luận · Quan hệ · Phương pháp',
    purposeEn: 'Theory · Relations · Method',
    focalLevel: 1,
  },
  {
    id: 's3',
    index: 3,
    section: 'soviet',
    kind: 'travel-ticket',
    object: [4.9, -46.2],
    stop: [1.8, -46.2],
    footprint: [3.5, 2.6],
    dateVi: '11 · 1924',
    dateEn: '11 · 1924',
    titleVi: 'Vé đi Quảng Châu',
    titleEn: 'Ticket to Guangzhou',
    purposeVi: 'Tư tưởng chuyển thành kế hoạch',
    purposeEn: 'Ideas become a plan',
    focalLevel: 2,
  },
  {
    id: 's4',
    index: 4,
    section: 'guangzhou',
    kind: 'mission-desk',
    object: [-5, -30.7],
    stop: [-1.8, -30.7],
    footprint: [3.3, 2.8],
    dateVi: '11 · 11 · 1924',
    dateEn: '11 · 11 · 1924',
    titleVi: 'Lý Thụy · Ba nhiệm vụ',
    titleEn: 'Ly Thuy · Three missions',
    purposeVi: 'Một căn cứ hoạt động bắt đầu',
    purposeEn: 'A base of operations begins',
    focalLevel: 2,
  },
  {
    id: 's5',
    index: 5,
    section: 'guangzhou',
    kind: 'organisation-network',
    object: [3.9, -23.2],
    stop: [0.5, -23.2],
    footprint: [4.2, 4.2],
    dateVi: '1925',
    dateEn: '1925',
    titleVi: 'Hạt nhân tổ chức',
    titleEn: 'The organisational nucleus',
    purposeVi: 'Lý tưởng trở thành lực lượng',
    purposeEn: 'Ideals become a force',
    focalLevel: 2,
  },
  {
    id: 's6',
    index: 6,
    section: 'guangzhou',
    kind: 'printing-press',
    object: [-5, -16.2],
    stop: [-1.6, -16.2],
    footprint: [3.8, 3],
    dateVi: '21 · 6 · 1925',
    dateEn: '21 · 6 · 1925',
    titleVi: 'Xưởng in Thanh Niên',
    titleEn: 'Thanh Nien printing workshop',
    purposeVi: 'Đưa tư tưởng về nước',
    purposeEn: 'Carrying ideas home',
    focalLevel: 1,
  },
  {
    id: 's7',
    index: 7,
    section: 'guangzhou',
    kind: 'secret-classroom',
    object: [4.7, -8.8],
    stop: [1.3, -8.8],
    footprint: [4, 3.2],
    dateVi: '1925–1927',
    dateEn: '1925–1927',
    titleVi: 'Lớp học bí mật',
    titleEn: 'The clandestine classroom',
    purposeVi: 'Tri thức đi tiếp qua cán bộ',
    purposeEn: 'Knowledge travels through cadres',
    focalLevel: 2,
  },
  {
    id: 's8',
    index: 8,
    section: 'guangzhou',
    kind: 'return-map',
    object: [-4.9, -1.3],
    stop: [-1.6, -1.3],
    footprint: [4.2, 3],
    dateVi: 'Hành trang trở về',
    dateEn: 'The return network',
    titleVi: 'Mạng lưới về Tổ quốc',
    titleEn: 'The network homeward',
    purposeVi: 'Tổ chức · Báo chí · Cán bộ · Mạng lưới',
    purposeEn: 'Organisation · Press · Cadres · Network',
    focalLevel: 1,
  },
] as const;

const COLLIDER_PADDING = 0.35;
const PORTAL_POST_COLLIDER_SIZE: readonly [number, number] = [0.5, 0.62];

export const ROOM_FOUR_PLAYER_COLLISION_MARGIN = 0.28;
export const ROOM_FOUR_WALL_INSET = 0.3;

export const ROOM_FOUR_COLLIDERS: readonly RoomFourCollider[] = [
  ...ROOM_FOUR_STATIONS.map((station) => ({
    id: station.id,
    center: station.object,
    size: [
      station.footprint[0] + COLLIDER_PADDING * 2,
      station.footprint[1] + COLLIDER_PADDING * 2,
    ] as const,
  })),
  { id: 'transition-wing-left-a', center: [-6.6, -40.1], size: [2.5, 0.7] },
  { id: 'transition-wing-right-a', center: [6.6, -38.1], size: [2.5, 0.7] },
  { id: 'transition-wing-left-b', center: [-6.6, -36.1], size: [2.5, 0.7] },
  ...ROOM_FOUR_PORTALS.flatMap((portal) => [
    {
      id: `${portal.id}-left-post`,
      center: [-portal.halfSpan, portal.z] as const,
      size: PORTAL_POST_COLLIDER_SIZE,
    },
    {
      id: `${portal.id}-right-post`,
      center: [portal.halfSpan, portal.z] as const,
      size: PORTAL_POST_COLLIDER_SIZE,
    },
  ]),
] as const;

export function isPointWithinRoomFourBounds(localX: number, localZ: number, margin = 0): boolean {
  const halfWidth = ROOM_FOUR_SPATIAL.roomWidth / 2 - ROOM_FOUR_WALL_INSET - margin;
  return (
    Math.abs(localX) <= halfWidth &&
    localZ >= ROOM_FOUR_SPATIAL.localStartZ + ROOM_FOUR_WALL_INSET + margin &&
    localZ <= ROOM_FOUR_SPATIAL.localEndZ - ROOM_FOUR_WALL_INSET - margin
  );
}

export function isPointInsideRoomFourCollider(localX: number, localZ: number, extraMargin = 0): boolean {
  return ROOM_FOUR_COLLIDERS.some((collider) => {
    const halfWidth = collider.size[0] / 2 + extraMargin;
    const halfDepth = collider.size[1] / 2 + extraMargin;
    return (
      Math.abs(localX - collider.center[0]) < halfWidth &&
      Math.abs(localZ - collider.center[1]) < halfDepth
    );
  });
}

export function worldToRoomFourLocalZ(worldZ: number): number {
  return worldZ - spatial.worldOffsetZ;
}
