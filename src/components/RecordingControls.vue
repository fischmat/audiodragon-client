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

const recordingState = getRecordingState()

export default {
  name: "RecordingControls",
  data() {
    return {
      recognizeSongs: true,
      terminationPending: false,
    };
  },
  computed: {
    canRecord() {
      return recordingState.audioSource && recordingState.audioFormat
    },
    isRecording() {
      return recordingState.currentCapture != null
    }
  },
  mounted() {
  },
  methods: {
    startRecording() {
        captureService.startCapture(recordingState.audioSource.id, recordingState.audioFormat, recordingState.outputFormat, this.recognizeSongs)
          .then((capture) => {
            recordingState.currentCapture = capture
          })
          .catch((error) => {
            console.error(`Could not start recording on ${recordingState.audioSource.name}.`, error)
          })
    },
    stopRecording(afterTrack) {
      captureService.stopRecording(afterTrack)
        .then(() => {
          recordingState.currentCapture = null
        })
        .catch((error) => {
          console.error(`Could not stop recording on ${recordingState.audioSource.name}.`, error)
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