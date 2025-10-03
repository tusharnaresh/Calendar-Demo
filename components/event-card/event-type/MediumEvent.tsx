import { Event } from '@/data/mockEvents';
import { getEventColors } from '@/utils/eventColorSchemes';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppointmentLabel } from '../event-card-components/AppointmentLabel';
import { ExternalSourceBadge } from '../event-card-components/ExternalSourceBadge';
import { SideBar } from '../event-card-components/SideBar';
import { TimeStamp } from '../event-card-components/TimeStamp';
import { VideoIcon } from '../event-card-components/VideoIcon';

interface MediumEventProps {
  event: Event;
  onPress?: (event: Event) => void;
}

export const MediumEvent: React.FC<MediumEventProps> = ({ event, onPress }) => {
  const colors = getEventColors(event);
  const cardState = event.cardState || 'active';
  const hasVideoLink = event.location?.videoType && event.location.videoType.length > 0;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.bg }]}
      onPress={() => onPress?.(event)}
      activeOpacity={0.7}
    >
      <SideBar color={colors.sideBar} size="medium" />
      <View style={styles.content}>
        {/* Header: Title + Video Icon */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1} ellipsizeMode="tail">
            {event.title}
          </Text>
          {hasVideoLink && (
            <VideoIcon 
              externalSource={event.externalSource}
              size="medium"
              textColor={colors.text}
            />
          )}
        </View>
        
        {/* Subtitle: Timestamp */}
        <TimeStamp 
          startTime={event.startTime}
          endTime={event.endTime}
          size="medium"
        />
        
        {/* Bottom Right: Label, External Icon */}
        <View style={styles.footer}>
          <AppointmentLabel 
            label={event.label}
            textColor={colors.text}
            size="medium"
            cardState={cardState}
          />
          
          <ExternalSourceBadge 
            isExternal={event.isExternal}
            externalSource={event.externalSource}
            textColor={colors.text}
            size="medium"
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
    borderRadius: 6,
    marginBottom: 6,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 1.5,
    flexDirection: 'row',
  },
  content: {
    flex: 1,
    padding: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 16,
    flex: 1,
    marginRight: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});
