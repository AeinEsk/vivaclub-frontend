export interface PromoPeriod {
    start: string;
    end: string;
    multiplier: number;
}

export interface PromoValidationOptions {
    drawDate?: string;
    runAt?: string;
    timezone?: string;
    isUpdateMode?: boolean;
    validateNotInPast?: boolean; // New option to control past date validation
}

export interface ValidationResult {
    isValid: boolean;
    errorMessage?: string;
}

/**
 * Get current time in specified timezone as datetime-local format
 */
const getNowInTimezone = (timezone?: string): string => {
    if (!timezone) {
        return new Date().toISOString().slice(0, 16);
    }
    
    try {
        const now = new Date();
        const timeInTimezone = new Intl.DateTimeFormat('sv-SE', {
            timeZone: timezone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).format(now);
        
        return timeInTimezone.replace(' ', 'T');
    } catch (error) {
        // Fallback to browser timezone if invalid timezone
        return new Date().toISOString().slice(0, 16);
    }
};

// Add a helper to get now + N minutes in the specified timezone as datetime-local string
const getNowPlusMinutesInTimezone = (timezone: string | undefined, minutesToAdd: number): string => {
    try {
        const date = new Date();
        date.setMinutes(date.getMinutes() + Math.max(0, Math.floor(minutesToAdd)));
        const formatted = new Intl.DateTimeFormat('sv-SE', {
            timeZone: timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
        return formatted.replace(' ', 'T');
    } catch {
        const date = new Date();
        date.setMinutes(date.getMinutes() + Math.max(0, Math.floor(minutesToAdd)));
        return date.toISOString().slice(0, 16);
    }
};

/**
 * Validates promotional periods for forms
 * @param promoPeriods Array of promotional periods to validate
 * @param options Validation options including draw/run date and timezone
 * @returns Validation result with error message if invalid
 */
export const validatePromoPeriods = (
    promoPeriods: PromoPeriod[] | null | undefined,
    options: PromoValidationOptions = {}
): ValidationResult => {
    if (!promoPeriods || promoPeriods.length === 0) {
        return { isValid: true };
    }
    
    // Only validate "not in past" when explicitly requested (form submission)
    // This prevents validation errors when users add periods and then wait before submitting
    const now = options.validateNotInPast ? getNowInTimezone(options.timezone) : null;
    const compareDate = options.drawDate || options.runAt;
    
    for (const period of promoPeriods) {
        // Check if start is before end
        if (period.start && period.end && period.start >= period.end) {
            return {
                isValid: false,
                errorMessage: 'Promotional period start date must be before end date.'
            };
        }
        
        // Check if dates are not in the past (only when explicitly requested)
        if (options.validateNotInPast && now && !options.isUpdateMode) {
            if (period.start && period.start < now) {
                return {
                    isValid: false,
                    errorMessage: 'Promotional period start date must be in the future.'
                };
            }
            
            if (period.end && period.end < now) {
                return {
                    isValid: false,
                    errorMessage: 'Promotional period end date must be in the future.'
                };
            }
        }
        
        // Check if end is not after draw/run date
        if (compareDate && period.end && period.end > compareDate) {
            return {
                isValid: false,
                errorMessage: 'Promotional period end date cannot be after the draw date.'
            };
        }
        
        // Check if multiplier is valid
        if (!period.multiplier || period.multiplier < 1) {
            return {
                isValid: false,
                errorMessage: 'Promotional period multiplier must be at least 1.'
            };
        }
    }

    // Check for overlapping periods
    // Only consider fully specified periods
    const filled = promoPeriods
        .filter(p => !!p.start && !!p.end)
        .map(p => ({ start: p.start, end: p.end }))
        .sort((a, b) => (a.start < b.start ? -1 : a.start > b.start ? 1 : 0));

    for (let i = 1; i < filled.length; i++) {
        const prev = filled[i - 1];
        const curr = filled[i];
        // Overlap exists if curr.start < prev.end (strictly). Touching boundaries are allowed (prev.end <= curr.start)
        if (curr.start < prev.end) {
            return {
                isValid: false,
                errorMessage: 'Promotional periods cannot overlap.'
            };
        }
    }
    
    return { isValid: true };
};

/**
 * Export the timezone helper function for use in components
 */
export { getNowInTimezone, getNowPlusMinutesInTimezone };
