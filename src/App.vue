<template>
  <div id="app">
    <RecordingSidebar />
    <RecordingContentPane />
  </div>
</template>

<script>
import RecordingSidebar from './components/RecordingSidebar.vue'
import RecordingContentPane from './components/RecordingContentPane.vue'
import { eventService } from '@/services/EventService'
import { getRecordingState } from '@/stores/RecordingState'

export default {
  name: 'App',
  components: {
    RecordingSidebar, RecordingContentPane
  },
  mounted() {
    const recordingState = this.loadState()
    eventService.connect()

    eventService.capture().onStarted((event) => {
      recordingState.currentCapture = event.capture
    })
    eventService.capture().onEnded(() => {
      recordingState.currentCapture = null
    })

    recordingState.$subscribe((_, state) => {
      this.persistState(state)
    })
  },

  methods: {
    loadState() {
      const recordingState = getRecordingState()
      if (localStorage.audioSource) {
        recordingState.audioSource = JSON.parse(localStorage.audioSource)
      }
      if (localStorage.audioFormat) {
        recordingState.audioFormat = JSON.parse(localStorage.audioFormat)
      }
      if (localStorage.outputFormat) {
        recordingState.outputFormat = JSON.parse(localStorage.outputFormat)
      }
      return recordingState
    },
    persistState(state) {
      localStorage.audioSource = JSON.stringify(state.audioSource)
      localStorage.audioFormatId = JSON.stringify(state.audioFormat)
      localStorage.outputFormat = JSON.stringify(state.outputFormat)
    }
  }
}
</script>

<style lang="scss">
@import "~@/assets/scss/vendors/bootstrap-vue/theme.scss";
@import 'node_modules/bootstrap/scss/bootstrap.scss';
@import 'node_modules/bootstrap-vue/src/index.scss';

body {
  background: linear-gradient(180deg, rgba(96,1,3,1) 0%, rgba(25,25,25,1) 59%);
  height: 100vh;
}
</style>
