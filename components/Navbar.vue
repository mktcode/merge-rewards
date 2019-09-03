<template>
  <nav class="navbar navbar-expand-md bg-dark position-fixed w-100">
    <nuxt-link class="navbar-brand pt-0" to="/">
      <img src="/logo.png" alt="logo.png" />
    </nuxt-link>
    <button
      class="navbar-toggler"
      type="button"
      data-toggle="collapse"
      data-target="#navbarSupportedContent"
      aria-controls="navbarSupportedContent"
      aria-expanded="false"
      aria-label="Toggle navigation"
    >
      <span class="navbar-toggler-icon"></span>
    </button>

    <div class="collapse navbar-collapse" id="navbarSupportedContent">
      <ul class="navbar-nav mr-auto">
        <li class="nav-item">
          <nuxt-link class="nav-link position-relative" to="/claim">
            Contributions
            <small
              class="badge badge-light text-success rounded-circle open-claims-badge"
              v-if="claimablePRs"
              >{{ claimablePRs }}</small
            >
          </nuxt-link>
        </li>
        <li class="nav-item">
          <nuxt-link class="nav-link" to="/bounties">Bounties</nuxt-link>
        </li>
        <!-- <li class="nav-item">
          <nuxt-link class="nav-link" to="/projects">Projects</nuxt-link>
        </li> -->
      </ul>
      <div class="navbar-text" v-if="githubUser">
        <button
          class="btn btn-sm btn-light mr-1"
          data-target="#deposit-modal"
          data-toggle="modal"
        >
          <font-awesome-icon icon="plus" class="text-success" />
        </button>
        <div class="btn-group mr-1" v-if="balance">
          <a
            href="#"
            data-toggle="modal"
            data-target="#withdraw-paypal-modal"
            class="btn btn-sm btn-light"
          >
            ${{ balance.usd.toFixed(2) }}
          </a>
          <a
            href="#"
            data-toggle="modal"
            data-target="#withdraw-paypal-modal"
            class="btn btn-sm btn-light"
          >
            {{ balance.eur.toFixed(2) }} €
          </a>
          <a
            href="#"
            data-toggle="modal"
            data-target="#withdraw-modal"
            class="btn btn-sm btn-light"
          >
            {{ balance.sbd.toFixed(2) }} SBD
          </a>
        </div>
        <div class="btn-group">
          <nuxt-link
            :to="'/user/' + githubUser.login"
            class="btn btn-sm btn-light"
          >
            <span
              v-if="false"
              class="badge badge-success position-absolute rounded-circle"
              style="left: -5px; top: -5px;"
              >2</span
            >
            <img
              src="/steem-icon-dark.png"
              style="width: 14px; margin-top: -3px; opacity: 0.8;"
              alt=""
              v-if="steemUser"
            />
            <font-awesome-icon :icon="['fab', 'github']" />
            Hi {{ githubUser.login }}!
          </nuxt-link>
          <button
            @click.prevent="$store.dispatch('github/logout')"
            class="btn btn-sm btn-light btn-logout"
          >
            <font-awesome-icon icon="power-off" />
          </button>
        </div>
      </div>
      <a
        v-else
        :href="
          'https://github.com/login/oauth/authorize?scope=user:email&client_id=' +
            githubClientId
        "
        class="btn btn-light btn-sm"
      >
        <font-awesome-icon :icon="['fab', 'github']" />
        Connect
      </a>
    </div>
  </nav>
</template>

<style lang="sass">
@import '~/assets/mixins.sass'

.navbar
  z-index: 1
.navbar-nav .nav-link
  color: rgba(255, 255, 255, 0.5)
  &.nuxt-link-active,
    color: #fff
  &:hover:not(.nuxt-link-active)
    color: rgba(255, 255, 255, 0.75)
.open-claims-badge
  position: absolute
  top: 2px
  right: -2px
  font-size: 10px
  line-height: 9px
  opacity: 0.7
.nav-link
  &:hover
    .open-claims-badge
      opacity: 1
.btn-logout
  color: #aaa
  &:hover
    color: #c00
</style>

<script>
import { mapGetters } from "vuex";
import { getAge } from "@/lib/helpers";

export default {
  data() {
    return {
      githubClientId: process.env.GITHUB_CLIENT_ID,
      prMaxAge: process.env.PR_MAX_AGE || 14,
      scrolled: false
    };
  },
  computed: {
    ...mapGetters("github", {
      githubUser: "user"
    }),
    ...mapGetters("steemconnect", {
      steemUser: "user"
    }),
    ...mapGetters(["balance", "pullRequests"]),
    claimablePRs() {
      return this.pullRequests.filter(
        pr => !pr.claimed && pr.merged && getAge(pr.mergedAt) <= this.prMaxAge
      ).length;
    }
  }
};
</script>
