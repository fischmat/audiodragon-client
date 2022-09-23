import { defineStore } from 'pinia'

export const getRecordingState = defineStore('recording', {
    state: () => ({
        audioSource: null,
        audioFormat: null,
        outputFormat: null,
        currentCapture: null
    })
})