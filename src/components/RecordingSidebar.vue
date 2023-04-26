<template>
  <b-sidebar id="sidebar" visible no-header>
    <div class="px-3 py-2">
      <capture-source-settings />

      <hr />

      <file-format-selector />

      <hr />

      <recording-controls />
    </div>

    <div>
      <b-button id="settings-button" class v-b-modal.settings-modal>
        Settings
      </b-button>

      <b-modal id="settings-modal" title="Settings" hide-footer>
        <settings-modal />
      </b-modal>
    </div>
  </b-sidebar>
</template>

<script>
import RecordingControls from "./RecordingControls.vue";
import FileFormatSelector from "./FileFormatSelector.vue";
import CaptureSourceSettings from "./CaptureSourceSettings.vue";
import SettingsModal from './settings/SettingsModal.vue';

export default {
  components: { RecordingControls, FileFormatSelector, CaptureSourceSettings, SettingsModal },
  name: "RecordingSidebar",
};
</script>

<style scoped>
.settings-button {
  width: 100%;
  margin-top: 10px;
}
#settings-button {
    width: 100%;
    position: absolute;
    bottom: 0;
}
</style>