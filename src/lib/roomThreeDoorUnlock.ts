export const ROOM_THREE_NEXT_DOOR_ID = 'door-room4';
export const ROOM_THREE_NEXT_ROOM_ID = 'gallery-market-economy';

export interface RoomThreeDoorState {
  isOpen: boolean;
  targetRoom: string;
}

export type RoomThreeDoorStates = Record<string, RoomThreeDoorState>;

export function unlockRoomThreeNextDoor(doorStates: RoomThreeDoorStates) {
  const existingDoor = doorStates[ROOM_THREE_NEXT_DOOR_ID];

  if (existingDoor?.isOpen) {
    return { opened: false, door: existingDoor };
  }

  return {
    opened: true,
    door: {
      isOpen: true,
      targetRoom: ROOM_THREE_NEXT_ROOM_ID,
    },
  };
}
