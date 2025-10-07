import { Event } from '@/data/mockEvents';
import { mapEventColorToScheme } from '@/utils/eventColorMapper';
import { apiClient } from './api-client';
import { API, DEFAULT_BRAND_ID, DEFAULT_LIMIT, DEFAULT_MERCHANT_ID } from './constants';
import { StorageService } from './storage';

/**
 * Event data from API (raw format)
 */
export interface RawEvent {
  id: string;
  title: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  startDateTime: string; // ISO string
  endDateTime: string; // ISO string
  providerId?: string;
  providerIds?: string[];
  serviceId?: string;
  customerId?: string;
  consumerIds?: string[];
  location?: {
    videoType?: { type: string; url?: string }[];
    address?: string;
  };
  notes?: string;
  type?: string; // 'APPOINTMENT' | 'OFF' | 'BREAK'
  status?: string;
  isExternal?: boolean;
  externalSource?: string; // 'google' | 'microsoft' | 'apple'
  color?: string;
  eventColor?: string; // 'EVENT_COLOR_ONE' | 'EVENT_COLOR_TWO' | etc.
  recurring?: any[];
  label?: string;
  // Add more fields as needed
  [key: string]: any;
}

/**
 * Fetch events params
 */
export interface FetchEventsParams {
  startDateTime: string; // ISO string
  endDateTime: string; // ISO string
  providerIds?: string[];
  consumerIds?: string[];
  calendarIds?: string[];
  merchantId?: string; // Optional, will use default if not provided
  brand?: string; // Optional, will use default if not provided
  signal?: AbortSignal;
}

/**
 * Calendar Service
 * Handles fetching events and time-offs from scheduling engine
 */
export const CalendarService = {
  /**
   * Fetch internal events (appointments created in the system)
   */
  async fetchInternalEvents(
    params: FetchEventsParams,
    cursor: string = '',
    eventsArray: RawEvent[] = []
  ): Promise<RawEvent[]> {
    try {
      const { signal, calendarIds, merchantId, brand, ...restParams } = params;
      
      // Get stored values or use defaults
      const storedMerchantId = await StorageService.getMerchantId();
      const storedBrandId = await StorageService.getBrandId();
      
      const finalMerchantId = merchantId || storedMerchantId || DEFAULT_MERCHANT_ID;
      const finalBrand = brand || storedBrandId || DEFAULT_BRAND_ID;
      
      const response = await apiClient.get(`${API.EVENTS}`, {
        params: {
          q: {
            toJSON: () => ({
              isGroup: true,
              isAllSchedule: true,
              merchantId: finalMerchantId,
              brand: finalBrand,
              ...restParams,
              limit: DEFAULT_LIMIT,
              cursorStr: cursor,
            }),
          },
        },
        headers: {
          Authorization: 'ADD_TOKEN',
        },
        signal,
      });

      if (
        response.status === 200 &&
        response.data?.data?.events
      ) {
        const events = response.data.data.events;
        const nextCursor = response.data.data.next_cursor;

        if (nextCursor) {
          // Recursively fetch more events if there's a cursor
          return CalendarService.fetchInternalEvents(
            params,
            nextCursor,
            [...eventsArray, ...events]
          );
        }

        return [...eventsArray, ...events];
      }

      return eventsArray;
    } catch (error) {
      console.error('Failed to fetch internal events:', error);
      throw error;
    }
  },

  /**
   * Fetch external events (from connected calendars like Google, Microsoft)
   */
  async fetchExternalEvents(
    params: FetchEventsParams,
    cursor: string = '',
    eventsArray: RawEvent[] = []
  ): Promise<RawEvent[]> {
    try {
      const { signal, ...restParams } = params;

      const response = await apiClient.get(`${API.EVENTS}/external`, {
        params: {
          q: {
            toJSON: () => ({
              ...restParams,
              limit: DEFAULT_LIMIT,
              cursor,
            }),
          },
        },
        headers: {
          Authorization: 'ADD_TOKEN',
        },
        signal,
      });

      if (
        response.status === 200 &&
        response.data?.data?.events &&
        response.data.data.events.length > 0
      ) {
        const events = response.data.data.events;
        const nextCursor = response.data.data.cursor;

        if (nextCursor) {
          return CalendarService.fetchExternalEvents(
            params,
            nextCursor,
            [...eventsArray, ...events]
          );
        }

        return [...eventsArray, ...events];
      }

      return eventsArray;
    } catch (error) {
      console.error('Failed to fetch external events:', error);
      throw error;
    }
  },

  /**
   * Fetch all events (internal + external)
   */
  async fetchAllEvents(params: FetchEventsParams): Promise<RawEvent[]> {
    try {
      const [internalEvents, externalEvents] = await Promise.all([
        CalendarService.fetchInternalEvents(params),
        CalendarService.fetchExternalEvents(params),
      ]);

      // Combine and deduplicate events by ID
      const eventsMap = new Map<string, RawEvent>();
      
      [...internalEvents, ...externalEvents].forEach((event) => {
        eventsMap.set(event.id, event);
      });

      return Array.from(eventsMap.values());
    } catch (error) {
      console.error('Failed to fetch all events:', error);
      throw error;
    }
  },

  /**
   * Convert raw API event to app Event format
   */
  convertToAppEvent(rawEvent: RawEvent): Event {
    
    // Determine color scheme with priority logic:
    // 1. Use eventColor from API if available (EVENT_COLOR_ONE, etc.)
    // 2. Fall back to type-based logic
    let colorScheme: Event['colorScheme'] = 'internal-event';
    
    if (rawEvent.eventColor) {
      // Map the EVENT_COLOR_* value to a color scheme name
      colorScheme = mapEventColorToScheme(rawEvent.eventColor);
    } else if (rawEvent.type === 'OFF') {
      colorScheme = 'out-of-office';
    } else if (rawEvent.isExternal) {
      colorScheme = 'external-event';
    }

    // Parse time values
    const startTime = rawEvent.startTime 
      ? new Date(rawEvent.startTime).getTime() 
      : new Date(rawEvent.startDateTime).getTime();
    const endTime = rawEvent.endTime 
      ? new Date(rawEvent.endTime).getTime() 
      : new Date(rawEvent.endDateTime).getTime();

    // Map location
    const location = rawEvent.location ? {
      videoType: rawEvent.location.videoType?.map(vt => ({
        link: vt.url || '',
        id: '',
        type: vt.type,
      })),
      type: rawEvent.location.address ? [rawEvent.location.address] : undefined,
    } : undefined;

    // Map external source
    const externalSource = rawEvent.externalSource === 'google' || rawEvent.externalSource === 'microsoft'
      ? rawEvent.externalSource
      : undefined;

    return {
      id: rawEvent.id,
      title: rawEvent.title || 'Untitled Event',
      startTime,
      endTime,
      startDateTime: rawEvent.startDateTime,
      endDateTime: rawEvent.endDateTime,
      eventColor: rawEvent.eventColor as Event['eventColor'], // Store the original EVENT_COLOR_* value
      colorScheme,
      cardState: 'medium',
      isExternal: rawEvent.isExternal || false,
      externalSource,
      label: rawEvent.label,
      location,
      type: (rawEvent.type as Event['type']) || 'APPOINTMENT',
    };
  },  /**
   * Fetch and convert events to app format
   */
  async fetchEvents(params: FetchEventsParams): Promise<Event[]> {
    try {
      const rawEvents = await CalendarService.fetchAllEvents(params);
      return rawEvents.map((event) => CalendarService.convertToAppEvent(event));
    } catch (error) {
      console.error('Failed to fetch and convert events:', error);
      throw error;
    }
  },
};
