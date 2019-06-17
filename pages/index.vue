<template>
  <div class="container d-flex pt-5">
    <div v-if="connected" class="flex-fill">
      <h1 class="text-center">
        Hi <a href="https://github.com/mktcode">@mktcode</a>!
      </h1>
      <h3 class="text-center">Wallet: 451.68 STEEM ($309)</h3>
      <div class="card">
        <div class="card-header d-flex align-items-center">
          <h5 class="m-0">Pull Requests</h5>
          <ul class="nav nav-pills card-header-pills ml-auto">
            <li class="nav-item">
              <a class="nav-link active" href="#">all</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#">merged</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#">open</a>
            </li>
          </ul>
        </div>
        <div class="list-group list-group-flush">
          <div class="list-group-item d-flex align-items-center">
            <font-awesome-icon icon="code-branch" class="merged" fixed-width />
            <div>Cras justo odio</div>
            <div class="ml-auto">
              <b>Score: 84 %</b> / 1.46 STEEM
              <a href="#" class="btn btn-sm btn-primary">Claim</a>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="flex-fill text-center">
      <h1>Commit Tokens</h1>
      <a class="btn btn-primary" href="#">Connect with GitHub</a>
      <a class="btn btn-primary" href="#">Connect with Steem</a>
      <p>Connect your Accounts to claim your rewards.</p>
    </div>
  </div>
</template>

<style lang="sass">
.merged
  color: #6f42c1
</style>

<script>
export default {
  data() {
    return {
      connected: true
    };
  }
};
</script>
