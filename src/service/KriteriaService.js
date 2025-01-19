import { axiosCall } from './ApiHelper';

class ApiKriteria {
    async getAllKriteria() {
        const response = await axiosCall({ url: `/kriteria/getAllKriteria`, method: 'get' });
        return response.data;
    }

    async addKriteria(kriteria) {
        const response = await axiosCall({ url: `/kriteria/addKriteria`, method: 'post', data: kriteria });
        return response.data;
    }

    async updateKriteria(kriteria) {
        console.log(kriteria);
        const response = await axiosCall({ url: `/kriteria/editKriteria`, method: 'put', data: kriteria });
        return response.data;
    }

    async deleteKriteria(kriteria) {
        const response = await axiosCall({ url: `/kriteria/deleteKriteria`, method: 'delete', data: kriteria });
        return response.data;
    }
}

export const APIKriteria = new ApiKriteria();
