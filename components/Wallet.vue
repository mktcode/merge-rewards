<template>
  <header class="border-bottom">
    <div v-if="githubUser && balance" class="p-1">
      <div class="mt-3 text-muted text-right" v-if="steemUser">
        <a
          :href="'https://steemitwallet.com/@' + steemUser.account.name"
          target="_blank"
          class="text-muted"
        >
          @{{ steemUser.account.name }}:
        </a>
        {{ steemUser.account.balance }}
        {{ steemUser.account.sbd_balance }}
      </div>
    </div>
    {{ balance.usdBalance.toFixed(2) }} USD
    {{ balance.sbdBalance.toFixed(2) }} SBD
    <span v-if="balance.pending" class="text-muted"
      >+{{ balance.pending.toFixed(2) }} SBD</span
    >
    <button
      data-toggle="modal"
      data-target="#withdraw-modal"
      class="btn btn-sm btn-success"
    >
      <font-awesome-icon icon="share-square" />
    </button>
    <p v-if="!steemUser && balance.sbdBalance > accountPrice" class="pt-3">
      <a href="#" data-toggle="modal" data-target="#account-creation-modal"
        >Create a Steem account</a
      ><br />and double your rewards!
    </p>
    <Withdraw />
    <WithdrawPaypal />
    <CreateAccount />
  </header>
</template>

<style lang="sass" scoped>
header
  padding-top: 63px
</style>

<script>
import { mapGetters } from "vuex";
import { getAge } from "@/lib/helpers";

export default {
  components: {
    Withdraw: () => import("@/components/Withdraw"),
    WithdrawPaypal: () => import("@/components/WithdrawPaypal"),
    CreateAccount: () => import("@/components/CreateAccount")
  },
  computed: {
    ...mapGetters("github", {
      githubUser: "user"
    }),
    ...mapGetters("steemconnect", {
      steemUser: "user"
    }),
    ...mapGetters(["balance", "accountPrice"])
  }
};
</script>
