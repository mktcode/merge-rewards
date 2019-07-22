import Vue from "vue";

export const state = () => ({
  claims: [],
  withdrawals: [],
  balance: {
    balance: 0,
    pending: 0
  },
  boosters: {
    strikes: 0,
    spares: 0,
    doubles: 0,
    dices: 0
  },
  accountPrice: null,
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
  boosters(state) {
    return state.boosters;
  },
  accountPrice(state) {
    return state.accountPrice;
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
  boosters(state, boosters) {
    state.boosters = boosters;
  },
  accountPrice(state, accountPrice) {
    state.accountPrice = accountPrice;
  },
  pullRequests(state, pullRequests) {
    state.pullRequests = pullRequests;
  },
  claimed(state, id) {
    state.pullRequests = state.pullRequests.map(pr => {
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
        dispatch("loadBoosters", githubUser);
        dispatch("loadAccountPrice");
        setInterval(() => {
          dispatch("loadBalance", githubUser);
          dispatch("loadBoosters", githubUser);
          dispatch("loadAccountPrice");
        }, 60000);
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
      .$get(process.env.API_URL + "/balance/" + githubUser.login)
      .then(balance => commit("balance", balance));
  },
  loadBoosters({ commit }, githubUser) {
    return this.$axios
      .$get(process.env.API_URL + "/boosters/" + githubUser.login)
      .then(boosters => commit("boosters", boosters));
  },
  loadAccountPrice({ commit }, githubUser) {
    return this.$axios
      .$get("https://blocktrades.us/api/v2/estimate-input-amount", {
        params: {
          outputAmount: 1,
          inputCoinType: "sbd",
          outputCoinType: "steem_account_creation"
        }
      })
      .then(response => {
        // add 2 SBD to what blocktrades says
        commit("accountPrice", (Number(response.inputAmount) + 2).toFixed(3));
      });
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
          if (claims.find(c => c.pullRequestId === pr.id)) {
            pr.claimed = true;
          }
        });
        commit("pullRequests", pullRequests);
      });
  }
};
