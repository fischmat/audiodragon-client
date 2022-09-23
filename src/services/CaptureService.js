import { api } from './API'

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
    },

    /**
     * Stops the capture on an audio source
     * @param {boolean} afterTrack If this is true, the capture will only be stopped after the current track.
     * @param {string} audioSourceId The ID of the audio source.
     * @returns A promise with the response.
     */
     stopCapture(afterTrack, audioSourceId) {
        return api.delete(`v1/capture/${audioSourceId}?immediately=${!afterTrack}`)
    },

    /**
     * Get the current capture on a specific audio source.
     * @param {string} audioSourceId The ID of the audio source.
     * @returns A promise with the response.
     */
    getOngoingRecording(audioSourceId) {
        return api.get(`v1/capture/${audioSourceId}`)
    },

    /**
     * Get the currently playing track if it was already recognized.
     * @param {string} audioSourceId The ID of the audio source.
     * @returns A promise with the response.
     */
     getCurrentTrack(audioSourceId) {
        return api.get(`v1/capture/${audioSourceId}/track`)
    },

    /**
     * Updates information on the currently playing track.
     * @param {object} track Metadata on the track to save.
     * @param {string} audioSourceId The ID of the audio source.
     * @returns A promise with the response.
     */
     updateCurrentTrack(track, audioSourceId) {
        return api.put(`v1/capture/${audioSourceId}/track`, track)
    }
}