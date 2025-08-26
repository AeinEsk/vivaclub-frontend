import { axiosInstance } from '../utils/axios';

const OTP = '/auth/otp';
const EXISTS = '/auth/exists';
const OTP_LOGIN = '/auth/login-otp';
const OTP_REGISTER = '/auth/register';
const PAYMENT_OTP = '/auth/customer/otp';
const CUSTOMER_OTP = '/auth/customer/otp';
const CUSTOMER_VERIFY = '/auth/customer/verify-otp';

export const otpRequest = (email: string) => {
    const payload = { username: email };
    return axiosInstance.post(OTP, payload);
};

export const checkUserExists = (email: string) => {
    const params = new URLSearchParams({ username: email });
    return axiosInstance.get(`${EXISTS}?${params.toString()}`);
};

// createOnly/checkOnly are no longer used; OTP flow is restored

export const otpLogin = (username: string, otp: string) => {
    const payload = {
        username,
        otp
    };
    return axiosInstance.post(OTP_LOGIN, payload);
};

export const otpRegister = (username: string, password: string, otp: string) => {
    const payload = {
        username,
        password,
        otp
    };
    return axiosInstance.post(OTP_REGISTER, payload);
};

export const paymentOtpRequest = (email: string) => {
    const payload = { username: email };
    return axiosInstance.post(PAYMENT_OTP, payload);
};

export const customerOtpRequest = (email: string) => {
    return axiosInstance.post(CUSTOMER_OTP, { 
        username:email,
    });
};

export const verifyCustomerOtp = (email: string, otp: string, sessionId: string) => {
    return axiosInstance.post(CUSTOMER_VERIFY, { 
        username:email, 
        otp,
        sessionId,
    });
};
