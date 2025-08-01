export const dateConverter = (date: string, type: string, monthType?: string) => {
    if (!date) return '';
    
    try {
        const rDate = new Date(date);
        if (isNaN(rDate.getTime())) return '';

        // For YMD-HMS format, let's handle it separately with more control
        if (type === 'YMD-HMS') {
            const formatter = new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: 'short',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
                timeZone: 'UTC'  // Use UTC to avoid timezone issues in Docker
            });

            const parts = formatter.formatToParts(rDate);
            const values: { [key: string]: string } = {};
            parts.forEach(part => {
                values[part.type] = part.value;
            });

            // Return as array of [date, month, time]
            return `${values.day} ${values.month} ${values.year},${values.hour}:${values.minute}${values.dayPeriod}`;
        }

        // Rest of the code for other formats...
        let month: string;
        if (monthType === 'long') {
            month = rDate.toLocaleString('en-US', { month: 'long' });
        } else if (monthType === 'short') {
            month = rDate.toLocaleString('en-US', { month: 'short' });
        } else {
            month = (rDate.getMonth() + 1).toString().padStart(2, '0');
        }

        switch (type) {
            case 'YMD':
                return `${rDate.getFullYear()}-${month}-${rDate.getDate().toString().padStart(2, '0')}`;
            case 'DMY':
                return `${rDate.getDate().toString().padStart(2, '0')}-${month}-${rDate.getFullYear()}`;
            default:
                return '';
        }
    } catch (error) {
        console.error('Date conversion error:', error);
        return '';
    }
};
