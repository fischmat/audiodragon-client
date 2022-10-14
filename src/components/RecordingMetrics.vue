<template>
  <div id="track">
    <FrequencyMeter id="frequency-meter" />

    <div class="row metrics-container">
      <div class="col-md-12">
        <label>RMS</label>
        <b-progress :max="1">
          <b-progress-bar
            v-bind:style="getMeterStyle(rms, 0.0, 1.0)"
            :value="rms"
            :label="`${(rms * 1000).toFixed(2)} ×10⁻³`"
          ></b-progress-bar>
        </b-progress>
      </div>

      <div class="col-md-12" v-if="bufferStats.type == 'inMemory'">
        <label class="buffer-stats"
          >{{ toHumanReadableMemorySize(bufferStats.size) }} /
          {{ toHumanReadableMemorySize(bufferStats.maxMemory) }}
          <b-badge class="buffer-badge" :style="{ backgroundColor: themeState.vibrant }">In-Memory</b-badge></label
        >
        <b-progress :max="bufferStats.maxMemory">
          <b-progress-bar
            v-bind:style="
              getMeterStyle(bufferStats.size, 0, bufferStats.maxMemory)
            "
            :value="bufferStats.size"
            :label="toHumanReadableMemorySize(bufferStats.size)"
          ></b-progress-bar>
        </b-progress>
        <br />
      </div>

      <div class="col-md-12" v-if="bufferStats.type == 'diskSpilling'">
        <label class="buffer-stats"
          >Buffer size: {{ toHumanReadableMemorySize(bufferStats.size) }} /
          {{ toHumanReadableMemorySize(bufferStats.freeDiskSpace) }} on disk
          <b-badge class="buffer-badge" :style="{ backgroundColor: themeState.vibrant }">Hybrid buffering</b-badge></label
        >
        <b-progress :max="bufferStats.maxMemory">
          <b-progress-bar
            v-bind:style="
              getMeterStyle(bufferStats.size, 0, bufferStats.freeDiskSpace)
            "
            :value="bufferStats.size"
            :label="toHumanReadableMemorySize(bufferStats.size)"
          ></b-progress-bar>
        </b-progress>
        <br />
      </div>

      <div class="col-md-6">
        <p>Track Time: {{ getTrackTime(trackTime) }} <span v-if="trackLength">/ {{trackLength}}</span></p>
      </div>
    </div>
  </div>
</template>

<script>
import Rainbow from "rainbowvis.js";
import _ from "lodash";
import { eventService } from "@/services/EventService";
import FrequencyMeter from "./FrequencyMeter.vue";
import { getRecordingState } from '../stores/RecordingState'
import { getThemeState } from '@/stores/ThemeState'

export default {
  name: "RecordingMetrics",
  components: { FrequencyMeter },
  data() {
    return {
      rms: 0.0,
      trackTime: 0,
      trackLengthMillis: 0,
      bufferStats: {},
      themeState: getThemeState()
    };
  },
  mounted() {
    eventService.metrics().rms((rms) => {
      this.rms = rms;
    });
    eventService.metrics().trackTime((trackTime) => {
      this.trackTime = trackTime;
    });
    eventService.metrics().bufferStats((bufferStats) => {
      this.bufferStats = bufferStats;
    });
    eventService.capture().onEnded(() => {
      this.rms = 0.0;
      this.trackTime = 0;
      this.bufferStats = {};
    });

    getRecordingState().$subscribe((_, state) => {
      this.trackLengthMillis = state.currentTrack?.lengthMillis
    })
  },
  methods: {
    toHumanReadableMemorySize(sizeInBytes) {
      if (sizeInBytes > 1024 * 1024 * 1024) {
        return `${(sizeInBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
      } else if (sizeInBytes > 1024 * 1024) {
        return `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
      } else if (sizeInBytes > 1024) {
        return `${(sizeInBytes / 1024).toFixed(2)} KB`;
      } else {
        return `${sizeInBytes} bytes`;
      }
    },

    getTrackTime(timeMillis) {
      if (!timeMillis) {
        return "N/A";
      }
      const minutes = Math.floor(timeMillis / 60000);
      const seconds = Math.floor((timeMillis % 60000) / 1000);
      const millis = timeMillis % 1000;
      return `${this.pad(minutes)}:${this.pad(seconds)}.${this.pad(millis, 3)}`;
    },

    pad(value, targetLength = 2) {
      const strValue = _.toString(value);
      if (strValue.length >= targetLength) {
        return strValue;
      }
      return `${_.repeat("0", targetLength - strValue.length)}${strValue}`;
    },

    getMeterStyle(value, min, max) {
      return { backgroundColor: this.getMeterColor(value, min, max) };
    },

    getMeterColor(value, min, max) {
      const rainbow = new Rainbow();
      rainbow.setNumberRange(min, max);
      rainbow.setSpectrum(this.themeState.vibrant || "#20e218", this.themeState.lightVibrant || "#c4b90b", this.themeState.darkVibrant || "#ff0023");
      return `#${rainbow.colorAt(value)}`;
    },
  },
  computed: {
    trackLength() {
      if (!this.trackLengthMillis) {
        return null
      }
      return this.getTrackTime(this.trackLengthMillis)
    }
  }
};
</script>

<style scoped>
#frequency-meter {
  transform: rotate(180deg) scaleX(-1);
  margin-bottom: 70px;
  filter: opacity(20%);
}

.metrics-container {
  margin: 0 auto;
}
.gauge {
  max-width: 300px;
  margin-bottom: 30px;
}
label {
  margin-top: 10px;
}
.buffer-stats {
  width: 100%;
}
.buffer-badge {
  float: right;
}
</style>