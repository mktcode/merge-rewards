<template>
  <div class="container d-flex flex-column pt-5">
    <h1 class="text-center">Commit Tokens</h1>
    <div class="flex-fill text-center">
      <div v-if="githubUser">
        <font-awesome-icon :icon="['fab', 'github']" full-width />
        <a href="#" @click.prevent="$store.dispatch('github/logout')">
          logout
        </a>
      </div>
      <a
        v-else
        class="btn btn-primary"
        :href="
          'https://github.com/login/oauth/authorize?scope=user:email&client_id=cc26e30001cc702f5663'
        "
      >
        Connect with GitHub
      </a>

      <div v-if="steemUser">
        STEEM
        <a href="#" @click.prevent="$store.dispatch('steemconnect/logout')">
          logout
        </a>
      </div>
      <a v-else class="btn btn-primary" :href="$steemconnect.getLoginURL()">
        Connect with Steem
      </a>
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
            <div class="text-truncate px-3">{{ pr.title }}</div>
            <div class="ml-auto text-nowrap">
              <b>Score: 84 %</b> / 1.46 STEEM
              <a v-if="pr.merged" href="#" class="btn btn-sm btn-primary">
                Claim
              </a>
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
      pullRequests: []
    };
  },
  computed: {
    ...mapGetters("steemconnect", { steemUser: "user" }),
    ...mapGetters("github", {
      githubUser: "user",
      githubAccessToken: "accessToken"
    })
  },
  mounted() {
    this.$store.dispatch("steemconnect/login");
    this.$store.dispatch("github/login").then(() => {
      this.$axios
        .$post(
          "https://api.github.com/graphql",
          {
            query: `query {
    user(login: "mktcode") {
    pullRequests(first: 10, orderBy: { field: CREATED_AT, direction: DESC}) {
      totalCount
      nodes {
        createdAt
        number
        title
        merged
        closed
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
        });
    });
  }
};
</script>
