import { Ionicons } from '@expo/vector-icons'
import React, { useCallback, useEffect, useRef } from 'react'
import {
    Animated,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'

interface CalendarSidebarProps {
    visible: boolean
    numberOfDays: 1 | 3
    onClose: () => void
    onViewChange: (days: 1 | 3) => void
}

export const CalendarSidebar: React.FC<CalendarSidebarProps> = ({
    visible,
    numberOfDays,
    onClose,
    onViewChange,
}) => {
    const slideAnim = useRef(new Animated.Value(-280)).current

    useEffect(() => {
        if (visible) {
            // Slide in
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }).start()
        } else {
            // Slide out
            Animated.timing(slideAnim, {
                toValue: -280,
                duration: 250,
                useNativeDriver: true,
            }).start()
        }
    }, [visible, slideAnim])

    const handleViewChange = useCallback(
        (days: 1 | 3) => {
            onViewChange(days)
            // Animate close
            Animated.timing(slideAnim, {
                toValue: -280,
                duration: 250,
                useNativeDriver: true,
            }).start()
        },
        [onViewChange, slideAnim]
    )

    return (
        <Modal
            visible={visible}
            animationType="none"
            transparent
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={onClose}
            >
                <Animated.View
                    style={[
                        styles.sidebar,
                        { transform: [{ translateX: slideAnim }] },
                    ]}
                >
                    <View style={styles.header}>
                        <Text style={styles.title}>Calendar View</Text>
                        <TouchableOpacity
                            onPress={onClose}
                            style={styles.closeButton}
                        >
                            <Ionicons name="close" size={24} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.content}>
                        <Text style={styles.sectionTitle}>View Options</Text>

                        <TouchableOpacity
                            style={[
                                styles.option,
                                numberOfDays === 1 && styles.optionActive,
                            ]}
                            onPress={() => handleViewChange(1)}
                        >
                            <Ionicons
                                name="calendar-outline"
                                size={20}
                                color={
                                    numberOfDays === 1 ? '#3B82F6' : '#6B7280'
                                }
                            />
                            <Text
                                style={[
                                    styles.optionText,
                                    numberOfDays === 1 &&
                                        styles.optionTextActive,
                                ]}
                            >
                                1 Day
                            </Text>
                            {numberOfDays === 1 && (
                                <Ionicons
                                    name="checkmark"
                                    size={20}
                                    color="#3B82F6"
                                    style={styles.checkmark}
                                />
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.option,
                                numberOfDays === 3 && styles.optionActive,
                            ]}
                            onPress={() => handleViewChange(3)}
                        >
                            <Ionicons
                                name="calendar"
                                size={20}
                                color={
                                    numberOfDays === 3 ? '#3B82F6' : '#6B7280'
                                }
                            />
                            <Text
                                style={[
                                    styles.optionText,
                                    numberOfDays === 3 &&
                                        styles.optionTextActive,
                                ]}
                            >
                                3 Days
                            </Text>
                            {numberOfDays === 3 && (
                                <Ionicons
                                    name="checkmark"
                                    size={20}
                                    color="#3B82F6"
                                    style={styles.checkmark}
                                />
                            )}
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </TouchableOpacity>
        </Modal>
    )
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-start',
    },
    sidebar: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 280,
        backgroundColor: '#FFF',
        shadowColor: '#000',
        shadowOffset: {
            width: 2,
            height: 0,
        },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: '#111827',
    },
    closeButton: {
        padding: 4,
    },
    content: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6B7280',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 12,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginBottom: 8,
        backgroundColor: '#F9FAFB',
    },
    optionActive: {
        backgroundColor: '#EFF6FF',
        borderWidth: 1,
        borderColor: '#BFDBFE',
    },
    optionText: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
        color: '#374151',
    },
    optionTextActive: {
        fontWeight: '600',
        color: '#1E40AF',
    },
    checkmark: {
        marginLeft: 8,
    },
})
