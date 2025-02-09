import { APIAuth } from '@/service/AuthService';
import { useUserStore } from '@/store/UserStore';
import axios from 'axios';
import router from '@/router';

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};
// axios.defaults.baseURL = import.meta.env.VITE_BASE_API || 'http://localhost:5000';
axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;
axios.defaults.withCredentials = true;

export default axios;

axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Pastikan error adalah 556 dan bukan request refresh token sebelumnya
        if (error.response?.status === 556 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers['Authorization'] = 'Bearer ' + token;
                        return axios(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const response = await APIAuth.refreshToken();
                const newToken = response.data;

                // Update token di localStorage
                localStorage.setItem('accessToken', newToken);

                // Update header axios default
                axios.defaults.headers.common['Authorization'] = 'Bearer ' + newToken;

                // Update token untuk request yang sedang gagal
                originalRequest.headers['Authorization'] = 'Bearer ' + newToken;

                // Reset status
                isRefreshing = false;
                processQueue(null, newToken);

                return axios(originalRequest);
            } catch (refreshError) {
                const userStore = useUserStore();
                // Gagal refresh token
                isRefreshing = false;
                processQueue(refreshError, null);

                // Logout user
                userStore.logout();
                userStore.logout;
                router.push('/login');
                localStorage.removeItem('accessToken');

                return Promise.reject(refreshError);
            }
        }

        if (error.response?.status === 555) {
            const userStore = useUserStore();
            await APIAuth.logout();
            userStore.logout;
            localStorage.removeItem('accessToken');
        }

        return Promise.reject(error);
    }
);
