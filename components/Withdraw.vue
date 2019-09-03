<template>
  <div class="modal fade modal-fs" id="withdraw-modal" tabindex="-1">
    <div class="modal-dialog text-dark text-left">
      <div class="modal-content">
        <ModalHeader title="Withdraw SBD" />
        <div class="modal-body">
          <div class="container col-md-6">
            <div class="alert alert-info">
              Currently the minimum amount for withdrawals is 5 SBD for all
              currencies except STEEM (since it has zero transaction fees). It
              will be lower once implemented on a per-currency basis.
            </div>
            <div>Merge Rewards to withdraw:</div>
            <div class="input-group mb-3">
              <div class="input-group-prepend">
                <span class="input-group-text">$</span>
              </div>
              <input
                type="number"
                min="0"
                :max="balance.balance"
                class="form-control"
                v-model="amount"
              />
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
              <option value="steem">STEEM (SBD)</option>
            </select>
            <div>Your receive address:</div>
            <input type="text" class="form-control" v-model="address" />
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
            :disabled="!currency || !amount || !address"
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
      currency: "",
      amount: 0,
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
          .$post(process.env.API_URL + "/withdraw", {
            githubAccessToken: this.githubAccessToken,
            amount: this.amount,
            currency: this.currency,
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
