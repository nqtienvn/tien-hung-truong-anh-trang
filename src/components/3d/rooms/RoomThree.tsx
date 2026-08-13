import React from 'react';
import { BaseRoom, BaseRoomProps } from './BaseRoom';
import { VideoPillar } from '../VideoPillar';
import { RoomThreeQuestSet } from './RoomThreeQuestSet';

/**
 * Room Three deliberately inherits the same clear BaseRoom shell as Room Two.
 * Its only room-specific meshes are the quest exhibits and video pillar, which
 * keeps the route through the room open and the task objects easy to identify.
 */
export const RoomThree: React.FC<BaseRoomProps> = ({
  galleryId,
  customSettings,
  isVisible = true,
}) => (
  <BaseRoom
    galleryId={galleryId}
    customSettings={customSettings}
    isVisible={isVisible}
  >
    <VideoPillar />
    <RoomThreeQuestSet isVisible={isVisible} />
  </BaseRoom>
);

export default RoomThree;
