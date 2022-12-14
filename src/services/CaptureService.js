import { api } from './API'
import _ from "lodash"

export const captureService = {

    /**
     * Starts a new capture.
     * @param {string} audioSourceId The ID of the audio source to capture.
     * @param {object} audioFormat The audio format to capture with.
     * @param {object} outputFormat The format of the files to output.
     * @param {boolean} recognizeSongs Whether songs should be recognized.
     * @returns A promise with the response.
     */
    startCapture(audioSourceId, audioFormat, outputFormat, recognizeSongs) {
        return api.post('/v1/capture', {
            audioSourceId: audioSourceId,
            format: audioFormat,
            outputFormat: outputFormat,
            recognizeSongs: recognizeSongs
        })
        .then((response) => {
            return response.data
        })
    },

    /**
     * Stops the capture on an audio source
     * @param {boolean} afterTrack If this is true, the capture will only be stopped after the current track.
     * @param {string} audioSourceId The ID of the audio source.
     * @returns A promise with the response.
     */
     stopCapture(afterTrack, audioSourceId) {
        return api.delete(`v1/capture/${audioSourceId}?immediately=${!afterTrack}`)
            .then((response) => {
                return response.data
            })
    },

    /**
     * Cancels a planned stop of the ongoing capture of the given audio source.
     * @param {string} audioSourceId The ID of the audio source.
     * @returns A promise which resolves once the stop was cancelled.
     */
    cancelCaptureStop(audioSourceId) {
        return api.delete(`v1/capture/${audioSourceId}/planned-stop`)
    },

    /**
     * Get the current capture on a specific audio source.
     * @param {string} audioSourceId The ID of the audio source.
     * @returns A promise with the response.
     */
    getOngoingRecording(audioSourceId) {
        return api.get(`v1/capture/${audioSourceId}`)
            .then((response) => {
                return response.data
            })
    },

    /**
     * Get the currently playing track if it was already recognized.
     * @param {string} audioSourceId The ID of the audio source.
     * @returns A promise with the response.
     */
     getCurrentTrack(audioSourceId) {
        return api.get(`v1/capture/${audioSourceId}/track`)
            .then((response) => {
                return response.data
            })
    },

    /**
     * Updates information on the currently playing track.
     * @param {object} track Metadata on the track to save.
     * @param {string} audioSourceId The ID of the audio source.
     * @returns A promise with the response.
     */
     updateCurrentTrack(track, audioSourceId) {
        const nonEmptyData = _.pickBy(track, (v) => !_.isEmpty(v))
        if (_.isEmpty(nonEmptyData)) {
            return
        }
        return api.put(`v1/capture/${audioSourceId}/track`, nonEmptyData)
            .then((response) => {
                return response.data
            })
    }
}