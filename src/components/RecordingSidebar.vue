<template>
    <b-sidebar id="sidebar" visible no-header>
      <div class="px-3 py-2">
        <capture-source-settings />

        <hr />

        <file-format-selector />

        <hr />

        <recording-controls />
      </div>
    </b-sidebar>
</template>

<script>
import RecordingControls from './RecordingControls.vue'
import FileFormatSelector from './FileFormatSelector.vue';
import CaptureSourceSettings from './CaptureSourceSettings.vue';

export default {
  components: { RecordingControls, FileFormatSelector, CaptureSourceSettings },
  name: "RecordingSidebar"
};
</script>

<style scoped>
.settings-button {
  width: 100%;
  margin-top: 10px;
}
</style>