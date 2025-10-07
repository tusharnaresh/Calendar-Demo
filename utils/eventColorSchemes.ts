import { Event } from "@/data/mockEvents";
import { mapEventColorToScheme } from "./eventColorMapper";

export type ColorScheme = {
  dark: string; // Main dark color (for active state text/background)
  medium: string; // 25% opacity (for hover state)
  subtle: string; // 15% opacity (for default background)
  buffer: string; // 16% opacity (for buffer time pattern)
  text: string; // Text color
};

export type CardState = "subtle" | "medium" | "active";

export type ColorSchemeName =
  | "deep-blue"
  | "dark-green"
  | "green"
  | "yellow"
  | "gold"
  | "grey"
  | "orange"
  | "maroon"
  | "red"
  | "violet"
  | "pink"
  | "light-pink"
  | "internal-event"
  | "external-event"
  | "out-of-office";

// Color values from SCSS - matching web calendar exactly
const COLORS = {
  "deep-blue": "#007cea",
  "dark-green": "#007178",
  green: "#3ead85",
  yellow: "#ffc700",
  gold: "#f9d667",
  grey: "#c0c0c0",
  orange: "#ff8a35",
  maroon: "#8e4c1b",
  red: "#da3a00",
  violet: "#512fb1",
  pink: "#ce3b93",
  "light-pink": "#ea556c",
  "internal-event": "#5eb0f8",
  "external-event": "#9daeb6",
  "out-of-office": "#9daeb6",
};

// Helper to convert hex to rgba
const hexToRgba = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Generate color schemes with consistent opacity levels matching SCSS
export const colorSchemes: Record<ColorSchemeName, ColorScheme> =
  Object.entries(COLORS).reduce((acc, [name, color]) => {
    acc[name as ColorSchemeName] = {
      dark: color,
      medium: hexToRgba(color, 0.25),
      subtle: hexToRgba(color, 0.15),
      buffer: hexToRgba(color, 0.16),
      text: "#1F2937", // Default dark text for subtle/medium states
    };
    return acc;
  }, {} as Record<ColorSchemeName, ColorScheme>);

/**
 * Get the appropriate color scheme for an event
 * 
 * Color Priority Logic (matching web calendar):
 * 1. eventColor from API (EVENT_COLOR_ONE through EVENT_COLOR_TEN)
 *    - These are user-selected colors when creating/editing events
 *    - Mapped to color schemes: ONE=internal-event, TWO=red, THREE=orange, etc.
 * 
 * 2. Manual colorScheme override (for testing/special cases)
 *    - Direct specification of color scheme name
 * 
 * 3. Special event types:
 *    - OUT_OF_OFFICE: type='OFF' or label='out of office' → grey
 *    - EXTERNAL: isExternal=true → grey (Google, Microsoft calendars)
 * 
 * 4. Type-based colors (legacy logic):
 *    - SESSION with service → dark-green
 *    - APPOINTMENT with service → violet
 * 
 * 5. Default: internal-event (light blue, equivalent to EVENT_COLOR_ONE)
 * 
 * @param event - The event object
 * @returns The ColorScheme object with all color variants
 */
export const getColorScheme = (event: Event): ColorScheme => {
  // Priority 1: Use eventColor from API if available (EVENT_COLOR_ONE, etc.)
  if (event.eventColor) {
    const mappedScheme = mapEventColorToScheme(event.eventColor);
    return colorSchemes[mappedScheme];
  }

  // Priority 2: Allow manual override via event.colorScheme property
  if (event.colorScheme && colorSchemes[event.colorScheme]) {
    return colorSchemes[event.colorScheme];
  }

  // Priority 3: Special cases - external and out-of-office events
  if (event.type === 'OFF' || event.label?.toLowerCase() === 'out of office') {
    return colorSchemes["out-of-office"];
  }
  
  if (event.isExternal) {
    return colorSchemes["external-event"];
  }

  // Priority 4: Type-based colors for services and appointments
  if (event.type === "SESSION" && event.service && event.service.length > 0) {
    return colorSchemes["dark-green"]; // Services use dark-green
  }
  if (
    event.type === "APPOINTMENT" &&
    event.service &&
    event.service.length > 0
  ) {
    return colorSchemes["violet"]; // Appointments use violet
  }

  // Default: Use internal-event blue (equivalent to EVENT_COLOR_ONE)
  return colorSchemes["internal-event"];
};

export const getCardState = (event: Event): CardState => {
  if (event.cardState) {
    return event.cardState;
  }
  return "subtle"; // Default to subtle background
};

export const getEventColors = (event: Event) => {
  const colorScheme = getColorScheme(event);
  const cardState = getCardState(event);

  // Return colors based on state
  if (cardState === "active") {
    return {
      bg: colorScheme.dark,
      sideBar: colorScheme.dark,
      text: "#FFFFFF", 
      border: colorScheme.dark,
    };
  } else {
    // subtle state (default)
    return {
      bg: colorScheme.medium,
      sideBar: colorScheme.dark,
      text: colorScheme.text,
      border: colorScheme.dark,
    };
  }
};
