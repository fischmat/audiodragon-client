<template>
  <div>
    <div ref="progress" class="track-progress-container">
      <div
        class="track-progress-bar"
        :style="{ backgroundColor: barColor, width: `${trackProgress}px` }"
      ></div>
    </div>
    <div ref="equalizer" class="meter">
      <vue-bar-graph
        :points="frequencies"
        :width="width"
        :height="height"
        :bar-color="barColor"
      />
    </div>
  </div>
</template>

<script>
import VueBarGraph from "vue-bar-graph";
import { eventService } from "@/services/EventService";
import _ from "lodash";
import Rainbow from "rainbowvis.js";
import { getThemeState } from "@/stores/ThemeState";
import { getRecordingState } from "@/stores/RecordingState";

export default {
  components: {
    VueBarGraph,
  },
  name: "FrequencyMeter",
  data() {
    return {
      width: 100,
      height: 100,
      frequencies: [],
      trackTime: 0,
      trackLength: 0,
      themeState: getThemeState(),
    };
  },
  mounted() {
    this.handleResize();
    window.addEventListener("resize", this.handleResize);

    const recordingState = getRecordingState();
    recordingState.$subscribe((_, state) => {
      this.trackLength = state.currentTrack?.lengthMillis;
    });

    eventService.capture().onEnded(() => {
      this.frequencies = _.map(this.frequencies, () => 0.1);
    });
    eventService.metrics().frequencies((frequencies) => {
      // Add a small offset such that the bars are never fully empty
      this.frequencies = _.map(frequencies, (f) => f + 0.1);
    });
    eventService.metrics().trackTime((t) => {
      this.trackTime = t;
    });
    eventService.track().onRecognized((evt) => {
      this.trackLength = evt.track?.lengthMillis;
    });
    eventService.track().onEnded(() => {
      this.trackTime = 0;
      this.trackLength = 0;
    });
    eventService.capture().onEnded(() => {
      this.trackTime = 0;
      this.trackLength = 0;
    });
  },
  unmounted() {
    window.removeEventListener("resize", this.handleResize);
  },
  computed: {
    barColor() {
      const count = _.size(this.frequencies);
      if (count == 0) {
        return "#ccc";
      }
      const freqSum = _.sum(this.frequencies);
      const avgFrequencyLevel = _.sum(
        _.map(this.frequencies, (f, idx) => (f / freqSum) * idx)
      );
      const rainbow = new Rainbow();
      rainbow.setNumberRange(0, count);
      rainbow.setSpectrum(
        this.themeState.vibrant || "#ff0023",
        this.themeState.lightVibrant || "#c4b90b",
        this.themeState.darkVibrant || "#20e218"
      );
      return `#${rainbow.colorAt(avgFrequencyLevel)}`;
    },
    frequencySum() {
      return _.sum(this.frequencies);
    },
    trackProgress() {
      if (!this.trackLength) {
        return 0;
      }
      return (
        this.$refs.progress.clientWidth *
        Math.min(this.trackTime / this.trackLength, 1.0)
      );
    },
  },
  methods: {
    handleResize() {
      this.width = this.$refs.equalizer.clientWidth;
      this.height = Math.max(this.$refs.equalizer.clientHeight, 150);
    },
  },
};
</script>

<style scoped>
.meter {
  transform: rotate(180deg) scaleX(-1);
  filter: opacity(20%);
}

.track-progress-container {
  width: 100%;
}
.track-progress-bar {
  height: 2px;
  filter: opacity(50%);
  margin-bottom: 1px;
}
</style>