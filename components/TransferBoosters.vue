<template>
  <div class="modal modal-fs fade" id="transfer-boosters-modal" tabindex="-1">
    <div class="modal-dialog text-dark text-left">
      <div class="modal-content">
        <ModalHeader title="Transfer Boosters" icon="paper-plane" />
        <div class="modal-body">
          <div class="container col-md-6">
            <label>Receiving GitHub Account:</label>
            <input
              type="text"
              v-model="receiver"
              class="form-control form-control-lg"
            />
            <div class="container mt-3">
              <div class="row">
                <div
                  class="col-sm-6 text-center mb-3"
                  v-for="(count, name) in boosters"
                >
                  <div class="btn-group">
                    <button class="btn btn-outline-dark" disabled>
                      <font-awesome-icon
                        :icon="getBoosterIcon(name)"
                        fixed-width
                      />
                      &times;{{ count }}
                    </button>
                    <button
                      class="btn btn-dark"
                      @click="removeItem(name)"
                      :disabled="count === 0"
                    >
                      <font-awesome-icon icon="minus" class="small" />
                    </button>
                    <button
                      class="btn btn-dark"
                      @click="addItem(name)"
                      :disabled="count === availableBoosters[name]"
                    >
                      <font-awesome-icon icon="plus" class="small" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="showSuccessMessage" class="alert alert-success mt-3">
              Transfer successful!
            </div>
            <div v-if="showErrorMessage" class="alert alert-danger mt-3">
              Transfer failed!
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button
            @click.prevent="transfer()"
            type="button"
            class="btn btn-green"
            :disabled="
              !receiver ||
                !(
                  boosters.strikes +
                  boosters.spares +
                  boosters.doubles +
                  boosters.dices
                )
            "
          >
            <font-awesome-icon v-if="loading" icon="spinner" spin />
            <span v-else>Transfer</span>
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
      receiver: "",
      boosters: { strikes: 0, spares: 0, doubles: 0, dices: 0 },
      showSuccessMessage: false,
      showErrorMessage: false
    };
  },
  computed: {
    ...mapGetters("github", {
      githubUser: "user",
      githubAccessToken: "accessToken"
    }),
    ...mapGetters({ availableBoosters: "boosters" })
  },
  methods: {
    transfer() {
      if (this.githubUser) {
        this.loading = true;
        this.$axios
          .$post(process.env.API_URL + "/transfer-boosters", {
            githubAccessToken: this.githubAccessToken,
            receiver: this.receiver,
            boosters: this.boosters
          })
          .then(() => {
            this.$store.dispatch("loadBoosters", this.githubUser);
            this.boosters = { strikes: 0, spares: 0, doubles: 0, dices: 0 };
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
    },
    addItem(item) {
      if (this.boosters[item] < this.availableBoosters[item]) {
        this.boosters[item]++;
      }
    },
    removeItem(item) {
      if (this.boosters[item] > 0) {
        this.boosters[item]--;
      }
    },
    getBoosterIcon(booster) {
      const icons = {
        strikes: "star",
        spares: "star-half-alt",
        doubles: "angle-double-up",
        dices: "dice"
      };
      return icons[booster];
    }
  }
};
</script>
