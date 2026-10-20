<template>
  <div class="now-playing">
    <div class="cover" :class="{ listening: isRecognizing, failed: recognitionState === 'unrecognized' }">
      <b-img v-if="track.coverartImageUrl" :src="track.coverartImageUrl" :alt="track.title" />
      <div v-else class="recognition-art" aria-hidden="true"><span class="art-orb"></span><span class="art-scan"></span><span class="art-ripples"><i v-for="ring in 3" :key="ring"></i></span><span class="art-points"><i v-for="point in 3" :key="point"></i></span></div>
    </div>
    <div v-if="recognitionState === 'unrecognized'" class="recognition-failed">
      <h2>We couldn’t identify this song</h2>
      <p>Your recording is safe. Add details now, or keep recording and organise it later.</p>
      <div class="recognition failed"><i></i>Needs details</div>
      <div class="recognition-actions"><button @click="showManualEntry = !showManualEntry">Add title &amp; artist</button><button class="quiet" @click="retryRecognition">Try again</button></div>
      <form v-if="showManualEntry" class="manual-details" @submit.prevent="saveDetails"><input v-model.trim="manualTrack.title" placeholder="Song title" aria-label="Song title"><input v-model.trim="manualTrack.artist" placeholder="Artist" aria-label="Artist"><button :disabled="!manualTrack.title && !manualTrack.artist" type="submit">Save details</button></form>
    </div>
    <div v-else>
      <h2>{{ track.title || (isRecording ? 'Listening for a song…' : 'Nothing is recording yet') }}</h2>
      <p>{{ track.artist || 'Start a capture to identify the track playing on your system.' }}</p>
      <div class="recognition" :class="{ waiting: recognitionState === 'recognizing' || !track.title }"><i></i>{{ track.title ? 'Recognized and ready to save' : recognitionState === 'recognizing' ? 'Trying to identify this song…' : 'Recognition will start automatically' }}</div>
      <button v-if="track.title" class="details-action" @click="$emit('open-details')">Open details</button>
    </div>
  </div>
</template>

<script>
import _ from "lodash";
import { eventService } from "@/services/EventService";
import { getRecordingState } from "@/stores/RecordingState";
import { captureService } from "@/services/CaptureService";
const EMPTY_TRACK = { title: "", artist: "", coverartImageUrl: null };
export default {
  name: "NowPlayingCard",
  data: () => ({ track: _.cloneDeep(EMPTY_TRACK), recordingState: getRecordingState(), recognitionState: "idle", showManualEntry: false, manualTrack: { title: "", artist: "" } }),
  computed: {
    isRecording() { return !!this.recordingState.currentCapture },
    isRecognizing() { return this.isRecording && !this.track.coverartImageUrl && this.recognitionState !== "unrecognized" }
  },
  watch: {
    isRecording(isRecording) {
      if (isRecording) this.hydrateCurrentTrack();
    },
    "recordingState.currentTrack"(track) {
      if (this.hasTrackDetails(track)) this.applyTrack(track);
    }
  },
  mounted() {
    this.applyTrack(this.recordingState.currentTrack);
    this.hydrateCurrentTrack();
    eventService.track().onRecognized(e => {
      this.recordingState.currentTrack = e.track;
      this.applyTrack(e.track);
    });
    eventService.track().onRecognitionFailed(() => { this.recognitionState = "unrecognized" });
    eventService.track().onStarted(() => {
      this.track = _.cloneDeep(EMPTY_TRACK);
      this.recordingState.currentTrack = null;
      this.recognitionState = "recognizing";
      this.showManualEntry = false;
    });
    eventService.track().onEnded(() => {
      this.track = _.cloneDeep(EMPTY_TRACK);
      this.recordingState.currentTrack = null;
      this.recognitionState = "idle";
      this.showManualEntry = false;
    });
  },
  methods: {
    hasTrackDetails(track) {
      return !!(track && (track.title || track.artist || track.album || track.coverartImageUrl));
    },
    applyTrack(track) {
      if (!this.hasTrackDetails(track)) return;
      this.track = { ..._.cloneDeep(EMPTY_TRACK), ...track };
      this.manualTrack = { title: this.track.title || "", artist: this.track.artist || "" };
      this.recognitionState = "recognized";
    },
    hydrateCurrentTrack() {
      const audioSourceId = this.recordingState.audioSource?.id;
      if (!audioSourceId || this.hasTrackDetails(this.recordingState.currentTrack)) return;
      captureService.getCurrentTrack(audioSourceId)
        .then(track => {
          if (this.hasTrackDetails(track)) {
            this.recordingState.currentTrack = track;
            this.applyTrack(track);
          } else if (this.isRecording) {
            this.recognitionState = "recognizing";
          }
        })
        .catch(() => {
          if (this.isRecording) this.recognitionState = "recognizing";
        });
    },
    retryRecognition() {
      this.recognitionState = "recognizing";
      captureService.retryRecognition(this.recordingState.audioSource.id).catch(() => { this.recognitionState = "unrecognized" });
    },
    saveDetails() {
      const details = { title: this.manualTrack.title, artist: this.manualTrack.artist };
      captureService.updateCurrentTrack(details, this.recordingState.audioSource.id).then(() => {
        this.recordingState.currentTrack = { ...this.track, ...details };
        this.applyTrack(this.recordingState.currentTrack);
        this.showManualEntry = false;
      });
    }
  }
};
</script>

