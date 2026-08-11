import { describe, expect, it } from 'vitest';
import {
  collectFragment,
  evaluateRoomThreePuzzle,
  getCollectedFragmentCount,
  getRoomThreeMissionText,
  findNearestRoomThreeInteraction,
  isCorrectFragmentOrder,
  isFragmentCollected,
  readRoomThreeProgress,
} from './roomThreeQuestState';

const CORRECT_ORDER = [
  'legal-equality',
  'press-freedom',
  'assembly-freedom',
  'movement-freedom',
  'indochina-reform',
  'political-prisoners',
  'versailles-representation',
  'legal-code',
];

describe('Room Three quest state', () => {
  it('counts and checks collected fragments', () => {
    expect(getCollectedFragmentCount([])).toBe(0);
    expect(getCollectedFragmentCount(['legal-equality', 'press-freedom'])).toBe(2);
    expect(isFragmentCollected(['legal-equality'], 'legal-equality')).toBe(true);
    expect(isFragmentCollected(['legal-equality'], 'press-freedom')).toBe(false);
  });

  it('does not collect the same fragment twice', () => {
    expect(collectFragment(['legal-equality'], 'legal-equality'))
      .toEqual(['legal-equality']);
    expect(collectFragment(['legal-equality'], 'press-freedom'))
      .toEqual(['legal-equality', 'press-freedom']);
  });

  it('accepts only the required eight-fragment order', () => {
    expect(isCorrectFragmentOrder(CORRECT_ORDER)).toBe(true);
    expect(isCorrectFragmentOrder([
      'press-freedom',
      ...CORRECT_ORDER.slice(1),
    ])).toBe(false);
  });

  it('evaluates correct and incorrect puzzle submissions', () => {
    expect(evaluateRoomThreePuzzle(CORRECT_ORDER))
      .toEqual({ complete: true, feedback: 'correct' });
    expect(evaluateRoomThreePuzzle(['press-freedom', ...CORRECT_ORDER.slice(1)]))
      .toEqual({ complete: false, feedback: 'incorrect' });
  });

  it('changes the mission text as the player progresses', () => {
    expect(getRoomThreeMissionText(false, 0, false))
      .toBe('Nhiệm vụ: Tìm 8 mảnh yêu sách và khôi phục văn kiện.');
    expect(getRoomThreeMissionText(true, 8, false))
      .toBe('Hãy đến bàn làm việc để ghép lại Bản Yêu sách.');
    expect(getRoomThreeMissionText(true, 8, true))
      .toBe('Hoàn thành: Bản Yêu sách của nhân dân An Nam đã được khôi phục.');
  });

  it('normalizes duplicate IDs when restoring progress', () => {
    expect(readRoomThreeProgress('{"videoViewed":true,"collectedFragments":["legal-equality","legal-equality"],"completed":false}'))
      .toEqual({ videoViewed: true, collectedFragments: ['legal-equality'], completed: false });
  });

  it('returns empty progress for malformed JSON', () => {
    expect(readRoomThreeProgress('{bad json'))
      .toEqual({ videoViewed: false, collectedFragments: [], completed: false });
  });

  it('selects the nearest uncollected fragment within its radius', () => {
    const nearest = findNearestRoomThreeInteraction(
      { x: -14.1, z: 107.7 },
      [
        { kind: 'fragment', id: 'legal-equality', x: -14.25, z: 107.7, radius: 2.6 },
        { kind: 'fragment', id: 'press-freedom', x: -14.25, z: 107.7, radius: 2.6 },
      ],
      [],
    );
    expect(nearest?.kind).toBe('fragment');
    expect(nearest?.id).toBe('legal-equality');
  });

  it('never offers a collected fragment again', () => {
    const nearest = findNearestRoomThreeInteraction(
      { x: -14.1, z: 107.7 },
      [
        { kind: 'fragment', id: 'legal-equality', x: -14.25, z: 107.7, radius: 2.6 },
        { kind: 'fragment', id: 'press-freedom', x: -14.25, z: 107.7, radius: 2.6 },
      ],
      ['legal-equality'],
    );
    expect(nearest?.id).toBe('press-freedom');
  });
});
