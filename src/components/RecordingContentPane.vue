<template>
  <div id="content">
      <TrackInfoPanel />
  </div>
</template>

<script>
import TrackInfoPanel from './TrackInfoPanel.vue'

export default {
  components: { TrackInfoPanel },
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