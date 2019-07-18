<template>
  <header class="p-5 bg-secondary text-center text-light" v-if="githubUser">
    <h1 class="font-weight-bold">
      Hi
      <a :href="'https://github.com/' + githubUser.login" class="text-light">
        {{ githubUser.login }}
      </a>
      !
    </h1>
    <div v-if="balance">
      <h4 class="mb-0" v-if="githubUser">Wallet: ${{ balance.balance }}</h4>
      <h5 v-if="githubUser" class="mb-4 text-muted">
        Pending: ${{ balance.pending }}
      </h5>
    </div>
    <button
      @click.prevent="$store.dispatch('github/logout')"
      class="btn btn-sm btn-outline-light"
    >
      logout
    </button>
    <button
      data-toggle="modal"
      data-target="#withdraw-modal"
      class="btn btn-sm btn-outline-success"
    >
      Withdraw
    </button>
    <Withdraw />
  </header>
  <header class="p-5 bg-secondary text-light" v-else>
    <h1 class="d-flex align-items-center font-weight-bold">
      <img src="/logo.png" alt="logo.png" class="mr-3" />
      Merge Rewards
    </h1>
    <h2 class="mb-5">Rewarding Social Development</h2>
    <p class="lead">
      Contribute to Open Source projects<br />
      and earn money with your pull requests on GitHub!
    </p>
    <a
      :href="
        'https://github.com/login/oauth/authorize?scope=user:email&client_id=' +
          githubClientId
      "
      class="btn btn-success btn-lg"
    >
      <font-awesome-icon :icon="['fab', 'github']" />
      Connect
    </a>
  </header>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  components: {
    Withdraw: () => import("@/components/Withdraw")
  },
  data() {
    return {
      githubClientId: process.env.GITHUB_CLIENT_ID
    };
  },
  computed: {
    ...mapGetters("github", {
      githubUser: "user"
    }),
    ...mapGetters(["balance"])
  }
};
</script>
