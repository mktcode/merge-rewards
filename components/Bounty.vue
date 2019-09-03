<template>
  <div class="row">
    <div class="col-md-7 pl-0 d-flex align-items-center">
      <div class="text-truncate d-flex flex-column px-3" v-if="issue">
        <a :href="issue.url" target="_blank" class="text-dark text-truncate">
          {{ issue.title }}
        </a>
        <a :href="issue.repository.url" target="_blank" class="small">
          {{ issue.repository.owner.login }}/{{ issue.repository.name }}
        </a>
      </div>
    </div>
    <div class="col-md-5 pr-0 text-right">
      <h5>
        {{ bounty.balance.usd ? bounty.balance.usd.toFixed(2) : "0.00" }}
        USD<br />
        {{ bounty.balance.eur ? bounty.balance.eur.toFixed(2) : "0.00" }}
        EUR<br />
        {{ bounty.balance.sbd ? bounty.balance.usd.toFixed(2) : "0.00" }} SBD
      </h5>
    </div>
  </div>
</template>

<style lang="sass">
.addresses
  button
    &:hover
      svg.custom-svg
        path
          fill: #fff
    svg.custom-svg
      width: 14px
      height: 14px
      path
        fill: #fff
        transition: fill 0.3s
</style>

<script>
import { mapGetters } from "vuex";

export default {
  props: ["bounty"],
  data() {
    return {
      issue: null
    };
  },
  mounted() {
    this.$axios
      .$post(
        "https://api.github.com/graphql",
        {
          query: `{
  node(id: "${this.bounty.issueId}") {
    ... on Issue {
      url
      title
      repository {
        name
        owner {
          login
        }
        url
      }
    }
  }
  }`
        },
        {
          headers: {
            Authorization: "bearer " + process.env.GITHUB_ACCESS_TOKEN
          }
        }
      )
      .then(response => {
        this.issue = response.data.node;
      });
  }
};
</script>
