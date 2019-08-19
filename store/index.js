import Vue from "vue";

export const state = () => ({
  claims: [],
  withdrawals: [],
  bounties: [],
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
  bounties(state) {
    return state.bounties;
  },
  userBounties(state) {
    return state.github.user
      ? state.bounties.filter(b => b.githubUser === state.github.user.login)
      : [];
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
  bounties(state, bounties) {
    state.bounties = bounties;
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
  addIssueToPR(state, { issue, pullRequest }) {
    state.pullRequests = state.pullRequests.map(pr => {
      if (pr.id === pullRequest.id) {
        pr.issues.push(issue);
      }
      return pr;
    });
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
      dispatch("loadBounties"),
      dispatch("eos-ual/login"),
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
  loadBounties({ commit }) {
    return this.$axios
      .$get(process.env.API_URL + "/bounties")
      .then(response => {
        commit("bounties", response);
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
      changedFiles
      additions
      deletions
      body
      repository {
        viewerCanAdminister
        name
        nameWithOwner
        owner {
          login
        }
      }
      commits(first:100) {
        totalCount
        nodes {
          commit {
            message
          }
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
        const pullRequests = response.data.user.pullRequests.nodes.filter(
          pr => !pr.repository.viewerCanAdminister
        );
        const claims = getters.claims;
        pullRequests.forEach(pr => {
          // check if already claimed
          pr.claimed = false;
          if (claims.find(c => c.pullRequestId === pr.id)) {
            pr.claimed = true;
          }
          // check if pr closes issues
          pr.issues = [];
          let searchText = pr.body;
          pr.commits.nodes.forEach(commit => {
            searchText += "\n" + commit.commit.message;
          });
          const matches = [
            ...searchText.matchAll(
              /(close|closes|closed|fix|fixes|fixed|resolve|resolves|resolved)\s+#(\d+)/g
            )
          ];
          let issueNumbers = matches.reduce((numbers, match) => {
            numbers.push(match[2]);
            return numbers;
          }, []);
          issueNumbers = [...new Set(issueNumbers)];
          issueNumbers.forEach(num => {
            this.$axios
              .$post(
                "https://api.github.com/graphql",
                {
                  query: `query {
                    repository(owner: "${pr.repository.owner.login}", name: "${
                    pr.repository.name
                  }") {
                      issue(number: ${num}) {
                        id
                        closed
                        url
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
                const issue = response.data.repository.issue;
                if (issue) {
                  commit("addIssueToPR", { issue, pullRequest: pr });
                }
              });
          });
        });
        commit("pullRequests", pullRequests);
      })
      .catch(e => console.log(e));
  }
};
