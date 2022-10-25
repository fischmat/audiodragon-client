import _ from 'lodash';
import { api, apiBaseUrl } from './API'

export const libraryService = {

    async getItems(page = null, pageSize = 10, sortBy, sortOrder) {
        try {
            const paginationParams = page && pageSize ? `page=${page}&pageSize=${pageSize}` : "";
            const sortParams = sortBy && sortOrder ? `sort=${sortBy}&sortOrder=${sortOrder}` : "";
            const response = await api.get(`v1/library?${_.join([paginationParams, sortParams], '&')}`);
            const items = response.data;
            _.forEach(items, (i) => {
                i.coverartImageUrl = `${apiBaseUrl}/v1/library/frontcover?file=${encodeURIComponent(i.filePath)}`
            })
            return items
        } catch (e) {
            throw new Error(e.response.data.message);
        }
    }
}