<template>
  <div>
    <Navbar />
    <Header />
    <div v-if="githubUser" class="py-5">
      <h1 class="container mb-5">Claim Rewards</h1>
      <PullRequest
        v-for="pr in pullRequests"
        :key="pr.id"
        :pr="pr"
        class="py-2 border-top"
      />
    </div>
    <div v-else class="container py-5 text-center">
      <p class="lead mb-5">
        To claim rewards for your pull requests you must connect with your
        GitHub account.
      </p>
      <a
        :href="
          'https://github.com/login/oauth/authorize?scope=user:email&client_id=' +
            githubClientId
        "
        class="btn btn-success btn-lg"
      >
        <font-awesome-icon :icon="['fab', 'github']" />
        Connect to GitHub
      </a>
      <a
        href="https://github.com/join?source=merge-rewards.com"
        class="btn btn-success btn-lg"
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
      githubClientId: process.env.GITHUB_CLIENT_ID
    };
  },
  components: {
    Navbar: () => import("@/components/Navbar"),
    Header: () => import("@/components/Header"),
    Footer: () => import("@/components/Footer"),
    PullRequest: () => import("@/components/PullRequest")
  },
  computed: {
    ...mapGetters("github", { githubUser: "user" }),
    ...mapGetters(["pullRequests"])
  }
};
</script>
