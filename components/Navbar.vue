<template>
  <nav class="navbar navbar-expand-md navbar-dark bg-dark">
    <nuxt-link class="navbar-brand font-weight-bold" to="/">
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
          <nuxt-link class="nav-link" to="/claim">Claim</nuxt-link>
        </li>
        <li class="nav-item">
          <nuxt-link class="nav-link" to="/bounties">Bounties</nuxt-link>
        </li>
        <!-- <li class="nav-item">
          <nuxt-link class="nav-link" to="/pull-requests"
            >Pull Requests</nuxt-link
          >
        </li>
        <li class="nav-item">
          <nuxt-link class="nav-link" to="/projects">Projects</nuxt-link>
        </li> -->
      </ul>
      <div class="navbar-text" v-if="githubUser">
        <button
          @click.prevent="$store.dispatch('github/logout')"
          class="btn btn-sm btn-outline-light btn-logout"
        >
          <font-awesome-icon :icon="['fab', 'github']" />
          <font-awesome-icon icon="check" class="text-success" />
          <font-awesome-icon icon="power-off" class="text-danger" />
        </button>
        <button
          @click.prevent="$store.dispatch('steemconnect/logout')"
          class="btn btn-sm btn-outline-primary btn-logout"
          v-if="steemUser"
        >
          <img
            src="/steem-icon.png"
            style="width: 14px; margin-top: -3px;"
            alt="Steem"
          />
          <font-awesome-icon icon="check" class="text-success" />
          <font-awesome-icon icon="power-off" class="text-danger" />
        </button>
        <a
          :href="$steemconnect.getLoginURL()"
          class="btn btn-sm btn-outline-primary"
          v-else
        >
          <img
            src="/steem-icon.png"
            style="width: 14px; margin-top: -3px;"
            alt="Steem"
          />
        </a>
      </div>
    </div>
  </nav>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  computed: {
    ...mapGetters("github", {
      githubUser: "user"
    }),
    ...mapGetters("steemconnect", {
      steemUser: "user"
    })
  }
};
</script>
