import { EventCard } from '@/components/event-card';
import { Event, mockEvents } from '@/data/mockEvents';
import { getEventColors } from '@/utils/eventColorSchemes';
import { formatTime } from '@/utils/timeFormatters';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useMemo, useState, useRef } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, Animated } from 'react-native';
import { CalendarProvider, Timeline, TimelineList } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';

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
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [numberOfDays, setNumberOfDays] = useState<1 | 3>(1);
  // animated value for horizontal slide (-280 is off-screen to the left)
  const slideAnim = useRef(new Animated.Value(-280)).current;

  const getEventColor = useCallback((event: Event): string => {
    return getEventColors(event).border;
  }, []);

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
        color: "#fff",
        originalEvent: event,
      };

      if (!eventsByDate[date]) {
        eventsByDate[date] = [];
      }
      eventsByDate[date].push(timelineEvent);
    });

    return eventsByDate;
  }, [getEventColor]);

  const renderEvent = useCallback((event: any) => {
    const timelineEvent = event as TimelineEvent;
    const originalEvent = timelineEvent.originalEvent;
    
    if (!originalEvent) return null;

    return (
      <EventCard 
        event={originalEvent}
        onPress={() => {
          setSelectedEvent(originalEvent);
          setModalVisible(true);
        }}
      />
    );
  }, []);

  const closeModal = useCallback(() => {
    setModalVisible(false);
    setSelectedEvent(null);
  }, []);

  const toggleSidebar = useCallback(() => {
    if (sidebarVisible) {
      // slide out then hide
      Animated.timing(slideAnim, {
        toValue: -280,
        duration: 250,
        useNativeDriver: true,
      }).start(() => setSidebarVisible(false));
    } else {
      setSidebarVisible(true);
      // small delay to ensure modal rendered
      requestAnimationFrame(() => {
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }).start();
      });
    }
  }, [sidebarVisible, slideAnim]);

  const handleViewChange = useCallback((days: 1 | 3) => {
    setNumberOfDays(days);
    // animate sidebar closing
    Animated.timing(slideAnim, {
      toValue: -280,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setSidebarVisible(false));
  }, [slideAnim]);

  const onDateChanged = useCallback((date: string) => {
    setCurrentDate(date);
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={toggleSidebar}>
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
        numberOfDays={numberOfDays}
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
                scrollToFirst={true}
                unavailableHours={[{start: 0, end: 11}, {start: 22, end: 24}]}
                unavailableHoursColor='#F2F2F2'
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

      {/* Sidebar (animated horizontally) */}
      <Modal
        visible={sidebarVisible}
        animationType="none"
        transparent
        onRequestClose={toggleSidebar}
      >
        <TouchableOpacity
          style={styles.sidebarOverlay}
          activeOpacity={1}
          onPress={toggleSidebar}
        >
          {/* Animated sliding panel */}
          <Animated.View
            style={[
              styles.sidebar,
              { transform: [{ translateX: slideAnim }] },
            ]}
          >
            <View style={styles.sidebarHeader}>
              <Text style={styles.sidebarTitle}>Calendar View</Text>
              <TouchableOpacity onPress={toggleSidebar} style={styles.sidebarCloseButton}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.sidebarContent}>
              <Text style={styles.sidebarSectionTitle}>View Options</Text>

              <TouchableOpacity
                style={[
                  styles.sidebarOption,
                  numberOfDays === 1 && styles.sidebarOptionActive,
                ]}
                onPress={() => handleViewChange(1)}
              >
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={numberOfDays === 1 ? '#3B82F6' : '#6B7280'}
                />
                <Text
                  style={[
                    styles.sidebarOptionText,
                    numberOfDays === 1 && styles.sidebarOptionTextActive,
                  ]}
                >
                  1 Day
                </Text>
                {numberOfDays === 1 && (
                  <Ionicons name="checkmark" size={20} color="#3B82F6" style={styles.checkmark} />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.sidebarOption,
                  numberOfDays === 3 && styles.sidebarOptionActive,
                ]}
                onPress={() => handleViewChange(3)}
              >
                <Ionicons
                  name="calendar"
                  size={20}
                  color={numberOfDays === 3 ? '#3B82F6' : '#6B7280'}
                />
                <Text
                  style={[
                    styles.sidebarOptionText,
                    numberOfDays === 3 && styles.sidebarOptionTextActive,
                  ]}
                >
                  3 Days
                </Text>
                {numberOfDays === 3 && (
                  <Ionicons name="checkmark" size={20} color="#3B82F6" style={styles.checkmark} />
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </Modal>

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
                      <View style={[styles.typeBadge, { backgroundColor: getEventColors(selectedEvent).bg }]}>
                        <Text style={[styles.typeText, { color: getEventColors(selectedEvent).text }]}>
                          {selectedEvent.type === 'EVENT' && 'Event'}
                          {selectedEvent.type === 'SESSION' && 'Service'}
                          {selectedEvent.type === 'APPOINTMENT' && 'Appointment'}
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
                        {selectedEvent.service.map((service) => (
                          <Text key={service} style={styles.serviceText}>• {service}</Text>
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
  // Sidebar Styles
  sidebarOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
  },
  sidebar: {
    width: 280,
    height: '100%',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sidebarTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  sidebarCloseButton: {
    padding: 4,
  },
  sidebarContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sidebarSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sidebarOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#F9FAFB',
  },
  sidebarOptionActive: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  sidebarOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginLeft: 12,
    flex: 1,
  },
  sidebarOptionTextActive: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  checkmark: {
    marginLeft: 'auto',
  },
});
