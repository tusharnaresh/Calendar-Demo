import { CardSize } from '@/utils/eventCardSizing';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface SideBarProps {
  color: string;
  size: CardSize;
}

export const SideBar: React.FC<SideBarProps> = ({ color, size }) => {
  const getWidth = () => {
    switch (size) {
      case 'large': return 4;
      case 'medium': return 3;
      case 'small': return 2;
      case 'tiny': return 2;
      default: return 4;
    }
  };

  const getBorderRadius = () => {
    switch (size) {
      case 'large': return 8;
      case 'medium': return 6;
      case 'small': return 4;
      case 'tiny': return 3;
      default: return 8;
    }
  };

  return (
    <View 
      style={[
        styles.sideBar,
        { 
          width: getWidth(),
          backgroundColor: color,
          borderTopLeftRadius: getBorderRadius(),
          borderBottomLeftRadius: getBorderRadius(),
        }
      ]} 
    />
  );
};

const styles = StyleSheet.create({
  sideBar: {
    height: '100%',
  },
});
