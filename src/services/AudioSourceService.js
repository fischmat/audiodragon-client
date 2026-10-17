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
    },

    startPreview(audioSourceId, format) {
        return api.post(`/v1/sources/${audioSourceId}/preview`, format)
    },

    stopPreview() {
        return api.delete('/v1/sources/preview')
    }
}
