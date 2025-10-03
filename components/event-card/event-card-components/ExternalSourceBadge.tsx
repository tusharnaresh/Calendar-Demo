import GoogleIcon from '@/assets/icons/google.svg';
import MicrosoftIcon from '@/assets/icons/microsoft.svg';
import { CardSize } from '@/utils/eventCardSizing';
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
      case 'large': return 18;
      case 'medium': return 16;
      case 'small': return 14;
      case 'tiny': return 12;
      default: return 18;
    }
  };

  const iconSize = getIconSize();

  return (
    <View style={styles.badge}>
      {externalSource === 'google' ? (
        <GoogleIcon width={iconSize} height={iconSize} />
      ) : (
        <MicrosoftIcon width={iconSize} height={iconSize} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexShrink: 0,
  },
});
