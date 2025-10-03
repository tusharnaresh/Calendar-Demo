import { Event } from '@/data/mockEvents';

export type CardSize = 'large' | 'medium' | 'small' | 'tiny';

/**
 * Calculate card size based on event duration
 * @param event - Event object with startTime and endTime
 * @returns CardSize based on duration
 */
export const calculateCardSize = (event: Event): CardSize => {
  const durationMinutes = (event.endTime - event.startTime) / (1000 * 60);
  
  // Map duration to size:
  // >= 90 minutes: large
  // >= 45 minutes: medium
  // >= 20 minutes: small
  // < 20 minutes: tiny
  
  if (durationMinutes >= 90) {
    return 'large';
  } else if (durationMinutes >= 45) {
    return 'medium';
  } else if (durationMinutes >= 20) {
    return 'small';
  } else {
    return 'tiny';
  }
};

/**
 * Get event duration in minutes
 */
export const getEventDurationMinutes = (event: Event): number => {
  return (event.endTime - event.startTime) / (1000 * 60);
};
