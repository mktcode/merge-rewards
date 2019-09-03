<template>
  <div class="modal modal-fs fade" id="withdraw-paypal-modal" tabindex="-1">
    <div class="modal-dialog text-dark text-left">
      <div class="modal-content">
        <ModalHeader title="Withdraw USD" />
        <div class="modal-body">
          <div class="container col-md-6">
            <div class="alert alert-info">
              Currently the minimum amount for withdrawals is 2 USD.
            </div>
            <div>USD to withdraw:</div>
            <div class="input-group mb-3">
              <div class="input-group-prepend">
                <span class="input-group-text">$</span>
              </div>
              <input
                type="number"
                min="2"
                :max="balance.usd"
                class="form-control"
                v-model="amount"
              />
            </div>
            <div>Your PayPal account's email address:</div>
            <input type="email" class="form-control" v-model="address" />
            <div v-if="showSuccessMessage" class="alert alert-success mt-3">
              Withdrawal successful!
            </div>
            <div v-if="showErrorMessage" class="alert alert-danger mt-3">
              Withdrawal failed!
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button
            @click.prevent="withdraw()"
            type="button"
            class="btn btn-green"
            :disabled="loading || !amount || !address"
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
      amount: 2,
      address: ""
    };
  },
  computed: {
    ...mapGetters("github", {
      githubUser: "user",
      githubAccessToken: "accessToken"
    }),
    ...mapGetters(["balance"])
  },
  methods: {
    withdraw() {
      if (this.githubUser) {
        this.loading = true;
        this.$axios
          .$post(process.env.API_URL + "/withdraw-paypal", {
            githubAccessToken: this.githubAccessToken,
            amount: this.amount,
            address: this.address
          })
          .then(() => {
            this.$store.dispatch("loadUserBalance", this.githubUser);
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
