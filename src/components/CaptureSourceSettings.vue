<template>
  <div class="source-setup">
    <p class="eyebrow">CAPTURE SOURCE</p>
    <h2>Where is your music playing?</h2>
    <p class="source-help">System-audio devices are shown first. Choose the source with the moving level meter when music is playing.</p>
    <button v-for="source in sortedAudioSources" :key="source.id" class="source-card" :class="{ selected: audioSource && audioSource.id === source.id }" @click="audioSource = source">
      <span class="source-icon" :class="source.kind === 'SYSTEM_AUDIO' ? 'system' : ''"></span>
      <span class="source-copy"><small>{{ source.recommended ? 'RECOMMENDED · SYSTEM AUDIO' : source.kind === 'SYSTEM_AUDIO' ? 'SYSTEM AUDIO' : 'INPUT DEVICE' }}</small><strong>{{ source.name }}</strong><em>{{ source.recommended ? 'Captures everything you hear' : 'Use this only when you want to record a microphone or external input' }}</em></span>
      <span v-if="source.recommended" class="detected">Sound detected</span>
    </button>
    <button class="advanced-toggle" @click="showAdvanced = !showAdvanced">{{ showAdvanced ? 'Hide capture details' : 'Change capture quality' }}</button>
    <div v-if="showAdvanced" class="advanced-capture">
      <label for="format">Capture format</label>
      <b-form-select id="format" v-model="audioFormat" :disabled="!availableAudioFormats || availableAudioFormats.length === 0">
        <b-form-select-option v-for="f of availableAudioFormats" :key="JSON.stringify(f)" :value="f">{{ formatDescriptor(f) }}</b-form-select-option>
      </b-form-select>
      <label for="sample-rate">Sample rate</label>
      <b-form-input id="sample-rate" v-model="effectiveSamplingRate" min="1" type="number" :number="true" :no-wheel="true" :disabled="!audioFormat"></b-form-input>
    </div>
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
      showAdvanced: false,
    };
  },

  computed: {
    sortedAudioSources() {
      return [...this.availableAudioSources].sort((a, b) => Number(b.recommended) - Number(a.recommended) || a.name.localeCompare(b.name));
    },
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

      this.audioSource = this.availableAudioSources.find(s => s.id === recordingState.audioSource?.id) || this.sortedAudioSources[0] || null;
    });
  },

  watch: {
    audioSource(audioSource) {
      recordingState.audioSource = audioSource

      if (!audioSource) return;
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
          // Do not show formats that are above stereo for now:
          const monoOrStereoFormats = _.filter(formats, (f) => f.channels <= 2);

          const formatsWithDefaults = _.map(monoOrStereoFormats, this.convertAudioFormat);
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
      const endianess = format.bigEndian ? "BE" : "LE";
      const encoding = this.encodingName(format.encoding);
      return `${channelDesc}, ${format.sampleSizeInBits} bits, ${encoding} ${endianess}`;
    },

    longFormatDescriptor(format) {
      var channels;
      if (format.channels == 1) {
        channels = "1 channel";
      } else {
        channels = `${format.channels} channels`;
      }
      const endianess = format.bigEndian ? "big-endian" : "little-endian";
      const encoding = this.encodingName(format.encoding);
      return `${channels} with ${format.sampleSizeInBits} bits per sample and ${endianess} ${encoding} encoding`
    },

    encodingName(encoding) {
      switch(encoding) {
        case "PCM_SIGNED": return "PCM";
        case "PCM_UNSIGNED": return "PCM (unsigned)";
        case "ALAW": return "A-law";
        case "ULAW": return "µ-law";
        default: return encoding;
      }
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
.eyebrow{margin:0 0 6px;color:#2dd4bf;font-size:11px;font-weight:700;letter-spacing:1px}.source-setup h2{font-size:20px;margin:0}.source-help{color:#98a2b8;font-size:13px;margin:8px 0 16px}.source-card{display:flex;align-items:center;width:100%;gap:12px;margin:8px 0;padding:14px;border:1px solid #30394e;border-radius:14px;text-align:left;color:#f4f7fb;background:#141824;transition:.2s}.source-card:hover,.source-card.selected{border-color:#2dd4bf;background:#232b3d}.source-icon{width:12px;height:12px;border-radius:50%;background:#667085;flex:none}.source-icon.system{background:#2dd4bf;box-shadow:0 0 12px #2dd4bf}.source-copy{display:grid;gap:2px;min-width:0}.source-copy small{font-size:10px;letter-spacing:.6px;color:#98a2b8}.source-copy strong{font-size:14px}.source-copy em{font-size:12px;font-style:normal;color:#98a2b8}.detected{margin-left:auto;white-space:nowrap;color:#a3e635;font-size:11px;font-weight:700}.advanced-toggle{border:0;background:none;padding:12px 0 0;color:#c7b5ff;font-size:13px;font-weight:700}.advanced-capture{margin-top:12px;padding-top:12px;border-top:1px solid #30394e}.advanced-capture label{display:block;margin:12px 0 5px;color:#98a2b8;font-size:12px}.advanced-capture .custom-select,.advanced-capture .form-control{background:#0b0d12;border-color:#40506e;color:#f4f7fb}
</style>
