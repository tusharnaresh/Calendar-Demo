import { Event } from '@/data/mockEvents'
import { getEventColors } from '@/utils/eventColorSchemes'
import { formatTime } from '@/utils/timeFormatters'
import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

interface EventDetailsModalProps {
    visible: boolean
    event: Event | null
    onClose: () => void
}

export const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
    visible,
    event,
    onClose,
}) => {
    if (!event) return null

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <SafeAreaView style={styles.container}>
                {/* Modal Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color="#6B7280" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Event Details</Text>
                    <View style={styles.spacer} />
                </View>

                <ScrollView
                    style={styles.content}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Event Title */}
                    <View style={styles.section}>
                        <Text style={styles.eventTitle}>{event.title}</Text>
                    </View>

                    {/* Event Time */}
                    <View style={styles.section}>
                        <View style={styles.row}>
                            <Ionicons
                                name="time-outline"
                                size={20}
                                color="#6B7280"
                            />
                            <View style={styles.textContainer}>
                                <Text style={styles.label}>Time</Text>
                                <Text style={styles.value}>
                                    {formatTime(event.startDateTime)} -{' '}
                                    {formatTime(event.endDateTime)}
                                </Text>
                                <Text style={styles.subValue}>
                                    {new Date(
                                        event.startDateTime
                                    ).toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Event Type */}
                    <View style={styles.section}>
                        <View style={styles.row}>
                            <Ionicons
                                name="pricetag-outline"
                                size={20}
                                color="#6B7280"
                            />
                            <View style={styles.textContainer}>
                                <Text style={styles.label}>Type</Text>
                                <View style={styles.typeContainer}>
                                    <View
                                        style={[
                                            styles.typeBadge,
                                            {
                                                backgroundColor:
                                                    getEventColors(event).bg,
                                            },
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.typeText,
                                                {
                                                    color: getEventColors(event)
                                                        .text,
                                                },
                                            ]}
                                        >
                                            {event.type === 'EVENT' && 'Event'}
                                            {event.type === 'SESSION' &&
                                                'Service'}
                                            {event.type === 'APPOINTMENT' &&
                                                'Appointment'}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Location/Video Info */}
                    {event.location && (
                        <View style={styles.section}>
                            <View style={styles.row}>
                                <Ionicons
                                    name="location-outline"
                                    size={20}
                                    color="#6B7280"
                                />
                                <View style={styles.textContainer}>
                                    <Text style={styles.label}>Location</Text>
                                    {event.location.videoType &&
                                    event.location.videoType.length > 0 ? (
                                        <View style={styles.videoContainer}>
                                            <Ionicons
                                                name={
                                                    event.externalSource ===
                                                    'microsoft'
                                                        ? 'logo-microsoft'
                                                        : 'videocam'
                                                }
                                                size={16}
                                                color="#3B82F6"
                                            />
                                            <Text style={styles.videoText}>
                                                {
                                                    event.location.videoType[0]
                                                        .type
                                                }{' '}
                                                Meeting
                                            </Text>
                                        </View>
                                    ) : (
                                        <Text style={styles.value}>
                                            In-person
                                        </Text>
                                    )}
                                </View>
                            </View>
                        </View>
                    )}

                    {/* External Source */}
                    {event.isExternal && (
                        <View style={styles.section}>
                            <View style={styles.row}>
                                <Ionicons
                                    name="cloud-outline"
                                    size={20}
                                    color="#6B7280"
                                />
                                <View style={styles.textContainer}>
                                    <Text style={styles.label}>Source</Text>
                                    <View style={styles.sourceContainer}>
                                        <Ionicons
                                            name={
                                                event.externalSource === 'google'
                                                    ? 'logo-google'
                                                    : 'logo-microsoft'
                                            }
                                            size={16}
                                            color="#6B7280"
                                        />
                                        <Text style={styles.sourceText}>
                                            {event.externalSource === 'google'
                                                ? 'Google Calendar'
                                                : 'Microsoft Calendar'}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Services */}
                    {event.service && event.service.length > 0 && (
                        <View style={styles.section}>
                            <View style={styles.row}>
                                <Ionicons
                                    name="briefcase-outline"
                                    size={20}
                                    color="#6B7280"
                                />
                                <View style={styles.textContainer}>
                                    <Text style={styles.label}>Services</Text>
                                    <View style={styles.servicesContainer}>
                                        {event.service.map((service) => (
                                            <Text
                                                key={service}
                                                style={styles.serviceText}
                                            >
                                                • {service}
                                            </Text>
                                        ))}
                                    </View>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Event ID */}
                    <View style={styles.section}>
                        <View style={styles.row}>
                            <Ionicons
                                name="key-outline"
                                size={20}
                                color="#6B7280"
                            />
                            <View style={styles.textContainer}>
                                <Text style={styles.label}>Event ID</Text>
                                <Text style={styles.value}>{event.id}</Text>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </Modal>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    closeButton: {
        padding: 8,
        marginLeft: -8,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
    },
    spacer: {
        width: 40,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    section: {
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    eventTitle: {
        fontSize: 24,
        fontWeight: '600',
        color: '#111827',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    textContainer: {
        flex: 1,
        marginLeft: 12,
    },
    label: {
        fontSize: 12,
        fontWeight: '500',
        color: '#6B7280',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    value: {
        fontSize: 16,
        color: '#111827',
        marginBottom: 2,
    },
    subValue: {
        fontSize: 14,
        color: '#6B7280',
    },
    typeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    typeBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    typeText: {
        fontSize: 14,
        fontWeight: '500',
    },
    videoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
    },
    videoText: {
        fontSize: 16,
        color: '#111827',
        marginLeft: 8,
    },
    sourceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
    },
    sourceText: {
        fontSize: 16,
        color: '#111827',
        marginLeft: 8,
    },
    servicesContainer: {
        paddingVertical: 4,
    },
    serviceText: {
        fontSize: 16,
        color: '#111827',
        marginBottom: 4,
    },
})
