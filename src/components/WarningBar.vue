<template>
    <div v-if="anyProblem && !isDismissed" class="alert alert-danger" role="alert">
        <ul>
            <li v-if="!jreInfo.isSupported">The application is running on unsupported Java runtime '{{ jreInfo.name }}' by '{{ jreInfo.vendor }}'. Consider using <a href="https://www.oracle.com/de/java/technologies/downloads/">Oracle HotSpot JRE</a> in case you encounter any problems.</li>
            <li v-if="!recognitionPossible">Track recognition is currently not possible, because no API was set up yet. Please obtain a key (see link in settings) and enter it in the settings dialog.</li>
            <button class="btn btn-danger" @click="isDismissed = true">Dismiss</button>
        </ul>
    </div>
</template>
  
<script>
import _ from "lodash";
import { appInfoService } from '@/services/AppInfoService';
import { settingsService } from "@/services/SettingsService";

export default {
    name: "WarningBar",
    data() {
        return {
            jreInfo: { isSupported: true, name: 'Unknown', vendor: 'Unknown' },
            recognitionPossible: true,
            isDismissed: false
        };
    },
    mounted() {
        appInfoService.getAppInfo().then((appInfo) => {
            console.warn("Foo", appInfo)
            this.jreInfo = appInfo.jreInfo;
        });
        this.isTrackRecognitionPossible().then((isPossible) => {
            this.recognitionPossible = isPossible;
        })
    },
    methods: {
        async isTrackRecognitionPossible() {
            const settings = await settingsService.getSettings();
            const apiToken = settings.recognition.rapidApiToken;
            return apiToken && !_.every(apiToken, (c) => c == 'X');
        }
    },
    computed: {
        anyProblem() {
            return !this.jreInfo.isSupported || !this.isTrackRecognitionPossible
        }
    }
};
</script>
<style scoped>
ul {
    margin: 0;
}
.btn {
    margin-top: 10px;
}
</style>