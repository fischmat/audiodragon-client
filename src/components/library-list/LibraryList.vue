<template>
  <div class="library-list">
    <b-row class="lib-list-header">
      <b-col>
        <b-icon-search id="search-icon" />  
        <b-popover :target="`search-icon`" triggers="click" placement="right">
          <b-input id="search-input" v-model="options.search" placeholder="Search..." :autofocus="true" @input="resetSearch(options)" />
        </b-popover>
      </b-col>
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
    <b-overlay :show="loading" rounded="sm" variant="transparent">
      <div id="lib-list" class="lib-list">
        <div v-for="item in items" v-bind:key="item.filePath">
          <LibraryItem :item="item" />
        </div>
      </div>
    </b-overlay>
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
      hasMore: true,
      requestVersion: 0,
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
      this.loadNextPage(true);
    });
    eventService.library().refreshed(() => {
      this.page = 0;
      this.loadNextPage(true);
    });
    eventService.track().onWritten(() => {
      this.page = 0;
      this.loadNextPage(true);
    })
  },

  methods: {
    loadNextPage(reset = false) {
      if ((!reset && this.loading) || (!reset && !this.hasMore)) {
        return;
      }

      if (reset) {
        this.requestVersion += 1;
        this.page = 0;
        this.items = [];
        this.hasMore = true;
      }

      const requestVersion = this.requestVersion;
      const nextPage = this.page + 1;
      this.loading = true;
      libraryService
        .getItems(
          this.options.search,
          nextPage,
          20,
          this.options.sortBy,
          this.options.sortOrder,
          this.options.filters
        )
        .then((items) => {
          if (requestVersion === this.requestVersion) {
            this.page = nextPage;
            this.items.push(...items);
            this.hasMore = items.length === 20;
          }
        })
        .catch((error) => {
          if (requestVersion === this.requestVersion) {
            console.error("Could not load library items.", error);
          }
        })
        .finally(() => {
          if (requestVersion === this.requestVersion) {
            this.loading = false;
          }
        });
    },

    resetSearch(options) {
      this.options = options;
      console.log(options);

      if (!this.options.sortOrder) {
        this.options.sortBy = "UPDATED_AT";
        this.options.sortOrder = "DESC";
      }
      this.page = 0;
      this.loadNextPage(true);
    },
  },
};
</script>
  
<style scoped>
.library-list{height:100%;min-height:0;display:flex;flex-direction:column}.library-list .b-overlay-wrap{display:flex;flex:1;min-height:0;flex-direction:column}.lib-list{flex:1;min-height:200px;overflow-y:auto}
.lib-list-header {
  padding: 10px;
  margin: 10px;
  font-weight: bold;
}

#search-input:focus {
  border-color: unset;
  box-shadow: unset;
}
</style>
