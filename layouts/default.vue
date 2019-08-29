<template>
  <div>
    <nuxt />
    <DepositModal />
    <Withdraw />
    <WithdrawPaypal />
  </div>
</template>

<script>
export default {
  components: {
    DepositModal: () => import("@/components/deposit/Modal"),
    Withdraw: () => import("@/components/Withdraw"),
    WithdrawPaypal: () => import("@/components/WithdrawPaypal")
  }
};
</script>
