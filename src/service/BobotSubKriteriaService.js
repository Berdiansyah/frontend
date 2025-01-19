import { axiosCall } from './ApiHelper';

class ApiBobotSubKriteria {
    async getAllBobotSubKriteria() {
        const response = await axiosCall({ url: `/bobotSubKriteria/getAllBobotSubKriteria`, method: 'get' });
        return response.data;
    }

    async addBobotSubKriteria(bobotSubKriteria) {
        const response = await axiosCall({ url: `/bobotSubKriteria/addBobotSubKriteria`, method: 'post', data: bobotSubKriteria });
        return response.data;
    }

    async updateBobotSubKriteria(bobotSubKriteria) {
        const response = await axiosCall({ url: `/bobotSubKriteria/editBobotSubKriteria`, method: 'put', data: bobotSubKriteria });
        return response.data;
    }

    async deleteBobotSubKriteria(bobotSubKriteria) {
        const response = await axiosCall({ url: `/bobotSubKriteria/deleteBobotSubKriteria`, method: 'delete', data: bobotSubKriteria });
        return response.data;
    }
}

export const APIBobotSubKriteria = new ApiBobotSubKriteria();
