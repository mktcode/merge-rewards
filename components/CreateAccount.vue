<template>
  <div
    class="modal fade"
    id="account-creation-modal"
    tabindex="-1"
    role="dialog"
  >
    <div class="modal-dialog text-dark text-left" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Create Steem Account</h5>
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
          <p>
            Spend <b>${{ accountPriceFixed }}</b> of your Merge Rewards balance
            to create a Steem account. A Steem account gives you increased
            rewards and the option to sponsor projects as well as access to a
            whole lot of
            <a href="https://steemprojects.com/" target="_blank"
              >other Steem based apps</a
            >.
          </p>
          <label class="form-label">Choose an account name:</label>
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
          <p class="text-danger small" v-if="accountNameError">
            {{ accountNameError }}
          </p>
          <div v-if="password && keys">
            <h5 class="mt-3">Your Password:</h5>
            <div class="alert alert-info text-center">
              {{ password }}
            </div>
            <div class="alert alert-danger mt-3">
              <b>Important:</b> Backup your password!<br />
              <br />
              It can not be recovered! If you loose it, you will loose access to
              your Steem account permanently.
              <a
                :href="'data:text/plain;base64,' + accountBackup"
                class="btn btn-danger mt-2 w-100"
                :download="accountName + '-backup.txt'"
                @click="backupDownloaded = true"
              >
                Download Password Backup
              </a>
            </div>
          </div>
          <div v-if="successMessage" class="alert alert-success mt-3">
            <button type="button" class="close" @click="successMessage = null">
              <span>&times;</span>
            </button>
            {{ successMessage }}
          </div>
          <div v-if="errorMessage" class="alert alert-danger mt-3">
            <button type="button" class="close" @click="errorMessage = null">
              <span>&times;</span>
            </button>
            {{ errorMessage }}
          </div>
        </div>
        <div class="modal-footer">
          <button
            @click.prevent="createAccount()"
            type="button"
            class="btn btn-success"
            :disabled="
              loading || !backupDownloaded || !accountName || !password || !keys
            "
          >
            <span v-if="loading">
              <font-awesome-icon icon="spinner" spin />
              Don't close this window!<br />(Can take up to two minutes.)
            </span>
            <span v-else>Create Account</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import steem from "steem";
import accountBackupTemplate from "./accountBackupTemplate";

export default {
  data() {
    return {
      loading: false,
      successMessage: null,
      errorMessage: null,
      accountName: "",
      accountNameError: null,
      accountValidationLoading: false,
      password: null,
      keys: null,
      keyPressTimeout: null,
      backupDownloaded: false
    };
  },
  computed: {
    ...mapGetters("github", {
      githubUser: "user",
      githubAccessToken: "accessToken"
    }),
    ...mapGetters(["balance", "accountPrice"]),
    accountPriceFixed() {
      return Number(this.accountPrice).toFixed(2);
    },
    accountBackup() {
      return btoa(
        accountBackupTemplate
          .replace("{{accountName}}", this.accountName)
          .replace("{{password}}", this.password)
          .replace("{{owner}}", this.keys.owner)
          .replace("{{active}}", this.keys.active)
          .replace("{{posting}}", this.keys.posting)
          .replace("{{memo}}", this.keys.memo)
      );
    }
  },
  methods: {
    createAccount() {
      this.loading = true;
      this.$axios
        .$post(process.env.API_URL + "/create-account", {
          githubAccessToken: this.githubAccessToken,
          accountName: this.accountName,
          pubKeys: {
            owner: this.keys.ownerPubkey,
            active: this.keys.activePubkey,
            posting: this.keys.postingPubkey,
            memo: this.keys.memoPubkey
          }
        })
        .then(() => {
          const tryPowerUp = setInterval(() => {
            steem.api.getAccounts([this.accountName], (error, accounts) => {
              if (error) {
                console.log(error);
              } else {
                if (accounts.length) {
                  steem.broadcast.transferToVesting(
                    this.keys.active,
                    this.accountName,
                    this.accountName,
                    accounts[0].balance,
                    (error, result) => {
                      if (error) {
                        console.log(error);
                      } else {
                        this.loading = false;
                        this.successMessage = "Account created success fully.";
                        clearInterval(tryPowerUp);
                      }
                    }
                  );
                } else {
                  console.log("Account not found yet.");
                }
              }
            });
          }, 5000);
        })
        .catch(e => {
          this.errorMessage = e.response.data;
          this.loading = false;
        });
    },
    validateAccountName() {
      clearTimeout(this.keyPressTimeout);
      this.backupDownloaded = false;
      this.keys = null;
      this.password = null;
      this.accountNameError = steem.utils.validateAccountName(this.accountName);
      if (!this.accountNameError) {
        this.accountValidationLoading = true;
        this.keyPressTimeout = setTimeout(() => {
          steem.api.getAccounts([this.accountName], (error, accounts) => {
            this.accountValidationLoading = false;
            if (error) {
              this.accountNameError =
                "Could not check account name availability. Please try again later.";
            } else {
              if (accounts.length) {
                this.accountNameError = "This account name already exists.";
              } else {
                this.password = steem.formatter.createSuggestedPassword();
                this.keys = steem.auth.getPrivateKeys(
                  this.accountName,
                  this.password,
                  ["owner", "active", "posting", "memo"]
                );
              }
            }
          });
        }, 1000);
      }
    }
  }
};
</script>
