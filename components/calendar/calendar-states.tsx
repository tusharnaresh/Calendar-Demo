import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

interface CalendarLoadingStateProps {
    message?: string
}

export const CalendarLoadingState: React.FC<CalendarLoadingStateProps> = ({
    message = 'Loading working hours...',
}) => {
    return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#111827" />
            <Text style={styles.loadingText}>{message}</Text>
        </View>
    )
}

interface CalendarErrorStateProps {
    error: string
    onRetry: () => void
}

export const CalendarErrorState: React.FC<CalendarErrorStateProps> = ({
    error,
    onRetry,
}) => {
    return (
        <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
            <Text style={styles.errorTitle}>Unable to Load Calendar</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
                <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#6B7280',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF',
        paddingHorizontal: 32,
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#111827',
        marginTop: 16,
        marginBottom: 8,
    },
    errorText: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 24,
    },
    retryButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: '#111827',
        borderRadius: 8,
    },
    retryButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFF',
    },
})
