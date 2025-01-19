import { axiosCall } from './ApiHelper';

class ApiSubKriteria {
    async getAllSubKriteria() {
        const response = await axiosCall({ url: `/subKriteria/getAllSubKriteria`, method: 'get' });
        return response.data;
    }

    async getSubKriteriaById(subKriteria) {
        console.log(subKriteria);
        const response = await axiosCall({ url: `/subKriteria/getSubKriteriaById`, method: 'post', data: subKriteria });
        return response.data;
    }

    async addSubKriteria(subKriteria) {
        const response = await axiosCall({ url: `/subKriteria/addSubKriteria`, method: 'post', data: subKriteria });
        return response.data;
    }

    async updateSubKriteria(subKriteria) {
        const response = await axiosCall({ url: `/subKriteria/editSubKriteria`, method: 'put', data: subKriteria });
        return response.data;
    }

    async deleteSubKriteria(subKriteria) {
        const response = await axiosCall({ url: `/subKriteria/deleteSubKriteria`, method: 'delete', data: subKriteria });
        return response.data;
    }
}

export const APISubKriteria = new ApiSubKriteria();
