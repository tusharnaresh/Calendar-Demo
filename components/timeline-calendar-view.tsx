import React, { useState, useMemo, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, ScrollView } from 'react-native';
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
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

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
      <View
        style={[
          styles.eventBlock,
          { 
            backgroundColor: getEventBackgroundColor(originalEvent),
            borderLeftColor: getEventColor(originalEvent),
          }
        ]}
      >
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
    );
  }, []);

  const onEventPress = useCallback((event: any) => {
    const timelineEvent = event as TimelineEvent;
    if (timelineEvent.originalEvent) {
      setSelectedEvent(timelineEvent.originalEvent);
      setModalVisible(true);
    }
  }, []);

  const closeModal = useCallback(() => {
    setModalVisible(false);
    setSelectedEvent(null);
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
                onEventPress={onEventPress}
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

      {/* Event Details Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}
      >
        <SafeAreaView style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Event Details</Text>
            <View style={styles.headerSpacer} />
          </View>

          {selectedEvent && (
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* Event Title */}
              <View style={styles.eventDetailSection}>
                <Text style={styles.eventDetailTitle}>{selectedEvent.title}</Text>
              </View>

              {/* Event Time */}
              <View style={styles.eventDetailSection}>
                <View style={styles.detailRow}>
                  <Ionicons name="time-outline" size={20} color="#6B7280" />
                  <View style={styles.detailTextContainer}>
                    <Text style={styles.detailLabel}>Time</Text>
                    <Text style={styles.detailValue}>
                      {formatTime(selectedEvent.startDateTime)} - {formatTime(selectedEvent.endDateTime)}
                    </Text>
                    <Text style={styles.detailSubValue}>
                      {new Date(selectedEvent.startDateTime).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Event Type */}
              <View style={styles.eventDetailSection}>
                <View style={styles.detailRow}>
                  <Ionicons name="pricetag-outline" size={20} color="#6B7280" />
                  <View style={styles.detailTextContainer}>
                    <Text style={styles.detailLabel}>Type</Text>
                    <View style={styles.typeContainer}>
                      <View style={[styles.typeBadge, { backgroundColor: getEventBackgroundColor(selectedEvent) }]}>
                        <Text style={[styles.typeText, { color: getEventColor(selectedEvent) }]}>
                          {selectedEvent.type === 'EVENT' ? 'Event' :
                           selectedEvent.type === 'SESSION' ? 'Service' : 'Appointment'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>

              {/* Location/Video Info */}
              {selectedEvent.location && (
                <View style={styles.eventDetailSection}>
                  <View style={styles.detailRow}>
                    <Ionicons name="location-outline" size={20} color="#6B7280" />
                    <View style={styles.detailTextContainer}>
                      <Text style={styles.detailLabel}>Location</Text>
                      {selectedEvent.location.videoType && selectedEvent.location.videoType.length > 0 ? (
                        <View style={styles.videoContainer}>
                          <Ionicons
                            name={selectedEvent.externalSource === 'microsoft' ? 'logo-microsoft' : 'videocam'}
                            size={16}
                            color="#3B82F6"
                          />
                          <Text style={styles.videoText}>
                            {selectedEvent.location.videoType[0].type} Meeting
                          </Text>
                        </View>
                      ) : (
                        <Text style={styles.detailValue}>In-person</Text>
                      )}
                    </View>
                  </View>
                </View>
              )}

              {/* External Source */}
              {selectedEvent.isExternal && (
                <View style={styles.eventDetailSection}>
                  <View style={styles.detailRow}>
                    <Ionicons name="cloud-outline" size={20} color="#6B7280" />
                    <View style={styles.detailTextContainer}>
                      <Text style={styles.detailLabel}>Source</Text>
                      <View style={styles.externalSourceContainer}>
                        <Ionicons
                          name={selectedEvent.externalSource === 'google' ? 'logo-google' : 'logo-microsoft'}
                          size={16}
                          color="#6B7280"
                        />
                        <Text style={styles.externalSourceText}>
                          {selectedEvent.externalSource === 'google' ? 'Google Calendar' : 'Microsoft Calendar'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              )}

              {/* Services (if applicable) */}
              {selectedEvent.service && selectedEvent.service.length > 0 && (
                <View style={styles.eventDetailSection}>
                  <View style={styles.detailRow}>
                    <Ionicons name="briefcase-outline" size={20} color="#6B7280" />
                    <View style={styles.detailTextContainer}>
                      <Text style={styles.detailLabel}>Services</Text>
                      <View style={styles.servicesContainer}>
                        {selectedEvent.service.map((service, index) => (
                          <Text key={index} style={styles.serviceText}>• {service}</Text>
                        ))}
                      </View>
                    </View>
                  </View>
                </View>
              )}

              {/* Event ID */}
              <View style={styles.eventDetailSection}>
                <View style={styles.detailRow}>
                  <Ionicons name="key-outline" size={20} color="#6B7280" />
                  <View style={styles.detailTextContainer}>
                    <Text style={styles.detailLabel}>Event ID</Text>
                    <Text style={styles.detailValue}>{selectedEvent.id}</Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
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
    padding: 10,
    justifyContent: 'flex-start',
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  eventTime: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  videoIcon: {
    marginLeft: 4,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    lineHeight: 18,
  },
  externalBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 10,
    padding: 4,
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
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  closeButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  headerSpacer: {
    width: 40,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  eventDetailSection: {
    marginBottom: 24,
  },
  eventDetailTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  detailTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#111827',
    marginBottom: 2,
  },
  detailSubValue: {
    fontSize: 14,
    color: '#6B7280',
  },
  typeContainer: {
    flexDirection: 'row',
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  typeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  videoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  videoText: {
    fontSize: 16,
    color: '#3B82F6',
    marginLeft: 8,
  },
  externalSourceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  externalSourceText: {
    fontSize: 16,
    color: '#6B7280',
    marginLeft: 8,
  },
  servicesContainer: {
    marginTop: 4,
  },
  serviceText: {
    fontSize: 16,
    color: '#111827',
    marginBottom: 4,
  },
});
