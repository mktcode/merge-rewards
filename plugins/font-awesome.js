import Vue from "vue";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faBook,
  faCodeBranch,
  faSpinner,
  faCheck,
  faHeart,
  faRocket,
  faDice,
  faEuroSign,
  faAngleDoubleUp,
  faStar,
  faStarHalfAlt,
  faMinus,
  faPlus,
  faPaperPlane,
  faPowerOff,
  faExclamationCircle,
  faExternalLinkAlt,
  faSignOutAlt,
  faShareSquare,
  faUserCheck,
  faUser,
  faTimes
} from "@fortawesome/free-solid-svg-icons";
import {
  faGithub,
  faPaypal,
  faBitcoin
} from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

library.add(
  faCodeBranch,
  faGithub,
  faBitcoin,
  faBook,
  faSpinner,
  faCheck,
  faHeart,
  faRocket,
  faPaypal,
  faDice,
  faEuroSign,
  faAngleDoubleUp,
  faStar,
  faStarHalfAlt,
  faMinus,
  faPlus,
  faPaperPlane,
  faPowerOff,
  faExclamationCircle,
  faExternalLinkAlt,
  faSignOutAlt,
  faShareSquare,
  faUserCheck,
  faUser,
  faTimes
);

Vue.component("font-awesome-icon", FontAwesomeIcon);
