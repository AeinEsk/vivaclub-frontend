import { axiosInstance } from '../utils/axios';

const AUTH = '/auth/login/';
const GET_ME = '/api/me/';
const STRIPE = '/api/create-stripe/';
const RESET_PASS = '/auth/password/';

export const login = (username: string, password: string) => {
    return axiosInstance.post(AUTH, { username, password });
};

export const getMe = () => {
    return axiosInstance.get(GET_ME);
};

export const createStripe = () => {
    return axiosInstance.get(STRIPE);
};

export const resetPassword = (username: string, password: string, otp: string) => {
    const payload = {
        username,
        password,
        otp
    };
    return axiosInstance.post(RESET_PASS, payload);
};
