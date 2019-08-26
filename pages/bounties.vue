<template>
  <div>
    <Navbar />
    <Header />
    <div class="container pt-5" v-if="githubUser">
      <h1 class="mb-3 d-flex align-items-end">
        Your Bounties
        <button
          class="btn btn-sm btn-success ml-auto"
          data-toggle="modal"
          data-target="#add-bounty-modal"
        >
          <font-awesome-icon icon="plus" />
          Add Issue
        </button>
      </h1>
      <AddBounty />
      <DepositOnBounty :bounty="focusedBounty" />
      <ReleaseBounty :bounty="focusedBounty" />
      <DeleteBounty :bounty="focusedBounty" />
      <div v-if="userBounties.length" class="container">
        <Bounty
          v-for="b in userBounties"
          :key="b.id"
          :bounty="b"
          class="py-2 border-top"
        />
      </div>
      <p v-else class="lead">Add an issue to deposit a bounty.</p>
    </div>
    <div class="container py-5">
      <h1 class="mb-3">
        Bounties
      </h1>
      <div v-if="bounties.length" class="container">
        <Bounty
          v-for="b in bounties"
          :key="b.id"
          :bounty="b"
          class="py-2 border-top"
        />
      </div>
      <p v-else class="lead">
        No bounties available.
        <span class="d-block" v-if="!githubUser"
          >Connect to your GitHub account to create one.</span
        >
      </p>
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
    ReleaseBounty: () => import("@/components/ReleaseBounty"),
    DepositOnBounty: () => import("@/components/DepositOnBounty"),
    AddBounty: () => import("@/components/AddBounty"),
    DeleteBounty: () => import("@/components/DeleteBounty"),
    Bounty: () => import("@/components/Bounty")
  },
  data() {
    return {
      focusedBounty: null
    };
  },
  computed: {
    ...mapGetters("steemconnect", { steemUser: "user" }),
    ...mapGetters("github", { githubUser: "user" }),
    ...mapGetters(["bounties", "userBounties"])
  }
};
</script>
