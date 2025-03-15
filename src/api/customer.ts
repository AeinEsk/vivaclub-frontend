import { axiosInstance } from '../utils/axios';

export const getCustomerTickets = (email: string) => {
    return axiosInstance.get(`/auth/customer/tickets?email=${email}`);
}; 