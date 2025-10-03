import { CardSize } from '@/utils/eventCardSizing';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface VideoIconProps {
  externalSource?: 'google' | 'microsoft';
  size: CardSize;
  textColor: string;
}

export const VideoIcon: React.FC<VideoIconProps> = ({ externalSource, size, textColor }) => {
  const iconName = externalSource === 'microsoft' ? 'logo-microsoft' : 'videocam';
  
  const getIconSize = () => {
    switch (size) {
      case 'large': return 16;
      case 'medium': return 12;
      case 'small': return 10;
      case 'tiny': return 0;
      default: return 16;
    }
  };

  const iconSize = getIconSize();
  if (iconSize === 0) return null;

  return (
    <View style={size === 'large' ? styles.container : null}>
      <Ionicons name={iconName as any} size={iconSize} color={textColor} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginLeft: 8,
  },
});
