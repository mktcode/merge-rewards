import Vue from "vue";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faCodeBranch,
  faSpinner,
  faMoneyBillWave,
  faTasks
} from "@fortawesome/free-solid-svg-icons";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

library.add(faCodeBranch, faGithub, faSpinner, faMoneyBillWave, faTasks);

Vue.component("font-awesome-icon", FontAwesomeIcon);
