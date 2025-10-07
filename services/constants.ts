/**
 * API Constants for Calendar Service
 * Based on Anywhere Calendar scheduling engine endpoints
 */

type Environment = 'production' | 'staging';

const ENV: Environment = 'production'; // Change to 'staging' for development

interface APIEndpoints {
  EVENTS: string;
  SERVICES: string;
  BUSINESS_HOURS: string;
  CALENDAR_SETTINGS: string;
  SLOTS: string;
  HISTORY: string;
  SEND_REMINDER: string;
  EXTERNAL_CALENDAR_CONFIG: string;
  EXTERNAL_CALENDARS_AUTH_URL: string;
  CONNECTABLE_CALENDARS: string;
  AUTHENTICATED_CALENDARS: string;
}

const ENDPOINTS: Record<Environment, APIEndpoints> = {
  production: {
    EVENTS: 'https://schedule.setmore.com/schedule/v1/events',
    SERVICES: 'https://schedule.setmore.com/api/v1/services/type',
    BUSINESS_HOURS: 'https://api.anywhereworks.com/api/v1/awhours',
    CALENDAR_SETTINGS: 'https://schedule.setmore.com/api/v1/services/calendar/new',
    SLOTS: 'https://schedule.setmore.com/api/v1/slots/merchant/referrer/date',
    HISTORY: 'https://schedule.setmore.com/schedule/v1/activity/',
    SEND_REMINDER: 'https://schedule.setmore.com/schedule/v1/reminder/',
    EXTERNAL_CALENDAR_CONFIG: 'https://schedule.setmore.com/api/v1/calendarconfig/',
    EXTERNAL_CALENDARS_AUTH_URL: 'https://schedule.setmore.com/api/v1/externalcalendars/sync/',
    CONNECTABLE_CALENDARS: 'https://schedule.setmore.com/api/v1/externalcalendars/sync',
    AUTHENTICATED_CALENDARS: 'https://schedule.setmore.com/api/v1/externalcalendars/',
  },
  staging: {
    EVENTS: 'https://dev.setmore.info/schedule/v1/events',
    SERVICES: 'https://dev.setmore.info/api/v1/services/type',
    BUSINESS_HOURS: 'https://api.staging.anywhereworks.com/api/v1/awhours',
    CALENDAR_SETTINGS: 'https://dev.setmore.info/api/v1/services/calendar/new',
    SLOTS: 'https://dev.setmore.info/api/v1/slots/merchant/referrer/date',
    HISTORY: 'https://dev.setmore.info/schedule/v1/activity/',
    SEND_REMINDER: 'https://dev.setmore.info/schedule/v1/reminder/',
    EXTERNAL_CALENDAR_CONFIG: 'https://dev.setmore.info/api/v1/calendarconfig/',
    EXTERNAL_CALENDARS_AUTH_URL: 'https://dev.setmore.info/api/v1/externalcalendars/sync/',
    CONNECTABLE_CALENDARS: 'https://dev.setmore.info/api/v1/externalcalendars/sync',
    AUTHENTICATED_CALENDARS: 'https://dev.setmore.info/api/v1/externalcalendars/',
  },
};

export const API = ENDPOINTS[ENV];

export const DEFAULT_LIMIT = 500;

export const REQUEST_TIMEOUT = 30000; // 30 seconds

/**
 * Default values for API requests
 * These can be overridden by user-provided values from storage
 */
export const DEFAULT_MERCHANT_ID = 'SEN42';
export const DEFAULT_BRAND_ID = '110003eb-76c1-4b81-a96a-4cdf91bf70fb';
