import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';

export const EventLegend: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Event Types</Text>
      
      <View style={styles.legendItems}>
        <View style={styles.legendItem}>
          <View style={[styles.colorBox, { backgroundColor: Colors.event.background }]}>
            <View style={[styles.colorBar, { backgroundColor: Colors.event.border }]} />
          </View>
          <Text style={styles.legendText}>Events</Text>
        </View>

        <View style={styles.legendItem}>
          <View style={[styles.colorBox, { backgroundColor: Colors.service.background }]}>
            <View style={[styles.colorBar, { backgroundColor: Colors.service.border }]} />
          </View>
          <Text style={styles.legendText}>Services</Text>
        </View>

        <View style={styles.legendItem}>
          <View style={[styles.colorBox, { backgroundColor: Colors.appointment.background }]}>
            <View style={[styles.colorBar, { backgroundColor: Colors.appointment.border }]} />
          </View>
          <Text style={styles.legendText}>Classes</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: Colors.background.secondary,
    borderRadius: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  legendItems: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorBox: {
    width: 32,
    height: 24,
    borderRadius: 4,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  colorBar: {
    width: 4,
  },
  legendText: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
});
