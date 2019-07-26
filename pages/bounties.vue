<template>
  <div>
    <Navbar />
    <Header />
    <div class="container py-5">
      <h1 class="container mb-3">Bounties</h1>
      <div class="container mb-2 text-right">
        <div>
          <button
            class="btn btn-sm btn-success"
            data-toggle="modal"
            data-target="#add-bounty-modal"
          >
            <font-awesome-icon icon="plus" />
            Add Issue
          </button>
        </div>
        <AddBounty />
      </div>
      <Bounty
        v-for="b in bounties"
        :key="b.id"
        :bounty="b"
        class="py-2 border-top"
      />
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
    ...mapGetters(["bounties", "userBounties"])
  }
};
</script>