<style scoped>
.now-playing{display:flex;align-items:center;gap:20px}.cover{width:130px;height:130px;border-radius:14px;overflow:hidden;flex:none;position:relative;background:#121827}.cover img{width:100%;height:100%;object-fit:cover}.recognition-art{position:absolute;inset:0;background:radial-gradient(circle at 30% 25%,rgba(45,212,191,.45),transparent 33%),radial-gradient(circle at 73% 67%,rgba(139,92,246,.6),transparent 48%),#161a29}.art-orb{position:absolute;width:64px;height:64px;left:33px;top:31px;border:1px solid rgba(225,231,255,.7);border-radius:50%;box-shadow:0 0 0 14px rgba(139,92,246,.08),0 0 32px rgba(45,212,191,.45)}.listening .art-orb{animation:orbit 3s ease-in-out infinite}.art-scan{position:absolute;inset:-28px;background:conic-gradient(from 0deg,transparent 0 75%,rgba(45,212,191,.38) 83%,transparent 92%);opacity:.4}.listening .art-scan{animation:spin 3.6s linear infinite}.art-ripples{position:absolute;inset:0;display:grid;place-items:center}.art-ripples i{position:absolute;width:54px;height:54px;border:1px solid rgba(45,212,191,.42);border-radius:50%;opacity:0}.listening .art-ripples i{animation:ripple 2.4s ease-out infinite}.listening .art-ripples i:nth-child(2){animation-delay:.8s}.listening .art-ripples i:nth-child(3){animation-delay:1.6s}.art-points{position:absolute;inset:17px;animation:spin 6s linear infinite}.art-points i{position:absolute;width:5px;height:5px;border-radius:50%;background:#e9d5ff;box-shadow:0 0 10px #c4b5fd}.art-points i:nth-child(1){left:2px;top:22px}.art-points i:nth-child(2){right:5px;top:7px}.art-points i:nth-child(3){right:20px;bottom:3px}.cover.failed .recognition-art{filter:hue-rotate(105deg) saturate(.65);opacity:.58}.now-playing h2{font-size:32px;letter-spacing:-1px;margin:0 0 5px}.now-playing p{margin:0;color:#98a2b8;font-size:16px}.recognition{display:inline-flex;align-items:center;gap:7px;margin-top:17px;padding:7px 10px;border:1px solid #40506e;border-radius:999px;background:#232b3d;font-size:12px;font-weight:700}.recognition i{width:7px;height:7px;border-radius:50%;background:#a3e635}.recognition.waiting i{background:#2dd4bf;animation:pulse 1.5s infinite}.recognition.failed{border-color:#f59e0b;color:#fde68a}.recognition.failed i{background:#f59e0b}.details-action{margin-left:10px;border:1px solid #8b5cf6;border-radius:8px;background:transparent;color:#e9e0ff;padding:7px 10px;font-size:12px;font-weight:700}.details-action:hover{background:#332558}.recognition-actions{display:flex;gap:8px;margin-top:12px}.recognition-actions button,.manual-details button{border:0;border-radius:8px;background:#8b5cf6;color:#fff;padding:8px 10px;font-size:12px;font-weight:700}.recognition-actions .quiet{background:#232b3d;color:#d6dbea;border:1px solid #40506e}.manual-details{display:grid;grid-template-columns:1fr 1fr auto;gap:8px;margin-top:10px}.manual-details input{min-width:0;border:1px solid #40506e;border-radius:8px;background:#0b0d12;color:#f4f7fb;padding:8px;font-size:12px}.manual-details button:disabled{opacity:.5}@keyframes pulse{70%{box-shadow:0 0 0 7px rgba(45,212,191,0)}100%{box-shadow:0 0 0 0 rgba(45,212,191,0)}}@keyframes spin{to{transform:rotate(360deg)}}@keyframes orbit{50%{transform:scale(1.13);box-shadow:0 0 0 23px rgba(139,92,246,.04),0 0 42px rgba(45,212,191,.65)}}@keyframes ripple{0%{transform:scale(.55);opacity:.65}100%{transform:scale(2);opacity:0}}
.cover:not(.listening) .art-ripples i{opacity:.15;animation:none}.cover:not(.listening) .art-points{animation:none}
</style>
