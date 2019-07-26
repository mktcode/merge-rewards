<template>
  <div
    class="modal fade"
    id="add-bounty-modal"
    ref="add-bounty-modal"
    tabindex="-1"
    role="dialog"
  >
    <div class="modal-dialog text-dark text-left" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Add Bounty</h5>
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
          <div>Paste the full issue URL here:</div>
          <input
            type="text"
            class="form-control"
            v-model="issueUrl"
            placeholder="https://github.com/..."
          />
          <small> Or enter: <i>owner/repo/number</i> </small>
          <div class="input-group my-3" v-if="issue">
            <input
              type="text"
              class="form-control"
              readonly
              :value="issue.title"
            />
            <div class="input-group-append">
              <a :href="issue.url" target="_blank" class="btn btn-outline-dark">
                <font-awesome-icon icon="external-link-alt" />
              </a>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button
            @click.prevent="addBounty()"
            type="button"
            class="btn btn-success"
            :disabled="!issue"
          >
            <font-awesome-icon v-if="loading" icon="spinner" spin />
            <span v-else>Create Issue Wallets</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

const MIN_AMOUNT = 1;

export default {
  data() {
    return {
      loading: false,
      showSuccessMessage: false,
      showErrorMessage: false,
      issueUrl: null,
      issue: null,
      currency: "",
      minAmount: MIN_AMOUNT,
      amount: MIN_AMOUNT,
      address: "",
      inputAmount: 0,
      inputAddress: ""
    };
  },
  computed: {
    ...mapGetters("github", {
      githubUser: "user",
      githubAccessToken: "accessToken"
    }),
    ...mapGetters(["balance"])
  },
  watch: {
    issueUrl(url) {
      const parts = url
        .replace("https://github.com/", "")
        .split("/")
        .filter(p => p);
      if (parts.length === 4 && parts[2] === "issues") {
        parts.splice(2, 1);
      }
      if (parts.length === 3) {
        const [owner, repoName, issueNumber] = parts;

        this.$axios
          .$post(
            "https://api.github.com/graphql",
            {
              query: `{
                repository(owner: "${owner}", name: "${repoName}") {
                  owner {
                    login
                  }
                  name
                  issue(number: ${issueNumber}) {
                    id
                    title
                    closed
                    url
                    number
                  }
                }
              }`
            },
            {
              headers: {
                Authorization: "bearer " + this.githubAccessToken
              }
            }
          )
          .then(response => {
            if (!response.data.repository.issue.closed) {
              this.issue = response.data.repository.issue;
              this.issue.number = response.data.repository.issue.number;
              this.issue.owner = response.data.repository.owner.login;
              this.issue.repo = response.data.repository.name;
            }
          })
          .catch(e => {
            console.log(e);
          });
      }
    }
  },
  methods: {
    addBounty() {
      if (this.githubUser) {
        this.loading = true;
        this.$axios
          .$post(process.env.API_URL + "/add-bounty", {
            githubAccessToken: this.githubAccessToken,
            issue: this.issue
          })
          .then(() => {
            $(this.$refs["add-bounty-modal"]).modal("hide");
            this.$store.dispatch("loadBounties");
          })
          .finally(() => (this.loading = false));
      }
    }
  }
};
</script>
