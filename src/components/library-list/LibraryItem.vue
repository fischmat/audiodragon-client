<template>
    <b-row class="lib-item">
        <b-col>
            <b-img id="cover" :src="item.coverartImageUrl" :alt="item.title" />
        </b-col>
        <b-col>
            <span id="title" class="info-label">{{item.title}}</span>
            <span id="artist" class="info-label">{{item.artist}}</span>
        </b-col>
        <b-col>
            <span id="album" class="info-label">{{item.album}}</span>
            <span id="releaseYear" class="info-label">{{item.releaseYear}}</span>
        </b-col>
        <b-col>
            <span v-for="genre in item.genres" v-bind:key="genre" class="info-label">{{genre}}</span>
        </b-col>
        <b-col>
            <span>{{updatedAt}}</span>
        </b-col>
    </b-row>
</template>
  
  <script>
import moment from 'moment';

export default {
  components: {},
  name: "LibraryItem",
  props: ["item"],
  data() {
    return {}
  },
  computed: {
    updatedAt() {
        return moment(this.item.updatedAt).fromNow()
    }
  }
};
</script>
  
<style scoped>
.lib-item {
    background-color: #11111131;
    padding: 10px;
    margin: 10px;
    border-radius: 5px;
}
.info-label {
    color: #888;
    width: 100%;
    display: inline-block;
}

.sync-state {
    max-width: 20px;
}

#cover {
    max-width: 100px;
    border-radius: 5px;
}

#title {
    color: #fff;
}
</style>