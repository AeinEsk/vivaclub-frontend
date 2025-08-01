import axios from 'axios';
import { HOST_API } from '../api/config';
// -----------------------------------
const axiosInstance = axios.create({
    baseURL: HOST_API
});

axiosInstance.interceptors.request.use((req) => {
    if (process.env.NODE_ENV !== 'production') {
    }
    return req;
});
axiosInstance.interceptors.response.use(
    (res) => {
        if (process.env.NODE_ENV !== 'production') {
        }

        return res;
    },
    (error) => {
        if (process.env.NODE_ENV !== 'production') {
        }
        if (error.response) {
        }
        return Promise.reject(error);
    }
);
export { axiosInstance };
