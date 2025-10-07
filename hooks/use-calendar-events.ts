import { Event } from '@/data/mockEvents';
import { CalendarService, StorageService } from '@/services';
import { getMonthEndIST, getMonthStartIST } from '@/utils/dateUtils';
import { useCallback, useEffect, useState } from 'react';

interface UseCalendarEventsResult {
  events: Event[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseCalendarEventsOptions {
  startDate?: string;
  endDate?: string;
  autoFetch?: boolean;
}

/**
 * Custom hook to fetch calendar events from the API
 * Automatically fetches events when the hook is mounted
 * Returns events, loading state, error, and a refetch function
 */
export function useCalendarEvents(options: UseCalendarEventsOptions = {}): UseCalendarEventsResult {
  const { startDate, endDate, autoFetch = true } = options;
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    console.log('Fetching events with date range:', { startDate, endDate });
    try {
      // Check if access token exists
      const hasToken = await StorageService.hasAccessToken();
      if (!hasToken) {
        setError('No access token found. Please add your access token in the Access Token tab.');
        setEvents([]);
        return;
      }

      // Get saved provider IDs and calendar IDs
      const providerIds = await StorageService.getProviderIds();
      const calendarIds = await StorageService.getCalendarIds();

      // Calculate date range (default to current month if not provided)
      // Use IST timezone (UTC+05:30) for dates
      const now = new Date();
      const defaultStartDate = startDate || getMonthStartIST(now);
      const defaultEndDate = endDate || getMonthEndIST(now);

      // Fetch events from API
      const fetchedEvents = await CalendarService.fetchEvents({
        startDateTime: defaultStartDate,
        endDateTime: defaultEndDate,
        providerIds: providerIds || undefined,
        calendarIds: calendarIds || undefined,
      });

      setEvents(fetchedEvents);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch events:', err);
      
      // Provide user-friendly error messages
      if (err.response?.status === 401) {
        setError('Invalid access token. Please check your access token in the Access Token tab.');
      } else if (err.response?.status >= 500) {
        setError('Server error. Please try again later.');
      } else if (err.message?.includes('Network')) {
        setError('Network error. Please check your internet connection.');
      } else {
        setError('Failed to fetch events. Please try again.');
      }
      
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  // Auto-fetch on mount or when date range changes
  useEffect(() => {
    if (autoFetch) {
      fetchEvents();
    }
  }, [autoFetch, fetchEvents]);

  return {
    events,
    loading,
    error,
    refetch: fetchEvents,
  };
}
