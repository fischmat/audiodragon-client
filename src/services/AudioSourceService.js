import { api } from './API'

export const audioSourceService = {

    getAudioSources() {
        return api.get('/v1/sources')
            .then((response) => {
                return response.data
            })
    },

    getAudioFormats(audioSourceId) {
        return api.get(`/v1/sources/${audioSourceId}/formats`)
            .then((response) => {
                return response.data
            })
    }
}