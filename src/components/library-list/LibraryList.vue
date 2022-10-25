<template>
  <div>
    <b-row class="lib-list-header">
      <b-col> </b-col>
      <b-col>
        <ColumnHeader
          title="Title"
          apiField="TITLE"
          apiFilterKey="title"
          :model="options"
          :sortable="true"
          :filterable="true"
          @change="resetSearch"
        />
      </b-col>
      <b-col>
        <ColumnHeader
          title="Album"
          apiField="ALBUM"
          apiFilterKey="album"
          :model="options"
          :sortable="true"
          :filterable="true"
          @change="resetSearch"
        />
      </b-col>
      <b-col>
        <ColumnHeader
          title="Genres"
          apiFilterKey="genre"
          :model="options"
          :filterable="true"
          @change="resetSearch"
        />
      </b-col>
      <b-col>
        <ColumnHeader
          title="Updated"
          apiField="UPDATED_AT"
          :model="options"
          :sortable="true"
          @change="resetSearch"
        />
      </b-col>
    </b-row>
    <div id="lib-list" class="lib-list">
      <div v-for="item in items" v-bind:key="item.filePath">
        <LibraryItem :item="item" />
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
      options: {
        sortBy: "UPDATED_AT",
        sortOrder: "DESC",
        filters: [],
      },
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
        .getItems(
          this.page,
          20,
          this.options.sortBy,
          this.options.sortOrder,
          this.options.filters
        )
        .then((items) => {
          if (reset) {
            this.page = 1;
            this.items = items;
          } else {
            this.items.push(...items);
          }
        });
    },

    resetSearch(options) {
      this.options = options;
      console.log(options);

      if (!this.options.sortOrder) {
        this.sortBy = "UPDATED_AT";
        this.sortOrder = "DESC";
      }
      this.page = 0;

      this.loadNextPage(true);
    },
  },
};
</script>
  
<style scoped>
.lib-list {
  max-height: 500px;
  overflow-y: scroll;
}
.lib-list-header {
  padding: 10px;
  margin: 10px;
  font-weight: bold;
}
</style>