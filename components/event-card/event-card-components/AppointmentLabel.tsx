import { CardSize } from '@/utils/eventCardSizing';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type CardState = 'subtle' | 'medium' | 'active';

interface AppointmentLabelProps {
  label?: string;
  textColor: string;
  size: CardSize;
  cardState: CardState;
}

export const AppointmentLabel: React.FC<AppointmentLabelProps> = ({ 
  label, 
  textColor, 
  size,
  cardState,
}) => {
  if (!label || label === 'No label') return null;

  const getPadding = () => {
    switch (size) {
      case 'large': return { horizontal: 8, vertical: 4 };
      case 'medium': return { horizontal: 6, vertical: 2 };
      case 'small': return { horizontal: 4, vertical: 2 };
      case 'tiny': return { horizontal: 0, vertical: 0 };
      default: return { horizontal: 8, vertical: 4 };
    }
  };

  const getBorderRadius = () => {
    switch (size) {
      case 'large': return 4;
      case 'medium': return 3;
      case 'small': return 2;
      case 'tiny': return 0;
      default: return 4;
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'large': return 11;
      case 'medium': return 9;
      case 'small': return 8;
      case 'tiny': return 0;
      default: return 11;
    }
  };

  const getLetterSpacing = () => {
    switch (size) {
      case 'large': return 0.5;
      case 'medium': return 0.3;
      case 'small': return 0.2;
      default: return 0.5;
    }
  };

  const getBackgroundColor = () => {
    return 'rgba(255, 255, 255, 0.7)';
  };

  const padding = getPadding();

  return (
    <View 
      style={[
        styles.badge,
        {
          paddingHorizontal: padding.horizontal,
          paddingVertical: padding.vertical,
          borderRadius: getBorderRadius(),
          backgroundColor: getBackgroundColor(),
        }
      ]}
    >
      <Text 
        style={[
          styles.badgeText,
          {
            color: textColor,
            fontSize: getFontSize(),
            letterSpacing: getLetterSpacing(),
          }
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});
