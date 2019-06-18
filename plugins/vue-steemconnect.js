import Vue from "vue";
import VueSteemConnect from "vue-steemconnect";

Vue.use(VueSteemConnect, {
  app: "mkt.test",
  callbackURL: "http://localhost:3000/auth",
  scope: ["vote", "comment"]
});
