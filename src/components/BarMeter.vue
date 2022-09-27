<template>
  <div class="meter-container" ref="meter">
    <div class="label-container">
        <span v-if="title">{{title}}</span>
    </div>
    <v-stage :config="configKonva">
      <v-layer>
        <v-rect
          v-for="barConfig in barConfigs"
          v-bind:key="barConfig.barIndex"
          :config="barConfig"
        ></v-rect>
      </v-layer>
    </v-stage>
    <div class="label-container">
        <span v-if="!hideLabel">{{valueLabel}}</span>
    </div>
  </div>
</template>
<script>
import _ from "lodash";

const ACTIVE_LEVEL_PALETTE = ["#208320", "#bcb81f", "#870000"];

const INACTIVE_LEVEL_PALETTE = ["#9ec09e", "#c2c199", "#ff8d8d"];

export default {
  components: {},
  name: "BarMeter",
  props: ["model", "max", "barCount", "title", "labelTransform", "hideLabel"],
  data() {
    return {
      configKonva: {
        width: 0,
        height: 0,
      },
      barConfigs: [],
    };
  },
  mounted() {
    this.configKonva.width = this.$refs.meter.clientWidth;
    this.configKonva.height = this.$refs.meter.clientHeight;

    const x = this.configKonva.width * 0.1;
    const width = this.configKonva.width - 2 * x;
    const height = _.floor(this.configKonva.height / this.barCount);
    const barMarginTop = height * 0.1;

    for (let i = 0; i < this.barCount; i++) {
      this.barConfigs.push({
        barIndex: i,
        x: x,
        y: _.floor(this.configKonva.height / this.barCount) * i,
        fill: "red",
        width: width,
        height: height - barMarginTop,
        stroke: "black",
        strokeWidth: 0,
        cornerRadius: 3,
      });
    }
  },
  computed: {
    valueLabel() {
        if (!_.isFunction(this.labelTransform)) {
            return this.model
        }
        return this.labelTransform(this.model)
    }
  },
  methods: {
    test() {
      for (let i = 0; i < this.barCount; i++) {
        this.barConfigs[i].fill = "green";
      }
    },
  },
  watch: {
    model(value) {
      const activatedBars = _.ceil((value / this.max) * this.barCount);
      const maxLowLevel = _.ceil(this.barCount * 0.33);
      const minHighLevel = _.ceil(this.barCount * 0.66);
      for (let i = 0; i < this.barCount; i++) {
        let level = 2
        if(i < maxLowLevel) {
            level = 0
        } else if (i < minHighLevel) {
            level = 1
        }

        const isActive = i <= activatedBars
        let palette = isActive ? ACTIVE_LEVEL_PALETTE : INACTIVE_LEVEL_PALETTE
        this.barConfigs[this.barCount - i - 1].fill = palette[level]
        this.barConfigs[this.barCount - i - 1].opacity = isActive ? 1.0 : 0.2
      }
    },
  },
};
</script>

<style scoped>
.meter-container {
  width: 100%;
  height: 100%;
}
.label-container {
    width: 100%;
    text-align: center;
}
</style>