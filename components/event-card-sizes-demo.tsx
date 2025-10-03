import { mockEvents } from '@/data/mockEvents';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { CardSize, EventCard } from './event-card';

/**
 * EventCardSizesDemo - Demonstrates all card size variants
 * Shows how cards adapt to different layout contexts
 */
export const EventCardSizesDemo: React.FC = () => {
  // Use first 4 events from mockdata for different size demos
  const sampleEvent = mockEvents[0];
  const serviceEvent = mockEvents.find(e => e.type === 'SESSION') || mockEvents[1];
  const appointmentEvent = mockEvents.find(e => e.type === 'APPOINTMENT') || mockEvents[2];
  const urgentEvent = mockEvents[3] || mockEvents[0];

  const sizes: { size: CardSize; description: string; useCase: string }[] = [
    {
      size: 'large',
      description: 'Large (Default)',
      useCase: 'List views, timeline with vertical space',
    },
    {
      size: 'medium',
      description: 'Medium',
      useCase: 'Compact lists, week views with limited space',
    },
    {
      size: 'small',
      description: 'Small',
      useCase: 'Month views, multi-day calendar grids',
    },
    {
      size: 'tiny',
      description: 'Tiny',
      useCase: 'Dense calendar views, year overview',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.mainTitle}>Event Card Size Variants</Text>
        <Text style={styles.subtitle}>
          Responsive card sizes for different calendar layouts
        </Text>

        {sizes.map(({ size, description, useCase }) => (
          <View key={size} style={styles.section}>
            <Text style={styles.sectionTitle}>{description}</Text>
            <Text style={styles.useCase}>{useCase}</Text>

            <View style={styles.cardsGrid}>
              <View style={styles.cardWrapper}>
                <Text style={styles.cardLabel}>Regular Event (Blue)</Text>
                <EventCard event={sampleEvent} size={size} />
              </View>

              <View style={styles.cardWrapper}>
                <Text style={styles.cardLabel}>Service (Teal)</Text>
                <EventCard event={serviceEvent} size={size} />
              </View>

              <View style={styles.cardWrapper}>
                <Text style={styles.cardLabel}>Class (Purple)</Text>
                <EventCard event={appointmentEvent} size={size} />
              </View>

              <View style={styles.cardWrapper}>
                <Text style={styles.cardLabel}>Urgent (Red)</Text>
                <EventCard event={urgentEvent} size={size} />
              </View>
            </View>
          </View>
        ))}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fixed Width Examples</Text>
          <Text style={styles.useCase}>
            Cards with constrained widths for grid layouts
          </Text>

          <View style={styles.gridContainer}>
            <View style={styles.gridColumn}>
              <Text style={styles.columnLabel}>Small cards</Text>
              <EventCard event={sampleEvent} size="small" />
              <EventCard event={serviceEvent} size="small" />
            </View>

            <View style={styles.gridColumn}>
              <Text style={styles.columnLabel}>Medium cards</Text>
              <EventCard event={appointmentEvent} size="medium" />
              <EventCard event={urgentEvent} size="medium" />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fixed Height Examples</Text>
          <Text style={styles.useCase}>
            Cards with constrained heights for timeline views
          </Text>

          <View style={styles.heightExamples}>
            <View style={styles.heightExample}>
              <Text style={styles.columnLabel}>40px height</Text>
              <EventCard event={sampleEvent} size="tiny" height={40} />
            </View>

            <View style={styles.heightExample}>
              <Text style={styles.columnLabel}>60px height</Text>
              <EventCard event={serviceEvent} size="small" height={60} />
            </View>

            <View style={styles.heightExample}>
              <Text style={styles.columnLabel}>80px height</Text>
              <EventCard event={appointmentEvent} size="medium" height={80} />
            </View>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Usage Guidelines</Text>
          <Text style={styles.infoText}>
            • <Text style={styles.infoBold}>Large:</Text> Default size for list views and timelines with ample space
          </Text>
          <Text style={styles.infoText}>
            • <Text style={styles.infoBold}>Medium:</Text> Compact view for week calendars or limited vertical space
          </Text>
          <Text style={styles.infoText}>
            • <Text style={styles.infoBold}>Small:</Text> Month grid cells or multi-day overview
          </Text>
          <Text style={styles.infoText}>
            • <Text style={styles.infoBold}>Tiny:</Text> Dense calendar views, year overview, or status indicators
          </Text>
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
  useCase: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  cardsGrid: {
    gap: 12,
  },
  cardWrapper: {
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '500',
  },
  gridContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  gridColumn: {
    flex: 1,
  },
  columnLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 6,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  heightExamples: {
    gap: 16,
  },
  heightExample: {
    marginBottom: 12,
  },
  infoBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#1E3A8A',
    marginBottom: 8,
    lineHeight: 20,
  },
  infoBold: {
    fontWeight: '700',
  },
});
