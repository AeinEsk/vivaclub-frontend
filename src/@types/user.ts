export type UserLogin = {
    username: string;
    password: string;
};

type StripeCapabilities = {
    bancontact_payments: string;
    blik_payments: string;
    card_payments: string;
    eps_payments: string;
    klarna_payments: string;
    link_payments: string;
    p24_payments: string;
    revolut_pay_payments: string;
    transfers: string;
};

type StripeData = {
    capabilities: StripeCapabilities;
    email: string;
    currentlyDue: any[];
    pastDue: any[];
};

export type User = {
    email: string | null;
    isAuthenticated: boolean;
    imageUrl: string | null;
    isStipeConnected: boolean;
    stripeId: string;
    stripeData: StripeData | undefined;
};

export type UserInfo = {
    id: number;
    email: string;
    password: string;
    role: string;
};
