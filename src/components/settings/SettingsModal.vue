<template>
  <div id="settings">
    <div>
      <b-tabs content-class="mt-3">
        <b-tab title="Basic" active>
          <b-form-group
            id="settings-form"
            v-if="settings"
            :state="settingsValid"
          >
            <b>General settings</b>
            <br />
            <label for="shazam-api-key-input">Shazam API key:</label>
            <b-form-input
              id="shazam-api-key-input"
              v-model="settings.recognition.rapidApiToken"
              :state="shazamApiKeyValid"
              @change="touched = true"
              v-b-tooltip.hover
              title="The API key to authenticate against the audio recognition API. You can get one at the link below."
              trim
            ></b-form-input>
            <i>An API key can be obtained <a href="https://rapidapi.com/apidojo/api/shazam">here</a>.</i>
            <br />
            <label for="output-directory-input">Output Directory:</label>
            <b-form-input
              id="output-directory-input"
              v-model="settings.output.location"
              :state="outputDirectoryValid"
              @change="touched = true"
              v-b-tooltip.hover
              title="Path to a directory where the output files will be written. If it does not exist, it will be created."
              trim
            ></b-form-input>
            <br>
          </b-form-group>
        </b-tab>
        <b-tab title="Splitting">
          <b>Track splitting</b>
          <br />
          <label for="split-after-silence-millis-input"
            >Split songs after silence (ms):</label
          >
          <div>
            <b-form-input
              id="split-after-silence-millis-input"
              v-model="settings.splitting.splitAfterSilenceMillis"
              type="range"
              min="0"
              max="2000"
              @change="touched = true"
              v-b-tooltip.hover
              title="After what time period of silence (in milliseconds) a track is cut."
              trim
            ></b-form-input>
            <span
              >{{
                settings.splitting.splitAfterSilenceMillis
              }}
              milliseconds</span
            >
          </div>
          <br />
          <label for="silence-rms-tolerance-input"
            >Silence RMS tolerance:</label
          >
          <div>
            <b-form-input
              id="silence-rms-tolerance-input"
              v-model="settings.splitting.silenceRmsTolerance"
              type="range"
              min="0"
              max="1"
              step="0.001"
              @change="touched = true"
              v-b-tooltip.hover
              title="Threshold for the root mean square of the signal (averaged over all channels) that is still considered silence. Should be increased if device is noisy."
              trim
            ></b-form-input>
            <span>{{ settings.splitting.silenceRmsTolerance == 0 ? '=' : '<' }} {{ settings.splitting.silenceRmsTolerance }}</span>
          </div>
          <br>
        </b-tab>
        <b-tab title="Recognition">
          <b>Track Recognition</b>
          <br />
          <label for="delay-until-recognition-input"
            >Delay until track recognition (s):</label
          >
          <div>
            <b-form-input
              id="delay-until-recognition-input"
              v-model="settings.recognition.secondsUntilRecognition"
              type="range"
              min="0"
              max="120"
              @change="touched = true"
              v-b-tooltip.hover
              title="The snippet used for recognition can be delayed by a certain amount of time from the start of the track. This way the sample may be more characteristic."
              trim
            ></b-form-input>
            <span
              >{{
                settings.recognition.secondsUntilRecognition
              }}
              seconds</span
            >
          </div>
          <br />
          <label for="sample-seconds-input"
            >Sample length for recognition (s):</label
          >
          <div>
            <b-form-input
              id="sample-seconds-input"
              v-model="settings.recognition.sampleSeconds"
              type="range"
              min="1"
              max="5"
              @change="touched = true"
              v-b-tooltip.hover
              title="How long the samples used for track recognition should be. This is limited to up to five seconds by the recognition API."
              trim
            ></b-form-input>
            <span>{{ settings.recognition.sampleSeconds }} seconds</span>
          </div>
          <br />
          <label for="max-retries-for-recognition-input"
            >Max. retries for recognition:</label
          >
          <div>
            <b-form-input
              id="max-retries-for-recognition-input"
              v-model="settings.recognition.maxRetries"
              type="range"
              min="1"
              max="10"
              @change="touched = true"
              v-b-tooltip.hover
              title="How often recognition for a track should be attempted at most. Set a lower value to save on recognition API calls."
              trim
            ></b-form-input>
            <span>{{ settings.recognition.maxRetries }} retries</span>
          </div>
          <br>
        </b-tab>
        <b-tab title="Network">
          <b>Proxy configuration</b>
          <br />
          <i>Proxy configuration only applies to calls made to external APIs.</i>
          <br>
          <div>
            <label for="network-proxy-type"
              >Proxy type:</label
            >
            <b-form-select
              id="network-proxy-type"
              v-model="proxy.type"
              @change="touched = true"
              v-b-tooltip.hover title="The type of the proxy to use." 
            >
            <b-form-select-option :value="null">Do not use proxy</b-form-select-option>
              <b-form-select-option value="http">HTTP</b-form-select-option>
              <b-form-select-option value="socks">SOCKS</b-form-select-option>
            </b-form-select>
          </div>
          <br>
          <div>
            <label for="network-proxy-host">Proxy host:</label>
            <b-form-input
              id="network-proxy-host"
              v-model="proxy.host"
              @change="touched = true"
              :disabled="!proxy.type"
              v-b-tooltip.hover title="The host of the proxy to use"
              trim
            ></b-form-input>
          </div>
          <br>
          <div>
            <label for="network-proxy-port">Proxy port:</label>
            <b-form-input
              id="network-proxy-port"
              type="number"
              v-model="proxy.port"
              @change="touched = true"
              :disabled="!proxy.type"
              v-b-tooltip.hover title="The port of the proxy to use"
              trim
            ></b-form-input>
          </div>
          <br>
        </b-tab>
        <b-tab title="Expert">
          <i>Allows to directly edit the settings JSON. Make sure to backup <code>.audiodragon.json</code> in your home directory first!</i>
          <br>
          <vue-json-editor v-model="settings" :show-btns="false" mode="form" @json-change="touched = true"></vue-json-editor>
          <br>
        </b-tab>
      </b-tabs>
    </div>
    <b-button
      class="save-button"
      :disabled="!settingsValid || !touched"
      @click="saveSettings"
      >Save</b-button
    >
  </div>
