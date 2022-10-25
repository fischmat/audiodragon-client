<template>
  <div id="track">
    <FrequencyMeter id="frequency-meter" />

    <LibraryList />
  </div>
</template>

<script>
import Rainbow from "rainbowvis.js";
import _ from "lodash";
import { eventService } from "@/services/EventService";
import FrequencyMeter from "./FrequencyMeter.vue";
import { getRecordingState } from "../stores/RecordingState";
import { getThemeState } from "@/stores/ThemeState";
import LibraryList from "./library-list/LibraryList";

export default {
  name: "RecordingMetrics",
  components: { FrequencyMeter, LibraryList },
  data() {
    return {
      rms: 0.0,
      trackTime: 0,
      trackLengthMillis: 0,
      bufferStats: {},
      themeState: getThemeState(),
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
      this.trackLengthMillis = state.currentTrack?.lengthMillis;
    });
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
      rainbow.setSpectrum(
        this.themeState.vibrant || "#20e218",
        this.themeState.lightVibrant || "#c4b90b",
        this.themeState.darkVibrant || "#ff0023"
      );
      return `#${rainbow.colorAt(value)}`;
    },
  },
  computed: {
    trackLength() {
      if (!this.trackLengthMillis) {
        return null;
      }
      return this.getTrackTime(this.trackLengthMillis);
    },
  },
};
</script>

<style scoped>
#frequency-meter {
  transform: rotate(180deg) scaleX(-1);
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