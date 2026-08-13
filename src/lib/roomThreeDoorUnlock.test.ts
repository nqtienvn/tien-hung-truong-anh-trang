import { describe, expect, it } from 'vitest';
import { unlockRoomThreeNextDoor } from './roomThreeDoorUnlock';

describe('Room Three next-door unlock', () => {
  it('opens Door 04 toward gallery-market-economy only once', () => {
    const first = unlockRoomThreeNextDoor({});
    expect(first).toEqual({
      opened: true,
      door: { isOpen: true, targetRoom: 'gallery-market-economy' },
    });

    const second = unlockRoomThreeNextDoor({ 'door-room4': first.door });
    expect(second.opened).toBe(false);
    expect(second.door).toEqual(first.door);
  });
});
