import { axiosCall } from './ApiHelper';

class ApiAuth {
    async login(data) {
        const response = await axiosCall({ url: `/auth/login`, method: 'post', data: data });
        console.log(response);
        console.log(data);
        return response.data;
    }

    async refreshToken(data) {
        const response = await axiosCall({ url: `/auth/refresh`, method: 'post', data: data });
        return response.data;
    }

    async logout() {
        const response = await axiosCall({ url: `/auth/logout`, method: 'post' });
        return response.data;
    }
}

export const APIAuth = new ApiAuth();