</template>

<script>
import _ from "lodash";
import { settingsService } from "@/services/SettingsService";
import vueJsonEditor from 'vue-json-editor'

export default {
  name: "SettingsModal",
  components: { vueJsonEditor },
  data() {
    return {
      touched: false,
      settings: null,
      proxy: {
        type: null,
        host: '',
        port: 0
      }
    };
  },
  mounted() {
    settingsService.getSettings().then((settings) => {
      this.settings = settings;
      if (settings.recognition.network?.proxy) {
        this.proxy = settings.recognition.network.proxy;
      }
    });
  },
  methods: {
    saveSettings() {
      this.applyProxySettings(this.settings);
      settingsService.updateSettings(this.settings);
      this.touched = false;
    },

    applyProxySettings(settings) {
      const networkSettings = {
        proxy: (this.proxy?.type ? this.proxy : null)
      };
      settings.recognition.network = networkSettings;
      settings.recognition.postprocessors.map((pp) => {
        if (pp.type === 'musicbrainz') {
          pp.network = networkSettings;
        }
      });
    }
  },
  computed: {
    settingsValid() {
      const proxyValid = !this.proxy?.type || (this.proxy?.host && this.proxy?.port);
      return this.shazamApiKeyValid && this.outputDirectoryValid && proxyValid; 
    },
    shazamApiKeyValid() {
      return (
        this.settings?.recognition?.recognizer === "shazam" &&
        !_.isEmpty(this.settings?.recognition.rapidApiToken)
      );
    },
    outputDirectoryValid() {
      return !_.isEmpty(this.settings.output.location);
    },
  },
};
</script>

<style>
label {
  margin-top: 10px;
}
.save-button {
  width: 100%;
}

div.jsoneditor-field {
  color: #fff;
}
tr.jsoneditor-highlight,
tr.jsoneditor-selected {
  background-color: #555;
}
div.jsoneditor {
  border-color: #555;
}
div.jsoneditor-menu {
  background-color: #555;
  border-bottom-color: #555;
}
div.jsoneditor-field[contenteditable=true]:focus,
div.jsoneditor-field[contenteditable=true]:hover,
div.jsoneditor-value[contenteditable=true]:focus,
div.jsoneditor-value[contenteditable=true]:hover,
div.jsoneditor-field.jsoneditor-highlight,
div.jsoneditor-value.jsoneditor-highlight {
  background-color: #555;
}
</style>