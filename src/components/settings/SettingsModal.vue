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
              trim
            ></b-form-input>
            <br />
            <label for="output-directory-input">Output Directory:</label>
            <b-form-input
              id="output-directory-input"
              v-model="settings.output.location"
              :state="outputDirectoryValid"
              @change="touched = true"
              trim
            ></b-form-input>
            <hr />
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
                trim
              ></b-form-input>
              <span>&lt; {{ settings.splitting.silenceRmsTolerance }} RMS</span>
            </div>
            <hr />
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
                trim
              ></b-form-input>
              <span>{{ settings.recognition.maxRetries }} retries</span>
            </div>
          </b-form-group>
        </b-tab>
        <b-tab title="Advanced">
          <vue-json-editor v-model="settings" :show-btns="false" mode="form" @json-change="touched = true"></vue-json-editor>
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
    };
  },
  mounted() {
    settingsService.getSettings().then((settings) => {
      this.settings = settings;
    });
  },
  methods: {
    saveSettings() {
      settingsService.updateSettings(this.settings);
      this.touched = false;
    },
  },
  computed: {
    settingsValid() {
      return this.shazamApiKeyValid && this.outputDirectoryValid;
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