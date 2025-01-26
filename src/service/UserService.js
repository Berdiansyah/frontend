import { axiosCall } from './ApiHelper';

class ApiUser {
    async getUser() {
        const response = await axiosCall({ url: `/user/getUser`, method: 'get' });
        return response.data;
    }

    async getAllUser() {
        const response = await axiosCall({ url: 'user/getAllUser', method: 'get' });
        return response.data;
    }

    async adduser(user) {
        const response = await axiosCall({ url: 'user/addUser', method: 'post', data: user });
        return response.data;
    }

    async changePassword(user) {
        const response = await axiosCall({ url: 'user/changePassword', method: 'post', data: user });
        return response.data;
    }

    async updateUser(user) {
        const response = await axiosCall({ url: 'user/editUser', method: 'put', data: user });
        return response.data;
    }

    async deleteUser(user) {
        const response = await axiosCall({ url: 'user/deleteuser', method: 'delete', data: user });
        return response.data;
    }
}

export const APIUser = new ApiUser();
