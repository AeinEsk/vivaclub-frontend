import axios from 'axios';
import { HOST_API } from '../api/config';
// -----------------------------------
const axiosInstance = axios.create({
    baseURL: HOST_API
});

axiosInstance.interceptors.request.use((req) => {
    if (process.env.NODE_ENV !== 'production') {
        console.log('API Req', req);
    }
    return req;
});
axiosInstance.interceptors.response.use(
    (res) => {
        if (process.env.NODE_ENV !== 'production') {
            console.log('API Res', res);
        }

        return res;
    },
    (error) => {
        if (process.env.NODE_ENV !== 'production') {
            console.log('API Error', error);
        }
        if (error.response) {
            console.log(error.response.data);
        }
        return Promise.reject(error);
    }
);
export { axiosInstance };
