export type DrawPayment = {
    count: number;
    drawId: string;
    email: string;
    paymentMethod: string;
};

export type PackagePayment = {
    membershipTireId: string;
    email: string;
    paymentMethod: string;
};
