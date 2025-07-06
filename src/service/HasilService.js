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

    async getAllHasil(){
		const response = await axiosCall({ url: `/hasil/getAllHasil`, method: 'get' });
        return response.data;
	}

    async getHasilByMonth(data){
		const response = await axiosCall({ url: `/hasil/getHasilByMonth`, method: 'post', data: data });
        return response.data;
	}

    async addhasil(hasil){
		const response = await axiosCall({ url: `/hasil/addHasil`, method: 'post', data: hasil });
        return response.data;
	}

    async deleteHasil(id){
		const response = await axiosCall({ url: `/hasil/deleteHasil`, method: 'delete', data: id });
        return response.data;
	}
}

export const APIHasil = new ApiHasil();
