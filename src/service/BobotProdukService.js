import { axiosCall } from './ApiHelper';

class ApiBobotProduk {
    async getAllBobotProduk() {
        const response = await axiosCall({ url: `/bobotProduk/getAllBobotProduk`, method: 'get' });
        return response.data;
    }

    async getBobotProdukById(bobotProduk) {
        const response = await axiosCall({ url: `/bobotProduk/getBobotProdukById`, method: 'post', data: bobotProduk });
        return response.data;
    }

    async addBobotProduk(bobotProduk) {
        const response = await axiosCall({ url: `/bobotProduk/addBobotProduk`, method: 'post', data: bobotProduk });
        return response.data;
    }

    async updateBobotProduk(bobotProduk) {
        const response = await axiosCall({ url: `/bobotProduk/updateBobotProduk`, method: 'put', data: bobotProduk });
        return response.data;
    }

    async deleteBobotProduk(bobotProduk) {
        const response = await axiosCall({ url: `/bobotProduk/deleteBobotProduk`, method: 'delete', data: bobotProduk });
        return response.data;
    }
}

export const APIBobotProduk = new ApiBobotProduk();