<template>
  <div class="modal-header align-items-center">
    <h5 class="modal-title">
      <font-awesome-icon v-if="icon" :icon="icon" />
      {{ title }}
    </h5>
    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
      <svg viewBox="0 0 24 24">
        <path
          fill="#000000"
          d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
        />
      </svg>
    </button>
  </div>
</template>

<style lang="sass" scoped>
button
  line-height: 32px
  svg
    width: 32px
    height: 32px
</style>

<script>
export default {
  props: ["title", "icon"]
};
</script>
