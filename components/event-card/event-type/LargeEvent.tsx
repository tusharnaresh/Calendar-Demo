import { Event } from '@/data/mockEvents';
import { getEventColors } from '@/utils/eventColorSchemes';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppointmentLabel } from '../event-card-components/AppointmentLabel';
import { ExternalSourceBadge } from '../event-card-components/ExternalSourceBadge';
import { ServiceTypeBadge } from '../event-card-components/ServiceTypeBadge';
import { SideBar } from '../event-card-components/SideBar';
import { TimeStamp } from '../event-card-components/TimeStamp';
import { VideoIcon } from '../event-card-components/VideoIcon';

interface LargeEventProps {
  event: Event;
  onPress?: (event: Event) => void;
}

export const LargeEvent: React.FC<LargeEventProps> = ({ event, onPress }) => {
  const colors = getEventColors(event);
  const cardState = event.cardState || 'active';
  const hasVideoLink = event.location?.videoType && event.location.videoType.length > 0;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.bg }]}
      onPress={() => onPress?.(event)}
      activeOpacity={0.7}
    >
      <SideBar color={colors.sideBar} size="large" />
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.timeContainer}>
            <TimeStamp 
              startTime={event.startTime}
              endTime={event.endTime}
              size="large"
              textColor={colors.text}
            />
          </View>
          {hasVideoLink && (
            <VideoIcon 
              externalSource={event.externalSource}
              size="large"
              textColor={colors.text}
            />
          )}
        </View>

        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {event.title}
        </Text>

        <View style={styles.footer}>
          <ServiceTypeBadge 
            type={event.type}
            service={event.service}
            textColor={colors.text}
            size="large"
            cardState={cardState}
          />
          
          <AppointmentLabel 
            label={event.label}
            textColor={colors.text}
            size="large"
            cardState={cardState}
          />

          <ExternalSourceBadge 
            isExternal={event.isExternal}
            externalSource={event.externalSource}
            textColor={colors.text}
            size="large"
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    marginBottom: 8,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    flexDirection: 'row',
  },
  content: {
    flex: 1,
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 10,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
});
