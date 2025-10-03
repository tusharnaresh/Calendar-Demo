import React, { useState, useMemo, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TimelineList, CalendarProvider, Timeline } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { Event, mockEvents } from '@/data/mockEvents';

// Timeline event format required by react-native-calendars
interface TimelineEvent {
  start: string;
  end: string;
  title: string;
  summary?: string;
  color?: string;
  id: string;
  originalEvent?: Event;
}

export const TimelineCalendarView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const getEventColor = (event: Event): string => {
    // Services - Green
    if (event.type === 'SESSION' && event.service && event.service.length > 0) {
      return '#10B981'; // emerald-500
    }
    // Appointments (Classes) - Purple
    if (event.type === 'APPOINTMENT' && event.service && event.service.length > 0) {
      return '#8B5CF6'; // violet-500
    }
    // Regular Events - Blue
    return '#3B82F6'; // blue-500
  };

  const getEventBackgroundColor = (event: Event): string => {
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

  // Convert our events to Timeline format grouped by date
  const timelineEvents = useMemo(() => {
    const eventsByDate: { [key: string]: TimelineEvent[] } = {};

    mockEvents.forEach((event) => {
      const date = new Date(event.startDateTime).toISOString().split('T')[0];
      
      const timelineEvent: TimelineEvent = {
        id: event.id,
        start: event.startDateTime,
        end: event.endDateTime,
        title: event.title,
        summary: event.location?.videoType?.[0]?.type || '',
        color: getEventColor(event),
        originalEvent: event,
      };

      if (!eventsByDate[date]) {
        eventsByDate[date] = [];
      }
      eventsByDate[date].push(timelineEvent);
    });

    return eventsByDate;
  }, []);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes.toString().padStart(2, '0');
    return `${formattedHours}:${formattedMinutes}${ampm}`;
  };

  const renderEvent = useCallback((event: any) => {
    const timelineEvent = event as TimelineEvent;
    const originalEvent = timelineEvent.originalEvent;
    
    if (!originalEvent) return null;

    const hasVideoLink = originalEvent.location?.videoType && originalEvent.location.videoType.length > 0;
    const videoIcon = originalEvent.externalSource === 'microsoft' ? 'logo-microsoft' : 'videocam';

    return (
      <TouchableOpacity
        style={[
          styles.eventBlock,
          { 
            backgroundColor: getEventBackgroundColor(originalEvent),
            borderLeftColor: getEventColor(originalEvent),
          }
        ]}
        onPress={() => console.log('Event pressed:', originalEvent)}
      >
        <View style={styles.eventContent}>
          <View style={styles.eventHeader}>
            <Text style={styles.eventTime}>
              {formatTime(timelineEvent.start)} - {formatTime(timelineEvent.end)}
            </Text>
            {hasVideoLink && (
              <Ionicons name={videoIcon as any} size={14} color="#6B7280" style={styles.videoIcon} />
            )}
          </View>
          
          <Text style={styles.eventTitle} numberOfLines={2}>
            {timelineEvent.title}
          </Text>

          {originalEvent.isExternal && (
            <View style={styles.externalBadge}>
              <Ionicons 
                name={originalEvent.externalSource === 'google' ? 'logo-google' : 'logo-microsoft'} 
                size={10} 
                color="#6B7280" 
              />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }, []);

  const onDateChanged = useCallback((date: string) => {
    setCurrentDate(date);
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="menu" size={24} color="#111827" />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerMonth}>
            {new Date(currentDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </Text>
        </View>

        <TouchableOpacity style={styles.headerButton}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={20} color="#FFF" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Timeline Calendar */}
      <CalendarProvider
        date={currentDate}
        onDateChanged={onDateChanged}
        showTodayButton
        theme={{
          todayButtonTextColor: '#3B82F6',
        }}
      >
        <TimelineList
          events={timelineEvents}
          renderItem={(timelineProps, info) => {
            const { key, ...timelinePropsWithoutKey } = timelineProps as any;
            return (
              <Timeline
                {...timelinePropsWithoutKey}
                format24h={false}
                start={0}
                end={24}
                overlapEventsSpacing={8}
                rightEdgeSpacing={24}
                renderEvent={renderEvent}
              />
            );
          }}
          scrollToFirst
          showNowIndicator
        />
      </CalendarProvider>

      {/* FAB */}
      <TouchableOpacity style={styles.fab}>
        <Ionicons name="add" size={28} color="#FFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  headerButton: {
    padding: 4,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerMonth: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventBlock: {
    flex: 1,
    borderRadius: 8,
    borderLeftWidth: 4,
    padding: 8,
    marginRight: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  eventContent: {
    flex: 1,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
  },
  videoIcon: {
    marginLeft: 4,
  },
  eventTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
    lineHeight: 16,
  },
  externalBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    padding: 3,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
