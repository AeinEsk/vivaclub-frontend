export type DrawPayment = {
    count: number;
    drawId: string;
    email: string;
    paymentMethod: string;
    phone?: string;
};

export type PackagePayment = {
    membershipTireId: string;
    email: string;
    paymentMethod: string;
};
