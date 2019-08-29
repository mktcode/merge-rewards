<template>
  <div>
    <Navbar />
    <Header />
    <div class="container py-5">
      <div class="alert alert-danger">
        <b>ATTENTION:</b> This website is still in prototype stage. Currently
        bugs are still very possible, which might lead to loss of funds.
        Information on this website represents the vision for this project and
        not the status quo. Please use this service only for testing until a
        stable version is announced.
      </div>
      <div class="row my-5">
        <div class="col-md-6 mb-3">
          <h1 class="mb-4">Contribute and earn</h1>
          <p>
            Contribute to other people's Open Source projects on GitHub. Your
            contributions can be anything, from developing new features to
            fixing typos in a project's documentation. All merged pull request
            are rewarded with cryptocurrency.<br />
            <br />
            Project maintainers can also set up bounties for solving issues or
            pay you directly, both in fiat- and cryptocurrency.
          </p>
          <nuxt-link to="/claim" class="btn btn-sm btn-green">
            Claim Rewards
          </nuxt-link>
        </div>
        <div class="col-md-6">
          <h1 class="mb-4">Reach developers</h1>
          <p>
            Deposit money on any issue or project on GitHub and get listed in
            our feeds. Reward contributors manually or fully automated for
            working on your project.
          </p>
          <nuxt-link to="/bounties" class="btn btn-sm btn-green">
            Create Bounty
          </nuxt-link>
        </div>
      </div>
    </div>
    <Deposit title="Support Users and Projects" class="mb-5" />
    <div class="container-fluid steem text-light py-5">
      <div class="container">
        <div class="row">
          <div class="col-md-4">
            <img
              src="/steem.png"
              alt="steem.png"
              class="mb-3 w-100"
              style="max-width: 300px;"
            />
            <div
              class="mb-4 text-primary text-center text-md-left text-white-50"
              v-if="steemUser"
            >
              <h5>
                Hi
                <a
                  :href="'https://steemit.com/@' + steemUser.account.name"
                  class="text-white-50"
                >
                  @{{ steemUser.account.name }} </a
                >!
              </h5>
              <p>
                Rewards you claim while being connected to your STEEM account
                will go directly there and they will not show up in your wallet
                here.
              </p>
              <button
                @click.prevent="$store.dispatch('steemconnect/logout')"
                class="btn btn-sm btn-outline-light"
              >
                disconnect
              </button>
            </div>
            <div
              class="text-nowrap mb-4 d-sm-flex d-lg-block flex-column"
              v-else
            >
              <a
                :href="$steemconnect.getLoginURL()"
                target="_blank"
                class="btn btn-sm btn-light mb-2"
              >
                Connect
              </a>
              <a
                href="https://signup.steemit.com"
                target="_blank"
                class="btn btn-sm btn-outline-light mb-2"
              >
                Sign Up
              </a>
              <a
                href="https://steem.com"
                target="_blank"
                class="btn btn-sm btn-outline-light mb-2"
              >
                About STEEM
              </a>
            </div>
          </div>
          <div class="col-md-8">
            <p>
              All transactions on merge-rewards.com are stored on the Steem
              blockchain to make them dezentralized, immutable and public.
              Everything from transferring boosters to depositing money for a
              bounty is recorded in a trustworthy and verifiable way.<br />
              <br />
              Steem is a decentralized content network with its own
              cryptocurrency to reward creators of good content. Merge Rewards
              considers your contributions to Open Source projects to be good
              content and stores them on the Steem blockchain in the moment you
              click on claim. This means even if there's no bounty, you will be
              rewarded.
            </p>
          </div>
        </div>
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
    Header: () => import("@/components/Header"),
    Footer: () => import("@/components/Footer"),
    Deposit: () => import("@/components/deposit/Deposit")
  },
  computed: {
    ...mapGetters("steemconnect", { steemUser: "user" }),
    ...mapGetters("github", { githubUser: "user" }),
    ...mapGetters(["balance", "accountPrice"])
  }
};
</script>
