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
      <AddBounty />
      <div v-if="bounties.length" class="container">
        <Bounty
          v-for="b in bounties"
          :key="b.id"
          :bounty="b"
          class="py-2 border-top"
        />
      </div>
      <p v-else class="lead">No bounties available.</p>
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
    AddBounty: () => import("@/components/AddBounty"),
    Bounty: () => import("@/components/Bounty")
  },
  computed: {
    ...mapGetters("steemconnect", { steemUser: "user" }),
    ...mapGetters("github", { githubUser: "user" }),
    ...mapGetters(["bounties", "userBounties"])
  }
};
</script>
