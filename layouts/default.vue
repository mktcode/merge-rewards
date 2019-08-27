<template>
  <div>
    <nuxt />
    <Deposit />
    <Withdraw />
    <WithdrawPaypal />
  </div>
</template>

<script>
export default {
  components: {
    Deposit: () => import("@/components/Deposit"),
    Withdraw: () => import("@/components/Withdraw"),
    WithdrawPaypal: () => import("@/components/WithdrawPaypal")
  }
};
</script>
