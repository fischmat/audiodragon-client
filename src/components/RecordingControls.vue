<template>
  <div id="recording-controls">
    <b-form-checkbox
      id="recognize-songs"
      v-model="recognizeSongs"
      value="true"
      unchecked-value="false"
      :disabled="isRecording"
      switch
    >
      Recognize songs
    </b-form-checkbox>

    <b-button
      class="recording-button"
      @click="startRecording"
      :disabled="!canRecord"
      :hidden="isRecording || terminationPending"
      variant="success"
      >Start</b-button
    >
    <b-button
      class="recording-button"
      @click="stopRecording(true)"
      :hidden="!isRecording && !terminationPending"
      :disabled="terminationPending"
      variant="danger"
      >Stop after track</b-button
    >
    <b-button
      class="recording-button"
      @click="stopRecording(false)"
      :hidden="!isRecording"
      variant="danger"
      >Stop</b-button
    >
    <div v-if="terminationPending">
      <span><b-spinner class="spinner" /> Stopping after current track</span>
    </div>
  </div>
</template>

<script>
import { getRecordingState } from '../stores/RecordingState'
import { captureService } from '../services/CaptureService'
import { eventService } from '@/services/EventService'

var recordingState = null

export default {
  name: "RecordingControls",
  data() {
    return {
      audioSource: null,
      audioFormat: null,
      outputFormat: null,
      currentCapture: null,
      recognizeSongs: true,
      terminationPending: false,
    };
  },
  computed: {
    canRecord() {
      return this.audioSource && this.audioFormat
    },
    isRecording() {
      return this.currentCapture != null
    }
  },
  mounted() {
    recordingState = getRecordingState()

    // We need to reflect the state into component data to enable computed properties on them
    recordingState.$subscribe((_, state) => {
      this.audioSource = state.audioSource
      this.audioFormat = state.audioFormat
      this.outputFormat = state.outputFormat
      this.currentCapture = state.currentCapture
    })

    eventService.capture().onEnded(() => {
      this.terminationPending = false
    })
  },
  methods: {
    startRecording() {
        captureService.startCapture(this.audioSource.id, this.audioFormat, this.outputFormat, this.recognizeSongs)
          .catch((error) => {
            console.error(`Could not start recording on ${this.audioSource.name}.`, error)
          })
    },
    stopRecording(afterTrack) {
      captureService.stopCapture(afterTrack, this.audioSource.id)
        .then(() => {
          this.terminationPending = afterTrack
        })
        .catch((error) => {
          console.error(`Could not stop recording on ${this.audioSource.name}.`, error)
        })
    }
  }
};
</script>

<style scoped>
#recording-controls {
  text-align: left;
}
.recording-button {
  width: 100%;
  margin-top: 10px;
}
.spinner {
  margin-top: 10px;
  width: 14px;
  height: 14px;
}
</style>