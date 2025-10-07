/**
 * Date/Time utilities for IST (Indian Standard Time) timezone
 * IST is UTC+05:30
 */

import { addDays, endOfMonth, startOfDay, startOfMonth } from 'date-fns';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';

const IST_TIMEZONE = 'Asia/Kolkata';

/**
 * Converts a Date object to IST format string
 * Format: YYYY-MM-DDTHH:MM:SS+05:30
 */
export const toISTString = (date: Date): string => {
  return formatInTimeZone(date, IST_TIMEZONE, "yyyy-MM-dd'T'HH:mm:ssXXX");
};

/**
 * Gets the start of the month in IST
 */
export const getMonthStartIST = (date: Date): string => {
  const monthStart = startOfMonth(date);
  return formatInTimeZone(monthStart, IST_TIMEZONE, "yyyy-MM-dd'T'00:00:00XXX");
};

/**
 * Gets the end of the month in IST
 */
export const getMonthEndIST = (date: Date): string => {
  const monthEnd = endOfMonth(date);
  return formatInTimeZone(monthEnd, IST_TIMEZONE, "yyyy-MM-dd'T'23:59:59XXX");
};

/**
 * Gets the current date/time in IST
 */
export const getCurrentIST = (): string => {
  return toISTString(new Date());
};

/**
 * Parses an ISO string and returns a Date object adjusted for IST
 */
export const parseToIST = (isoString: string): Date => {
  return toZonedTime(isoString, IST_TIMEZONE);
};

/**
 * Converts minutes since midnight to a time string (HH:mm format)
 */
export const minutesToTimeString = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

/**
 * Gets date for a specific day of week in IST
 */
export const getDateForDayOfWeek = (baseDate: Date, dayOfWeek: number): Date => {
  const dayStart = startOfDay(baseDate);
  const currentDayOfWeek = dayStart.getDay();
  const diff = dayOfWeek - currentDayOfWeek;
  return addDays(dayStart, diff);
};
