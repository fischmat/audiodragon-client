<template>
  <div>
    <div ref="equalizer">
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
import { getThemeState } from '@/stores/ThemeState'

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
      themeState: getThemeState()
    };
  },
  mounted() {
    this.handleResize();
    window.addEventListener("resize", this.handleResize);

    eventService.capture().onEnded(() => {
      this.frequencies = _.map(this.frequencies, () => 0.1)
    })
    eventService.metrics().frequencies((frequencies) => {
      // Add a small offset such that the bars are never fully empty
      this.frequencies = _.map(frequencies, (f) => f + 0.1);
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
      rainbow.setSpectrum(this.themeState.vibrant || "#ff0023", this.themeState.lightVibrant || "#c4b90b", this.themeState.darkVibrant || "#20e218");
      return `#${rainbow.colorAt(avgFrequencyLevel)}`;
    },
    frequencySum() {
      return _.sum(this.frequencies);
    }
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
</style>