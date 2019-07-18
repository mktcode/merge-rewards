<template>
  <div class="modal fade" id="withdraw-modal" tabindex="-1" role="dialog">
    <div class="modal-dialog text-dark" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Withdraw</h5>
          <button
            type="button"
            class="close"
            data-dismiss="modal"
            aria-label="Close"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <div class="alert alert-info">
            Currently the minimum amount for withdrawals is $5 for all
            currencies except STEEM (since it has zero transaction fees). It
            will be lower once implemented on a per-currency basis.
          </div>
          <select
            class="custom-select custom-select-lg mb-3"
            v-model="currency"
          >
            <option value="">Choose Currency</option>
            <option value="btc">Bitcoin</option>
            <option value="ltc">Litecoin</option>
            <option value="eth">Ether</option>
            <option value="xmr">Monero</option>
            <option value="steem">STEEM</option>
          </select>
          <div>Amount to withdraw:</div>
          <input
            type="number"
            min="0"
            :max="balance.rewards"
            class="form-control mb-3"
            v-model="amount"
          />
          <div>Your receive address:</div>
          <input type="text" class="form-control" v-model="address" />
          <div v-if="showSuccessMessage" class="alert alert-success mt-3">
            Withdrawal successful!
          </div>
          <div v-if="showErrorMessage" class="alert alert-danger mt-3">
            Withdrawal failed!
          </div>
        </div>
        <div class="modal-footer">
          <button
            @click.prevent="withdraw()"
            type="button"
            class="btn btn-success"
          >
            <font-awesome-icon v-if="loading" icon="spinner" spin />
            <span v-else>Withdraw</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  data() {
    return {
      loading: false,
      showSuccessMessage: false,
      showErrorMessage: false,
      currency: "btc",
      amount: 0,
      address: ""
    };
  },
  computed: {
    ...mapGetters("github", { githubUser: "user" }),
    ...mapGetters(["balance"])
  },
  methods: {
    withdraw() {
      if (this.githubUser) {
        this.loading = true;
        this.$axios
          .$post(process.env.API_URL + "/withdraw", {
            githubUser: this.githubUser.login,
            amount: this.amount,
            currency: this.currency,
            address: this.address
          })
          .then(() => {
            this.$store.dispatch("loadBalance", this.githubUser);
            this.showSuccessMessage = true;
            setTimeout(() => {
              this.showSuccessMessage = false;
            }, 3000);
          })
          .catch(e => {
            console.log(e);
            this.showErrorMessage = true;
            setTimeout(() => {
              this.showErrorMessage = false;
            }, 3000);
          })
          .finally(() => (this.loading = false));
      }
    }
  }
};
</script>
