import Vue from "vue";

export const state = () => ({
  claims: [],
  withdrawals: [],
  balance: {
    rewards: 0,
    pending: 0
  },
  pullRequests: []
});

export const getters = {
  claims(state) {
    return state.claims;
  },
  withdrawals(state) {
    return state.withdrawals;
  },
  balance(state) {
    return state.balance;
  },
  pullRequests(state) {
    return state.pullRequests;
  }
};

export const mutations = {
  claims(state, claims) {
    state.claims = claims;
  },
  withdrawals(state, withdrawals) {
    state.withdrawals = withdrawals;
  },
  balance(state, balance) {
    state.balance = balance;
  },
  pullRequests(state, pullRequests) {
    state.pullRequests = pullRequests;
  },
  claimed(state, id) {
    const pullRequests = state.pullRequests.map(pr => {
      if (pr.id === id) {
        pr.claimed = true;
      }
      return pr;
    });
  }
};

export const actions = {
  load({ dispatch, getters }) {
    return Promise.all([
      dispatch("loadDatabase"),
      dispatch("steemconnect/login"),
      dispatch("github/login")
    ]).then(() => {
      const githubUser = getters["github/user"];
      const githubAccessToken = getters["github/accessToken"];
      if (githubUser && githubAccessToken) {
        dispatch("loadBalance", githubUser);
        dispatch("loadPullRequests", {
          githubUser,
          githubAccessToken
        });
      }
    });
  },
  loadDatabase({ commit }) {
    return Promise.all([
      this.$axios.$get(process.env.API_URL + "/database/claims"),
      this.$axios.$get(process.env.API_URL + "/database/withdrawals")
    ]).then(values => {
      commit("claims", values[0]);
      commit("withdrawals", values[1]);
    });
  },
  loadBalance({ commit }, githubUser) {
    return this.$axios
      .$get(process.env.API_URL + "/rewards/" + githubUser.login)
      .then(balance => commit("balance", balance));
  },
  loadPullRequests({ commit, getters }, { githubUser, githubAccessToken }) {
    return this.$axios
      .$post(
        "https://api.github.com/graphql",
        {
          query: `query {
  user(login: "${githubUser.login}") {
  pullRequests(first: 25, orderBy: { field: CREATED_AT, direction: DESC}) {
    totalCount
    nodes {
      id
      createdAt
      repository {
        name
        nameWithOwner
        owner {
          login
        }
      }
      number
      title
      merged
      mergedAt
      closed
      permalink
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
}`
        },
        {
          headers: {
            Authorization: "bearer " + githubAccessToken
          }
        }
      )
      .then(response => {
        const pullRequests = response.data.user.pullRequests.nodes;
        const claims = getters.claims;
        pullRequests.forEach(pr => {
          // check if already claimed
          pr.claimed = false;
          if (claims.find(p => p.id === pr.id)) {
            pr.claimed = true;
          }
        });
        commit("pullRequests", pullRequests);
      });
  }
};
