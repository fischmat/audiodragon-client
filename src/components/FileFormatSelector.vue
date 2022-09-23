<template>
  <div>
    <label for="bit-rate">Bit rate</label>
    <b-form-select
      id="bit-rate"
      @change="onFormatChanged"
      v-model="format.bitRate"
      v-b-tooltip.hover title="The target bitrate of the output file. This heavily impacts sound quality, but also file size." 
    >
      <b-form-select-option :value="8">8 kbit/s</b-form-select-option>
      <b-form-select-option :value="16">16 kbit/s</b-form-select-option>
      <b-form-select-option :value="32">32 kbit/s</b-form-select-option>
      <b-form-select-option :value="64">64 kbit/s</b-form-select-option>
      <b-form-select-option :value="128">128 kbit/s</b-form-select-option>
      <b-form-select-option :value="256">256 kbit/s</b-form-select-option>
      <b-form-select-option :value="320">320 kbit/s</b-form-select-option>
    </b-form-select>

    <label for="channels">Channels</label>
    <b-form-select
      id="channels"
      @change="onFormatChanged"
      v-model="format.channels"
      v-b-tooltip.hover
      title="Whether to encode with stereo or mono channels."
    >
      <b-form-select-option :value="1">Mono</b-form-select-option>
      <b-form-select-option :value="2">Stereo</b-form-select-option>
    </b-form-select>

    <label for="quality">Quality</label>
    <b-form-spinbutton
      id="quality"
      v-model="format.quality"
      @change="onFormatChanged"
      min="1"
      max="9"
      v-b-tooltip.hover
      title="Encoding quality of the output file. Must be a value between 1 (best) and 9 (worst)."
    ></b-form-spinbutton>

    <label for="vbr">VBR</label>
    <b-form-checkbox
      id="vbr"
      v-model="format.vbr"
      @change="onFormatChanged"
      v-b-tooltip.hover
      title="Encoding with variable bitrate shrinks output size, but may not be correctly recognized by some players."
      switch
    >
      {{ format.vbr ? "Variable Bit Rate" : "Constant Bit Rate" }}
    </b-form-checkbox>
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
    };
  },
  methods: {
    onFormatChanged() {
      recordingState.outputFormat = this.format
    },
  },
  mounted() {
    recordingState = getRecordingState()
    recordingState.outputFormat = this.format
  },
};
</script>

<style scoped>
label {
  margin-top: 10px;
}
</style>