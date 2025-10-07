import { minutesToTimeString } from '@/utils/dateUtils';
import { apiClient } from './api-client';
import { API } from './constants';
import { StorageService } from './storage';

/**
 * Working Hours Service
 * Handles fetching and processing working hours from the awhours API
 */

// Week day mapping
export const WEEK_DAY_MAP: Record<number, string> = {
  0: 'SU',
  1: 'MO',
  2: 'TU',
  3: 'WE',
  4: 'TH',
  5: 'FR',
  6: 'SA',
};

export const WEEK_DAY_MAP_TO_NUMBER: Record<string, number> = {
  SU: 0,
  MO: 1,
  TU: 2,
  WE: 3,
  TH: 4,
  FR: 5,
  SA: 6,
};

// API response types
export interface WorkingHoursSlot {
  start: number; // minutes since midnight
  end: number; // minutes since midnight
}

export interface WorkingHoursBreak {
  start: number;
  end: number;
}

export interface DayConfig {
  hours?: WorkingHoursSlot[];
  breaks?: WorkingHoursBreak[];
}

export interface AWHoursAPIResponse {
  weekDayConfig?: Record<string, DayConfig>;
  timezone?: string;
}

// App-friendly types
export interface WorkingHoursBlock {
  daysOfWeek: number[];
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  startMinutes: number; // minutes since midnight
  endMinutes: number; // minutes since midnight
}

export interface WorkingHoursData {
  blocks: WorkingHoursBlock[];
  timezone: string;
}

/**
 * Fetches working hours for a user/account from the awhours API
 */
export const fetchWorkingHours = async (
  userId: string,
  accountId?: string
): Promise<WorkingHoursData | null> => {
  try {
    const token = await StorageService.getAccessToken();
    if (!token) {
      throw new Error('No access token found');
    }

    const params: Record<string, string> = {
      type: userId === accountId ? 'ACCOUNT' : 'USER',
      userId: userId,
    };
    
    const response = await apiClient.get<{ data: { awhours: AWHoursAPIResponse } }>(
      API.BUSINESS_HOURS,
      { 
        params,
        headers: {
          Authorization: 'ADD_TOKEN',
        },
      }
    );

    if (response.data?.data?.awhours) {
      return convertWorkingHours(response.data.data.awhours);
    }

    return null;
  } catch (error) {
    console.error('Failed to fetch working hours:', error);
    return null;
  }
};

/**
 * Converts API response to app-friendly format
 */
const convertWorkingHours = (apiData: AWHoursAPIResponse): WorkingHoursData => {
  const blocks: WorkingHoursBlock[] = [];
  const timezone = apiData.timezone || 'Asia/Kolkata';

  if (!apiData.weekDayConfig) {
    return { blocks, timezone };
  }

  // Process each day of the week
  for (let dayNum = 0; dayNum < 7; dayNum++) {
    const dayKey = WEEK_DAY_MAP[dayNum];
    const dayConfig = apiData.weekDayConfig[dayKey];

    if (!dayConfig?.hours || dayConfig.hours.length === 0) {
      continue;
    }

    // Process each working hours slot for this day
    for (const slot of dayConfig.hours) {
      // If there are breaks, split the slot into multiple blocks
      if (dayConfig.breaks && dayConfig.breaks.length > 0) {
        const slotsWithBreaks = applyBreaks(slot, dayConfig.breaks);
        for (const splitSlot of slotsWithBreaks) {
          blocks.push({
            daysOfWeek: [dayNum],
            startTime: minutesToTimeString(splitSlot.start),
            endTime: minutesToTimeString(splitSlot.end),
            startMinutes: splitSlot.start,
            endMinutes: splitSlot.end,
          });
        }
      } else {
        blocks.push({
          daysOfWeek: [dayNum],
          startTime: minutesToTimeString(slot.start),
          endTime: minutesToTimeString(slot.end),
          startMinutes: slot.start,
          endMinutes: slot.end,
        });
      }
    }
  }

  return { blocks, timezone };
};

/**
 * Applies breaks to a working hours slot, splitting it into multiple slots
 */
const applyBreaks = (
  slot: WorkingHoursSlot,
  breaks: WorkingHoursBreak[]
): WorkingHoursSlot[] => {
  // Sort breaks by start time
  const sortedBreaks = [...breaks].sort((a, b) => a.start - b.start);
  
  const result: WorkingHoursSlot[] = [];
  let currentStart = slot.start;

  for (const breakPeriod of sortedBreaks) {
    // If break is within the slot
    if (breakPeriod.start > currentStart && breakPeriod.start < slot.end) {
      // Add slot before break
      if (breakPeriod.start > currentStart) {
        result.push({
          start: currentStart,
          end: breakPeriod.start,
        });
      }
      
      // Move current start to end of break
      currentStart = Math.max(currentStart, breakPeriod.end);
    }
  }

  // Add remaining slot after all breaks
  if (currentStart < slot.end) {
    result.push({
      start: currentStart,
      end: slot.end,
    });
  }

  return result.length > 0 ? result : [slot];
};

/**
 * Fetches working hours for multiple contact IDs
 */
export const fetchMultipleWorkingHours = async (
  contactIds: string[],
  accountId: string
): Promise<Record<string, WorkingHoursData>> => {
  const results: Record<string, WorkingHoursData> = {};

  await Promise.all(
    contactIds.map(async (contactId) => {
      const workingHours = await fetchWorkingHours(contactId, accountId);
      if (workingHours) {
        results[contactId] = workingHours;
      }
    })
  );

  return results;
};

/**
 * Checks if a specific time falls within working hours
 */
export const isWithinWorkingHours = (
  date: Date,
  workingHours: WorkingHoursData
): boolean => {
  const dayOfWeek = date.getDay();
  const minutes = date.getHours() * 60 + date.getMinutes();

  return workingHours.blocks.some(
    (block) =>
      block.daysOfWeek.includes(dayOfWeek) &&
      minutes >= block.startMinutes &&
      minutes < block.endMinutes
  );
};
