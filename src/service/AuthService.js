import { axiosCall } from './ApiHelper';

class ApiAuth {
    async login(data) {
        const response = await axiosCall({ url: `/auth/login`, method: 'post', data: data });
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

    async resetPassword(user){
        const response = await axiosCall({ url: `/auth/reset-password`, method: 'post', data: user});
        return response.data;
    }
    
    async forgotPassword(user){
        const response = await axiosCall({ url: `/auth/forgot-password`, method: 'post', data: user });
        return response.data;
    }
}

export const APIAuth = new ApiAuth();
