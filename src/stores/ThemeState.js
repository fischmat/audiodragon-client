import { defineStore } from 'pinia'

export const getThemeState = defineStore('theme', {
    state: () => ({
        vibrant: null,
        muted: null,
        lightVibrant: null,
        lightMuted: null,
        darkVibrant: null,
        darkMuted: null
    })
})