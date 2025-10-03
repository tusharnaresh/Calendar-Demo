import { Event } from '@/data/mockEvents';
import { CardSize, calculateCardSize } from '@/utils/eventCardSizing';
import React from 'react';
import { LargeEvent } from './event-type/LargeEvent';
import { MediumEvent } from './event-type/MediumEvent';
import { SmallEvent } from './event-type/SmallEvent';
import { TinyEvent } from './event-type/TinyEvent';

interface EventCardProps {
  event: Event;
  onPress?: (event: Event) => void;
  size?: CardSize;
  height?: number;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onPress, size, height }) => {
  const cardSize = size || calculateCardSize(event);

  switch (cardSize) {
    case 'tiny':
      return <TinyEvent event={event} onPress={onPress} />;
    case 'small':
      return <SmallEvent event={event} onPress={onPress} />;
    case 'medium':
      return <MediumEvent event={event} onPress={onPress} />;
    case 'large':
      return <LargeEvent event={event} onPress={onPress} />;
    default:
      return <LargeEvent event={event} onPress={onPress} />;
  }
};

export type { CardSize } from '@/utils/eventCardSizing';
