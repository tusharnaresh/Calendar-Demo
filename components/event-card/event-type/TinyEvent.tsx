import { Event } from '@/data/mockEvents';
import { getEventColors } from '@/utils/eventColorSchemes';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { SideBar } from '../event-card-components/SideBar';

interface TinyEventProps {
  event: Event;
  onPress?: (event: Event) => void;
}

export const TinyEvent: React.FC<TinyEventProps> = ({ event, onPress }) => {
  const colors = getEventColors(event);

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.bg }]}
      onPress={() => onPress?.(event)}
      activeOpacity={0.7}
    >
      <SideBar color={colors.sideBar} size="tiny" />
      <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
        {event.title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: '100%',
    borderRadius: 3,
    marginBottom: 2,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 12,
    flex: 1,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
});
