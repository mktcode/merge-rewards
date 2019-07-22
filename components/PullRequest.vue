<template>
  <div class="container">
    <div class="row">
      <div class="col-md-9 d-flex align-items-center">
        <font-awesome-icon
          icon="code-branch"
          :class="
            pr.merged ? 'merged' : pr.closed ? 'text-danger' : 'text-success'
          "
          fixed-width
        />
        <div class="text-truncate d-flex flex-column px-3">
          <a
            :href="pr.permalink"
            target="_blank"
            class="text-dark text-truncate"
          >
            {{ pr.title }}
          </a>
          <a
            :href="'https://github.com/' + pr.repository.nameWithOwner"
            target="_blank"
            class="small"
          >
            {{ pr.repository.nameWithOwner }}
          </a>
        </div>
      </div>
      <div
        class="col-md-3 mt-2 mt-md-0 d-flex align-items-center justify-content-end"
      >
        <div v-if="getAge(pr.mergedAt) <= prMaxAge" class="flex-fill">
          <button
            v-if="pr.merged && !pr.claimed"
            class="btn btn-sm btn-dark w-100"
            @click="claim(pr)"
            :disabled="
              claiming || $parent.claiming || $parent.blockClaiming > 0
            "
          >
            <font-awesome-icon v-if="claiming" icon="spinner" spin />
            <span v-else-if="$parent.blockClaiming > 0">
              {{ $parent.blockClaiming }}s
            </span>
            <span v-else>Claim</span>
          </button>
          <button
            v-if="pr.merged && pr.claimed"
            class="btn btn-sm btn-dark w-100"
            disabled
          >
            Claimed
          </button>
        </div>
        <span v-else-if="pr.merged" class="small text-muted mr-3" disabled>
          too old
        </span>
        <span
          v-if="pr.merged && getAge(pr.mergedAt) <= prMaxAge"
          class="btn btn-sm btn-outline-dark disabled ml-1 text-nowrap"
        >
          <span v-if="score && pr.claimed">
            <font-awesome-icon v-if="score.booster === 'strikes'" icon="star" />
            <font-awesome-icon
              v-if="score.booster === 'spares'"
              icon="star-half-alt"
            />
            <font-awesome-icon
              v-if="score.booster === 'doubles'"
              icon="angle-double-up"
            />
            <font-awesome-icon v-if="score.booster === 'dices'" icon="dice" />
            {{ score.score }}
          </span>
          <span v-else-if="score">
            {{ boostedScore }}
          </span>
          <font-awesome-icon v-else icon="spinner" spin />
          %
        </span>
      </div>
    </div>
  </div>
</template>

<style lang="sass">
.dropdown-toggle::after
  display: none
.dropdown-menu
  .btn-link.text-success
    &:hover, &:focus, &:active
      text-decoration: none
</style>

<script>
import { mapGetters } from "vuex";

export default {
  props: ["pr", "booster"],
  data() {
    return {
      score: null,
      claiming: false,
      prMaxAge: process.env.PR_MAX_AGE || 14
    };
  },
  computed: {
    ...mapGetters("steemconnect", {
      steemconnectAccessToken: "accessToken"
    }),
    ...mapGetters("github", {
      githubUser: "user",
      githubAccessToken: "accessToken"
    }),
    ...mapGetters(["boosters"]),
    boostedScore() {
      if (this.booster === "strikes") {
        return 100;
      }
      if (this.booster === "spares") {
        return 75;
      }
      if (this.booster === "doubles") {
        return Math.min(this.score.score * 2, 100);
      }
      if (this.booster === "dices") {
        return "?";
      }
      return this.score.score;
    }
  },
  methods: {
    claim(pr) {
      if (!this.$parent.blockClaiming) {
        this.claiming = true;
        this.$parent.claiming = true;
        this.$axios
          .$post(process.env.API_URL + "/claim", {
            pr,
            githubAccessToken: this.githubAccessToken,
            steemconnectAccessToken: this.steemconnectAccessToken,
            booster: this.booster
          })
          .then(() => {
            this.$parent.blockClaiming = 5;
            this.$store.commit("claimed", pr.id);
            this.$store.dispatch("loadBoosters", this.githubUser).then(() => {
              if (!this.boosters[this.booster]) {
                this.$parent.selectedBooster = null;
              }
            });
            this.getScore();
          })
          .catch(e => console.log(e.response))
          .finally(() => {
            this.claiming = false;
            this.$parent.claiming = false;
          });
      }
    },
    getScore() {
      if (this.pr.merged) {
        this.$axios
          .$post(process.env.API_URL + "/score", {
            pr: this.pr,
            githubAccessToken: this.githubAccessToken,
            booster: null
          })
          .then(response => {
            this.score = response;
          })
          .catch(e => console.log(e.response.data));
      }
    },
    getAge(createdAt) {
      return (
        (new Date().getTime() - new Date(createdAt).getTime()) /
        (60 * 60 * 24 * 1000)
      );
    }
  },
  mounted() {
    this.getScore();
  }
};
</script>
