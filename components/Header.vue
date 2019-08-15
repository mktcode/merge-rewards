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
      <h4 class="mb-0" v-if="githubUser">
        ${{ balance.balance }} Merge Rewards
      </h4>
      <h5 v-if="githubUser" class="mb-4 text-muted">
        Pending: ${{ balance.pending }}
      </h5>
      <h5 class="mb-0 text-muted" v-if="steemUser">
        {{ steemUser.account.balance }}
      </h5>
      <h5 v-if="steemUser" class="mb-4 text-muted">
        ${{ steemUser.account.sbd_balance }}
      </h5>
    </div>
    <div>
      <nuxt-link
        class="btn btn-sm btn-light position-relative"
        v-if="$route.path !== '/claim'"
        to="/claim"
      >
        Claim
        <small
          class="badge badge-success position-absolute"
          style="top: -3px; right: -3px;"
          v-if="claimablePRs"
        >
          {{ claimablePRs }}
        </small>
      </nuxt-link>
      <button
        data-toggle="modal"
        data-target="#withdraw-modal"
        class="btn btn-sm btn-success"
      >
        Withdraw
      </button>
    </div>
    <Withdraw />
    <p v-if="!steemUser && balance.balance > accountPrice" class="pt-3">
      <a href="#" data-toggle="modal" data-target="#account-creation-modal"
        >Create a Steem account</a
      ><br />and double your rewards!
    </p>
    <CreateAccount />
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

<style lang="sass">
.btn-logout
  .text-danger
    display: none
  &:hover
    .text-danger
      display: inline
    .text-success
      display: none
</style>

<script>
import { mapGetters } from "vuex";
import { getAge } from "@/lib/helpers";

export default {
  components: {
    Withdraw: () => import("@/components/Withdraw"),
    CreateAccount: () => import("@/components/CreateAccount")
  },
  data() {
    return {
      githubClientId: process.env.GITHUB_CLIENT_ID,
      prMaxAge: process.env.PR_MAX_AGE || 14
    };
  },
  computed: {
    ...mapGetters("github", {
      githubUser: "user"
    }),
    ...mapGetters("steemconnect", {
      steemUser: "user"
    }),
    ...mapGetters("eos-ual", {
      eosUser: "user"
    }),
    ...mapGetters(["pullRequests", "balance", "accountPrice"]),
    claimablePRs() {
      return this.pullRequests.filter(pr => {
        return !pr.claimed && pr.merged && getAge(pr.mergedAt) <= this.prMaxAge;
      }).length;
    }
  }
};
</script>
