<template>
  <div>
    <div id="lib-list" class="lib-list">
      <b-row class="lib-list-header">
        <b-col> </b-col>
        <b-col>
          <ColumnHeader
            title="Title"
            :sortable="true"
            @change="(so) => resetSearch('TITLE', so)"
          />
        </b-col>
        <b-col>
          <ColumnHeader
            title="Album"
            :sortable="true"
            @change="(so) => resetSearch('ALBUM', so)"
          />
        </b-col>
        <b-col>
          <ColumnHeader title="Genres" :sortable="false" />
        </b-col>
        <b-col>
          <ColumnHeader
            title="Added"
            :sortable="true"
            @change="(so) => resetSearch('UPDATED_AT', so)"
          />
        </b-col>
      </b-row>
      <div v-for="item in items" v-bind:key="item.filePath">
        <LibraryItem :item="item" :synced="false" />
      </div>
    </div>
  </div>
</template>
  
  <script>
import { libraryService } from "@/services/LibraryService";
import LibraryItem from "./LibraryItem.vue";
import { eventService } from "@/services/EventService";
import ColumnHeader from "./ColumnHeader.vue";

export default {
  components: { LibraryItem, ColumnHeader },
  name: "LibraryList",
  data() {
    return {
      items: [],
      page: 0,
      loading: false,
      sortBy: 'UPDATED_AT',
      sortOrder: 'DESC',
    };
  },

  mounted() {
    // Detect when scrolled to bottom.
    const listElm = document.querySelector("#lib-list");
    listElm.addEventListener("scroll", () => {
      if (listElm.scrollTop + listElm.clientHeight >= listElm.scrollHeight) {
        this.loadNextPage();
      }
    });
    this.loadNextPage();

    eventService.library().initialized(() => {
      this.loadNextPage();
    });
    eventService.library().refreshed(() => {
      this.page = 0;
      this.loadNextPage(true);
    });
  },

  methods: {
    loadNextPage(reset = false) {
      this.page += 1;
      libraryService
        .getItems(this.page, 20, this.sortBy, this.sortOrder)
        .then((items) => {
          if (reset) {
            this.page = 1;
            this.items = items;
          } else {
            this.items.push(...items);
          }
        });
    },

    resetSearch(field, params) {
      if (params.sort) {
        this.sortBy = field;
        this.sortOrder = params.sort;
      } else if (params.sort === null) {
        this.sortBy = 'UPDATED_AT';
        this.sortOrder = 'DESC';
      }
      this.page = 0;

      this.loadNextPage(true);
    },
  },
};
</script>
  
<style scoped>
.lib-list {
  max-height: 600px;
  overflow-y: scroll;
}
.lib-list-header {
  padding: 10px;
  margin: 10px;
  font-weight: bold;
}
</style>