import { WorkingHoursData } from '@/services/working-hours-service'

/**
 * Unavailable hour range for Timeline component
 */
export interface UnavailableHour {
    start: number // hour (0-23)
    end: number // hour (0-23)
}

/**
 * Map of day of week (0-6) to unavailable hours
 * 0 = Sunday, 1 = Monday, ..., 6 = Saturday
 */
export type UnavailableHoursByDayOfWeek = Record<number, UnavailableHour[]>

/**
 * Generates a map of unavailable hours by day of week from working hours
 * This is more efficient than calculating for each date individually
 * 
 * @param workingHoursMap - Map of contact IDs to their working hours
 * @returns Map where key is day of week (0-6) and value is unavailable hours array
 */
export const getUnavailableHoursByDayOfWeek = (
    workingHoursMap: Record<string, WorkingHoursData>
): UnavailableHoursByDayOfWeek => {
    const result: UnavailableHoursByDayOfWeek = {}

    if (!workingHoursMap || Object.keys(workingHoursMap).length === 0) {
        // If no working hours defined, return empty map (everything is available)
        return result
    }

    // Generate unavailable hours for each day of week (0-6)
    for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
        const workingRanges: { start: number; end: number }[] = []

        // Collect all working hour ranges for this day across all contacts
        Object.values(workingHoursMap).forEach((workingHours) => {
            workingHours.blocks.forEach((block) => {
                if (block.daysOfWeek.includes(dayOfWeek)) {
                    const startHour = convertTimeToDecimalHours(block.startTime)
                    const endHour = convertTimeToDecimalHours(block.endTime)
                    workingRanges.push({ start: startHour, end: endHour })
                }
            })
        })

        // If no working hours for this day, mark entire day as unavailable
        if (workingRanges.length === 0) {
            result[dayOfWeek] = [{ start: 0, end: 24 }]
        } else {
            // Merge overlapping working hour ranges
            const mergedRanges = mergeTimeRanges(workingRanges)
            // Invert: convert working hours to unavailable hours
            result[dayOfWeek] = invertTimeRanges(mergedRanges)
        }
    }

    return result
}

/**
 * Converts working hours blocks to unavailable hours for a specific date
 * This inverts the working hours - everything outside working hours becomes unavailable
 * 
 * @param workingHoursMap - Map of contact IDs to their working hours
 * @param date - Date string (YYYY-MM-DD)
 * @returns Array of unavailable hour ranges for the timeline
 */
export const getUnavailableHoursForDate = (
    workingHoursMap: Record<string, WorkingHoursData>,
    date: string
): UnavailableHour[] => {
    if (!workingHoursMap || Object.keys(workingHoursMap).length === 0) {
        // If no working hours defined, everything is available
        return []
    }

    // Get day of week for the date (0 = Sunday, 6 = Saturday)
    const dayOfWeek = new Date(date).getDay()

    // Collect all working hour ranges for this day across all contacts
    const workingRanges: { start: number; end: number }[] = []

    Object.values(workingHoursMap).forEach((workingHours) => {
        workingHours.blocks.forEach((block) => {
            // Check if this block applies to the current day of week
            if (block.daysOfWeek.includes(dayOfWeek)) {
                // Convert time string (HH:mm) to decimal hours
                const startHour = convertTimeToDecimalHours(block.startTime)
                const endHour = convertTimeToDecimalHours(block.endTime)
                
                workingRanges.push({ start: startHour, end: endHour })
            }
        })
    })

    // If no working hours for this day, mark entire day as unavailable
    if (workingRanges.length === 0) {
        return [{ start: 0, end: 24 }]
    }

    // Merge overlapping working hour ranges
    const mergedRanges = mergeTimeRanges(workingRanges)

    // Invert: convert working hours to unavailable hours
    return invertTimeRanges(mergedRanges)
}

/**
 * Converts time string in HH:mm format to decimal hours
 * Example: "09:30" -> 9.5, "14:00" -> 14
 */
const convertTimeToDecimalHours = (timeString: string): number => {
    const [hours, minutes] = timeString.split(':').map(Number)
    return hours + (minutes / 60)
}

/**
 * Merges overlapping time ranges
 * Example: [{start: 9, end: 12}, {start: 11, end: 15}] -> [{start: 9, end: 15}]
 */
const mergeTimeRanges = (ranges: { start: number; end: number }[]): { start: number; end: number }[] => {
    if (ranges.length === 0) return []

    // Sort by start time
    const sorted = [...ranges].sort((a, b) => a.start - b.start)
    const merged: { start: number; end: number }[] = [sorted[0]]

    for (let i = 1; i < sorted.length; i++) {
        const current = sorted[i]
        const lastMerged = merged[merged.length - 1]

        // If current range overlaps or touches the last merged range
        if (current.start <= lastMerged.end) {
            // Extend the last merged range
            lastMerged.end = Math.max(lastMerged.end, current.end)
        } else {
            // Add as new range
            merged.push(current)
        }
    }

    return merged
}

/**
 * Inverts time ranges to get unavailable hours
 * Example: Working hours [{start: 9, end: 17}] -> Unavailable hours [{start: 0, end: 9}, {start: 17, end: 24}]
 */
const invertTimeRanges = (workingRanges: { start: number; end: number }[]): UnavailableHour[] => {
    const unavailable: UnavailableHour[] = []

    // If first working range doesn't start at 0, add unavailable range at the beginning
    if (workingRanges[0].start > 0) {
        unavailable.push({
            start: 0,
            end: Math.floor(workingRanges[0].start) // Round down to nearest hour
        })
    }

    // Add unavailable ranges between working ranges
    for (let i = 0; i < workingRanges.length - 1; i++) {
        const currentEnd = workingRanges[i].end
        const nextStart = workingRanges[i + 1].start

        if (nextStart > currentEnd) {
            unavailable.push({
                start: Math.ceil(currentEnd), // Round up to next hour
                end: Math.floor(nextStart) // Round down to nearest hour
            })
        }
    }

    // If last working range doesn't end at 24, add unavailable range at the end
    const lastRange = workingRanges[workingRanges.length - 1]
    if (lastRange.end < 24) {
        unavailable.push({
            start: Math.ceil(lastRange.end), // Round up to next hour
            end: 24
        })
    }

    return unavailable
}

/**
 * Gets unavailable hours per date for a range of dates
 * Useful for timeline components that need unavailable hours for multiple days
 * 
 * @param workingHoursMap - Map of contact IDs to their working hours
 * @param dates - Array of date strings (YYYY-MM-DD)
 * @returns Map of date -> unavailable hours array
 */
export const getUnavailableHoursForDates = (
    workingHoursMap: Record<string, WorkingHoursData>,
    dates: string[]
): Record<string, UnavailableHour[]> => {
    const result: Record<string, UnavailableHour[]> = {}

    dates.forEach((date) => {
        result[date] = getUnavailableHoursForDate(workingHoursMap, date)
    })

    return result
}
