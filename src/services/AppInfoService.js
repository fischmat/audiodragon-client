import { api } from './API'

export const appInfoService = {

    async getAppInfo() {
        try {
            return (await api.get('v1/info')).data;
        } catch (e) {
            throw new Error(e.response.data.message);
        }
    }
}