<template>
  <div
    class="modal modal-fs fade"
    id="release-bounty-modal"
    ref="release-bounty-modal"
    tabindex="-1"
  >
    <div class="modal-dialog text-dark text-left">
      <div class="modal-content">
        <ModalHeader title="Release Bounty" />
        <div class="modal-body" v-if="bounty">
          <div class="container col-md-6">
            <h1 class="text-center">
              ${{ bounty.balance ? bounty.balance.toFixed(2) : "0.00" }}
            </h1>
            <div class="custom-control custom-checkbox">
              <input
                type="checkbox"
                class="custom-control-input"
                id="auto-release"
                v-model="autoRelease"
              />
              <label class="custom-control-label" for="auto-release">
                Release automatically
              </label>
            </div>
            <a href="#" @click.prevent="showHowItWorks = !showHowItWorks">
              <small>How does this work?</small>
            </a>
            <div class="alert alert-info small" v-if="showHowItWorks">
              <button
                type="button"
                class="close"
                @click="showHowItWorks = false"
              >
                <span aria-hidden="true">&times;</span>
              </button>
              Releasing the bounty automatically is possible, if the issue on
              GitHub was closed automatically, by a pull request. The bounty
              will then be given to the respective GitHub user as soon as he/she
              claims the rewards for this pull request.<br />
              <br />
              Read
              <a
                href="https://help.github.com/en/articles/closing-issues-using-keywords"
                target="_blank"
                >here</a
              >
              to learn more about how closing issues using keywords works.
            </div>
            <div class="mt-3" v-if="!autoRelease">
              Enter the GitHub username to which you want to release this
              bounty:
              <div class="position-relative">
                <input
                  type="text"
                  class="form-control"
                  v-model="accountName"
                  @input="validateAccountName"
                  :readonly="loading"
                />
                <font-awesome-icon
                  v-if="accountValidationLoading"
                  icon="spinner"
                  spin
                  class="input-icon"
                />
                <font-awesome-icon
                  v-else-if="accountName && !accountNameError"
                  icon="check"
                  class="input-icon"
                />
              </div>
              <small class="text-danger d-block" v-if="accountNameError">
                {{ accountNameError }}
              </small>
              <small class="d-block"
                >You can enter your own username if you want to withdraw the
                deposit.</small
              >
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button
            @click.prevent="releaseBounty()"
            type="button"
            class="btn btn-green"
            :disabled="!receiver || autoRelease"
          >
            <font-awesome-icon v-if="loading" icon="spinner" spin />
            <span v-else>Release Bounty</span>
          </button>
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
      showHowItWorks: false,
      showSuccessMessage: false,
      showErrorMessage: false,
      accountName: "",
      accountNameError: null,
      accountValidationLoading: false,
      keyPressTimeout: null,
      receiver: null,
      autoRelease: true
    };
  },
  computed: {
    ...mapGetters("github", {
      githubUser: "user",
      githubAccessToken: "accessToken"
    })
  },
  watch: {
    autoRelease(autoRelease) {
      this.$axios.$post(process.env.API_URL + "/toggle-autorelease", {
        githubAccessToken: this.githubAccessToken,
        bountyId: this.bounty.id,
        autoRelease: this.autoRelease
      });
    },
    bounty(bounty) {
      if (bounty) {
        this.autoRelease = !!bounty.autoRelease;
      } else {
        this.autoRelease = true;
      }
    }
  },
  methods: {
    releaseBounty() {
      if (this.githubUser && this.receiver) {
        this.loading = true;
        this.$axios
          .$post(process.env.API_URL + "/release-bounty", {
            githubAccessToken: this.githubAccessToken,
            bountyId: this.bounty.id,
            receiver: this.receiver.login
          })
          .then(() => {
            $(this.$refs["release-bounty-modal"]).modal("hide");
            this.$store.dispatch("loadBounties");
          })
          .finally(() => (this.loading = false));
      }
    },
    validateAccountName() {
      clearTimeout(this.keyPressTimeout);
      this.accountValidationLoading = true;
      this.keyPressTimeout = setTimeout(() => {
        this.$axios
          .$get("https://api.github.com/users/" + this.accountName)
          .then(receiver => {
            this.receiver = receiver;
            this.accountNameError = null;
          })
          .catch(e => {
            this.receiver = null;
            this.accountNameError = "This GitHub user does not exist.";
          })
          .finally(() => {
            this.accountValidationLoading = false;
          });
      }, 1000);
    }
  }
};
</script>
