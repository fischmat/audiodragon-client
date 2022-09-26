<template>
  <div id="track">
    <div class="row">
      <div class="col-lg-4">
        <b-img
          id="cover-art"
          :src="
            track.coverartImageUrl ? track.coverartImageUrl : emptyTrackImage
          "
          fluid-grow
          :alt="track.title"
        ></b-img>
      </div>
      <div class="col-lg-8" id="metadata">
        <label for="track-title">Title</label>
        <b-form-input
          id="track-title"
          v-model="track.title"
          trim
        ></b-form-input>

        <label for="track-artist">Artist</label>
        <b-form-input
          id="track-artist"
          v-model="track.artist"
          trim
        ></b-form-input>

        <label for="track-album">Album</label>
        <b-form-input
          id="track-album"
          v-model="track.album"
          trim
        ></b-form-input>

        <label for="track-genre">Genre</label>
        <b-form-tags
          id="track-genre"
          input-id="tags-basic"
          separator=" ,;"
          v-model="track.genres"
        >
        </b-form-tags>

        <label for="track-year">Year</label>
        <b-form-input
          id="track-year"
          v-model="track.releaseYear"
          trim
        ></b-form-input>

        <label for="track-label">Label</label>
        <b-form-tags
          id="track-label"
          input-id="tags-basic"
          separator=" ,;"
          v-model="track.labels"
        >
        </b-form-tags>

        <label for="track-coverart-url">Coverart URL:</label>
        <b-form-input
          id="track-coverart-url"
          v-model="track.coverartImageUrl"
          trim
        ></b-form-input>
      </div>
    </div>
  </div>
</template>

<script>
import { eventService } from '@/services/EventService'
import { getRecordingState } from '../stores/RecordingState'
import { captureService } from '../services/CaptureService'
import _ from "lodash"

const EMPTY_TRACK = {
  title: "",
  artist: "",
  album: "",
  genres: [],
  releaseYear: null,
  labels: [],
  coverartImageUrl: null,
};

export default {
  name: "TrackInfoPanel",
  data() {
    return {
      track: _.cloneDeep(EMPTY_TRACK),
      emptyTrackImage: require("../assets/notrack.png"),
      recordingState: getRecordingState()
    };
  },
  mounted() {
    eventService.track().onRecognized((event) => {
      this.track = event.track
    })
    eventService.track().onEnded(() => {
      this.track = _.cloneDeep(EMPTY_TRACK)
    })
    eventService.track().onStarted(() => {
      this.track = _.cloneDeep(EMPTY_TRACK)
    })

    if (this.recordingState.audioSource) {
      this.getTrackData(this.recordingState.audioSource.id)
    }
    this.recordingState.$subscribe((_, state) => {
      this.getTrackData(state.audioSource.id)
    })
  },
  methods: {
    getTrackData(audioSourceId) {
      captureService.getCurrentTrack(audioSourceId).then((track) => {
        this.track = track ? track : EMPTY_TRACK;
      });
    }
  },
  watch: {
    track: {
      handler(track) {
        captureService.updateCurrentTrack(track, this.recordingState.audioSource.id)
      },
      deep: true
    }
  }
};
</script>

<style scoped>
#track {
  padding: 20px;
}
#metadata {
  max-height: 500px;
  overflow: auto;
}
#cover-art {
  max-width: 500px;
  max-height: 500px;
}
label {
  margin-top: 10px;
  margin-bottom: 0px;
}
</style>