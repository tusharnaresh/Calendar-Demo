import { StyleSheet, View } from 'react-native';
import { TimelineCalendarView } from '@/components/timeline-calendar-view';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <TimelineCalendarView />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});
