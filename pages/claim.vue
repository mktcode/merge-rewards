<template>
  <div>
    <Navbar />
    <div v-if="githubUser" class="py-5">
      <h1 class="container mt-5 mb-3">Your Contributions</h1>
      <div class="container mb-2 text-right">
        <div class="btn-group mt-2">
          <button
            :class="
              'btn btn-sm ' +
                (selectedBooster === 'strikes'
                  ? 'btn-green'
                  : 'btn-outline-success')
            "
            :disabled="!boosters.strikes"
            @click="setSelectedBooster('strikes')"
          >
            <font-awesome-icon icon="star" fixed-width />
            {{ boosters.strikes }}
          </button>
          <button
            :class="
              'btn btn-sm ' +
                (selectedBooster === 'spares'
                  ? 'btn-green'
                  : 'btn-outline-success')
            "
            :disabled="!boosters.spares"
            @click="setSelectedBooster('spares')"
          >
            <font-awesome-icon icon="star-half-alt" fixed-width />
            {{ boosters.spares }}
          </button>
          <button
            :class="
              'btn btn-sm ' +
                (selectedBooster === 'doubles'
                  ? 'btn-green'
                  : 'btn-outline-success')
            "
            :disabled="!boosters.doubles"
            @click="setSelectedBooster('doubles')"
          >
            <font-awesome-icon icon="angle-double-up" fixed-width />
            {{ boosters.doubles }}
          </button>
          <button
            :class="
              'btn btn-sm ' +
                (selectedBooster === 'dices'
                  ? 'btn-green'
                  : 'btn-outline-success')
            "
            :disabled="!boosters.dices"
            @click="setSelectedBooster('dices')"
          >
            <font-awesome-icon icon="dice" fixed-width /> {{ boosters.dices }}
          </button>
          <button
            class="btn btn-sm btn-dark"
            data-toggle="modal"
            data-target="#transfer-boosters-modal"
            :disabled="
              claiming ||
                !(
                  boosters.strikes +
                  boosters.spares +
                  boosters.doubles +
                  boosters.dices
                )
            "
          >
            <font-awesome-icon icon="paper-plane" fixed-width />
          </button>
          <button
            class="btn btn-sm btn-green"
            data-toggle="modal"
            data-target="#boost-modal"
          >
            <font-awesome-icon icon="plus" />
          </button>
        </div>
        <Boost />
        <TransferBoosters />
      </div>
      <PullRequest
        v-for="pr in pullRequests"
        :key="pr.id"
        :pr="pr"
        :booster="selectedBooster"
        class="py-2 border-top"
      />
    </div>
    <div v-else class="container py-5 text-center">
      <p class="lead mb-5 mt-5">
        To claim rewards for your pull requests you must connect with your
        GitHub account.
      </p>
      <a
        :href="
          'https://github.com/login/oauth/authorize?scope=user:email&client_id=' +
            githubClientId
        "
        class="btn btn-green btn-lg"
      >
        <font-awesome-icon :icon="['fab', 'github']" />
        Connect to GitHub
      </a>
      <a
        href="https://github.com/join?source=merge-rewards.com"
        class="btn btn-green btn-lg"
      >
        <font-awesome-icon :icon="['fab', 'github']" />
        Create GitHub Account
      </a>
    </div>
    <Footer />
  </div>
</template>

<style lang="sass">
.merged
  color: #6f42c1
</style>

<script>
import { mapGetters } from "vuex";

export default {
  data() {
    return {
      githubClientId: process.env.GITHUB_CLIENT_ID,
      selectedBooster: null,
      blockClaiming: 0,
      claiming: false
    };
  },
  components: {
    Navbar: () => import("@/components/Navbar"),
    Footer: () => import("@/components/Footer"),
    PullRequest: () => import("@/components/PullRequest"),
    Boost: () => import("@/components/Boost"),
    TransferBoosters: () => import("@/components/TransferBoosters")
  },
  computed: {
    ...mapGetters("github", { githubUser: "user" }),
    ...mapGetters(["pullRequests", "boosters"])
  },
  methods: {
    setSelectedBooster(booster) {
      this.selectedBooster = booster === this.selectedBooster ? null : booster;
    }
  },
  mounted() {
    setInterval(() => {
      if (this.blockClaiming) this.blockClaiming--;
    }, 1000);
  }
};
</script>
