<template>
  <div ref="equalizer">
    <vue-bar-graph v-bind:style="style" :points="frequencies" :width="width" :height="height" />
  </div>
</template>

<script>
import VueBarGraph from "vue-bar-graph";
import { eventService } from '@/services/EventService'
import _ from "lodash";

export default {
  components: {
    VueBarGraph,
  },
  name: "FrequencyMeter",
  data() {
    return {
      width: 100,
      height: 100,
      frequencies: []
    };
  },
  mounted() {
    this.handleResize()
    window.addEventListener('resize', this.handleResize)

    eventService.metrics().frequencies((frequencies) => {
      this.frequencies = _.map(frequencies, (f) => f + 0.5)
    })
  },
  unmounted() {
    window.removeEventListener('resize', this.handleResize);
  },
  computed: {
    style() {
      const lowEnd = _.floor(this.frequencies.length / 3)
      const midEnd = _.floor((this.frequencies.length / 3) * 2)
      const low = _.mean(_.slice(this.frequencies, 0, lowEnd))
      const mid = _.mean(_.slice(this.frequencies, lowEnd, midEnd))
      const high = _.mean(_.slice(this.frequencies, midEnd))
      const hueRotate = (low*30 + mid*30 + high*45) % 360
      return {
        filter: `invert(48%) sepia(79%) saturate(2476%) hue-rotate(${hueRotate}deg) brightness(118%) contrast(119%)`
      }
    }
  },
  methods: {
    handleResize() {
      this.width = this.$refs.equalizer.clientWidth
      this.height = Math.max(this.$refs.equalizer.clientHeight, 300)
    },
  }
};
</script>

<style scoped>
</style>