import { DrawPayment, PackagePayment } from '../@types/payment';
import { axiosInstance } from '../utils/axios';

const DRAW_PAYMENT = '/public/payment';
const PACKAGE_PAYMENT = '/public/payment/membership';
const REFUND_PAYMENT = '/public/payment/cancel';

export const drawPaymentRequest = (paymentData: DrawPayment) => {
    const payload = {
        count: paymentData.count,
        drawID: paymentData.drawId,
        email: paymentData.email,
        // otp: paymentData.otp,
        paymentMethod: paymentData.paymentMethod
    };
    return axiosInstance.post(DRAW_PAYMENT, payload);
};

export const packagePaymentRequest = (paymentData: PackagePayment) => {
    const payload = {
        membershipTireId: paymentData.membershipTireId,
        email: paymentData.email,
        // otp: paymentData.otp,
        paymentMethod: paymentData.paymentMethod
    };
    return axiosInstance.post(PACKAGE_PAYMENT, payload);
};

export const refundPaymentRequest = (paymentId: string, email: string, otp: string) => {
    const payload = {
        paymentId: paymentId,
        email: email,
        otp: otp
    };
    return axiosInstance.post(REFUND_PAYMENT, payload);
};
