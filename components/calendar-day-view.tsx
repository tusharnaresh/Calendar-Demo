import { Event, mockEvents } from '@/data/mockEvents';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EventCard } from './event-card';

export const CalendarDayView: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Get events for selected date
  const eventsForSelectedDate = useMemo(() => {
    return mockEvents
      .filter((event) => {
        const eventDate = new Date(event.startDateTime).toISOString().split('T')[0];
        return eventDate === selectedDate;
      })
      .sort((a, b) => a.startTime - b.startTime);
  }, [selectedDate]);

  // Get marked dates for calendar
  const markedDates = useMemo(() => {
    const dates: { [key: string]: any } = {};
    
    // Mark all dates that have events
    mockEvents.forEach((event) => {
      const date = new Date(event.startDateTime).toISOString().split('T')[0];
      if (!dates[date]) {
        dates[date] = { marked: true, dotColor: '#3B82F6' };
      }
    });

    // Mark selected date
    dates[selectedDate] = {
      ...dates[selectedDate],
      selected: true,
      selectedColor: '#3B82F6',
    };

    return dates;
  }, [selectedDate]);

  const onDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
  };

  const formatSelectedDate = () => {
    const date = new Date(selectedDate);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    };
    return date.toLocaleDateString('en-US', options);
  };

  const handleEventPress = (event: Event) => {
    // Handle event press - can open a modal or navigate to detail screen
    console.log('Event pressed:', event);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerMonth}>
            {new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </Text>
        </View>

        {/* Profile button removed */}
      </View>

      {/* Calendar */}
      <Calendar
        current={selectedDate}
        onDayPress={onDayPress}
        markedDates={markedDates}
        theme={{
          backgroundColor: '#ffffff',
          calendarBackground: '#ffffff',
          textSectionTitleColor: '#6B7280',
          selectedDayBackgroundColor: '#3B82F6',
          selectedDayTextColor: '#ffffff',
          todayTextColor: '#3B82F6',
          dayTextColor: '#111827',
          textDisabledColor: '#D1D5DB',
          dotColor: '#3B82F6',
          selectedDotColor: '#ffffff',
          arrowColor: '#3B82F6',
          monthTextColor: '#111827',
          indicatorColor: '#3B82F6',
          textDayFontFamily: 'System',
          textMonthFontFamily: 'System',
          textDayHeaderFontFamily: 'System',
          textDayFontWeight: '400',
          textMonthFontWeight: '600',
          textDayHeaderFontWeight: '600',
          textDayFontSize: 14,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 12,
        }}
        enableSwipeMonths={true}
        style={styles.calendar}
      />

      {/* Day View Header */}
      <View style={styles.dayHeader}>
        <Text style={styles.dayHeaderDate}>{formatSelectedDate()}</Text>
        <Text style={styles.dayHeaderCount}>
          {eventsForSelectedDate.length} {eventsForSelectedDate.length === 1 ? 'event' : 'events'}
        </Text>
      </View>

      {/* Events List */}
      <ScrollView style={styles.eventsList} contentContainerStyle={styles.eventsListContent}>
        {eventsForSelectedDate.length > 0 ? (
          eventsForSelectedDate.map((event) => (
            <EventCard key={event.id} event={event} onPress={handleEventPress} />
          ))
        ) : (
          <View style={styles.noEventsContainer}>
            <Ionicons name="calendar-outline" size={48} color="#D1D5DB" />
            <Text style={styles.noEventsText}>No events scheduled</Text>
            {/* Add button removed; keep helpful copy generic */}
            <Text style={styles.noEventsSubtext}>
              Use the controls to add a new event
            </Text>
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      {/* FAB removed */}
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
  calendar: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dayHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dayHeaderDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  dayHeaderCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  eventsList: {
    flex: 1,
  },
  eventsListContent: {
    padding: 16,
  },
  noEventsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  noEventsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
  },
  noEventsSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
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
