<template>
  <div>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <a class="navbar-brand font-weight-bold" href="/">
        <img src="/logo.png" alt="logo.png" />
      </a>
      <button
        class="navbar-toggler"
        type="button"
        data-toggle="collapse"
        data-target="#navbarSupportedContent"
        aria-controls="navbarSupportedContent"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav mr-auto">
          <li class="nav-item active">
            <a class="nav-link" href="#">Pull Requests</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#">Projects</a>
          </li>
        </ul>
      </div>
    </nav>
    <header class="p-5 bg-secondary text-light">
      <h1 class="d-flex align-items-center font-weight-bold">
        <img src="/logo.png" alt="logo.png" class="mr-3" />
        Merge Rewards
      </h1>
      <h2 class="mb-5">Rewarding Social Development</h2>
      <p class="lead">
        Contribute to Open Source projects<br />
        and earn money with your pull requests on GitHub!
      </p>
      <a href="#" class="btn btn-success btn-lg">
        <font-awesome-icon :icon="['fab', 'github']" />
        Connect
      </a>
    </header>
    <div class="container py-5">
      <div class="row">
        <div class="col-md-6 mb-3">
          <h2 class="mb-4">Contribute!</h2>
          <p>
            Contribute to other people's Open Source projects on GitHub. Your
            contributions can be anything, from developing new features to
            fixing typos in a project's documentation.<br />
            <br />
            As long as there's a pull request that the project owner decided to
            merge into his/her project, you'll be able to claim your rewards by
            just clicking a button.
          </p>
          <a
            href="https://help.github.com/en/articles/about-pull-requests"
            target="_blank"
          >
            About Pull Requests
          </a>
        </div>
        <div class="col-md-6">
          <img src="/pull-requests.png" alt="pull-requests.png" class="w-100" />
        </div>
      </div>
      <div class="row mt-5">
        <div class="col-md-6 order-md-2 mb-3">
          <h2 class="mb-4">Raise your score!</h2>
          <p>
            Your pull requests are scored by a
            <b>transparent algorithm</b> which is constantly improved by the
            community, to prevent abuse and to distribute rewards in a most fair
            way.<br />
            <br />
            On top of that, every member of the community can affect your reward
            by simply voting for it. The weight of these votes is based on how
            much a person already contributed to other projects.
          </p>
          <a
            href="https://help.github.com/en/articles/about-pull-requests"
            target="_blank"
          >
            About Scores
          </a>
        </div>
        <div class="col-md-6 order-md-1">
          <img src="/scores.png" alt="scores.png" class="w-100" />
        </div>
      </div>
      <div class="row mt-5">
        <div class="col-12">
          <h2 class="mb-4">And claim your rewards!</h2>
          <p>
            You can withdraw your rewards in Bitcoin, Ethereum and other
            Cryptocurrencies at any time. We also offer an exchange service to
            <b>Euro or Dollar</b> for withdrawals greater than 100 $/€ (for
            free).
          </p>
          <a
            href="https://help.github.com/en/articles/about-pull-requests"
            target="_blank"
          >
            About Rewards
          </a>
        </div>
      </div>
    </div>
    <div class="container-fluid steem text-light py-5">
      <div class="container d-flex flex-column flex-md-row align-items-center">
        <div class="d-flex flex-column mr-0 mr-md-5">
          <img src="/steem.png" alt="steem.png" class="float-left mb-4" />
          <div class="text-nowrap mb-4">
            <a href="#" target="_blank" class="btn btn-outline-light">
              Connect
            </a>
            <a
              href="https://signup.steemit.com"
              target="_blank"
              class="btn btn-outline-light"
            >
              Sign Up
            </a>
            <a href="#" target="_blank" class="btn btn-outline-light">
              About STEEM
            </a>
          </div>
        </div>
        <div>
          <p>
            Your rewards will be generated in STEEM and then converted to your
            favorite currency. STEEM is a decentralized content network as well
            as a digital currency to reward creators of good content. The
            intrinsic value of STEEM lies in its possibility to be used as
            influence on how rewards are distributed.<br />
            <br />
            Merge Rewards considers your merged pull requests as good "content"
            and uses its influence to distribute STEEM tokens to you, which you
            can then use to buy goods and services from other STEEM users,
            exchange it for "real money", like USD or Euro or to gain more
            influence in the voting process yourself.
          </p>
        </div>
      </div>
    </div>
    <footer class="p-5 bg-dark text-center">
      <a
        href="https://github.com/mktcode/merge-rewards"
        target="_blank"
        class="text-light"
      >
        <font-awesome-icon :icon="['fab', 'github']" />
      </a>
    </footer>
  </div>
</template>

<style lang="sass">
body
  font-family: 'Montserrat', sans-serif
.navbar-brand
  img
    width: 27px
header
  background-image: url("/header.png")
  background-size: cover
  background-position: center center
  h1
    font-size: 4rem
    img
      width: 60px
      height: 60px
.bg-dark
  background-color: #333 !important
.bg-secondary
  background-color: #444 !important
.steem
  background: #1c06b4
  background: -moz-linear-gradient(left,  #1c06b4 0%, #0293ff 100%)
  background: -webkit-linear-gradient(left,  #1c06b4 0%,#0293ff 100%)
  background: linear-gradient(to right,  #1c06b4 0%,#0293ff 100%)
  filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#1c06b4', endColorstr='#0293ff',GradientType=1 )
footer
  font-size: 2rem

@media screen and (max-width: 768px)
  header
    h1
      font-size: 2.5rem
    h2
      font-size: 1.7rem
      text-align: center
</style>
