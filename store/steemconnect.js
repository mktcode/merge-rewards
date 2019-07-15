import Vue from "vue";

export const state = () => ({
  user: null, // steemconnect user
  accessToken: null // steemconnect access token
});

export const getters = {
  user(state) {
    return state.user;
  },
  accessToken(state) {
    return state.accessToken;
  }
};

export const mutations = {
  login(state, user) {
    state.user = user;
  },
  logout(state) {
    state.user = null;
  },
  setAccessToken(state, accessToken) {
    state.accessToken = accessToken;
  }
};

export const actions = {
  login({ commit, dispatch, state }) {
    return new Promise((resolve, reject) => {
      // don't do anything if user data is already set
      if (!state.user) {
        // in that case we look for an access token in localStorage
        const accessToken = localStorage.getItem("steemconnect_access_token");
        if (accessToken) {
          // set access token and try to fetch user object
          Vue.SteemConnect().setAccessToken(accessToken);
          Vue.SteemConnect().me((err, user) => {
            if (err) reject(err);
            else {
              // save user object in store
              commit("login", user);
              commit("setAccessToken", accessToken);
              resolve();
            }
          });
        } else {
          resolve();
        }
      } else {
        resolve();
      }
    });
  },
  logout({ commit }) {
    // remove access token and unset user in store
    localStorage.removeItem("steemconnect_access_token");
    commit("logout");
    commit("setAccessToken", null);
  }
};
