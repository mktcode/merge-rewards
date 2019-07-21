<template>
  <div class="modal fade" id="boost-modal" tabindex="-1" role="dialog">
    <div class="modal-dialog text-dark text-left" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Boost your Scores!</h5>
          <button
            type="button"
            class="close"
            data-dismiss="modal"
            aria-label="Close"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <div class="row">
            <div class="col-sm-6 mb-3">
              <h5>
                <font-awesome-icon icon="star" />
                Strike
              </h5>
              <p>
                Straight forward. Simply set a score to 100%.
              </p>

              <a href="#" class="btn btn-sm btn-primary btn-block">
                <font-awesome-icon :icon="['fab', 'paypal']" />
                $1
              </a>
            </div>
            <div class="col-sm-6 mb-3">
              <h5>
                <font-awesome-icon icon="star-half-alt" />
                Spare
              </h5>
              <p>
                Same as the Strike but set's a score to 75%.
              </p>

              <a href="#" class="btn btn-sm btn-primary btn-block">
                <font-awesome-icon :icon="['fab', 'paypal']" />
                $0.50
              </a>
            </div>
            <div class="col-sm-6">
              <h5>
                <font-awesome-icon icon="angle-double-up" />
                Double
              </h5>
              <p>
                Double a score. Most effective for pull requests scoring around
                50%.
              </p>
              <a href="#" class="btn btn-sm btn-primary btn-block">
                <font-awesome-icon :icon="['fab', 'paypal']" />
                $0.25
              </a>
            </div>
            <div class="col-sm-6">
              <h5>
                <font-awesome-icon icon="dice" />
                Dice
              </h5>
              <p>
                For a low scoring pull request it might be better to dice a new
                score.
              </p>
              <a href="#" class="btn btn-sm btn-primary btn-block">
                <font-awesome-icon :icon="['fab', 'paypal']" />
                $0.25
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  data() {
    return {
      loading: false
    };
  },
  methods: {
    buy() {
      return;
    }
  }
};
</script>
