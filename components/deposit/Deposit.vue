<template>
  <div class="container text-center">
    <h1 class="text-center">
      {{ title }}
    </h1>
    <p class="mb-5 text-muted">(All deposits can be refunded at any time.)</p>
    <div class="row deposit-types">
      <div class="col-md-4">
        <div class="type p-3">
          <font-awesome-icon icon="user" class="icon fa-4x fa-fw mb-3 mt-4" />
          <h2 class="mt-2">User</h2>
          <div v-if="githubUser">
            <button class="btn btn-green">
              <font-awesome-icon icon="euro-sign" />
            </button>
            <button class="btn btn-green">
              <font-awesome-icon :icon="['fab', 'paypal']" />
            </button>
            <button class="btn btn-green">
              <font-awesome-icon :icon="['fab', 'bitcoin']" />
            </button>
          </div>
          <p class="text-muted mt-3">
            Send money directly to a GitHub account. The account holder can
            withdraw it or forward it to a project or bounty.
          </p>
        </div>
      </div>
      <div class="col-md-4">
        <div class="type p-3">
          <font-awesome-icon
            icon="exclamation-circle"
            class="icon fa-4x fa-fw mb-3 mt-4"
          />
          <h2 class="mt-2">Bounty</h2>
          <div v-if="githubUser">
            <button class="btn btn-green">
              <font-awesome-icon icon="euro-sign" />
            </button>
            <button class="btn btn-green">
              <font-awesome-icon :icon="['fab', 'paypal']" />
            </button>
            <button class="btn btn-green">
              <font-awesome-icon :icon="['fab', 'bitcoin']" />
            </button>
          </div>
          <p class="text-muted mt-3">
            Send money to an issue on GitHub. The project owner can release it
            manually or activate the automatic release through a merged pull
            request.
          </p>
        </div>
      </div>
      <div class="col-md-4">
        <div class="type p-3">
          <font-awesome-icon icon="book" class="icon fa-4x fa-fw mb-3 mt-4" />
          <h2 class="mt-2">Project</h2>
          <div v-if="githubUser">
            <button class="btn btn-green">
              <font-awesome-icon icon="euro-sign" />
            </button>
            <button class="btn btn-green">
              <font-awesome-icon :icon="['fab', 'paypal']" />
            </button>
            <button class="btn btn-green">
              <font-awesome-icon :icon="['fab', 'bitcoin']" />
            </button>
          </div>
          <p class="text-muted mt-3">
            Send money to a repository on GitHub. The project owner can withdraw
            it or use it for bounties and to reward users directly.
          </p>
        </div>
      </div>
    </div>
    <a
      v-if="!githubUser"
      :href="
        'https://github.com/login/oauth/authorize?scope=user:email&client_id=' +
          githubClientId
      "
      class="btn btn-light mt-5"
    >
      <font-awesome-icon :icon="['fab', 'github']" />
      Connect to deposit
    </a>
  </div>
</template>

<style lang="sass" scoped>
.deposit-types
  .type
    border-radius: 50px
    transition: box-shadow 0.3s, margin-top 0.3s
    &:hover
      box-shadow: 0 25px 25px rgba(0, 0, 0, 0.1)
      margin-top: -5px
  .icon
    color: #ccc
</style>

<script>
import { mapGetters } from "vuex";

export default {
  props: ["title"],
  data() {
    return {
      githubClientId: process.env.GITHUB_CLIENT_ID
    };
  },
  computed: {
    ...mapGetters("github", {
      githubUser: "user"
    })
  }
};
</script>
