import { ColorSchemeName } from './eventColorSchemes';

/**
 * Event color enum type from API
 * These match the EVENT_COLOR_* values used in the web calendar
 */
export type EventColorEnum =
  | 'EVENT_COLOR_ONE'
  | 'EVENT_COLOR_TWO'
  | 'EVENT_COLOR_THREE'
  | 'EVENT_COLOR_FOUR'
  | 'EVENT_COLOR_FIVE'
  | 'EVENT_COLOR_SIX'
  | 'EVENT_COLOR_SEVEN'
  | 'EVENT_COLOR_EIGHT'
  | 'EVENT_COLOR_NINE'
  | 'EVENT_COLOR_TEN';

/**
 * Map EVENT_COLOR_* enum values to color scheme names
 * This matches the web calendar's colorSwatchUtil.js mapping exactly
 */
const EVENT_COLOR_TO_SCHEME_MAP: Record<EventColorEnum, ColorSchemeName> = {
  EVENT_COLOR_ONE: 'internal-event',   // Light Blue #5EB0F8
  EVENT_COLOR_TWO: 'red',               // Red #DA3A00
  EVENT_COLOR_THREE: 'orange',          // Orange #FF8A35
  EVENT_COLOR_FOUR: 'yellow',           // Yellow #FFC700
  EVENT_COLOR_FIVE: 'violet',           // Violet #512FB1
  EVENT_COLOR_SIX: 'deep-blue',         // Deep Blue #007CEA
  EVENT_COLOR_SEVEN: 'maroon',          // Maroon/Brown #8E4C1B
  EVENT_COLOR_EIGHT: 'grey',            // Grey #C0C0C0
  EVENT_COLOR_NINE: 'dark-green',       // Dark Green #007178
  EVENT_COLOR_TEN: 'green',             // Green #3EAD85
};

/**
 * Hex color values for each EVENT_COLOR_* enum
 * These are the exact colors from the web calendar's eventSwatchColors array
 */
export const EVENT_COLOR_HEX_MAP: Record<EventColorEnum, string> = {
  EVENT_COLOR_ONE: '#5EB0F8',
  EVENT_COLOR_TWO: '#DA3A00',
  EVENT_COLOR_THREE: '#FF8A35',
  EVENT_COLOR_FOUR: '#FFC700',
  EVENT_COLOR_FIVE: '#512FB1',
  EVENT_COLOR_SIX: '#007CEA',
  EVENT_COLOR_SEVEN: '#8E4C1B',
  EVENT_COLOR_EIGHT: '#C0C0C0',
  EVENT_COLOR_NINE: '#007178',
  EVENT_COLOR_TEN: '#3EAD85',
};

/**
 * User-friendly names for each color
 * Matching the web calendar's ENUMTOColorNamesMap
 */
export const EVENT_COLOR_NAME_MAP: Record<EventColorEnum, string> = {
  EVENT_COLOR_ONE: 'light blue',
  EVENT_COLOR_TWO: 'red',
  EVENT_COLOR_THREE: 'orange',
  EVENT_COLOR_FOUR: 'yellow',
  EVENT_COLOR_FIVE: 'violet',
  EVENT_COLOR_SIX: 'blue',
  EVENT_COLOR_SEVEN: 'brown',
  EVENT_COLOR_EIGHT: 'grey',
  EVENT_COLOR_NINE: 'dark green',
  EVENT_COLOR_TEN: 'green',
};

/**
 * Map an EVENT_COLOR_* enum value to a color scheme name
 * This function replicates the logic from web calendar's getEventMappedColor()
 * 
 * @param eventColor - The EVENT_COLOR_* value from API (e.g., 'EVENT_COLOR_ONE')
 * @returns The corresponding color scheme name (e.g., 'internal-event')
 */
export const mapEventColorToScheme = (
  eventColor?: string
): ColorSchemeName => {
  if (!eventColor) {
    return 'internal-event'; // Default to EVENT_COLOR_ONE equivalent
  }

  // Extract the color number from the enum (e.g., 'ONE' from 'EVENT_COLOR_ONE')
  const colorVariation = eventColor.split('_')[2];
  
  switch (colorVariation) {
    case 'ONE':
      return 'internal-event';
    case 'TWO':
      return 'red';
    case 'THREE':
      return 'orange';
    case 'FOUR':
      return 'yellow';
    case 'FIVE':
      return 'violet';
    case 'SIX':
      return 'deep-blue';
    case 'SEVEN':
      return 'maroon';
    case 'EIGHT':
      return 'grey';
    case 'NINE':
      return 'dark-green';
    case 'TEN':
      return 'green';
    default:
      return 'internal-event'; // Fallback to default
  }
};

/**
 * Get the hex color value for an EVENT_COLOR_* enum
 * 
 * @param eventColor - The EVENT_COLOR_* value from API
 * @returns The hex color string (e.g., '#5EB0F8')
 */
export const getEventColorHex = (eventColor?: string): string => {
  if (!eventColor || !(eventColor in EVENT_COLOR_HEX_MAP)) {
    return EVENT_COLOR_HEX_MAP.EVENT_COLOR_ONE; // Default
  }
  return EVENT_COLOR_HEX_MAP[eventColor as EventColorEnum];
};

/**
 * Get the user-friendly name for an EVENT_COLOR_* enum
 * 
 * @param eventColor - The EVENT_COLOR_* value from API
 * @returns The color name (e.g., 'light blue')
 */
export const getEventColorName = (eventColor?: string): string => {
  if (!eventColor || !(eventColor in EVENT_COLOR_NAME_MAP)) {
    return EVENT_COLOR_NAME_MAP.EVENT_COLOR_ONE; // Default
  }
  return EVENT_COLOR_NAME_MAP[eventColor as EventColorEnum];
};
