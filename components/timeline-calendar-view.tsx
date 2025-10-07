import { CalendarHeader } from '@/components/calendar/calendar-header'
import { CalendarSidebar } from '@/components/calendar/calendar-sidebar'
import {
    CalendarErrorState,
    CalendarLoadingState,
} from '@/components/calendar/calendar-states'
import { EventDetailsModal } from '@/components/calendar/event-details-modal'
import { EventCard } from '@/components/event-card'
import { Event } from '@/data/mockEvents'
import { useCalendarEvents } from '@/hooks/use-calendar-events'
import { useMultipleWorkingHours } from '@/hooks/use-working-hours'
import { StorageService } from '@/services/storage'
import { getMonthEndIST, getMonthStartIST } from '@/utils/dateUtils'
import {
    getUnavailableHoursByDayOfWeek,
    UnavailableHoursByDayOfWeek
} from '@/utils/workingHoursConverter'
import { getDay } from 'date-fns'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { StyleSheet } from 'react-native'
import {
    CalendarProvider,
    ExpandableCalendar,
    Timeline,
    TimelineList,
} from 'react-native-calendars'
import { SafeAreaView } from 'react-native-safe-area-context'

// Timeline event format required by react-native-calendars
interface TimelineEvent {
    start: string
    end: string
    title: string
    summary?: string
    color?: string
    id: string
    originalEvent?: Event
}

export const TimelineCalendarView: React.FC = () => {
    const [currentDate, setCurrentDate] = useState<string>(
        new Date().toISOString().split('T')[0]
    )
    const [modalVisible, setModalVisible] = useState(false)
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
    const [sidebarVisible, setSidebarVisible] = useState(false)
    const [numberOfDays, setNumberOfDays] = useState<1 | 3>(1)
    const [contactIds, setContactIds] = useState<string[]>([])
    const [workingHoursReady, setWorkingHoursReady] = useState(false)

    // Load contact IDs from storage
    useEffect(() => {
        const loadContactIds = async () => {
            const ids = await StorageService.getProviderIds()
            setContactIds(ids || [])
        }
        loadContactIds()
    }, [])

    const dateRange = useMemo(() => {
        const date = new Date(currentDate)
        const startDate = getMonthStartIST(date)
        const endDate = getMonthEndIST(date)
        return { startDate, endDate }
    }, [currentDate])

    const {
        workingHoursMap,
        loading: workingHoursLoading,
        error: workingHoursError,
    } = useMultipleWorkingHours(contactIds)

    useEffect(() => {
        if (!workingHoursLoading && workingHoursMap) {
            setWorkingHoursReady(true)
        }
    }, [workingHoursLoading, workingHoursMap])

    const {
        events: apiEvents,
        loading: eventsLoading,
        error: eventsError,
        refetch,
    } = useCalendarEvents({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        autoFetch: workingHoursReady,
    })

    // Combine loading states
    const initialLoading = workingHoursLoading && !workingHoursReady
    const error = workingHoursError || eventsError

    // Convert our events to Timeline format grouped by date
    const timelineEvents = useMemo(() => {
        const eventsByDate: { [key: string]: TimelineEvent[] } = {}

        apiEvents.forEach((event) => {
            const date = new Date(event.startDateTime)
                .toISOString()
                .split('T')[0]

            const timelineEvent: TimelineEvent = {
                id: event.id,
                start: event.startDateTime,
                end: event.endDateTime,
                title: event.title,
                summary: event.location?.videoType?.[0]?.type || '',
                color: event.colorScheme,
                originalEvent: event,
            }

            if (!eventsByDate[date]) {
                eventsByDate[date] = []
            }
            eventsByDate[date].push(timelineEvent)
        })

        return eventsByDate
    }, [apiEvents])

    // Generate unavailable hours map by day of week (0-6)
    // This is calculated once when working hours change, not on every date change
    const unavailableHoursByDayOfWeek: UnavailableHoursByDayOfWeek =
        useMemo(() => {
            if (!workingHoursMap || Object.keys(workingHoursMap).length === 0) {
                // If no working hours loaded yet, show default unavailable hours for all days
                const defaultHours = [
                    { start: 0, end: 8 },
                    { start: 20, end: 24 },
                ]
                // Return same default for all days of week
                return {
                    0: defaultHours, // Sunday
                    1: defaultHours, // Monday
                    2: defaultHours, // Tuesday
                    3: defaultHours, // Wednesday
                    4: defaultHours, // Thursday
                    5: defaultHours, // Friday
                    6: defaultHours, // Saturday
                }
            }

            return getUnavailableHoursByDayOfWeek(workingHoursMap)
        }, [workingHoursMap])

    const renderEvent = useCallback((event: any) => {
        const timelineEvent = event as TimelineEvent
        const originalEvent = timelineEvent.originalEvent
        if (!originalEvent) return null

        return (
            <EventCard
                event={originalEvent}
                onPress={() => {
                    setSelectedEvent(originalEvent)
                    setModalVisible(true)
                }}
            />
        )
    }, [])

    const handleViewChange = useCallback((days: 1 | 3) => {
        setNumberOfDays(days)
        setSidebarVisible(false)
    }, [])

    const onDateChanged = useCallback((date: string) => {
        setCurrentDate(date)
    }, [])

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <CalendarHeader
                currentDate={currentDate}
                onMenuPress={() => setSidebarVisible(true)}
                onRefreshPress={refetch}
                isLoading={initialLoading || eventsLoading}
            />

            {initialLoading && <CalendarLoadingState />}

            {error && !initialLoading && (
                <CalendarErrorState error={error} onRetry={refetch} />
            )}

            {!initialLoading && !error && (
                <CalendarProvider
                    date={currentDate}
                    onDateChanged={onDateChanged}
                    showTodayButton
                    numberOfDays={numberOfDays}
                    theme={{
                        todayButtonTextColor: '#111',
                    }}
                >
                    <ExpandableCalendar
                        firstDay={1}
                        initialDate={currentDate}
                        markedDates={{
                            [currentDate]: {
                                selected: true,
                                selectedColor: '#111',
                            },
                        }}
                        hideArrows={true}
                        renderHeader={() => <></>}
                        theme={{}}
                    />
                    <TimelineList
                        events={timelineEvents}
                        renderItem={(timelineProps: any, info: any) => {
                            const { key, ...timelinePropsWithoutKey } =
                                timelineProps

                            const dayOfWeek = getDay(info.item)

                            // Lookup unavailable hours for this specific day of week
                            const unavailableHours =
                                unavailableHoursByDayOfWeek[dayOfWeek]
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
                                    unavailableHours={unavailableHours}
                                    unavailableHoursColor="#F2F2F2"
                                />
                            )
                        }}
                        scrollToNow
                        scrollToFirst
                        showNowIndicator
                        timelineProps={{ numberOfDays }}
                    />
                </CalendarProvider>
            )}

            <CalendarSidebar
                visible={sidebarVisible}
                numberOfDays={numberOfDays}
                onClose={() => setSidebarVisible(false)}
                onViewChange={handleViewChange}
            />

            <EventDetailsModal
                visible={modalVisible}
                event={selectedEvent}
                onClose={() => {
                    setModalVisible(false)
                    setSelectedEvent(null)
                }}
            />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    calendarProvider: {
        flex: 1,
    },
    fab: {
        position: 'absolute',
        right: 16,
        bottom: 16,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#111',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
})
