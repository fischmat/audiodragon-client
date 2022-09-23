<template>
  <div id="app">
    <RecordingSidebar />
  </div>
</template>

<script>
import RecordingSidebar from './components/RecordingSidebar.vue'
import { eventService } from '@/services/EventService'
import { getRecordingState } from '@/stores/RecordingState'

export default {
  name: 'App',
  components: {
    RecordingSidebar
  },
  mounted() {
    const recordingState = getRecordingState()
    eventService.connect()

    eventService.capture().onStarted((event) => {
      recordingState.currentCapture = event.capture
    })
    eventService.capture().onEnded(() => {
      recordingState.currentCapture = null
    })
  }
}
</script>

<style>
</style>
