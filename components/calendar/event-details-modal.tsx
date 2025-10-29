import { Event } from '@/data/mockEvents'
import {
    confirmPayment,
    createPaymentIntent,
    getPaymentStatus,
    savePaymentStatus,
} from '@/services/payment-service'
import { getEventColors } from '@/utils/eventColorSchemes'
import { formatTime } from '@/utils/timeFormatters'
import { Ionicons } from '@expo/vector-icons'
import { useStripe } from '@stripe/stripe-react-native'
import React, { useEffect, useState } from 'react'
import {
    ActivityIndicator,
    Alert,
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
    const { initPaymentSheet, presentPaymentSheet } = useStripe()
    const [paymentStatus, setPaymentStatus] = useState<
        Event['paymentStatus'] | null
    >(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const PAYMENT_AMOUNT = 15.0 // $15 constant amount

    useEffect(() => {
        if (event) {
            loadPaymentStatus()
        }
    }, [event])

    const loadPaymentStatus = async () => {
        if (!event) return

        const status = await getPaymentStatus(event.id)
        setPaymentStatus(status?.status || event.paymentStatus || 'unpaid')
    }

    const handlePayment = async () => {
        if (!event) return

        setIsProcessing(true)

        try {
            // Step 1: Create payment intent
            const { clientSecret, paymentIntentId } =
                await createPaymentIntent(event.id, PAYMENT_AMOUNT)

            // Step 2: Initialize payment sheet
            const { error: initError } = await initPaymentSheet({
                merchantDisplayName: 'Calendar Events',
                paymentIntentClientSecret: clientSecret,
                defaultBillingDetails: {
                    name: 'Customer',
                },
            })

            if (initError) {
                Alert.alert('Error', initError.message)
                setIsProcessing(false)
                return
            }

            // Step 3: Present payment sheet
            const { error: presentError } = await presentPaymentSheet()

            if (presentError) {
                if (presentError.code !== 'Canceled') {
                    Alert.alert('Payment Failed', presentError.message)
                }
                setIsProcessing(false)
                return
            }

            // Step 4: Confirm payment on backend
            setPaymentStatus('processing')
            await savePaymentStatus(event.id, 'processing', paymentIntentId)

            const confirmation = await confirmPayment(paymentIntentId)

            if (confirmation.status === 'succeeded') {
                await savePaymentStatus(event.id, 'paid', paymentIntentId)
                setPaymentStatus('paid')
                Alert.alert(
                    'Payment Successful',
                    'Your payment has been processed successfully!'
                )
            } else {
                await savePaymentStatus(event.id, 'failed', paymentIntentId)
                setPaymentStatus('failed')
                Alert.alert('Payment Failed', 'Payment was not completed.')
            }
        } catch (error: any) {
            console.error('Payment error:', error)
            Alert.alert('Error', error.message || 'Payment processing failed')
            await savePaymentStatus(event.id, 'failed')
            setPaymentStatus('failed')
        } finally {
            setIsProcessing(false)
        }
    }

    const getPaymentStatusColor = () => {
        switch (paymentStatus) {
            case 'paid':
                return '#10B981'
            case 'processing':
                return '#F59E0B'
            case 'failed':
                return '#EF4444'
            default:
                return '#6B7280'
        }
    }

    const getPaymentStatusText = () => {
        switch (paymentStatus) {
            case 'paid':
                return 'Paid'
            case 'processing':
                return 'Processing'
            case 'failed':
                return 'Failed'
            default:
                return 'Unpaid'
        }
    }

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

                    {/* Payment Section */}
                    <View style={[styles.section, styles.paymentSection]}>
                        <Text style={styles.paymentSectionTitle}>Payment</Text>

                        <View style={styles.paymentInfo}>
                            <View style={styles.paymentRow}>
                                <Text style={styles.paymentLabel}>Amount</Text>
                                <Text style={styles.paymentValue}>
                                    ${PAYMENT_AMOUNT.toFixed(2)}
                                </Text>
                            </View>

                            <View style={styles.paymentRow}>
                                <Text style={styles.paymentLabel}>Status</Text>
                                <View
                                    style={[
                                        styles.statusBadge,
                                        {
                                            backgroundColor:
                                                getPaymentStatusColor() + '20',
                                        },
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.statusText,
                                            {
                                                color: getPaymentStatusColor(),
                                            },
                                        ]}
                                    >
                                        {getPaymentStatusText()}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {paymentStatus !== 'paid' && (
                            <TouchableOpacity
                                style={[
                                    styles.payButton,
                                    isProcessing && styles.payButtonDisabled,
                                ]}
                                onPress={handlePayment}
                                disabled={isProcessing}
                            >
                                {isProcessing ? (
                                    <ActivityIndicator color="#FFF" />
                                ) : (
                                    <>
                                        <Ionicons
                                            name="card-outline"
                                            size={20}
                                            color="#FFF"
                                        />
                                        <Text style={styles.payButtonText}>
                                            Pay ${PAYMENT_AMOUNT.toFixed(2)}
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        )}

                        {paymentStatus === 'paid' && (
                            <View style={styles.paidContainer}>
                                <Ionicons
                                    name="checkmark-circle"
                                    size={24}
                                    color="#10B981"
                                />
                                <Text style={styles.paidText}>
                                    Payment completed successfully
                                </Text>
                            </View>
                        )}
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
    paymentSection: {
        backgroundColor: '#F9FAFB',
        marginHorizontal: -20,
        paddingHorizontal: 20,
        paddingVertical: 20,
        borderBottomWidth: 0,
    },
    paymentSectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 16,
    },
    paymentInfo: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    paymentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    paymentLabel: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    paymentValue: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 14,
        fontWeight: '600',
    },
    payButton: {
        backgroundColor: '#3B82F6',
        borderRadius: 12,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    payButtonDisabled: {
        backgroundColor: '#93C5FD',
    },
    payButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    paidContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        backgroundColor: '#D1FAE5',
        borderRadius: 12,
        gap: 8,
    },
    paidText: {
        color: '#10B981',
        fontSize: 16,
        fontWeight: '600',
    },
})
