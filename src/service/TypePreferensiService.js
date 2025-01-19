import { axiosCall } from './ApiHelper';

class ApiTypePreferensi {
    async getAllTypePreferensi() {
        const response = await axiosCall({ url: `/typePreferensi/getAllTypePreferensi`, method: 'get' });
        return response.data;
    }

    async addTypePreferensi(typePreferensi) {
        const response = await axiosCall({ url: `/typePreferensi/addTypePreferensi`, method: 'post', data: typePreferensi });
        return response.data;
    }

    async updateTypePreferensi(typePreferensi) {
        const response = await axiosCall({ url: `/typePreferensi/editTypePreferensi`, method: 'put', data: typePreferensi });
        return response.data;
    }

    async deleteTypePreferensi(typePreferensi) {
        const response = await axiosCall({ url: `/typePreferensi/deleteTypePreferensi`, method: 'delete', data: typePreferensi });
        return response.data;
    }
}

export const APITypePreferensi = new ApiTypePreferensi();
