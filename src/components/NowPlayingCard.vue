<template>
  <div class="now-playing">
    <div class="cover" :class="{ listening: isRecognizing, failed: recognitionState === 'unrecognized' }">
      <b-img v-if="track.coverartImageUrl" :src="track.coverartImageUrl" :alt="track.title" />
      <div v-else class="recognition-art" aria-hidden="true"><span class="art-orb"></span><span class="art-scan"></span><span class="art-bars"><i v-for="bar in 9" :key="bar"></i></span></div>
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
    </div>
  </div>
</template>

<script>
import _ from "lodash";
import { eventService } from "@/services/EventService";
import { getRecordingState } from "@/stores/RecordingState";
import { captureService } from "@/services/CaptureService";
const EMPTY_TRACK = { title: "", artist: "", coverartImageUrl: null };
export default { name:"NowPlayingCard", data:()=>({track:_.cloneDeep(EMPTY_TRACK),recordingState:getRecordingState(),recognitionState:"idle",showManualEntry:false,manualTrack:{title:"",artist:""}}), computed:{isRecording(){return !!this.recordingState.currentCapture},isRecognizing(){return this.isRecording && !this.track.coverartImageUrl && this.recognitionState !== "unrecognized"}},mounted(){eventService.track().onRecognized(e=>{this.track=e.track;this.recognitionState="recognized"});eventService.track().onRecognitionFailed(()=>{this.recognitionState="unrecognized"});eventService.track().onStarted(()=>{this.track=_.cloneDeep(EMPTY_TRACK);this.recognitionState="recognizing";this.showManualEntry=false});eventService.track().onEnded(()=>{this.track=_.cloneDeep(EMPTY_TRACK);this.recognitionState="idle";this.showManualEntry=false})},methods:{retryRecognition(){this.recognitionState="recognizing";captureService.retryRecognition(this.recordingState.audioSource.id).catch(()=>{this.recognitionState="unrecognized"})},saveDetails(){const details={title:this.manualTrack.title,artist:this.manualTrack.artist};captureService.updateCurrentTrack(details,this.recordingState.audioSource.id).then(()=>{this.track={...this.track,...details};this.recognitionState="recognized";this.showManualEntry=false})}} };
</script>

<style scoped>
.now-playing{display:flex;align-items:center;gap:20px}.cover{width:130px;height:130px;border-radius:14px;overflow:hidden;flex:none;position:relative;background:#121827}.cover img{width:100%;height:100%;object-fit:cover}.recognition-art{position:absolute;inset:0;background:radial-gradient(circle at 30% 25%,rgba(45,212,191,.45),transparent 33%),radial-gradient(circle at 73% 67%,rgba(139,92,246,.6),transparent 48%),#161a29}.art-orb{position:absolute;width:64px;height:64px;left:33px;top:31px;border:1px solid rgba(225,231,255,.7);border-radius:50%;box-shadow:0 0 0 14px rgba(139,92,246,.08),0 0 32px rgba(45,212,191,.45)}.listening .art-orb{animation:orbit 3s ease-in-out infinite}.art-scan{position:absolute;inset:-28px;background:conic-gradient(from 0deg,transparent 0 75%,rgba(45,212,191,.38) 83%,transparent 92%);opacity:.4}.listening .art-scan{animation:spin 3.6s linear infinite}.art-bars{height:42px;position:absolute;bottom:15px;left:18px;right:18px;display:flex;gap:4px;align-items:flex-end;justify-content:center}.art-bars i{display:block;width:6px;height:12px;border-radius:8px;background:linear-gradient(#d8b4fe,#2dd4bf);opacity:.5}.listening .art-bars i{opacity:1;animation:equalize .85s ease-in-out infinite alternate}.listening .art-bars i:nth-child(2n){animation-delay:-.35s}.listening .art-bars i:nth-child(3n){animation-delay:-.6s}.cover.failed .recognition-art{filter:hue-rotate(105deg) saturate(.65);opacity:.58}.now-playing h2{font-size:32px;letter-spacing:-1px;margin:0 0 5px}.now-playing p{margin:0;color:#98a2b8;font-size:16px}.recognition{display:inline-flex;align-items:center;gap:7px;margin-top:17px;padding:7px 10px;border:1px solid #40506e;border-radius:999px;background:#232b3d;font-size:12px;font-weight:700}.recognition i{height:7px;width:7px;border-radius:50%;background:#a3e635}.recognition.waiting i{background:#2dd4bf;animation:pulse 1.5s infinite}.recognition.failed{border-color:#f59e0b;color:#fde68a}.recognition.failed i{background:#f59e0b}.recognition-actions{display:flex;gap:8px;margin-top:12px}.recognition-actions button,.manual-details button{border:0;border-radius:8px;background:#8b5cf6;color:#fff;padding:8px 10px;font-size:12px;font-weight:700}.recognition-actions .quiet{background:#232b3d;color:#d6dbea;border:1px solid #40506e}.manual-details{display:grid;grid-template-columns:1fr 1fr auto;gap:8px;margin-top:10px}.manual-details input{min-width:0;border:1px solid #40506e;border-radius:8px;background:#0b0d12;color:#f4f7fb;padding:8px;font-size:12px}.manual-details button:disabled{opacity:.5}@keyframes pulse{70%{box-shadow:0 0 0 7px rgba(45,212,191,0)}100%{box-shadow:0 0 0 0 rgba(45,212,191,0)}}@keyframes spin{to{transform:rotate(360deg)}}@keyframes orbit{50%{transform:scale(1.13);box-shadow:0 0 0 23px rgba(139,92,246,.04),0 0 42px rgba(45,212,191,.65)}}@keyframes equalize{to{height:35px;filter:brightness(1.35)}}
</style>
