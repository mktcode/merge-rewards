<template>
  <div class="btn-group text-nowrap ml-2">
    <a :href="issue.url" target="_blank" class="btn btn-sm btn-outline-dark">
      <font-awesome-icon icon="exclamation-circle" />
      <font-awesome-icon
        v-if="issue.closed"
        icon="check"
        class="text-success position-absolute"
        style="right: 3px; bottom: 3px;"
      />
    </a>
    <button disabled class="btn btn-sm btn-outline-dark">
      ${{ balance.usd.toFixed(2) }}
    </button>
    <button disabled class="btn btn-sm btn-outline-dark">
      {{ balance.eur.toFixed(2) }} €
    </button>
    <button disabled class="btn btn-sm btn-outline-dark">
      {{ balance.sbd.toFixed(2) }} SBD
    </button>
  </div>
</template>

<script>
export default {
  props: ["issue"],
  data() {
    return {
      balance: { usd: 0, eur: 0, sbd: 0 }
    };
  },
  mounted() {
    this.$axios
      .$get(process.env.API_URL + "/balance/issue:" + this.issue.id)
      .then(balance => (this.balance = balance));
  }
};
</script>
