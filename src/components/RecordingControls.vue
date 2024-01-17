<template>
  <div id="recording-controls">
    <b-form-checkbox
      id="recognize-songs"
      v-model="recognizeSongs"
      value="true"
      unchecked-value="false"
      :disabled="isRecording || recognitionNotPossible"
      v-b-tooltip.hover 
      :title="recognitionNotPossible ? 'Track recognition is not possible. Please configure an API key in the settings first. Reload page afterwards.' : 'Whether tracks should be automatically recognized.'"
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
      @click="toggleRecordingStop(true)"
      :hidden="!isRecording && !terminationPending"
      variant="danger"
      :style="stopRecordingStyle"
      >{{ terminationPending ? "Cancel stop" : "Stop after track" }}</b-button
    >
    <b-button
      class="recording-button"
      @click="stopRecording(false)"
      :hidden="!isRecording"
      variant="danger"
      :style="stopRecordingStyle"
      >Stop</b-button
    >
    <div v-if="terminationPending">
      <span><b-spinner class="spinner" /> Stopping after current track</span>
    </div>
  </div>
</template>

<script>
import _ from "lodash";
import { getRecordingState } from '../stores/RecordingState'
import { captureService } from '../services/CaptureService'
import { eventService } from '@/services/EventService'
import { getThemeState } from '@/stores/ThemeState'
import { settingsService } from "@/services/SettingsService"

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
      recognitionNotPossible: false,
      terminationPending: false,
      themeState: getThemeState()
    };
  },
  computed: {
    canRecord() {
      return this.audioSource && this.audioFormat
    },
    isRecording() {
      return this.currentCapture != null
    },
    stopRecordingStyle() {
      if (this.themeState.vibrant) {
        return { backgroundColor: this.themeState.vibrant, borderColor: this.themeState.darkVibrant }
      }
      return {}
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

    this.isTrackRecognitionPossible().then((isPossible) => {
      this.recognizeSongs = isPossible;
      this.recognitionNotPossible = !isPossible;
    });
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
    },
    toggleRecordingStop(afterTrack) {
      if (this.terminationPending) {
        captureService.cancelCaptureStop(this.audioSource.id)
          .then(() => {
            this.terminationPending = false
          })
      } else {
        this.stopRecording(afterTrack)
      }
    },
    async isTrackRecognitionPossible() {
      const settings = await settingsService.getSettings();
      const apiToken = settings.recognition.rapidApiToken;
      return apiToken && !_.every(apiToken, (c) => c == 'X');
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