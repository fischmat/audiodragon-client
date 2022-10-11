import { api } from './API'

export const settingsService = {

    async getSettings() {
        try {
            const response = await api.get(`v1/settings`);
            return response.data;
        } catch (e) {
            throw new Error(e.response.data.message);
        }
    },

    async updateSettings(settings) {
        try {
            const response = await api
                .patch("v1/settings", settings);
            return response.data;
        } catch (e) {
            throw new Error(e.response.data.message);
        }
    }
}