<template>
  <div id="content">
      <WarningBar />
      <TrackInfoPanel id="track-info-panel" />
      <RecordingMetrics id="recording-metrics" />
  </div>
</template>

<script>
import TrackInfoPanel from './TrackInfoPanel.vue'
import RecordingMetrics from './RecordingMetrics.vue'
import WarningBar from './WarningBar.vue';

export default {
  components: { TrackInfoPanel, RecordingMetrics, WarningBar },
  name: "RecordingContentPane"
};
</script>

<style scoped>
#content {
    margin-left: 320px;
    padding: 10px;
}

.tab-icon {
  color: #adafae;
}

#recording-metrics {
  margin-top: 10px;
}
</style>