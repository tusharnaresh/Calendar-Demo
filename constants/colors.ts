// Color constants for the Calendar app
// Use these throughout the app for consistency

export const Colors = {
  // Primary Colors
  primary: '#3B82F6', // blue-500
  primaryLight: '#DBEAFE', // blue-100
  
  // Event Type Colors
  event: {
    background: '#DBEAFE', // blue-100
    border: '#3B82F6', // blue-500
  },
  service: {
    background: '#D1FAE5', // emerald-100
    border: '#10B981', // emerald-500
  },
  appointment: {
    background: '#EDE9FE', // violet-100
    border: '#8B5CF6', // violet-500
  },
  
  // Text Colors
  text: {
    primary: '#111827', // gray-900
    secondary: '#6B7280', // gray-500
    tertiary: '#9CA3AF', // gray-400
  },
  
  // Background Colors
  background: {
    primary: '#FFFFFF',
    secondary: '#F3F4F6', // gray-100
    tertiary: '#D1D5DB', // gray-300
  },
  
  // External Sources
  google: '#4285F4',
  microsoft: '#00A4EF',
};

export type EventType = 'EVENT' | 'SESSION' | 'APPOINTMENT';

export const getEventColors = (type: EventType, hasService: boolean) => {
  if (type === 'SESSION' && hasService) {
    return Colors.service;
  }
  if (type === 'APPOINTMENT' && hasService) {
    return Colors.appointment;
  }
  return Colors.event;
};
