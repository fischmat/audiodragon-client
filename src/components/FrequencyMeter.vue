<template>
  <div>
    <div class="row level-meters">
      <div class="col-md-12">
        <label>Bass</label>
        <b-progress :max="frequencySum">
          <b-progress-bar
            :value="bass"
          ></b-progress-bar>
        </b-progress>
      </div>
      <div class="col-md-12">
        <label>Midrange</label>
        <b-progress :max="frequencySum">
          <b-progress-bar
            :value="midrange"
          ></b-progress-bar>
        </b-progress>
      </div>
      <div class="col-md-12">
        <label>Treble</label>
        <b-progress :max="frequencySum">
          <b-progress-bar
            :value="treble"
          ></b-progress-bar>
        </b-progress>
      </div>
    </div>
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
    };
  },
  mounted() {
    this.handleResize();
    window.addEventListener("resize", this.handleResize);

    eventService.metrics().frequencies((frequencies) => {
      // Add a small offset such that the bars are never fully empty
      this.frequencies = _.map(frequencies, (f) => f + 0.5);
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
      rainbow.setSpectrum("#ff0023", "#c4b90b", "#20e218");
      return `#${rainbow.colorAt(avgFrequencyLevel)}`;
    },
    frequencySum() {
      return _.sum(this.frequencies)
    },
    bass() {
      const count = _.size(this.frequencies);
      if (count == 0) {
        return 0;
      }
      return (
        _.sum(_.slice(this.frequencies, 0, _.round(count / 3)))
      );
    },
    midrange() {
      const count = _.size(this.frequencies);
      if (count == 0) {
        return 0;
      }
      return (
        _.sum(_.slice(this.frequencies, _.round(count / 3), _.round(count / 3)*2))
      );
    },
    treble() {
      const count = _.size(this.frequencies);
      if (count == 0) {
        return 0;
      }
      return (
        _.sum(_.slice(this.frequencies, _.round(count / 3)*2))
      );
    }
  },
  methods: {
    handleResize() {
      this.width = this.$refs.equalizer.clientWidth;
      this.height = Math.max(this.$refs.equalizer.clientHeight, 300);
    },
  },
};
</script>

<style scoped>
.level-meters {
  margin-bottom: 30px;
}
</style>