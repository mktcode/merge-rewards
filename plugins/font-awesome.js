import Vue from "vue";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faCodeBranch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

library.add(faCodeBranch);

Vue.component("font-awesome-icon", FontAwesomeIcon);
