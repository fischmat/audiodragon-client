<template>
  <div id="content">
      <TrackInfoPanel />
      <RecordingMetrics />
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
</style>