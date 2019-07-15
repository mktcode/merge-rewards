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
          >
            <font-awesome-icon v-if="loading" icon="spinner" spin />
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
          class="btn btn-sm btn-outline-dark disabled ml-1"
        >
          <span v-if="score"> {{ score }} % </span>
          <font-awesome-icon v-else icon="spinner" spin />
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  props: ["pr"],
  data() {
    return {
      score: null,
      loading: false,
      prMaxAge: process.env.PR_MAX_AGE || 14
    };
  },
  computed: {
    ...mapGetters("steemconnect", {
      steemconnectAccessToken: "accessToken"
    }),
    ...mapGetters("github", {
      githubAccessToken: "accessToken"
    })
  },
  methods: {
    claim(pr) {
      if (!this.blockClaiming) {
        this.loading = true;
        this.$axios
          .$post(process.env.API_URL + "/claim", {
            pr,
            githubAccessToken: this.githubAccessToken,
            steemconnectAccessToken: this.steemconnectAccessToken
          })
          .then(() => {
            this.blockClaiming = true;
            setTimeout(() => {
              this.blockClaiming = false;
            }, 30000);
            this.$store.commit("claimed", pr.id);
          })
          .catch(e => console.log(e.response))
          .finally(() => (this.loading = false));
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
    if (this.pr.merged) {
      this.$axios
        .$post(process.env.API_URL + "/score", {
          pr: this.pr,
          githubAccessToken: this.githubAccessToken
        })
        .then(response => {
          this.score = response.score;
        })
        .catch(e => console.log(e.response.data));
    }
  }
};
</script>
