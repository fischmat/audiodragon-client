<template>
  <div class="output-quality">
    <p class="eyebrow">FILE OUTPUT</p><h2>Choose a quality preset</h2><p>AudioDragon uses a high-quality stereo MP3 by default.</p>
    <button v-for="preset in presets" :key="preset.id" class="preset" :class="{selected: selectedPreset === preset.id}" @click="applyPreset(preset)"><span><strong>{{ preset.name }}</strong><small>{{ preset.description }}</small></span><b>{{ preset.id === 'recommended' ? 'Recommended' : preset.bitRate + ' kbps' }}</b></button>
    <button class="advanced-toggle" @click="showAdvanced = !showAdvanced">{{ showAdvanced ? 'Hide custom settings' : 'Customise output' }}</button>
    <div v-if="showAdvanced" class="advanced-output"><label>Bit rate</label><b-form-select v-model="format.bitRate" @change="onFormatChanged"><b-form-select-option v-for="rate in [64,128,192,256,320]" :key="rate" :value="rate">{{ rate }} kbit/s</b-form-select-option></b-form-select><b-form-checkbox v-model="format.vbr" @change="onFormatChanged" switch>Variable bit rate</b-form-checkbox></div>
  </div>
</template>

<script>
import { getRecordingState } from '../stores/RecordingState'
var recordingState = null

export default {
  components: {},
  name: "FileFormatSelector",
  data() {
    return {
      format: {
        bitRate: 320,
        channels: 2,
        quality: 1,
        vbr: false,
      },
      selectedPreset: "recommended",
      showAdvanced: false,
      presets: [
        { id: "recommended", name: "Recommended", description: "Excellent music quality with sensible file sizes", bitRate: 320, channels: 2, quality: 1, vbr: false },
        { id: "space", name: "Space saver", description: "Smaller files for casual listening", bitRate: 128, channels: 2, quality: 4, vbr: true },
        { id: "archive", name: "Archive quality", description: "Maximum MP3 quality for your favourites", bitRate: 320, channels: 2, quality: 1, vbr: false },
      ],
    };
  },
  methods: {
    applyPreset(preset) {
      this.selectedPreset = preset.id;
      this.format = { bitRate: preset.bitRate, channels: preset.channels, quality: preset.quality, vbr: preset.vbr };
      this.onFormatChanged();
    },
    onFormatChanged() {
      recordingState.outputFormat = this.format
    },
  },
  mounted() {
    recordingState = getRecordingState()
    if (recordingState.outputFormat) {
      this.format = { ...recordingState.outputFormat };
      const match = this.presets.find((preset) => preset.bitRate === this.format.bitRate && preset.channels === this.format.channels && preset.quality === this.format.quality && preset.vbr === this.format.vbr);
      this.selectedPreset = match ? match.id : "custom";
    } else {
      recordingState.outputFormat = this.format
    }
  },
};
</script>

<style scoped>
.eyebrow{margin:0 0 6px;color:#2dd4bf;font-size:11px;font-weight:700;letter-spacing:1px}.output-quality h2{font-size:20px;margin:0}.output-quality>p:not(.eyebrow){color:#98a2b8;font-size:13px;margin:8px 0 16px}.preset{display:flex;justify-content:space-between;align-items:center;width:100%;margin:8px 0;padding:14px;border:1px solid #30394e;border-radius:14px;text-align:left;color:#f4f7fb;background:#141824;transition:.2s}.preset:hover,.preset.selected{border-color:#8b5cf6;background:#232b3d}.preset span{display:grid;gap:3px}.preset strong{font-size:14px}.preset small{font-size:12px;color:#98a2b8}.preset b{color:#c7b5ff;font-size:11px}.advanced-toggle{border:0;background:none;padding:12px 0 0;color:#c7b5ff;font-size:13px;font-weight:700}.advanced-output{margin-top:12px;padding-top:12px;border-top:1px solid #30394e}.advanced-output label{display:block;margin-bottom:5px;color:#98a2b8;font-size:12px}.advanced-output .custom-select{margin-bottom:12px;background:#0b0d12;border-color:#40506e;color:#f4f7fb}
</style>
