import Vue from "vue";
import VueSteemConnect from "vue-steemconnect";

Vue.use(VueSteemConnect, {
  app: "merge-rewards",
  callbackURL:
    process.env.SC_REDIRECT_URL || "http://localhost:3000/auth/steemconnect",
  scope: ["vote", "comment"]
});
