import { CardSize } from '@/utils/eventCardSizing';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type CardState = 'subtle' | 'medium' | 'active';

interface ServiceTypeBadgeProps {
  type: 'EVENT' | 'SESSION' | 'APPOINTMENT';
  service?: string[];
  textColor: string;
  size: CardSize;
  cardState: CardState;
}

export const ServiceTypeBadge: React.FC<ServiceTypeBadgeProps> = ({ 
  type,
  service,
  textColor, 
  size,
  cardState,
}) => {
  // Only show for large size and if service exists
  if (size !== 'large' || !service || service.length === 0) {
    return null;
  }

  const getLabel = () => {
    if (type === 'SESSION') return 'Service';
    if (type === 'APPOINTMENT') return 'Class';
    return 'Event';
  };

  const getBackgroundColor = () => {
    return cardState === 'active' 
      ? 'rgba(255, 255, 255, 0.2)' 
      : 'rgba(0, 0, 0, 0.05)';
  };

  return (
    <View 
      style={[
        styles.badge,
        { backgroundColor: getBackgroundColor() }
      ]}
    >
      <Text style={[styles.badgeText, { color: textColor }]}>
        {getLabel()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
