<template>
  <div class="now-playing">
    <div class="cover" :style="coverStyle"><b-img v-if="track.coverartImageUrl" :src="track.coverartImageUrl" :alt="track.title" /></div>
    <div>
      <h2>{{ track.title || (isRecording ? 'Listening for a song…' : 'Nothing is recording yet') }}</h2>
      <p>{{ track.artist || 'Start a capture to identify the track playing on your system.' }}</p>
      <div class="recognition" :class="{ waiting: !track.title }"><i></i>{{ track.title ? 'Recognized and ready to save' : 'Recognition will start automatically' }}</div>
    </div>
  </div>
</template>

<script>
import _ from "lodash";
import { eventService } from "@/services/EventService";
import { getRecordingState } from "@/stores/RecordingState";
const EMPTY_TRACK = { title: "", artist: "", coverartImageUrl: null };
export default { name:"NowPlayingCard", data:()=>({track:_.cloneDeep(EMPTY_TRACK),recordingState:getRecordingState()}), computed:{isRecording(){return !!this.recordingState.currentCapture},coverStyle(){return this.track.coverartImageUrl?{}:{background:"radial-gradient(circle at 73% 24%, #2dd4bf 0 20%, transparent 21%), radial-gradient(circle at 32% 34%, #8b5cf6 0 35%, transparent 36%), radial-gradient(circle at 42% 76%, #fb7185 0 22%, #232b3d 23%)"}}},mounted(){eventService.track().onRecognized(e=>{this.track=e.track});eventService.track().onStarted(()=>{this.track=_.cloneDeep(EMPTY_TRACK)});eventService.track().onEnded(()=>{this.track=_.cloneDeep(EMPTY_TRACK)})} };
</script>

<style scoped>
.now-playing{display:flex;align-items:center;gap:20px}.cover{width:130px;height:130px;border-radius:14px;overflow:hidden;flex:none;background:#232b3d}.cover img{width:100%;height:100%;object-fit:cover}.now-playing h2{font-size:32px;letter-spacing:-1px;margin:0 0 5px}.now-playing p{margin:0;color:#98a2b8;font-size:16px}.recognition{display:inline-flex;align-items:center;gap:7px;margin-top:17px;padding:7px 10px;border:1px solid #40506e;border-radius:999px;background:#232b3d;font-size:12px;font-weight:700}.recognition i{height:7px;width:7px;border-radius:50%;background:#a3e635}.recognition.waiting i{background:#2dd4bf;animation:pulse 1.5s infinite}@keyframes pulse{70%{box-shadow:0 0 0 7px rgba(45,212,191,0)}100%{box-shadow:0 0 0 0 rgba(45,212,191,0)}}
</style>
