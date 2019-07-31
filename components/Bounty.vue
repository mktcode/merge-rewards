<template>
  <div class="row">
    <div class="col-md-7 pl-0 d-flex align-items-center">
      <font-awesome-icon
        icon="exclamation-circle"
        :class="bounty.releasedAt ? 'text-danger' : 'text-success'"
        fixed-width
      />
      <div class="text-truncate d-flex flex-column px-3">
        <a :href="issueUrl" target="_blank" class="text-dark text-truncate">
          {{ bounty.issueTitle }}
        </a>
        <a :href="issueUrl" target="_blank" class="small">
          {{ bounty.issueOwner }}/{{ bounty.issueRepo }}
        </a>
      </div>
    </div>
    <div class="col-md-5 pr-0 text-right">
      <h3>${{ bounty.balance ? bounty.balance.toFixed(2) : "0.00" }}</h3>
      <small v-if="bounty.releasedAt && bounty.releasedTo">
        closed by:
        <a :href="'https://github.com/' + bounty.releasedTo" target="_blank">
          {{ bounty.releasedTo }}
        </a>
      </small>
      <div class="btn-group addresses" v-else>
        <button
          class="btn btn-sm btn-dark"
          data-toggle="popover"
          title="Bitcoin Address"
          data-html="true"
          :data-content="
            `
              Send Bitcoin (BTC) to this address:<br>
              <b>${bounty.btcAddress}</b>
            `
          "
        >
          <font-awesome-icon :icon="['fab', 'bitcoin']" />
        </button>
        <button
          class="btn btn-sm btn-dark"
          data-toggle="popover"
          title="Litecoin Address"
          data-html="true"
          :data-content="
            `
            Send Litecoin (LTC) to this address:<br>
            <b>${bounty.ltcAddress}</b>
          `
          "
        >
          <svg viewBox="0 0 24 24" class="custom-svg">
            <path
              d="M12.55,15.92L13.16,13.78L14.81,13.19L16.25,7.63L14.56,8.31L16.25,2H8L5.38,11.77L3.72,12.34L2.22,17.91L4,17.27L2.66,22H20.16L21.78,15.92H12.55M19.39,21H4L5.46,15.65L3.72,16.3L4.58,13.11L6.24,12.54L8.74,3H15L13.13,10L14.83,9.3L14,12.42L12.33,13L11.22,16.91H20.5L19.39,21Z"
            />
          </svg>
        </button>
        <button
          class="btn btn-sm btn-dark"
          data-toggle="popover"
          title="Ether Address"
          data-html="true"
          :data-content="
            `
            Send Ether (ETH) to this address:<br>
            <b>${bounty.ethAddress}</b>
          `
          "
        >
          <svg viewBox="0 0 24 24" class="custom-svg">
            <path
              d="M12,1.75L5.75,12.25L12,16L18.25,12.25L12,1.75M5.75,13.5L12,22.25L18.25,13.5L12,17.25L5.75,13.5Z"
            />
          </svg>
        </button>
        <button
          class="btn btn-sm btn-dark"
          data-toggle="popover"
          title="Monero Address"
          data-html="true"
          :data-content="
            `
            Send Monero (XMR) to this address:<br>
            <b>${bounty.xmrAddress}</b>
          `
          "
        >
          <svg
            enable-background="new 0 0 226.777 226.777"
            id="Layer_1"
            version="1.1"
            viewBox="0 0 226.777 226.777"
            xml:space="preserve"
            class="custom-svg"
          >
            <g id="XMR_2_">
              <path
                d="M39.722,149.021v-95.15l73.741,73.741l73.669-73.669v95.079h33.936c3.699-11.193,5.709-23.155,5.709-35.59   c0-62.6-50.746-113.347-113.347-113.347c-62.6,0-113.347,50.747-113.347,113.347c0,12.435,2.008,24.396,5.709,35.59H39.722z"
              />
              <path
                d="M162.54,172.077v-60.152l-49.495,49.495l-49.148-49.148v59.806H16.417c19.864,32.786,55.879,54.7,97.013,54.7   c41.135,0,77.149-21.914,97.013-54.7H162.54z"
              />
            </g>
          </svg>
        </button>
        <button
          class="btn btn-sm btn-dark"
          data-toggle="popover"
          title="Steem Address"
          data-html="true"
          :data-content="
            `
            Send STEEM to this user:<br>
            <b>blocktrades</b><br>
            with this memo:<br>
            <b>${bounty.steemAddress}</b><br>
            <br>
            Send SBD to this user:<br>
            <b>merge-rewards</b><br>
            with this memo:<br>
            <b>${bounty.sbdAddress}</b>
          `
          "
        >
          <svg viewBox="0 0 1214.9 1290.8" class="custom-svg">
            <style>
              .st0 {
                fill: #165098;
              }
              .st1 {
                fill: #5c9dd5;
              }
            </style>
            <path
              class="st0"
              d="M146.5 145.3C90.5 192.2 32.7 250 9.2 320.5c-27.1 83.1 10.8 168 47 242C92.3 638.3 132 712.4 166.3 790c27.1 61.4 65 133.6 56 202.3-7.2 48.8-23.5 95.7-32.5 144.5-7.2 32.5 23.5 0 34.3-9 63.2-54.2 131.8-115.6 157.1-198.7 12.6-41.5 5.4-79.5-9-119.2-14.4-37.9-30.7-74-47-112-34.3-75.9-70.4-151.7-106.6-227.6-14.4-27.1-28.9-56-41.5-84.9-12.6-30.7-19.9-63.2-21.7-97.5-1.8-27.1-1.8-52.4 1.8-79.5 1.8-19.9 7.2-37.9 9-57.8 1.9-10.7-7.1-14.4-19.7-5.3zm827.1 0c-56 47-113.8 104.8-137.3 175.2-27.1 83.1 10.8 168 47 242 36.1 75.9 75.9 149.9 110.2 227.6 27.1 61.4 65 133.6 56 202.3-7.2 48.8-23.5 95.7-32.5 144.5-7.2 32.5 23.5 0 34.3-9 63.2-54.2 131.8-115.6 157.1-198.7 12.6-41.5 5.4-79.5-9-119.2-14.4-37.9-30.7-74-47-112-34.3-75.9-70.4-151.7-106.6-227.6-14.4-27.1-28.9-56-41.5-84.9-12.6-30.7-19.9-63.2-21.7-97.5-1.8-27.1-1.8-52.4 1.8-79.5 1.8-19.9 7.2-37.9 9-57.8 1.9-10.8-7.1-14.5-19.8-5.4z"
            />
            <path
              class="st1"
              d="M547.4 8c-63.2 52.4-131.8 115.6-169.8 189.6-27.1 52.4-30.7 106.6-16.3 160.7 18.1 65 43.3 130 70.4 193.2 52.4 121 121 234.8 171.6 357.6 18.1 43.3 37.9 92.1 41.5 140.9 3.6 59.6-16.3 122.8-32.5 178.8-3.6 16.3-14.4 37.9-12.6 54.2 1.8 12.6 9 7.2 16.3 1.8 30.7-23.5 61.4-50.6 88.5-77.7 74-70.4 158.9-164.4 151.7-274.5-3.6-45.2-25.3-88.5-43.3-130C793 753.9 771.4 707 749.7 660c-39.7-88.5-81.3-175.2-124.6-261.9-14.4-30.7-32.5-59.6-43.3-90.3-16.3-41.5-23.5-84.9-25.3-128.2-1.8-32.5 0-66.8 3.6-99.3 1.8-21.7 9-41.5 9-63.2 5.4-19.9-5.4-21.7-21.7-9.1z"
            />
          </svg>
        </button>
        <button
          v-if="githubUser && bounty.githubUser === githubUser.login"
          class="btn btn-sm btn-success"
          data-toggle="modal"
          data-target="#release-bounty-modal"
          @click="$parent.focusedBounty = bounty"
        >
          <font-awesome-icon icon="user-check" />
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="sass">
.addresses
  button
    &:hover
      svg.custom-svg
        path
          fill: #fff
    svg.custom-svg
      width: 14px
      height: 14px
      path
        fill: #fff
        transition: fill 0.3s
</style>

<script>
import { mapGetters } from "vuex";

export default {
  props: ["bounty"],
  computed: {
    ...mapGetters("github", { githubUser: "user" }),
    issueUrl() {
      return (
        "https://github.com/" +
        this.bounty.issueOwner +
        "/" +
        this.bounty.issueRepo +
        "/issues/" +
        this.bounty.issueNum
      );
    }
  },
  mounted() {
    $('[data-toggle="popover"]').popover();
  }
};
</script>
