import { CardSize } from '@/utils/eventCardSizing';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface ExternalSourceBadgeProps {
  isExternal?: boolean;
  externalSource?: 'google' | 'microsoft';
  textColor: string;
  size: CardSize;
}

export const ExternalSourceBadge: React.FC<ExternalSourceBadgeProps> = ({ 
  isExternal,
  externalSource,
  textColor, 
  size,
}) => {
  if (!isExternal || !externalSource) return null;

  const getIconSize = () => {
    switch (size) {
      case 'large': return 12;
      case 'medium': return 10;
      case 'small': return 0;
      case 'tiny': return 0;
      default: return 12;
    }
  };

  const iconSize = getIconSize();
  if (iconSize === 0) return null;

  const iconName = externalSource === 'google' ? 'logo-google' : 'logo-microsoft';

  return (
    <View style={[styles.badge, size === 'large' && styles.badgeLarge]}>
      <Ionicons name={iconName as any} size={iconSize} color={textColor} />
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
  },
  badgeLarge: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 4,
    marginLeft: 6,
  },
});
