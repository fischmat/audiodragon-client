<template>
  <b-modal id="initial-setup-modal" hide-header hide-footer>
    <div id="setup">
      <div>
        <span class="title">Welcome to AudioDragon</span>

        <p>
          This applications allows to record audio tracks from an input device
          and automatically tags any recognized tracks. In order for this
          recognition to work, a RapidAPI Shazam API key is required.
        </p>
        <p>
          Please follow these steps and enter the API key below:
          <ul>
            <li>Go to the <a href="https://rapidapi.com">RapidAPI Hub</a> and create an account.</li>
            <li>Now go to the <a href="https://rapidapi.com/apidojo/api/shazam">Shazam&copy; API page</a>.</li>
            <li>Subscribe to the API and choose a plan (you may select the free one to get started).</li>
            <li>Find the <code>X-RapidAPI-Key</code> shown on the overview page (you can copy it on the right side from the code snippet).</li>
            <li>Paste your <code>X-RapidAPI-Key</code> below.</li>
          </ul>
        </p>
        <label for="shazam-api-key-input">X-RapidAPI-Key:</label>
        <b-form-input
          id="shazam-api-key-input"
          v-model="settings.recognition.rapidApiToken"
          :state="shazamApiKeyValid"
          @change="touched = true"
          trim
        ></b-form-input>
      </div>
      <br>
      <b-button
      class="save-button"
      :disabled="!shazamApiKeyValid"
      @click="save"
      >Let's go</b-button
    >
    </div>
  </b-modal>
</template>

<script>
import _ from "lodash";
import { settingsService } from "@/services/SettingsService";

export default {
  name: "InitialSetupModal",
  data() {
    return {
      settings: {
        recognition: {}
      }
    };
  },
  async mounted() {
    this.settings = await settingsService.getSettings();
    if (!this.settings.updatedAt) {
      this.$bvModal.show("initial-setup-modal");
    }
  },
  computed: {
    shazamApiKeyValid() {
      return this.settings?.recognition?.recognizer === "shazam" &&
        !_.isEmpty(this.settings?.recognition.rapidApiToken)
    }
  },
  methods: {
    async save() {
      await settingsService.updateSettings(this.settings);
      this.$bvModal.hide("initial-setup-modal");
    }
  }
};
</script>

<style>
.title {
  font-size: 20pt;
}
</style>