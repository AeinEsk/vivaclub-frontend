import { axiosInstance } from '../utils/axios';

export const getCustomerTickets = async (token: string | null) => {
    if (!token) throw new Error('No token provided');
    
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    return axiosInstance.get("/auth/customer/tickets");
};