import { CardSize } from '@/utils/eventCardSizing';
import { formatTime, formatTimeShort } from '@/utils/timeFormatters';
import React from 'react';
import { StyleSheet, Text } from 'react-native';

interface TimeStampProps {
  startTime: number;
  endTime: number;
  size: CardSize;
  textColor: string;
}

export const TimeStamp: React.FC<TimeStampProps> = ({ startTime, endTime, size, textColor }) => {
  const getText = () => {
    if (size === 'tiny') return null; // No time shown for tiny
    if (size === 'small') {
      return `${formatTimeShort(startTime)}-${formatTimeShort(endTime)}`;
    }
    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
  };

  const getFontSize = () => {
    switch (size) {
      case 'large': return 12;
      case 'medium': return 10;
      case 'small': return 9;
      case 'tiny': return 0;
      default: return 12;
    }
  };

  const getLetterSpacing = () => {
    switch (size) {
      case 'large': return 0.3;
      case 'medium': return 0.2;
      case 'small': return 0.1;
      default: return 0.3;
    }
  };

  const getMarginBottom = () => {
    switch (size) {
      case 'large': return 6;
      case 'medium': return 4;
      case 'small': return 2;
      default: return 6;
    }
  };

  const text = getText();
  if (!text) return null;

  return (
    <Text 
      style={[
        styles.timeText,
        { 
          color: textColor,
          fontSize: getFontSize(),
          letterSpacing: getLetterSpacing(),
          marginBottom: getMarginBottom(),
        }
      ]}
    >
      {text}
    </Text>
  );
};

const styles = StyleSheet.create({
  timeText: {
    fontWeight: '700',
  },
});
