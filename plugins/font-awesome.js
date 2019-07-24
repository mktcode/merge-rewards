import Vue from "vue";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faCodeBranch,
  faSpinner,
  faCheck,
  faHeart,
  faRocket,
  faDice,
  faAngleDoubleUp,
  faStar,
  faStarHalfAlt,
  faMinus,
  faPlus,
  faPaperPlane,
  faPowerOff
} from "@fortawesome/free-solid-svg-icons";
import { faGithub, faPaypal } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

library.add(
  faCodeBranch,
  faGithub,
  faSpinner,
  faCheck,
  faHeart,
  faRocket,
  faPaypal,
  faDice,
  faAngleDoubleUp,
  faStar,
  faStarHalfAlt,
  faMinus,
  faPlus,
  faPaperPlane,
  faPowerOff
);

Vue.component("font-awesome-icon", FontAwesomeIcon);
