import React from 'react';
import RoomOne from './rooms/RoomOne';
import RoomTwo from './rooms/RoomTwo';
import RoomSubsidy from './rooms/RoomSubsidy';
import BaseRoom from './rooms/BaseRoom';

interface ExhibitionRoomProps {
  galleryId: string;
  customSettings?: {
    room_width: number;
    room_length: number;
    room_height: number;
    floor_color: string;
    wall_color: string;
    wainscoting_color: string;
    floor_type: 'wood' | 'marble' | 'carpet';
  };
  isVisible?: boolean;
  onRopeClick?: (ropeIndex: number) => void;
}

export const ExhibitionRoom: React.FC<ExhibitionRoomProps> = (props) => {
  const { galleryId } = props;

  if (galleryId === 'gallery-subsidy') {
    return <RoomSubsidy {...props} />;
  }

  if (galleryId === 'gallery-paintings') {
    return <RoomOne {...props} />;
  }

  if (galleryId === 'gallery-sculptures') {
    return <RoomTwo {...props} />;
  }

  // Fallback cho phòng mới trong tương lai
  return <BaseRoom {...props} />;
};

export default ExhibitionRoom;
