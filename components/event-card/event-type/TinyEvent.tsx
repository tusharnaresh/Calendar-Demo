import { Event } from '@/data/mockEvents';
import { getEventColors } from '@/utils/eventColorSchemes';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ExternalSourceBadge } from '../event-card-components/ExternalSourceBadge';
import { SideBar } from '../event-card-components/SideBar';
import { TimeStamp } from '../event-card-components/TimeStamp';
import { VideoIcon } from '../event-card-components/VideoIcon';

interface TinyEventProps {
  event: Event;
  onPress?: (event: Event) => void;
}

const TinyEventComponent: React.FC<TinyEventProps> = ({ event, onPress }) => {
  const colors = getEventColors(event);
  const hasVideoLink = event.location?.videoType && event.location.videoType.length > 0;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.bg }]}
      onPress={() => onPress?.(event)}
      activeOpacity={0.7}
    >
      <SideBar color={colors.sideBar} size="tiny" />
      <View style={styles.content}>
        {/* Header: Title + Video Icon */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1} ellipsizeMode="tail">
            {event.title}
          </Text>
          {hasVideoLink && (
            <VideoIcon 
              externalSource={event.externalSource}
              size="tiny"
              textColor={colors.text}
            />
          )}
        </View>
        
        {/* Timestamp inline */}
        <TimeStamp 
          startTime={event.startTime}
          endTime={event.endTime}
          size="tiny"
        />
        
        {/* External Badge (no label for tiny) */}
        <ExternalSourceBadge 
          isExternal={event.isExternal}
          externalSource={event.externalSource}
          textColor={colors.text}
          size="tiny"
        />
      </View>
    </TouchableOpacity>
  );
};

// Memoize to prevent unnecessary re-renders
export const TinyEvent = React.memo(TinyEventComponent, (prevProps, nextProps) => {
  return prevProps.event.id === nextProps.event.id;
});

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
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 4,
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 4,
  },
  title: {
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 12,
    flex: 1,
  },
});
