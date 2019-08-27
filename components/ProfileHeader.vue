<template>
  <header class="p-5 text-light">
    <div class="row mt-5">
      <div class="col-sm-7">
        <h1 class="mt-3 d-flex align-items-center font-weight-bold text-nowrap">
          {{ profile ? profile.login : "not found" }}
        </h1>
        <h4 class="text-nowrap" v-if="!profile">
          User <i>{{ $route.params.username }}</i> does not exist on GitHub.
        </h4>
        <h4 class="text-nowrap" v-if="profile">
          Followers: {{ profile.followers }}
        </h4>
        <h4 class="mb-5 text-nowrap" v-if="profile">
          Earned: ${{ balance.usdBalance.toFixed(2) }} /
          {{ balance.sbdBalance.toFixed(2) }} SBD
        </h4>
      </div>
      <div class="col-sm-5" v-if="profile">
        <img
          src="https://steemitimages.com/u/mkt/avatar"
          style="width: 200px;"
          class="rounded-circle shadow-lg"
        />
      </div>
    </div>
    <!-- <div class="alert alert-info">
      <b>ATTENTION:</b> This website is still in prototype stage. Currently bugs
      are still very possible, which might lead to loss of funds. Information on
      this website represents the vision for this project and not the status
      quo. Please use this service only for testing until a stable version is
      announced.
    </div> -->
  </header>
</template>

<style lang="sass" scoped>
header
  min-height: 400px
  h1
    font-size: 4rem
    img
      width: 60px
      height: 60px
  &:before
    content: " "
    position: absolute
    z-index: -1
    top: -1770px
    left: -270px
    width: 2000px
    height: 2000px
    transform: rotate(-14deg)
    border-radius: 300px
    background-color: #eee
  &:after
    content: " "
    position: absolute
    z-index: -1
    top: -1780px
    left: -250px
    width: 2000px
    height: 2000px
    transform: rotate(-15deg)
    border-radius: 300px
    background-color: #F4D03F
    background-image: linear-gradient(132deg, #16A085 50%, #F4D03F 100%)
  iframe
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3)
</style>

<script>
import { mapGetters } from "vuex";

export default {
  props: ["profile", "balance"]
};
</script>
