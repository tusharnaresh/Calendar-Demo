import { mockEvents } from '@/data/mockEvents';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { EventCard } from './event-card';

/**
 * EventCardShowcase - Demonstrates all available color schemes and card states
 * This component is useful for design review and testing
 */
export const EventCardShowcase: React.FC = () => {
  // Use events from mockdata with different color schemes matching web calendar
  const showcaseEvents = mockEvents.slice(0, 15).map((event, index) => {
    const colorSchemes = [
      'deep-blue',
      'dark-green',
      'green',
      'yellow',
      'gold',
      'orange',
      'maroon',
      'red',
      'violet',
      'pink',
      'light-pink',
      'grey',
      'internal-event',
      'external-event',
      'out-of-office',
    ] as const;
    return {
      ...event,
      colorScheme: colorSchemes[index],
    };
  });

  const cardStates: ('subtle' | 'medium' | 'active')[] = ['subtle', 'medium', 'active'];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.mainTitle}>Event Card Design Showcase</Text>
        <Text style={styles.subtitle}>
          All available color schemes and card states
        </Text>

        {cardStates.map((state) => (
          <View key={state} style={styles.section}>
            <Text style={styles.sectionTitle}>
              {state.toUpperCase()} State
            </Text>
            <Text style={styles.sectionDescription}>
              {state === 'subtle' && 'Light 15% opacity background (default state)'}
              {state === 'medium' && 'Medium 25% opacity background (hover state)'}
              {state === 'active' && 'Full dark color background for active events'}
            </Text>
            
            {showcaseEvents.map((event) => (
              <EventCard
                key={`${event.id}-${state}`}
                event={{ ...event, cardState: state }}
                onPress={(e) => console.log('Card pressed:', e.title)}
              />
            ))}
          </View>
        ))}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Features</Text>
          {/* Use external events from mockdata if available */}
          {mockEvents.filter(e => e.isExternal).slice(0, 2).map(event => (
            <EventCard
              key={event.id}
              event={event}
              onPress={(e) => console.log('Card pressed:', e.title)}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 16,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
  },
});
