import { api } from './API'

export const audioSourceService = {

    getAudioSources() {
        return api.get('/v1/sources')
    },

    getAudioFormats(audioSourceId) {
        return api.get(`/v1/sources/${audioSourceId}/formats`)
    }
}