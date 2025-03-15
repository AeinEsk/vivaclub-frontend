export const dateConverter = (date: string, type: string, monthType?: string) => {
    let month: any;
    if (date != '' && date != null) {
        const rDate = new Date(date);

        if (monthType == 'long') {
            month = rDate.toLocaleString('en-US', { month: 'long' });
        } else if (monthType == 'short') {
            month = rDate.toLocaleString('en-US', { month: 'short' });
        }

        switch (type) {
            case 'YMD':
                return `${rDate.getFullYear()}-${
                    monthType ? month : (rDate.getMonth() + 1).toString().padStart(2, '0')
                }-${rDate.getDate().toString().padStart(2, '0')}`;
            case 'DMY':
                return `${rDate.getDate().toString().padStart(2, '0')}-${
                    monthType ? month : (rDate.getMonth() + 1).toString().padStart(2, '0')
                }-${rDate.getFullYear()}`;
            case 'YMD-HMS':
                return new Intl.DateTimeFormat((navigator && navigator.language) || 'en', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric'
                }).format(new Date(date));
        }
    } else {
        return '';
    }
};
