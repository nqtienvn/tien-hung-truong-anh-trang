import { describe, expect, it } from 'vitest';
import { ROOM_THREE_FRAGMENTS } from './roomThreeQuest';

describe('Room Three quest configuration', () => {
  it('defines eight fragments in reconstruction order', () => {
    expect(ROOM_THREE_FRAGMENTS).toHaveLength(8);
    expect(ROOM_THREE_FRAGMENTS.map((fragment) => fragment.correctOrder))
      .toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(new Set(ROOM_THREE_FRAGMENTS.map((fragment) => fragment.id)).size).toBe(8);
  });

  it('maps every fragment to a source location and 3D position', () => {
    for (const fragment of ROOM_THREE_FRAGMENTS) {
      expect(fragment.sourceLocation.length).toBeGreaterThan(0);
      expect(fragment.position).toHaveLength(3);
      expect(fragment.description.length).toBeGreaterThan(0);
    }
  });
});
