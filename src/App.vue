<template>
  <div id="app">
    <div :style="backgroundClass">
      <RecordingSidebar />
      <RecordingContentPane />
    </div>
  </div>
</template>

<script>
import RecordingSidebar from "./components/RecordingSidebar.vue";
import RecordingContentPane from "./components/RecordingContentPane.vue";
import { eventService } from "@/services/EventService";
import { getRecordingState } from "@/stores/RecordingState";
import { getThemeState } from "@/stores/ThemeState";

export default {
  name: "App",
  components: {
    RecordingSidebar,
    RecordingContentPane,
  },
  data() {
    return {
      backgroundClass: {}
    }
  },
  mounted() {
    const recordingState = this.loadState();
    const themeState = getThemeState()
    eventService.connect();

    eventService.capture().onStarted((event) => {
      recordingState.currentCapture = event.capture;
    });
    eventService.capture().onEnded(() => {
      recordingState.currentCapture = null;
    });

    recordingState.$subscribe((_, state) => {
      this.persistState(state);
    });
    themeState.$subscribe((_, state) => {
      if (state.darkMuted) {
        this.backgroundClass = { background: `linear-gradient(180deg, ${state.darkMuted} 0%, #141414 59%)` }
      }
    })
  },

  methods: {
    loadState() {
      const recordingState = getRecordingState();
      if (localStorage.audioSource) {
        recordingState.audioSource = JSON.parse(localStorage.audioSource);
      }
      if (localStorage.audioFormat) {
        recordingState.audioFormat = JSON.parse(localStorage.audioFormat);
      }
      if (localStorage.outputFormat) {
        recordingState.outputFormat = JSON.parse(localStorage.outputFormat);
      }
      return recordingState;
    },
    persistState(state) {
      localStorage.audioSource = JSON.stringify(state.audioSource);
      localStorage.audioFormatId = JSON.stringify(state.audioFormat);
      localStorage.outputFormat = JSON.stringify(state.outputFormat);
    }
  }
};
</script>

<style lang="scss">
@import "~@/assets/scss/vendors/bootstrap-vue/theme.scss";
@import "node_modules/bootstrap/scss/bootstrap.scss";
@import "node_modules/bootstrap-vue/src/index.scss";
</style>
