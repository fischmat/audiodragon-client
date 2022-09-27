<template>
  <div id="content">
      <TrackInfoPanel id="track-info-panel" />
      <RecordingMetrics id="recording-metrics" />
  </div>
</template>

<script>
import TrackInfoPanel from './TrackInfoPanel.vue'
import RecordingMetrics from './RecordingMetrics.vue'

export default {
  components: { TrackInfoPanel, RecordingMetrics },
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
  margin-top: 70px;
}
</style>