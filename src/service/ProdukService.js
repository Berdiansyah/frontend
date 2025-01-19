import { axiosCall } from './ApiHelper';

class ApiProduk {
    async getAllProduk() {
        const response = await axiosCall({ url: `/produk/getAllProduk`, method: 'get' });
        return response.data;
    }

    async addProduk(produk) {
        const response = await axiosCall({ url: `/produk/addProduk`, method: 'post', data: produk });
        return response.data;
    }

    async updateProduk(produk) {
        const response = await axiosCall({ url: `/produk/editProduk`, method: 'put', data: produk });
        return response.data;
    }

    async deleteProduk(produk) {
        const response = await axiosCall({ url: `/produk/deleteProduk`, method: 'delete', data: produk });
        return response.data;
    }
}

export const APIProduk = new ApiProduk();
