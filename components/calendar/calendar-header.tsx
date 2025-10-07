import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

interface CalendarHeaderProps {
    currentDate: string
    onMenuPress: () => void
    onRefreshPress: () => void
    isLoading?: boolean
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
    currentDate,
    onMenuPress,
    onRefreshPress,
    isLoading = false,
}) => {
    return (
        <View style={styles.header}>
            <TouchableOpacity style={styles.headerButton} onPress={onMenuPress}>
                <Ionicons name="menu" size={24} color="#111827" />
            </TouchableOpacity>

            <View style={styles.headerTitleContainer}>
                <Text style={styles.headerMonth}>
                    {new Date(currentDate).toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric',
                    })}
                </Text>
            </View>

            <View style={styles.headerRightButtons}>
                <TouchableOpacity
                    style={styles.headerButton}
                    onPress={onRefreshPress}
                    disabled={isLoading}
                >
                    <Ionicons
                        name="refresh"
                        size={24}
                        color={isLoading ? '#9CA3AF' : '#111827'}
                    />
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    headerButton: {
        padding: 8,
        borderRadius: 8,
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
    headerRightButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#3B82F6',
        alignItems: 'center',
        justifyContent: 'center',
    },
})
