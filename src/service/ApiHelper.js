import axios from 'axios';

export async function axiosCall(config) {
    try {
        const data = await axios.request(config);
        return data;
    } catch (error) {
        throw error;
    }
}
