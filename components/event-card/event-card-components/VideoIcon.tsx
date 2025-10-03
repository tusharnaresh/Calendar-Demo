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
  const getIconSize = () => {
    switch (size) {
      case 'large': return 14;
      case 'medium': return 12;
      default: return 12;
    }
  };

  const iconSize = getIconSize();

  const renderIcon = () => {
    return <Ionicons name="videocam" size={iconSize} color={textColor} />;
  };

  return (
    <View style={styles.container}>
      {renderIcon()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexShrink: 0,
  },
});
