import { axiosCall } from './ApiHelper';

class ApiHasil {
    async getKategori() {
        const response = await axiosCall({ url: `/hasil/getKategori`, method: 'get' });
        return response.data;
    }

	async getAllDataToCalculate(){
		const response = await axiosCall({ url: `/hasil/getPlainData`, method: 'get' });
        return response.data;
	}
}

export const APIHasil = new ApiHasil();
