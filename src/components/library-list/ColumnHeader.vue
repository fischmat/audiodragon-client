<template>
  <div @click="onClick">
    {{ title }}

    <span :id="`filter-${apiField}`">
      <b-icon-filter v-if="isFilterable && !isFiltered" />
      <b-icon-filter-circle-fill v-if="isFilterable && isFiltered" />
    </span>
    <b-popover :target="`filter-${apiField}`" triggers="hover" placement="top">
      <template #title>Filter {{title}}</template>
      <b-input id="search-input" v-model="search" placeholder="Search..." :autofocus="true" @input="searchChanged" />
    </b-popover>

    <b-icon-sort-alpha-down v-if="isSortedOrder('ASC')" />
    <b-icon-sort-alpha-up v-if="isSortedOrder('DESC')" />
  </div>
</template>

<script>
import _ from 'lodash';

export default {
  components: {},
  name: "ColumnHeader",
  props: {
    title: String,
    apiField: String,
    apiFilterKey: String,
    sortable: {
      type: Boolean,
      default: false,
    },
    filterable: {
      type: Boolean,
      default: false
    },
    model: Object,
  },
  data() {
    return {
      search: null
    }
  },
  methods: {
    onClick() {
      const model = _.cloneDeep(this.model);
      model.sortBy = this.apiField;
      if (model.sortOrder === "ASC") {
        model.sortOrder = "DESC";
      } else if (model.sortOrder === "DESC") {
        this.sortBy = null;
        model.sortOrder = null;
      } else {
        model.sortOrder = "ASC";
      }
      this.$emit("change", model);
    },
    searchChanged(search) {
      const model = _.cloneDeep(this.model);
      model.filters = _.filter(model.filters, (f) => f.filterBy !== this.apiFilterKey)
      if (!_.isEmpty(search) && this.apiFilterKey) {
        model.filters.push({ filterBy: this.apiFilterKey, value: search })
      }
      console.log("Inner", search)
      this.$emit("change", model);
    },
    isSortedOrder(order) {
      return this.isSorted && this.model.sortOrder === order;
    }
  },
  computed: {
    isSorted() {
      return this.sortable && this.model.sortBy === this.apiField;
    },
    isFilterable() {
      return this.filterable && this.apiFilterKey;
    },
    isFiltered() {
      return this.isFilterable && _.find(this.model.filters, (f) => f.filterBy === this.apiFilterKey)
    }
  }
};
</script>

<style scoped>
#search-input:focus {
  border-color: unset;
  box-shadow: unset;
}
</style>