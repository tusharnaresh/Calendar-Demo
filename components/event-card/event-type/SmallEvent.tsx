import { Event } from '@/data/mockEvents';
import { getEventColors } from '@/utils/eventColorSchemes';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppointmentLabel } from '../event-card-components/AppointmentLabel';
import { SideBar } from '../event-card-components/SideBar';
import { TimeStamp } from '../event-card-components/TimeStamp';

interface SmallEventProps {
  event: Event;
  onPress?: (event: Event) => void;
}

export const SmallEvent: React.FC<SmallEventProps> = ({ event, onPress }) => {
  const colors = getEventColors(event);
  const cardState = event.cardState || 'active';

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.bg }]}
      onPress={() => onPress?.(event)}
      activeOpacity={0.7}
    >
      <SideBar color={colors.sideBar} size="small" />
      <View style={styles.content}>
        <TimeStamp 
          startTime={event.startTime}
          endTime={event.endTime}
          size="small"
          textColor={colors.text}
        />
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {event.title}
        </Text>
        <AppointmentLabel 
          label={event.label}
          textColor={colors.text}
          size="small"
          cardState={cardState}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
    marginBottom: 4,
    overflow: 'hidden',
    elevation: 0.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0.5 },
    shadowOpacity: 0.04,
    shadowRadius: 1,
    flexDirection: 'row',
  },
  content: {
    flex: 1,
    padding: 6,
  },
  title: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 13,
  },
});
