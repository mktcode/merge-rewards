<template>
  <div class="modal modal-fs fade" id="deposit-modal" tabindex="-1">
    <div class="modal-dialog text-dark text-left">
      <div class="modal-content">
        <div class="modal-header align-items-center">
          <h5 class="modal-title">
            <font-awesome-icon :icon="['fab', 'paypal']" />
            Deposit
          </h5>
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
          <div class="container col-md-6">
            <div class="input-group mb-3 w-50 mx-auto">
              <div class="input-group-prepend">
                <span class="input-group-text">$</span>
              </div>
              <input
                v-model.number="amount"
                type="number"
                step="1"
                min="1"
                class="form-control form-control-lg"
              />
            </div>
            <small>
              Please take PayPal's fees of 4.4% plus 0.30 USD into account. We
              are already working on a solution with smaller fees.
            </small>
            <div v-if="successMessage" class="alert alert-success mt-3">
              <button
                type="button"
                class="close"
                @click="successMessage = null"
              >
                <span>&times;</span>
              </button>
              <div v-html="successMessage"></div>
            </div>
            <div v-if="loading" class="text-muted text-center p-3">
              <font-awesome-icon icon="spinner" spin />
            </div>
            <div
              id="paypal-button-container"
              :class="{ 'd-none': loading || !bounty }"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  props: ["bounty"],
  data() {
    return {
      loading: false,
      successMessage: null,
      amount: 1
    };
  },
  mounted() {
    paypal
      .Buttons({
        createOrder: (data, actions) => {
          this.loading = true;
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  value: this.amount.toFixed(2),
                  currency_code: "USD"
                }
              }
            ],
            application_context: {
              shipping_preference: "NO_SHIPPING"
            }
          });
        },
        onApprove: (data, actions) => {
          return actions.order
            .capture()
            .then(details => {
              this.$axios
                .$post(process.env.API_URL + "/deposit-paypal", {
                  orderId: data.orderID,
                  bountyId: this.bounty.id,
                  amount: this.amount.toFixed(2)
                })
                .then(amountAfterFees => {
                  this.loading = false;
                  this.$store.dispatch("loadBounties");
                  this.successMessage =
                    "<h4>Thank you!</h4>You successfully deposited $" +
                    amountAfterFees +
                    " for this bounty.";
                });
            })
            .catch(e => console.log(e));
        },
        onCancel: (data, actions) => {
          this.loading = false;
        }
      })
      .render("#paypal-button-container");
  }
};
</script>
