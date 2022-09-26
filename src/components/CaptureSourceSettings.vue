<template>
  <div>
    <label for="audio-source-select">Audio source:</label>
    <b-form-select
      id="audio-source-select"
      v-model="audioSource"
      v-b-tooltip.hover
      title="The audio source (e.g. device) to capture sound from."
    >
      <b-form-select-option
        v-for="source of availableAudioSources"
        :key="source.id"
        :value="source"
        >{{ source.name }}</b-form-select-option
      >
    </b-form-select>

    <label for="format">Format:</label>
    <b-form-select
      id="format"
      v-model="audioFormat"
      v-b-tooltip.hover
      :disabled="!availableAudioFormats || availableAudioFormats.length == 0"
      title="The audio format to use for sampling. Number of channels should be at least the number of output channels. Larger sample sizes result in better quality."
    >
      <b-form-select-option
        v-for="f of availableAudioFormats"
        :key="JSON.stringify(f)"
        :value="f"
        >{{ formatDescriptor(f) }}</b-form-select-option
      >
    </b-form-select>

    <label for="sample-rate">Sampling rate:</label>
    <b-form-input
      id="sample-rate"
      v-model="effectiveSamplingRate"
      min="1"
      type="number"
      :number="true"
      :no-wheel="true"
      :disabled="!this.audioFormat || !this.audioFormat.sampleRate"
      trim
      v-b-tooltip.hover
      title="The number of samples from the continuous signal to take per second. Higher values result in better quality. Not all values are supported by all players."
    ></b-form-input>
  </div>
</template>

<script>
import { getRecordingState } from '../stores/RecordingState'
import { audioSourceService } from '../services/AudioSourceService'
import _ from "lodash"
import { captureService } from '@/services/CaptureService'

var recordingState = null

export default {
  name: "CaptureSourceSettings",
  data() {
    return {
      audioSource: null,
      audioFormat: null,

      availableAudioSources: [],
      availableAudioFormats: [],
    };
  },

  computed: {
    effectiveSamplingRate: {
      get() {
        return this.audioFormat?.sampleRate || 48000
      },
      set(sampleRate) {
        if (this.audioFormat) {
          this.audioFormat.sampleRate = sampleRate;
        }
      },
    },
  },

  mounted() {
    recordingState = getRecordingState()

    audioSourceService.getAudioSources().then((availableAudioSources) => {
      this.availableAudioSources = availableAudioSources;

      if (recordingState.audioSource) {
        this.audioSource = recordingState.audioSource
      }
    });
  },

  watch: {
    audioSource(audioSource) {
      recordingState.audioSource = audioSource

      this.getAndRankAudioFormats(audioSource.id).then((rankedFormats) => {
        this.availableAudioFormats = rankedFormats
        
        captureService.getOngoingRecording(audioSource.id).then((capture) => {
          recordingState.currentCapture = capture
          this.audioFormat = capture.audioFormat
        })
        .catch(() => {
          this.audioFormat = _.head(this.availableAudioFormats)
        })
      })
    },
    audioFormat(audioFormat) {
      recordingState.audioFormat = audioFormat
    }
  },

  methods: {
    getAndRankAudioFormats(audioSource) {
      if (!audioSource) {
        return [];
      }
      return audioSourceService
        .getAudioFormats(audioSource)
        .then((formats) => {
          const formatsWithDefaults = _.map(formats, this.convertAudioFormat);
          return _.sortBy(
            _.uniqBy(formatsWithDefaults, JSON.stringify),
            this.scoreAudioFormat
          );
        });
    },

    formatDescriptor(format) {
      var channelDesc = null;
      if (format.channels == 1) {
        channelDesc = "Mono";
      } else if (format.channels == 2) {
        channelDesc = "Stereo";
      } else {
        channelDesc = `${format.channels} channels`;
      }
      const endianess = format.bigEndian ? "big endian" : "little endian";

      return `${channelDesc}, ${format.sampleSizeInBits} bits, ${endianess} (${format.encoding})`;
    },

    scoreAudioFormat(format) {
      var channelScore = 0;
      switch (format.channels) {
        case 1:
          channelScore = 1;
          break;
        case 2:
          channelScore = 2;
          break;
      }
      return (1000 * channelScore + format.sampleSizeInBits) * -1;
    },

    convertAudioFormat(format) {
      if (format.sampleRate === -1) {
        format.sampleRate = 48000;
      }
      _.unset(format, "frameSize");
      _.unset(format, "frameRate");
      return format;
    }
  },
};
</script>

<style scoped>
label {
  margin-top: 10px;
}
</style>