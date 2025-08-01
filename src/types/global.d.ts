interface Window {
    ApplePaySession?: {
        canMakePayments: () => boolean;
        new(version: number, request: any): any;
    };
    PaymentRequest?: {
        new(methodData: PaymentMethodData[], details: PaymentDetailsInit): PaymentRequest;
    };
} 