<template>
  <div>
    <Navbar />
    <ProfileHeader :profile="profile" :balance="balance" />
    <CreateAccount />
    <div class="container py-5">
      <div v-if="isCurrentUser">
        <h3 class="pb-2 mb-0 text-muted">History</h3>
        <table class="table">
          <tr>
            <td>Withdrawal</td>
            <td class="text-danger text-right">-2.7 SBD</td>
          </tr>
          <tr>
            <td>Pull Request</td>
            <td class="text-success text-right">+1.86 SBD</td>
          </tr>
          <tr>
            <td>Pull Request</td>
            <td class="text-success text-right">+0.96 SBD</td>
          </tr>
          <tr>
            <td>Steem Account</td>
            <td class="text-danger text-right">-3.12 SBD</td>
          </tr>
          <tr>
            <td>Bounty</td>
            <td class="text-success text-right">+50 SBD<br />+100 USD</td>
          </tr>
        </table>

        <div class="text-right">
          <a href="#">Full History</a>
        </div>

        <h3 class="pb-2 mb-4 mt-4 border-bottom text-muted">Steem Account</h3>
        <p>
          A Steem account gives you higher rewards for pull requests, you can
          boost bounties with extra SBD and take part in votings. You have
          earned enough SBD to create your own Steem account.
        </p>
        <button
          class="btn btn-green"
          data-toggle="modal"
          data-target="#account-creation-modal"
          v-if="balance.sbdBalance > accountPrice"
        >
          Create a Steem account for <b>{{ accountPrice }} SBD</b>
        </button>
        <p v-else>
          A Steem account currently costs {{ accountPrice }} SBD.
          <nuxt-link to="/claim">Claim pull requests</nuxt-link> to earn more
          SBD.
        </p>
        <p class="mt-3" v-if="steemUser">
          Connected as {{ steemUser.account.name }}
        </p>
        <p class="mt-3">
          <button
            @click.prevent="$store.dispatch('steemconnect/logout')"
            class="btn btn-sm btn-outline-danger"
            v-if="steemUser"
          >
            disconnect
          </button>
          <a :href="$steemconnect.getLoginURL()" class="btn btn-green" v-else>
            Connect
          </a>
        </p>
      </div>
    </div>
    <Footer />
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  components: {
    Navbar: () => import("@/components/Navbar"),
    ProfileHeader: () => import("@/components/ProfileHeader"),
    Footer: () => import("@/components/Footer"),
    CreateAccount: () => import("@/components/CreateAccount")
  },
  data() {
    return {
      profile: null,
      balance: {
        sbdBalance: 0,
        usdBalance: 0
      },
      loading: false
    };
  },
  computed: {
    ...mapGetters("steemconnect", { steemUser: "user" }),
    ...mapGetters("github", { githubUser: "user" }),
    ...mapGetters(["accountPrice"]),
    isCurrentUser() {
      return (
        this.profile &&
        this.githubUser &&
        this.profile.login === this.githubUser.login
      );
    }
  },
  mounted() {
    this.loading = true;
    this.$axios
      .$get("https://api.github.com/users/" + this.$route.params.username)
      .then(response => {
        this.profile = response;
        this.$axios
          .$get(process.env.API_URL + "/balance/" + this.profile.login)
          .then(response => {
            this.balance = response;
            this.loading = false;
          })
          .catch(e => console.log(e));
      })
      .catch(e => console.log(e));
  }
};
</script>
