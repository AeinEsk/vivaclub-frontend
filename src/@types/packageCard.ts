import type { ReactNode } from 'react';
export type cardProps = {
    title: string;
    subtitle: string;
    content?: string;
    price: number | null;
    purchase: boolean;
    purchaseFunc?: () => void;
    numberOfTicket?: string | null;
    deactivatedAt?: string | null;
    drawDate?: string | null;
    frequency?: string | null;
    currency?: string | null;
    showCancelAlert?: boolean;
    termsLink?: string; // URL to terms page (membership-specific or default)
    entriesPreview?: ReactNode; // content rendered above Purchase button (e.g., entries breakdown)
};
