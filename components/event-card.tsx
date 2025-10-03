import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Event } from '@/data/mockEvents';

interface EventCardProps {
  event: Event;
  onPress?: (event: Event) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onPress }) => {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes.toString().padStart(2, '0');
    return `${formattedHours}:${formattedMinutes}${ampm}`;
  };

  const getEventColor = () => {
    // Services - Green/Teal
    if (event.type === 'SESSION' && event.service && event.service.length > 0) {
      return '#10B981'; // emerald-500
    }
    // Appointments (Classes) - Purple
    if (event.type === 'APPOINTMENT' && event.service && event.service.length > 0) {
      return '#8B5CF6'; // violet-500
    }
    // Regular Events - Light Blue (default)
    return '#3B82F6'; // blue-500
  };

  const getBackgroundColor = () => {
    // Services - Light Green
    if (event.type === 'SESSION' && event.service && event.service.length > 0) {
      return '#D1FAE5'; // emerald-100
    }
    // Appointments - Light Purple
    if (event.type === 'APPOINTMENT' && event.service && event.service.length > 0) {
      return '#EDE9FE'; // violet-100
    }
    // Regular Events - Light Blue
    return '#DBEAFE'; // blue-100
  };

  const hasVideoLink = event.location?.videoType && event.location.videoType.length > 0;
  const videoIcon = event.externalSource === 'microsoft' ? 'logo-microsoft' : 'videocam';

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: getBackgroundColor() }]}
      onPress={() => onPress?.(event)}
      activeOpacity={0.7}
    >
      <View style={[styles.colorBar, { backgroundColor: getEventColor() }]} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>
              {formatTime(event.startTime)} - {formatTime(event.endTime)}
            </Text>
          </View>
          
          {hasVideoLink && (
            <View style={styles.videoIconContainer}>
              <Ionicons name={videoIcon as any} size={16} color="#6B7280" />
            </View>
          )}
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {event.title}
        </Text>

        <View style={styles.footer}>
          {event.isExternal && (
            <View style={styles.externalBadge}>
              <Ionicons 
                name={event.externalSource === 'google' ? 'logo-google' : 'logo-microsoft'} 
                size={12} 
                color="#6B7280" 
              />
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 8,
    marginBottom: 8,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  colorBar: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  timeContainer: {
    flex: 1,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  videoIconContainer: {
    marginLeft: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  externalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
  },
});
