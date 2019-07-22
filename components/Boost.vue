<template>
  <div class="modal fade" id="boost-modal" tabindex="-1" role="dialog">
    <div class="modal-dialog text-dark text-left" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <font-awesome-icon icon="rocket" />
            Boost your Scores!
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
          <div class="row">
            <div class="col-sm-6 mb-4">
              <h5>
                <font-awesome-icon icon="star" />
                Strike
              </h5>
              <p class="mb-1">
                Straight forward. Simply set a score to 100%.
              </p>
              <div class="btn-group">
                <button disabled class="btn btn-sm btn-dark">
                  ${{ strikePrice.toFixed(2) }}
                </button>
                <button class="btn btn-sm btn-outline-dark" disabled>
                  &times;{{ strikes }}
                </button>
                <button
                  class="btn btn-sm btn-success"
                  @click="removeItem('strikes')"
                >
                  <font-awesome-icon icon="minus" class="small" />
                </button>
                <button
                  class="btn btn-sm btn-success"
                  @click="addItem('strikes')"
                >
                  <font-awesome-icon icon="plus" class="small" />
                </button>
              </div>
            </div>
            <div class="col-sm-6 mb-4">
              <h5>
                <font-awesome-icon icon="star-half-alt" />
                Spare
              </h5>
              <p class="mb-1">
                Almost a Strike. Set the score to 75%.
              </p>
              <div class="btn-group">
                <button disabled class="btn btn-sm btn-dark">
                  ${{ sparePrice.toFixed(2) }}
                </button>
                <button class="btn btn-sm btn-outline-dark" disabled>
                  &times;{{ spares }}
                </button>
                <button
                  class="btn btn-sm btn-success"
                  @click="removeItem('spares')"
                >
                  <font-awesome-icon icon="minus" class="small" />
                </button>
                <button
                  class="btn btn-sm btn-success"
                  @click="addItem('spares')"
                >
                  <font-awesome-icon icon="plus" class="small" />
                </button>
              </div>
            </div>
            <div class="col-sm-6 mb-4">
              <h5>
                <font-awesome-icon icon="angle-double-up" />
                Double
              </h5>
              <p class="mb-1">
                Double a score. Most effective for pull requests scoring around
                50%.
              </p>
              <div class="btn-group">
                <button disabled class="btn btn-sm btn-dark">
                  ${{ doublePrice.toFixed(2) }}
                </button>
                <button class="btn btn-sm btn-outline-dark" disabled>
                  &times;{{ doubles }}
                </button>
                <button
                  class="btn btn-sm btn-success"
                  @click="removeItem('doubles')"
                >
                  <font-awesome-icon icon="minus" class="small" />
                </button>
                <button
                  class="btn btn-sm btn-success"
                  @click="addItem('doubles')"
                >
                  <font-awesome-icon icon="plus" class="small" />
                </button>
              </div>
            </div>
            <div class="col-sm-6">
              <h5>
                <font-awesome-icon icon="dice" />
                Dice
              </h5>
              <p class="mb-1">
                For a low scoring pull request it might be better to dice a new
                score.
              </p>
              <div class="btn-group">
                <button disabled class="btn btn-sm btn-dark">
                  ${{ dicePrice.toFixed(2) }}
                </button>
                <button class="btn btn-sm btn-outline-dark" disabled>
                  &times;{{ dices }}
                </button>
                <button
                  class="btn btn-sm btn-success"
                  @click="removeItem('dices')"
                >
                  <font-awesome-icon icon="minus" class="small" />
                </button>
                <button
                  class="btn btn-sm btn-success"
                  @click="addItem('dices')"
                >
                  <font-awesome-icon icon="plus" class="small" />
                </button>
              </div>
            </div>
          </div>
          <h2 class="mt-3 pt-3 border-top text-center">
            ${{ fullPrice.toFixed(2) }}
          </h2>
          <div v-if="successMessage" class="alert alert-success mt-3">
            <button type="button" class="close" @click="successMessage = null">
              <span>&times;</span>
            </button>
            <div v-html="successMessage"></div>
          </div>
          <div v-if="loading" class="text-muted text-center p-3">
            <font-awesome-icon icon="spinner" spin />
          </div>
          <div
            id="paypal-button-container"
            :class="{ 'd-none': loading || !fullPrice }"
          ></div>
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
      successMessage: null,
      strikes: 0,
      strikePrice: 1,
      spares: 0,
      sparePrice: 0.5,
      doubles: 0,
      doublePrice: 0.5,
      dices: 0,
      dicePrice: 0.5
    };
  },
  computed: {
    ...mapGetters("github", {
      githubUser: "user",
      githubAccessToken: "accessToken"
    }),
    fullPrice() {
      return (
        this.strikes * this.strikePrice +
        this.spares * this.sparePrice +
        this.doubles * this.doublePrice +
        this.dices * this.dicePrice
      );
    }
  },
  methods: {
    addItem(item) {
      this.successMessage = null;
      this[item]++;
    },
    removeItem(item) {
      this.successMessage = null;
      this[item]--;
      if (this[item] < 0) {
        this[item] = 0;
      }
    }
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
                  value: this.fullPrice.toFixed(2)
                }
              }
            ]
          });
        },
        onApprove: (data, actions) => {
          return actions.order.capture().then(details => {
            this.$axios
              .$post(process.env.API_URL + "/add-boosters", {
                orderId: data.orderID,
                githubAccessToken: this.githubAccessToken,
                boosters: {
                  strikes: this.strikes,
                  spares: this.spares,
                  doubles: this.doubles,
                  dices: this.dices
                },
                price: this.fullPrice.toFixed(2)
              })
              .then(() => {
                this.$store.dispatch("loadBoosters", this.githubUser);
                this.strikes = 0;
                this.spares = 0;
                this.doubles = 0;
                this.dices = 0;
                this.loading = false;
                this.successMessage =
                  "<h4>Thank you!</h4>Your boosters have been added to your account.";
              });
          });
        }
      })
      .render("#paypal-button-container");
  }
};
</script>
