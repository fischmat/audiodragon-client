<template>
  <div @click="onClick">
    {{ title }}
    <b-icon-sort-alpha-down v-if="sortable && sort == 'ASC'" />
      <b-icon-sort-alpha-up v-if="sortable && sort == 'DESC'" />
  </div>
</template>

<script>
export default {
  components: {},
  name: "ColumnHeader",
  props: {
    title: String,
    sortable: {
      type: Boolean,
      default: false,
    }
  },
  data() {
    return {
      sort: null,
    };
  },
  methods: {
    onClick() {
      if (this.sort === "ASC") {
        this.sort = "DESC";
      } else if (this.sort === "DESC") {
        this.sort = null;
      } else {
        this.sort = "ASC";
      }
      this.$emit("change", { sort: this.sort });
    },
  },
};
</script>

<style scoped>
</style>