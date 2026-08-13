import {
  ROOM_THREE_FRAGMENTS,
  RoomThreeInteractionPoint,
} from './roomThreeQuest';

export interface RoomThreeProgress {
  videoViewed: boolean;
  collectedFragments: string[];
  completed: boolean;
}

export type PuzzleFeedback = 'correct' | 'incorrect';

const EMPTY_PROGRESS: RoomThreeProgress = {
  videoViewed: false,
  collectedFragments: [],
  completed: false,
};

const knownFragmentIds = new Set(ROOM_THREE_FRAGMENTS.map((fragment) => fragment.id));

export const getCollectedFragmentCount = (ids: readonly string[]): number => (
  new Set(ids.filter((id) => knownFragmentIds.has(id))).size
);

export const isFragmentCollected = (ids: readonly string[], id: string): boolean => (
  ids.includes(id)
);

export const collectFragment = (ids: readonly string[], id: string): string[] => {
  if (!knownFragmentIds.has(id) || ids.includes(id)) return [...ids];
  return [...ids, id];
};

export const isCorrectFragmentOrder = (idsInSlots: readonly string[]): boolean => {
  if (idsInSlots.length !== ROOM_THREE_FRAGMENTS.length) return false;

  const orderById = new Map(ROOM_THREE_FRAGMENTS.map((fragment) => [fragment.id, fragment.correctOrder]));
  return idsInSlots.every((id, index) => orderById.get(id) === index + 1)
    && new Set(idsInSlots).size === ROOM_THREE_FRAGMENTS.length;
};

export const evaluateRoomThreePuzzle = (idsInSlots: readonly string[]) => ({
  complete: isCorrectFragmentOrder(idsInSlots),
  feedback: isCorrectFragmentOrder(idsInSlots) ? 'correct' as const : 'incorrect' as const,
});

export const getRoomThreeMissionText = (
  videoViewed: boolean,
  count: number,
  completed: boolean,
): string => {
  if (completed) return 'Hoàn thành: Bản Yêu sách của nhân dân An Nam đã được khôi phục.';
  if (videoViewed && count >= ROOM_THREE_FRAGMENTS.length) {
    return 'Hãy đến bàn làm việc để ghép lại Bản Yêu sách.';
  }
  return 'Nhiệm vụ: Tìm 8 mảnh yêu sách và khôi phục văn kiện.';
};

export const readRoomThreeProgress = (raw: string | null): RoomThreeProgress => {
  if (!raw) return { ...EMPTY_PROGRESS, collectedFragments: [] };

  try {
    const parsed = JSON.parse(raw) as Partial<RoomThreeProgress>;
    const collectedFragments = Array.isArray(parsed.collectedFragments)
      ? [...new Set(parsed.collectedFragments.filter((id): id is string => (
        typeof id === 'string' && knownFragmentIds.has(id)
      )))]
      : [];

    return {
      videoViewed: parsed.videoViewed === true,
      collectedFragments,
      completed: parsed.completed === true,
    };
  } catch {
    return { ...EMPTY_PROGRESS, collectedFragments: [] };
  }
};

export const getRoomThreeVideoCompletionState = (reason: 'closed' | 'ended' | 'other') => ({
  viewed: reason === 'closed' || reason === 'ended',
});

export const findNearestRoomThreeInteraction = (
  player: { x: number; z: number },
  points: readonly RoomThreeInteractionPoint[],
  collectedIds: readonly string[],
): RoomThreeInteractionPoint | null => {
  const collected = new Set(collectedIds);
  let nearest: RoomThreeInteractionPoint | null = null;
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (const point of points) {
    if (point.kind === 'fragment' && point.id && collected.has(point.id)) continue;
    const distance = Math.hypot(player.x - point.x, player.z - point.z);
    if (distance <= point.radius && distance < nearestDistance) {
      nearest = point;
      nearestDistance = distance;
    }
  }

  return nearest;
};
