import { StorageService } from '@/services/storage';
import {
    fetchMultipleWorkingHours,
    fetchWorkingHours,
    WorkingHoursData,
} from '@/services/working-hours-service';
import { useCallback, useEffect, useState } from 'react';

export interface UseWorkingHoursResult {
  workingHours: WorkingHoursData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch and manage working hours for a single user
 */
export const useWorkingHours = (userId?: string): UseWorkingHoursResult => {
  const [workingHours, setWorkingHours] = useState<WorkingHoursData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const accountId = await StorageService.getMerchantId();
      
      if (!userId) {
        setWorkingHours(null);
        return;
      }

      const data = await fetchWorkingHours(userId, accountId || undefined);
      setWorkingHours(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch working hours');
      console.error('Error fetching working hours:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    workingHours,
    loading,
    error,
    refetch: fetchData,
  };
};

export interface UseMultipleWorkingHoursResult {
  workingHoursMap: Record<string, WorkingHoursData>;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch and manage working hours for multiple users
 */
export const useMultipleWorkingHours = (contactIds?: string[]): UseMultipleWorkingHoursResult => {
  const [workingHoursMap, setWorkingHoursMap] = useState<Record<string, WorkingHoursData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!contactIds || contactIds.length === 0) {
        setWorkingHoursMap({});
        return;
      }

      const accountId = await StorageService.getMerchantId();
      if (!accountId) {
        throw new Error('Account ID not found');
      }

      const data = await fetchMultipleWorkingHours(contactIds, accountId);
      setWorkingHoursMap(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch working hours');
      console.error('Error fetching working hours:', err);
    } finally {
      setLoading(false);
    }
  }, [contactIds]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    workingHoursMap,
    loading,
    error,
    refetch: fetchData,
  };
};
