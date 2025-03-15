export type cardProps = {
    title: string;
    subtitle: string;
    content?: string;
    price: number | null;
    purchase: boolean;
    purchaseFunc?: () => void;
    chanceOfWin?: string | null;
    deactivatedAt?: string | null;
    drawDate?: string | null;
    frequency?: string | null;
    currency?: string | null;
    showCancelAlert?: boolean;
};
