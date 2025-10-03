# React Native Calendar App

A modern calendar application built with React Native and Expo, featuring day view with custom event cards.

## Features

### Calendar Functionality
- **Month View Calendar**: Interactive calendar with date selection
- **Day View**: Detailed day view showing all events for selected date
- **Event Markers**: Visual indicators on dates with scheduled events
- **Swipe Navigation**: Swipe between months

### Event Types & Styling

#### 1. Regular Events (Light Blue)
- Background: `#DBEAFE` (blue-100)
- Border: `#3B82F6` (blue-500)
- Used for: Team meetings, general events, DSMs

#### 2. Service/Sessions (Light Green)
- Background: `#D1FAE5` (emerald-100)
- Border: `#10B981` (emerald-500)
- Used for: Client sessions, webinars, training sessions

#### 3. Appointments/Classes (Light Purple)
- Background: `#EDE9FE` (violet-100)
- Border: `#8B5CF6` (violet-500)
- Used for: Individual appointments, coaching sessions, classes

### Event Card Features
- **Time Display**: Start and end times in 12-hour format
- **Video Conference Icons**: Shows Google Meet or Microsoft Teams icons
- **External Event Badges**: Indicates if event is from Google Calendar or Microsoft Outlook
- **Color-coded Left Border**: Quick visual identification of event type
- **Touch Feedback**: Interactive cards with press handling

## Get started

1. Install dependencies

   ```bash
   pnpm install
   ```

2. Start the app

   ```bash
   pnpm start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

## Components

### CalendarDayView
Main component featuring:
- Header with month navigation
- Calendar widget
- Day header with event count
- Scrollable events list
- Floating Action Button (FAB) for adding events

### EventCard
Reusable event card component with:
- Customizable styling based on event type
- Time formatting
- Video conference indicators
- External source badges

## Dependencies

- `react-native-calendars`: Calendar component library
- `@expo/vector-icons`: Icon library (Ionicons)
- Expo SDK 54

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
