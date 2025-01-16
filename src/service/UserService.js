import { axiosCall } from './ApiHelper';

class ApiUser {
    async getUser() {
        const response = await axiosCall({ url: `/user/getUser`, method: 'get' });
        return response.data;
    }
}

export const APIUser = new ApiUser();
