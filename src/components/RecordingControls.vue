<template>
  <div id="recording-controls" class="recording-controls">
    <p class="control-caption">{{ isRecording ? 'Your capture is active and will save automatically.' : 'All set — start when music is playing.' }}</p>
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
      >Start recording</b-button
    >
    <b-button
      class="recording-button"
      @click="toggleRecordingStop(true)"
      :hidden="!isRecording && !terminationPending"
      variant="danger"
      :style="stopRecordingStyle"
      >{{ terminationPending ? "Keep recording" : "Stop after this track" }}</b-button
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
  min-width: 230px;
  text-align: right;
}
.recording-button {
  margin: 10px 0 0 8px;
  border-radius: 10px;
  border: 1px solid #8b5cf6;
  background: #8b5cf6;
  color: #fff;
  font-weight: 700;
  box-shadow: 0 8px 24px rgba(139,92,246,.24);
}
.recording-button.btn-danger:not(:last-of-type) {
  background: #232b3d;
  border-color: #40506e;
  box-shadow: none;
}
.control-caption { max-width: 245px; margin: 0 0 10px auto; color: #98a2b8; font-size: 12px; }
.custom-switch { color: #cfd6e5; font-size: 13px; }
@media (max-width: 960px) { #recording-controls { text-align:left; } .control-caption { margin-left:0; } .recording-button { margin-left:0; margin-right:8px; }
}
.spinner {
  margin-top: 10px;
  width: 14px;
  height: 14px;
}
</style>
