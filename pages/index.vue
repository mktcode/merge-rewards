<template>
  <div class="container d-flex flex-column pt-5">
    <h1 class="text-center">Merge Rewards</h1>
    <div class="flex-fill text-center">
      <div v-if="githubUser">
        <font-awesome-icon :icon="['fab', 'github']" full-width />
        connected
        <a href="#" @click.prevent="$store.dispatch('github/logout')">
          logout
        </a>
      </div>
      <div v-if="steemUser">
        STEEM connected
        <a href="#" @click.prevent="$store.dispatch('steemconnect/logout')">
          logout
        </a>
      </div>
      <div class="d-flex justify-content-center">
        <div v-if="!githubUser" class="d-flex flex-column mr-1">
          <a
            class="btn btn-primary"
            :href="
              'https://github.com/login/oauth/authorize?scope=user:email&client_id=' +
                githubClientId
            "
          >
            Connect with GitHub
          </a>
          <a href="https://github.com/signup" target="_blank">
            create account
          </a>
        </div>

        <div v-if="!steemUser" class="d-flex flex-column ml-1">
          <a class="btn btn-primary" :href="$steemconnect.getLoginURL()">
            Connect with Steem
          </a>
          <a
            href="https://account.steem.ninja?ref=merge-rewards"
            target="_blank"
          >
            create account
          </a>
        </div>
      </div>
      <p v-if="!steemUser || !githubUser">
        Connect your Accounts to claim your rewards.
      </p>
    </div>
    <div v-if="steemUser && githubUser" class="flex-fill">
      <h1 class="text-center">
        Hi
        <a href="https://github.com/mktcode">{{ githubUser.login }}</a>
        !
      </h1>
      <h3 class="text-center">Wallet: 451.68 STEEM ($309)</h3>
      <div class="card mb-5">
        <div class="card-header d-flex align-items-center">
          <h5 class="m-0">Pull Requests</h5>
          <ul class="nav nav-pills card-header-pills ml-auto">
            <li class="nav-item">
              <a class="nav-link active" href="#">all</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#">merged</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#">open</a>
            </li>
          </ul>
        </div>
        <div class="list-group list-group-flush">
          <div
            v-for="pr in pullRequests"
            :key="pr.id"
            class="list-group-item d-flex align-items-center"
          >
            <font-awesome-icon
              icon="code-branch"
              :class="
                pr.merged
                  ? 'merged'
                  : pr.closed
                  ? 'text-danger'
                  : 'text-success'
              "
              fixed-width
            />
            <div class="text-truncate d-flex flex-column px-3">
              <a :href="pr.permalink" target="_blank" class="text-dark">
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
            <div class="ml-auto text-nowrap">
              <span
                v-if="pr.merged"
                class="btn btn-sm btn-outline-primary disabled"
              >
                Score:
                <span v-if="scores.find(s => s.id === pr.id)">
                  {{ scores.find(s => s.id === pr.id).score }} %
                </span>
                <font-awesome-icon v-else icon="spinner" spin />
              </span>
              <button
                v-if="pr.merged && !claimed.includes(pr.id)"
                class="btn btn-sm btn-primary"
                @click="claim(pr)"
              >
                Claim
              </button>
              <button
                v-if="pr.merged && claimed.includes(pr.id)"
                class="btn btn-sm btn-primary"
                disabled
              >
                Claimed
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
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
      database: [],
      pullRequests: [],
      scores: [],
      claimed: [],
      githubClientId: process.env.GITHUB_CLIENT_ID
    };
  },
  computed: {
    ...mapGetters("steemconnect", {
      steemUser: "user",
      steemconnectAccessToken: "accessToken"
    }),
    ...mapGetters("github", {
      githubUser: "user",
      githubAccessToken: "accessToken"
    })
  },
  methods: {
    claim(pr) {
      if (!this.blockClaiming) {
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
            this.claimed.push(pr.id);
          })
          .catch(e => console.log(e.response));
      }
    }
  },
  mounted() {
    this.$axios.$get(process.env.API_URL + "/database").then(database => {
      this.database = database;
      Promise.all([
        this.$store.dispatch("steemconnect/login"),
        this.$store.dispatch("github/login")
      ]).then(() => {
        this.$axios
          .$post(
            "https://api.github.com/graphql",
            {
              query: `query {
      user(login: "${this.githubUser.login}") {
      pullRequests(first: 10, orderBy: { field: CREATED_AT, direction: DESC}) {
        totalCount
        nodes {
          id
          createdAt
          repository {
            name
            nameWithOwner
            owner {
              login
            }
          }
          number
          title
          merged
          closed
          permalink
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }`
            },
            {
              headers: {
                Authorization: "bearer " + this.githubAccessToken
              }
            }
          )
          .then(response => {
            this.pullRequests = response.data.user.pullRequests.nodes;
            this.pullRequests.forEach(pr => {
              // check if already claimed
              if (this.database.find(p => p.id === pr.id)) {
                this.claimed.push(pr.id);
              }
              // get score
              if (pr.merged) {
                this.$axios
                  .$post(process.env.API_URL + "/score", {
                    pr,
                    githubAccessToken: this.githubAccessToken
                  })
                  .then(response => {
                    this.scores.push({ id: pr.id, score: response.score });
                  })
                  .catch(e => console.log(e.response.data));
              }
            });
          });
      });
    });
  }
};
</script>
